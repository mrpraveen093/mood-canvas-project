import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, tokenStore } from '../api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(() => Boolean(tokenStore.get()));

  useEffect(() => {
    if (!tokenStore.get()) return undefined;
    let active = true;
    api
      .me()
      .then(({ user: current }) => {
        if (active) setUser(current);
      })
      .catch(() => tokenStore.clear())
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const persistSession = useCallback(({ token, user: account }) => {
    tokenStore.set(token);
    setUser(account);
    return account;
  }, []);

  const signup = useCallback(
    async (values) => persistSession(await api.signup(values)),
    [persistSession],
  );

  const login = useCallback(
    async (values) => persistSession(await api.login(values)),
    [persistSession],
  );

  const logout = useCallback(() => {
    tokenStore.clear();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, signup, login, logout, updateUser: setUser }),
    [user, loading, signup, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
