import api from './api';

export const paymentService = {
  initiatePayment: (data) => api.post('/payments/initiate', data),
  confirmPayment: (paymentId, data) => api.post(`/payments/${paymentId}/confirm`, data),
  // Jour 79 — parcours mobile money : opérateurs du pays, repoll /status et
  // relance d'un payin depuis la page d'attente.
  getAfribapayOperators: (country) =>
    api.get('/payments/afribapay/operators', { params: { country } }),
  getAfribapayStatus: (paymentId) =>
    api.get(`/payments/${paymentId}/afribapay/status`),
  retryAfribapayPayment: (paymentId, data) =>
    api.post(`/payments/${paymentId}/afribapay/retry`, data),
  getClientToken: () => api.get('/payments/paypal/client-token'),
  createOrderForHostedFields: (data) => api.post('/payments/paypal/hosted-fields/order', data),
};

export default paymentService;
