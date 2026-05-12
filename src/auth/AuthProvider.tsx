import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { authApi, type MeResponse } from '../api/auth';
import { readToken, writeToken } from '../api/client';

interface AuthContextValue {
  me: MeResponse | null;
  loading: boolean;
  setSession: (token: string) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [me, setMe] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(() => Boolean(readToken()));

  const refresh = useCallback(async () => {
    if (!readToken()) {
      setMe(null);
      setLoading(false);
      return;
    }
    try {
      setMe(await authApi.me());
    } catch {
      writeToken(null);
      setMe(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const setSession = useCallback(async (token: string) => {
    writeToken(token);
    setLoading(true);
    await refresh();
  }, [refresh]);

  const logout = useCallback(() => {
    writeToken(null);
    setMe(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ me, loading, setSession, logout, refresh }),
    [me, loading, setSession, logout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
