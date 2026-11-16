import {
  validateBankDetails,
  validateCoinAmount,
  validateEmail,
  validateKyc,
  validateNewPassword,
  validateTicket,
} from '@/lib/validation';

describe('validation (mirrors packages/shared schemas)', () => {
  test('email', () => {
    expect(validateEmail('a@b.co')).toBeNull();
    expect(validateEmail('nope')).not.toBeNull();
    expect(validateEmail('  ')).not.toBeNull();
  });

  test('new password needs 8 chars, uppercase and a digit', () => {
    expect(validateNewPassword('Short1')).toMatch(/8 characters/);
    expect(validateNewPassword('alllowercase1')).toMatch(/uppercase/);
    expect(validateNewPassword('NoNumbersHere')).toMatch(/number/);
    expect(validateNewPassword('UserSecurePass123!')).toBeNull();
  });

  test('coin amount limits', () => {
    expect(validateCoinAmount('')).not.toBeNull();
    expect(validateCoinAmount('0')).not.toBeNull();
    expect(validateCoinAmount('5', { min: '10' })).toMatch(/Minimum/);
    expect(validateCoinAmount('500', { max: '100' })).toMatch(/Maximum/);
    expect(validateCoinAmount('60', { available: '50.5' })).toMatch(/exceeds/);
    expect(validateCoinAmount('50.5', { available: '50.500000' })).toBeNull();
    expect(validateCoinAmount('10', { min: '1', max: '100000', available: '550' })).toBeNull();
  });

  test('bank details', () => {
    const ok = { accountName: 'Jane Doe', bankName: 'HDFC Bank', accountNumber: '12345678901', ifsc: 'hdfc0001234' };
    expect(validateBankDetails(ok)).toBeNull();
    expect(validateBankDetails({ ...ok, ifsc: 'HDFC1001234' })).toMatch(/IFSC/);
    expect(validateBankDetails({ ...ok, accountNumber: '1234' })).toMatch(/account number/);
    expect(validateBankDetails({ ...ok, accountName: ' ' })).toMatch(/holder/);
  });

  test('kyc and ticket', () => {
    expect(validateKyc({ fullName: 'Jo', idNumber: '1234', hasDocument: true })).toMatch(/Full name/);
    expect(validateKyc({ fullName: 'Jane Doe', idNumber: '12', hasDocument: true })).toMatch(/ID number/);
    expect(validateKyc({ fullName: 'Jane Doe', idNumber: '1234', hasDocument: false })).toMatch(/photo/);
    expect(validateKyc({ fullName: 'Jane Doe', idNumber: '1234', hasDocument: true })).toBeNull();
    expect(validateTicket({ subject: 'Help', message: 'x'.repeat(20) })).toMatch(/Subject/);
    expect(validateTicket({ subject: 'Need help', message: 'short' })).toMatch(/Message/);
    expect(validateTicket({ subject: 'Need help', message: 'x'.repeat(15) })).toBeNull();
  });
});
