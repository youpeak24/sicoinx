import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secure-jwt-secret-key-si-coin-2026-production';

export async function hashPassword(plainText: string): Promise<string> {
  return await bcrypt.hash(plainText, 12);
}

export async function verifyPassword(plainText: string, hashed: string): Promise<boolean> {
  return await bcrypt.compare(plainText, hashed);
}

export function generateJwtToken(payload: { userId: string; email: string; role: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyJwtToken(token: string): { userId: string; email: string; role: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; email: string; role: string };
  } catch {
    return null;
  }
}

export function generateRandomToken(bytes: number = 32): string {
  return crypto.randomBytes(bytes).toString('hex');
}

export function generateTotpSecret(email: string) {
  const secret = speakeasy.generateSecret({
    name: `SI Coin Platform (${email})`,
    length: 20,
    issuer: 'SI Coin',
  });
  return {
    base32: secret.base32,
    otpauth_url: secret.otpauth_url,
  };
}

export async function generateQrCodeDataUrl(otpauthUrl: string): Promise<string> {
  return await QRCode.toDataURL(otpauthUrl);
}

export function verifyTotpToken(secretBase32: string, token: string): boolean {
  return speakeasy.totp.verify({
    secret: secretBase32,
    encoding: 'base32',
    token: token.trim(),
    window: 2, // Allow +/- 1 step of time drift
  });
}
