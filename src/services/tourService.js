// services/tourService.js
import { apiRequest } from './api';

export const tourService = {
  // Get all tours with pagination
  getAllTours: async (pageNumber = 1, pageSize = 10) => {
    const response = await apiRequest(`/Tours?pageNumber=${pageNumber}&pageSize=${pageSize}`);
    return response;
  },

  // Get tour by ID
  getTourById: async (id) => {
    const response = await apiRequest(`/Tours/${id}`);
    return response;
  },

  // Get tour by slug
  getTourBySlug: async (slug) => {
    const response = await apiRequest(`/Tours/slug/${slug}`);
    return response;
  },

  // Get featured tours
  getFeaturedTours: async (take = 10) => {
    const response = await apiRequest(`/Tours/featured?take=${take}`);
    return response;
  },

  // Get popular tours
  getPopularTours: async (take = 10) => {
    const response = await apiRequest(`/Tours/popular?take=${take}`);
    return response;
  },

  // Search tours
  searchTours: async (searchParams) => {
    const queryParams = new URLSearchParams();
    Object.keys(searchParams).forEach(key => {
      if (searchParams[key] !== null && searchParams[key] !== undefined && searchParams[key] !== '') {
        if (Array.isArray(searchParams[key])) {
          searchParams[key].forEach(item => queryParams.append(key, item));
        } else {
          queryParams.append(key, searchParams[key]);
        }
      }
    });
    return await apiRequest(`/Tours/search?${queryParams.toString()}`);
  },

  // Admin: Create tour
  createTour: async (tourData) => {
    return await apiRequest('/Tours', {
      method: 'POST',
      body: JSON.stringify(tourData),
    });
  },

  // Admin: Update tour
  updateTour: async (id, tourData) => {
    return await apiRequest(`/Tours/${id}`, {
      method: 'PUT',
      body: JSON.stringify(tourData), // Backend expects request body without id in URL
    });
  },

  // Admin: Delete tour
  deleteTour: async (id) => {
    return await apiRequest(`/Tours/${id}`, {
      method: 'DELETE',
    });
  },

  // Admin: Toggle featured
  toggleFeatured: async (id) => {
    return await apiRequest(`/Tours/${id}/toggle-featured`, {
      method: 'PATCH',
    });
  },

  // Admin: Update status - FIXED: Backend expects TourStatus enum as body
  updateStatus: async (id, status) => {
    return await apiRequest(`/Tours/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(status), // Send raw status string
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },

  // Admin: Get statistics
  getStatistics: async () => {
    return await apiRequest('/Tours/statistics');
  },

  // Admin: Update tour statistics
  updateStatistics: async (id) => {
    return await apiRequest(`/Tours/${id}/update-statistics`, {
      method: 'POST',
    });
  },

  // Admin: Update tour rating
  updateRating: async (id) => {
    return await apiRequest(`/Tours/${id}/update-rating`, {
      method: 'POST',
    });
  },

  // Admin: Bulk operations
  bulkUpdateStatus: async (tourIds, status) => {
    return await apiRequest('/Tours/bulk/status', {
      method: 'PATCH',
      body: JSON.stringify({ tourIds, status }),
    });
  },

  bulkUpdateFeatured: async (tourIds, isFeatured) => {
    return await apiRequest('/Tours/bulk/featured', {
      method: 'PATCH',
      body: JSON.stringify({ tourIds, isFeatured }),
    });
  },

  bulkDelete: async (tourIds) => {
    return await apiRequest('/Tours/bulk', {
      method: 'DELETE',
      body: JSON.stringify(tourIds),
    });
  },
};