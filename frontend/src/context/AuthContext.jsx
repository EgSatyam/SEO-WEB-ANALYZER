import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, setAccessToken } from '../api/axios.js';

const defaultAuthValue = {
  user: null,
  loading: false,
  login: () => {},
  logout: () => {},
};

const AuthContext = createContext(defaultAuthValue);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = useCallback((userData, token) => {
    setAccessToken(token);
    setUser(userData);
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore
    }
    setAccessToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    // Restore session from httpOnly refresh cookie. 401 here is normal when not logged in.
    api
      .post('/auth/refresh')
      .then((res) => {
        setAccessToken(res.data.accessToken);
        setUser(res.data.user);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const value = { user, loading, login, logout };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  return ctx;
}
