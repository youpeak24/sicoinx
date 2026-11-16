import { isPositiveAmount, toDecimal } from './money';

/**
 * Client-side validation mirrors the rules in packages/shared/src/schemas.ts so users
 * get instant feedback. The server remains the source of truth. Every function
 * returns an error message, or null when the value is acceptable.
 */

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const IFSC = /^[A-Z]{4}0[A-Z0-9]{6}$/;

export function validateEmail(email: string): string | null {
  if (!email.trim()) return 'Email is required.';
  return EMAIL.test(email.trim()) ? null : 'Please enter a valid email address.';
}

export function validateLoginPassword(password: string): string | null {
  if (!password) return 'Password is required.';
  return password.length >= 8 ? null : 'Password must be at least 8 characters.';
}

export function validateNewPassword(password: string): string | null {
  if (password.length < 8) return 'Password must be at least 8 characters.';
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter.';
  if (!/[0-9]/.test(password)) return 'Password must contain at least one number.';
  return null;
}

export function validateName(name: string, min = 2, max = 60): string | null {
  const trimmed = name.trim();
  if (trimmed.length < min) return `Name must be at least ${min} characters.`;
  if (trimmed.length > max) return `Name must be at most ${max} characters.`;
  return null;
}

export interface AmountLimits {
  min?: string;
  max?: string;
  /** Spendable balance. Amounts above it are rejected. */
  available?: string;
}

export function validateCoinAmount(amount: string, limits: AmountLimits = {}): string | null {
  const text = amount.trim();
  if (!text) return 'Enter a coin amount.';
  if (!isPositiveAmount(text)) return 'Enter a valid amount greater than zero.';
  const value = toDecimal(text)!;
  const min = toDecimal(limits.min);
  const max = toDecimal(limits.max);
  const available = toDecimal(limits.available);
  if (min && value.lt(min)) return `Minimum amount is ${min.toString()} SI.`;
  if (max && value.gt(max)) return `Maximum amount is ${max.toString()} SI.`;
  if (available && value.gt(available)) return 'Amount exceeds your available balance.';
  return null;
}

export interface BankDetails {
  accountName: string;
  bankName: string;
  accountNumber: string;
  ifsc: string;
}

export function validateBankDetails(b: BankDetails): string | null {
  if (b.accountName.trim().length < 2) return 'Account holder name is required.';
  if (b.bankName.trim().length < 2) return 'Bank name is required.';
  if (!/^\d{8,20}$/.test(b.accountNumber.trim())) return 'Enter a valid account number (8–20 digits).';
  if (!IFSC.test(b.ifsc.trim().toUpperCase())) {
    return 'Enter a valid 11-character IFSC code (e.g. HDFC0001234).';
  }
  return null;
}

export function validateRecipient(recipient: string): string | null {
  return recipient.trim().length >= 3 ? null : 'Enter the recipient email, wallet ID or username.';
}

export function validateNote(note: string): string | null {
  return note.length <= 200 ? null : 'Note must be 200 characters or fewer.';
}

export function validateKyc(input: { fullName: string; idNumber: string; hasDocument: boolean }): string | null {
  if (input.fullName.trim().length < 3) return 'Full name must be at least 3 characters.';
  if (input.idNumber.trim().length < 4) return 'ID number must be at least 4 characters.';
  if (!input.hasDocument) return 'Attach a photo of your identity document.';
  return null;
}

export function validateTicket(input: { subject: string; message: string }): string | null {
  if (input.subject.trim().length < 5) return 'Subject must be at least 5 characters.';
  if (input.message.trim().length < 15) return 'Message must be at least 15 characters.';
  return null;
}

export function validateReply(content: string): string | null {
  return content.trim().length >= 2 ? null : 'Message cannot be empty.';
}
