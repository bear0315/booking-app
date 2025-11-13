import { apiRequest } from './api';

export const guideService = {
  // Get all guides (for Admin to assign to tours)
  getAllGuides: async () => {
    return await apiRequest('/Guides');
  },

  // Get active guides only
  getActiveGuides: async () => {
    return await apiRequest('/Guides/active');
  },

  // Search guides by keyword or language
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

  // Get guide by ID
  getGuideById: async (id) => {
    return await apiRequest(`/Guides/${id}`);
  },

  // Get available guides for a specific tour and date
  getAvailableGuidesForTour: async (tourId, tourDate) => {
    const queryParams = new URLSearchParams({
      tourDate: tourDate instanceof Date ? tourDate.toISOString() : tourDate
    });
    return await apiRequest(`/Tours/${tourId}/guides?${queryParams.toString()}`);
  },

  // Check guide availability for a specific date
  checkGuideAvailability: async (guideId, tourDate) => {
    const queryParams = new URLSearchParams({
      tourDate: tourDate instanceof Date ? tourDate.toISOString() : tourDate
    });
    return await apiRequest(`/Tours/guides/${guideId}/availability?${queryParams.toString()}`);
  },

  // Get guides assigned to a specific tour
  getGuidesByTourId: async (tourId) => {
    return await apiRequest(`/Tours/${tourId}/assigned-guides`);
  }
};