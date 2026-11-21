import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, getReactNativePersistence, initializeAuth, type Auth } from 'firebase/auth';
import { Platform } from 'react-native';

import { FIREBASE_NOT_CONFIGURED_MESSAGE, resolveFirebaseConfig } from '@/config';
import { secureStorage } from './secureStorage';

let cachedAuth: Auth | null = null;

export function isFirebaseConfigured(): boolean {
  return resolveFirebaseConfig() !== null;
}

/** Project id of the Firebase project (used by the Firestore REST helper). */
export function firebaseProjectId(): string | null {
  return resolveFirebaseConfig()?.projectId ?? null;
}

/**
 * The shared Firebase Auth instance (project "sicoinx", the same accounts as the website).
 *
 * - Android / iOS: the session is persisted in the OS keystore, so the user stays signed in across launches.
 * - Web preview: Firebase's default browser persistence (IndexedDB) is used.
 */
export function getFirebaseAuth(): Auth {
  if (cachedAuth) return cachedAuth;

  const config = resolveFirebaseConfig();
  if (!config) throw new Error(FIREBASE_NOT_CONFIGURED_MESSAGE);

  const app = getApps().length > 0 ? getApp() : initializeApp(config);

  if (Platform.OS === 'web') {
    cachedAuth = getAuth(app);
  } else {
    try {
      cachedAuth = initializeAuth(app, { persistence: getReactNativePersistence(secureStorage) });
    } catch {
      // Already initialised (fast refresh): reuse that instance.
      cachedAuth = getAuth(app);
    }
  }
  return cachedAuth;
}
