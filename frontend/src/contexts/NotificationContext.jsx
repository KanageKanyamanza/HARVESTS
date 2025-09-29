import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { isAuthenticated } = useAuth();

  // Charger les notifications depuis localStorage pour les utilisateurs non connectés
  useEffect(() => {
    if (!isAuthenticated) {
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
    }
  }, [isAuthenticated]);

  // Sauvegarder les notifications dans localStorage pour les utilisateurs non connectés
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem('harvests_notifications', JSON.stringify(notifications));
    }
  }, [notifications, isAuthenticated]);

  // Ajouter une notification
  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now().toString(),
      ...notification,
      timestamp: new Date().toISOString(),
      read: false
    };

    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);

    // Auto-supprimer après 5 secondes pour les notifications temporaires
    if (notification.type === 'success' || notification.type === 'info') {
      setTimeout(() => {
        removeNotification(newNotification.id);
      }, 5000);
    }
  };

  // Marquer une notification comme lue
  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, read: true }
          : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  // Marquer toutes les notifications comme lues
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
    setUnreadCount(0);
  };

  // Supprimer une notification
  const removeNotification = (notificationId) => {
    setNotifications(prev => {
      const notification = prev.find(n => n.id === notificationId);
      if (notification && !notification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      return prev.filter(n => n.id !== notificationId);
    });
  };

  // Supprimer toutes les notifications
  const clearAllNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  // Fonctions utilitaires pour différents types de notifications
  const showSuccess = (message, title = 'Succès') => {
    addNotification({
      type: 'success',
      title,
      message,
      icon: '✅'
    });
  };

  const showError = (message, title = 'Erreur') => {
    addNotification({
      type: 'error',
      title,
      message,
      icon: '❌'
    });
  };

  const showInfo = (message, title = 'Information') => {
    addNotification({
      type: 'info',
      title,
      message,
      icon: 'ℹ️'
    });
  };

  const showWarning = (message, title = 'Attention') => {
    addNotification({
      type: 'warning',
      title,
      message,
      icon: '⚠️'
    });
  };

  const value = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
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

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications doit être utilisé dans un NotificationProvider');
  }
  return context;
};
