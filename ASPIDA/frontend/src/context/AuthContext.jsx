import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => authService.getCurrentUser());
  const [token, setToken] = useState(() => localStorage.getItem('aspida_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('aspida_token');
      if (storedToken) {
        try {
          const res = await authService.fetchMe();
          const userData = res.user || res.data;
          if (res.success && userData) {
            setUser(userData);
            setToken(storedToken);
          } else {
            authService.logout();
            setUser(null);
            setToken(null);
          }
        } catch (err) {
          console.error('[AUTH] Failed to validate session token:', err);
          authService.logout();
          setUser(null);
          setToken(null);
        }
      } else {
        setUser(null);
        setToken(null);
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await authService.login(email, password);
      const authToken = res.token || res.data?.token;
      const userData = res.user || res.data?.user;

      if (authToken && userData) {
        setToken(authToken);
        setUser(userData);
        return { success: true, user: userData };
      } else {
        return { success: false, message: res.message || 'Login failed.' };
      }
    } catch (err) {
      return { success: false, message: err.message || 'Failed to authenticate.' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
  };

  const value = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!token && !!user,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
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
