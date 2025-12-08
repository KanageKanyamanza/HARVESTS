import React, { useState, useEffect, useCallback } from 'react';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Filter,
  Search,
  X,
  AlertCircle,
  Info,
  CheckCircle,
  AlertTriangle,
  ShoppingCart,
  Package,
  User,
  MessageSquare,
  Settings,
  Calendar,
  Clock
} from 'lucide-react';
import { notificationService } from '../../../services/notificationService';
import { useNotifications } from '../../../contexts/NotificationContext';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

const NotificationsPage = () => {
  const { notifications: contextNotifications, markAsRead, markAllAsRead, removeNotification, refreshNotifications } = useNotifications();
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

  const getNotificationIcon = (type, category) => {
    switch (type) {
      case 'order':
        return <ShoppingCart className="h-5 w-5" />;
      case 'product':
        return <Package className="h-5 w-5" />;
      case 'message':
        return <MessageSquare className="h-5 w-5" />;
      case 'user':
        return <User className="h-5 w-5" />;
      case 'system':
        return <Settings className="h-5 w-5" />;
      default:
        switch (category) {
          case 'success':
            return <CheckCircle className="h-5 w-5" />;
          case 'warning':
            return <AlertTriangle className="h-5 w-5" />;
          case 'error':
            return <AlertCircle className="h-5 w-5" />;
          default:
            return <Info className="h-5 w-5" />;
        }
    }
  };

  const getNotificationColor = (type, category) => {
    switch (type) {
      case 'order':
        return 'bg-blue-100 text-blue-600';
      case 'product':
        return 'bg-green-100 text-green-600';
      case 'message':
        return 'bg-purple-100 text-purple-600';
      case 'user':
        return 'bg-indigo-100 text-indigo-600';
      case 'system':
        return 'bg-gray-100 text-gray-600';
      default:
        switch (category) {
          case 'success':
            return 'bg-green-100 text-green-600';
          case 'warning':
            return 'bg-yellow-100 text-yellow-600';
          case 'error':
            return 'bg-red-100 text-red-600';
          default:
            return 'bg-blue-100 text-blue-600';
        }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  if (loading && notifications.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Chargement des notifications..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-6 overflow-x-auto">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
                <Bell className="h-6 w-6 sm:h-8 sm:w-8 mr-2 sm:mr-3 text-green-600" />
                Notifications
              </h1>
              <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">
                {unreadCount > 0 ? (
                  <span>{unreadCount} notification{unreadCount > 1 ? 's' : ''} non lue{unreadCount > 1 ? 's' : ''}</span>
                ) : (
                  <span>Toutes vos notifications</span>
                )}
              </p>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="flex items-center px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base"
                >
                  <CheckCheck className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Tout marquer comme lu</span>
                  <span className="sm:hidden">Tout lire</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Filtres et recherche */}
        <div className="bg-white rounded-lg shadow p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between sm:space-x-4">
            {/* Recherche */}
            <div className="flex-1 relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-8 sm:pr-10 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              )}
            </div>

            {/* Filtres */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0">
              <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0" />
              <button
                onClick={() => setFilter('all')}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-colors text-sm sm:text-base whitespace-nowrap flex-shrink-0 ${
                  filter === 'all'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Toutes
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-colors text-sm sm:text-base whitespace-nowrap flex-shrink-0 ${
                  filter === 'unread'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="sm:hidden">Non lues</span>
                <span className="hidden sm:inline">Non lues ({unreadCount})</span>
              </button>
              <button
                onClick={() => setFilter('read')}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-colors text-sm sm:text-base whitespace-nowrap flex-shrink-0 ${
                  filter === 'read'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Lues
              </button>
            </div>
          </div>
        </div>

        {/* Actions en masse */}
        {selectedNotifications.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
            <span className="text-sm sm:text-base text-green-800 font-medium">
              {selectedNotifications.length} notification{selectedNotifications.length > 1 ? 's' : ''} sélectionnée{selectedNotifications.length > 1 ? 's' : ''}
            </span>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <button
                onClick={() => {
                  selectedNotifications.forEach(id => {
                    const notif = notifications.find(n => n.id === id);
                    if (notif && !notif.read) {
                      handleMarkAsRead(id);
                    }
                  });
                  setSelectedNotifications([]);
                }}
                className="px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center text-sm sm:text-base"
              >
                <Check className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Marquer comme lu</span>
                <span className="sm:hidden">Lire</span>
              </button>
              <button
                onClick={handleDeleteSelected}
                className="px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center text-sm sm:text-base"
              >
                <Trash2 className="h-4 w-4 mr-1 sm:mr-2" />
                Supprimer
              </button>
            </div>
          </div>
        )}

        {/* Liste des notifications */}
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 sm:p-12 text-center">
            <Bell className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
              {searchTerm || filter !== 'all' ? 'Aucune notification trouvée' : 'Aucune notification'}
            </h3>
            <p className="text-sm sm:text-base text-gray-500">
              {searchTerm || filter !== 'all'
                ? 'Essayez de modifier vos filtres de recherche'
                : 'Vous n\'avez pas encore de notifications'}
            </p>
          </div>
        ) : (
          <>
            {/* Vue desktop - Tableau */}
            <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectedNotifications.length === filteredNotifications.length && filteredNotifications.length > 0}
                          onChange={selectAll}
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Notification
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Catégorie
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredNotifications.map((notification) => (
                      <tr
                        key={notification.id}
                        className={`hover:bg-gray-50 transition-colors ${
                          !notification.read ? 'bg-blue-50' : ''
                        }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedNotifications.includes(notification.id)}
                            onChange={() => toggleSelect(notification.id)}
                            className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-start">
                            <div className={`flex-shrink-0 h-10 w-10 rounded-full ${getNotificationColor(notification.type, notification.category)} flex items-center justify-center mr-4`}>
                              {getNotificationIcon(notification.type, notification.category)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center">
                                <p className={`text-sm font-medium ${!notification.read ? 'text-gray-900 font-semibold' : 'text-gray-700'}`}>
                                  {notification.title}
                                </p>
                                {!notification.read && (
                                  <span className="ml-2 h-2 w-2 bg-green-600 rounded-full"></span>
                                )}
                              </div>
                              <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                                {notification.message}
                              </p>
                              {notification.data && (
                                <div className="mt-2 text-xs text-gray-400">
                                  {notification.data.orderId && (
                                    <span>Commande: #{notification.data.orderNumber || notification.data.orderId?.slice(-8)}</span>
                                  )}
                                  {notification.data.productId && (
                                    <span>Produit: {notification.data.productName || notification.data.productId}</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            notification.category === 'success' ? 'bg-green-100 text-green-800' :
                            notification.category === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                            notification.category === 'error' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {notification.category || notification.type || 'Général'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="h-4 w-4 mr-1" />
                            {formatDate(notification.timestamp)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            {!notification.read && (
                              <button
                                onClick={() => handleMarkAsRead(notification.id)}
                                className="text-green-600 hover:text-green-900 p-2 hover:bg-green-50 rounded-lg transition-colors"
                                title="Marquer comme lu"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(notification.id)}
                              className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors"
                              title="Supprimer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Vue mobile - Cartes */}
            <div className="md:hidden space-y-3">
              {/* Checkbox "Tout sélectionner" pour mobile */}
              {filteredNotifications.length > 0 && (
                <div className="bg-white rounded-lg shadow p-3 flex items-center justify-between">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedNotifications.length === filteredNotifications.length && filteredNotifications.length > 0}
                      onChange={selectAll}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Tout sélectionner</span>
                  </label>
                </div>
              )}

              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`bg-white rounded-lg shadow p-4 border-l-4 ${
                    !notification.read 
                      ? 'border-blue-500 bg-blue-50/30' 
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedNotifications.includes(notification.id)}
                      onChange={() => toggleSelect(notification.id)}
                      className="mt-1 rounded border-gray-300 text-green-600 focus:ring-green-500"
                      onClick={(e) => e.stopPropagation()}
                    />

                    {/* Icône */}
                    <div className={`flex-shrink-0 h-10 w-10 rounded-full ${getNotificationColor(notification.type, notification.category)} flex items-center justify-center`}>
                      {getNotificationIcon(notification.type, notification.category)}
                    </div>

                    {/* Contenu */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <h3 className={`text-sm font-medium truncate ${!notification.read ? 'text-gray-900 font-semibold' : 'text-gray-700'}`}>
                              {notification.title}
                            </h3>
                            {!notification.read && (
                              <span className="h-2 w-2 bg-green-600 rounded-full flex-shrink-0"></span>
                            )}
                          </div>
                          <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                            {notification.message}
                          </p>
                          {notification.data && (
                            <div className="mt-2 text-xs text-gray-500">
                              {notification.data.orderId && (
                                <span className="block">Commande: #{notification.data.orderNumber || notification.data.orderId?.slice(-8)}</span>
                              )}
                              {notification.data.productId && (
                                <span className="block">Produit: {notification.data.productName || notification.data.productId}</span>
                              )}
                            </div>
                          )}
                          <div className="mt-2 flex items-center justify-between">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              notification.category === 'success' ? 'bg-green-100 text-green-800' :
                              notification.category === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                              notification.category === 'error' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {notification.category || notification.type || 'Général'}
                            </span>
                            <div className="flex items-center text-xs text-gray-500">
                              <Clock className="h-3 w-3 mr-1" />
                              {formatDate(notification.timestamp)}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions mobile */}
                      <div className="mt-3 flex items-center justify-end space-x-2 pt-3 border-t border-gray-200">
                        {!notification.read && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="flex items-center px-3 py-1.5 text-sm text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Marquer lu
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(notification.id)}
                          className="flex items-center px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Supprimer
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Desktop */}
            {totalPages > 1 && (
              <div className="hidden md:flex bg-gray-50 px-6 py-4 border-t border-gray-200 items-center justify-between">
                <div className="text-sm text-gray-700">
                  Affichage de {((currentPage - 1) * 20) + 1} à {Math.min(currentPage * 20, total)} sur {total} notifications
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Précédent
                  </button>
                  <span className="px-4 py-2 text-sm text-gray-700">
                    Page {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Suivant
                  </button>
                </div>
              </div>
            )}

            {/* Pagination Mobile */}
            {totalPages > 1 && (
              <div className="md:hidden bg-white rounded-lg shadow p-4 mt-4">
                <div className="flex flex-col space-y-3">
                  <div className="text-center text-sm text-gray-700">
                    Page {currentPage} / {totalPages} • {total} notification{total > 1 ? 's' : ''}
                  </div>
                  <div className="flex items-center justify-between space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 bg-white"
                    >
                      Précédent
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 bg-white"
                    >
                      Suivant
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;

