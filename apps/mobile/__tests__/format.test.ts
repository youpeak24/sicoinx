import { maskId, shortHash, statusLabel, ticketTone, txTypeLabel, formatDateTime } from '@/lib/format';

describe('format', () => {
  test('shortHash never throws on short or missing hashes', () => {
    expect(shortHash(undefined)).toBe('—');
    expect(shortHash('0x12')).toBe('0x12');
    expect(shortHash('0x1234567890abcdef1234567890abcdef')).toBe('0x1234567890…cdef');
  });

  test('maskId', () => {
    expect(maskId('123456789012')).toBe('XXXXXXXX9012');
    expect(maskId('12')).toBe('12');
    expect(maskId(null)).toBe('—');
  });

  test('labels', () => {
    expect(txTypeLabel('BUY_COIN')).toBe('Purchase');
    expect(txTypeLabel('SOMETHING_NEW')).toBe('Something new');
    expect(statusLabel('IN_PROGRESS')).toBe('In progress');
    expect(ticketTone('RESOLVED')).toBe('success');
    expect(ticketTone('CLOSED')).toBe('neutral');
  });

  test('formatDateTime handles invalid input', () => {
    expect(formatDateTime('not a date')).toBe('—');
    expect(formatDateTime(null)).toBe('—');
    expect(formatDateTime(new Date(2026, 10, 16, 17, 5).toISOString())).toBe('16 Nov 2026, 5:05 PM');
    expect(formatDateTime(new Date(2026, 0, 2, 0, 9).toISOString())).toBe('2 Jan 2026, 12:09 AM');
  });
});
