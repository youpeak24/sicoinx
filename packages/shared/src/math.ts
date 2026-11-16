import Decimal from 'decimal.js';

// Configure Decimal.js precision
Decimal.set({ precision: 30, rounding: Decimal.ROUND_HALF_UP });

export interface CalculationResult {
  isValid: boolean;
  errorMessage?: string;
  inputAmount: string;
  outputAmount: string;
  inputUnit: string;
  outputUnit: string;
  rateUsed: string;
  isStale: boolean;
}

/**
 * Calculates estimated SI from USD using strict decimal arithmetic.
 */
export function calculateUsdToSi(
  usdAmountStr: string,
  pricePerSiStr: string,
  decimals: number = 6
): CalculationResult {
  try {
    const usd = new Decimal(usdAmountStr || '0');
    const price = new Decimal(pricePerSiStr || '0');

    if (usd.isNegative()) {
      return {
        isValid: false,
        errorMessage: 'Amount cannot be negative',
        inputAmount: usdAmountStr,
        outputAmount: '0',
        inputUnit: 'USD',
        outputUnit: 'SI',
        rateUsed: pricePerSiStr,
        isStale: false,
      };
    }

    if (price.lte(0)) {
      return {
        isValid: false,
        errorMessage: 'Invalid or missing reference price',
        inputAmount: usdAmountStr,
        outputAmount: '0',
        inputUnit: 'USD',
        outputUnit: 'SI',
        rateUsed: pricePerSiStr,
        isStale: false,
      };
    }

    const estimatedSi = usd.dividedBy(price);
    const formattedOutput = estimatedSi.toFixed(decimals);

    return {
      isValid: true,
      inputAmount: usd.toFixed(2),
      outputAmount: formattedOutput,
      inputUnit: 'USD',
      outputUnit: 'SI',
      rateUsed: price.toFixed(6),
      isStale: false,
    };
  } catch (err: any) {
    return {
      isValid: false,
      errorMessage: err.message || 'Calculation error',
      inputAmount: usdAmountStr,
      outputAmount: '0',
      inputUnit: 'USD',
      outputUnit: 'SI',
      rateUsed: pricePerSiStr,
      isStale: false,
    };
  }
}

/**
 * Calculates estimated USD from SI using strict decimal arithmetic.
 */
export function calculateSiToUsd(
  siAmountStr: string,
  pricePerSiStr: string,
  decimals: number = 2
): CalculationResult {
  try {
    const si = new Decimal(siAmountStr || '0');
    const price = new Decimal(pricePerSiStr || '0');

    if (si.isNegative()) {
      return {
        isValid: false,
        errorMessage: 'Amount cannot be negative',
        inputAmount: siAmountStr,
        outputAmount: '0',
        inputUnit: 'SI',
        outputUnit: 'USD',
        rateUsed: pricePerSiStr,
        isStale: false,
      };
    }

    if (price.lte(0)) {
      return {
        isValid: false,
        errorMessage: 'Invalid or missing reference price',
        inputAmount: siAmountStr,
        outputAmount: '0',
        inputUnit: 'SI',
        outputUnit: 'USD',
        rateUsed: pricePerSiStr,
        isStale: false,
      };
    }

    const estimatedUsd = si.times(price);
    const formattedOutput = estimatedUsd.toFixed(decimals);

    return {
      isValid: true,
      inputAmount: si.toFixed(6),
      outputAmount: formattedOutput,
      inputUnit: 'SI',
      outputUnit: 'USD',
      rateUsed: price.toFixed(6),
      isStale: false,
    };
  } catch (err: any) {
    return {
      isValid: false,
      errorMessage: err.message || 'Calculation error',
      inputAmount: siAmountStr,
      outputAmount: '0',
      inputUnit: 'SI',
      outputUnit: 'USD',
      rateUsed: pricePerSiStr,
      isStale: false,
    };
  }
}

/**
 * Checks if a given timestamp is older than threshold in minutes.
 */
export function isPriceStale(timestampIso: string | Date, thresholdMinutes: number = 60): boolean {
  if (!timestampIso) return true;
  const time = new Date(timestampIso).getTime();
  if (isNaN(time)) return true;
  const diffMinutes = (Date.now() - time) / (1000 * 60);
  return diffMinutes > thresholdMinutes;
}

/**
 * Formats a currency string with commas and appropriate decimal places.
 */
export function formatCurrency(
  value: string | number | Decimal,
  currency: string = 'USD',
  minimumFractionDigits: number = 2,
  maximumFractionDigits: number = 4
): string {
  try {
    const num = typeof value === 'number' ? value : parseFloat(value.toString());
    if (isNaN(num)) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits,
      maximumFractionDigits,
    }).format(num);
  } catch {
    return `$${value}`;
  }
}

/**
 * Formats a raw number string with thousands separators.
 */
export function formatNumber(
  value: string | number,
  minimumFractionDigits: number = 0,
  maximumFractionDigits: number = 2
): string {
  try {
    const num = typeof value === 'number' ? value : parseFloat(value.toString());
    if (isNaN(num)) return '0';
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits,
      maximumFractionDigits,
    }).format(num);
  } catch {
    return `${value}`;
  }
}

/**
 * Calculates percentage change between two price observations.
 * Returns null if baseline is missing, zero, or invalid.
 */
export function calculatePercentageChange(
  currentPriceStr: string,
  baselinePriceStr: string
): { percentChange: number; direction: 'up' | 'down' | 'neutral' } | null {
  try {
    const current = new Decimal(currentPriceStr);
    const baseline = new Decimal(baselinePriceStr);
    if (baseline.isZero() || baseline.isNegative()) return null;

    const diff = current.minus(baseline);
    const percent = diff.dividedBy(baseline).times(100).toNumber();

    return {
      percentChange: Math.abs(percent),
      direction: percent > 0 ? 'up' : percent < 0 ? 'down' : 'neutral',
    };
  } catch {
    return null;
  }
}
