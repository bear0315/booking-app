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
      
      // Handle both lowercase and PascalCase response formats
      const success = response.success || response.Success || false;
      
      if (success) {
        // Get user data from multiple sources (handle both cases)
        let userData = response.user || response.User || response.data?.user || response.data?.User;
        
        // If not in response, get from token
        const accessToken = response.accessToken || response.AccessToken;
        if (!userData && accessToken) {
          userData = getUserFromToken(accessToken);
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
        
        // Normalize user data structure
        if (userData) {
          const normalizedUser = {
            id: userData.id || userData.Id,
            userId: userData.userId || userData.Id,
            email: userData.email || userData.Email,
            name: userData.name || userData.FullName || userData.fullName,
            fullName: userData.fullName || userData.FullName,
            phone: userData.phone || userData.PhoneNumber || userData.phoneNumber,
            phoneNumber: userData.phoneNumber || userData.PhoneNumber,
            avatar: userData.avatar || userData.Avatar,
            role: userData.role || userData.Role,
            status: userData.status || userData.Status,
            lastLoginAt: userData.lastLoginAt || userData.LastLoginAt,
            memberSince: userData.memberSince || userData.MemberSince
          };
          
          setUser(normalizedUser);
          setIsAuthenticated(true);
          return { success: true, data: response, user: normalizedUser };
        }
        
        return { success: true, data: response };
      }
      
      const message = response.message || response.Message || 'Login failed';
      return { success: false, message: message };
    } catch (error) {
      console.error('Login error:', error);
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

