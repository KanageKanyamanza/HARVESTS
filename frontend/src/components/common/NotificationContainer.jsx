import React from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import NotificationToast from './NotificationToast';

const NotificationContainer = () => {
  const { notifications, removeNotification } = useNotifications();

  // Filtrer seulement les notifications qui doivent être affichées comme toasts
  const toastNotifications = notifications.filter(notification => 
    notification.showAsToast === true || 
    (notification.type === 'success' || notification.type === 'info')
  );

  return (
    <div
      aria-live="assertive"
      className="fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:p-6 sm:items-start z-50"
    >
      <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
        {toastNotifications.map((notification) => (
          <NotificationToast
            key={notification.id}
            notification={notification}
            onClose={removeNotification}
          />
        ))}
      </div>
    </div>
  );
};

export default NotificationContainer;
