import { faqData, findBestAnswer } from '../../data/faqData';
import { chatService } from '../../services/chatService';
import { 
  extractKeywords, 
  generateSearchVariations,
  enhanceResponse,
  handleSearchError,
  understandQuestion,
  generateContextualSuggestions
} from '../../utils/chatbotImprovements';

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

export const tryProductSearch = async (message, { addBotMessage, setIsTyping, setFoundProducts, setFoundSellers, setFoundTransporters, setQuickLinks, setShowCategories, logInteraction, getUserFirstName, onSearchComplete }) => {
  // Utiliser l'extraction améliorée de mots-clés
  const keywords = extractKeywords(message);
  
  if (keywords.length === 0) {
    addBotMessage(faqData.defaultMessages.notUnderstood);
    setShowCategories(true);
    return false;
  }
  
  // Utiliser les mots-clés extraits pour créer le terme de recherche
  const cleanedMessage = keywords.join(' ').trim();
  
  if (cleanedMessage.length < 2) {
    addBotMessage(faqData.defaultMessages.notUnderstood);
    setShowCategories(true);
    return false;
  }

  setIsTyping(true);
  const searchType = detectSearchType(message);
  // Utiliser les variations améliorées de recherche
  const searchTerms = generateSearchVariations(cleanedMessage);
  
  try {
    if (searchType === 'transporter') {
      for (const term of searchTerms) {
        try {
          const transporters = await chatService.searchTransporters(term);
          if (transporters?.length > 0) {
            const response = enhanceResponse(
              '🚚 Voici les livreurs trouvés :',
              { firstName: getUserFirstName?.() }
            );
            addBotMessage(response);
            setFoundTransporters(transporters.slice(0, 3));
            logInteraction(message, 'Livreurs trouvés', 'product_search');
            setIsTyping(false);
            return true;
          }
        } catch (error) {
          // Continuer avec le terme suivant en cas d'erreur
          continue;
        }
      }
      addBotMessage(`Aucun livreur trouvé pour "${cleanedMessage}".`);
      setQuickLinks([{ to: '/register', label: 'Devenir livreur' }]);
      setIsTyping(false);
      return false;
    }
    
    if (searchType === 'seller') {
      for (const term of searchTerms) {
        try {
          const sellers = await chatService.searchSellers(term);
          if (sellers?.length > 0) {
            const response = enhanceResponse(
              '👨‍🌾 Voici les vendeurs trouvés :',
              { firstName: getUserFirstName?.() }
            );
            addBotMessage(response);
            setFoundSellers(sellers.slice(0, 3));
            logInteraction(message, 'Vendeurs trouvés', 'product_search');
            setIsTyping(false);
            return true;
          }
        } catch (error) {
          // Continuer avec le terme suivant en cas d'erreur
          continue;
        }
      }
      addBotMessage(`Aucun vendeur trouvé pour "${cleanedMessage}".`);
      setQuickLinks([{ to: '/products', label: 'Voir tous les produits' }]);
      setIsTyping(false);
      return false;
    }

    for (const term of searchTerms) {
      try {
        const products = await chatService.searchProducts(term);
        if (products?.length > 0) {
          const response = enhanceResponse(
            '🔍 Voici ce que j\'ai trouvé :',
            { 
              firstName: getUserFirstName?.(),
              previousSearch: message
            }
          );
          addBotMessage(response);
          setFoundProducts(products.slice(0, 3));
          logInteraction(message, 'Produits trouvés', 'product_search');
          
          // Notifier le callback de recherche complétée
          if (onSearchComplete) {
            onSearchComplete(term, products);
          }
          
          setIsTyping(false);
          return true;
        }
      } catch (error) {
        // Si erreur sur le premier terme, essayer les autres
        if (term === searchTerms[0]) {
          const errorInfo = handleSearchError(error, term);
          // Ne pas afficher l'erreur immédiatement, continuer avec les autres termes
        }
        continue;
      }
    }
    
    // Si aucun produit trouvé, proposer des produits similaires
    try {
      const similarProducts = await chatService.getFeaturedProducts();
      if (similarProducts?.length > 0) {
        const response = enhanceResponse(
          `Voici des produits qui pourraient vous intéresser :`,
          { firstName: getUserFirstName?.() }
        );
        addBotMessage(response);
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
    const errorInfo = handleSearchError(error, cleanedMessage);
    addBotMessage(errorInfo.message);
    if (errorInfo.suggestions) {
      setQuickLinks(errorInfo.suggestions.map(s => ({ 
        to: s.action === 'categories' ? '/categories' : '/products',
        label: s.text 
      })));
    }
    setIsTyping(false);
    return false;
  }
  
  setIsTyping(false);
  const response = enhanceResponse(
    `Désolé, nous n'avons pas de "${cleanedMessage}" en stock. 😔\n\nVoulez-vous voir notre catalogue complet ?`,
    { firstName: getUserFirstName?.() }
  );
  addBotMessage(response);
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

    case 'SERVICES_PLATFORM':
      addBotMessage(`${namePrefix}Harvests est une plateforme de commerce en ligne spécialisée dans les produits agricoles et alimentaires locaux. Nos services incluent :\n\n🛒 **Achat de produits**\n• Fruits et légumes frais\n• Produits transformés\n• Plats cuisinés\n• Produits bio et locaux\n\n👨‍🌾 **Vente pour producteurs**\n• Mise en ligne de vos produits\n• Gestion des commandes\n• Paiement sécurisé\n\n🚚 **Livraison**\n• Livraison rapide dans tout le Sénégal\n• Suivi en temps réel\n• Réseau de transporteurs partenaires\n\n💳 **Paiement sécurisé**\n• Mobile Money (Orange Money, Wave)\n• Cartes bancaires\n• Paiement à la livraison`);
      setQuickLinks([
        { to: '/products', label: 'Voir nos produits' },
        { to: '/register', label: 'Devenir vendeur' }
      ]);
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

    case 'DEVENIR_TRANSFORMATEUR':
      addBotMessage(`${namePrefix}Pour devenir transformateur sur Harvests :\n\n1. Créez un compte "Transformateur"\n2. Remplissez votre profil avec vos informations d'entreprise\n3. Téléchargez vos documents (certificats, licences)\n4. Attendez la validation de votre compte\n5. Commencez à ajouter vos produits transformés\n\nLes transformateurs peuvent vendre des jus, confitures, conserves, etc.`);
      setQuickLinks([{ to: '/register', label: 'Créer un compte Transformateur' }]);
      break;

    case 'DEVENIR_RESTAURATEUR':
      addBotMessage(`${namePrefix}Pour devenir restaurateur sur Harvests :\n\n1. Créez un compte "Restaurateur"\n2. Complétez votre profil avec les informations de votre restaurant\n3. Ajoutez votre menu et vos plats\n4. Configurez vos horaires et zones de livraison\n5. Attendez la validation\n\nLes restaurateurs peuvent vendre des plats cuisinés ET acheter des produits pour leur cuisine !`);
      setQuickLinks([{ to: '/register', label: 'Créer un compte Restaurateur' }]);
      break;

    case 'DEVENIR_EXPORTATEUR':
      addBotMessage(`${namePrefix}Pour devenir exportateur sur Harvests :\n\n1. Créez un compte "Exportateur"\n2. Remplissez votre profil avec vos informations d'entreprise\n3. Téléchargez vos documents d'exportation\n4. Définissez vos zones d'export et produits\n5. Attendez la validation\n\nLes exportateurs peuvent exporter des produits agricoles vers l'international.`);
      setQuickLinks([{ to: '/register', label: 'Créer un compte Exportateur' }]);
      break;

    case 'PRODUITS_BIO':
      setIsTyping(true);
      try {
        const bioProducts = await chatService.searchProducts('bio');
        if (bioProducts?.length > 0) {
          addBotMessage('🌱 Voici nos produits biologiques certifiés :');
          setFoundProducts(bioProducts.slice(0, 3));
          setQuickLinks([{ to: '/products?category=bio', label: 'Voir tous les produits bio' }]);
        } else {
          addBotMessage('🌱 Nous proposons des produits biologiques certifiés. Utilisez le filtre "Bio" dans la recherche pour les trouver. Tous nos producteurs bio sont vérifiés et certifiés.');
          setQuickLinks([{ to: '/products', label: 'Voir tous les produits' }]);
        }
      } catch {
        addBotMessage('🌱 Nous proposons des produits biologiques certifiés. Utilisez le filtre "Bio" dans la recherche pour les trouver.');
        setQuickLinks([{ to: '/products', label: 'Voir tous les produits' }]);
      } finally {
        setIsTyping(false);
      }
      break;

    case 'PROMOTIONS':
      setIsTyping(true);
      try {
        const promotions = await chatService.getPromotions();
        if (promotions?.length > 0) {
          addBotMessage('🎉 Voici nos promotions actuelles :');
          setFoundProducts(promotions.slice(0, 3));
          setQuickLinks([{ to: '/products?promo=true', label: 'Voir toutes les promotions' }]);
        } else {
          addBotMessage('💡 Actuellement, la livraison est gratuite à partir de 50 000 FCFA ! Consultez régulièrement nos offres spéciales.');
          setQuickLinks([{ to: '/products', label: 'Voir nos produits' }]);
        }
      } catch {
        addBotMessage('💡 Actuellement, la livraison est gratuite à partir de 50 000 FCFA ! Consultez régulièrement nos offres spéciales.');
        setQuickLinks([{ to: '/products', label: 'Voir nos produits' }]);
      } finally {
        setIsTyping(false);
      }
      break;

    case 'AVIS_PRODUITS':
      if (!isAuthenticated) {
        addBotMessage('Pour laisser un avis, vous devez être connecté et avoir commandé le produit.');
        setQuickLinks([{ to: '/login', label: 'Se connecter' }]);
      } else {
        addBotMessage(`${namePrefix}Pour laisser un avis sur un produit :\n\n1. Allez dans "Mes commandes"\n2. Sélectionnez une commande livrée\n3. Cliquez sur "Laisser un avis" pour chaque produit\n4. Donnez une note (1 à 5 étoiles) et un commentaire\n\nLes avis aident les autres clients à faire leur choix !`);
        setQuickLinks([{ to: '/dashboard/orders', label: 'Voir mes commandes' }]);
      }
      break;

    default:
      addBotMessage(faqData.defaultMessages.notUnderstood);
      setShowCategories(true);
  }
};

