import * as SecureStore from 'expo-secure-store';

/**
 * Key/value storage for the Firebase Auth session on Android and iOS, backed by the OS keystore.
 *
 * Why this exists: Firebase persists the signed-in user as one JSON string (several KB with the tokens), but
 * SecureStore keys may only contain [A-Za-z0-9._-] and values are limited to ~2 KB. Firebase's own keys look like
 * "firebase:authUser:<apiKey>:[DEFAULT]", so keys are sanitised and values are stored in fixed-size chunks.
 *
 * The shape (getItem / setItem / removeItem) is what Firebase's getReactNativePersistence() expects, so no
 * extra native module such as AsyncStorage is required.
 */

const CHUNK_SIZE = 1800;
const COUNT_SUFFIX = '.n';

export function toStoreKey(key: string): string {
  return `fb.${key.replace(/[^A-Za-z0-9._-]/g, '_')}`;
}

async function readCount(base: string): Promise<number> {
  const raw = await SecureStore.getItemAsync(base + COUNT_SUFFIX);
  const count = raw === null ? 0 : Number.parseInt(raw, 10);
  return Number.isFinite(count) && count > 0 ? count : 0;
}

export const secureStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      const base = toStoreKey(key);
      const count = await readCount(base);
      if (count === 0) return null;
      const parts: string[] = [];
      for (let i = 0; i < count; i += 1) {
        const part = await SecureStore.getItemAsync(`${base}.${i}`);
        if (part === null) return null; // incomplete write: treat as signed out
        parts.push(part);
      }
      return parts.join('');
    } catch {
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      const base = toStoreKey(key);
      const previous = await readCount(base);
      const chunks: string[] = [];
      for (let i = 0; i < value.length; i += CHUNK_SIZE) chunks.push(value.slice(i, i + CHUNK_SIZE));

      for (let i = 0; i < chunks.length; i += 1) await SecureStore.setItemAsync(`${base}.${i}`, chunks[i]!);
      await SecureStore.setItemAsync(base + COUNT_SUFFIX, String(chunks.length));
      // Drop leftovers from a previously longer value.
      for (let i = chunks.length; i < previous; i += 1) await SecureStore.deleteItemAsync(`${base}.${i}`);
    } catch {
      // Secure storage can be unavailable (e.g. no lock screen on some emulators); the in-memory
      // session still works for this launch.
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      const base = toStoreKey(key);
      const count = await readCount(base);
      for (let i = 0; i < count; i += 1) await SecureStore.deleteItemAsync(`${base}.${i}`);
      await SecureStore.deleteItemAsync(base + COUNT_SUFFIX);
    } catch {
      // Nothing to clean up.
    }
  },
};
