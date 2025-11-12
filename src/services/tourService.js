import { apiRequest } from './api';

export const tourService = {
  // Get all tours with pagination
  getAllTours: async (pageNumber = 1, pageSize = 10) => {
    return await apiRequest(`/Tours?pageNumber=${pageNumber}&pageSize=${pageSize}`);
  },

  // Search and filter tours
  searchTours: async (searchParams) => {
    const queryParams = new URLSearchParams();
    Object.keys(searchParams).forEach(key => {
      if (searchParams[key] !== null && searchParams[key] !== undefined && searchParams[key] !== '') {
        // Handle array parameters (like TagIds)
        if (Array.isArray(searchParams[key])) {
          searchParams[key].forEach(value => {
            queryParams.append(key, value);
          });
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
    const response = await apiRequest(`/Tours/featured?take=${take}`);
    // Handle both array and object response
    if (Array.isArray(response)) {
      return response;
    }
    return response.data || response.Data || response.items || response.Items || response;
  },

  // Get popular tours
  getPopularTours: async (take = 10) => {
    const response = await apiRequest(`/Tours/popular?take=${take}`);
    // Handle both array and object response
    if (Array.isArray(response)) {
      return response;
    }
    return response.data || response.Data || response.items || response.Items || response;
  },

  // Get related tours
  getRelatedTours: async (id, take = 5) => {
    const response = await apiRequest(`/Tours/${id}/related?take=${take}`);
    // Handle both array and object response
    if (Array.isArray(response)) {
      return response;
    }
    return response.data || response.Data || response.items || response.Items || response;
  },

  // Get tours by destination
  getToursByDestination: async (destinationId, pageNumber = 1, pageSize = 10) => {
    const response = await apiRequest(
      `/Tours/destination/${destinationId}?pageNumber=${pageNumber}&pageSize=${pageSize}`
    );
    // Handle both array and object response
    if (Array.isArray(response)) {
      return response;
    }
    return response.data || response.Data || response.items || response.Items || response;
  },

  // Get tours by category
  getToursByCategory: async (category, pageNumber = 1, pageSize = 10) => {
    const response = await apiRequest(
      `/Tours/category/${category}?pageNumber=${pageNumber}&pageSize=${pageSize}`
    );
    // Handle both array and object response
    if (Array.isArray(response)) {
      return response;
    }
    return response.data || response.Data || response.items || response.Items || response;
  },

  // Check tour availability
  checkAvailability: async (id, tourDate, numberOfGuests) => {
    const queryParams = new URLSearchParams({
      tourDate: tourDate instanceof Date ? tourDate.toISOString() : tourDate,
      numberOfGuests: numberOfGuests.toString()
    });
    return await apiRequest(`/Tours/${id}/availability?${queryParams.toString()}`);
  },

  // Get available dates
  getAvailableDates: async (id, fromDate, toDate) => {
    const queryParams = new URLSearchParams({
      fromDate: fromDate instanceof Date ? fromDate.toISOString() : fromDate,
      toDate: toDate instanceof Date ? toDate.toISOString() : toDate
    });
    return await apiRequest(`/Tours/${id}/available-dates?${queryParams.toString()}`);
  },

  // Admin/Manager/Staff: Create tour
  createTour: async (tourData) => {
    return await apiRequest('/Tours', {
      method: 'POST',
      body: JSON.stringify(tourData),
    });
  },

  // Admin/Manager/Staff: Update tour
  updateTour: async (id, tourData) => {
    return await apiRequest(`/Tours/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ ...tourData, id }),
    });
  },

  // Admin/Manager: Delete tour
  deleteTour: async (id) => {
    return await apiRequest(`/Tours/${id}`, {
      method: 'DELETE',
    });
  },

  // Admin/Manager: Toggle featured status
  toggleFeatured: async (id) => {
    return await apiRequest(`/Tours/${id}/toggle-featured`, {
      method: 'PATCH',
    });
  },

  // Admin/Manager: Update tour status
  updateStatus: async (id, status) => {
    return await apiRequest(`/Tours/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(status),
    });
  },

  // Admin/Manager/Staff: Update tour statistics
  updateStatistics: async (id) => {
    return await apiRequest(`/Tours/${id}/update-statistics`, {
      method: 'POST',
    });
  },

  // Admin/Manager/Staff: Update tour rating
  updateRating: async (id) => {
    return await apiRequest(`/Tours/${id}/update-rating`, {
      method: 'POST',
    });
  },

  // Admin/Manager: Get tour statistics
  getStatistics: async () => {
    return await apiRequest('/Tours/statistics');
  },

  // Admin/Manager: Bulk update status
  bulkUpdateStatus: async (tourIds, status) => {
    return await apiRequest('/Tours/bulk/status', {
      method: 'PATCH',
      body: JSON.stringify({ tourIds, status }),
    });
  },

  // Admin/Manager: Bulk update featured
  bulkUpdateFeatured: async (tourIds, isFeatured) => {
    return await apiRequest('/Tours/bulk/featured', {
      method: 'PATCH',
      body: JSON.stringify({ tourIds, isFeatured }),
    });
  },

  // Admin: Bulk delete tours
  bulkDelete: async (tourIds) => {
    return await apiRequest('/Tours/bulk', {
      method: 'DELETE',
      body: JSON.stringify(tourIds),
    });
  },
};