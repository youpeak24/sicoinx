import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { authenticateToken, requireRole, requirePermission } from '../middleware/auth';
import { logAuditEvent } from '../lib/audit';
import { PricingService } from '../lib/pricingService';
import { WalletService } from '../lib/walletService';
import { RazorpayService } from '../lib/razorpay';
import Decimal from 'decimal.js';
import crypto from 'crypto';
import { parse as parseCsv } from 'csv-parse/sync';
import { stringify as stringifyCsv } from 'csv-stringify/sync';
import {
  coinConfigSchema,
  manualPriceUpdateSchema,
  priceSourceConfigSchema,
  priceRecordCorrectionSchema,
  tokenomicsBatchSchema,
  announcementSchema,
  faqItemSchema,
  roadmapMilestoneSchema,
  ecosystemModuleSchema,
  updateTicketStatusSchema,
  replyTicketSchema,
  reviewKycSchema,
  adminSettleSellOrderSchema,
  adminAdjustWalletSchema,
  adminFreezeWalletSchema,
  adminRefundPaymentSchema,
  updateCoinRatesSchema,
  Role,
} from '@sicoin/shared';

export const adminRouter = Router();

// Protect all admin routes: must be authenticated and have an administrative role
adminRouter.use(
  authenticateToken,
  requireRole(['SUPER_ADMIN', 'FINANCE_MANAGER', 'CONTENT_EDITOR', 'SUPPORT_AGENT', 'READONLY_ANALYST'])
);

/**
 * GET /api/v1/admin/overview
 * Real application statistics.
 */
adminRouter.get('/overview', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [
      totalUsers,
      verifiedUsers,
      openTickets,
      publishedAnnouncements,
      totalPriceObservations,
      priceConfig,
      coinConfig,
      recentAuditLogs,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isEmailVerified: true } }),
      prisma.supportTicket.count({ where: { status: { in: ['OPEN', 'IN_PROGRESS'] } } }),
      prisma.announcement.count({ where: { status: 'PUBLISHED' } }),
      prisma.priceObservation.count(),
      prisma.priceSourceConfiguration.findFirst({ where: { id: 'default-price-config' } }),
      prisma.coinConfiguration.findFirst({ where: { id: 'default-coin' } }),
      prisma.auditEvent.findMany({
        orderBy: { createdAt: 'desc' },
        take: 8,
      }),
    ]);

    const currentPrice = await PricingService.getCurrentPriceSummary();

    return res.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          verifiedUsers,
          openTickets,
          publishedAnnouncements,
          totalPriceObservations,
        },
        pricing: {
          currentPriceUsd: currentPrice.priceUsd,
          activeSource: priceConfig?.activeSource || 'MANUAL',
          sourceLabel: currentPrice.sourceLabel,
          effectiveTimestamp: currentPrice.effectiveTimestamp,
          isStale: currentPrice.isStale,
        },
        coin: {
          tokenName: coinConfig?.tokenName || 'SI Coin',
          ticker: coinConfig?.ticker || 'SI',
          network: coinConfig?.blockchainNetwork,
          totalSupply: coinConfig?.totalSupply,
          circulatingSupply: coinConfig?.circulatingSupply,
        },
        recentAuditLogs,
      },
    });
  } catch (error) {
    next(error);
  }
});

// ==============================================================
// COIN CONFIGURATION
// ==============================================================

/**
 * GET /api/v1/admin/coin
 */
adminRouter.get('/coin', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const config = await prisma.coinConfiguration.findFirst({
      where: { id: 'default-coin' },
    });
    return res.json({ success: true, data: config });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/v1/admin/coin
 */
adminRouter.put(
  '/coin',
  requirePermission('manage_coin_config'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = coinConfigSchema.parse(req.body);

      const before = await prisma.coinConfiguration.findFirst({ where: { id: 'default-coin' } });

      const updated = await prisma.coinConfiguration.upsert({
        where: { id: 'default-coin' },
        update: validated,
        create: { id: 'default-coin', ...validated },
      });

      await logAuditEvent({
        actorId: req.user!.id,
        actorEmail: req.user!.email,
        actorRole: req.user!.role,
        action: 'UPDATE_COIN_CONFIG',
        entityType: 'CoinConfiguration',
        entityId: updated.id,
        details: { before, after: updated },
        req,
      });

      return res.json({
        success: true,
        message: 'Coin configuration updated successfully. Note: Web metadata changes do not alter smart contract state.',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }
);

// ==============================================================
// PRICING MANAGEMENT & HISTORICAL RECORDS
// ==============================================================

/**
 * GET /api/v1/admin/pricing/config
 */
adminRouter.get('/pricing/config', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const config = await prisma.priceSourceConfiguration.findFirst({
      where: { id: 'default-price-config' },
    });
    const scheduled = await prisma.scheduledPriceChange.findMany({
      where: { isExecuted: false, isCancelled: false },
      orderBy: { scheduledTime: 'asc' },
    });

    return res.json({
      success: true,
      data: {
        config,
        scheduledChanges: scheduled,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/v1/admin/pricing/config
 */
adminRouter.put(
  '/pricing/config',
  requirePermission('manage_pricing'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = priceSourceConfigSchema.parse(req.body);

      const updated = await prisma.priceSourceConfiguration.upsert({
        where: { id: 'default-price-config' },
        update: validated,
        create: { id: 'default-price-config', ...validated },
      });

      await logAuditEvent({
        actorId: req.user!.id,
        actorEmail: req.user!.email,
        actorRole: req.user!.role,
        action: 'UPDATE_PRICE_SOURCE_CONFIG',
        entityType: 'PriceSourceConfiguration',
        entityId: updated.id,
        details: validated,
        req,
      });

      return res.json({
        success: true,
        message: `Active price feed updated to ${validated.activeSource}.`,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/v1/admin/pricing/manual
 * Immediately updates or schedules an administrator-set reference price.
 */
adminRouter.post(
  '/pricing/manual',
  requirePermission('manage_pricing'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { priceUsd, reason, isScheduled, scheduledTime } = manualPriceUpdateSchema.parse(req.body);

      if (isScheduled && scheduledTime) {
        const scheduledDate = new Date(scheduledTime);
        if (scheduledDate <= new Date()) {
          return res.status(400).json({
            success: false,
            error: { code: 'INVALID_SCHEDULE_TIME', message: 'Scheduled time must be in the future.' },
          });
        }

        const scheduledRecord = await prisma.scheduledPriceChange.create({
          data: {
            scheduledPriceUsd: priceUsd,
            scheduledTime: scheduledDate,
            reason,
            createdById: req.user!.id,
            createdByEmail: req.user!.email,
          },
        });

        await logAuditEvent({
          actorId: req.user!.id,
          actorEmail: req.user!.email,
          actorRole: req.user!.role,
          action: 'SCHEDULE_PRICE_UPDATE',
          entityType: 'ScheduledPriceChange',
          entityId: scheduledRecord.id,
          details: { priceUsd, scheduledTime, reason },
          req,
        });

        return res.status(201).json({
          success: true,
          message: `Price update to $${priceUsd} scheduled for ${scheduledDate.toISOString()}.`,
          data: scheduledRecord,
        });
      }

      // Immediate publication
      const observation = await prisma.priceObservation.create({
        data: {
          priceUsd,
          quoteCurrency: 'USD',
          source: 'MANUAL',
          sourceLabel: 'Administrator-set reference price',
          effectiveTimestamp: new Date(),
          actorEmail: req.user!.email,
          changeReason: reason,
          isCorrection: false,
          isDemoData: false,
        },
      });

      await logAuditEvent({
        actorId: req.user!.id,
        actorEmail: req.user!.email,
        actorRole: req.user!.role,
        action: 'PUBLISH_MANUAL_PRICE',
        entityType: 'PriceObservation',
        entityId: observation.id,
        details: { priceUsd, reason },
        req,
      });

      return res.status(201).json({
        success: true,
        message: `Reference price published at $${priceUsd} USD with source label "Administrator-set reference price".`,
        data: observation,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/v1/admin/pricing/scheduled/:id
 */
adminRouter.delete(
  '/pricing/scheduled/:id',
  requirePermission('manage_pricing'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const record = await prisma.scheduledPriceChange.findUnique({ where: { id } });

      if (!record || record.isExecuted) {
        return res.status(404).json({ success: false, error: { message: 'Pending scheduled change not found' } });
      }

      await prisma.scheduledPriceChange.update({
        where: { id },
        data: { isCancelled: true },
      });

      await logAuditEvent({
        actorId: req.user!.id,
        actorEmail: req.user!.email,
        actorRole: req.user!.role,
        action: 'CANCEL_SCHEDULED_PRICE',
        entityType: 'ScheduledPriceChange',
        entityId: id,
        req,
      });

      return res.json({ success: true, message: 'Scheduled price change cancelled.' });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/v1/admin/pricing/correct-record
 * Corrects a historical price observation with strict audit provenance.
 */
adminRouter.post(
  '/pricing/correct-record',
  requirePermission('manage_pricing'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { recordId, correctedPriceUsd, effectiveTimestamp, reason } = priceRecordCorrectionSchema.parse(req.body);

      const original = await prisma.priceObservation.findUnique({
        where: { id: recordId },
      });

      if (!original) {
        return res.status(404).json({ success: false, error: { message: 'Original record not found' } });
      }

      // Create new corrective observation retaining link to original
      const corrected = await prisma.priceObservation.create({
        data: {
          priceUsd: correctedPriceUsd,
          quoteCurrency: 'USD',
          source: original.source,
          sourceLabel: `${original.sourceLabel} (Audited Correction)`,
          effectiveTimestamp: new Date(effectiveTimestamp),
          actorEmail: req.user!.email,
          changeReason: `Corrective adjustment to #${original.id}: ${reason}`,
          isCorrection: true,
          supersededRecordId: original.id,
          isDemoData: original.isDemoData,
        },
      });

      await logAuditEvent({
        actorId: req.user!.id,
        actorEmail: req.user!.email,
        actorRole: req.user!.role,
        action: 'CORRECT_HISTORICAL_PRICE',
        entityType: 'PriceObservation',
        entityId: corrected.id,
        details: {
          originalRecordId: original.id,
          originalPrice: original.priceUsd,
          correctedPrice: correctedPriceUsd,
          reason,
        },
        req,
      });

      return res.json({
        success: true,
        message: 'Historical record corrected with preserved audit trail.',
        data: corrected,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/v1/admin/pricing/export-csv
 * Exports price history to CSV.
 */
adminRouter.get('/pricing/export-csv', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const records = await prisma.priceObservation.findMany({
      orderBy: { effectiveTimestamp: 'asc' },
    });

    const rows = records.map((r: any) => ({
      id: r.id,
      priceUsd: r.priceUsd,
      quoteCurrency: r.quoteCurrency,
      source: r.source,
      sourceLabel: r.sourceLabel,
      effectiveTimestamp: r.effectiveTimestamp.toISOString(),
      recordedTimestamp: r.recordedTimestamp.toISOString(),
      actorEmail: r.actorEmail || '',
      changeReason: r.changeReason || '',
      isCorrection: r.isCorrection ? 'true' : 'false',
      supersededRecordId: r.supersededRecordId || '',
    }));

    const csvData = stringifyCsv(rows, { header: true });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="sicoin_price_history_${Date.now()}.csv"`);
    return res.send(csvData);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/admin/pricing/import-csv
 * Validates, previews, and imports historical price records from CSV text.
 */
adminRouter.post(
  '/pricing/import-csv',
  requirePermission('manage_pricing'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { csvContent, dryRun = true } = req.body;
      if (!csvContent || typeof csvContent !== 'string') {
        return res.status(400).json({ success: false, error: { message: 'csvContent string is required.' } });
      }

      const parsed: any[] = parseCsv(csvContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });

      const validRows: any[] = [];
      const errors: string[] = [];

      for (let i = 0; i < parsed.length; i++) {
        const row = parsed[i];
        const lineNum = i + 2;

        if (!row.priceUsd || isNaN(parseFloat(row.priceUsd)) || parseFloat(row.priceUsd) <= 0) {
          errors.push(`Row ${lineNum}: Invalid priceUsd "${row.priceUsd}"`);
          continue;
        }

        const effectiveDate = new Date(row.effectiveTimestamp);
        if (isNaN(effectiveDate.getTime())) {
          errors.push(`Row ${lineNum}: Invalid effectiveTimestamp "${row.effectiveTimestamp}"`);
          continue;
        }

        validRows.push({
          priceUsd: parseFloat(row.priceUsd).toFixed(6),
          quoteCurrency: row.quoteCurrency || 'USD',
          source: row.source || 'MANUAL',
          sourceLabel: row.sourceLabel || 'Imported Reference Price',
          effectiveTimestamp: effectiveDate,
          actorEmail: req.user!.email,
          changeReason: row.changeReason || 'Batch CSV import',
          isCorrection: false,
          isDemoData: false,
        });
      }

      if (dryRun) {
        return res.json({
          success: true,
          dryRun: true,
          summary: {
            totalRowsInFile: parsed.length,
            validRowsCount: validRows.length,
            errorsCount: errors.length,
          },
          errors,
          samplePreview: validRows.slice(0, 5),
        });
      }

      // Execute import
      let insertedCount = 0;
      await prisma.$transaction(async (tx: any) => {
        for (const row of validRows) {
          await tx.priceObservation.create({ data: row });
          insertedCount++;
        }
      });

      await logAuditEvent({
        actorId: req.user!.id,
        actorEmail: req.user!.email,
        actorRole: req.user!.role,
        action: 'IMPORT_PRICING_CSV',
        entityType: 'PriceObservation',
        details: { insertedCount, errorsCount: errors.length },
        req,
      });

      return res.json({
        success: true,
        dryRun: false,
        message: `Successfully imported ${insertedCount} historical price observations.`,
        insertedCount,
        errors,
      });
    } catch (error) {
      next(error);
    }
  }
);

// ==============================================================
// TOKENOMICS MANAGEMENT (Strict 100% rule)
// ==============================================================

/**
 * PUT /api/v1/admin/tokenomics
 * Updates token allocations. Refuses publication if total != 100%.
 */
adminRouter.put(
  '/tokenomics',
  requirePermission('manage_tokenomics'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { allocations } = tokenomicsBatchSchema.parse(req.body);

      const before = await prisma.tokenAllocation.findMany();

      await prisma.$transaction(async (tx: any) => {
        await tx.tokenAllocation.deleteMany({});
        for (const item of allocations) {
          await tx.tokenAllocation.create({
            data: {
              category: item.category,
              percentage: item.percentage,
              tokenAmount: item.tokenAmount,
              vestingDescription: item.vestingDescription,
              unlockSchedule: item.unlockSchedule,
              colorHex: item.colorHex,
              displayOrder: item.displayOrder,
            },
          });
        }
      });

      await logAuditEvent({
        actorId: req.user!.id,
        actorEmail: req.user!.email,
        actorRole: req.user!.role,
        action: 'UPDATE_TOKENOMICS_ALLOCATIONS',
        entityType: 'TokenAllocation',
        details: { beforeCount: before.length, newCount: allocations.length },
        req,
      });

      return res.json({
        success: true,
        message: 'Tokenomics allocations updated and reconciled to 100%.',
      });
    } catch (error) {
      next(error);
    }
  }
);

// ==============================================================
// ANNOUNCEMENTS CMS
// ==============================================================

/**
 * GET /api/v1/admin/announcements
 */
adminRouter.get('/announcements', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const list = await prisma.announcement.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ success: true, data: list });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/admin/announcements
 */
adminRouter.post(
  '/announcements',
  requirePermission('manage_announcements'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = announcementSchema.parse(req.body);

      const created = await prisma.announcement.create({
        data: {
          title: validated.title,
          slug: validated.slug,
          summary: validated.summary,
          content: validated.content,
          category: validated.category,
          publishedAt: validated.publishedAt ? new Date(validated.publishedAt) : validated.status === 'PUBLISHED' ? new Date() : null,
          expiresAt: validated.expiresAt ? new Date(validated.expiresAt) : null,
          isPinned: validated.isPinned,
          isFeaturedBanner: validated.isFeaturedBanner,
          status: validated.status,
        },
      });

      await logAuditEvent({
        actorId: req.user!.id,
        actorEmail: req.user!.email,
        actorRole: req.user!.role,
        action: 'CREATE_ANNOUNCEMENT',
        entityType: 'Announcement',
        entityId: created.id,
        req,
      });

      return res.status(201).json({ success: true, data: created });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PUT /api/v1/admin/announcements/:id
 */
adminRouter.put(
  '/announcements/:id',
  requirePermission('manage_announcements'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const validated = announcementSchema.parse(req.body);

      const updated = await prisma.announcement.update({
        where: { id },
        data: {
          title: validated.title,
          slug: validated.slug,
          summary: validated.summary,
          content: validated.content,
          category: validated.category,
          publishedAt: validated.publishedAt ? new Date(validated.publishedAt) : undefined,
          expiresAt: validated.expiresAt ? new Date(validated.expiresAt) : null,
          isPinned: validated.isPinned,
          isFeaturedBanner: validated.isFeaturedBanner,
          status: validated.status,
        },
      });

      await logAuditEvent({
        actorId: req.user!.id,
        actorEmail: req.user!.email,
        actorRole: req.user!.role,
        action: 'UPDATE_ANNOUNCEMENT',
        entityType: 'Announcement',
        entityId: updated.id,
        req,
      });

      return res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/v1/admin/announcements/:id
 */
adminRouter.delete(
  '/announcements/:id',
  requirePermission('manage_announcements'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await prisma.announcement.delete({ where: { id } });

      await logAuditEvent({
        actorId: req.user!.id,
        actorEmail: req.user!.email,
        actorRole: req.user!.role,
        action: 'DELETE_ANNOUNCEMENT',
        entityType: 'Announcement',
        entityId: id,
        req,
      });

      return res.json({ success: true, message: 'Announcement deleted.' });
    } catch (error) {
      next(error);
    }
  }
);

// ==============================================================
// FAQ CMS
// ==============================================================

/**
 * POST /api/v1/admin/faq
 */
adminRouter.post('/faq', requirePermission('manage_faq'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = faqItemSchema.parse(req.body);
    const created = await prisma.faqItem.create({ data: validated });

    await logAuditEvent({
      actorId: req.user!.id,
      actorEmail: req.user!.email,
      actorRole: req.user!.role,
      action: 'CREATE_FAQ',
      entityType: 'FaqItem',
      entityId: created.id,
      req,
    });

    return res.status(201).json({ success: true, data: created });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/v1/admin/faq/:id
 */
adminRouter.put('/faq/:id', requirePermission('manage_faq'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const validated = faqItemSchema.parse(req.body);
    const updated = await prisma.faqItem.update({
      where: { id },
      data: validated,
    });

    await logAuditEvent({
      actorId: req.user!.id,
      actorEmail: req.user!.email,
      actorRole: req.user!.role,
      action: 'UPDATE_FAQ',
      entityType: 'FaqItem',
      entityId: updated.id,
      req,
    });

    return res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/v1/admin/faq/:id
 */
adminRouter.delete('/faq/:id', requirePermission('manage_faq'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await prisma.faqItem.delete({ where: { id } });

    await logAuditEvent({
      actorId: req.user!.id,
      actorEmail: req.user!.email,
      actorRole: req.user!.role,
      action: 'DELETE_FAQ',
      entityType: 'FaqItem',
      entityId: id,
      req,
    });

    return res.json({ success: true, message: 'FAQ deleted.' });
  } catch (error) {
    next(error);
  }
});

// ==============================================================
// ROADMAP CMS
// ==============================================================

/**
 * POST /api/v1/admin/roadmap
 */
adminRouter.post('/roadmap', requirePermission('manage_roadmap'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = roadmapMilestoneSchema.parse(req.body);
    const created = await prisma.roadmapMilestone.create({
      data: {
        phaseNumber: validated.phaseNumber,
        phaseTitle: validated.phaseTitle,
        targetPeriod: validated.targetPeriod,
        status: validated.status,
        milestonesJson: JSON.stringify(validated.milestones),
        details: validated.details,
        isTargetEstimate: validated.isTargetEstimate,
        displayOrder: validated.displayOrder,
      },
    });

    await logAuditEvent({
      actorId: req.user!.id,
      actorEmail: req.user!.email,
      actorRole: req.user!.role,
      action: 'CREATE_ROADMAP_MILESTONE',
      entityType: 'RoadmapMilestone',
      entityId: created.id,
      req,
    });

    return res.status(201).json({ success: true, data: created });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/v1/admin/roadmap/:id
 */
adminRouter.put('/roadmap/:id', requirePermission('manage_roadmap'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const validated = roadmapMilestoneSchema.parse(req.body);
    const updated = await prisma.roadmapMilestone.update({
      where: { id },
      data: {
        phaseNumber: validated.phaseNumber,
        phaseTitle: validated.phaseTitle,
        targetPeriod: validated.targetPeriod,
        status: validated.status,
        milestonesJson: JSON.stringify(validated.milestones),
        details: validated.details,
        isTargetEstimate: validated.isTargetEstimate,
        displayOrder: validated.displayOrder,
      },
    });

    await logAuditEvent({
      actorId: req.user!.id,
      actorEmail: req.user!.email,
      actorRole: req.user!.role,
      action: 'UPDATE_ROADMAP_MILESTONE',
      entityType: 'RoadmapMilestone',
      entityId: updated.id,
      req,
    });

    return res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/v1/admin/roadmap/:id
 */
adminRouter.delete('/roadmap/:id', requirePermission('manage_roadmap'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await prisma.roadmapMilestone.delete({ where: { id } });

    await logAuditEvent({
      actorId: req.user!.id,
      actorEmail: req.user!.email,
      actorRole: req.user!.role,
      action: 'DELETE_ROADMAP_MILESTONE',
      entityType: 'RoadmapMilestone',
      entityId: id,
      req,
    });

    return res.json({ success: true, message: 'Milestone deleted.' });
  } catch (error) {
    next(error);
  }
});

// ==============================================================
// ECOSYSTEM CMS
// ==============================================================

/**
 * POST /api/v1/admin/ecosystem
 */
adminRouter.post('/ecosystem', requirePermission('manage_ecosystem'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = ecosystemModuleSchema.parse(req.body);
    const created = await prisma.ecosystemModule.create({ data: validated });

    await logAuditEvent({
      actorId: req.user!.id,
      actorEmail: req.user!.email,
      actorRole: req.user!.role,
      action: 'CREATE_ECOSYSTEM_MODULE',
      entityType: 'EcosystemModule',
      entityId: created.id,
      req,
    });

    return res.status(201).json({ success: true, data: created });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/v1/admin/ecosystem/:id
 */
adminRouter.put('/ecosystem/:id', requirePermission('manage_ecosystem'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const validated = ecosystemModuleSchema.parse(req.body);
    const updated = await prisma.ecosystemModule.update({
      where: { id },
      data: validated,
    });

    await logAuditEvent({
      actorId: req.user!.id,
      actorEmail: req.user!.email,
      actorRole: req.user!.role,
      action: 'UPDATE_ECOSYSTEM_MODULE',
      entityType: 'EcosystemModule',
      entityId: updated.id,
      req,
    });

    return res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/v1/admin/ecosystem/:id
 */
adminRouter.delete('/ecosystem/:id', requirePermission('manage_ecosystem'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await prisma.ecosystemModule.delete({ where: { id } });

    await logAuditEvent({
      actorId: req.user!.id,
      actorEmail: req.user!.email,
      actorRole: req.user!.role,
      action: 'DELETE_ECOSYSTEM_MODULE',
      entityType: 'EcosystemModule',
      entityId: id,
      req,
    });

    return res.json({ success: true, message: 'Module deleted.' });
  } catch (error) {
    next(error);
  }
});

// ==============================================================
// USER & ROLE MANAGEMENT
// ==============================================================

/**
 * GET /api/v1/admin/users
 */
adminRouter.get('/users', requirePermission('manage_users'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(parseInt(req.query.page as string) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const search = (req.query.search as string) || '';

    const where = search
      ? {
          OR: [
            { email: { contains: search } },
            { name: { contains: search } },
          ],
        }
      : {};

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isEmailVerified: true,
          mfaEnabled: true,
          isBanned: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return res.json({
      success: true,
      data: {
        users,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/v1/admin/users/:id/role
 */
adminRouter.patch(
  '/users/:id/role',
  requirePermission('manage_roles'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { role } = req.body;

      const validRoles: Role[] = ['SUPER_ADMIN', 'FINANCE_MANAGER', 'CONTENT_EDITOR', 'SUPPORT_AGENT', 'READONLY_ANALYST', 'USER'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ success: false, error: { message: `Invalid role: ${role}` } });
      }

      const updated = await prisma.user.update({
        where: { id },
        data: { role },
        select: { id: true, email: true, name: true, role: true },
      });

      await logAuditEvent({
        actorId: req.user!.id,
        actorEmail: req.user!.email,
        actorRole: req.user!.role,
        action: 'UPDATE_USER_ROLE',
        entityType: 'User',
        entityId: updated.id,
        details: { newRole: role },
        req,
      });

      return res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PATCH /api/v1/admin/users/:id/ban
 */
adminRouter.patch(
  '/users/:id/ban',
  requirePermission('manage_users'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { isBanned } = req.body;

      const updated = await prisma.user.update({
        where: { id },
        data: { isBanned: Boolean(isBanned) },
      });

      // If banned, revoke all their active sessions immediately
      if (isBanned) {
        await prisma.session.updateMany({
          where: { userId: id },
          data: { isRevoked: true },
        });
      }

      await logAuditEvent({
        actorId: req.user!.id,
        actorEmail: req.user!.email,
        actorRole: req.user!.role,
        action: isBanned ? 'BAN_USER' : 'UNBAN_USER',
        entityType: 'User',
        entityId: id,
        req,
      });

      return res.json({ success: true, message: `User status updated.` });
    } catch (error) {
      next(error);
    }
  }
);

// ==============================================================
// SUPPORT TICKETS MANAGEMENT
// ==============================================================

/**
 * GET /api/v1/admin/support/tickets
 */
adminRouter.get('/support/tickets', requirePermission('manage_support'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const status = req.query.status as string;
    const where = status ? { status } : {};

    const tickets = await prisma.supportTicket.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    return res.json({ success: true, data: tickets });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/v1/admin/support/tickets/:id/status
 */
adminRouter.patch(
  '/support/tickets/:id/status',
  requirePermission('manage_support'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { status } = updateTicketStatusSchema.parse(req.body);

      const updated = await prisma.supportTicket.update({
        where: { id },
        data: { status },
      });

      await logAuditEvent({
        actorId: req.user!.id,
        actorEmail: req.user!.email,
        actorRole: req.user!.role,
        action: 'UPDATE_TICKET_STATUS',
        entityType: 'SupportTicket',
        entityId: id,
        details: { status },
        req,
      });

      return res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/v1/admin/support/tickets/:id/reply
 */
adminRouter.post(
  '/support/tickets/:id/reply',
  requirePermission('manage_support'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { content } = replyTicketSchema.parse(req.body);

      const ticket = await prisma.supportTicket.findUnique({ where: { id } });
      if (!ticket) {
        return res.status(404).json({ success: false, error: { message: 'Ticket not found' } });
      }

      const message = await prisma.$transaction(async (tx: any) => {
        const msg = await tx.supportMessage.create({
          data: {
            ticketId: ticket.id,
            authorId: req.user!.id,
            authorEmail: req.user!.email,
            authorName: req.user!.name,
            authorRole: req.user!.role,
            content,
          },
        });

        await tx.supportTicket.update({
          where: { id: ticket.id },
          data: {
            messagesCount: { increment: 1 },
            lastReplyAt: new Date(),
            status: 'IN_PROGRESS',
          },
        });

        return msg;
      });

      await logAuditEvent({
        actorId: req.user!.id,
        actorEmail: req.user!.email,
        actorRole: req.user!.role,
        action: 'STAFF_REPLY_TICKET',
        entityType: 'SupportMessage',
        entityId: message.id,
        req,
      });

      return res.status(201).json({ success: true, data: message });
    } catch (error) {
      next(error);
    }
  }
);

// ==============================================================
// AUDIT LOGS
// ==============================================================

/**
 * GET /api/v1/admin/audit-logs
 */
adminRouter.get('/audit-logs', requirePermission('view_audit_logs'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(parseInt(req.query.page as string) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit as string) || 30, 100);
    const action = req.query.action as string;
    const entityType = req.query.entityType as string;

    const where: any = {};
    if (action) where.action = action;
    if (entityType) where.entityType = entityType;

    const [total, logs] = await Promise.all([
      prisma.auditEvent.count({ where }),
      prisma.auditEvent.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return res.json({
      success: true,
      data: {
        logs,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
});

// ==============================================================
// NEWSLETTER SUBSCRIBERS
// ==============================================================

/**
 * GET /api/v1/admin/subscribers
 */
adminRouter.get('/subscribers', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const list = await prisma.newsletterSubscriber.findMany({
      orderBy: { subscribedAt: 'desc' },
    });
    return res.json({ success: true, data: list });
  } catch (error) {
    next(error);
  }
});

// ==============================================================
// KYC MANAGEMENT
// ==============================================================

/**
 * GET /api/v1/admin/kyc
 */
adminRouter.get('/kyc', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const status = req.query.status as string | undefined;
    const where: any = {};
    if (status && status !== 'ALL') {
      where.status = status;
    }

    const submissions = await prisma.kycVerification.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            createdAt: true,
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });

    return res.json({ success: true, data: submissions });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/v1/admin/kyc/:id/review
 */
adminRouter.patch('/kyc/:id/review', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = reviewKycSchema.parse(req.body);

    const kyc = await prisma.kycVerification.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!kyc) {
      return res.status(404).json({ success: false, error: { message: 'KYC record not found' } });
    }

    const updated = await prisma.kycVerification.update({
      where: { id },
      data: {
        status,
        rejectionReason: status === 'REJECTED' ? rejectionReason || 'Information mismatch' : null,
        reviewedById: req.user!.id,
        reviewedByEmail: req.user!.email,
        reviewedAt: new Date(),
      },
    });

    await prisma.notification.create({
      data: {
        userId: kyc.userId,
        title: status === 'APPROVED' ? 'KYC Verified!' : 'KYC Verification Update',
        message:
          status === 'APPROVED'
            ? 'Your identity documents have been approved. Full platform features unlocked.'
            : `Your KYC submission was rejected: ${rejectionReason || 'Please resubmit valid documents.'}`,
        type: status === 'APPROVED' ? 'SUCCESS' : 'ALERT',
        linkUrl: '/dashboard/kyc',
      },
    });

    await logAuditEvent({
      actorId: req.user!.id,
      actorEmail: req.user!.email,
      actorRole: req.user!.role,
      action: `KYC_${status}`,
      entityType: 'KycVerification',
      entityId: id,
      details: { targetUserId: kyc.userId, status, rejectionReason },
      req,
    });

    return res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
});

// ==============================================================
// BUY & SELL ORDERS (REQUESTS MANAGEMENT)
// ==============================================================

/**
 * GET /api/v1/admin/orders/buy
 */
adminRouter.get('/orders/buy', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orders = await prisma.buyOrder.findMany({
      include: {
        user: {
          select: { id: true, email: true, name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return res.json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/admin/orders/sell
 */
adminRouter.get('/orders/sell', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orders = await prisma.sellOrder.findMany({
      include: {
        user: {
          select: { id: true, email: true, name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return res.json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/v1/admin/orders/sell/:id/settle
 * Approves and marks a sell request as settled with bank UTR number
 */
adminRouter.patch('/orders/sell/:id/settle', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { settlementUtr } = adminSettleSellOrderSchema.parse(req.body);

    const sellOrder = await prisma.sellOrder.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!sellOrder) {
      return res.status(404).json({ success: false, error: { message: 'Sell order not found' } });
    }

    if (sellOrder.status === 'SETTLED') {
      return res.status(400).json({ success: false, error: { message: 'Sell order is already settled.' } });
    }

    const updated = await prisma.sellOrder.update({
      where: { id },
      data: {
        status: 'SETTLED',
        settlementUtr,
        settledAt: new Date(),
      },
    });

    await prisma.notification.create({
      data: {
        userId: sellOrder.userId,
        title: 'Payout Settled to Bank!',
        message: `Your withdrawal of ₹${sellOrder.totalInr} for order ${sellOrder.orderNumber} has been settled. Bank Ref/UTR: ${settlementUtr}`,
        type: 'SUCCESS',
        linkUrl: '/dashboard/transactions',
      },
    });

    await logAuditEvent({
      actorId: req.user!.id,
      actorEmail: req.user!.email,
      actorRole: req.user!.role,
      action: 'SETTLE_SELL_ORDER',
      entityType: 'SellOrder',
      entityId: id,
      details: { orderNumber: sellOrder.orderNumber, settlementUtr, totalInr: sellOrder.totalInr },
      req,
    });

    return res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/v1/admin/orders/sell/:id/reject
 * Rejects sell order and refunds coins back to user
 */
adminRouter.patch('/orders/sell/:id/reject', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const sellOrder = await prisma.sellOrder.findUnique({
      where: { id },
    });

    if (!sellOrder || sellOrder.status === 'SETTLED') {
      return res.status(400).json({ success: false, error: { message: 'Cannot reject settled order.' } });
    }

    // Refund coins back to user wallet
    await WalletService.creditCoins({
      userId: sellOrder.userId,
      amount: sellOrder.coinAmount,
      type: 'REFUND',
      referenceId: sellOrder.id,
      description: `Refund of ${sellOrder.coinAmount} SIcoinX for rejected sell order (${sellOrder.orderNumber}): ${reason || 'Bank payout failed'}`,
    });

    const updated = await prisma.sellOrder.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectionReason: reason || 'Bank details invalid or rejected by finance.',
      },
    });

    await prisma.notification.create({
      data: {
        userId: sellOrder.userId,
        title: 'Sell Order Rejected - Coins Refunded',
        message: `Your sell order ${sellOrder.orderNumber} was rejected: ${reason || 'Bank verification issue'}. Coins were returned to your wallet.`,
        type: 'ALERT',
        linkUrl: '/dashboard/transactions',
      },
    });

    return res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
});

// ==============================================================
// WALLET MANAGEMENT
// ==============================================================

/**
 * GET /api/v1/admin/wallets
 */
adminRouter.get('/wallets', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const search = req.query.search as string | undefined;
    const where: any = {};

    if (search) {
      where.OR = [
        { address: { contains: search } },
        { user: { email: { contains: search } } },
        { user: { name: { contains: search } } },
      ];
    }

    const wallets = await prisma.wallet.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            isBanned: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: 100,
    });

    return res.json({ success: true, data: wallets });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/v1/admin/wallets/:id/adjust
 * Admin credit or debit manual adjustment with audit trail
 */
adminRouter.patch('/admin-wallets/:id/adjust', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { type, coinAmount, reason } = adminAdjustWalletSchema.parse({
      ...req.body,
      targetUserId: req.body.targetUserId || id,
    });

    const wallet = await prisma.wallet.findFirst({
      where: { OR: [{ id }, { userId: id }] },
      include: { user: true },
    });

    if (!wallet) {
      return res.status(404).json({ success: false, error: { message: 'Wallet not found' } });
    }

    let result;
    if (type === 'CREDIT') {
      result = await WalletService.creditCoins({
        userId: wallet.userId,
        amount: coinAmount,
        type: 'ADMIN_CREDIT',
        description: `Administrative credit: ${reason}`,
      });
    } else {
      result = await WalletService.debitCoins({
        userId: wallet.userId,
        amount: coinAmount,
        type: 'ADMIN_DEBIT',
        description: `Administrative debit: ${reason}`,
      });
    }

    await logAuditEvent({
      actorId: req.user!.id,
      actorEmail: req.user!.email,
      actorRole: req.user!.role,
      action: `ADMIN_WALLET_${type}`,
      entityType: 'Wallet',
      entityId: wallet.id,
      details: { targetUserId: wallet.userId, coinAmount, reason, balanceAfter: result.wallet.coinBalance },
      req,
    });

    return res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/v1/admin/wallets/:id/freeze
 */
adminRouter.patch('/admin-wallets/:id/freeze', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { isFrozen, reason } = adminFreezeWalletSchema.parse(req.body);

    const wallet = await prisma.wallet.update({
      where: { id },
      data: { isFrozen },
      include: { user: true },
    });

    await logAuditEvent({
      actorId: req.user!.id,
      actorEmail: req.user!.email,
      actorRole: req.user!.role,
      action: isFrozen ? 'FREEZE_WALLET' : 'UNFREEZE_WALLET',
      entityType: 'Wallet',
      entityId: id,
      details: { targetUserId: wallet.userId, isFrozen, reason },
      req,
    });

    return res.json({ success: true, data: wallet });
  } catch (error) {
    next(error);
  }
});

// ==============================================================
// PAYMENT & SETTLEMENT MONITORING
// ==============================================================

/**
 * GET /api/v1/admin/payments
 */
adminRouter.get('/payments', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payments = await prisma.paymentRecord.findMany({
      include: {
        user: {
          select: { id: true, email: true, name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return res.json({ success: true, data: payments });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/admin/payments/:id/refund
 */
adminRouter.post('/payments/:id/refund', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { refundReason } = adminRefundPaymentSchema.parse({
      paymentRecordId: id,
      refundReason: req.body.refundReason,
    });

    const payment = await prisma.paymentRecord.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!payment || payment.status !== 'CAPTURED') {
      return res.status(400).json({ success: false, error: { message: 'Payment record is not refundable.' } });
    }

    const refundRes = await RazorpayService.processRefund({
      paymentId: payment.gatewayPaymentId || payment.gatewayOrderId,
      amountInr: payment.amountInr,
      notes: { reason: refundReason, refundedBy: req.user!.email },
    });

    // If associated with a buy order, deduct credited coins
    if (payment.buyOrderId) {
      const buyOrder = await prisma.buyOrder.findUnique({ where: { id: payment.buyOrderId } });
      if (buyOrder) {
        await WalletService.debitCoins({
          userId: payment.userId,
          amount: buyOrder.coinAmount,
          type: 'REFUND',
          referenceId: payment.id,
          description: `Coins revoked due to Razorpay payment refund (${refundReason})`,
        });

        await prisma.buyOrder.update({
          where: { id: buyOrder.id },
          data: { status: 'REFUNDED' },
        });
      }
    }

    const updatedPayment = await prisma.paymentRecord.update({
      where: { id },
      data: {
        status: 'REFUNDED',
        refundId: refundRes.refundId,
        refundAmount: payment.amountInr,
        refundReason,
      },
    });

    await logAuditEvent({
      actorId: req.user!.id,
      actorEmail: req.user!.email,
      actorRole: req.user!.role,
      action: 'REFUND_PAYMENT',
      entityType: 'PaymentRecord',
      entityId: id,
      details: { amountInr: payment.amountInr, refundReason, refundId: refundRes.refundId },
      req,
    });

    return res.json({ success: true, data: updatedPayment });
  } catch (error) {
    next(error);
  }
});

// ==============================================================
// COIN RATES & SUPPLY MANAGEMENT
// ==============================================================

/**
 * PUT /api/v1/admin/coin/rates
 */
adminRouter.put('/coin/rates', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = updateCoinRatesSchema.parse(req.body);

    const updated = await prisma.coinConfiguration.update({
      where: { id: 'default-coin' },
      data: {
        buyPriceInr: data.buyPriceInr,
        sellPriceInr: data.sellPriceInr,
        inrPerUsd: data.inrPerUsd,
        circulatingSupply: data.circulatingSupply,
        totalSupply: data.totalSupply,
        reserveSupply: data.reserveSupply,
        enableBuying: data.enableBuying,
        enableSelling: data.enableSelling,
        enableTransfers: data.enableTransfers,
      },
    });

    await logAuditEvent({
      actorId: req.user!.id,
      actorEmail: req.user!.email,
      actorRole: req.user!.role,
      action: 'UPDATE_COIN_RATES',
      entityType: 'CoinConfiguration',
      entityId: 'default-coin',
      details: data,
      req,
    });

    return res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
});

// ==============================================================
// REPORTS & ANALYTICS
// ==============================================================

/**
 * GET /api/v1/admin/reports/analytics
 */
adminRouter.get('/reports/analytics', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [
      totalUsers,
      totalWallets,
      buyOrders,
      sellOrders,
      transfers,
      payments,
      kycStats,
      coinConfig,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.wallet.count(),
      prisma.buyOrder.findMany({ where: { status: 'COMPLETED' } }),
      prisma.sellOrder.findMany({ where: { status: 'SETTLED' } }),
      prisma.ecosystemTransfer.count(),
      prisma.paymentRecord.findMany(),
      prisma.kycVerification.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
      prisma.coinConfiguration.findFirst({ where: { id: 'default-coin' } }),
    ]);

    // Calculate metrics
    let totalRevenueInr = new Decimal(0);
    let totalCoinsPurchased = new Decimal(0);
    buyOrders.forEach((o) => {
      totalRevenueInr = totalRevenueInr.plus(new Decimal(o.totalInr));
      totalCoinsPurchased = totalCoinsPurchased.plus(new Decimal(o.coinAmount));
    });

    let totalPayoutInr = new Decimal(0);
    let totalCoinsSold = new Decimal(0);
    sellOrders.forEach((o) => {
      totalPayoutInr = totalPayoutInr.plus(new Decimal(o.totalInr));
      totalCoinsSold = totalCoinsSold.plus(new Decimal(o.coinAmount));
    });

    const netRevenueInr = totalRevenueInr.minus(totalPayoutInr).toFixed(2);

    return res.json({
      success: true,
      data: {
        summary: {
          totalUsers,
          totalWallets,
          totalRevenueInr: totalRevenueInr.toFixed(2),
          totalPayoutInr: totalPayoutInr.toFixed(2),
          netRevenueInr,
          totalCoinsPurchased: totalCoinsPurchased.toFixed(2),
          totalCoinsSold: totalCoinsSold.toFixed(2),
          totalTransfers: transfers,
          circulatingSupply: coinConfig?.circulatingSupply || '18500000',
          totalSupply: coinConfig?.totalSupply || '100000000',
          reserveSupply: coinConfig?.reserveSupply || '81500000',
          buyPriceInr: coinConfig?.buyPriceInr || '105.00',
          sellPriceInr: coinConfig?.sellPriceInr || '100.00',
        },
        kycDistribution: kycStats.reduce((acc, curr) => {
          acc[curr.status] = curr._count.status;
          return acc;
        }, {} as Record<string, number>),
        recentPaymentCount: payments.length,
      },
    });
  } catch (error) {
    next(error);
  }
});

// ==============================================================
// ECOSYSTEM PARTNERS MANAGEMENT
// ==============================================================

/**
 * GET /api/v1/admin/partners
 */
adminRouter.get('/partners', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const partners = await prisma.ecosystemPartner.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ success: true, data: partners });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/admin/partners
 */
adminRouter.post('/partners', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { appName, slug, permissions, webhookUrl } = req.body;
    const apiKey = `pk_live_${slug}_${crypto.randomBytes(6).toString('hex')}`;
    const apiSecret = crypto.randomBytes(24).toString('hex');

    const partner = await prisma.ecosystemPartner.create({
      data: {
        appName,
        slug,
        apiKey,
        apiSecret,
        permissions: permissions || 'read_balance,debit,credit,transfer',
        webhookUrl: webhookUrl || null,
      },
    });

    await logAuditEvent({
      actorId: req.user!.id,
      actorEmail: req.user!.email,
      actorRole: req.user!.role,
      action: 'CREATE_ECOSYSTEM_PARTNER',
      entityType: 'EcosystemPartner',
      entityId: partner.id,
      details: { appName, slug, apiKey },
      req,
    });

    return res.json({ success: true, data: partner });
  } catch (error) {
    next(error);
  }
});

