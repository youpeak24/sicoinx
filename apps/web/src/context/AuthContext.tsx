import React, { createContext, useContext, useEffect, useState } from 'react';
import { api, ApiError } from '../lib/api';
import { UserProfile, Role, ROLE_PERMISSIONS } from '@sicoin/shared';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  login: (credentials: { email: string; password: string; mfaCode?: string }) => Promise<{ requireMfa?: boolean }>;
  register: (data: { name: string; email: string; password: string; acceptTerms: boolean }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isAdmin: boolean;
  isStaff: boolean;
  hasRole: (roles: Role[]) => boolean;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      const data = await api.get<{ user: UserProfile }>('/auth/me');
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async ({ email, password, mfaCode }: { email: string; password: string; mfaCode?: string }) => {
    const res = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password, mfaCode }),
    });

    const json = await res.json();
    if (!res.ok) {
      throw new ApiError(json.error?.message || 'Login failed', json.error?.code, res.status);
    }

    if (json.requireMfa) {
      return { requireMfa: true };
    }

    if (json.data?.user) {
      setUser(json.data.user);
    }

    return { requireMfa: false };
  };

  const register = async (data: { name: string; email: string; password: string; acceptTerms: boolean }) => {
    const res = await api.post<{ user: UserProfile }>('/auth/register', data);
    if (res.user) {
      setUser(res.user);
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignored
    } finally {
      setUser(null);
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
