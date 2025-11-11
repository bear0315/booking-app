import { apiRequest } from './api';

export const userService = {
  // Get all users (Admin only)
  getAllUsers: async (page = 1, pageSize = 10, role = null, isActive = null) => {
    let url = `/Users?page=${page}&pageSize=${pageSize}`;
    if (role) url += `&role=${role}`;
    if (isActive !== null) url += `&isActive=${isActive}`;
    return await apiRequest(url);
  },

  // Get user by ID
  getUserById: async (id) => {
    return await apiRequest(`/Users/${id}`);
  },

  // Get user by email (Admin only)
  getUserByEmail: async (email) => {
    return await apiRequest(`/Users/email/${email}`);
  },

  // Get current user
  getCurrentUser: async () => {
    return await apiRequest('/Users/me');
  },

  // Create user (Admin only)
  createUser: async (userData) => {
    return await apiRequest('/Users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // Update user
  updateUser: async (id, userData) => {
    return await apiRequest(`/Users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  // Change password
  changePassword: async (id, passwordData) => {
    return await apiRequest(`/Users/${id}/change-password`, {
      method: 'POST',
      body: JSON.stringify(passwordData),
    });
  },

  // Update user status (Admin only)
  updateUserStatus: async (id, statusData) => {
    return await apiRequest(`/Users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(statusData),
    });
  },

  // Delete user (Admin only)
  deleteUser: async (id) => {
    return await apiRequest(`/Users/${id}`, {
      method: 'DELETE',
    });
  },
};

