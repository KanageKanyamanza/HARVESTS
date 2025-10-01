import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { generateUniqueId } from '../utils/uuid';
import { notificationService } from '../services/notificationService';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { isAuthenticated } = useAuth();

  // Nettoyer les notifications anciennes (plus de 30 jours)
  const cleanupOldNotifications = () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    setNotifications(prev => {
      const filtered = prev.filter(notification => {
        const notificationDate = new Date(notification.timestamp);
        return notificationDate > thirtyDaysAgo;
      });
      
      // Mettre à jour le localStorage avec les notifications filtrées
      if (filtered.length !== prev.length) {
        if (filtered.length > 0) {
          localStorage.setItem('harvests_notifications', JSON.stringify(filtered));
        } else {
          localStorage.removeItem('harvests_notifications');
        }
      }
      
      return filtered;
    });
    
    // Recalculer le nombre de notifications non lues
    const currentNotifications = JSON.parse(localStorage.getItem('harvests_notifications') || '[]');
    setUnreadCount(currentNotifications.filter(n => !n.read).length);
  };

  // Charger les notifications (backend + localStorage pour les non-connectés)
  useEffect(() => {
    const loadNotifications = async () => {
      if (isAuthenticated) {
        // Délai pour éviter le rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Utilisateur connecté : récupérer depuis le backend
        try {
          const backendNotifications = await notificationService.getNotifications(1, 50);
          setNotifications(backendNotifications.notifications || []);
          setUnreadCount(backendNotifications.unreadCount || 0);
        } catch (error) {
          // Ne pas logger les erreurs 401 (non authentifié) pour éviter le spam
          if (error.response?.status !== 401) {
            console.error('Erreur lors du chargement des notifications du backend:', error);
          }
          // Fallback sur localStorage en cas d'erreur
          loadFromLocalStorage();
        }
      } else {
        // Utilisateur non connecté : utiliser localStorage
        loadFromLocalStorage();
      }
    };

    const loadFromLocalStorage = () => {
      const savedNotifications = localStorage.getItem('harvests_notifications');
      if (savedNotifications) {
        try {
          const parsed = JSON.parse(savedNotifications);
          setNotifications(parsed);
          setUnreadCount(parsed.filter(n => !n.read).length);
        } catch (error) {
          console.error('Erreur lors du chargement des notifications:', error);
        }
      }
    };

    loadNotifications();
    
    // Nettoyer les notifications anciennes au chargement (seulement pour localStorage)
    if (!isAuthenticated) {
      cleanupOldNotifications();
    }

    // 🔄 Polling automatique toutes les 30 secondes pour actualiser les notifications
    let pollingInterval;
    if (isAuthenticated) {
      pollingInterval = setInterval(async () => {
        try {
          const backendNotifications = await notificationService.getNotifications(1, 50);
          setNotifications(backendNotifications.notifications || []);
          setUnreadCount(backendNotifications.unreadCount || 0);
        } catch (error) {
          // Ne pas logger les erreurs 401 (non authentifié) pour éviter le spam
          if (error.response?.status !== 401) {
            console.error('Erreur lors de l\'actualisation automatique:', error);
          }
        }
      }, 30000); // 30 secondes
    }

    // Nettoyer l'intervalle au démontage
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [isAuthenticated]); // Recharger quand l'état d'authentification change

  // Sauvegarder les notifications dans localStorage (seulement pour les non-connectés)
  useEffect(() => {
    if (!isAuthenticated && notifications.length > 0) {
      localStorage.setItem('harvests_notifications', JSON.stringify(notifications));
    }
  }, [notifications, isAuthenticated]);

  // Ajouter une notification
  const addNotification = (notification) => {
    const newNotification = {
      id: generateUniqueId(),
      ...notification,
      timestamp: new Date().toISOString(),
      read: false,
      showAsToast: notification.showAsToast !== false // Par défaut, ne pas afficher comme toast
    };

    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);

    // Auto-supprimer après 5 secondes SEULEMENT pour les toasts temporaires
    if (notification.showAsToast === true) {
      setTimeout(() => {
        removeNotification(newNotification.id);
      }, 5000);
    }
  };

  // Marquer une notification comme lue
  const markAsRead = async (notificationId) => {
    // Mettre à jour l'état local immédiatement
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, read: true }
          : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));

    // Synchroniser avec le backend si l'utilisateur est connecté
    if (isAuthenticated) {
      try {
        await notificationService.markAsRead(notificationId);
      } catch (error) {
        console.error('Erreur lors de la synchronisation avec le backend:', error);
      }
    }
  };

  // Marquer toutes les notifications comme lues
  const markAllAsRead = async () => {
    // Mettre à jour l'état local immédiatement
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
    setUnreadCount(0);

    // Synchroniser avec le backend si l'utilisateur est connecté
    if (isAuthenticated) {
      try {
        await notificationService.markAllAsRead();
      } catch (error) {
        console.error('Erreur lors de la synchronisation avec le backend:', error);
      }
    }
  };

  // Supprimer une notification
  const removeNotification = async (notificationId) => {
    // Mettre à jour l'état local immédiatement
    setNotifications(prev => {
      const notification = prev.find(n => n.id === notificationId);
      if (notification && !notification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      return prev.filter(n => n.id !== notificationId);
    });

    // Synchroniser avec le backend si l'utilisateur est connecté ET que c'est un ID MongoDB valide
    if (isAuthenticated && notificationId && notificationId.match(/^[0-9a-fA-F]{24}$/)) {
      try {
        await notificationService.deleteNotification(notificationId);
      } catch (error) {
        console.error('Erreur lors de la synchronisation avec le backend:', error);
      }
    }
  };

  // Supprimer toutes les notifications
  const clearAllNotifications = async () => {
    // Mettre à jour l'état local immédiatement
    setNotifications([]);
    setUnreadCount(0);
    localStorage.removeItem('harvests_notifications');

    // Synchroniser avec le backend si l'utilisateur est connecté
    if (isAuthenticated) {
      try {
        await notificationService.deleteAllNotifications();
      } catch (error) {
        console.error('Erreur lors de la synchronisation avec le backend:', error);
      }
    }
  };

  // Fonctions utilitaires pour différents types de notifications
  const showSuccess = (message, title = 'Succès', showAsToast = true) => {
    addNotification({
      type: 'success',
      title,
      message,
      icon: '✅',
      showAsToast
    });
  };

  const showError = (message, title = 'Erreur', showAsToast = true) => {
    addNotification({
      type: 'error',
      title,
      message,
      icon: '❌',
      showAsToast
    });
  };

  const showInfo = (message, title = 'Information', showAsToast = true) => {
    addNotification({
      type: 'info',
      title,
      message,
      icon: 'ℹ️',
      showAsToast
    });
  };

  const showWarning = (message, title = 'Attention', showAsToast = true) => {
    addNotification({
      type: 'warning',
      title,
      message,
      icon: '⚠️',
      showAsToast
    });
  };

  // Rafraîchir les notifications depuis le backend
  const refreshNotifications = async () => {
    if (isAuthenticated) {
      try {
        const backendNotifications = await notificationService.getNotifications(1, 50);
        setNotifications(backendNotifications.notifications || []);
        setUnreadCount(backendNotifications.unreadCount || 0);
      } catch (error) {
        console.error('Erreur lors du rafraîchissement des notifications:', error);
      }
    } else {
      // Mode local : recharger depuis localStorage
      const savedNotifications = localStorage.getItem('harvests_notifications');
      if (savedNotifications) {
        try {
          const parsed = JSON.parse(savedNotifications);
          setNotifications(parsed);
          setUnreadCount(parsed.filter(n => !n.read).length);
        } catch (error) {
          console.error('Erreur lors du rafraîchissement des notifications:', error);
        }
      }
    }
  };

  const value = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    refreshNotifications,
    cleanupOldNotifications,
    showSuccess,
    showError,
    showInfo,
    showWarning
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications doit être utilisé dans un NotificationProvider');
  }
  return context;
};

export { useNotifications };
