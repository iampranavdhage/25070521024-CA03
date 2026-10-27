import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Check persistent session on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/auth/me');
      if (res && res.success && res.user) {
        setUser(res.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async ({ identifier, password, rememberMe }) => {
    setAuthError(null);
    try {
      const res = await api.post('/api/auth/login', { identifier, password, rememberMe });
      if (res && res.success && res.user) {
        setUser(res.user);
        return { success: true, user: res.user };
      }
      throw new Error(res.message || 'Login failed');
    } catch (err) {
      setAuthError(err.message);
      return { success: false, error: err.message };
    }
  };

  const signup = async (userData) => {
    setAuthError(null);
    try {
      const res = await api.post('/api/auth/signup', userData);
      if (res && res.success && res.user) {
        setUser(res.user);
        return { success: true, user: res.user };
      }
      throw new Error(res.message || 'Signup failed');
    } catch (err) {
      setAuthError(err.message);
      return { success: false, error: err.message };
    }
  };

  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
    }
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  const value = {
    user,
    loading,
    authError,
    isAuthenticated: Boolean(user),
    login,
    signup,
    logout,
    updateUser,
    refreshUser: checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
