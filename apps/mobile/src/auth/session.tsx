import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
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

import {
  ApiError,
  NETWORK_ERROR_MESSAGE,
  isApiError,
  messageOf,
  setTokenProvider,
  setUnauthorizedHandler,
} from '@/api/client';
import { fetchCurrentUser, updateProfileName } from '@/api/services';
import type { User } from '@/api/types';
import { FIREBASE_NOT_CONFIGURED_MESSAGE } from '@/config';
import { identify } from '@/lib/analytics';
import { getFirebaseAuth, isFirebaseConfigured } from '@/lib/firebase';
import { ensureUserProfile, saveProfileName } from '@/lib/firestore';
import {
  firebaseRegister,
  firebaseSignIn,
  firebaseSignOut,
  reloadFirebaseUser,
  updateFirebaseDisplayName,
} from './actions';

export type SessionStatus =
  /** Restoring the saved Firebase session at launch. */
  | 'loading'
  | 'signedOut'
  /** Signed in to Firebase, but the server needs the email address verified before it links the account. */
  | 'unverified'
  | 'signedIn'
  /** A saved session exists but the SI Coin server could not be reached to validate it. */
  | 'unreachable';

/** What Firebase knows about the signed-in account. */
export interface AccountIdentity {
  uid: string;
  email: string;
  displayName: string;
  emailVerified: boolean;
}

interface ResolveResult {
  status: 'signedIn' | 'unverified' | 'unreachable' | 'signedOut';
  message?: string;
}

interface SessionContextValue {
  status: SessionStatus;
  /** The SI Coin account (role, wallet owner) loaded from the API. */
  user: User | null;
  /** The Firebase sign-in behind it. */
  identity: AccountIdentity | null;
  /** False when the build has no Firebase configuration. */
  configured: boolean;
  /** One-time message for the sign-in screen (e.g. "session expired"). */
  notice: string | null;
  clearNotice: () => void;
  signIn: (email: string, password: string) => Promise<void>;
  register: (input: { name: string; email: string; password: string }) => Promise<void>;
  signOut: () => Promise<void>;
  /** Re-validate a saved session after an `unreachable` result. */
  retry: () => void;
  /** Re-reads the Firebase account (e.g. after the verification link was clicked) and re-links it. */
  refresh: () => Promise<ResolveResult['status']>;
  updateName: (name: string) => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

function toIdentity(user: FirebaseUser): AccountIdentity {
  return {
    uid: user.uid,
    email: user.email ?? '',
    displayName: user.displayName ?? '',
    emailVerified: user.emailVerified,
  };
}

export function SessionProvider({ children }: PropsWithChildren) {
  const configured = useMemo(() => isFirebaseConfigured(), []);
  // Without Firebase configuration there is nothing to restore: start signed out (the sign-in screen explains why).
  const [status, setStatus] = useState<SessionStatus>(configured ? 'loading' : 'signedOut');
  const [user, setUser] = useState<User | null>(null);
  const [identity, setIdentity] = useState<AccountIdentity | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [bootAttempt, setBootAttempt] = useState(0);

  const signedIn = useRef(false);
  /**
   * While register() creates the account and sets its display name, the auth listener must not link the account yet:
   * it would do so with a token that does not carry the name, and the SI Coin account would be created with the
   * email prefix as its name. register() links the account itself once the name is in place.
   */
  const registering = useRef(false);
  const inflight =useRef<{ uid: string; promise: Promise<ResolveResult> } | null>(null);

  /** Forget everything about the session (and sign out of Firebase). */
  const endSession = useCallback(async (message?: string) => {
    signedIn.current = false;
    identify(null);
    setUser(null);
    setIdentity(null);
    setNotice(message ?? null);
    setStatus('signedOut');
    await firebaseSignOut();
  }, []);

  /**
   * Links the Firebase account to its SI Coin account: asks the API who this is. The same call is shared by the
   * auth listener and by signIn/register, so one sign-in triggers a single request.
   */
  const resolve = useCallback(
    (fbUser: FirebaseUser): Promise<ResolveResult> => {
      if (inflight.current?.uid === fbUser.uid) return inflight.current.promise;

      const run = (async (): Promise<ResolveResult> => {
        setIdentity(toIdentity(fbUser));
        try {
          const me = await fetchCurrentUser();
          if (getFirebaseAuth().currentUser?.uid !== fbUser.uid) return { status: 'signedOut' };
          signedIn.current = true;
          identify(me.id);
          setUser(me);
          setNotice(null);
          setStatus('signedIn');
          // Mirror the profile document the website reads. Best effort, never blocks.
          void fbUser
            .getIdToken()
            .then((token) =>
              ensureUserProfile({ uid: fbUser.uid, email: fbUser.email, displayName: fbUser.displayName }, token),
            )
            .catch(() => undefined);
          return { status: 'signedIn' };
        } catch (error) {
          if (isApiError(error)) {
            if (error.code === 'EMAIL_NOT_VERIFIED') {
              signedIn.current = false;
              setUser(null);
              setStatus('unverified');
              return { status: 'unverified', message: error.message };
            }
            if (error.status === 401 || error.status === 403) {
              const message =
                error.status === 403 ? error.message : 'Your session has expired. Please sign in again.';
              await endSession(message);
              return { status: 'signedOut', message };
            }
          }
          signedIn.current = false;
          setStatus('unreachable');
          return { status: 'unreachable', message: messageOf(error) };
        }
      })().finally(() => {
        if (inflight.current?.uid === fbUser.uid) inflight.current = null;
      });

      inflight.current = { uid: fbUser.uid, promise: run };
      return run;
    },
    [endSession],
  );

  // Every API call carries a fresh Firebase ID token (the SDK renews it before it expires).
  useEffect(() => {
    if (!configured) return;
    setTokenProvider(
      async (forceRefresh) => {
        const current = getFirebaseAuth().currentUser;
        return current ? current.getIdToken(forceRefresh) : null;
      },
      { refreshable: true },
    );
    return () => setTokenProvider(null);
  }, [configured]);

  // Restore the saved Firebase session at launch, and follow sign-in / sign-out from anywhere.
  useEffect(() => {
    if (!configured) return;
    return onAuthStateChanged(getFirebaseAuth(), (fbUser) => {
      if (!fbUser) {
        signedIn.current = false;
        setUser(null);
        setIdentity(null);
        identify(null);
        setStatus('signedOut');
        return;
      }
      if (registering.current) return;
      void resolve(fbUser);
    });
  }, [configured, bootAttempt, resolve]);

  // The API client reports sessions the server no longer accepts (after one token refresh retry).
  useEffect(() => {
    setUnauthorizedHandler(() => {
      if (signedIn.current) void endSession('Your session has expired. Please sign in again.');
    });
    return () => setUnauthorizedHandler(null);
  }, [endSession]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      if (!configured) throw new ApiError(FIREBASE_NOT_CONFIGURED_MESSAGE, 'NOT_CONFIGURED');
      setNotice(null);
      const fbUser = await firebaseSignIn(email, password);
      const result = await resolve(fbUser);
      if (result.status === 'unreachable') {
        await endSession();
        throw new ApiError(result.message ?? NETWORK_ERROR_MESSAGE, 'NETWORK');
      }
      if (result.status === 'signedOut') {
        setNotice(null);
        throw new ApiError(result.message ?? 'We could not sign you in. Please try again.', 'SESSION_REJECTED');
      }
    },
    [configured, resolve, endSession],
  );

  const register = useCallback(
    async (input: { name: string; email: string; password: string }) => {
      if (!configured) throw new ApiError(FIREBASE_NOT_CONFIGURED_MESSAGE, 'NOT_CONFIGURED');
      setNotice(null);
      registering.current = true;
      let fbUser: FirebaseUser;
      try {
        fbUser = await firebaseRegister(input);
      } finally {
        registering.current = false;
      }
      const result = await resolve(fbUser);
      if (result.status === 'unreachable') {
        await endSession();
        throw new ApiError(
          'Your account was created, but we could not reach the SI Coin server. Please sign in again in a moment.',
          'NETWORK',
        );
      }
      if (result.status === 'signedOut') {
        setNotice(null);
        throw new ApiError(result.message ?? 'We could not finish setting up your account.', 'SESSION_REJECTED');
      }
    },
    [configured, resolve, endSession],
  );

  const signOut = useCallback(async () => {
    await endSession();
  }, [endSession]);

  const retry = useCallback(() => {
    setStatus('loading');
    setBootAttempt((n) => n + 1);
  }, []);

  const refresh = useCallback(async () => {
    const fbUser = await reloadFirebaseUser();
    inflight.current = null;
    const result = await resolve(fbUser);
    return result.status;
  }, [resolve]);

  const updateName = useCallback(async (name: string) => {
    const trimmed = name.trim();
    // The API owns the account record shown in the app, so it goes first: a failure changes nothing.
    await updateProfileName(trimmed);
    await updateFirebaseDisplayName(trimmed);
    const current = getFirebaseAuth().currentUser;
    if (current) void current.getIdToken().then((token) => saveProfileName(current.uid, trimmed, token));
    setUser((prev) => (prev ? { ...prev, name: trimmed } : prev));
    setIdentity((prev) => (prev ? { ...prev, displayName: trimmed } : prev));
  }, []);

  const clearNotice = useCallback(() => setNotice(null), []);

  const value = useMemo<SessionContextValue>(
    () => ({
      status,
      user,
      identity,
      configured,
      notice,
      clearNotice,
      signIn,
      register,
      signOut,
      retry,
      refresh,
      updateName,
    }),
    [status, user, identity, configured, notice, clearNotice, signIn, register, signOut, retry, refresh, updateName],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used inside <SessionProvider>.');
  return ctx;
}
