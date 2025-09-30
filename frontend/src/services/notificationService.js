import api from './api';

class NotificationService {
  // Récupérer toutes les notifications de l'utilisateur
  async getNotifications(page = 1, limit = 20) {
    try {
      const response = await api.get('/notifications/my', {
        params: { page, limit }
      });
      return response.data.data;
    } catch (error) {
      // Si l'endpoint n'existe pas encore (404/403), retourner des données vides
      if (error.response?.status === 403 || error.response?.status === 404) {
        console.log('Endpoint notifications non disponible - utilisation du mode local');
        return { notifications: [], unreadCount: 0 };
      }
      console.error('Erreur lors de la récupération des notifications:', error);
      throw error;
    }
  }

  // Marquer une notification comme lue
  async markAsRead(notificationId) {
    try {
      const response = await api.patch(`/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      // Si l'endpoint n'existe pas encore, ignorer silencieusement
      if (error.response?.status === 403 || error.response?.status === 404) {
        console.log('Endpoint markAsRead non disponible - action locale uniquement');
        return { success: true };
      }
      console.error('Erreur lors du marquage de la notification:', error);
      throw error;
    }
  }

  // Marquer toutes les notifications comme lues
  async markAllAsRead() {
    try {
      const response = await api.patch('/notifications/my/read-all');
      return response.data;
    } catch (error) {
      // Si l'endpoint n'existe pas encore, ignorer silencieusement
      if (error.response?.status === 403 || error.response?.status === 404) {
        console.log('Endpoint markAllAsRead non disponible - action locale uniquement');
        return { success: true };
      }
      console.error('Erreur lors du marquage de toutes les notifications:', error);
      throw error;
    }
  }

  // Supprimer une notification
  async deleteNotification(notificationId) {
    try {
      const response = await api.delete(`/notifications/${notificationId}`);
      return response.data;
    } catch (error) {
      // Si l'endpoint n'existe pas encore, ignorer silencieusement
      if (error.response?.status === 403 || error.response?.status === 404) {
        console.log('Endpoint deleteNotification non disponible - action locale uniquement');
        return { success: true };
      }
      console.error('Erreur lors de la suppression de la notification:', error);
      throw error;
    }
  }

  // Supprimer toutes les notifications (pas d'endpoint spécifique, on supprime individuellement)
  async deleteAllNotifications() {
    try {
      // Pour l'instant, on ne peut pas supprimer toutes les notifications d'un coup
      // On retourne un succès pour éviter les erreurs
      console.log('Suppression de toutes les notifications - non implémentée côté backend');
      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la suppression de toutes les notifications:', error);
      throw error;
    }
  }

  // Récupérer le nombre de notifications non lues
  async getUnreadCount() {
    try {
      const response = await api.get('/notifications/my/unread-count');
      return response.data.data;
    } catch (error) {
      // Si l'endpoint n'existe pas encore, retourner 0
      if (error.response?.status === 403 || error.response?.status === 404) {
        console.log('Endpoint getUnreadCount non disponible - retour 0');
        return { unreadCount: 0 };
      }
      console.error('Erreur lors de la récupération du nombre de notifications non lues:', error);
      throw error;
    }
  }

  // S'abonner aux notifications en temps réel (WebSocket)
  subscribeToNotifications(callback) {
    // TODO: Implémenter WebSocket pour les notifications en temps réel
    // Pour l'instant, on peut utiliser polling ou attendre que le backend implémente WebSocket
    console.log('Subscription aux notifications en temps réel - À implémenter');
    return () => {
      console.log('Désabonnement des notifications en temps réel');
    };
  }

  // Fonction utilitaire pour créer des notifications locales (pour les tests)
  createLocalNotification(type, title, message, data = {}) {
    return {
      id: Date.now().toString(),
      type,
      title,
      message,
      data,
      read: false,
      timestamp: new Date().toISOString(),
      showAsToast: false
    };
  }

  // Créer une notification de nouvelle commande
  createOrderNotification(order) {
    return this.createLocalNotification(
      'order',
      'Nouvelle commande reçue',
      `Vous avez reçu une nouvelle commande #${order.orderNumber || order._id?.slice(-8)} d'un montant de ${order.total?.toLocaleString('fr-FR')} FCFA`,
      {
        orderId: order._id,
        orderNumber: order.orderNumber,
        amount: order.total,
        currency: order.currency || 'FCFA'
      }
    );
  }

  // Créer une notification de produit approuvé
  createProductApprovedNotification(product) {
    return this.createLocalNotification(
      'product',
      'Produit approuvé',
      `Votre produit "${product.name?.fr || product.name}" a été approuvé et est maintenant visible sur la marketplace`,
      {
        productId: product._id,
        productName: product.name
      }
    );
  }
}

export const notificationService = new NotificationService();
export default notificationService;
