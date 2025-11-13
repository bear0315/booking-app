// API Configuration
const API_BASE_URL = 'https://localhost:7195/api';

// Get auth token from localStorage
export const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Set tokens
export const setTokens = (accessToken, refreshToken = null) => {
  localStorage.setItem('token', accessToken);
  if (refreshToken) {
    localStorage.setItem('refreshToken', refreshToken);
  }
};

// Clear tokens
export const clearTokens = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
};

// Main API request function
export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getAuthToken();

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add Authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);

    // Handle 401 Unauthorized - token expired or invalid
    if (response.status === 401) {
      clearTokens();
      
      // Don't redirect on login endpoint
      if (!endpoint.includes('/Auth/login')) {
        window.location.href = '/login';
      }
      
      throw new Error('Unauthorized - Please login again');
    }

    // Handle 403 Forbidden - insufficient permissions
    if (response.status === 403) {
      throw new Error('Access denied - Insufficient permissions');
    }

    // Parse response
    const contentType = response.headers.get('content-type');
    let data;

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // Handle error responses
    if (!response.ok) {
      const errorMessage = 
        data?.message || 
        data?.Message || 
        data?.error || 
        data?.Error ||
        `HTTP error! status: ${response.status}`;
      
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

// Helper function to check if user is authenticated
export const isAuthenticated = () => {
  const token = getAuthToken();
  const user = localStorage.getItem('user');
  return !!(token && user);
};

// Helper function to get current user
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

// Helper function to check user role
export const hasRole = (requiredRole) => {
  const user = getCurrentUser();
  if (!user) return false;
  
  const userRole = user.role || user.Role;
  
  // Handle both string and number roles
  if (typeof requiredRole === 'string') {
    return userRole === requiredRole;
  }
  
  return userRole === requiredRole;
};

// Helper function to check multiple roles
export const hasAnyRole = (roles = []) => {
  const user = getCurrentUser();
  if (!user) return false;
  
  const userRole = user.role || user.Role;
  return roles.includes(userRole);
};

export default apiRequest;