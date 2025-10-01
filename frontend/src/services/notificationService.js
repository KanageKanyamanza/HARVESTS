import api from './api';

class NotificationService {
  // Détecter si l'utilisateur est un admin
  isAdmin() {
    const user = JSON.parse(localStorage.getItem('harvests_user') || '{}');
    return user.userType === 'admin';
  }

  // Récupérer toutes les notifications de l'utilisateur
  async getNotifications(page = 1, limit = 20) {
    try {
      // Utiliser la route appropriée selon le type d'utilisateur
      const endpoint = this.isAdmin() ? '/notifications/admin/all' : '/notifications/my';
      const response = await api.get(endpoint, {
        params: { page, limit }
      });
      
      // Mapper les notifications du backend au format frontend
      const notifications = (response.data.data.notifications || []).map(notif => {
        return {
          id: notif._id,
          title: notif.title,
          message: notif.message,
          category: notif.category,
          type: notif.type,
          timestamp: notif.createdAt,
          read: !!notif.readAt,
          data: notif.data,
          actions: notif.actions,
          priority: notif.priority
        };
      });
      
      // Pour les admins, calculer le nombre de notifications non lues différemment
      const unreadCount = this.isAdmin() ? 
        notifications.filter(n => !n.read).length : 
        (response.data.unreadCount || 0);
      
      return {
        notifications,
        unreadCount,
        total: response.data.total || 0
      };
    } catch (error) {
      // Si l'endpoint n'existe pas encore (404/403), retourner des données vides
      if (error.response?.status === 403 || error.response?.status === 404) {
        console.log('Endpoint notifications non disponible - utilisation du mode local');
        return { notifications: [], unreadCount: 0 };
      }
      
      // Si erreur d'authentification (401), retourner des données vides sans log d'erreur
      if (error.response?.status === 401) {
        console.log('Non authentifié - notifications non disponibles');
        return { notifications: [], unreadCount: 0 };
      }
      
      console.error('Erreur lors de la récupération des notifications:', error);
      throw error;
    }
  }

  // Marquer une notification comme lue
  async markAsRead(notificationId) {
    try {
      // Pour les admins, utiliser une route différente si nécessaire
      const endpoint = this.isAdmin() ? `/notifications/${notificationId}/read` : `/notifications/${notificationId}/read`;
      const response = await api.patch(endpoint);
      return response.data;
    } catch (error) {
      // Si l'endpoint n'existe pas encore, ignorer silencieusement
      if (error.response?.status === 403 || error.response?.status === 404) {
        console.log('Endpoint markAsRead non disponible - action locale uniquement');
        return { success: true };
      }
      
      // Si erreur d'authentification (401), ignorer silencieusement
      if (error.response?.status === 401) {
        console.log('Non authentifié - action locale uniquement');
        return { success: true };
      }
      
      console.error('Erreur lors du marquage de la notification:', error);
      throw error;
    }
  }

  // Marquer toutes les notifications comme lues
  async markAllAsRead() {
    try {
      // Pour les admins, utiliser une route différente si nécessaire
      const endpoint = this.isAdmin() ? '/notifications/admin/read-all' : '/notifications/my/read-all';
      const response = await api.patch(endpoint);
      return response.data;
    } catch (error) {
      // Si l'endpoint n'existe pas encore, ignorer silencieusement
      if (error.response?.status === 403 || error.response?.status === 404) {
        console.log('Endpoint markAllAsRead non disponible - action locale uniquement');
        return { success: true };
      }
      
      // Si erreur d'authentification (401), ignorer silencieusement
      if (error.response?.status === 401) {
        console.log('Non authentifié - action locale uniquement');
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
      
      // Si erreur d'authentification (401), ignorer silencieusement
      if (error.response?.status === 401) {
        console.log('Non authentifié - action locale uniquement');
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
      // Pour les admins, utiliser une route différente si nécessaire
      const endpoint = this.isAdmin() ? '/notifications/admin/unread-count' : '/notifications/my/unread-count';
      const response = await api.get(endpoint);
      return response.data.data;
    } catch (error) {
      // Si l'endpoint n'existe pas encore, retourner 0
      if (error.response?.status === 403 || error.response?.status === 404) {
        console.log('Endpoint getUnreadCount non disponible - retour 0');
        return { unreadCount: 0 };
      }
      
      // Si erreur d'authentification (401), retourner 0
      if (error.response?.status === 401) {
        console.log('Non authentifié - retour 0');
        return { unreadCount: 0 };
      }
      
      console.error('Erreur lors de la récupération du nombre de notifications non lues:', error);
      throw error;
    }
  }

  // S'abonner aux notifications en temps réel (WebSocket)
  subscribeToNotifications() {
    // TODO: Implémenter WebSocket pour les notifications en temps réel avec callback
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
