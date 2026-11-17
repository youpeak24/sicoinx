import { auth } from './firebase';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
    requestId?: string;
  };
  message?: string;
  requireMfa?: boolean;
}

export class ApiError extends Error {
  code: string;
  details?: any;
  status: number;

  constructor(message: string, code: string = 'ERROR', status: number = 400, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

const BASE_URL = '/api/v1';

export const API_UNREACHABLE_MESSAGE =
  'Cannot reach the SI Coin API server. Please make sure the backend is running and deployed, then try again.';

/**
 * Reads a response body without ever throwing on non-JSON content.
 * Hosting platforms / proxies return plain-text or HTML error pages when the
 * API is down or misrouted — surface that as a readable error instead of a
 * JSON parse crash.
 */
export async function parseBody(response: Response): Promise<any> {
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

export async function request<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
  
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  // Identify the signed-in Firebase user to any API that accepts ID tokens.
  try {
    const token = await auth.currentUser?.getIdToken();
    if (token && !headers.has('Authorization')) headers.set('Authorization', `Bearer ${token}`);
  } catch {
    // Unauthenticated request
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // Includes session cookie
  });

  const data = await parseBody(response);

  if (!response.ok) {
    const errorMsg = data?.error?.message || response.statusText || 'An error occurred';
    const errorCode = data?.error?.code || `HTTP_${response.status}`;
    throw new ApiError(errorMsg, errorCode, response.status, data?.error?.details);
  }

  // A 2xx response that isn't JSON means the request never reached the API
  // (e.g. SPA fallback HTML, a placeholder rewrite or a login wall).
  if (typeof data === 'string') {
    throw new ApiError(API_UNREACHABLE_MESSAGE, 'API_UNREACHABLE', response.status);
  }

  return (data?.data !== undefined ? data.data : data) as T;
}

export const api = {
  get: <T = any>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: 'GET' }),
  post: <T = any>(endpoint: string, body?: any, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  put: <T = any>(endpoint: string, body?: any, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  patch: <T = any>(endpoint: string, body?: any, options?: RequestInit) =>
    request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  delete: <T = any>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),
};
