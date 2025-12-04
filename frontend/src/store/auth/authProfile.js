// Fonctions de gestion du profil utilisateur

import { authService, consumerService, producerService, transformerService, restaurateurService, exporterService, transporterService } from '../../services';
import { adminAuthService } from '../../services/adminAuthService';
import { saveAuthData } from './authStorage';
import { AUTH_ACTIONS } from '../authTypes';

// Fonction pour obtenir le service approprié selon le type d'utilisateur
const getUserService = (userType) => {
  switch (userType) {
    case 'restaurateur':
      return restaurateurService.getMyProfile();
    case 'transformer':
      return transformerService.getProfile();
    case 'producer':
      return producerService.getProfile();
    case 'consumer':
      return consumerService.getProfile();
    case 'exporter':
      return exporterService.getProfile();
    case 'transporter':
      return transporterService.getProfile();
    default:
      return authService.getProfile();
  }
};

// Fonction pour extraire l'utilisateur de la réponse selon le type
const extractUserFromResponse = (response, userType) => {
  if (userType === 'restaurateur') {
    return response.data?.data?.restaurateur || response.data?.restaurateur;
  } else if (['transformer', 'producer', 'exporter', 'transporter'].includes(userType)) {
    return response.data?.data?.[userType] || 
           response.data?.[userType] || 
           response.data?.data?.user || 
           response.data?.user;
  } else {
    return response.data?.user || response.data?.data?.user;
  }
};

export const updateProfile = async (userData, state, dispatch) => {
  try {
    const userType = state.user?.userType;
    let response;
    let updatedUser = null;

    if (userType === 'restaurateur') {
      response = await restaurateurService.updateProfile(userData);
      updatedUser = response.data?.data?.restaurateur || response.data?.restaurateur;
    } else if (userType === 'transformer') {
      response = await transformerService.updateProfile(userData);
      updatedUser = response.data?.data?.transformer || response.data?.transformer || response.data?.data?.user || response.data?.user;
    } else if (userType === 'producer') {
      response = await producerService.updateProfile(userData);
      updatedUser = response.data?.data?.producer || response.data?.producer || response.data?.data?.user || response.data?.user;
    } else if (userType === 'consumer') {
      response = await consumerService.updateProfile(userData);
      updatedUser = response.data?.data?.consumer || response.data?.consumer || response.data?.data?.user || response.data?.user;
    } else if (userType === 'exporter') {
      response = await exporterService.updateProfile(userData);
      updatedUser = response.data?.data?.exporter || response.data?.exporter || response.data?.data?.user || response.data?.user;
    } else if (userType === 'transporter') {
      response = await transporterService.updateProfile(userData);
      updatedUser = response.data?.data?.transporter || response.data?.transporter || response.data?.data?.user || response.data?.user;
    } else {
      response = await authService.updateProfile(userData);
      updatedUser = response.data?.user || response.data?.data?.user;
    }

    if (!updatedUser) {
      return { success: false, error: 'Erreur de mise à jour' };
    }

    saveAuthData(updatedUser, state.token);

    dispatch({
      type: AUTH_ACTIONS.UPDATE_PROFILE,
      payload: updatedUser,
    });

    return { success: true, user: updatedUser };
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Erreur de mise à jour';
    return { success: false, error: errorMessage };
  }
};

export const refreshUser = async (state, dispatch) => {
  if (!state.isAuthenticated || !state.user) {
    console.warn('Impossible de recharger les données: utilisateur non connecté');
    return { success: false, message: 'Utilisateur non connecté' };
  }

  try {
    const token = localStorage.getItem('harvests_token');
    let response;
    let updatedUser = null;
    
    // Détecter si c'est un admin ou un utilisateur normal
    if (state.user.role === 'admin' || state.user.userType === 'admin') {
      response = await adminAuthService.getProfile();
      if (response.data?.status === 'success' && response.data?.data?.admin) {
        const updatedAdmin = response.data.data.admin;
        updatedUser = {
          ...updatedAdmin,
          role: 'admin',
          userType: 'admin'
        };
      }
    } else {
      // Utiliser le service spécifique selon le type d'utilisateur
      const userType = state.user.userType;
      response = await getUserService(userType);
      updatedUser = extractUserFromResponse(response, userType);
    }
    
    if (updatedUser) {
      saveAuthData(updatedUser, token);
      dispatch({
        type: AUTH_ACTIONS.UPDATE_PROFILE,
        payload: updatedUser,
      });
      return { success: true, message: 'Données utilisateur mises à jour', user: updatedUser };
    }
    
    return { success: false, message: 'Erreur lors de la mise à jour' };
  } catch (error) {
    console.error('Erreur lors du rechargement des données utilisateur:', error);
    return { success: false, message: 'Erreur lors de la mise à jour' };
  }
};

export const restoreSession = async (dispatch, clearAuthData) => {
  // Marquer comme en cours de chargement pour éviter les redirections prématurées
  dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
  
  try {
    const token = localStorage.getItem('harvests_token');
    const userStr = localStorage.getItem('harvests_user');
    const authDataStr = localStorage.getItem('harvests_auth_data');

    // Vérifier que nous avons des données (moins strict)
    if (token && userStr) {
      const user = JSON.parse(userStr);
      let authData = null;
      
      try {
        authData = authDataStr ? JSON.parse(authDataStr) : null;
      } catch (parseError) {
        console.warn('Erreur parsing auth data:', parseError);
      }

      // Restaurer la session avec les données locales
      dispatch({
        type: AUTH_ACTIONS.RESTORE_SESSION,
        payload: { 
          user, 
          token,
          lastActivity: authData?.lastActivity,
          tokenExpiry: authData?.tokenExpiry
        },
      });

      // Recharger les données complètes depuis l'API
      try {
        // Délai pour éviter le rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
        
        let response;
        let updatedUser = null;
        
        // Détecter si c'est un admin ou un utilisateur normal
        if (user.role === 'admin' || user.userType === 'admin') {
          response = await adminAuthService.getProfile();
          if (response.data?.status === 'success' && response.data?.data?.admin) {
            const updatedAdmin = response.data.data.admin;
            updatedUser = {
              ...updatedAdmin,
              role: 'admin',
              userType: 'admin'
            };
          }
        } else {
          const userType = user.userType;
          response = await getUserService(userType);
          updatedUser = extractUserFromResponse(response, userType);
        }
        
        if (updatedUser) {
          saveAuthData(updatedUser, token);
          dispatch({
            type: AUTH_ACTIONS.UPDATE_PROFILE,
            payload: updatedUser,
          });
        }
      } catch (apiError) {
        console.warn('Impossible de recharger les données depuis l\'API:', apiError);
        // Continuer avec les données locales si l'API échoue
      }

      // Session restaurée avec succès
    } else {
      // Nettoyer les données invalides seulement si vraiment corrompues
      if (token && (token === 'undefined' || token === 'null' || token.length < 10)) {
        clearAuthData();
      }
    }
  } catch (error) {
    console.error('Erreur lors de la restauration de session:', error);
    clearAuthData();
  } finally {
    // Toujours arrêter le loading
    dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
  }
};

