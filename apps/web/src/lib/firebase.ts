import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Web config comes from Vite env vars (see apps/web/.env.example).
// The web API key identifies the project; access is enforced by Firebase
// Auth + Firestore security rules (see /firestore.rules), not by hiding it.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

if (!isFirebaseConfigured && typeof console !== 'undefined') {
  console.warn(
    'Firebase is not configured: set the VITE_FIREBASE_* variables (see apps/web/.env.example) in .env or in the ' +
      'Vercel project settings, then rebuild. Public pages still work; sign-in is disabled.',
  );
}

// getAuth() throws "auth/invalid-api-key" at import time when the key is missing, which would stop the whole
// app from mounting. Without a config we initialise with inert placeholders instead: every auth/Firestore code
// path is already gated on isFirebaseConfigured, so nothing is ever sent to Firebase in that state.
export const app = getApps().length
  ? getApp()
  : initializeApp(
      isFirebaseConfigured
        ? firebaseConfig
        : { ...firebaseConfig, apiKey: 'not-configured', projectId: 'not-configured', appId: 'not-configured' },
    );
export const auth = getAuth(app);
export const db = getFirestore(app);

// Analytics only works in supported browser environments.
if (isFirebaseConfigured && firebaseConfig.measurementId && typeof window !== 'undefined') {
  isSupported()
    .then((ok) => {
      if (ok) getAnalytics(app);
    })
    .catch(() => {});
}
