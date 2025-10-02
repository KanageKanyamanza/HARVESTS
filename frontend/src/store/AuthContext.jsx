import React, { createContext, useReducer, useEffect } from 'react';
import { authService, consumerService, producerService } from '../services';
import { adminAuthService } from '../services/adminAuthService';
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
    // Vérification basique du token (structure seulement)
    if (!token || token === 'undefined' || token === 'null') {
      console.warn('Tentative de sauvegarde d\'un token vide');
      return;
    }
    
    const authData = {
      user,
      token,
      lastActivity: new Date().toISOString(),
      tokenExpiry
    };
    
    try {
      localStorage.setItem('harvests_user', JSON.stringify(user));
      localStorage.setItem('harvests_token', token);
      localStorage.setItem('harvests_auth_data', JSON.stringify(authData));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
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
      } catch (adminError) {
        // Si l'auth admin échoue, essayer l'auth normale
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
      let response;
      
      // Utiliser le bon service selon le type d'utilisateur
      if (state.user?.userType === 'consumer') {
        response = await consumerService.updateProfile(userData);
      } else if (state.user?.userType === 'producer') {
        response = await producerService.updateProfile(userData);
      } else {
        // Fallback vers le service générique
        response = await authService.updateProfile(userData);
      }
      
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

  // Fonction pour restaurer la session et recharger les données complètes
  const restoreSession = async () => {
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
          
          // Détecter si c'est un admin ou un utilisateur normal
          if (user.role === 'admin' || user.userType === 'admin') {
            response = await adminAuthService.getProfile();
            if (response.success) {
              const updatedAdmin = response.data.admin;
              // Convertir l'admin en format utilisateur pour la compatibilité
              const updatedUser = {
                ...updatedAdmin,
                role: 'admin',
                userType: 'admin'
              };
              
              // Mettre à jour le localStorage avec les données complètes
              saveAuthData(updatedUser, token);
              
              // Mettre à jour le contexte avec les données complètes
              dispatch({
                type: AUTH_ACTIONS.UPDATE_PROFILE,
                payload: updatedUser,
              });
            }
          } else {
            response = await authService.getProfile();
            if (response.success) {
              const updatedUser = response.data.user;
              
              // Mettre à jour le localStorage avec les données complètes
              saveAuthData(updatedUser, token);
              
              // Mettre à jour le contexte avec les données complètes
              dispatch({
                type: AUTH_ACTIONS.UPDATE_PROFILE,
                payload: updatedUser,
              });
            }
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
    const initializeSession = async () => {
      await restoreSession();
    };
    initializeSession();
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
    canAccessRoute: (route) => canAccessRoute(route, state.user?.userType, state.isAuthenticated, state.user?.role),
    getDefaultRoute: () => getDefaultRoute(state.user?.userType, state.user?.role),
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

