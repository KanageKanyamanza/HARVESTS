import { useNotifications } from '../contexts/NotificationContext';
import { notificationService } from '../services/notificationService';

// Hook pour gérer les notifications liées aux commandes
export const useOrderNotifications = () => {
  const { addNotification } = useNotifications();

  // Créer une notification pour une nouvelle commande
  const notifyNewOrder = (order) => {
    const notification = notificationService.createOrderNotification(order);
    addNotification({
      type: 'order',
      title: notification.title,
      message: notification.message,
      data: notification.data,
      showAsToast: false // Affichage dans le dropdown uniquement
    });
  };

  // Créer une notification pour un changement de statut de commande
  const notifyOrderStatusChange = (order, newStatus) => {
    const statusMessages = {
      'confirmed': 'Commande confirmée',
      'processing': 'Commande en cours de traitement',
      'shipped': 'Commande expédiée',
      'delivered': 'Commande livrée',
      'cancelled': 'Commande annulée',
      'completed': 'Commande terminée'
    };

    const title = statusMessages[newStatus] || `Statut de commande changé: ${newStatus}`;
    const message = `Votre commande #${order.orderNumber || order._id?.slice(-8)} est maintenant ${newStatus}`;

    addNotification({
      type: 'order',
      title,
      message,
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        status: newStatus
      },
      showAsToast: true // Toast pour les changements de statut
    });
  };

  // Créer une notification pour un produit approuvé
  const notifyProductApproved = (product) => {
    const notification = notificationService.createProductApprovedNotification(product);
    addNotification({
      type: 'product',
      title: notification.title,
      message: notification.message,
      data: notification.data,
      showAsToast: false
    });
  };

  // Créer une notification pour un produit rejeté
  const notifyProductRejected = (product, reason) => {
    addNotification({
      type: 'product',
      title: 'Produit rejeté',
      message: `Votre produit "${product.name?.fr || product.name}" a été rejeté. Raison: ${reason}`,
      data: {
        productId: product._id,
        productName: product.name,
        reason
      },
      showAsToast: false
    });
  };

  return {
    notifyNewOrder,
    notifyOrderStatusChange,
    notifyProductApproved,
    notifyProductRejected
  };
};
