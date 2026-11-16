import { ApiError, request, requestEnvelope, setAuthToken, setUnauthorizedHandler } from '@/api/client';
import { login } from '@/api/services';
import { normalizeApiUrl } from '@/config';

const BASE = 'http://api.test:5000/api/v1';

function respond(status: number, body: string, ok = status >= 200 && status < 300) {
  return Promise.resolve({
    ok,
    status,
    statusText: 'status',
    text: () => Promise.resolve(body),
  } as unknown as Response);
}

describe('api client', () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    process.env.EXPO_PUBLIC_API_URL = 'http://api.test:5000';
    (globalThis as any).fetch = fetchMock;
    fetchMock.mockReset();
    setAuthToken(null);
    setUnauthorizedHandler(null);
  });

  test('normalizeApiUrl appends /api/v1 exactly once', () => {
    expect(normalizeApiUrl('http://h:5000')).toBe('http://h:5000/api/v1');
    expect(normalizeApiUrl('http://h:5000/')).toBe('http://h:5000/api/v1');
    expect(normalizeApiUrl('http://h:5000/api/v1/')).toBe('http://h:5000/api/v1');
  });

  test('sends the bearer token and unwraps data', async () => {
    setAuthToken('tok');
    fetchMock.mockReturnValue(respond(200, JSON.stringify({ success: true, data: { hello: 'world' } })));
    await expect(request('/wallet')).resolves.toEqual({ hello: 'world' });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(`${BASE}/wallet`);
    expect(init.headers.Authorization).toBe('Bearer tok');
  });

  test('does not send the token when auth is false', async () => {
    setAuthToken('tok');
    fetchMock.mockReturnValue(respond(200, JSON.stringify({ success: true, data: {} })));
    await request('/trade/rates', { auth: false });
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBeUndefined();
  });

  test('surfaces validation details from the API', async () => {
    fetchMock.mockReturnValue(
      respond(
        400,
        JSON.stringify({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request input data',
            details: [{ field: 'password', message: 'Password must contain at least one number' }],
          },
        }),
      ),
    );
    await expect(request('/auth/register', { method: 'POST', body: {}, auth: false })).rejects.toMatchObject({
      code: 'VALIDATION_ERROR',
      status: 400,
      message: 'Password must contain at least one number',
    });
  });

  test('non-JSON error pages become a readable API_UNREACHABLE error', async () => {
    fetchMock.mockReturnValue(respond(502, '<html>Bad gateway</html>'));
    await expect(request('/wallet')).rejects.toMatchObject({ code: 'API_UNREACHABLE', status: 502 });
  });

  test('a 2xx non-JSON body (SPA fallback) is treated as unreachable, not parsed', async () => {
    fetchMock.mockReturnValue(respond(200, '<!doctype html><html></html>'));
    await expect(request('/wallet')).rejects.toMatchObject({ code: 'API_UNREACHABLE' });
  });

  test('network failures map to NETWORK', async () => {
    fetchMock.mockRejectedValue(new TypeError('Network request failed'));
    await expect(request('/wallet')).rejects.toMatchObject({ code: 'NETWORK' });
  });

  test('401 on an authenticated request notifies the unauthorized handler', async () => {
    const handler = jest.fn();
    setUnauthorizedHandler(handler);
    setAuthToken('expired');
    fetchMock.mockReturnValue(
      respond(401, JSON.stringify({ success: false, error: { code: 'SESSION_EXPIRED', message: 'expired' } })),
    );
    await expect(request('/wallet')).rejects.toBeInstanceOf(ApiError);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  test('a wrong-password 401 on login does not trigger the handler', async () => {
    const handler = jest.fn();
    setUnauthorizedHandler(handler);
    setAuthToken('some-token');
    fetchMock.mockReturnValue(
      respond(401, JSON.stringify({ success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password combination.' } })),
    );
    await expect(login('a@b.co', 'Password1')).rejects.toMatchObject({ code: 'INVALID_CREDENTIALS' });
    expect(handler).not.toHaveBeenCalled();
  });

  test('login reports the MFA step instead of crashing on a token-less response', async () => {
    fetchMock.mockReturnValue(respond(200, JSON.stringify({ success: true, requireMfa: true, message: 'code' })));
    await expect(login('a@b.co', 'Password1')).resolves.toEqual({ kind: 'mfa' });
  });

  test('login returns token and user', async () => {
    const user = { id: '1', email: 'a@b.co', name: 'A', role: 'USER', isEmailVerified: true, mfaEnabled: false };
    fetchMock.mockReturnValue(respond(200, JSON.stringify({ success: true, data: { token: 't', user } })));
    await expect(login('a@b.co', 'Password1')).resolves.toEqual({ kind: 'success', token: 't', user });
  });

  test('requestEnvelope returns the whole envelope', async () => {
    fetchMock.mockReturnValue(respond(200, JSON.stringify({ success: true, data: 1, message: 'm' })));
    await expect(requestEnvelope('/x')).resolves.toMatchObject({ message: 'm' });
  });
});
