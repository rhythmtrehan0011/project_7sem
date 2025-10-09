import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../config/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    const newUserFlag = localStorage.getItem('isNewUser');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
        setIsNewUser(newUserFlag === 'true');
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('isNewUser');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/users/signin', { email, password });
      const { data } = response.data;
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phoneNumber
      }));
      
      setUser({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phoneNumber
      });
      
      return { success: true, message: response.data.message };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/users/signup', userData);
      const { data } = response.data;
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phoneNumber
      }));
      
      setUser({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phoneNumber
      });
      
      // Mark as new user for onboarding
      setIsNewUser(true);
      localStorage.setItem('isNewUser', 'true');
      
      return { success: true, message: response.data.message };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const logout = async () => {
    try {
      await api.post('/users/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('isNewUser');
      setUser(null);
      setIsNewUser(false);
    }
  };

  const completeOnboarding = () => {
    setIsNewUser(false);
    localStorage.removeItem('isNewUser');
  };

  const forgotPassword = async (email) => {
    try {
      const response = await api.post('/users/forgot-password', { email });
      return { success: true, message: response.data.message };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to send reset email' 
      };
    }
  };

  const resetPassword = async (token, newPassword) => {
    try {
      const response = await api.post(`/users/reset-password/${token}`, { newPassword });
      return { success: true, message: response.data.message };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to reset password' 
      };
    }
  };

  const value = {
    user,
    loading,
    isNewUser,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    completeOnboarding,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
