import React from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import NotificationFilters from '../../../components/notifications/NotificationFilters';
import NotificationBulkActions from '../../../components/notifications/NotificationBulkActions';
import NotificationItem from '../../../components/notifications/NotificationItem';
import NotificationCard from '../../../components/notifications/NotificationCard';
import NotificationPagination from '../../../components/notifications/NotificationPagination';
import { useNotificationsPage } from '../../../hooks/useNotificationsPage';

const NotificationsPage = () => {
  const {
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
  } = useNotificationsPage();

  // Gérer les actions en masse
  const handleBulkMarkAsRead = () => {
    selectedNotifications.forEach(id => {
      const notif = notifications.find(n => n.id === id);
      if (notif && !notif.read) {
        handleMarkAsRead(id);
      }
    });
    setSelectedNotifications([]);
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
        <NotificationFilters
          filter={filter}
          setFilter={setFilter}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          unreadCount={unreadCount}
        />

        {/* Actions en masse */}
        <NotificationBulkActions
          selectedCount={selectedNotifications.length}
          onMarkAsRead={handleBulkMarkAsRead}
          onDelete={handleDeleteSelected}
        />

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
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        isSelected={selectedNotifications.includes(notification.id)}
                        onToggleSelect={() => toggleSelect(notification.id)}
                        onMarkAsRead={() => handleMarkAsRead(notification.id)}
                        onDelete={() => handleDelete(notification.id)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
              <NotificationPagination
                currentPage={currentPage}
                totalPages={totalPages}
                total={total}
                onPageChange={setCurrentPage}
                isMobile={false}
              />
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
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  isSelected={selectedNotifications.includes(notification.id)}
                  onToggleSelect={() => toggleSelect(notification.id)}
                  onMarkAsRead={() => handleMarkAsRead(notification.id)}
                  onDelete={() => handleDelete(notification.id)}
                />
              ))}

              <NotificationPagination
                currentPage={currentPage}
                totalPages={totalPages}
                total={total}
                onPageChange={setCurrentPage}
                isMobile={true}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;

