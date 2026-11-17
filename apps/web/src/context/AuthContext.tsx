import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut,
  updateProfile as updateFirebaseProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '../lib/firebase';
import { ApiError } from '../lib/api';
import { UserProfile, Role, ROLE_PERMISSIONS } from '@sicoin/shared';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  login: (credentials: { email: string; password: string; mfaCode?: string }) => Promise<{ requireMfa?: boolean }>;
  register: (data: { name: string; email: string; password: string; acceptTerms: boolean }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfile: (data: { name: string }) => Promise<void>;
  isAdmin: boolean;
  isStaff: boolean;
  hasRole: (roles: Role[]) => boolean;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const FIREBASE_ERRORS: Record<string, string> = {
  'auth/invalid-credential': 'Invalid email or password.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/user-not-found': 'Invalid email or password.',
  'auth/wrong-password': 'Invalid email or password.',
  'auth/user-disabled': 'This account has been disabled.',
  'auth/email-already-in-use': 'An account with this email address already exists.',
  'auth/weak-password': 'Password is too weak.',
  'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
  'auth/network-request-failed': 'Network error. Check your connection and try again.',
};

/** Converts a Firebase error into the ApiError shape the UI already handles. */
export function toApiError(err: any, fallback = 'Request failed'): ApiError {
  const code: string = err?.code || 'ERROR';
  return new ApiError(FIREBASE_ERRORS[code] || err?.message || fallback, code, 400);
}

function assertConfigured() {
  if (!isFirebaseConfigured) {
    throw new ApiError('Firebase is not configured. Set the VITE_FIREBASE_* environment variables.', 'FIREBASE_NOT_CONFIGURED', 500);
  }
}

const iso = (v: any): string =>
  typeof v?.toDate === 'function' ? v.toDate().toISOString() : typeof v === 'string' ? v : new Date().toISOString();

/** Loads users/{uid}, creating a default USER profile if none exists yet. */
async function loadProfile(fbUser: FirebaseUser): Promise<UserProfile> {
  const ref = doc(db, 'users', fbUser.uid);
  let snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      id: fbUser.uid,
      email: (fbUser.email || '').toLowerCase(),
      name: fbUser.displayName || (fbUser.email || 'User').split('@')[0],
      role: 'USER',
      isEmailVerified: false,
      mfaEnabled: false,
      avatarUrl: null,
      isBanned: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    snap = await getDoc(ref);
  }
  const d = snap.data() || {};
  return {
    id: fbUser.uid,
    email: d.email || fbUser.email || '',
    name: d.name || fbUser.displayName || '',
    role: (d.role as Role) || 'USER',
    isEmailVerified: fbUser.emailVerified,
    mfaEnabled: Boolean(d.mfaEnabled),
    avatarUrl: d.avatarUrl ?? null,
    createdAt: iso(d.createdAt),
    updatedAt: iso(d.updatedAt),
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  // While register() is creating the account + profile, the auth listener must not race it.
  const registering = useRef(false);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setIsLoading(false);
      return;
    }
    return onAuthStateChanged(auth, async (fbUser) => {
      if (registering.current) return;
      if (!fbUser) {
        setUser(null);
        setIsLoading(false);
        return;
      }
      try {
        setUser(await loadProfile(fbUser));
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    });
  }, []);

  const refreshUser = async () => {
    const fbUser = auth.currentUser;
    if (!fbUser) {
      setUser(null);
      return;
    }
    await fbUser.reload();
    setUser(await loadProfile(fbUser));
  };

  const login = async ({ email, password }: { email: string; password: string; mfaCode?: string }) => {
    assertConfigured();
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      const profile = await loadProfile(cred.user);
      setUser(profile);
    } catch (err: any) {
      throw toApiError(err, 'Login failed');
    }
    return { requireMfa: false };
  };

  const register = async (data: { name: string; email: string; password: string; acceptTerms: boolean }) => {
    assertConfigured();
    registering.current = true;
    try {
      const cred = await createUserWithEmailAndPassword(auth, data.email.trim(), data.password);
      await updateFirebaseProfile(cred.user, { displayName: data.name });
      const profile = await loadProfile(cred.user);
      setUser(profile);
      sendEmailVerification(cred.user).catch(() => {});
    } catch (err: any) {
      throw toApiError(err, 'Registration failed');
    } finally {
      registering.current = false;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch {
      // Ignored
    } finally {
      setUser(null);
    }
  };

  const updateProfile = async ({ name }: { name: string }) => {
    const fbUser = auth.currentUser;
    if (!fbUser) throw new ApiError('You must be signed in.', 'UNAUTHENTICATED', 401);
    try {
      await updateFirebaseProfile(fbUser, { displayName: name });
      await updateDoc(doc(db, 'users', fbUser.uid), { name, updatedAt: serverTimestamp() });
      setUser(await loadProfile(fbUser));
    } catch (err: any) {
      throw toApiError(err, 'Could not update profile');
    }
  };

  const isStaff = Boolean(
    user && ['SUPER_ADMIN', 'FINANCE_MANAGER', 'CONTENT_EDITOR', 'SUPPORT_AGENT', 'READONLY_ANALYST'].includes(user.role)
  );

  const isAdmin = Boolean(user && user.role === 'SUPER_ADMIN');

  const hasRole = (roles: Role[]) => {
    return Boolean(user && roles.includes(user.role));
  };

  const hasPermission = (permission: string) => {
    if (!user) return false;
    const permissions = (ROLE_PERMISSIONS as any)[user.role] || [];
    return permissions.includes(permission);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
        updateProfile,
        isAdmin,
        isStaff,
        hasRole,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
