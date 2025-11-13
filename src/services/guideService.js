import { apiRequest } from './api';

export const guideService = {
  getAllGuides: async () => {
    return await apiRequest('/Guides');
  },

  getActiveGuides: async () => {
    return await apiRequest('/Guides/active');
  },

  searchGuides: async (keyword = null, language = null) => {
    const queryParams = new URLSearchParams();
    
    if (keyword) {
      queryParams.append('keyword', keyword);
    }
    
    if (language) {
      queryParams.append('language', language);
    }
    
    const queryString = queryParams.toString();
    return await apiRequest(`/Guides/search${queryString ? `?${queryString}` : ''}`);
  },

  // Lấy thông tin guide theo guide ID (public - để xem chi tiết guide)
  getGuideById: async (id) => {
    return await apiRequest(`/Guides/${id}`);
  },

  // Lấy profile của guide theo user ID (authenticated - cho trang profile cá nhân)
  getGuideProfileByUserId: async (userId) => {
    return await apiRequest(`/Guides/user/${userId}`);
  },

  // Update profile
  updateGuideProfile: async (userId, profileData) => {
    return await apiRequest(`/Guides/user/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  },

  getAvailableGuidesForTour: async (tourId, tourDate) => {
    const queryParams = new URLSearchParams({
      tourDate: tourDate instanceof Date ? tourDate.toISOString() : tourDate
    });
    return await apiRequest(`/Tours/${tourId}/guides?${queryParams.toString()}`);
  },

  checkGuideAvailability: async (guideId, tourDate) => {
    const queryParams = new URLSearchParams({
      tourDate: tourDate instanceof Date ? tourDate.toISOString() : tourDate
    });
    return await apiRequest(`/Tours/guides/${guideId}/availability?${queryParams.toString()}`);
  },

  getGuidesByTourId: async (tourId) => {
    return await apiRequest(`/Tours/${tourId}/assigned-guides`);
  }
};