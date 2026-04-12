import { createContext, useContext, useState, useCallback } from 'react';
import * as authApi from '../api/auth';

const TOKEN_KEY = 'et_token';
const USER_KEY  = 'et_user';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user,  setUser]  = useState(() => {
    try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; }
  });

  function persist(newToken, newUser) {
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }

  const login = useCallback(async (credentials) => {
    const { token: t, user: u } = await authApi.login(credentials);
    persist(t, u);
  }, []);

  const register = useCallback(async (data) => {
    const { token: t, user: u } = await authApi.register(data);
    persist(t, u);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ token, user, login, register, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
