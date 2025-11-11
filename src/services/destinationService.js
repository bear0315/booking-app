import { apiRequest } from './api';

export const destinationService = {
  // Get all destinations
  getAllDestinations: async (pageNumber = 1, pageSize = 10) => {
    return await apiRequest(`/Destinations?pageNumber=${pageNumber}&pageSize=${pageSize}`);
  },

  // Get active destinations
  getActiveDestinations: async () => {
    const response = await apiRequest('/Destinations/active');
    // Handle both array and object response
    if (Array.isArray(response)) {
      return response;
    }
    return response.data || response.Data || response.items || response.Items || response;
  },

  // Get popular destinations
  getPopularDestinations: async (take = 10) => {
    const response = await apiRequest(`/Destinations/popular?take=${take}`);
    // Handle both array and object response
    if (Array.isArray(response)) {
      return response;
    }
    return response.data || response.Data || response.items || response.Items || response;
  },

  // Get featured destinations
  getFeaturedDestinations: async (take = 10) => {
    const response = await apiRequest(`/Destinations/featured?take=${take}`);
    // Handle both array and object response
    if (Array.isArray(response)) {
      return response;
    }
    return response.data || response.Data || response.items || response.Items || response;
  },

  // Search destinations
  searchDestinations: async (searchParams) => {
    const queryParams = new URLSearchParams();
    Object.keys(searchParams).forEach(key => {
      if (searchParams[key] !== null && searchParams[key] !== undefined && searchParams[key] !== '') {
        queryParams.append(key, searchParams[key]);
      }
    });
    return await apiRequest(`/Destinations/search?${queryParams.toString()}`);
  },

  // Get destination by ID
  getDestinationById: async (id) => {
    return await apiRequest(`/Destinations/${id}`);
  },

  // Get destination by slug
  getDestinationBySlug: async (slug) => {
    return await apiRequest(`/Destinations/slug/${slug}`);
  },

  // Get all countries
  getAllCountries: async () => {
    return await apiRequest('/Destinations/countries');
  },

  // Admin: Create destination
  createDestination: async (destinationData) => {
    return await apiRequest('/Destinations', {
      method: 'POST',
      body: JSON.stringify(destinationData),
    });
  },

  // Admin: Update destination
  updateDestination: async (id, destinationData) => {
    return await apiRequest(`/Destinations/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ ...destinationData, id }),
    });
  },

  // Admin: Delete destination
  deleteDestination: async (id) => {
    return await apiRequest(`/Destinations/${id}`, {
      method: 'DELETE',
    });
  },

  // Admin: Toggle featured
  toggleFeatured: async (id) => {
    return await apiRequest(`/Destinations/${id}/toggle-featured`, {
      method: 'PATCH',
    });
  },
};

