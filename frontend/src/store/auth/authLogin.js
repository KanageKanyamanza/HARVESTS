// Fonctions de connexion et d'inscription

import { authService } from '../../services';
import { adminAuthService } from '../../services/adminAuthService';
import { saveAuthData } from './authStorage';
import { AUTH_ACTIONS } from '../authTypes';

export const login = async (credentials, dispatch) => {
  try {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });

    let response;
    let user;
    let token;

    // Essayer d'abord l'authentification admin
    try {
      response = await adminAuthService.login(credentials);
      const { admin } = response.data.data;
      token = response.data.token;
      
      // Convertir l'admin en format utilisateur pour la compatibilité
      user = {
        ...admin,
        role: 'admin', // Toujours 'admin' pour l'interface
        userType: 'admin',
        originalRole: admin.role // Garder le rôle original pour référence
      };
      
      console.log('✅ Connexion admin réussie');
    } catch {
      // Si l'auth admin échoue, essayer l'auth normale
      // Ne pas logger l'erreur admin car c'est normal pour les utilisateurs non-admin
      response = await authService.login(credentials);
      user = response.data.data.user;
      token = response.data.token;
      
      console.log('✅ Connexion utilisateur normale réussie');
    }

    // Sauvegarder dans localStorage
    saveAuthData(user, token);

    // Ajouter le statut d'approbation à l'utilisateur
    const userWithApprovalStatus = {
      ...user,
      approvalStatus: {
        isApproved: user.isApproved,
        needsApproval: ['producer', 'transformer', 'exporter', 'transporter'].includes(user.userType),
        canAccessDashboard: true,
        canPerformOperations: user.isApproved || !['producer', 'transformer', 'exporter', 'transporter'].includes(user.userType)
      }
    };

    dispatch({
      type: AUTH_ACTIONS.LOGIN_SUCCESS,
      payload: { user: userWithApprovalStatus, token },
    });

    return { success: true, user: userWithApprovalStatus, token };
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Erreur de connexion';
    
    dispatch({
      type: AUTH_ACTIONS.LOGIN_FAILURE,
      payload: errorMessage,
    });

    return { success: false, error: errorMessage };
  }
};

export const register = async (userData, dispatch) => {
  try {
    dispatch({ type: AUTH_ACTIONS.REGISTER_START });

    const response = await authService.register(userData);

    dispatch({ type: AUTH_ACTIONS.REGISTER_SUCCESS });

    return { 
      success: true, 
      message: response.data.message || 'Inscription réussie' 
    };
  } catch (error) {
    let errorMessage = 'Erreur d\'inscription';
    
    // Gérer les erreurs de timeout
    if (error.isTimeout) {
      errorMessage = 'La requête a pris trop de temps. Veuillez réessayer.';
    } 
    // Gérer les erreurs de serveur
    else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    }
    // Gérer les erreurs réseau
    else if (error.code === 'NETWORK_ERROR' || !error.response) {
      errorMessage = 'Problème de connexion. Vérifiez votre connexion internet.';
    }
    
    dispatch({
      type: AUTH_ACTIONS.REGISTER_FAILURE,
      payload: errorMessage,
    });

    return { success: false, error: errorMessage };
  }
};

export const logout = async (dispatch, clearAuthData) => {
  try {
    dispatch({ type: AUTH_ACTIONS.LOGOUT_START });
    
    // Appeler l'API de déconnexion si nécessaire
    try {
      await authService.logout();
    } catch (error) {
      console.warn('Erreur lors de la déconnexion API:', error);
      // Continuer même si l'API échoue
    }
    
    clearAuthData();
    
    dispatch({ type: AUTH_ACTIONS.LOGOUT_SUCCESS });
    
    return { success: true };
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
    clearAuthData();
    dispatch({ type: AUTH_ACTIONS.LOGOUT_SUCCESS });
    return { success: true };
  }
};

