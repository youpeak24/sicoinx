import * as SecureStore from 'expo-secure-store';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';

import { isApiError, setAuthToken, setUnauthorizedHandler } from '@/api/client';
import { fetchCurrentUser, logout as apiLogout } from '@/api/services';
import type { User } from '@/api/types';

const TOKEN_KEY = 'sicoinx_session_token';

export type SessionStatus =
  /** Restoring a saved session at launch. */
  | 'loading'
  | 'signedOut'
  | 'signedIn'
  /** A saved session exists but the server could not be reached to validate it. */
  | 'unreachable';

interface SessionContextValue {
  status: SessionStatus;
  user: User | null;
  /** One-time message for the sign-in screen (e.g. "session expired"). */
  notice: string | null;
  clearNotice: () => void;
  signIn: (token: string, user: User) => Promise<void>;
  signOut: () => Promise<void>;
  /** Re-validate a saved session after an `unreachable` result. */
  retry: () => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

async function readToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    return null;
  }
}

async function writeToken(token: string | null): Promise<void> {
  try {
    if (token) await SecureStore.setItemAsync(TOKEN_KEY, token);
    else await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch {
    // Secure storage can be unavailable (e.g. no lock screen on some emulators);
    // the in-memory session still works for this launch.
  }
}

export function SessionProvider({ children }: PropsWithChildren) {
  const [status, setStatus] = useState<SessionStatus>('loading');
  const [user, setUser] = useState<User | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [bootAttempt, setBootAttempt] = useState(0);
  const signedIn = useRef(false);

  const endSession = useCallback(async (message?: string) => {
    signedIn.current = false;
    setAuthToken(null);
    setUser(null);
    setNotice(message ?? null);
    setStatus('signedOut');
    await writeToken(null);
  }, []);

  // Restore the saved session at launch (and again when the user taps "Try again").
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const token = await readToken();
      if (cancelled) return;
      if (!token) {
        setStatus('signedOut');
        return;
      }
      setAuthToken(token);
      try {
        const me = await fetchCurrentUser();
        if (cancelled) return;
        signedIn.current = true;
        setUser(me);
        setStatus('signedIn');
      } catch (error) {
        if (cancelled) return;
        if (isApiError(error) && (error.status === 401 || error.status === 403)) {
          await endSession(
            error.status === 403 ? error.message : 'Your session has expired. Please sign in again.',
          );
        } else {
          setStatus('unreachable');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [bootAttempt, endSession]);

  // The API client reports sessions the server no longer accepts.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      if (signedIn.current) void endSession('Your session has expired. Please sign in again.');
    });
    return () => setUnauthorizedHandler(null);
  }, [endSession]);

  const signIn = useCallback(async (token: string, nextUser: User) => {
    setAuthToken(token);
    await writeToken(token);
    signedIn.current = true;
    setNotice(null);
    setUser(nextUser);
    setStatus('signedIn');
  }, []);

  const signOut = useCallback(async () => {
    // Revoke the session on the server first (best effort), then forget it locally.
    // Clearing the flag first stops a 401 from this call showing "session expired".
    signedIn.current = false;
    try {
      await apiLogout();
    } catch {
      // Offline or already expired: the local sign-out below still completes.
    }
    await endSession();
  }, [endSession]);

  const retry = useCallback(() => {
    setStatus('loading');
    setBootAttempt((n) => n + 1);
  }, []);

  const clearNotice = useCallback(() => setNotice(null), []);

  const value = useMemo<SessionContextValue>(
    () => ({ status, user, notice, clearNotice, signIn, signOut, retry }),
    [status, user, notice, clearNotice, signIn, signOut, retry],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used inside <SessionProvider>.');
  return ctx;
}
