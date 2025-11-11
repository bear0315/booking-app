import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/authService';
import { getAuthToken } from '../services/api';
import { getUserFromToken } from '../utils/jwtUtils';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = getAuthToken();
      if (token) {
        try {
          // First try to get user from token
          let userData = getUserFromToken(token);
          
          // Then try to get from API
          try {
            const apiUserData = await authService.getCurrentUser();
            if (apiUserData.success && apiUserData.data) {
              // Merge API data with token data (API data takes precedence)
              userData = { ...userData, ...apiUserData.data };
            }
          } catch (apiError) {
            console.warn('Could not fetch user from API, using token data:', apiError);
          }
          
          // Also check localStorage
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            try {
              const parsedUser = JSON.parse(storedUser);
              userData = { ...userData, ...parsedUser };
            } catch (e) {
              console.warn('Could not parse stored user data');
            }
          }
          
          if (userData) {
            setUser(userData);
            setIsAuthenticated(true);
          } else {
            // Token might be invalid, clear it
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      if (response.success) {
        // Get user data from multiple sources
        let userData = response.user || response.data?.user;
        
        // If not in response, get from token
        if (!userData && response.accessToken) {
          userData = getUserFromToken(response.accessToken);
        }
        
        // Merge with response data
        if (response.data) {
          userData = { ...userData, ...response.data };
        }
        
        // Check localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            userData = { ...userData, ...parsedUser };
          } catch (e) {
            console.warn('Could not parse stored user data');
          }
        }
        
        if (userData) {
          setUser(userData);
          setIsAuthenticated(true);
          return { success: true, data: response, user: userData };
        }
        
        return { success: true, data: response };
      }
      return { success: false, message: response.message || 'Login failed' };
    } catch (error) {
      return { success: false, message: error.message || 'Login failed' };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear state, even if API call fails
      setUser(null);
      setIsAuthenticated(false);
      // Clear all auth-related data
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  };

  const updateUser = (userData) => {
    setUser(userData);
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

