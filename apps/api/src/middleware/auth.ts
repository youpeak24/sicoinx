import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { verifyJwtToken } from '../lib/security';
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
