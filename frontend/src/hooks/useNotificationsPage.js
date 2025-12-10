import { useState, useEffect, useCallback } from 'react';
import { notificationService } from '../services/notificationService';
import { useNotifications } from '../contexts/NotificationContext';

/**
 * Hook personnalisé pour gérer la page des notifications
 */
export const useNotificationsPage = () => {
  const { 
    notifications: contextNotifications, 
    markAsRead, 
    markAllAsRead, 
    removeNotification, 
    refreshNotifications 
  } = useNotifications();
  
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const response = await notificationService.getNotifications(page, 20);
      setNotifications(response.notifications || []);
      setUnreadCount(response.unreadCount || 0);
      setTotal(response.total || 0);
      setTotalPages(Math.ceil((response.total || 0) / 20));
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
      // Fallback sur les notifications du contexte
      setNotifications(contextNotifications || []);
      setUnreadCount(contextNotifications?.filter(n => !n.read).length || 0);
    } finally {
      setLoading(false);
    }
  }, [contextNotifications]);

  useEffect(() => {
    loadNotifications(currentPage);
  }, [currentPage, loadNotifications]);

  // Filtrer les notifications
  const filteredNotifications = notifications.filter(notif => {
    // Filtre par statut (lu/non lu)
    if (filter === 'unread' && notif.read) return false;
    if (filter === 'read' && !notif.read) return false;

    // Filtre par recherche
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        notif.title?.toLowerCase().includes(searchLower) ||
        notif.message?.toLowerCase().includes(searchLower) ||
        notif.category?.toLowerCase().includes(searchLower)
      );
    }

    return true;
  });

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead(notificationId);
      await loadNotifications(currentPage);
      if (refreshNotifications) {
        refreshNotifications();
      }
    } catch (error) {
      console.error('Erreur lors du marquage comme lu:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      await loadNotifications(currentPage);
      if (refreshNotifications) {
        refreshNotifications();
      }
    } catch (error) {
      console.error('Erreur lors du marquage de toutes comme lues:', error);
    }
  };

  const handleDelete = async (notificationId) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cette notification ?')) return;
    
    try {
      await removeNotification(notificationId);
      await loadNotifications(currentPage);
      if (refreshNotifications) {
        refreshNotifications();
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedNotifications.length === 0) return;
    if (!window.confirm(`Voulez-vous vraiment supprimer ${selectedNotifications.length} notification(s) ?`)) return;

    try {
      await Promise.all(selectedNotifications.map(id => removeNotification(id)));
      setSelectedNotifications([]);
      await loadNotifications(currentPage);
      if (refreshNotifications) {
        refreshNotifications();
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const toggleSelect = (notificationId) => {
    setSelectedNotifications(prev =>
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const selectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n.id));
    }
  };

  return {
    notifications,
    filteredNotifications,
    loading,
    filter,
    setFilter,
    searchTerm,
    setSearchTerm,
    selectedNotifications,
    setSelectedNotifications,
    currentPage,
    setCurrentPage,
    totalPages,
    total,
    unreadCount,
    handleMarkAsRead,
    handleMarkAllAsRead,
    handleDelete,
    handleDeleteSelected,
    toggleSelect,
    selectAll
  };
};

