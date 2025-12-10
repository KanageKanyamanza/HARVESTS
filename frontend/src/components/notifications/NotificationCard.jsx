import React from 'react';
import { Check, Trash2, Clock } from 'lucide-react';
import { getNotificationIcon, getNotificationColor, formatNotificationDate } from '../../utils/notificationHelpers';

const NotificationCard = ({ 
  notification, 
  isSelected, 
  onToggleSelect, 
  onMarkAsRead, 
  onDelete 
}) => {
  return (
    <div
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
          checked={isSelected}
          onChange={onToggleSelect}
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
                  {formatNotificationDate(notification.timestamp)}
                </div>
              </div>
            </div>
          </div>

          {/* Actions mobile */}
          <div className="mt-3 flex items-center justify-end space-x-2 pt-3 border-t border-gray-200">
            {!notification.read && (
              <button
                onClick={onMarkAsRead}
                className="flex items-center px-3 py-1.5 text-sm text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
              >
                <Check className="h-4 w-4 mr-1" />
                Marquer lu
              </button>
            )}
            <button
              onClick={onDelete}
              className="flex items-center px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationCard;

