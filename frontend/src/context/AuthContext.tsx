import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import i18n from '../i18n';

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
    village?: string;
    city?: string;
    district?: string;
    state?: string;
    postcode?: string;
  };
  
  // Subscription properties
  plan: 'free' | 'premium' | 'enterprise';
  subscriptionStatus: 'active' | 'inactive' | 'expired' | 'trialing';
  subscriptionType: 'monthly' | 'yearly' | 'trial' | 'none';
  trialStartDate?: string;
  trialEndDate?: string;
  subscriptionExpiry?: string;
  paymentProvider?: 'stripe' | 'razorpay' | 'upi' | 'none';
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

  farmLocation: any;
  logout: () => void;
  updateSettings: (language: string, theme: 'light' | 'dark', farmLocation?: any) => Promise<void>;
  setFarmLocationLocally: (loc: any) => void;
  updateUser: (userData: any) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  console.log('[The Khedut Startup Log] Loading Authentication');
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
  const [farmLocation, setFarmLocation] = useState<any>(null);
  const skipProfileFetchRef = useRef<boolean>(false);

  // Sync farmLocation whenever user profile loads/updates or from guest storage fallback
  useEffect(() => {
    if (user && user.farmLocation) {
      setFarmLocation(user.farmLocation);
    } else {
      const guestLoc = localStorage.getItem('guestFarmLocation');
      if (guestLoc) {
        try {
          setFarmLocation(JSON.parse(guestLoc));
        } catch {
          setFarmLocation(null);
        }
      } else {
        setFarmLocation(null);
      }
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/auth/me');
      if (res.data && res.data.success) {
        setUser(res.data.user);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        if (res.data.user?.settings?.language) {
          const userLang = res.data.user.settings.language;
          i18n.changeLanguage(userLang);
          localStorage.setItem('km-lang', userLang);
        }
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
      if (skipProfileFetchRef.current) {
        skipProfileFetchRef.current = false;
        setIsLoading(false);
        return;
      }
      fetchProfile();
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data && res.data.success) {
      const { token: userToken, user: userData } = res.data;
      skipProfileFetchRef.current = true;
      localStorage.setItem('token', userToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setToken(userToken);
      setUser(userData);
      setIsLoading(false);
      if (userData?.settings?.language) {
        const userLang = userData.settings.language;
        i18n.changeLanguage(userLang);
        localStorage.setItem('km-lang', userLang);
      }
    }
  };

  const register = async (payload: any) => {
    const res = await api.post('/auth/register', payload);
    if (res.data && res.data.success) {
      const { token: userToken, user: userData } = res.data;
      skipProfileFetchRef.current = true;
      localStorage.setItem('token', userToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setToken(userToken);
      setUser(userData);
      setIsLoading(false);
      if (userData?.settings?.language) {
        const userLang = userData.settings.language;
        i18n.changeLanguage(userLang);
        localStorage.setItem('km-lang', userLang);
      }
    }
  };



  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    localStorage.removeItem('accessToken');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    
    setToken(null);
    setUser(null);
    setFarmLocation(null);

    // Redirect to public landing page and trigger clean window state reset
    window.location.href = '/';
  };

  const updateSettings = async (language: string, theme: 'light' | 'dark', farmLocation?: any) => {
    const res = await api.put('/auth/settings', { language, theme, farmLocation });
    if (res.data && res.data.success) {
      setUser(res.data.user);
      localStorage.setItem('user', JSON.stringify(res.data.user));
    }
  };

  const setFarmLocationLocally = (loc: any) => {
    setFarmLocation(loc);
    if (user) {
      const updatedUser = {
        ...user,
        farmLocation: loc
      };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } else {
      localStorage.setItem('guestFarmLocation', JSON.stringify(loc));
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
        farmLocation,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,

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
