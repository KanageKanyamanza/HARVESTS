import React, { createContext, useReducer, useEffect } from 'react';
import { authService } from '../services/api';
import { isValidToken } from '../utils/tokenValidation';
import { getDefaultRoute, hasPermission, canAccessRoute } from '../utils/authUtils';
import { initialState, AUTH_ACTIONS } from './authTypes';
import { authReducer } from './authReducer';

// Création du contexte
const AuthContext = createContext();

// Provider du contexte
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);


  // Fonction pour sauvegarder les données d'auth dans localStorage
  const saveAuthData = (user, token, tokenExpiry = null) => {
    // Vérifier le token avant de sauvegarder
    if (!isValidToken(token)) {
      console.warn('Tentative de sauvegarde d\'un token invalide');
      return;
    }
    
    const authData = {
      user,
      token,
      lastActivity: new Date().toISOString(),
      tokenExpiry
    };
    
    localStorage.setItem('harvests_user', JSON.stringify(user));
    localStorage.setItem('harvests_token', token);
    localStorage.setItem('harvests_auth_data', JSON.stringify(authData));
  };

  // Fonction pour supprimer les données d'auth du localStorage
  const clearAuthData = () => {
    localStorage.removeItem('harvests_user');
    localStorage.removeItem('harvests_token');
    localStorage.removeItem('harvests_auth_data');
  };

  // Fonction de connexion
  const login = async (credentials) => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOGIN_START });

      const response = await authService.login(credentials);
      const { user, token } = response.data.data;

      // Sauvegarder dans localStorage
      saveAuthData(user, token);

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user, token },
      });

      return { success: true, user, token };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erreur de connexion';
      
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: errorMessage,
      });

      return { success: false, error: errorMessage };
    }
  };

  // Fonction d'inscription
  const register = async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.REGISTER_START });

      const response = await authService.register(userData);

      dispatch({ type: AUTH_ACTIONS.REGISTER_SUCCESS });

      return { 
        success: true, 
        message: response.data.message || 'Inscription réussie' 
      };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erreur d\'inscription';
      
      dispatch({
        type: AUTH_ACTIONS.REGISTER_FAILURE,
        payload: errorMessage,
      });

      return { success: false, error: errorMessage };
    }
  };

  // Fonction de déconnexion
  const logout = async () => {
    try {
      // Appeler l'API de déconnexion si nécessaire
      await authService.logout();
    } catch (error) {
      console.warn('Logout API call failed:', error);
    } finally {
      // Nettoyer les données locales
      clearAuthData();
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  };

  // Fonction de mise à jour du profil
  const updateProfile = async (userData) => {
    try {
      const response = await authService.updateProfile(userData);
      const updatedUser = response.data.data.user;

      // Mettre à jour localStorage
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

  // Fonction simplifiée pour restaurer la session (SANS vérification API)
  const restoreSession = () => {
    try {
      const token = localStorage.getItem('harvests_token');
      const userStr = localStorage.getItem('harvests_user');
      const authDataStr = localStorage.getItem('harvests_auth_data');

      console.log('Tentative de restauration de session...');

      // Vérifier que nous avons des données et qu'elles sont valides
      if (token && userStr && isValidToken(token)) {
        const user = JSON.parse(userStr);
        let authData = null;
        
        try {
          authData = authDataStr ? JSON.parse(authDataStr) : null;
        } catch (parseError) {
          console.warn('Erreur parsing auth data:', parseError);
        }

        // Restaurer la session avec les données locales UNIQUEMENT
        dispatch({
          type: AUTH_ACTIONS.RESTORE_SESSION,
          payload: { 
            user, 
            token,
            lastActivity: authData?.lastActivity,
            tokenExpiry: authData?.tokenExpiry
          },
        });

        console.log('✅ Session restaurée depuis localStorage pour:', user.email);
      } else {
        console.log('❌ Aucune session valide trouvée');
        // Nettoyer les données invalides
        if (token && !isValidToken(token)) {
          console.warn('Token invalide détecté, nettoyage...');
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

  // Fonction pour effacer les erreurs
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Fonction pour vérifier l'email
  const verifyEmail = async (token) => {
    try {
      const response = await authService.verifyEmail(token);
      return { success: true, message: response.data.message };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erreur de vérification';
      return { success: false, error: errorMessage };
    }
  };

  // Fonction pour mot de passe oublié
  const forgotPassword = async (email) => {
    try {
      const response = await authService.forgotPassword(email);
      return { success: true, message: response.data.message };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erreur d\'envoi d\'email';
      return { success: false, error: errorMessage };
    }
  };

  // Fonction pour réinitialiser le mot de passe
  const resetPassword = async (token, password) => {
    try {
      const response = await authService.resetPassword(token, password);
      return { success: true, message: response.data.message };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erreur de réinitialisation';
      return { success: false, error: errorMessage };
    }
  };

  // Fonction pour changer le mot de passe
  const updatePassword = async (passwords) => {
    try {
      const response = await authService.updatePassword(passwords);
      return { success: true, message: response.data.message };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erreur de changement de mot de passe';
      return { success: false, error: errorMessage };
    }
  };

  // Fonction pour mettre à jour l'activité utilisateur
  const updateActivity = () => {
    if (state.isAuthenticated) {
      dispatch({ type: AUTH_ACTIONS.UPDATE_LAST_ACTIVITY });
    }
  };

  // Fonction pour vérifier si le token est expiré
  const isTokenExpired = () => {
    if (!state.tokenExpiry) return false;
    return new Date() > new Date(state.tokenExpiry);
  };


  // Restaurer la session au chargement
  useEffect(() => {
    restoreSession();
  }, []);

  // Surveiller l'activité utilisateur et la gestion du token
  useEffect(() => {
    if (!state.isAuthenticated) return;

    // Fonction pour gérer l'activité utilisateur
    const handleUserActivity = () => {
      updateActivity();
    };

    // Ajouter les écouteurs d'événements pour détecter l'activité
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, handleUserActivity, { passive: true });
    });

    // Vérifier périodiquement l'expiration du token
    const tokenCheckInterval = setInterval(() => {
      if (isTokenExpired()) {
        console.warn('Token expiré, déconnexion automatique');
        logout();
      }
    }, 60000); // Vérifier chaque minute

    // Nettoyer les écouteurs et intervalles
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserActivity);
      });
      clearInterval(tokenCheckInterval);
    };
  }, [state.isAuthenticated, state.tokenExpiry]);

  // Valeur du contexte
  const value = {
    // État
    ...state,
    
    // Actions
    login,
    register,
    logout,
    updateProfile,
    clearError,
    verifyEmail,
    forgotPassword,
    resetPassword,
    updatePassword,
    updateActivity,
    
    // Fonctions utilitaires de type d'utilisateur
    isProducer: state.user?.userType === 'producer',
    isConsumer: state.user?.userType === 'consumer',
    isTransformer: state.user?.userType === 'transformer',
    isRestaurateur: state.user?.userType === 'restaurateur',
    isExporter: state.user?.userType === 'exporter',
    isTransporter: state.user?.userType === 'transporter',
    userType: state.user?.userType || null,
    
    // Vérifications de statut
    isEmailVerified: state.user?.isEmailVerified || false,
    isAccountApproved: state.user?.isApproved || false,
    isAccountActive: state.user?.isActive || false,
    isProfileComplete: state.user?.isProfileComplete || false,
    
    // Fonctions de gestion des permissions et routes
    hasPermission: (permission) => hasPermission(state.user?.userType, permission),
    canAccessRoute: (route) => canAccessRoute(route, state.user?.userType, state.isAuthenticated),
    getDefaultRoute: () => getDefaultRoute(state.user?.userType),
    isTokenExpired,
    
    // Informations utilisateur enrichies
    userDisplayName: state.user ? `${state.user.firstName} ${state.user.lastName || ''}`.trim() : null,
    userInitials: state.user ? `${state.user.firstName?.charAt(0) || ''}${state.user.lastName?.charAt(0) || ''}`.toUpperCase() : null,
    userPreferences: {
      language: state.user?.preferredLanguage || 'fr',
      country: state.user?.country || 'SN',
      currency: state.user?.preferredCurrency || 'XAF',
    },
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Exporter le contexte pour le hook
export { AuthContext };

