import { apiRequest } from './api';

export const paymentService = {
  // Create VNPay payment URL
  createPaymentUrl: async (bookingId) => {
    return await apiRequest('/Payment/vnpay/create', {
      method: 'POST',
      body: JSON.stringify({ bookingId }),
    });
  },

  // Check payment status
  checkPaymentStatus: async (bookingId) => {
    return await apiRequest(`/Payment/status/${bookingId}`);
  },
};

