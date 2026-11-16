import { Decimal } from 'decimal.js';

/** Same pattern the API enforces on coin amounts. */
export const DECIMAL_PATTERN = /^\d+(\.\d+)?$/;

/** Parses a decimal string. Returns null for anything that is not a plain number. */
export function toDecimal(value: unknown): Decimal | null {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  if (text === '') return null;
  try {
    const d = new Decimal(text);
    return d.isFinite() ? d : null;
  } catch {
    return null;
  }
}

/** Keeps only digits and one decimal point, and limits the fraction digits. */
export function sanitizeDecimalInput(text: string, maxDecimals = 6): string {
  let cleaned = text.replace(/,/g, '.').replace(/[^0-9.]/g, '');
  const firstDot = cleaned.indexOf('.');
  if (firstDot !== -1) {
    const head = cleaned.slice(0, firstDot);
    const tail = cleaned.slice(firstDot + 1).replace(/\./g, '').slice(0, maxDecimals);
    cleaned = `${head}.${tail}`;
  }
  return cleaned;
}

/** True when the text is a strictly positive decimal number. */
export function isPositiveAmount(text: string): boolean {
  if (!DECIMAL_PATTERN.test(text.trim())) return false;
  const d = toDecimal(text);
  return d !== null && d.gt(0);
}

/** coins x price, rounded to 2 decimals exactly like the API does (round-half-up). */
export function multiplyToInr(coins: string, pricePerCoin: string): string {
  const c = toDecimal(coins);
  const p = toDecimal(pricePerCoin);
  if (!c || !p) return '0.00';
  return c.times(p).toFixed(2, Decimal.ROUND_HALF_UP);
}

function group(intPart: string, indian: boolean): string {
  if (!indian) return intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  if (intPart.length <= 3) return intPart;
  const last3 = intPart.slice(-3);
  const rest = intPart.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  return `${rest},${last3}`;
}

function formatFixed(value: unknown, decimals: number, indian: boolean): string {
  const d = toDecimal(value);
  if (!d) return decimals > 0 ? `0.${'0'.repeat(decimals)}` : '0';
  const negative = d.isNegative() && !d.isZero();
  const fixed = d.abs().toFixed(decimals, Decimal.ROUND_HALF_UP);
  const [int, frac] = fixed.split('.');
  const body = frac ? `${group(int, indian)}.${frac}` : group(int, indian);
  return negative ? `-${body}` : body;
}

/** "₹1,05,000.00" */
export function formatInr(value: unknown): string {
  const text = formatFixed(value, 2, true);
  return text.startsWith('-') ? `-₹${text.slice(1)}` : `₹${text}`;
}

/** "$1,234.56" */
export function formatUsd(value: unknown): string {
  const text = formatFixed(value, 2, false);
  return text.startsWith('-') ? `-$${text.slice(1)}` : `$${text}`;
}

/**
 * Coin amounts keep at least 2 and at most 6 decimals ("550.00", "0.123456"),
 * and keep an explicit "+" for credits when `signed` is set.
 */
export function formatCoin(value: unknown, signed = false): string {
  const d = toDecimal(value);
  if (!d) return '0.00';
  const six = d.abs().toFixed(6, Decimal.ROUND_HALF_UP);
  const [int, rawFrac] = six.split('.');
  let frac = rawFrac.replace(/0+$/, '');
  if (frac.length < 2) frac = frac.padEnd(2, '0');
  const body = `${group(int, false)}.${frac}`;
  if (d.isNegative() && !d.isZero()) return `-${body}`;
  return signed && !d.isZero() ? `+${body}` : body;
}

/** True when a ledger amount ("+100.000000" / "-50.000000") is a credit. */
export function isCredit(coinAmount: unknown): boolean {
  const d = toDecimal(coinAmount);
  return d !== null && d.gt(0);
}
