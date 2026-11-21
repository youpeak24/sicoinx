/** Friendly messages for Firebase Authentication error codes. */
const MESSAGES: Record<string, string> = {
  'auth/invalid-credential': 'Invalid email or password.',
  'auth/invalid-login-credentials': 'Invalid email or password.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/user-not-found': 'Invalid email or password.',
  'auth/wrong-password': 'Invalid email or password.',
  'auth/missing-password': 'Please enter your password.',
  'auth/user-disabled': 'This account has been disabled. Contact support for help.',
  'auth/email-already-in-use': 'An account with this email address already exists. Try signing in instead.',
  'auth/weak-password': 'That password is too weak. Use at least 8 characters with an uppercase letter and a number.',
  'auth/too-many-requests': 'Too many attempts. Please wait a few minutes and try again.',
  'auth/network-request-failed': 'Network error. Check your internet connection and try again.',
  'auth/requires-recent-login': 'For your security, please enter your current password again.',
  'auth/operation-not-allowed': 'Email and password sign-in is not enabled for this project.',
  'auth/user-token-expired': 'Your session has expired. Please sign in again.',
  'auth/invalid-api-key': 'Firebase is misconfigured for this build (invalid API key).',
  'auth/api-key-not-valid.-please-pass-a-valid-api-key.': 'Firebase is misconfigured for this build (invalid API key).',
  'auth/internal-error': 'Something went wrong on the server. Please try again.',
};

export function firebaseErrorCode(error: unknown): string {
  const code = (error as { code?: unknown } | null)?.code;
  return typeof code === 'string' ? code : 'unknown';
}

/** Message for any thrown value; Firebase errors are translated, others pass their own message through. */
export function firebaseErrorMessage(error: unknown, fallback: string): string {
  const code = firebaseErrorCode(error);
  const known = MESSAGES[code];
  if (known) return known;
  // Never show raw "Firebase: Error (auth/...)" text to a customer.
  return fallback;
}
