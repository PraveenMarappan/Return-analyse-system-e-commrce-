import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => authService.getCurrentUser());
  const [token, setToken] = useState(() => localStorage.getItem('aspida_token'));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedUser = authService.getCurrentUser();
    const storedToken = localStorage.getItem('aspida_token');
    if (storedUser && storedToken) {
      setUser(storedUser);
      setToken(storedToken);
    } else {
      setUser(null);
      setToken(null);
    }
    setLoading(false);
  }, []);

  const login = (email) => {
    const res = authService.login(email);
    if (res.success && res.user) {
      setToken(res.token);
      setUser(res.user);
      return { success: true, user: res.user, role: res.role };
    } else {
      return { success: false, message: res.message || 'Login failed.' };
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
