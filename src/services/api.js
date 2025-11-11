// API Base Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://localhost:7195/api';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('accessToken');
};

// Helper function to get refresh token
const getRefreshToken = () => {
  return localStorage.getItem('refreshToken');
};

// Helper function to set tokens
const setTokens = (accessToken, refreshToken) => {
  localStorage.setItem('accessToken', accessToken);
  if (refreshToken) {
    localStorage.setItem('refreshToken', refreshToken);
  }
};

// Helper function to clear tokens
const clearTokens = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
};

// Base fetch function with error handling
const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    // Handle 401 Unauthorized - token expired
    if (response.status === 401) {
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        try {
          const refreshResponse = await fetch(`${API_BASE_URL}/Auth/refresh-token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
          });

          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            if (refreshData.success && refreshData.accessToken) {
              setTokens(refreshData.accessToken, refreshData.refreshToken);
              // Retry original request with new token
              config.headers.Authorization = `Bearer ${refreshData.accessToken}`;
              const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, config);
              return await handleResponse(retryResponse);
            }
          }
        } catch (error) {
          console.error('Token refresh failed:', error);
          clearTokens();
          window.location.href = '/login';
          throw new Error('Session expired. Please login again.');
        }
      } else {
        clearTokens();
        window.location.href = '/login';
        throw new Error('Unauthorized. Please login.');
      }
    }

    return await handleResponse(response);
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

// Handle response
const handleResponse = async (response) => {
  const contentType = response.headers.get('content-type');
  
  if (contentType && contentType.includes('application/json')) {
    const data = await response.json();
    
    if (!response.ok) {
      const errorMessage = data.message || data.Message || 'An error occurred';
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }
    
    // Normalize response to handle both PascalCase and camelCase
    // This ensures compatibility with different API response formats
    if (data.Success !== undefined || data.success !== undefined) {
      return {
        ...data,
        success: data.success !== undefined ? data.success : data.Success,
        Success: data.Success !== undefined ? data.Success : data.success,
        message: data.message || data.Message || '',
        Message: data.Message || data.message || '',
        user: data.user || data.User,
        User: data.User || data.user,
        accessToken: data.accessToken || data.AccessToken,
        AccessToken: data.AccessToken || data.accessToken,
        refreshToken: data.refreshToken || data.RefreshToken,
        RefreshToken: data.RefreshToken || data.refreshToken
      };
    }
    
    return data;
  } else {
    // Handle non-JSON responses (like redirects)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response;
  }
};

// Export utilities
export {
  API_BASE_URL,
  getAuthToken,
  getRefreshToken,
  setTokens,
  clearTokens,
  apiRequest,
};

