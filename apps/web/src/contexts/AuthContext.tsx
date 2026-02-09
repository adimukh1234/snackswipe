'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { authApi, User } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (phone: string, otp: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  sendOtp: (phone: string) => Promise<{ success: boolean; error?: string; dev_otp?: string }>;
  updateProfile: (data: { name?: string; email?: string }) => Promise<{ success: boolean; error?: string }>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const { data, error } = await authApi.getMe();
      if (data && !error) {
        setUser(data);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    refreshUser().finally(() => setIsLoading(false));
  }, [refreshUser]);

  const sendOtp = async (phone: string) => {
    const { data, error } = await authApi.sendOtp(phone);
    if (error) {
      return { success: false, error };
    }
    return { success: true, dev_otp: data?.dev_otp };
  };

  const login = async (phone: string, otp: string) => {
    const { data, error } = await authApi.verifyOtp(phone, otp);
    if (error || !data) {
      return { success: false, error: error || 'Login failed' };
    }
    setUser(data.user);
    return { success: true };
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
  };

  const updateProfile = async (data: { name?: string; email?: string }) => {
    const { data: result, error } = await authApi.updateProfile(data);
    if (error || !result) {
      return { success: false, error: error || 'Update failed' };
    }
    setUser(result.user);
    return { success: true };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        sendOtp,
        updateProfile,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
