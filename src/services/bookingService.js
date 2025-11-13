import { apiRequest } from './api';

export const bookingService = {
  getAllBookings: async (page = 1, pageSize = 10, status = null) => {
    let url = `/Bookings?page=${page}&pageSize=${pageSize}`;
    if (status) {
      url += `&status=${status}`;
    }
    return await apiRequest(url);
  },

  getBookingById: async (id) => {
    return await apiRequest(`/Bookings/${id}`);
  },

  getBookingByCode: async (bookingCode) => {
    return await apiRequest(`/Bookings/code/${bookingCode}`);
  },

  getMyBookings: async (page = 1, pageSize = 10) => {
    return await apiRequest(`/Bookings/my-bookings?page=${page}&pageSize=${pageSize}`);
  },

  getBookingsByTour: async (tourId, page = 1, pageSize = 10) => {
    return await apiRequest(`/Bookings/tour/${tourId}?page=${page}&pageSize=${pageSize}`);
  },

  getBookingsByGuide: async (guideId, page = 1, pageSize = 10) => {
    return await apiRequest(`/Bookings/guide/${guideId}?page=${page}&pageSize=${pageSize}`);
  },

  getAvailableGuides: async (tourId, tourDate) => {
    return await apiRequest(
      `/Bookings/available-guides?tourId=${tourId}&tourDate=${tourDate}`
    );
  },

  assignGuideToBooking: async (bookingId, guideId, reason = null) => {
    return await apiRequest(`/Bookings/${bookingId}/assign-guide`, {
      method: 'PATCH',
      body: JSON.stringify({
        guideId: guideId,
        reason: reason
      }),
    });
  },

  removeGuideFromBooking: async (bookingId) => {
    return await apiRequest(`/Bookings/${bookingId}/guide`, {
      method: 'DELETE',
    });
  },

  // Create booking
  createBooking: async (bookingData) => {
    return await apiRequest('/Bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  },

  // Update booking
  updateBooking: async (id, bookingData) => {
    return await apiRequest(`/Bookings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(bookingData),
    });
  },

  // Update booking status (Admin only)
  updateBookingStatus: async (id, statusData) => {
    return await apiRequest(`/Bookings/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(statusData),
    });
  },

  // Cancel booking
  cancelBooking: async (id, cancelData) => {
    return await apiRequest(`/Bookings/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify(cancelData),
    });
  },

  // Delete booking (Admin only)
  deleteBooking: async (id) => {
    return await apiRequest(`/Bookings/${id}`, {
      method: 'DELETE',
    });
  },
};