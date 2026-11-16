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

let authToken: string | null = null;
let unauthorizedHandler: (() => void) | null = null;

export function setAuthToken(token: string | null): void {
  authToken = token;
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
  /** Attach the session token. Defaults to true. */
  auth?: boolean;
  signal?: AbortSignal;
}

/**
 * Performs a request and returns the parsed JSON envelope ({ success, data, ... }).
 * Throws ApiError for network failures, timeouts, non-2xx responses and non-JSON bodies.
 */
export async function requestEnvelope(path: string, options: RequestOptions = {}): Promise<any> {
  const base = resolveApiBaseUrl();
  if (!base) throw new ApiError(NOT_CONFIGURED_MESSAGE, 'NOT_CONFIGURED');

  const { method = 'GET', body, auth = true, signal } = options;
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const sentToken = auth ? authToken : null;
  if (sentToken) headers.Authorization = `Bearer ${sentToken}`;

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
    response = await fetch(`${base}${path}`, {
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

  const data = await readBody(response);

  if (!response.ok) {
    const code: string = data?.error?.code || `HTTP_${response.status}`;
    const message = errorMessageFrom(data?.error, response.statusText || 'Something went wrong.');
    // A rejected session on a request that carried a token means the session is gone.
    if (sentToken && sentToken === authToken && response.status === 401) {
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
