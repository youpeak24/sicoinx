import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { authenticateToken } from '../middleware/auth';
import { logAuditEvent } from '../lib/audit';
import { submitKycSchema } from '@sicoin/shared';

export const kycRouter = Router();

kycRouter.use(authenticateToken);

/**
 * GET /api/v1/kyc/status
 * Returns current user's KYC verification status
 */
kycRouter.get('/status', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const kyc = await prisma.kycVerification.findUnique({
      where: { userId },
    });

    return res.json({
      success: true,
      data: kyc || {
        status: 'NOT_SUBMITTED',
        message: 'No KYC documents submitted yet.',
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/kyc/submit
 * Submits user identity documents for verification
 */
kycRouter.post('/submit', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { fullName, idType, idNumber, documentFrontUrl, documentBackUrl, selfieUrl } =
      submitKycSchema.parse(req.body);

    const existingKyc = await prisma.kycVerification.findUnique({
      where: { userId },
    });

    if (existingKyc && existingKyc.status === 'APPROVED') {
      return res.status(400).json({
        success: false,
        error: { message: 'Your identity verification is already approved.' },
      });
    }

    const kyc = await prisma.kycVerification.upsert({
      where: { userId },
      update: {
        fullName,
        idType,
        idNumber,
        documentFrontUrl,
        documentBackUrl: documentBackUrl || null,
        selfieUrl: selfieUrl || null,
        status: 'PENDING',
        rejectionReason: null,
        submittedAt: new Date(),
      },
      create: {
        userId,
        fullName,
        idType,
        idNumber,
        documentFrontUrl,
        documentBackUrl: documentBackUrl || null,
        selfieUrl: selfieUrl || null,
        status: 'PENDING',
      },
    });

    await prisma.notification.create({
      data: {
        userId,
        title: 'KYC Submitted',
        message: 'Your identity verification documents have been received and are in the review queue.',
        type: 'INFO',
        linkUrl: '/dashboard/kyc',
      },
    });

    await logAuditEvent({
      actorId: userId,
      actorEmail: req.user!.email,
      actorRole: req.user!.role,
      action: 'SUBMIT_KYC',
      entityType: 'KycVerification',
      entityId: kyc.id,
      details: { idType, idNumberMasked: `****${idNumber.slice(-4)}` },
      req,
    });

    return res.json({
      success: true,
      message: 'KYC documents submitted successfully. Verification takes 1-24 hours.',
      data: kyc,
    });
  } catch (error) {
    next(error);
  }
});
