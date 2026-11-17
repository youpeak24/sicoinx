import { Platform } from 'react-native';

/**
 * Firebase Analytics wrapper.
 *
 * - Never throws and never blocks the UI. Expo Go and web have no native Firebase module,
 *   so every call silently becomes a no-op there (use a development build to see events).
 * - Privacy: only send non-identifying data. No emails, names, bank details or document data.
 *   The user id is the opaque server-side UUID.
 */

type Params = Record<string, string | number | boolean>;

interface FirebaseAnalytics {
  instance: unknown;
  logEvent: (instance: unknown, name: string, params?: Params) => Promise<void>;
  setUserId: (instance: unknown, id: string | null) => Promise<void>;
}

let cached: FirebaseAnalytics | null | undefined;

function load(): FirebaseAnalytics | null {
  if (cached !== undefined) return cached;
  cached = null;
  if (Platform.OS === 'web') return cached;
  try {
    // Loaded lazily so a missing native module cannot crash app start-up.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('@react-native-firebase/analytics');
    cached = { instance: mod.getAnalytics(), logEvent: mod.logEvent, setUserId: mod.setUserId };
  } catch {
    cached = null;
  }
  return cached;
}

function safely(run: (fb: FirebaseAnalytics) => Promise<void>): void {
  try {
    const fb = load();
    if (fb) run(fb).catch(() => undefined);
  } catch {
    // Analytics must never affect the app.
  }
}

export function track(name: string, params?: Params): void {
  safely((fb) => fb.logEvent(fb.instance, name, params));
}

export function trackScreen(screenName: string): void {
  track('screen_view', { screen_name: screenName, screen_class: screenName });
}

/** Pass the opaque user id after sign-in, and null after sign-out. */
export function identify(userId: string | null): void {
  safely((fb) => fb.setUserId(fb.instance, userId));
}

/** Test hook: forget the cached module. */
export function __resetAnalyticsForTests(): void {
  cached = undefined;
}
