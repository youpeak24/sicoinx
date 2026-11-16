import { prisma } from './prisma';
import { Request } from 'express';

export interface AuditParams {
  actorId?: string | null;
  actorEmail?: string | null;
  actorRole?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  details?: Record<string, any> | string;
  req?: Request;
}

export async function logAuditEvent({
  actorId,
  actorEmail,
  actorRole,
  action,
  entityType,
  entityId,
  details,
  req,
}: AuditParams) {
  try {
    const ipAddress = req
      ? (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() || req.socket.remoteAddress || null
      : null;
    const userAgent = req ? req.headers['user-agent'] || null : null;

    const detailsStr = typeof details === 'object' ? JSON.stringify(details) : details || null;

    return await prisma.auditEvent.create({
      data: {
        actorId: actorId || null,
        actorEmail: actorEmail || null,
        actorRole: actorRole || null,
        action,
        entityType,
        entityId: entityId || null,
        details: detailsStr,
        ipAddress,
        userAgent,
      },
    });
  } catch (error) {
    console.error('Failed to write audit log event:', error);
  }
}
