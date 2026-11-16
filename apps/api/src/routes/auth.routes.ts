import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import {
  hashPassword,
  verifyPassword,
  generateRandomToken,
  generateTotpSecret,
  generateQrCodeDataUrl,
  verifyTotpToken,
} from '../lib/security';
import { sendEmail, getDevOutbox } from '../lib/mailer';
import { logAuditEvent } from '../lib/audit';
import { authenticateToken } from '../middleware/auth';
import { authRateLimiter } from '../middleware/rateLimiter';
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from '@sicoin/shared';

export const authRouter = Router();

// Apply auth rate limiter
authRouter.use(authRateLimiter);

/**
 * POST /api/v1/auth/register
 */
authRouter.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = registerSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email.toLowerCase() },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'EMAIL_ALREADY_EXISTS',
          message: 'An account with this email address already exists.',
        },
      });
    }

    const passwordHash = await hashPassword(validated.password);

    const user = await prisma.user.create({
      data: {
        email: validated.email.toLowerCase(),
        passwordHash,
        name: validated.name,
        role: 'USER',
        isEmailVerified: false,
      },
    });

    // Create verification token (expires in 24 hours)
    const verificationToken = generateRandomToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.verificationToken.create({
      data: {
        userId: user.id,
        token: verificationToken,
        type: 'EMAIL_VERIFICATION',
        expiresAt,
      },
    });

    const verifyUrl = `${req.headers.origin || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;

    await sendEmail({
      to: user.email,
      subject: 'Verify your SI Coin Account',
      html: `<p>Welcome to SI Coin, ${user.name}!</p><p>Please verify your email address by clicking the link below:</p><p><a href="${verifyUrl}">${verifyUrl}</a></p>`,
      text: `Welcome to SI Coin, ${user.name}! Please verify your email by visiting: ${verifyUrl}`,
      linkPreview: verifyUrl,
    });

    await logAuditEvent({
      actorId: user.id,
      actorEmail: user.email,
      actorRole: user.role,
      action: 'USER_REGISTERED',
      entityType: 'User',
      entityId: user.id,
      req,
    });

    // Auto-login session creation
    const sessionToken = generateRandomToken(48);
    const sessionExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.session.create({
      data: {
        userId: user.id,
        token: sessionToken,
        expiresAt: sessionExpiry,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] || null,
      },
    });

    res.cookie('sicoin_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: sessionExpiry,
    });

    return res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          mfaEnabled: user.mfaEnabled,
        },
        token: sessionToken,
        verificationTokenNotice: 'A verification link has been sent to your email. (Check dev outbox in local mode)',
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/auth/login
 */
authRouter.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = loginSchema.parse(req.body);
    const email = validated.email.toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password combination.',
        },
      });
    }

    if (user.isBanned) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCOUNT_SUSPENDED',
          message: 'This account has been suspended by system administrators.',
        },
      });
    }

    const isMatch = await verifyPassword(validated.password, user.passwordHash);
    if (!isMatch) {
      await logAuditEvent({
        actorEmail: email,
        action: 'FAILED_LOGIN_ATTEMPT',
        entityType: 'User',
        entityId: user.id,
        req,
      });

      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password combination.',
        },
      });
    }

    // Check MFA if enabled
    if (user.mfaEnabled) {
      if (!validated.mfaCode) {
        return res.status(200).json({
          success: true,
          requireMfa: true,
          message: 'Two-factor authentication code required.',
        });
      }

      if (!user.mfaSecret || !verifyTotpToken(user.mfaSecret, validated.mfaCode)) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_MFA_CODE',
            message: 'Invalid 2FA verification code.',
          },
        });
      }
    }

    const sessionToken = generateRandomToken(48);
    const sessionExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.session.create({
      data: {
        userId: user.id,
        token: sessionToken,
        expiresAt: sessionExpiry,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] || null,
      },
    });

    res.cookie('sicoin_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: sessionExpiry,
    });

    await logAuditEvent({
      actorId: user.id,
      actorEmail: user.email,
      actorRole: user.role,
      action: 'USER_LOGGED_IN',
      entityType: 'User',
      entityId: user.id,
      req,
    });

    return res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          mfaEnabled: user.mfaEnabled,
        },
        token: sessionToken,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/auth/logout
 */
authRouter.post('/logout', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.sicoin_session || req.headers.authorization?.substring(7);

    if (token) {
      await prisma.session.updateMany({
        where: { token },
        data: { isRevoked: true },
      });
    }

    res.clearCookie('sicoin_session');

    return res.json({
      success: true,
      message: 'Logged out successfully.',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/auth/me
 */
authRouter.get('/me', authenticateToken, async (req: Request, res: Response) => {
  return res.json({
    success: true,
    data: {
      user: req.user,
    },
  });
});

/**
 * POST /api/v1/auth/verify-email
 */
authRouter.post('/verify-email', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_TOKEN', message: 'Verification token is required.' },
      });
    }

    const verification = await prisma.verificationToken.findFirst({
      where: {
        token,
        type: 'EMAIL_VERIFICATION',
        isUsed: false,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });

    if (!verification) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_OR_EXPIRED_TOKEN',
          message: 'The email verification token is invalid or has expired.',
        },
      });
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: verification.userId },
        data: { isEmailVerified: true },
      }),
      prisma.verificationToken.update({
        where: { id: verification.id },
        data: { isUsed: true },
      }),
    ]);

    await logAuditEvent({
      actorId: verification.userId,
      actorEmail: verification.user.email,
      actorRole: verification.user.role,
      action: 'EMAIL_VERIFIED',
      entityType: 'User',
      entityId: verification.userId,
      req,
    });

    return res.json({
      success: true,
      message: 'Email verified successfully!',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/auth/forgot-password
 */
authRouter.post('/forgot-password', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = forgotPasswordSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Always respond with success to prevent user enumeration
    if (!user) {
      return res.json({
        success: true,
        message: 'If an account exists with this email, a reset link has been dispatched.',
      });
    }

    const resetToken = generateRandomToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.verificationToken.create({
      data: {
        userId: user.id,
        token: resetToken,
        type: 'PASSWORD_RESET',
        expiresAt,
      },
    });

    const resetUrl = `${req.headers.origin || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    await sendEmail({
      to: user.email,
      subject: 'Reset your SI Coin password',
      html: `<p>Hello ${user.name},</p><p>We received a request to reset your password. Click the link below to set a new password:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>This link expires in 1 hour.</p>`,
      text: `Hello ${user.name}, please reset your password at: ${resetUrl}`,
      linkPreview: resetUrl,
    });

    return res.json({
      success: true,
      message: 'If an account exists with this email, a reset link has been dispatched.',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/auth/reset-password
 */
authRouter.post('/reset-password', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, password } = resetPasswordSchema.parse(req.body);

    const resetRecord = await prisma.verificationToken.findFirst({
      where: {
        token,
        type: 'PASSWORD_RESET',
        isUsed: false,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });

    if (!resetRecord) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_OR_EXPIRED_TOKEN',
          message: 'The password reset token is invalid or has expired.',
        },
      });
    }

    const newHash = await hashPassword(password);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetRecord.userId },
        data: { passwordHash: newHash },
      }),
      prisma.verificationToken.update({
        where: { id: resetRecord.id },
        data: { isUsed: true },
      }),
      // Revoke all existing sessions for security
      prisma.session.updateMany({
        where: { userId: resetRecord.userId },
        data: { isRevoked: true },
      }),
    ]);

    await logAuditEvent({
      actorId: resetRecord.userId,
      actorEmail: resetRecord.user.email,
      actorRole: resetRecord.user.role,
      action: 'PASSWORD_RESET_COMPLETED',
      entityType: 'User',
      entityId: resetRecord.userId,
      req,
    });

    return res.json({
      success: true,
      message: 'Your password has been successfully reset. Please log in with your new password.',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/auth/mfa/setup
 */
authRouter.post('/mfa/setup', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
    });

    if (!user) {
      return res.status(404).json({ success: false, error: { message: 'User not found' } });
    }

    const { base32, otpauth_url } = generateTotpSecret(user.email);
    const qrCodeDataUrl = otpauth_url ? await generateQrCodeDataUrl(otpauth_url) : '';

    // Temporarily save secret until verified
    await prisma.user.update({
      where: { id: user.id },
      data: { mfaSecret: base32 },
    });

    return res.json({
      success: true,
      data: {
        secret: base32,
        qrCodeUrl: qrCodeDataUrl,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/auth/mfa/verify
 */
authRouter.post('/mfa/verify', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, error: { message: '2FA code is required' } });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
    });

    if (!user || !user.mfaSecret) {
      return res.status(400).json({ success: false, error: { message: 'MFA setup has not been initiated' } });
    }

    const isValid = verifyTotpToken(user.mfaSecret, code);
    if (!isValid) {
      return res.status(400).json({ success: false, error: { message: 'Invalid 2FA code' } });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { mfaEnabled: true },
    });

    await logAuditEvent({
      actorId: user.id,
      actorEmail: user.email,
      actorRole: user.role,
      action: 'MFA_ENABLED',
      entityType: 'User',
      entityId: user.id,
      req,
    });

    return res.json({
      success: true,
      message: 'Two-factor authentication enabled successfully.',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/auth/dev-mailboxes
 * Local development endpoint to inspect sent emails (verification & password reset links)
 */
authRouter.get('/dev-mailboxes', (req: Request, res: Response) => {
  return res.json({
    success: true,
    data: {
      emails: getDevOutbox(),
    },
  });
});
