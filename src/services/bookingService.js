import { apiRequest } from './api';

export const bookingService = {
  // Get all bookings (Admin only)
  getAllBookings: async (page = 1, pageSize = 10, status = null) => {
    let url = `/Bookings?page=${page}&pageSize=${pageSize}`;
    if (status) {
      url += `&status=${status}`;
    }
    return await apiRequest(url);
  },

  // Get booking by ID
  getBookingById: async (id) => {
    return await apiRequest(`/Bookings/${id}`);
  },

  // Get booking by booking code
  getBookingByCode: async (bookingCode) => {
    return await apiRequest(`/Bookings/code/${bookingCode}`);
  },

  // Get current user's bookings
  getMyBookings: async (page = 1, pageSize = 10) => {
    return await apiRequest(`/Bookings/my-bookings?page=${page}&pageSize=${pageSize}`);
  },

  // Get bookings by tour ID
  getBookingsByTour: async (tourId, page = 1, pageSize = 10) => {
    return await apiRequest(`/Bookings/tour/${tourId}?page=${page}&pageSize=${pageSize}`);
  },

  // Get bookings by guide ID
  getBookingsByGuide: async (guideId, page = 1, pageSize = 10) => {
    return await apiRequest(`/Bookings/guide/${guideId}?page=${page}&pageSize=${pageSize}`);
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

