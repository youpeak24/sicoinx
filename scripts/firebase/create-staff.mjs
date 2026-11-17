#!/usr/bin/env node
/**
 * Creates (or updates) the SI Coin staff accounts in Firebase.
 *
 *  - Firebase Authentication: email + password user (email marked verified)
 *  - Firestore users/{uid}: the role document the web app and firestore.rules read
 *
 * Why a script: firestore.rules intentionally stop anyone choosing their own role, so staff roles can only be
 * written with an Admin credential (this script) or by editing the document in the Firebase console.
 *
 * Usage (from this folder):
 *   npm install
 *   node create-staff.mjs --dry-run                              # validate the credentials file only
 *   node create-staff.mjs ./serviceAccountKey.json               # create / update accounts
 *   node create-staff.mjs ./serviceAccountKey.json --reset-passwords   # also overwrite existing passwords
 *
 * The service account key comes from Firebase console > Project settings > Service accounts >
 * "Generate new private key". Keep it out of git (it is already ignored) and delete it afterwards.
 * Passwords are read from staff-credentials.local.json (gitignored) and are never printed.
 */
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const resetPasswords = args.includes('--reset-passwords');
const keyPath = args.find((a) => !a.startsWith('--')) || process.env.GOOGLE_APPLICATION_CREDENTIALS;

const ROLES = ['SUPER_ADMIN', 'FINANCE_MANAGER', 'CONTENT_EDITOR', 'SUPPORT_AGENT', 'READONLY_ANALYST'];

function fail(message) {
  console.error(`\nError: ${message}\n`);
  process.exit(1);
}

// ---- load and validate the credentials file ---------------------------------------------------
const credentialsFile = join(here, 'staff-credentials.local.json');
if (!existsSync(credentialsFile)) fail(`Missing ${credentialsFile}`);

let staff;
try {
  staff = JSON.parse(readFileSync(credentialsFile, 'utf8'));
} catch (e) {
  fail(`Could not parse staff-credentials.local.json: ${e.message}`);
}
if (!Array.isArray(staff) || staff.length === 0) fail('staff-credentials.local.json must be a non-empty array');

for (const s of staff) {
  if (!s.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.email)) fail(`Invalid email: ${s.email}`);
  if (!ROLES.includes(s.role)) fail(`Invalid role for ${s.email}: ${s.role}`);
  if (typeof s.password !== 'string' || s.password.length < 12) fail(`Password for ${s.email} must be at least 12 characters`);
}

console.log(`Staff accounts to provision (${staff.length}):`);
for (const s of staff) console.log(`  ${s.role.padEnd(16)} ${s.email}`);

if (dryRun) {
  console.log('\nDry run OK: credentials file is valid. Nothing was sent to Firebase.');
  process.exit(0);
}

// ---- talk to Firebase ---------------------------------------------------------------------------
if (!keyPath) fail('Pass the service account key path, e.g.  node create-staff.mjs ./serviceAccountKey.json');
const resolvedKey = resolve(keyPath);
if (!existsSync(resolvedKey)) fail(`Service account key not found: ${resolvedKey}`);

const { initializeApp, cert } = await import('firebase-admin/app');
const { getAuth } = await import('firebase-admin/auth');
const { getFirestore, FieldValue } = await import('firebase-admin/firestore');

const serviceAccount = JSON.parse(readFileSync(resolvedKey, 'utf8'));
initializeApp({ credential: cert(serviceAccount) });
const auth = getAuth();
const db = getFirestore();
console.log(`\nFirebase project: ${serviceAccount.project_id}`);

for (const s of staff) {
  const email = s.email.toLowerCase();
  let record;
  let action;
  try {
    record = await auth.getUserByEmail(email);
    action = 'exists';
    if (resetPasswords) {
      record = await auth.updateUser(record.uid, { password: s.password, emailVerified: true, disabled: false });
      action = 'password reset';
    }
  } catch (e) {
    if (e.code !== 'auth/user-not-found') throw e;
    record = await auth.createUser({
      email,
      password: s.password,
      displayName: s.name,
      emailVerified: true,
    });
    action = 'created';
  }

  // Role document: this is what the web app (loadProfile) and firestore.rules use.
  await db.doc(`users/${record.uid}`).set(
    {
      id: record.uid,
      email,
      name: s.name,
      role: s.role,
      isEmailVerified: true,
      mfaEnabled: false,
      avatarUrl: null,
      isBanned: false,
      updatedAt: FieldValue.serverTimestamp(),
      createdAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
  console.log(`  ${email.padEnd(22)} ${s.role.padEnd(16)} auth: ${action}, role document written`);
}

console.log('\nDone. Sign in at /login with these emails. Delete the service account key file now.');
if (!resetPasswords) {
  console.log('Existing accounts kept their current passwords (use --reset-passwords to overwrite them).');
}
