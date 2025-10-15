import api from './api';

// Service pour les restaurateurs
const restaurateurService = {
  // Gestion du profil
  getMyProfile: () => api.get('/restaurateurs/me/profile'),
  updateMyProfile: (data) => api.patch('/restaurateurs/me/profile', data),
  
  // Informations de l'entreprise
  getCompanyInfo: () => api.get('/restaurateurs/me/company-info'),
  updateCompanyInfo: (data) => api.patch('/restaurateurs/me/company-info', data),
  
  // Gestion des besoins d'approvisionnement
  getProcurementNeeds: () => api.get('/restaurateurs/me/procurement-needs'),
  updateProcurementNeeds: (data) => api.patch('/restaurateurs/me/procurement-needs', data),
  addProcurementNeed: (data) => api.post('/restaurateurs/me/procurement-needs', data),
  updateProcurementNeed: (needId, data) => api.patch(`/restaurateurs/me/procurement-needs/${needId}`, data),
  deleteProcurementNeed: (needId) => api.delete(`/restaurateurs/me/procurement-needs/${needId}`),
  
  // Gestion des fournisseurs préférés
  getPreferredSuppliers: (params = {}) => api.get('/restaurateurs/me/preferred-suppliers', { params }),
  addPreferredSupplier: (data) => api.post('/restaurateurs/me/preferred-suppliers', data),
  updatePreferredSupplier: (supplierId, data) => api.patch(`/restaurateurs/me/preferred-suppliers/${supplierId}`, data),
  removePreferredSupplier: (supplierId) => api.delete(`/restaurateurs/me/preferred-suppliers/${supplierId}`),
  
  // Découverte de fournisseurs
  discoverSuppliers: (params = {}) => api.get('/restaurateurs/suppliers/discover', { params }),
  searchSuppliers: (params = {}) => api.get('/restaurateurs/suppliers/search', { params }),
  getSupplierDetails: (supplierId) => api.get(`/restaurateurs/suppliers/${supplierId}`),
  
  // Profils publics
  getAllRestaurateurs: (params = {}) => api.get('/restaurateurs', { params }),
  getRestaurateur: (id) => api.get(`/restaurateurs/${id}`),
  getRestaurateurDishes: (id) => api.get(`/restaurateurs/${id}/dishes`),
  
  // Gestion des commandes
  getOrders: (params = {}) => api.get('/restaurateurs/me/orders', { params }),
  getOrder: (orderId) => api.get(`/restaurateurs/me/orders/${orderId}`),
  createOrder: (data) => api.post('/restaurateurs/me/orders', data),
  updateOrder: (orderId, data) => api.patch(`/restaurateurs/me/orders/${orderId}`, data),
  cancelOrder: (orderId) => api.patch(`/restaurateurs/me/orders/${orderId}/cancel`),
  
  // Gestion des horaires d'ouverture
  getOperatingHours: () => api.get('/restaurateurs/me/operating-hours'),
  updateOperatingHours: (data) => api.patch('/restaurateurs/me/operating-hours', data),
  
  // Gestion des certifications
  getCertifications: () => api.get('/restaurateurs/me/certifications'),
  addCertification: (data) => api.post('/restaurateurs/me/certifications', data),
  updateCertification: (certId, data) => api.patch(`/restaurateurs/me/certifications/${certId}`, data),
  deleteCertification: (certId) => api.delete(`/restaurateurs/me/certifications/${certId}`),
  uploadCertificationDocument: (certId, formData) => api.post(`/restaurateurs/me/certifications/${certId}/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  
  // Gestion des équipements de cuisine
  getKitchenEquipment: () => api.get('/restaurateurs/me/kitchen-equipment'),
  addKitchenEquipment: (data) => api.post('/restaurateurs/me/kitchen-equipment', data),
  updateKitchenEquipment: (equipmentId, data) => api.patch(`/restaurateurs/me/kitchen-equipment/${equipmentId}`, data),
  deleteKitchenEquipment: (equipmentId) => api.delete(`/restaurateurs/me/kitchen-equipment/${equipmentId}`),
  
  // Gestion de la capacité de stockage
  getStorageCapacity: () => api.get('/restaurateurs/me/storage-capacity'),
  updateStorageCapacity: (data) => api.patch('/restaurateurs/me/storage-capacity', data),
  
  // Gestion des informations financières
  getBankAccount: () => api.get('/restaurateurs/me/bank-account'),
  updateBankAccount: (data) => api.patch('/restaurateurs/me/bank-account', data),
  verifyBankAccount: () => api.post('/restaurateurs/me/bank-account/verify'),
  
  // Gestion des préférences de paiement
  getPaymentPreferences: () => api.get('/restaurateurs/me/payment-preferences'),
  updatePaymentPreferences: (data) => api.patch('/restaurateurs/me/payment-preferences', data),
  
  // Gestion des services additionnels
  getAdditionalServices: () => api.get('/restaurateurs/me/additional-services'),
  updateAdditionalServices: (data) => api.patch('/restaurateurs/me/additional-services', data),
  
  // Gestion des plats
  getMyDishes: () => api.get('/restaurateurs/me/dishes'),
  addDish: (data) => api.post('/restaurateurs/me/dishes', data),
  updateDish: (dishId, data) => api.patch(`/restaurateurs/me/dishes/${dishId}`, data),
  deleteDish: (dishId) => api.delete(`/restaurateurs/me/dishes/${dishId}`),
  
  // Gestion des préférences de livraison
  getDeliveryPreferences: () => api.get('/restaurateurs/me/delivery-preferences'),
  updateDeliveryPreferences: (data) => api.patch('/restaurateurs/me/delivery-preferences', data),
  
  // Gestion des documents légaux
  getDocuments: () => api.get('/restaurateurs/me/documents'),
  uploadDocument: (documentType, formData) => api.post(`/restaurateurs/me/documents/${documentType}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  verifyDocument: (documentType) => api.post(`/restaurateurs/me/documents/${documentType}/verify`),
  
  // Statistiques et analytics
  getStats: () => api.get('/restaurateurs/me/stats'),
  getBusinessStats: () => api.get('/restaurateurs/me/business-stats'),
  getPurchaseAnalytics: () => api.get('/restaurateurs/me/purchase-analytics'),
  getSupplierAnalytics: () => api.get('/restaurateurs/me/supplier-analytics'),
  
  // Gestion des contrats avec fournisseurs
  getContracts: () => api.get('/restaurateurs/me/contracts'),
  getContract: (contractId) => api.get(`/restaurateurs/me/contracts/${contractId}`),
  createContract: (data) => api.post('/restaurateurs/me/contracts', data),
  updateContract: (contractId, data) => api.patch(`/restaurateurs/me/contracts/${contractId}`, data),
  terminateContract: (contractId) => api.delete(`/restaurateurs/me/contracts/${contractId}`),
  
  // Évaluations et avis
  getMyReviews: () => api.get('/restaurateurs/me/reviews'),
  getSupplierReviews: (supplierId) => api.get(`/restaurateurs/suppliers/${supplierId}/reviews`),
  createReview: (data) => api.post('/restaurateurs/me/reviews', data),
  updateReview: (reviewId, data) => api.patch(`/restaurateurs/me/reviews/${reviewId}`, data),
  
  // Gestion des réclamations
  getComplaints: () => api.get('/restaurateurs/me/complaints'),
  createComplaint: (data) => api.post('/restaurateurs/me/complaints', data),
  updateComplaint: (complaintId, data) => api.patch(`/restaurateurs/me/complaints/${complaintId}`, data),
  
  // Notifications et alertes
  getNotifications: () => api.get('/restaurateurs/me/notifications'),
  markNotificationsAsRead: () => api.patch('/restaurateurs/me/notifications/read'),
  
  // Alertes d'approvisionnement
  getProcurementAlerts: () => api.get('/restaurateurs/me/procurement-alerts'),
  createProcurementAlert: (data) => api.post('/restaurateurs/me/procurement-alerts', data),
  updateProcurementAlert: (alertId, data) => api.patch(`/restaurateurs/me/procurement-alerts/${alertId}`, data),
  deleteProcurementAlert: (alertId) => api.delete(`/restaurateurs/me/procurement-alerts/${alertId}`),
  
  // Gestion des menus et plannings
  getMenus: () => api.get('/restaurateurs/me/menus'),
  createMenu: (data) => api.post('/restaurateurs/me/menus', data),
  updateMenu: (menuId, data) => api.patch(`/restaurateurs/me/menus/${menuId}`, data),
  deleteMenu: (menuId) => api.delete(`/restaurateurs/me/menus/${menuId}`),
  
  getMealPlanning: () => api.get('/restaurateurs/me/meal-planning'),
  createMealPlan: (data) => api.post('/restaurateurs/me/meal-planning', data),
  updateMealPlan: (planId, data) => api.patch(`/restaurateurs/me/meal-planning/${planId}`, data),
  deleteMealPlan: (planId) => api.delete(`/restaurateurs/me/meal-planning/${planId}`),
  
  // Gestion des événements et traiteurs
  getEvents: () => api.get('/restaurateurs/me/events'),
  createEvent: (data) => api.post('/restaurateurs/me/events', data),
  updateEvent: (eventId, data) => api.patch(`/restaurateurs/me/events/${eventId}`, data),
  deleteEvent: (eventId) => api.delete(`/restaurateurs/me/events/${eventId}`),
  
  // Gestion des livraisons
  getDeliveries: () => api.get('/restaurateurs/me/deliveries'),
  getDelivery: (deliveryId) => api.get(`/restaurateurs/me/deliveries/${deliveryId}`),
  updateDeliveryStatus: (deliveryId, data) => api.patch(`/restaurateurs/me/deliveries/${deliveryId}/status`, data),
  
  // Gestion des factures et paiements
  getInvoices: () => api.get('/restaurateurs/me/invoices'),
  getInvoice: (invoiceId) => api.get(`/restaurateurs/me/invoices/${invoiceId}`),
  payInvoice: (invoiceId, data) => api.post(`/restaurateurs/me/invoices/${invoiceId}/pay`, data),
  
  // Gestion des rapports
  getReports: () => api.get('/restaurateurs/me/reports'),
  generateReport: (reportType, params = {}) => api.post(`/restaurateurs/me/reports/${reportType}`, params),
  getReport: (reportId) => api.get(`/restaurateurs/me/reports/${reportId}`),
  
  // Gestion des paramètres
  getSettings: () => api.get('/restaurateurs/me/settings'),
  updateSettings: (data) => api.patch('/restaurateurs/me/settings', data),
  
  // Gestion des préférences de notification
  getNotificationPreferences: () => api.get('/restaurateurs/me/notification-preferences'),
  updateNotificationPreferences: (data) => api.patch('/restaurateurs/me/notification-preferences', data),
  
  // Gestion des intégrations
  getIntegrations: () => api.get('/restaurateurs/me/integrations'),
  connectIntegration: (integrationType, data) => api.post(`/restaurateurs/me/integrations/${integrationType}`, data),
  disconnectIntegration: (integrationType) => api.delete(`/restaurateurs/me/integrations/${integrationType}`),
  
  // Gestion des sauvegardes et exports
  exportData: (dataType) => api.get(`/restaurateurs/me/export/${dataType}`),
  importData: (dataType, formData) => api.post(`/restaurateurs/me/import/${dataType}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
};

export default restaurateurService;
