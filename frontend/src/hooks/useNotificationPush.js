import { useEffect, useCallback } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { notificationService } from '../services/notificationService';

/**
 * Hook personnalisé pour gérer les notifications en temps réel
 * Utilise le polling intelligent avec détection de changements
 */
export const useNotificationPush = (isAuthenticated) => {
  const { refreshNotifications } = useNotifications();

  // Fonction de polling avec détection de changements
  const pollNotifications = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const data = await notificationService.getNotifications(1, 50);
      
      // Stocker le hash des notifications pour détecter les changements
      const notificationHash = JSON.stringify(data.notifications.map(n => n.id));
      const previousHash = sessionStorage.getItem('notifications_hash');
      
      if (notificationHash !== previousHash) {
        console.log('🔔 Nouvelles notifications détectées');
        sessionStorage.setItem('notifications_hash', notificationHash);
        await refreshNotifications();
        
        // Optionnel : jouer un son de notification
        playNotificationSound();
      }
    } catch (error) {
      console.error('Erreur lors du polling:', error);
    }
  }, [isAuthenticated, refreshNotifications]);

  // Fonction pour jouer un son de notification (optionnelle)
  const playNotificationSound = () => {
    try {
      const audio = new Audio('/notification-sound.mp3');
      audio.volume = 0.3;
      audio.play().catch(() => {
        // Ignorer si le son ne peut pas être joué
      });
    } catch {
      // Ignorer les erreurs de son
    }
  };

  // Polling automatique
  useEffect(() => {
    if (!isAuthenticated) return;

    // Polling initial après 2 secondes
    const initialTimeout = setTimeout(() => {
      pollNotifications();
    }, 2000);

    // Polling régulier toutes les 30 secondes
    const pollingInterval = setInterval(() => {
      pollNotifications();
    }, 30000);

    // Polling lors de la visibilité de la page
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('📱 Page visible - actualisation des notifications');
        pollNotifications();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      clearTimeout(initialTimeout);
      clearInterval(pollingInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthenticated, pollNotifications]);

  return {
    pollNotifications
  };
};

