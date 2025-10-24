/**
 * Index central pour toutes les routes
 */
export { adminRoutes } from './admin/adminRoutes';
export { consumerRoutes } from './consumer/consumerRoutes';
export { producerRoutes } from './producer/producerRoutes';
export { transformerRoutes } from './transformer/transformerRoutes';
export { restaurateurRoutes } from './restaurateur/restaurateurRoutes';
export { transporterRoutes } from './transporter/transporterRoutes';
export { exporterRoutes } from './exporter/exporterRoutes';

// Import de toutes les routes pour faciliter l'utilisation
import { adminRoutes } from './admin/adminRoutes';
import { consumerRoutes } from './consumer/consumerRoutes';
import { producerRoutes } from './producer/producerRoutes';
import { transformerRoutes } from './transformer/transformerRoutes';
import { restaurateurRoutes } from './restaurateur/restaurateurRoutes';
import { transporterRoutes } from './transporter/transporterRoutes';
import { exporterRoutes } from './exporter/exporterRoutes';

/**
 * Toutes les routes groupées par type d'utilisateur
 */
export const allRoutes = {
  admin: adminRoutes,
  consumer: consumerRoutes,
  producer: producerRoutes,
  transformer: transformerRoutes,
  restaurateur: restaurateurRoutes,
  transporter: transporterRoutes,
  exporter: exporterRoutes
};

/**
 * Obtient les routes pour un type d'utilisateur spécifique
 * @param {string} userType - Le type d'utilisateur
 * @returns {Array} - Les routes pour ce type d'utilisateur
 */
export const getRoutesForUserType = (userType) => {
  return allRoutes[userType] || [];
};

/**
 * Obtient toutes les routes sous forme de tableau plat
 * @returns {Array} - Toutes les routes
 */
export const getAllRoutes = () => {
  return Object.values(allRoutes).flat();
};

export default allRoutes;
