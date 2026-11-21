import Constants from 'expo-constants';
import { Platform } from 'react-native';

const API_PORT = 5000;
const API_SUFFIX = '/api/v1';

/** Accepts "http://host:5000" or "http://host:5000/api/v1" and returns the full API root. */
export function normalizeApiUrl(raw: string): string {
  const trimmed = raw.trim().replace(/\/+$/, '');
  return trimmed.endsWith(API_SUFFIX) ? trimmed : `${trimmed}${API_SUFFIX}`;
}

/**
 * In development, the API is assumed to run on the same machine that serves Metro,
 * so a physical phone on the same Wi-Fi reaches it without any configuration.
 */
function developmentHost(): string | null {
  const hostUri = Constants.expoConfig?.hostUri;
  if (!hostUri) return null;
  const host = hostUri.split(':')[0];
  // Tunnel hosts (exp.direct, ngrok) only forward the Metro port, not the API port.
  if (!host || /\.(exp\.direct|ngrok[\w.-]*|expo\.dev)$/i.test(host)) return null;
  return host;
}

/** Resolves the API root URL, or null when the app has not been configured (release builds). */
export function resolveApiBaseUrl(): string | null {
  const configured = process.env.EXPO_PUBLIC_API_URL;
  if (configured && configured.trim()) return normalizeApiUrl(configured);

  if (__DEV__) {
    const host = developmentHost() ?? (Platform.OS === 'android' ? '10.0.2.2' : 'localhost');
    return `http://${host}:${API_PORT}${API_SUFFIX}`;
  }
  return null;
}

export const REQUEST_TIMEOUT_MS = 20000;

// ─── Firebase ────────────────────────────────────────────────────────────────

export interface FirebaseWebConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  appId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
}

/**
 * The Firebase web config of project "sicoinx" (the same project the website uses). These are public client
 * identifiers, supplied through EXPO_PUBLIC_FIREBASE_* (see .env.example). Each variable must be referenced
 * literally so Expo can inline it into the bundle.
 */
export function resolveFirebaseConfig(): FirebaseWebConfig | null {
  const apiKey = process.env.EXPO_PUBLIC_FIREBASE_API_KEY?.trim();
  const authDomain = process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN?.trim();
  const projectId = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID?.trim();
  if (!apiKey || !authDomain || !projectId) return null;
  return {
    apiKey,
    authDomain,
    projectId,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID?.trim() || undefined,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim() || undefined,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID?.trim() || undefined,
  };
}

export const FIREBASE_NOT_CONFIGURED_MESSAGE =
  'Firebase is not configured for this build. Set the EXPO_PUBLIC_FIREBASE_* variables and restart.';

// ─── Website links ───────────────────────────────────────────────────────────

/** Public website, used for legal pages and help links. */
export const WEB_URL = (process.env.EXPO_PUBLIC_WEB_URL?.trim() || 'https://www.sicoinx.com').replace(/\/+$/, '');
