import api from './api';

export const paymentService = {
  initiatePayment: (data) => api.post('/payments/initiate', data),
  confirmPayment: (paymentId, data) => api.post(`/payments/${paymentId}/confirm`, data),
  getClientToken: () => api.get('/payments/paypal/client-token'),
};

export default paymentService;

