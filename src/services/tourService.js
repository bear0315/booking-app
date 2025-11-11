import { apiRequest } from './api';

export const tourService = {
  // Get all tours with pagination
  getAllTours: async (pageNumber = 1, pageSize = 10) => {
    return await apiRequest(`/Tours?pageNumber=${pageNumber}&pageSize=${pageSize}`);
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

  // Get tour by ID
  getTourById: async (id) => {
    return await apiRequest(`/Tours/${id}`);
  },

  // Get tour by slug
  getTourBySlug: async (slug) => {
    return await apiRequest(`/Tours/slug/${slug}`);
  },

  // Get featured tours
  getFeaturedTours: async (take = 10) => {
    return await apiRequest(`/Tours/featured?take=${take}`);
  },

  // Get popular tours
  getPopularTours: async (take = 10) => {
    return await apiRequest(`/Tours/popular?take=${take}`);
  },

  // Get related tours
  getRelatedTours: async (id, take = 5) => {
    return await apiRequest(`/Tours/${id}/related?take=${take}`);
  },

  // Get tours by destination
  getToursByDestination: async (destinationId, pageNumber = 1, pageSize = 10) => {
    return await apiRequest(`/Tours/destination/${destinationId}?pageNumber=${pageNumber}&pageSize=${pageSize}`);
  },

  // Get tours by category
  getToursByCategory: async (category, pageNumber = 1, pageSize = 10) => {
    return await apiRequest(`/Tours/category/${category}?pageNumber=${pageNumber}&pageSize=${pageSize}`);
  },

  // Check tour availability
  checkAvailability: async (id, tourDate, numberOfGuests) => {
    return await apiRequest(`/Tours/${id}/availability?tourDate=${tourDate}&numberOfGuests=${numberOfGuests}`);
  },

  // Get available dates
  getAvailableDates: async (id, fromDate, toDate) => {
    return await apiRequest(`/Tours/${id}/available-dates?fromDate=${fromDate}&toDate=${toDate}`);
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
      body: JSON.stringify({ ...tourData, id }),
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

  // Admin: Update status
  updateStatus: async (id, status) => {
    return await apiRequest(`/Tours/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(status),
    });
  },

  // Admin: Get statistics
  getStatistics: async () => {
    return await apiRequest('/Tours/statistics');
  },
};

