import { faqData, findBestAnswer } from '../../data/faqData';
import { chatService } from '../../services/chatService';

export const getProductImage = (product) => {
  if (product.images?.length > 0) {
    const img = product.images[0];
    if (typeof img === 'string') return img;
    if (img.url) return img.url;
    if (img.public_id) return `https://res.cloudinary.com/harvests/image/upload/w_100,h_100,c_fill/${img.public_id}`;
  }
  return null;
};

export const getUserImage = (user) => {
  if (user.profileImage) {
    if (typeof user.profileImage === 'string') return user.profileImage;
    if (user.profileImage.url) return user.profileImage.url;
  }
  return null;
};

export const getSellerName = (seller) => 
  seller.farmName || seller.companyName || seller.restaurantName || 
  `${seller.firstName || ''} ${seller.lastName || ''}`.trim() || 'Vendeur';

export const getSellerType = (userType) => 
  ({ producer: 'Producteur', transformer: 'Transformateur', restaurateur: 'Restaurateur' }[userType] || 'Vendeur');

export const getTransporterName = (t) => 
  t.companyName || `${t.firstName || ''} ${t.lastName || ''}`.trim() || 'Transporteur';

export const getProductName = (product) => {
  if (typeof product.name === 'object') return product.name.fr || product.name.en || 'Produit';
  return product.name || 'Produit';
};

export const getSearchVariants = (term) => {
  const variants = [term];
  if (term.endsWith('s') && term.length > 2) variants.push(term.slice(0, -1));
  if (term.endsWith('x') && term.length > 2) variants.push(term.slice(0, -1));
  if (!term.endsWith('s') && !term.endsWith('x')) variants.push(term + 's');
  return variants;
};

export const detectSearchType = (message) => {
  const msg = message.toLowerCase();
  if (msg.includes('livreur') || msg.includes('transporteur') || msg.includes('livraison') || msg.includes('coursier')) return 'transporter';
  if (msg.includes('vendeur') || msg.includes('producteur') || msg.includes('agriculteur') || msg.includes('fermier') || msg.includes('restaurant')) return 'seller';
  if (msg.includes('catégorie') || msg.includes('categorie') || msg.includes('rayon')) return 'category';
  return 'product';
};

export const findCustomAnswer = (message, customAnswers) => {
  const normalizedMessage = message.toLowerCase().trim();
  for (const answer of customAnswers) {
    if (answer.keywords?.some(k => normalizedMessage.includes(k.toLowerCase()))) return answer;
    if (answer.question && normalizedMessage.includes(answer.question.toLowerCase().substring(0, 30))) return answer;
  }
  return null;
};

export const tryProductSearch = async (message, { addBotMessage, setIsTyping, setFoundProducts, setFoundSellers, setFoundTransporters, setQuickLinks, setShowCategories, logInteraction }) => {
  // Nettoyer le message mais garder les mots importants (ne pas enlever "des" car c'est important pour "des tomates")
  const cleanedMessage = message
    .replace(/\?|!|,|\./g, '') // Enlever seulement la ponctuation
    .replace(/\b(vous|je|j'ai|est-ce que|avez|vendez|proposez|cherche|veux|voudrais|besoin|acheter|livreur|transporteur|vendeur|producteur|catégorie|categorie)\b/gi, '') // Enlever les mots de liaison
    .replace(/\b(du|de la|un|une|le|la|les)\b/gi, '') // Enlever les articles définis
    .replace(/\s+/g, ' ')
    .trim();
  
  if (cleanedMessage.length < 2) {
    addBotMessage(faqData.defaultMessages.notUnderstood);
    setShowCategories(true);
    return false;
  }

  setIsTyping(true);
  const searchType = detectSearchType(message);
  const searchTerms = getSearchVariants(cleanedMessage);
  
  try {
    if (searchType === 'transporter') {
      for (const term of searchTerms) {
        const transporters = await chatService.searchTransporters(term);
        if (transporters?.length > 0) {
          addBotMessage('🚚 Voici les livreurs trouvés :');
          setFoundTransporters(transporters.slice(0, 3));
          logInteraction(message, 'Livreurs trouvés', 'product_search');
          setIsTyping(false);
          return true;
        }
      }
      addBotMessage(`Aucun livreur trouvé pour "${cleanedMessage}".`);
      setQuickLinks([{ to: '/register', label: 'Devenir livreur' }]);
      setIsTyping(false);
      return false;
    }
    
    if (searchType === 'seller') {
      for (const term of searchTerms) {
        const sellers = await chatService.searchSellers(term);
        if (sellers?.length > 0) {
          addBotMessage('👨‍🌾 Voici les vendeurs trouvés :');
          setFoundSellers(sellers.slice(0, 3));
          logInteraction(message, 'Vendeurs trouvés', 'product_search');
          setIsTyping(false);
          return true;
        }
      }
      addBotMessage(`Aucun vendeur trouvé pour "${cleanedMessage}".`);
      setQuickLinks([{ to: '/products', label: 'Voir tous les produits' }]);
      setIsTyping(false);
      return false;
    }

    for (const term of searchTerms) {
      const products = await chatService.searchProducts(term);
      if (products?.length > 0) {
        addBotMessage('🔍 Voici ce que j\'ai trouvé :');
        setFoundProducts(products.slice(0, 3));
        logInteraction(message, 'Produits trouvés', 'product_search');
        setIsTyping(false);
        return true;
      }
    }
    
    // Si aucun produit trouvé, proposer des produits similaires
    addBotMessage(`Désolé, nous n'avons pas de "${cleanedMessage}" en stock pour le moment. 😔\n\nMais voici des produits similaires qui pourraient vous intéresser :`);
    
    // Chercher des produits similaires (produits populaires ou en vedette)
    try {
      const similarProducts = await chatService.getFeaturedProducts();
      if (similarProducts?.length > 0) {
        setFoundProducts(similarProducts.slice(0, 3));
        setQuickLinks([
          { to: '/products', label: 'Voir tous nos produits' },
          { to: '/products?category=vegetables', label: 'Voir les légumes' }
        ]);
        logInteraction(message, 'Produits similaires proposés', 'similar_products');
        setIsTyping(false);
        return true;
      }
    } catch (error) {
      console.error('Erreur recherche produits similaires:', error);
    }
  } catch (error) {
    console.error('Erreur recherche:', error);
  }
  
  setIsTyping(false);
  addBotMessage(`Désolé, nous n'avons pas de "${cleanedMessage}" en stock. 😔\n\nVoulez-vous voir notre catalogue complet ?`);
  setQuickLinks([{ to: '/products', label: 'Voir tous nos produits' }]);
  setShowCategories(true);
  return false;
};

export const handleIntent = async (intent, message, { isAuthenticated, getUserFirstName, addBotMessage, setIsTyping, setQuickLinks, setFoundProducts, setShowCategories, logInteraction, cart, clearCartAction }) => {
  const firstName = getUserFirstName();
  const namePrefix = firstName ? `${firstName}, ` : '';
  
  switch (intent) {
    case 'BOT_CAPABILITIES':
      addBotMessage(`${namePrefix}Voici ce que je peux faire pour vous 🤖 :\n\n📦 **Commandes**\n• Suivre vos commandes\n\n🔍 **Recherche**\n• Trouver des produits\n\n🛒 **Panier**\n• Voir votre panier\n\n❓ **Questions fréquentes**\n• Livraison, Paiements, Compte`);
      setShowCategories(true);
      break;
      
    case 'GREETING':
      if (isAuthenticated && firstName) {
        addBotMessage(`Bonjour ${firstName} ! 👋 Comment puis-je vous aider ?`);
      } else {
        addBotMessage('Bonjour ! 👋 Bienvenue sur Harvests. Que puis-je faire pour vous ?');
      }
      setShowCategories(true);
      break;

    case 'TRACK_ORDER':
      if (!isAuthenticated) {
        addBotMessage(faqData.defaultMessages.orderTrackingNotLoggedIn);
      } else {
        setIsTyping(true);
        try {
          const orders = await chatService.getRecentOrders();
          if (orders?.length > 0) {
            const order = orders[0];
            const statusLabels = { 'pending': 'En attente', 'confirmed': 'Confirmée', 'preparing': 'En préparation', 'in-transit': 'En livraison', 'delivered': 'Livrée', 'completed': 'Terminée', 'cancelled': 'Annulée' };
            addBotMessage(`📦 Votre dernière commande #${order.orderNumber}\n\nStatut : ${statusLabels[order.status] || order.status}\nTotal : ${order.total?.toLocaleString('fr-FR')} FCFA`);
          } else {
            addBotMessage(faqData.defaultMessages.orderNotFound);
          }
        } catch { addBotMessage('Une erreur est survenue.'); }
      }
      break;

    case 'MY_ORDERS':
      if (!isAuthenticated) {
        addBotMessage('Connectez-vous pour voir vos commandes.');
        setQuickLinks([{ to: '/login', label: 'Se connecter' }]);
      } else {
        setIsTyping(true);
        try {
          const orders = await chatService.getRecentOrders();
          if (orders?.length > 0) {
            const orderList = orders.slice(0, 3).map(o => `• #${o.orderNumber} - ${o.status}`).join('\n');
            addBotMessage(`📋 Vos dernières commandes :\n\n${orderList}`);
            setQuickLinks([{ to: '/dashboard/orders', label: 'Voir toutes mes commandes' }]);
          } else {
            addBotMessage("Vous n'avez pas encore de commandes.");
            setQuickLinks([{ to: '/products', label: 'Découvrir nos produits' }]);
          }
        } catch { addBotMessage('Erreur lors de la récupération.'); }
      }
      break;

    case 'MY_CART':
      if (cart?.items?.length > 0) {
        const total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        addBotMessage(`🛒 Votre panier (${cart.items.length} articles)\n\nTotal : ${total.toLocaleString('fr-FR')} FCFA`);
        setQuickLinks([{ to: '/cart', label: 'Voir mon panier' }]);
      } else {
        addBotMessage('🛒 Votre panier est vide.');
        setQuickLinks([{ to: '/products', label: 'Découvrir nos produits' }]);
      }
      break;

    case 'CLEAR_CART':
      if (cart?.items?.length > 0) {
        addBotMessage('Voulez-vous vraiment vider votre panier ?');
        setQuickLinks([{ action: 'confirmClearCart', label: '✓ Oui' }, { action: 'cancel', label: '✗ Non' }]);
      } else {
        addBotMessage('Votre panier est déjà vide.');
      }
      break;

    case 'MY_FAVORITES':
      if (!isAuthenticated) {
        addBotMessage('Connectez-vous pour voir vos favoris.');
        setQuickLinks([{ to: '/login', label: 'Se connecter' }]);
      } else {
        setIsTyping(true);
        try {
          const favorites = await chatService.getFavorites();
          if (favorites?.length > 0) {
            addBotMessage(`❤️ Vous avez ${favorites.length} produit(s) en favoris.`);
            setFoundProducts(favorites.slice(0, 3));
          } else {
            addBotMessage("❤️ Vous n'avez pas encore de favoris.");
            setQuickLinks([{ to: '/products', label: 'Découvrir nos produits' }]);
          }
        } catch { addBotMessage('Erreur lors de la récupération.'); }
      }
      break;

    case 'NOTIFICATIONS':
      if (!isAuthenticated) {
        addBotMessage('Connectez-vous pour voir vos notifications.');
        setQuickLinks([{ to: '/login', label: 'Se connecter' }]);
      } else {
        setIsTyping(true);
        try {
          const notifications = await chatService.getNotifications();
          if (notifications?.length > 0) {
            addBotMessage(`🔔 Vous avez ${notifications.length} notification(s).`);
            setQuickLinks([{ to: '/dashboard/notifications', label: 'Voir mes notifications' }]);
          } else {
            addBotMessage('🔔 Aucune nouvelle notification.');
          }
        } catch { addBotMessage('Erreur.'); }
      }
      break;

    case 'NEW_PRODUCTS':
      setIsTyping(true);
      try {
        const newProducts = await chatService.getNewProducts();
        if (newProducts?.length > 0) {
          addBotMessage('✨ Les dernières nouveautés :');
          setFoundProducts(newProducts.slice(0, 3));
        } else {
          addBotMessage('Pas de nouveaux produits récemment.');
        }
      } catch { addBotMessage('Erreur.'); }
      break;

    case 'CONTACT_SUPPORT':
      addBotMessage(faqData.defaultMessages.contactSupport);
      setQuickLinks([{ to: '/contact', label: 'Page Contact' }]);
      break;

    default:
      addBotMessage(faqData.defaultMessages.notUnderstood);
      setShowCategories(true);
  }
};

