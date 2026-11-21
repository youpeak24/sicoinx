import { firebaseProjectId } from './firebase';

/**
 * Minimal Firestore access for the signed-in user's own profile document (users/{uid}), the same document the
 * website reads for the account's name and role.
 *
 * It uses the Firestore REST API with the user's Firebase ID token rather than the full Firestore SDK: three small
 * calls, identical on Android, iOS and web, and no long-polling issues on mobile networks. The security rules in
 * firestore.rules still apply, so the app can only create a plain USER profile and edit display fields; it can never
 * choose or change a role.
 *
 * Every function is best-effort: it returns false instead of throwing, because the profile document must never
 * block sign-in or sign-up (the API remains the source of truth for money and roles).
 */

function documentUrl(uid: string): string | null {
  const projectId = firebaseProjectId();
  if (!projectId) return null;
  return `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${encodeURIComponent(uid)}`;
}

function collectionUrl(): string | null {
  const projectId = firebaseProjectId();
  if (!projectId) return null;
  return `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users`;
}

function authHeaders(idToken: string): Record<string, string> {
  return { Authorization: `Bearer ${idToken}`, 'Content-Type': 'application/json' };
}

/** Creates users/{uid} with role USER when it does not exist yet. Returns true if the document exists afterwards. */
export async function ensureUserProfile(
  user: { uid: string; email: string | null; displayName: string | null },
  idToken: string,
): Promise<boolean> {
  try {
    const url = documentUrl(user.uid);
    const create = collectionUrl();
    if (!url || !create) return false;

    const existing = await fetch(url, { headers: authHeaders(idToken) });
    if (existing.ok) return true;
    if (existing.status !== 404) return false;

    const email = (user.email ?? '').toLowerCase();
    const now = new Date().toISOString();
    const created = await fetch(`${create}?documentId=${encodeURIComponent(user.uid)}`, {
      method: 'POST',
      headers: authHeaders(idToken),
      body: JSON.stringify({
        fields: {
          id: { stringValue: user.uid },
          email: { stringValue: email },
          name: { stringValue: user.displayName || email.split('@')[0] || 'User' },
          role: { stringValue: 'USER' },
          isEmailVerified: { booleanValue: false },
          mfaEnabled: { booleanValue: false },
          avatarUrl: { nullValue: null },
          isBanned: { booleanValue: false },
          createdAt: { timestampValue: now },
          updatedAt: { timestampValue: now },
        },
      }),
    });
    return created.ok;
  } catch {
    return false;
  }
}

/** Updates only the display name (the rules allow owners to change name, avatarUrl and updatedAt). */
export async function saveProfileName(uid: string, name: string, idToken: string): Promise<boolean> {
  try {
    const url = documentUrl(uid);
    if (!url) return false;
    const response = await fetch(`${url}?updateMask.fieldPaths=name&updateMask.fieldPaths=updatedAt`, {
      method: 'PATCH',
      headers: authHeaders(idToken),
      body: JSON.stringify({
        fields: {
          name: { stringValue: name },
          updatedAt: { timestampValue: new Date().toISOString() },
        },
      }),
    });
    return response.ok;
  } catch {
    return false;
  }
}
