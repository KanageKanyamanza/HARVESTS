// Utilitaires pour l'authentification

import { saveAuthData } from './authStorage';
import { AUTH_ACTIONS } from '../authTypes';

// Fonction pour mettre à jour l'utilisateur directement (sans appel API)
export const setUser = (updatedUser, token, dispatch) => {
  if (!updatedUser) return;
  
  saveAuthData(updatedUser, token);
  dispatch({
    type: AUTH_ACTIONS.UPDATE_PROFILE,
    payload: updatedUser,
  });
};

// Fonction pour mettre à jour l'activité utilisateur
export const updateActivity = (dispatch) => {
  dispatch({ type: AUTH_ACTIONS.UPDATE_LAST_ACTIVITY });
};

// Fonction pour vérifier si le token est expiré
export const isTokenExpired = (tokenExpiry) => {
  if (!tokenExpiry) return false;
  return new Date() > new Date(tokenExpiry);
};

// Fonction pour créer la valeur du contexte
export const createContextValue = (state, actions, helpers) => {
  const { hasPermission, canAccessRoute, getDefaultRoute } = helpers;
  
  return {
    // État
    ...state,
    
    // Actions
    ...actions,
    
    // Fonctions utilitaires de type d'utilisateur
    isProducer: state.user?.userType === 'producer',
    isConsumer: state.user?.userType === 'consumer',
    isTransformer: state.user?.userType === 'transformer',
    isRestaurateur: state.user?.userType === 'restaurateur',
    isExporter: state.user?.userType === 'exporter',
    isTransporter: state.user?.userType === 'transporter',
    isExplorer: state.user?.userType === 'explorer',
    userType: state.user?.userType || null,
    
    // Vérifications de statut
    isEmailVerified: state.user?.isEmailVerified || false,
    isAccountApproved: state.user?.isApproved || false,
    isAccountActive: state.user?.isActive || false,
    isProfileComplete: state.user?.isProfileComplete || false,
    
    // Fonctions de gestion des permissions et routes
    hasPermission: (permission) => hasPermission(state.user?.userType, permission),
    canAccessRoute: (route) => canAccessRoute(route, state.user?.userType, state.isAuthenticated, state.user?.role),
    getDefaultRoute: () => getDefaultRoute(state.user?.userType, state.user?.role),
    isTokenExpired: () => isTokenExpired(state.tokenExpiry),
    
    // Informations utilisateur enrichies
    userDisplayName: state.user ? `${state.user.firstName} ${state.user.lastName || ''}`.trim() : null,
    userInitials: state.user ? `${state.user.firstName?.charAt(0) || ''}${state.user.lastName?.charAt(0) || ''}`.toUpperCase() : null,
    userPreferences: {
      language: state.user?.preferredLanguage || 'fr',
      country: state.user?.country || 'SN',
      currency: state.user?.preferredCurrency || 'XAF',
    },
  };
};

