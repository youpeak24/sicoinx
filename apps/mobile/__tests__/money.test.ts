import {
  formatCoin,
  formatInr,
  formatUsd,
  isCredit,
  isPositiveAmount,
  multiplyToInr,
  sanitizeDecimalInput,
  toDecimal,
} from '@/lib/money';

describe('money', () => {
  test('multiplyToInr is exact decimal arithmetic (no float drift)', () => {
    expect(multiplyToInr('0.1', '3')).toBe('0.30');
    expect(multiplyToInr('100', '105.00')).toBe('10500.00');
    expect(multiplyToInr('1.005', '1')).toBe('1.01'); // round-half-up like the API
    expect(multiplyToInr('', '105')).toBe('0.00');
    expect(multiplyToInr('abc', '105')).toBe('0.00');
  });

  test('sanitizeDecimalInput keeps one dot and limits decimals', () => {
    expect(sanitizeDecimalInput('12a.3.4')).toBe('12.34');
    expect(sanitizeDecimalInput('1,5')).toBe('1.5');
    expect(sanitizeDecimalInput('0.1234567')).toBe('0.123456');
    expect(sanitizeDecimalInput('-5')).toBe('5');
  });

  test('isPositiveAmount matches the API pattern and rejects zero', () => {
    expect(isPositiveAmount('10')).toBe(true);
    expect(isPositiveAmount('0.5')).toBe(true);
    expect(isPositiveAmount('0')).toBe(false);
    expect(isPositiveAmount('0.0')).toBe(false);
    expect(isPositiveAmount('1.')).toBe(false);
    expect(isPositiveAmount('-1')).toBe(false);
    expect(isPositiveAmount('')).toBe(false);
  });

  test('toDecimal never throws', () => {
    expect(toDecimal('x')).toBeNull();
    expect(toDecimal(undefined)).toBeNull();
    expect(toDecimal('Infinity')).toBeNull();
    expect(toDecimal('12.5')?.toString()).toBe('12.5');
  });

  test('formatInr uses Indian digit grouping', () => {
    expect(formatInr('10500')).toBe('₹10,500.00');
    expect(formatInr('1050000')).toBe('₹10,50,000.00');
    expect(formatInr('123456789.5')).toBe('₹12,34,56,789.50');
    expect(formatInr('-250')).toBe('-₹250.00');
    expect(formatInr(undefined)).toBe('₹0.00');
  });

  test('formatUsd uses international grouping', () => {
    expect(formatUsd('1234567.891')).toBe('$1,234,567.89');
  });

  test('formatCoin trims to 2–6 decimals and supports explicit sign', () => {
    expect(formatCoin('550.000000')).toBe('550.00');
    expect(formatCoin('0.123456')).toBe('0.123456');
    expect(formatCoin('1234.500000')).toBe('1,234.50');
    expect(formatCoin('+100.000000', true)).toBe('+100.00');
    expect(formatCoin('-50.000000', true)).toBe('-50.00');
    expect(formatCoin('0', true)).toBe('0.00');
    expect(formatCoin('garbage')).toBe('0.00');
  });

  test('isCredit reads the ledger sign', () => {
    expect(isCredit('+100.000000')).toBe(true);
    expect(isCredit('100')).toBe(true);
    expect(isCredit('-5.000000')).toBe(false);
    expect(isCredit('nonsense')).toBe(false);
  });
});
