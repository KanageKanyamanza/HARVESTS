import api from './api';

// Service pour les transformateurs
const transformerService = {
  // Gestion du profil
  getMyProfile: () => api.get('/transformers/me/profile'),
  updateMyProfile: (data) => api.patch('/transformers/me/profile', data),

  // Informations de l'entreprise
  getCompanyInfo: () => api.get('/transformers/me/company-info'),
  updateCompanyInfo: (data) => api.patch('/transformers/me/company-info', data),

  // Capacités de transformation
  getProcessingCapabilities: () => api.get('/transformers/me/processing-capabilities'),
  addProcessingCapability: (data) => api.post('/transformers/me/processing-capabilities', data),
  updateProcessingCapability: (capabilityId, data) => api.patch(`/transformers/me/processing-capabilities/${capabilityId}`, data),
  removeProcessingCapability: (capabilityId) => api.delete(`/transformers/me/processing-capabilities/${capabilityId}`),

  // Certifications
  getMyCertifications: () => api.get('/transformers/me/certifications'),
  addCertification: (data) => api.post('/transformers/me/certifications', data),
  updateCertification: (certId, data) => api.patch(`/transformers/me/certifications/${certId}`, data),
  removeCertification: (certId) => api.delete(`/transformers/me/certifications/${certId}`),

  // Équipements
  getMyEquipment: () => api.get('/transformers/me/equipment'),
  addEquipment: (data) => api.post('/transformers/me/equipment', data),
  updateEquipment: (equipmentId, data) => api.patch(`/transformers/me/equipment/${equipmentId}`, data),
  removeEquipment: (equipmentId) => api.delete(`/transformers/me/equipment/${equipmentId}`),

  // Capacités de stockage
  getStorageCapabilities: () => api.get('/transformers/me/storage-capabilities'),
  updateStorageCapabilities: (data) => api.patch('/transformers/me/storage-capabilities', data),

  // Services offerts
  getMyServices: () => api.get('/transformers/me/services'),
  updateMyServices: (data) => api.patch('/transformers/me/services', data),

  // Tarification
  getMyPricing: () => api.get('/transformers/me/pricing'),
  updateMyPricing: (data) => api.patch('/transformers/me/pricing', data),

  // Délais de traitement
  getProcessingTimes: () => api.get('/transformers/me/processing-times'),
  updateProcessingTimes: (data) => api.patch('/transformers/me/processing-times', data),

  // Fournisseurs préférés
  getPreferredSuppliers: () => api.get('/transformers/me/preferred-suppliers'),
  addPreferredSupplier: (data) => api.post('/transformers/me/preferred-suppliers', data),
  updateSupplierPreference: (supplierId, data) => api.patch(`/transformers/me/preferred-suppliers/${supplierId}`, data),
  removePreferredSupplier: (supplierId) => api.delete(`/transformers/me/preferred-suppliers/${supplierId}`),

  // Commandes de transformation
  getMyOrders: () => api.get('/transformers/me/orders'),
  getMyOrder: (orderId) => api.get(`/transformers/me/orders/${orderId}`),
  acceptOrder: (data) => api.post('/transformers/me/orders', data),
  updateOrderStatus: (orderId, data) => api.patch(`/transformers/me/orders/${orderId}`, data),
  cancelOrder: (orderId) => api.delete(`/transformers/me/orders/${orderId}`),
  trackOrder: (orderId) => api.get(`/transformers/me/orders/${orderId}/tracking`),
  updateOrderProgress: (orderId, data) => api.patch(`/transformers/me/orders/${orderId}/progress`, data),

  // Devis personnalisés
  getCustomQuotes: () => api.get('/transformers/me/custom-quotes'),
  getCustomQuote: (quoteId) => api.get(`/transformers/me/custom-quotes/${quoteId}`),
  createCustomQuote: (data) => api.post('/transformers/me/custom-quotes', data),
  updateCustomQuote: (quoteId, data) => api.patch(`/transformers/me/custom-quotes/${quoteId}`, data),
  deleteCustomQuote: (quoteId) => api.delete(`/transformers/me/custom-quotes/${quoteId}`),
  convertQuoteToOrder: (quoteId) => api.post(`/transformers/me/custom-quotes/${quoteId}/convert`),

  // Horaires d'opération
  getOperatingHours: () => api.get('/transformers/me/operating-hours'),
  updateOperatingHours: (data) => api.patch('/transformers/me/operating-hours', data),

  // Contrôle qualité
  getQualityControlSettings: () => api.get('/transformers/me/quality-control'),
  updateQualityControlSettings: (data) => api.patch('/transformers/me/quality-control', data),

  // Rapports de qualité
  getQualityReports: () => api.get('/transformers/me/quality-reports'),
  createQualityReport: (data) => api.post('/transformers/me/quality-reports', data),

  // Lots de production
  getProductionBatches: () => api.get('/transformers/me/production-batches'),
  getProductionBatch: (batchId) => api.get(`/transformers/me/production-batches/${batchId}`),
  createProductionBatch: (data) => api.post('/transformers/me/production-batches', data),
  updateProductionBatch: (batchId, data) => api.patch(`/transformers/me/production-batches/${batchId}`, data),
  getBatchTraceability: (batchId) => api.get(`/transformers/me/production-batches/${batchId}/traceability`),

  // Gestion des déchets
  getWasteManagement: () => api.get('/transformers/me/waste-management'),
  updateWasteManagement: (data) => api.patch('/transformers/me/waste-management', data),

  // Statistiques et analytics
  getBusinessStats: () => api.get('/transformers/me/business-stats'),
  getProductionAnalytics: () => api.get('/transformers/me/production-analytics'),
  getEfficiencyMetrics: () => api.get('/transformers/me/efficiency-metrics'),
  getRevenueAnalytics: () => api.get('/transformers/me/revenue-analytics'),

  // Contrats avec clients
  getContracts: () => api.get('/transformers/me/contracts'),
  getContract: (contractId) => api.get(`/transformers/me/contracts/${contractId}`),
  createContract: (data) => api.post('/transformers/me/contracts', data),
  updateContract: (contractId, data) => api.patch(`/transformers/me/contracts/${contractId}`, data),
  terminateContract: (contractId) => api.delete(`/transformers/me/contracts/${contractId}`),

  // Évaluations et avis
  getMyReviews: () => api.get('/transformers/me/reviews'),
  respondToReview: (reviewId, data) => api.patch(`/transformers/me/reviews/${reviewId}/response`, data),

  // Gestion des réclamations
  getComplaints: () => api.get('/transformers/me/complaints'),
  handleComplaint: (data) => api.post('/transformers/me/complaints', data),
  updateComplaint: (complaintId, data) => api.patch(`/transformers/me/complaints/${complaintId}`, data),

  // Planification de la production
  getProductionPlanning: () => api.get('/transformers/me/production-planning'),
  createProductionPlan: (data) => api.post('/transformers/me/production-planning', data),
  updateProductionPlan: (planId, data) => api.patch(`/transformers/me/production-planning/${planId}`, data),
  deleteProductionPlan: (planId) => api.delete(`/transformers/me/production-planning/${planId}`),

  // Gestion des maintenances
  getMaintenanceSchedule: () => api.get('/transformers/me/maintenance-schedule'),
  scheduleMaintenance: (data) => api.post('/transformers/me/maintenance-schedule', data),
  getMaintenanceRecords: () => api.get('/transformers/me/maintenance-records'),
  addMaintenanceRecord: (data) => api.post('/transformers/me/maintenance-records', data),

  // Documents légaux
  getMyDocuments: () => api.get('/transformers/me/documents'),
  addDocument: (data) => api.post('/transformers/me/documents', data),

  // Notifications
  getNotifications: () => api.get('/transformers/me/notifications'),
  markNotificationsAsRead: (data) => api.patch('/transformers/me/notifications', data),

  // Alertes de production
  getProductionAlerts: () => api.get('/transformers/me/production-alerts'),
  createProductionAlert: (data) => api.post('/transformers/me/production-alerts', data),

  // Rapports de conformité
  getComplianceReports: () => api.get('/transformers/me/compliance-reports'),
  generateComplianceReport: (data) => api.post('/transformers/me/compliance-reports', data),

  // Routes publiques pour recherche
  getAllTransformers: (params) => api.get('/transformers', { params }),
  searchTransformers: (params) => api.get('/transformers/search', { params }),
  getTransformersByRegion: (region) => api.get(`/transformers/by-region/${region}`),
  getTransformersByType: (type) => api.get(`/transformers/by-type/${type}`),
  getTransformer: (id) => api.get(`/transformers/${id}`),
  getTransformerServices: (id) => api.get(`/transformers/${id}/services`),
  getTransformerReviews: (id) => api.get(`/transformers/${id}/reviews`)
};

export default transformerService;

