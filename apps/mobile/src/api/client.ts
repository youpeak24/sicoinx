import { REQUEST_TIMEOUT_MS, resolveApiBaseUrl } from '@/config';

export class ApiError extends Error {
  code: string;
  status: number;
  details?: unknown;

  constructor(message: string, code = 'ERROR', status = 0, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export const NETWORK_ERROR_MESSAGE =
  'Cannot reach the SI Coin server. Check your internet connection and try again.';
export const API_UNREACHABLE_MESSAGE =
  'The SI Coin API returned an unexpected response. Please make sure the server is running and try again.';
export const NOT_CONFIGURED_MESSAGE =
  'This build has no API server configured. Set EXPO_PUBLIC_API_URL and rebuild the app.';

/**
 * Supplies the credential for each request. The app registers a provider that returns a fresh Firebase ID token
 * (the Firebase SDK refreshes it automatically when it is about to expire). `forceRefresh` asks for a brand-new
 * token after the server rejected the previous one.
 */
export type TokenProvider = (forceRefresh?: boolean) => Promise<string | null>;

let tokenProvider: TokenProvider | null = null;
let tokenProviderRefreshable = false;
/** Bumped whenever the provider changes, so a late 401 from a previous session is ignored. */
let providerVersion = 0;
let unauthorizedHandler: (() => void) | null = null;

export function setTokenProvider(provider: TokenProvider | null, options: { refreshable?: boolean } = {}): void {
  tokenProvider = provider;
  tokenProviderRefreshable = Boolean(provider && options.refreshable);
  providerVersion += 1;
}

/** A fixed bearer token (API session token). Used by tests and the legacy API-session login. */
export function setAuthToken(token: string | null): void {
  setTokenProvider(token ? async () => token : null);
}

/** Called when an authenticated request is rejected because the session is no longer valid. */
export function setUnauthorizedHandler(handler: (() => void) | null): void {
  unauthorizedHandler = handler;
}

/** Reads a response body without ever throwing on non-JSON content (proxies return HTML/plain text). */
async function readBody(response: Response): Promise<any> {
  const text = await response.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    if (!response.ok) {
      throw new ApiError(API_UNREACHABLE_MESSAGE, 'API_UNREACHABLE', response.status);
    }
    return text;
  }
}

/** Builds the most helpful message from an error envelope, including field validation details. */
export function errorMessageFrom(error: any, fallback: string): string {
  if (!error) return fallback;
  if (Array.isArray(error.details) && error.details.length > 0) {
    const messages = error.details
      .map((d: any) => (typeof d?.message === 'string' ? d.message : null))
      .filter(Boolean)
      .slice(0, 3);
    if (messages.length > 0) return messages.join('\n');
  }
  return typeof error.message === 'string' && error.message ? error.message : fallback;
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  /** Attach the credential from the token provider. Defaults to true. */
  auth?: boolean;
  signal?: AbortSignal;
}

/** One HTTP round trip with timeout, cancellation and safe body parsing. */
async function send(
  url: string,
  method: string,
  headers: Record<string, string>,
  body: unknown,
  signal?: AbortSignal,
): Promise<{ response: Response; data: any }> {
  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, REQUEST_TIMEOUT_MS);
  const onCallerAbort = () => controller.abort();
  signal?.addEventListener('abort', onCallerAbort);

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });
  } catch {
    if (signal?.aborted) throw new ApiError('Request cancelled.', 'CANCELLED');
    if (timedOut) {
      throw new ApiError('The server took too long to respond. Please try again.', 'TIMEOUT');
    }
    throw new ApiError(NETWORK_ERROR_MESSAGE, 'NETWORK');
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', onCallerAbort);
  }

  return { response, data: await readBody(response) };
}

/**
 * Performs a request and returns the parsed JSON envelope ({ success, data, ... }).
 * Throws ApiError for network failures, timeouts, non-2xx responses and non-JSON bodies.
 *
 * A 401 on a request that carried a credential is retried once with a force-refreshed Firebase token before the
 * session is declared dead.
 */
export async function requestEnvelope(path: string, options: RequestOptions = {}): Promise<any> {
  const base = resolveApiBaseUrl();
  if (!base) throw new ApiError(NOT_CONFIGURED_MESSAGE, 'NOT_CONFIGURED');

  const { method = 'GET', body, auth = true, signal } = options;
  const versionAtStart = providerVersion;
  const provider = auth ? tokenProvider : null;
  const refreshable = tokenProviderRefreshable;

  let forceRefresh = false;
  let sentToken: string | null = null;
  let result: { response: Response; data: any };

  for (let attempt = 0; ; attempt += 1) {
    sentToken = null;
    if (provider) {
      try {
        sentToken = await provider(forceRefresh);
      } catch {
        throw new ApiError(NETWORK_ERROR_MESSAGE, 'NETWORK');
      }
    }

    const headers: Record<string, string> = { Accept: 'application/json' };
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    if (sentToken) headers.Authorization = `Bearer ${sentToken}`;

    result = await send(`${base}${path}`, method, headers, body, signal);

    if (result.response.status === 401 && sentToken && refreshable && attempt === 0) {
      forceRefresh = true;
      continue;
    }
    break;
  }

  const { response, data } = result;

  if (!response.ok) {
    const code: string = data?.error?.code || `HTTP_${response.status}`;
    const message = errorMessageFrom(data?.error, response.statusText || 'Something went wrong.');
    // A rejected credential on a request that carried one means the session is gone.
    if (sentToken && versionAtStart === providerVersion && response.status === 401) {
      unauthorizedHandler?.();
    }
    throw new ApiError(message, code, response.status, data?.error?.details);
  }

  // A 2xx that is not JSON never reached the API (SPA fallback HTML, placeholder rewrite, login wall).
  if (typeof data === 'string' || data === undefined) {
    throw new ApiError(API_UNREACHABLE_MESSAGE, 'API_UNREACHABLE', response.status);
  }
  return data;
}

/** Like requestEnvelope but returns only the `data` payload. */
export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const envelope = await requestEnvelope(path, options);
  if (envelope && envelope.success === false) {
    throw new ApiError(
      errorMessageFrom(envelope.error, 'Request failed.'),
      envelope.error?.code || 'REQUEST_FAILED',
    );
  }
  return (envelope?.data !== undefined ? envelope.data : envelope) as T;
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/** Message suitable for showing to the user for any thrown value. */
export function messageOf(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
