import React from 'react';
import { Check, Trash2, Clock } from 'lucide-react';
import { getNotificationIcon, getNotificationColor, formatNotificationDate } from '../../utils/notificationHelpers';

const NotificationItem = ({ 
  notification, 
  isSelected, 
  onToggleSelect, 
  onMarkAsRead, 
  onDelete 
}) => {
  return (
    <tr
      className={`hover:bg-gray-50 transition-colors ${
        !notification.read ? 'bg-blue-50' : ''
      }`}
    >
      <td className="px-6 py-4 whitespace-nowrap">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggleSelect}
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
          {formatNotificationDate(notification.timestamp)}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center justify-end space-x-2">
          {!notification.read && (
            <button
              onClick={onMarkAsRead}
              className="text-green-600 hover:text-green-900 p-2 hover:bg-green-50 rounded-lg transition-colors"
              title="Marquer comme lu"
            >
              <Check className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={onDelete}
            className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors"
            title="Supprimer"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default NotificationItem;

