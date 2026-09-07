import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../lib/axios';
import { User, UserRole, ApiResponse } from '../types/api.types';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role?: UserRole) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('accessToken'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch current user profile on initial app load
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await api.get<ApiResponse<User>>('/auth/me');
        if (res.data.success && res.data.data) {
          setUser(res.data.data);
        }
      } catch (_err) {
        // Not authenticated
        setUser(null);
        localStorage.removeItem('accessToken');
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await api.post<ApiResponse<{ user: User; accessToken: string }>>('/auth/login', {
        email,
        password
      });

      if (res.data.success) {
        const { user: loggedInUser, accessToken } = res.data.data;
        setUser(loggedInUser);
        setToken(accessToken);
        localStorage.setItem('accessToken', accessToken);
        toast.success(`Welcome back, ${loggedInUser.name}!`);
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(msg);
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string, role?: UserRole) => {
    try {
      const res = await api.post<ApiResponse<{ user: User; accessToken: string }>>('/auth/register', {
        name,
        email,
        password,
        role
      });

      if (res.data.success) {
        const { user: registeredUser, accessToken } = res.data.data;
        setUser(registeredUser);
        setToken(accessToken);
        localStorage.setItem('accessToken', accessToken);
        toast.success('Account created successfully!');
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Registration failed.';
      toast.error(msg);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (_err) {
      // Ignore logout network failure
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('accessToken');
      toast.info('Logged out successfully');
    }
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === UserRole.ADMIN;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated,
        isAdmin,
        login,
        register,
        logout
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
