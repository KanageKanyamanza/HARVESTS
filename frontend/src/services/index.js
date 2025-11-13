// Export de tous les services
export { authService } from './authService';
export { 
  producerService, 
  consumerService, 
  transformerService, 
  restaurateurService, 
  transporterService, 
  exporterService,
  explorerService 
} from './genericService';
export { userService } from './userService';
export { productService } from './productService';
export { orderService } from './orderService';
export { notificationService } from './notificationService';
export { reviewService } from './reviewService';
export { paymentService } from './paymentService';
export { subscriptionService } from './subscriptionService';
export { default as uploadService } from './uploadService';
export { default as profileService } from './profileService';
export { default as commonService } from './commonService';

// Export de l'instance API de base
export { default as api } from './api';
