/**
 * Index central pour toutes les routes
 */
export { adminRoutes } from './admin/adminRoutes.jsx';
export { consumerRoutes } from './consumer/consumerRoutes.jsx';
export { producerRoutes } from './producer/producerRoutes.jsx';
export { transformerRoutes } from './transformer/transformerRoutes.jsx';
export { restaurateurRoutes } from './restaurateur/restaurateurRoutes.jsx';
export { transporterRoutes } from './transporter/transporterRoutes.jsx';
export { exporterRoutes } from './exporter/exporterRoutes.jsx';

// Import de toutes les routes pour faciliter l'utilisation
import { adminRoutes } from './admin/adminRoutes.jsx';
import { consumerRoutes } from './consumer/consumerRoutes.jsx';
import { producerRoutes } from './producer/producerRoutes.jsx';
import { transformerRoutes } from './transformer/transformerRoutes.jsx';
import { restaurateurRoutes } from './restaurateur/restaurateurRoutes.jsx';
import { transporterRoutes } from './transporter/transporterRoutes.jsx';
import { exporterRoutes } from './exporter/exporterRoutes.jsx';

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
