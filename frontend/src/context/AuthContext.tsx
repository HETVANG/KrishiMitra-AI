import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'farmer' | 'expert' | 'admin';
  phone?: string;
  settings: {
    language: string;
    theme: 'light' | 'dark';
  };
  farmLocation?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  
  // Subscription properties
  plan: 'free' | 'premium' | 'enterprise';
  subscriptionStatus: 'active' | 'inactive' | 'expired' | 'trialing';
  subscriptionType: 'monthly' | 'yearly' | 'trial' | 'none';
  trialStartDate?: string;
  trialEndDate?: string;
  subscriptionExpiry?: string;
  scansUsedToday: number;
  chatMessagesToday: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: any) => Promise<void>;
  googleLogin: (payload: any) => Promise<void>;
  otpLogin: (phone: string, otp: string, name?: string) => Promise<void>;
  logout: () => void;
  updateSettings: (language: string, theme: 'light' | 'dark', farmLocation?: any) => Promise<void>;
  setFarmLocationLocally: (loc: any) => void;
  updateUser: (userData: any) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const cachedUser = localStorage.getItem('user');
    try {
      return cachedUser ? JSON.parse(cachedUser) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/auth/me');
      if (res.data && res.data.success) {
        setUser(res.data.user);
        localStorage.setItem('user', JSON.stringify(res.data.user));
      }
    } catch (err) {
      console.warn('[Auth Context] Failed to fetch profile, clearing token.');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProfile();
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data && res.data.success) {
      const { token: userToken, user: userData } = res.data;
      localStorage.setItem('token', userToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setToken(userToken);
      setUser(userData);
    }
  };

  const register = async (payload: any) => {
    const res = await api.post('/auth/register', payload);
    if (res.data && res.data.success) {
      const { token: userToken, user: userData } = res.data;
      localStorage.setItem('token', userToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setToken(userToken);
      setUser(userData);
    }
  };

  const googleLogin = async (payload: any) => {
    const res = await api.post('/auth/google-login', payload);
    if (res.data && res.data.success) {
      const { token: userToken, user: userData } = res.data;
      localStorage.setItem('token', userToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setToken(userToken);
      setUser(userData);
    }
  };

  const otpLogin = async (phone: string, otp: string, name?: string) => {
    const res = await api.post('/auth/otp-login', { phone, otp, name });
    if (res.data && res.data.success) {
      const { token: userToken, user: userData } = res.data;
      localStorage.setItem('token', userToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setToken(userToken);
      setUser(userData);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const updateSettings = async (language: string, theme: 'light' | 'dark', farmLocation?: any) => {
    const res = await api.put('/auth/settings', { language, theme, farmLocation });
    if (res.data && res.data.success) {
      setUser(res.data.user);
      localStorage.setItem('user', JSON.stringify(res.data.user));
    }
  };

  const setFarmLocationLocally = (loc: any) => {
    if (user) {
      const updatedUser = {
        ...user,
        farmLocation: loc
      };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const updateUser = (userData: any) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        googleLogin,
        otpLogin,
        logout,
        updateSettings,
        setFarmLocationLocally,
        updateUser
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
