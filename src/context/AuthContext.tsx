import React, { createContext, useContext, useState, useEffect } from 'react';
import { router } from 'expo-router';
import { authService, UserProfile } from '../services/authService';
import { saveToken, removeToken, getToken } from '../services/secureStore';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (fullname: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (fullname: string, email: string, photo: string | null) => Promise<void>;
  reloadUser: () => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<{ message: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check login on startup
  useEffect(() => {
    checkAutoLogin();
  }, []);

  const checkAutoLogin = async () => {
    setIsLoading(true);
    try {
      const savedToken = await getToken();
      if (savedToken) {
        setToken(savedToken);
        const userProfile = await authService.getProfile();
        setUser(userProfile);
        // Navigate to tabs immediately
        setTimeout(() => {
          router.replace('/(tabs)');
        }, 100);
      } else {
        // Redirect to login if not authenticated
        setTimeout(() => {
          router.replace('/(auth)/login');
        }, 100);
      }
    } catch (error) {
      console.error('Auto login check failed:', error);
      await cleanLogout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authService.login(email, password);
      await saveToken(response.token);
      setToken(response.token);
      setUser(response.user);
      router.replace('/(tabs)');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login gagal. Hubungi admin.';
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (fullname: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authService.register(fullname, email, password);
      await saveToken(response.token);
      setToken(response.token);
      setUser(response.user);
      router.replace('/(tabs)');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registrasi gagal. Hubungi admin.';
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const cleanLogout = async () => {
    console.log('🔄 Logging out...');
    try {
      await removeToken();
      console.log('✅ Token removed');
    } catch (error) {
      console.error('Error removing token:', error);
    }
    
    setToken(null);
    setUser(null);
    console.log('✅ State cleared, redirecting to login...');
    
    // Use setTimeout to ensure state updates are processed
    setTimeout(() => {
      console.log('🔀 Redirecting to login...');
      router.replace('/(auth)/login');
    }, 100);
  };

  const logout = async () => {
    console.log('📤 Logout initiated');
    setIsLoading(true);
    try {
      await cleanLogout();
      console.log('✅ Logout complete');
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Force logout even if there's an error
      setToken(null);
      setUser(null);
      await removeToken();
      router.replace('/(auth)/login');
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (fullname: string, email: string, photo: string | null) => {
    try {
      const updatedProfile = await authService.updateProfile(fullname, email, photo);
      setUser(updatedProfile);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Gagal memperbarui profil.';
      throw new Error(message);
    }
  };

  const reloadUser = async () => {
    try {
      const userProfile = await authService.getProfile();
      setUser(userProfile);
    } catch (error) {
      console.error('Reload user profile failed:', error);
    }
  };

  const changePassword = async (oldPassword: string, newPassword: string) => {
    try {
      return await authService.changePassword(oldPassword, newPassword);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Gagal mengubah password.';
      throw new Error(message);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        updateUser,
        reloadUser,
        changePassword,
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
