import React, { createContext, useContext, useState, useCallback } from 'react';
import { User, authService } from '@/services/mockData';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<User | { error: string } | null>;
  changePassword: (oldPass: string, newPass: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (username: string, password: string) => {
    setLoading(true);
    try {
      const u = await authService.login(username, password);
      if (u && !('error' in u)) setUser(u);
      return u;
    } finally {
      setLoading(false);
    }
  }, []);

  const changePassword = useCallback(async (oldPass: string, newPass: string) => {
    setLoading(true);
    try {
      if (!user) return false;
      const success = await authService.changePassword(oldPass, newPass);
      return success;
    } catch {
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const logout = useCallback(() => setUser(null), []);

  return (
    <AuthContext.Provider value={{ user, loading, login, changePassword, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be within AuthProvider');
  return ctx;
};
