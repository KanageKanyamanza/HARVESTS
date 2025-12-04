// Hooks et effets pour l'authentification

import { useEffect, useRef } from 'react';
import { AUTH_ACTIONS } from '../authTypes';

// Hook pour restaurer la session au chargement
export const useRestoreSession = (restoreSession) => {
  const hasRestored = useRef(false);
  
  useEffect(() => {
    // Ne restaurer qu'une seule fois
    if (hasRestored.current) return;
    
    let isMounted = true;
    const initializeSession = async () => {
      if (isMounted && !hasRestored.current) {
        hasRestored.current = true;
        await restoreSession();
      }
    };
    initializeSession();
    
    return () => {
      isMounted = false;
    };
  }, [restoreSession]);
};

// Hook pour surveiller l'activité utilisateur et la gestion du token
export const useUserActivity = (state, updateActivity, isTokenExpired, logout) => {
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
        logout().then(() => {
          // Rediriger vers l'accueil après déconnexion automatique
          window.location.href = '/';
        });
      }
    }, 60000); // Vérifier chaque minute

    // Nettoyer les écouteurs et intervalles
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserActivity);
      });
      clearInterval(tokenCheckInterval);
    };
  }, [state.isAuthenticated, state.tokenExpiry, updateActivity, isTokenExpired, logout]);
};

