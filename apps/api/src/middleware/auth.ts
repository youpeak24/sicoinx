import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { verifyJwtToken, hashPassword, generateRandomToken } from '../lib/security';
import { looksLikeFirebaseToken, verifyFirebaseIdToken } from '../lib/firebaseAuth';
import { Role, ROLE_PERMISSIONS } from '@sicoin/shared';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  isEmailVerified: boolean;
  mfaEnabled: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      sessionToken?: string;
    }
  }
}


const denied = (res: Response, status: number, code: string, message: string) =>
  res.status(status).json({ success: false, error: { code, message } });

/**
 * Resolves the API user for a verified Firebase ID token (the web app signs in with Firebase).
 * Accounts are linked by Firebase UID. An existing API account (matched by email) is linked only when Firebase
 * reports that email as verified, so nobody can claim someone else's account by registering their address.
 */
async function authenticateFirebase(token: string, req: Request, res: Response, next: NextFunction) {
  const claims = await verifyFirebaseIdToken(token);
  if (!claims) return denied(res, 401, 'INVALID_TOKEN', 'Your sign-in could not be verified. Please log in again.');

  let user = await prisma.user.findUnique({ where: { firebaseUid: claims.uid } });

  if (!user) {
    if (!claims.email) return denied(res, 401, 'INVALID_TOKEN', 'Your account has no email address.');

    const byEmail = await prisma.user.findUnique({ where: { email: claims.email } });
    if (byEmail) {
      if (byEmail.firebaseUid && byEmail.firebaseUid !== claims.uid) {
        return denied(res, 403, 'ACCOUNT_CONFLICT', 'This email belongs to a different account.');
      }
      if (!claims.emailVerified) {
        return denied(res, 403, 'EMAIL_NOT_VERIFIED', 'Please verify your email address to access this account.');
      }
      user = await prisma.user.update({
        where: { id: byEmail.id },
        data: { firebaseUid: claims.uid, isEmailVerified: true },
      });
    } else {
      user = await prisma.user.create({
        data: {
          email: claims.email,
          name: claims.name || claims.email.split('@')[0],
          firebaseUid: claims.uid,
          passwordHash: await hashPassword(generateRandomToken(32)), // unusable: sign-in happens in Firebase
          role: 'USER',
          isEmailVerified: claims.emailVerified,
        },
      });
    }
  } else if (claims.emailVerified && !user.isEmailVerified) {
    user = await prisma.user.update({ where: { id: user.id }, data: { isEmailVerified: true } });
  }

  if (user.isBanned) {
    return denied(res, 403, 'ACCOUNT_SUSPENDED', 'This account has been suspended by system administration.');
  }

  req.user = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as Role,
    isEmailVerified: user.isEmailVerified,
    mfaEnabled: user.mfaEnabled,
  };
  return next();
}

export async function authenticateToken(req: Request, res: Response, next: NextFunction) {
  try {
    let token = req.cookies?.sicoin_session;

    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.substring(7);
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHENTICATED',
          message: 'Authentication session required',
        },
      });
    }

    // Firebase ID token (web app) vs. this API's own session token
    if (looksLikeFirebaseToken(token)) {
      return await authenticateFirebase(token, req, res, next);
    }

    // Check if session exists in DB and is not revoked
    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!session || session.isRevoked || session.expiresAt < new Date()) {
      res.clearCookie('sicoin_session');
      return res.status(401).json({
        success: false,
        error: {
          code: 'SESSION_EXPIRED',
          message: 'Your session has expired. Please log in again.',
        },
      });
    }

    if (session.user.isBanned) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCOUNT_SUSPENDED',
          message: 'This account has been suspended by system administration.',
        },
      });
    }

    req.user = {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: session.user.role as Role,
      isEmailVerified: session.user.isEmailVerified,
      mfaEnabled: session.user.mfaEnabled,
    };
    req.sessionToken = token;

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'AUTH_INTERNAL_ERROR',
        message: 'Failed to verify session token',
      },
    });
  }
}

/**
 * Role-Based Access Control Guard.
 * Strict server-side verification of caller's role.
 */
export function requireRole(allowedRoles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHENTICATED', message: 'Authentication required' },
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          message: `Access denied. Requires one of roles: [${allowedRoles.join(', ')}], current role is ${req.user.role}`,
        },
      });
    }

    next();
  };
}

/**
 * Granular Permission Guard.
 */
export function requirePermission(permission: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHENTICATED', message: 'Authentication required' },
      });
    }

    const userRole = req.user.role;
    const permissions = (ROLE_PERMISSIONS as any)[userRole] || [];

    if (!permissions.includes(permission)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN_ACTION',
          message: `Action requires permission '${permission}' which is not granted to role '${userRole}'`,
        },
      });
    }

    next();
  };
}
