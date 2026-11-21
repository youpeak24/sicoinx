import jwt from 'jsonwebtoken';

/**
 * Verification of Firebase Authentication ID tokens, without a service-account key.
 *
 * Firebase signs ID tokens (RS256) with Google's rotating keys, published as X.509 certificates. We verify the
 * signature against those certificates and check issuer, audience and expiry exactly as Google documents:
 *   https://firebase.google.com/docs/auth/admin/verify-id-tokens#verify_id_tokens_using_a_third-party_jwt_library
 */

const CERTS_URL = 'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';

export interface FirebaseClaims {
  uid: string;
  email: string | null;
  emailVerified: boolean;
  name: string | null;
}

export function getFirebaseProjectId(): string {
  return process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID || 'sicoinx';
}

/** True when the (unverified) token claims to be issued by this project's Firebase Auth. */
export function looksLikeFirebaseToken(token: string): boolean {
  try {
    const payload = jwt.decode(token);
    return (
      typeof payload === 'object' &&
      payload !== null &&
      payload.iss === `https://securetoken.google.com/${getFirebaseProjectId()}`
    );
  } catch {
    return false;
  }
}

let certCache: { certs: Record<string, string>; expiresAt: number } | null = null;

async function getCerts(forceRefresh = false): Promise<Record<string, string>> {
  if (!forceRefresh && certCache && certCache.expiresAt > Date.now()) return certCache.certs;

  const res = await fetch(CERTS_URL);
  if (!res.ok) throw new Error(`Could not fetch Firebase signing certificates (HTTP ${res.status})`);
  const certs = (await res.json()) as Record<string, string>;

  const maxAge = /max-age=(\d+)/.exec(res.headers.get('cache-control') || '')?.[1];
  certCache = { certs, expiresAt: Date.now() + (maxAge ? Number(maxAge) * 1000 : 3_600_000) };
  return certs;
}

/** Returns the verified claims, or null if the token is not a valid, unexpired token for this Firebase project. */
export async function verifyFirebaseIdToken(token: string): Promise<FirebaseClaims | null> {
  try {
    const decoded = jwt.decode(token, { complete: true });
    const kid = decoded && typeof decoded === 'object' ? decoded.header?.kid : undefined;
    if (!kid || decoded?.header?.alg !== 'RS256') return null;

    let certs = await getCerts();
    if (!certs[kid]) certs = await getCerts(true); // keys rotate: refresh once before rejecting
    const cert = certs[kid];
    if (!cert) return null;

    const projectId = getFirebaseProjectId();
    const payload = jwt.verify(token, cert, {
      algorithms: ['RS256'],
      audience: projectId,
      issuer: `https://securetoken.google.com/${projectId}`,
    }) as jwt.JwtPayload;

    if (!payload.sub || typeof payload.sub !== 'string') return null;

    return {
      uid: payload.sub,
      email: typeof payload.email === 'string' ? payload.email.toLowerCase() : null,
      emailVerified: payload.email_verified === true,
      name: typeof payload.name === 'string' ? payload.name : null,
    };
  } catch {
    return null;
  }
}
