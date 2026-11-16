// Replaces src/config.ts in the E2E run: no Expo/React Native imports in plain Node.
export const REQUEST_TIMEOUT_MS = 20000;
export function resolveApiBaseUrl(): string {
  const root = (process.env.E2E_API_URL ?? 'http://localhost:5000').replace(/\/+$/, '');
  return `${root}/api/v1`;
}
