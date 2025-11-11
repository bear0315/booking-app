import { apiRequest, setTokens, clearTokens, getAuthToken } from './api';
import { getUserFromToken } from '../utils/jwtUtils';

export const authService = {
  // Login
  login: async (email, password) => {
    const response = await apiRequest('/Auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    // Handle both lowercase and PascalCase response formats
    const success = response.success || response.Success || false;
    const accessToken = response.accessToken || response.AccessToken;
    const refreshToken = response.refreshToken || response.RefreshToken;
    const user = response.user || response.User || response.data?.user || response.data?.User;
    
    if (success && accessToken) {
      setTokens(accessToken, refreshToken);
      
      // Get user info from token or response
      let userData = user;
      
      // If user data not in response, decode from token
      if (!userData && accessToken) {
        userData = getUserFromToken(accessToken);
      }
      
      // Merge with response data if available
      if (response.data) {
        userData = { ...userData, ...response.data };
      }
      
      // Normalize user data structure (handle PascalCase to camelCase)
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
        
        localStorage.setItem('user', JSON.stringify(normalizedUser));
      }
    }
    
    // Return normalized response
    return {
      success: success,
      Success: success,
      message: response.message || response.Message || '',
      Message: response.message || response.Message || '',
      user: user,
      User: user,
      accessToken: accessToken,
      AccessToken: accessToken,
      refreshToken: refreshToken,
      RefreshToken: refreshToken,
      accessTokenExpiresAt: response.accessTokenExpiresAt || response.AccessTokenExpiresAt,
      refreshTokenExpiresAt: response.refreshTokenExpiresAt || response.RefreshTokenExpiresAt,
      ...response
    };
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

