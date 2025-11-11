import { apiRequest } from './api';

export const reviewService = {
  // Get tour reviews (Public)
  getTourReviews: async (tourId, pageNumber = 1, pageSize = 10) => {
    return await apiRequest(`/Reviews/tour/${tourId}?pageNumber=${pageNumber}&pageSize=${pageSize}`);
  },

  // Get tour review statistics
  getTourStatistics: async (tourId) => {
    return await apiRequest(`/Reviews/tour/${tourId}/statistics`);
  },

  // Get tour review summary
  getTourSummary: async (tourId) => {
    return await apiRequest(`/Reviews/tour/${tourId}/summary`);
  },

  // Get review by ID
  getReviewById: async (id) => {
    return await apiRequest(`/Reviews/${id}`);
  },

  // Mark review as helpful
  markHelpful: async (id) => {
    return await apiRequest(`/Reviews/${id}/helpful`, {
      method: 'POST',
    });
  },

  // Search reviews
  searchReviews: async (searchParams) => {
    const queryParams = new URLSearchParams();
    Object.keys(searchParams).forEach(key => {
      if (searchParams[key] !== null && searchParams[key] !== undefined && searchParams[key] !== '') {
        queryParams.append(key, searchParams[key]);
      }
    });
    return await apiRequest(`/Reviews/search?${queryParams.toString()}`);
  },

  // Get my reviews
  getMyReviews: async () => {
    return await apiRequest('/Reviews/my-reviews');
  },

  // Check if user reviewed tour
  checkReviewed: async (tourId) => {
    return await apiRequest(`/Reviews/check/${tourId}`);
  },

  // Get review by booking
  getReviewByBooking: async (bookingId) => {
    return await apiRequest(`/Reviews/booking/${bookingId}`);
  },

  // Create review
  createReview: async (reviewData) => {
    return await apiRequest('/Reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  },

  // Update review
  updateReview: async (id, reviewData) => {
    return await apiRequest(`/Reviews/${id}`, {
      method: 'PUT',
      body: JSON.stringify(reviewData),
    });
  },

  // Delete review
  deleteReview: async (id) => {
    return await apiRequest(`/Reviews/${id}`, {
      method: 'DELETE',
    });
  },

  // Admin: Get pending reviews
  getPendingReviews: async (pageNumber = 1, pageSize = 20) => {
    return await apiRequest(`/Reviews/pending?pageNumber=${pageNumber}&pageSize=${pageSize}`);
  },

  // Admin: Get pending count
  getPendingCount: async () => {
    return await apiRequest('/Reviews/pending/count');
  },

  // Admin: Approve review
  approveReview: async (id) => {
    return await apiRequest(`/Reviews/${id}/approve`, {
      method: 'POST',
    });
  },

  // Admin: Reject review
  rejectReview: async (id) => {
    return await apiRequest(`/Reviews/${id}/reject`, {
      method: 'POST',
    });
  },
};

