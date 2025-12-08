const { sendNotificationToAdmins, getActiveAdminsWithNotificationEmail } = require('./adminEmailUtils');
const Notification = require('../models/Notification');
const Admin = require('../models/Admin');

/**
 * Crée des notifications en base de données pour tous les admins actifs
 * @param {Object} notificationData - Données de la notification
 * @param {string} notificationData.title - Titre de la notification
 * @param {string} notificationData.message - Message de la notification
 * @param {string} notificationData.type - Type de notification (order, product, user, etc.)
 * @param {string} notificationData.category - Catégorie (system, order, product, etc.)
 * @param {Object} notificationData.data - Données supplémentaires
 * @param {Array} notificationData.actions - Actions possibles
 */
async function createNotificationsForAdmins({ title, message, type = 'announcement', category = 'system', data = {}, actions = [] }) {
  try {
    console.log('🔔 [createNotificationsForAdmins] Début de la création de notifications pour les admins');
    console.log('🔔 [createNotificationsForAdmins] Données:', { title, message, type, category });
    
    // Récupérer tous les admins actifs
    const activeAdmins = await Admin.find({ isActive: true }).select('_id').lean();
    console.log(`🔔 [createNotificationsForAdmins] ${activeAdmins.length} admin(s) actif(s) trouvé(s)`);
    
    if (activeAdmins.length === 0) {
      console.log('⚠️ [createNotificationsForAdmins] Aucun admin actif trouvé pour créer des notifications');
      return;
    }

    // Transformer les actions au format attendu par le schéma
    const formattedActions = (actions || []).map(action => ({
      type: action.type || 'view',
      label: action.label || '',
      url: action.url || '',
      method: action.method || 'GET',
      payload: action.payload || {}
    }));

    // Créer une notification pour chaque admin
    const notifications = [];
    for (const admin of activeAdmins) {
      try {
        console.log(`🔔 [createNotificationsForAdmins] Création notification pour admin ${admin._id}`);
        const notificationData = {
          recipient: admin._id,
          recipientModel: 'Admin', // Indiquer que le destinataire est un Admin
          type,
          category,
          title,
          message,
          data: data, // Les données sans les actions
          actions: formattedActions, // Les actions formatées
          channels: {
            inApp: { enabled: true },
            email: { enabled: false }, // Email géré séparément par sendNotificationToAdmins
            push: { enabled: false }
          },
          priority: 'high'
        };
        console.log(`🔔 [createNotificationsForAdmins] Données de notification:`, {
          recipient: notificationData.recipient,
          recipientModel: notificationData.recipientModel,
          type: notificationData.type,
          category: notificationData.category,
          title: notificationData.title
        });
        
        const notification = await Notification.createNotification(notificationData);
        console.log(`✅ [createNotificationsForAdmins] Notification créée avec succès:`, {
          id: notification._id,
          recipient: notification.recipient,
          recipientModel: notification.recipientModel
        });
        notifications.push(notification);
      } catch (error) {
        console.error(`❌ [createNotificationsForAdmins] Erreur lors de la création de la notification pour l'admin ${admin._id}:`, error);
        console.error('❌ [createNotificationsForAdmins] Détails de l\'erreur:', error.message);
        console.error('❌ [createNotificationsForAdmins] Stack:', error.stack);
        // Continuer avec les autres admins même en cas d'erreur
      }
    }

    console.log(`✅ ${notifications.length} notification(s) créée(s) pour ${activeAdmins.length} admin(s) actif(s)`);
    if (notifications.length > 0) {
      console.log('📋 Exemple de notification créée:', {
        id: notifications[0]._id,
        recipient: notifications[0].recipient,
        recipientModel: notifications[0].recipientModel,
        type: notifications[0].type,
        title: notifications[0].title
      });
    }
    return notifications;
  } catch (error) {
    console.error('Erreur lors de la création des notifications pour les admins:', error);
  }
}

/**
 * Notifie les admins d'un nouveau compte utilisateur créé
 */
exports.notifyNewUserAccount = async (newUser) => {
  try {
    console.log('📧 [notifyNewUserAccount] Notification d\'un nouveau compte utilisateur:', newUser.email);
    const userName = `${newUser.firstName} ${newUser.lastName || ''}`.trim();
    const notificationData = {
      title: 'Nouveau compte utilisateur créé',
      message: `Un nouveau compte ${newUser.userType} a été créé sur la plateforme Harvests.`,
      data: {
        'Type d\'utilisateur': newUser.userType,
        'Prénom': newUser.firstName,
        'Nom': newUser.lastName || 'N/A',
        'Email': newUser.email,
        'Téléphone': newUser.phone || 'N/A',
        'Pays': newUser.country || 'N/A',
        'Date de création': new Date().toLocaleString('fr-FR'),
        userId: newUser._id?.toString()
      },
      actions: [{
        label: 'Voir le profil utilisateur',
        url: `/admin/users/${newUser._id}` // Chemin relatif au lieu d'URL absolue
      }]
    };
    
    // Créer des notifications en base de données pour tous les admins
    console.log('📧 [notifyNewUserAccount] Création des notifications en base de données...');
    await createNotificationsForAdmins({
      ...notificationData,
      type: 'announcement', // Type système pour les notifications admin
      category: 'system'
    });
    console.log('📧 [notifyNewUserAccount] Notifications créées en base de données');
    
    // Envoyer les emails (fonction existante)
    console.log('📧 [notifyNewUserAccount] Envoi des emails aux admins...');
    await sendNotificationToAdmins(notificationData);
    console.log('📧 [notifyNewUserAccount] Emails envoyés aux admins');
  } catch (error) {
    console.error('❌ [notifyNewUserAccount] Erreur notification nouveau compte utilisateur:', error);
    console.error('❌ [notifyNewUserAccount] Stack:', error.stack);
  }
};

/**
 * Notifie les admins d'une nouvelle commande créée
 */
exports.notifyNewOrder = async (order, buyer) => {
  try {
    const buyerName = `${buyer.firstName} ${buyer.lastName}`;
    const orderValue = order.total?.toLocaleString('fr-FR') || '0';
    const notificationData = {
      title: 'Nouvelle commande créée',
      message: `Une nouvelle commande a été créée par ${buyerName} pour un montant de ${orderValue} FCFA.`,
      data: {
        'Numéro de commande': order.orderNumber || order._id,
        'Client': buyerName,
        'Email client': buyer.email,
        'Montant total': `${orderValue} FCFA`,
        'Statut': order.status || 'pending',
        'Méthode de livraison': order.deliveryMethod || 'N/A',
        'Nombre d\'articles': order.items?.length || 0,
        'Date': new Date().toLocaleString('fr-FR'),
        orderId: order._id?.toString()
      },
      actions: [{
        label: 'Voir la commande',
        url: `/admin/orders/${order._id}` // Chemin relatif au lieu d'URL absolue
      }]
    };
    
    // Créer des notifications en base de données pour tous les admins
    await createNotificationsForAdmins({
      ...notificationData,
      type: 'order_created', // Type correct selon l'enum
      category: 'order'
    });
    
    // Envoyer les emails (fonction existante)
    await sendNotificationToAdmins(notificationData);
  } catch (error) {
    console.error('Erreur notification nouvelle commande:', error);
  }
};

/**
 * Notifie les admins d'une commande annulée
 */
exports.notifyOrderCancelled = async (order, cancelledBy, reason) => {
  try {
    const cancelledByName = cancelledBy ? `${cancelledBy.firstName} ${cancelledBy.lastName}` : 'Système';
    const buyerName = order.buyer?.firstName && order.buyer?.lastName 
      ? `${order.buyer.firstName} ${order.buyer.lastName}` 
      : 'Client';
    const notificationData = {
      title: 'Commande annulée',
      message: `La commande ${order.orderNumber || order._id} a été annulée par ${cancelledByName}.`,
      data: {
        'Numéro de commande': order.orderNumber || order._id,
        'Client': buyerName,
        'Annulée par': cancelledByName,
        'Raison': reason || 'Non spécifiée',
        'Montant': `${order.total?.toLocaleString('fr-FR') || '0'} FCFA`,
        'Date d\'annulation': new Date().toLocaleString('fr-FR'),
        orderId: order._id?.toString()
      },
      actions: [{
        label: 'Voir la commande',
        url: `/admin/orders/${order._id}` // Chemin relatif au lieu d'URL absolue
      }]
    };
    
    // Créer des notifications en base de données pour tous les admins
    await createNotificationsForAdmins({
      ...notificationData,
      type: 'order_created', // Type correct selon l'enum
      category: 'order'
    });
    
    // Envoyer les emails (fonction existante)
    await sendNotificationToAdmins(notificationData);
  } catch (error) {
    console.error('Erreur notification commande annulée:', error);
  }
};

/**
 * Notifie les admins d'un produit en attente d'approbation
 */
exports.notifyProductPending = async (product, producer) => {
  try {
    const productName = typeof product.name === 'object' 
      ? (product.name.fr || product.name.en || 'Produit')
      : product.name || 'Produit';
    const producerName = `${producer.firstName} ${producer.lastName}`;
    const notificationData = {
      title: 'Nouveau produit en attente d\'approbation',
      message: `Le producteur ${producerName} a créé un nouveau produit "${productName}" qui nécessite votre approbation.`,
      data: {
        'Nom du produit': productName,
        'Producteur': producerName,
        'Email producteur': producer.email,
        'Prix': `${product.price?.toLocaleString('fr-FR') || '0'} FCFA`,
        'Catégorie': product.category || 'N/A',
        'Date de création': new Date(product.createdAt).toLocaleString('fr-FR'),
        productId: product._id?.toString()
      },
      actions: [{
        label: 'Approuver/Rejeter le produit',
        url: `/admin/products/${product._id}` // Chemin relatif au lieu d'URL absolue
      }]
    };
    
    // Créer des notifications en base de données pour tous les admins
    await createNotificationsForAdmins({
      ...notificationData,
      type: 'announcement', // Type système pour produit en attente d'approbation
      category: 'product'
    });
    
    // Envoyer les emails (fonction existante)
    await sendNotificationToAdmins(notificationData);
  } catch (error) {
    console.error('Erreur notification produit en attente:', error);
  }
};

/**
 * Notifie les admins d'un nouvel avis créé
 */
exports.notifyNewReview = async (review, reviewer, product) => {
  try {
    const reviewerName = `${reviewer.firstName} ${reviewer.lastName}`;
    const productName = typeof product.name === 'object' 
      ? (product.name.fr || product.name.en || 'Produit')
      : product.name || 'Produit';
    
    await sendNotificationToAdmins({
      title: 'Nouvel avis créé',
      message: `${reviewerName} a laissé un avis ${review.rating} étoiles pour le produit "${productName}".`,
      data: {
        'Auteur': reviewerName,
        'Email': reviewer.email,
        'Produit': productName,
        'Note': `${review.rating}/5`,
        'Titre': review.title || 'Sans titre',
        'Achat vérifié': review.isVerifiedPurchase ? 'Oui' : 'Non',
        'Date': new Date(review.createdAt).toLocaleString('fr-FR')
      },
      actions: [{
        label: 'Voir l\'avis',
        url: `/admin/reviews/${review._id}` // Chemin relatif au lieu d'URL absolue
      }]
    });
  } catch (error) {
    console.error('Erreur notification nouvel avis:', error);
  }
};

/**
 * Notifie les admins d'un avis signalé
 */
exports.notifyReviewReported = async (review, reporter, reason, description) => {
  try {
    const reporterName = `${reporter.firstName} ${reporter.lastName}`;
    
    await sendNotificationToAdmins({
      title: 'Avis signalé',
      message: `Un avis a été signalé par ${reporterName} pour la raison: ${reason}.`,
      data: {
        'Signalé par': reporterName,
        'Email': reporter.email,
        'Raison': reason,
        'Description': description || 'Non fournie',
        'ID de l\'avis': review._id.toString(),
        'Note': `${review.rating}/5`,
        'Date du signalement': new Date().toLocaleString('fr-FR')
      },
      actions: [{
        label: 'Examiner l\'avis',
        url: `${process.env.FRONTEND_URL || 'https://www.harvests.site'}/admin/reviews/${review._id}`
      }]
    });
  } catch (error) {
    console.error('Erreur notification avis signalé:', error);
  }
};

/**
 * Notifie les admins d'un utilisateur suspendu
 */
exports.notifyUserSuspended = async (user, suspendedBy, reason, duration) => {
  try {
    const userName = `${user.firstName} ${user.lastName}`;
    const suspendedByName = suspendedBy ? `${suspendedBy.firstName} ${suspendedBy.lastName}` : 'Système';
    
    await sendNotificationToAdmins({
      title: 'Utilisateur suspendu',
      message: `L'utilisateur ${userName} a été suspendu par ${suspendedByName}.`,
      data: {
        'Utilisateur': userName,
        'Email': user.email,
        'Type': user.userType,
        'Suspendu par': suspendedByName,
        'Raison': reason || 'Non spécifiée',
        'Durée': duration || 'Indéfinie',
        'Date': new Date().toLocaleString('fr-FR')
      },
      actions: [{
        label: 'Voir le profil utilisateur',
        url: `/admin/users/${user._id}` // Chemin relatif au lieu d'URL absolue
      }]
    });
  } catch (error) {
    console.error('Erreur notification utilisateur suspendu:', error);
  }
};

/**
 * Notifie les admins d'un utilisateur banni
 */
exports.notifyUserBanned = async (user, bannedBy, reason) => {
  try {
    const userName = `${user.firstName} ${user.lastName}`;
    const bannedByName = bannedBy ? `${bannedBy.firstName} ${bannedBy.lastName}` : 'Système';
    
    await sendNotificationToAdmins({
      title: 'Utilisateur banni',
      message: `L'utilisateur ${userName} a été banni par ${bannedByName}.`,
      data: {
        'Utilisateur': userName,
        'Email': user.email,
        'Type': user.userType,
        'Banni par': bannedByName,
        'Raison': reason || 'Non spécifiée',
        'Date': new Date().toLocaleString('fr-FR')
      },
      actions: [{
        label: 'Voir le profil utilisateur',
        url: `/admin/users/${user._id}` // Chemin relatif au lieu d'URL absolue
      }]
    });
  } catch (error) {
    console.error('Erreur notification utilisateur banni:', error);
  }
};

/**
 * Notifie les admins d'un utilisateur supprimé
 */
exports.notifyUserDeleted = async (userData, deletedBy) => {
  try {
    const userName = userData.firstName && userData.lastName 
      ? `${userData.firstName} ${userData.lastName}` 
      : userData.email || 'Utilisateur';
    const deletedByName = deletedBy ? `${deletedBy.firstName} ${deletedBy.lastName}` : 'Système';
    
    await sendNotificationToAdmins({
      title: 'Utilisateur supprimé',
      message: `L'utilisateur ${userName} a été supprimé par ${deletedByName}.`,
      data: {
        'Utilisateur': userName,
        'Email': userData.email || 'N/A',
        'Type': userData.userType || 'N/A',
        'Supprimé par': deletedByName,
        'Date': new Date().toLocaleString('fr-FR')
      }
    });
  } catch (error) {
    console.error('Erreur notification utilisateur supprimé:', error);
  }
};

/**
 * Notifie les admins d'un paiement échoué
 */
exports.notifyPaymentFailed = async (order, paymentData, errorMessage) => {
  try {
    const buyerName = order.buyer?.firstName && order.buyer?.lastName
      ? `${order.buyer.firstName} ${order.buyer.lastName}`
      : 'Client';
    
    await sendNotificationToAdmins({
      title: 'Paiement échoué',
      message: `Le paiement pour la commande ${order.orderNumber || order._id} a échoué.`,
      data: {
        'Numéro de commande': order.orderNumber || order._id,
        'Client': buyerName,
        'Email client': order.buyer?.email || 'N/A',
        'Montant': `${order.total?.toLocaleString('fr-FR') || '0'} FCFA`,
        'Méthode de paiement': paymentData?.method || 'N/A',
        'Erreur': errorMessage || 'Non spécifiée',
        'Date': new Date().toLocaleString('fr-FR')
      },
      actions: [{
        label: 'Voir la commande',
        url: `/admin/orders/${order._id}` // Chemin relatif au lieu d'URL absolue
      }]
    });
  } catch (error) {
    console.error('Erreur notification paiement échoué:', error);
  }
};

/**
 * Notifie les admins d'une commande de forte valeur
 */
exports.notifyHighValueOrder = async (order, buyer) => {
  try {
    const buyerName = `${buyer.firstName} ${buyer.lastName}`;
    const orderValue = order.total?.toLocaleString('fr-FR') || '0';
    
    await sendNotificationToAdmins({
      title: 'Commande de forte valeur',
      message: `Une commande de forte valeur (${orderValue} FCFA) a été créée par ${buyerName}.`,
      data: {
        'Numéro de commande': order.orderNumber || order._id,
        'Client': buyerName,
        'Email client': buyer.email,
        'Montant total': `${orderValue} FCFA`,
        'Statut': order.status || 'pending',
        'Date': new Date().toLocaleString('fr-FR')
      },
      actions: [{
        label: 'Voir la commande',
        url: `/admin/orders/${order._id}` // Chemin relatif au lieu d'URL absolue
      }]
    });
  } catch (error) {
    console.error('Erreur notification commande de forte valeur:', error);
  }
};

