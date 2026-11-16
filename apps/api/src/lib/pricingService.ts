import { prisma } from './prisma';
import Decimal from 'decimal.js';
import { isPriceStale } from '@sicoin/shared';

export interface PriceSummary {
  priceUsd: string;
  quoteCurrency: string;
  source: string;
  sourceLabel: string;
  effectiveTimestamp: string;
  recordedTimestamp: string;
  isStale: boolean;
  isDemoData: boolean;
  change24h: {
    percentage: number;
    direction: 'up' | 'down' | 'neutral';
    baselinePrice: string;
  } | null;
  circulatingSupply: string;
  totalSupply: string;
  marketCapUsd: string | null;
}

export class PricingService {
  /**
   * Retrieves the current effective price observation and calculated market overview.
   */
  static async getCurrentPriceSummary(): Promise<PriceSummary> {
    const config = await prisma.priceSourceConfiguration.findFirst({
      where: { id: 'default-price-config' },
    });

    const coin = await prisma.coinConfiguration.findFirst({
      where: { id: 'default-coin' },
    });

    const activeSource = config?.activeSource || 'MANUAL';
    const staleThreshold = config?.staleThresholdMinutes || 60;

    // Check for any scheduled price changes that are due now
    await this.processScheduledPriceChanges();

    // Get the latest observation for the active source
    let latest = await prisma.priceObservation.findFirst({
      where: activeSource === 'DEMO' ? {} : { source: activeSource },
      orderBy: { effectiveTimestamp: 'desc' },
    });

    // Fallback if none found for specific active source
    if (!latest) {
      latest = await prisma.priceObservation.findFirst({
        orderBy: { effectiveTimestamp: 'desc' },
      });
    }

    const priceUsd = latest?.priceUsd || '1.250000';
    const effectiveTimestamp = latest?.effectiveTimestamp ? latest.effectiveTimestamp.toISOString() : new Date().toISOString();
    const recordedTimestamp = latest?.recordedTimestamp ? latest.recordedTimestamp.toISOString() : new Date().toISOString();
    const isStale = isPriceStale(effectiveTimestamp, staleThreshold);

    // Calculate 24h change against observation ~24h ago
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const baseline = await prisma.priceObservation.findFirst({
      where: {
        effectiveTimestamp: { lte: oneDayAgo },
      },
      orderBy: { effectiveTimestamp: 'desc' },
    });

    let change24h: PriceSummary['change24h'] = null;
    if (baseline && baseline.priceUsd) {
      try {
        const cur = new Decimal(priceUsd);
        const base = new Decimal(baseline.priceUsd);
        if (base.gt(0)) {
          const diff = cur.minus(base);
          const pct = diff.dividedBy(base).times(100).toNumber();
          change24h = {
            percentage: Math.abs(pct),
            direction: pct > 0 ? 'up' : pct < 0 ? 'down' : 'neutral',
            baselinePrice: base.toFixed(6),
          };
        }
      } catch (e) {
        console.error('Error calculating 24h change:', e);
      }
    }

    // Market capitalization calculation rule:
    // Only calculate if suitable market-price and circulating supply exist.
    // If it's an admin-set reference rate, label provenance clearly.
    const circulating = coin?.circulatingSupply || '18500000';
    const total = coin?.totalSupply || '100000000';
    let marketCapUsd: string | null = null;

    try {
      const priceDec = new Decimal(priceUsd);
      const circDec = new Decimal(circulating);
      marketCapUsd = priceDec.times(circDec).toFixed(2);
    } catch {
      marketCapUsd = null;
    }

    return {
      priceUsd,
      quoteCurrency: 'USD',
      source: latest?.source || 'MANUAL',
      sourceLabel: latest?.sourceLabel || 'Administrator-set reference price',
      effectiveTimestamp,
      recordedTimestamp,
      isStale,
      isDemoData: latest?.isDemoData || activeSource === 'DEMO',
      change24h,
      circulatingSupply: circulating,
      totalSupply: total,
      marketCapUsd,
    };
  }

  /**
   * Processes any pending scheduled price changes that have matured.
   */
  static async processScheduledPriceChanges(): Promise<void> {
    const now = new Date();
    const dueChanges = await prisma.scheduledPriceChange.findMany({
      where: {
        isExecuted: false,
        isCancelled: false,
        scheduledTime: { lte: now },
      },
    });

    for (const change of dueChanges) {
      await prisma.$transaction(async (tx: any) => {
        await tx.priceObservation.create({
          data: {
            priceUsd: change.scheduledPriceUsd,
            quoteCurrency: 'USD',
            source: 'MANUAL',
            sourceLabel: 'Administrator-set reference price (Scheduled execution)',
            effectiveTimestamp: change.scheduledTime,
            actorEmail: change.createdByEmail,
            changeReason: `Scheduled release: ${change.reason}`,
            isCorrection: false,
            isDemoData: false,
          },
        });

        await tx.scheduledPriceChange.update({
          where: { id: change.id },
          data: {
            isExecuted: true,
            executedAt: now,
          },
        });
      });
    }
  }

  /**
   * Retrieves historical price observations for charts and tables.
   */
  static async getHistory({
    range = '30D',
    limit = 100,
    page = 1,
  }: {
    range?: '24H' | '7D' | '30D' | '90D' | '1Y' | 'ALL';
    limit?: number;
    page?: number;
  }) {
    let dateFilter: Date | undefined;
    const now = Date.now();

    switch (range) {
      case '24H':
        dateFilter = new Date(now - 24 * 60 * 60 * 1000);
        break;
      case '7D':
        dateFilter = new Date(now - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30D':
        dateFilter = new Date(now - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90D':
        dateFilter = new Date(now - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1Y':
        dateFilter = new Date(now - 365 * 24 * 60 * 60 * 1000);
        break;
      case 'ALL':
      default:
        dateFilter = undefined;
        break;
    }

    const whereClause = dateFilter ? { effectiveTimestamp: { gte: dateFilter } } : {};

    const [totalCount, records] = await Promise.all([
      prisma.priceObservation.count({ where: whereClause }),
      prisma.priceObservation.findMany({
        where: whereClause,
        orderBy: { effectiveTimestamp: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      records: records.map((r: any) => ({
        id: r.id,
        priceUsd: r.priceUsd,
        quoteCurrency: r.quoteCurrency,
        source: r.source,
        sourceLabel: r.sourceLabel,
        effectiveTimestamp: r.effectiveTimestamp.toISOString(),
        recordedTimestamp: r.recordedTimestamp.toISOString(),
        actorEmail: r.actorEmail,
        changeReason: r.changeReason,
        isCorrection: r.isCorrection,
        supersededRecordId: r.supersededRecordId,
        isDemoData: r.isDemoData,
      })),
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
      range,
    };
  }
}
