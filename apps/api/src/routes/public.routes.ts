import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { newsletterSchema, contactFormSchema } from '@sicoin/shared';
import { sendEmail } from '../lib/mailer';

export const publicRouter = Router();

/**
 * POST /api/v1/public/newsletter
 */
publicRouter.post('/newsletter', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = newsletterSchema.parse(req.body);

    await prisma.newsletterSubscriber.upsert({
      where: { email: email.toLowerCase() },
      update: { isActive: true },
      create: { email: email.toLowerCase() },
    });

    return res.json({
      success: true,
      message: 'Thank you for subscribing to SI Coin official updates.',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/public/contact
 */
publicRouter.post('/contact', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, subject, message } = contactFormSchema.parse(req.body);

    const coin = await prisma.coinConfiguration.findFirst({ where: { id: 'default-coin' } });
    const targetEmail = coin?.officialEmail || 'info@sicoin.org';

    await sendEmail({
      to: targetEmail,
      subject: `[Public Contact Inquiry] ${subject}`,
      html: `<p><strong>From:</strong> ${name} &lt;${email}&gt;</p><p><strong>Subject:</strong> ${subject}</p><p><strong>Message:</strong></p><p>${message}</p>`,
      text: `From: ${name} <${email}>\nSubject: ${subject}\n\n${message}`,
    });

    return res.json({
      success: true,
      message: 'Your inquiry has been received. Our team will review and respond shortly.',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/health
 */
publicRouter.get('/health', async (req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return res.json({
      status: 'healthy',
      uptimeSeconds: process.uptime(),
      timestamp: new Date().toISOString(),
      database: 'connected',
    });
  } catch (err: any) {
    return res.status(503).json({
      status: 'unhealthy',
      error: err.message,
    });
  }
});
