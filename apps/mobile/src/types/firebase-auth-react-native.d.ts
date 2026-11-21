import type { Persistence } from 'firebase/auth';

/**
 * Firebase ships `getReactNativePersistence` in its React Native bundle (Metro resolves it through the
 * "react-native" export condition), but the default TypeScript entry point does not declare it. This is the
 * documented workaround: declare the function so strict type-checking passes.
 */
declare module 'firebase/auth' {
  export function getReactNativePersistence(storage: {
    getItem(key: string): Promise<string | null>;
    setItem(key: string, value: string): Promise<void>;
    removeItem(key: string): Promise<void>;
  }): Persistence;
}
