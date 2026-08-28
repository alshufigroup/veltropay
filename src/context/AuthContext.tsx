import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../api';

export interface User {
  id: number;
  email: string;
  full_name: string;
  kyc_status: string;
  is_active: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  login: () => {},
  logout: () => {},
  isAuthenticated: false,
  isLoading: true,
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const queryToken = urlParams.get('token');
    let activeToken = token;

    if (queryToken) {
      localStorage.setItem('token', queryToken);
      setToken(queryToken);
      activeToken = queryToken;
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }

    const fetchUser = async () => {
      if (activeToken) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data);
        } catch (error) {
          console.error("Failed to fetch user", error);
          logout();
        }
      }
      setIsLoading(false);
    };

    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = (newToken: string) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    window.location.href = 'https://login.veltrobridge.xyz'; // Redirect to login domain
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
