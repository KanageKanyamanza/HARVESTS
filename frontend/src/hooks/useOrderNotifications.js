import { useCallback } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import i18n from '../utils/i18n';

// Hook pour gérer les notifications liées aux commandes
export const useOrderNotifications = () => {
  const { addNotification } = useNotifications();

  // Alerte locale quand le rafraîchissement du tableau de bord détecte de nouvelles commandes
  const notifyNewOrder = useCallback((count) => {
    addNotification({
      type: 'order',
      title: i18n.t('common:orderAlerts.newOrdersTitle', { count }),
      message: i18n.t('common:orderAlerts.newOrdersMessage', { count }),
      data: { count },
      showAsToast: false // Affichage dans le dropdown uniquement
    });
  }, [addNotification]);

  return { notifyNewOrder };
};
