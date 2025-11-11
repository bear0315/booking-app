import { apiRequest, setTokens, clearTokens, getAuthToken } from './api';
import { getUserFromToken } from '../utils/jwtUtils';

export const authService = {
  // Login
  login: async (email, password) => {
    const response = await apiRequest('/Auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.success && response.accessToken) {
      setTokens(response.accessToken, response.refreshToken);
      
      // Get user info from token or response
      let userData = response.user || response.data?.user;
      
      // If user data not in response, decode from token
      if (!userData && response.accessToken) {
        userData = getUserFromToken(response.accessToken);
      }
      
      // Merge with response data if available
      if (response.data) {
        userData = { ...userData, ...response.data };
      }
      
      if (userData) {
        localStorage.setItem('user', JSON.stringify(userData));
      }
    }
    
    return response;
  },

  // Refresh token
  refreshToken: async (refreshToken) => {
    const response = await apiRequest('/Auth/refresh-token', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
    
    if (response.success && response.accessToken) {
      setTokens(response.accessToken, response.refreshToken);
    }
    
    return response;
  },

  // Logout
  logout: async () => {
    try {
      // Try to call logout API
      await apiRequest('/Auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout API error:', error);
      // Continue with logout even if API call fails
    } finally {
      // Always clear tokens and user data
      clearTokens();
      localStorage.removeItem('user');
    }
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await apiRequest('/Auth/me');
    return response;
  },

  // Revoke token
  revokeToken: async (refreshToken) => {
    return await apiRequest('/Auth/revoke-token', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  },
};

