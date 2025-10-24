/**
 * Index principal pour la navigation
 */
export { default as NavigationManager } from './NavigationManager.jsx';
export { 
  generateUserNavigation, 
  generateSidebarNavigation, 
  generateQuickActions 
} from './NavigationManager.jsx';

export { 
  allRoutes, 
  getRoutesForUserType, 
  getAllRoutes,
  adminRoutes,
  consumerRoutes,
  producerRoutes,
  transformerRoutes,
  restaurateurRoutes,
  transporterRoutes,
  exporterRoutes
} from './routes';

// Import pour l'export par défaut
import NavigationManager from './NavigationManager.jsx';
import { 
  generateUserNavigation, 
  generateSidebarNavigation, 
  generateQuickActions 
} from './NavigationManager.jsx';
import { 
  allRoutes, 
  getRoutesForUserType, 
  getAllRoutes 
} from './routes';

export default {
  NavigationManager,
  generateUserNavigation,
  generateSidebarNavigation,
  generateQuickActions,
  allRoutes,
  getRoutesForUserType,
  getAllRoutes
};
