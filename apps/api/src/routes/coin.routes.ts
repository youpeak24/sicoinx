import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { PricingService } from '../lib/pricingService';
import { calculateUsdToSi, calculateSiToUsd, calculatorInputSchema } from '@sicoin/shared';

export const coinRouter = Router();

/**
 * GET /api/v1/coin/config
 * Returns public metadata of the coin.
 */
coinRouter.get('/config', async (req: Request, res: Response, next: NextFunction) => {
  try {
    let config = await prisma.coinConfiguration.findFirst({
      where: { id: 'default-coin' },
    });

    if (!config) {
      config = await prisma.coinConfiguration.create({
        data: {
          id: 'default-coin',
          tokenName: 'SI Coin',
          ticker: 'SI',
          decimals: 6,
          blockchainNetwork: 'Ethereum (Planned ERC-20) / Sepolia Testnet Preview',
          totalSupply: '100000000',
          circulatingSupply: '18500000',
          maxSupply: '100000000',
          whitepaperUrl: '/whitepaper',
          projectStatus: 'ACTIVE_DEVELOPMENT',
          officialEmail: 'info@sicoin.org',
        },
      });
    }

    return res.json({
      success: true,
      data: {
        tokenName: config.tokenName,
        ticker: config.ticker,
        decimals: config.decimals,
        blockchainNetwork: config.blockchainNetwork,
        contractAddress: config.contractAddress,
        explorerUrl: config.explorerUrl,
        totalSupply: config.totalSupply,
        circulatingSupply: config.circulatingSupply,
        maxSupply: config.maxSupply,
        whitepaperUrl: config.whitepaperUrl,
        projectStatus: config.projectStatus,
        officialEmail: config.officialEmail,
        updatedAt: config.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/coin/price
 * Returns current effective reference price, provenance, 24h delta, and market cap.
 */
coinRouter.get('/price', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const summary = await PricingService.getCurrentPriceSummary();
    return res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/coin/price/history
 * Returns historical records with range filters.
 */
coinRouter.get('/price/history', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const range = (req.query.range as any) || '30D';
    const limit = Math.min(parseInt(req.query.limit as string) || 100, 500);
    const page = Math.max(parseInt(req.query.page as string) || 1, 1);

    const result = await PricingService.getHistory({ range, limit, page });

    return res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/coin/calculator
 * Calculates bidirectional conversion between USD and SI using the active reference price.
 */
coinRouter.post('/calculator', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { amount, direction } = calculatorInputSchema.parse(req.body);
    const summary = await PricingService.getCurrentPriceSummary();

    if (summary.isStale) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'PRICE_STALE',
          message: 'The reference price is stale beyond the configured threshold. Calculation disabled.',
        },
      });
    }

    let calculation;
    if (direction === 'USD_TO_SI') {
      calculation = calculateUsdToSi(amount, summary.priceUsd);
    } else {
      calculation = calculateSiToUsd(amount, summary.priceUsd);
    }

    return res.json({
      success: true,
      data: {
        ...calculation,
        priceSource: summary.source,
        priceSourceLabel: summary.sourceLabel,
        effectiveTimestamp: summary.effectiveTimestamp,
        disclaimer: 'Estimate based on the displayed reference price. This is not an executable exchange quote.',
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/coin/tokenomics
 * Returns token allocations totaling 100% and vesting schedules.
 */
coinRouter.get('/tokenomics', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const allocations = await prisma.tokenAllocation.findMany({
      orderBy: { displayOrder: 'asc' },
    });

    const coin = await prisma.coinConfiguration.findFirst({
      where: { id: 'default-coin' },
    });

    const totalPercentage = allocations.reduce((sum: number, a: any) => sum + a.percentage, 0);

    return res.json({
      success: true,
      data: {
        tokenName: coin?.tokenName || 'SI Coin',
        ticker: coin?.ticker || 'SI',
        totalSupply: coin?.totalSupply || '100000000',
        circulatingSupply: coin?.circulatingSupply || '18500000',
        blockchainNetwork: coin?.blockchainNetwork || 'Ethereum (Planned ERC-20)',
        contractAddress: coin?.contractAddress || null,
        allocations: allocations.map((a: any) => ({
          id: a.id,
          category: a.category,
          percentage: a.percentage,
          tokenAmount: a.tokenAmount,
          vestingDescription: a.vestingDescription,
          unlockSchedule: a.unlockSchedule,
          colorHex: a.colorHex,
          displayOrder: a.displayOrder,
        })),
        totalPercentage,
        isVerifiedTotal: Math.abs(totalPercentage - 100) < 0.001,
      },
    });
  } catch (error) {
    next(error);
  }
});
