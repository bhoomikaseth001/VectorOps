import { createContext, useContext, useEffect, useState } from 'react';
import * as authApi from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('to_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // rehydrate on refresh: trust local user immediately, don't block UI
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    const data = await authApi.login(credentials);
    // expected shape: { token, user: { id, name, email, role } }
    localStorage.setItem('to_token', data.token);
    localStorage.setItem('to_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const signup = async (payload) => {
    const data = await authApi.signup(payload);
    localStorage.setItem('to_token', data.token);
    localStorage.setItem('to_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('to_token');
    localStorage.removeItem('to_user');
    setUser(null);
  };

  const hasRole = (...roles) => !!user && roles.includes(user.role);

  return (
    <AuthContext.Provider
      value={{ user, loading, login, signup, logout, hasRole, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
