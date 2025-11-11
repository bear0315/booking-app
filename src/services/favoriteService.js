import { apiRequest } from './api';

export const favoriteService = {
  // Get my favorites
  getMyFavorites: async () => {
    return await apiRequest('/Favorites/my-favorites');
  },

  // Get my favorite tours with pagination
  getMyFavoriteTours: async (pageNumber = 1, pageSize = 10) => {
    return await apiRequest(`/Favorites/my-favorite-tours?pageNumber=${pageNumber}&pageSize=${pageSize}`);
  },

  // Check if tour is favorite
  checkFavorite: async (tourId) => {
    return await apiRequest(`/Favorites/check/${tourId}`);
  },

  // Check multiple favorites
  checkMultipleFavorites: async (tourIds) => {
    return await apiRequest('/Favorites/check-multiple', {
      method: 'POST',
      body: JSON.stringify(tourIds),
    });
  },

  // Add favorite
  addFavorite: async (tourId) => {
    return await apiRequest('/Favorites', {
      method: 'POST',
      body: JSON.stringify({ tourId }),
    });
  },

  // Remove favorite
  removeFavorite: async (tourId) => {
    return await apiRequest(`/Favorites/${tourId}`, {
      method: 'DELETE',
    });
  },

  // Toggle favorite
  toggleFavorite: async (tourId) => {
    return await apiRequest(`/Favorites/toggle/${tourId}`, {
      method: 'POST',
    });
  },

  // Get favorite count (Public)
  getFavoriteCount: async (tourId) => {
    return await apiRequest(`/Favorites/tour/${tourId}/count`);
  },
};

