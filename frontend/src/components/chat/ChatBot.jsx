import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MessageCircle, X, Minimize2, Package, Truck, CreditCard, User, ShoppingBag, Trash2, ThumbsUp, ThumbsDown, Bell, Heart, Star, Sparkles, ShoppingCart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { faqData, findBestAnswer } from '../../data/faqData';
import { useAuth } from '../../hooks/useAuth';
import { chatService } from '../../services/chatService';
import { useCart } from '../../contexts/CartContext';

const STORAGE_KEY = 'harvests_chat';
const INACTIVITY_TIMEOUT = 300000; // 5 minutes

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved).isOpen : false;
  });
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved).messages : [];
  });
  const [isTyping, setIsTyping] = useState(false);
  const [showCategories, setShowCategories] = useState(true);
  const [quickQuestions, setQuickQuestions] = useState([]);
  const [quickLinks, setQuickLinks] = useState([]);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState({});
  const messagesEndRef = useRef(null);
  const inactivityTimer = useRef(null);
  const { isAuthenticated, user } = useAuth();
  const { cart, clearCart: clearCartAction } = useCart();
  const navigate = useNavigate();

  // Sauvegarder dans sessionStorage
  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ isOpen, messages }));
  }, [isOpen, messages]);

  // Timer d'inactivité - efface après 1 minute sans interaction
  const resetInactivityTimer = () => {
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
    }
    inactivityTimer.current = setTimeout(() => {
      setMessages([]);
      setShowCategories(true);
      setQuickQuestions([]);
      setQuickLinks([]);
      setFoundProducts([]);
      sessionStorage.removeItem(STORAGE_KEY);
    }, INACTIVITY_TIMEOUT);
  };

  useEffect(() => {
    if (messages.length > 0) {
      resetInactivityTimer();
    }
    return () => {
      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
      }
    };
  }, [messages]);

  // Message de bienvenue au premier ouverture
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      addBotMessage(faqData.defaultMessages.welcome);
      if (isAuthenticated) {
        setShowQuickActions(true);
      }
    }
  }, [isOpen]);

  // Scroll automatique vers le bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Scroll vers le bas à l'ouverture
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
      }, 100);
    }
  }, [isOpen, isMinimized]);

  const addBotMessage = (text, delay = 500) => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now(),
        text,
        isBot: true,
        timestamp: new Date()
      }]);
      setIsTyping(false);
    }, delay);
  };

  const addUserMessage = (text) => {
    setMessages(prev => [...prev, {
      id: Date.now(),
      text,
      isBot: false,
      timestamp: new Date()
    }]);
  };

  const handleSendMessage = async (message) => {
    addUserMessage(message);
    setShowCategories(false);
    setQuickLinks([]);
    setFoundProducts([]);
    setFoundSellers([]);
    setFoundTransporters([]);
    
    const result = findBestAnswer(message);
    
    if (result.type === 'faq') {
      addBotMessage(result.faq.answer);
    } else if (result.type === 'intent') {
      await handleIntent(result.intent, message);
    } else {
      // Si pas de FAQ trouvée, tenter une recherche de produit
      await tryProductSearch(message);
    }
  };

  const [foundProducts, setFoundProducts] = useState([]);
  const [foundSellers, setFoundSellers] = useState([]);
  const [foundTransporters, setFoundTransporters] = useState([]);

  // Fonction pour obtenir les variantes singulier/pluriel d'un mot
  const getSearchVariants = (term) => {
    const variants = [term];
    if (term.endsWith('s') && term.length > 2) {
      variants.push(term.slice(0, -1));
    }
    if (term.endsWith('x') && term.length > 2) {
      variants.push(term.slice(0, -1));
    }
    if (!term.endsWith('s') && !term.endsWith('x')) {
      variants.push(term + 's');
    }
    return variants;
  };

  // Détecter le type de recherche
  const detectSearchType = (message) => {
    const msg = message.toLowerCase();
    if (msg.includes('livreur') || msg.includes('transporteur') || msg.includes('livraison') || msg.includes('coursier')) {
      return 'transporter';
    }
    if (msg.includes('vendeur') || msg.includes('producteur') || msg.includes('agriculteur') || msg.includes('fermier') || msg.includes('restaurant')) {
      return 'seller';
    }
    if (msg.includes('catégorie') || msg.includes('categorie') || msg.includes('rayon')) {
      return 'category';
    }
    return 'product';
  };

  const tryProductSearch = async (message) => {
    const cleanedMessage = message
      .replace(/\?|!|,|\.|vous|je|j'ai|des|du|de la|de|un|une|le|la|les|est-ce que|avez|vendez|proposez|cherche|veux|voudrais|besoin|acheter|livreur|transporteur|vendeur|producteur|catégorie|categorie/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    if (cleanedMessage.length < 2) {
      addBotMessage(faqData.defaultMessages.notUnderstood);
      setShowCategories(true);
      return;
    }

    setIsTyping(true);
    const searchType = detectSearchType(message);
    const searchTerms = getSearchVariants(cleanedMessage);
    
    try {
      // Recherche de transporteurs
      if (searchType === 'transporter') {
        for (const term of searchTerms) {
          const transporters = await chatService.searchTransporters(term);
          if (transporters && transporters.length > 0) {
            addBotMessage(`🚚 Voici les livreurs trouvés :`);
            setFoundTransporters(transporters.slice(0, 3));
            return;
          }
        }
        addBotMessage(`Aucun livreur trouvé pour "${cleanedMessage}". Essayez avec une autre zone.`);
        setQuickLinks([{ to: '/register', label: 'Devenir livreur' }]);
        return;
      }
      
      // Recherche de vendeurs
      if (searchType === 'seller') {
        for (const term of searchTerms) {
          const sellers = await chatService.searchSellers(term);
          if (sellers && sellers.length > 0) {
            addBotMessage(`👨‍🌾 Voici les vendeurs trouvés :`);
            setFoundSellers(sellers.slice(0, 3));
            return;
          }
        }
        addBotMessage(`Aucun vendeur trouvé pour "${cleanedMessage}".`);
        setQuickLinks([{ to: '/products', label: 'Voir tous les produits' }]);
        return;
      }

      // Recherche de produits (par défaut)
      for (const term of searchTerms) {
        const products = await chatService.searchProducts(term);
        if (products && products.length > 0) {
          addBotMessage(`🔍 Voici ce que j'ai trouvé :`);
          setFoundProducts(products.slice(0, 3));
          return;
        }
      }
    } catch (error) {
      console.error('Erreur recherche:', error);
    }
    
    addBotMessage(faqData.defaultMessages.notUnderstood);
    setShowCategories(true);
  };

  const getProductImage = (product) => {
    if (product.images && product.images.length > 0) {
      const img = product.images[0];
      if (typeof img === 'string') return img;
      if (img.url) return img.url;
      if (img.public_id) return `https://res.cloudinary.com/harvests/image/upload/w_100,h_100,c_fill/${img.public_id}`;
    }
    return null;
  };

  const getUserImage = (user) => {
    if (user.profileImage) {
      if (typeof user.profileImage === 'string') return user.profileImage;
      if (user.profileImage.url) return user.profileImage.url;
    }
    return null;
  };

  const getSellerName = (seller) => {
    return seller.farmName || seller.companyName || seller.restaurantName || 
      `${seller.firstName || ''} ${seller.lastName || ''}`.trim() || 'Vendeur';
  };

  const getSellerType = (userType) => {
    const types = {
      producer: 'Producteur',
      transformer: 'Transformateur',
      restaurateur: 'Restaurateur'
    };
    return types[userType] || 'Vendeur';
  };

  const getTransporterName = (transporter) => {
    return transporter.companyName || 
      `${transporter.firstName || ''} ${transporter.lastName || ''}`.trim() || 'Transporteur';
  };

  const getProductName = (product) => {
    if (typeof product.name === 'object') {
      return product.name.fr || product.name.en || 'Produit';
    }
    return product.name || 'Produit';
  };

  const handleIntent = async (intent, message) => {
    switch (intent) {
      case 'GREETING':
        if (isAuthenticated) {
          addBotMessage(`Bonjour ! 👋 Comment puis-je vous aider aujourd'hui ?\n\nVous pouvez me poser des questions sur vos commandes, les produits, la livraison, etc.`);
        } else {
          addBotMessage(`Bonjour ! 👋 Bienvenue sur Harvests.\n\nJe peux vous aider à :\n• Trouver des produits\n• Répondre à vos questions\n• Vous guider sur le site\n\nQue puis-je faire pour vous ?`);
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
            if (orders && orders.length > 0) {
              const order = orders[0];
              const statusLabels = {
                'pending': 'En attente de confirmation',
                'confirmed': 'Confirmée',
                'preparing': 'En préparation',
                'ready-for-pickup': 'Prête pour collecte',
                'in-transit': 'En cours de livraison',
                'delivered': 'Livrée',
                'completed': 'Terminée',
                'cancelled': 'Annulée'
              };
              addBotMessage(
                `📦 Votre dernière commande #${order.orderNumber}\n\n` +
                `Statut : ${statusLabels[order.status] || order.status}\n` +
                `Total : ${order.total?.toLocaleString('fr-FR')} FCFA\n\n` +
                `Pour plus de détails, consultez vos commandes.`
              );
            } else {
              addBotMessage(faqData.defaultMessages.orderNotFound);
            }
          } catch (error) {
            addBotMessage('Une erreur est survenue. Veuillez réessayer ou consulter directement vos commandes.');
          }
        }
        break;

      case 'SEARCH_PRODUCT':
        // Extraire les mots-clés de recherche - garder le message original si pas de mots-clés reconnus
        let searchTerms = message
          .replace(/cherche|recherche|trouver|acheter|je veux|avez-vous|avez vous|y a-t-il|existe|des|du|de la|un|une|le|la|les/gi, '')
          .trim();
        
        // Si le terme de recherche est vide après nettoyage, utiliser le message original
        if (searchTerms.length < 2) {
          searchTerms = message.trim();
        }
        
        setIsTyping(true);
        try {
          const products = await chatService.searchProducts(searchTerms);
          if (products && products.length > 0) {
            const productList = products.slice(0, 3).map(p => 
              `• ${typeof p.name === 'object' ? p.name.fr || p.name.en : p.name} - ${p.price?.toLocaleString('fr-FR')} FCFA`
            ).join('\n');
            addBotMessage(
              `🔍 Voici ce que j'ai trouvé pour "${searchTerms}" :\n\n${productList}\n\n` +
              `Consultez tous les résultats sur la page produits.`
            );
          } else {
            addBotMessage(`Aucun produit trouvé pour "${searchTerms}".`);
          setFoundProducts([{ _id: 'all', name: 'Voir notre catalogue', isLink: true }]);
          }
        } catch (error) {
          console.error('Erreur recherche produit:', error);
          addBotMessage('Une erreur est survenue lors de la recherche. Veuillez réessayer.');
        }
        break;

      case 'MY_ORDERS':
        if (!isAuthenticated) {
          addBotMessage("Connectez-vous pour voir vos commandes.");
          setQuickLinks([{ to: '/login', label: 'Se connecter' }]);
        } else {
          setIsTyping(true);
          try {
            const orders = await chatService.getRecentOrders();
            if (orders && orders.length > 0) {
              const orderList = orders.slice(0, 3).map(o => 
                `• #${o.orderNumber} - ${o.status} - ${o.total?.toLocaleString('fr-FR')} FCFA`
              ).join('\n');
              addBotMessage(`📋 Vos dernières commandes :\n\n${orderList}`);
              setQuickLinks([{ to: '/dashboard/orders', label: 'Voir toutes mes commandes' }]);
            } else {
              addBotMessage("Vous n'avez pas encore de commandes.");
              setQuickLinks([{ to: '/products', label: 'Découvrir nos produits' }]);
            }
          } catch {
            addBotMessage("Erreur lors de la récupération des commandes.");
          }
        }
        break;

      case 'MY_CART':
        if (cart && cart.items && cart.items.length > 0) {
          const total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
          const itemList = cart.items.slice(0, 3).map(i => 
            `• ${i.name || 'Produit'} x${i.quantity}`
          ).join('\n');
          addBotMessage(`🛒 Votre panier (${cart.items.length} articles) :\n\n${itemList}${cart.items.length > 3 ? '\n...' : ''}\n\nTotal : ${total.toLocaleString('fr-FR')} FCFA`);
          setQuickLinks([{ to: '/cart', label: 'Voir mon panier' }]);
        } else {
          addBotMessage("🛒 Votre panier est vide.");
          setQuickLinks([{ to: '/products', label: 'Découvrir nos produits' }]);
        }
        break;

      case 'CLEAR_CART':
        if (cart && cart.items && cart.items.length > 0) {
          addBotMessage("Voulez-vous vraiment vider votre panier ?");
          setQuickLinks([
            { action: 'confirmClearCart', label: '✓ Oui, vider' },
            { action: 'cancel', label: '✗ Non, annuler' }
          ]);
        } else {
          addBotMessage("Votre panier est déjà vide.");
        }
        break;

      case 'MY_FAVORITES':
        if (!isAuthenticated) {
          addBotMessage("Connectez-vous pour voir vos favoris.");
          setQuickLinks([{ to: '/login', label: 'Se connecter' }]);
        } else {
          setIsTyping(true);
          try {
            const favorites = await chatService.getFavorites();
            if (favorites && favorites.length > 0) {
              addBotMessage(`❤️ Vous avez ${favorites.length} produit(s) en favoris.`);
              setFoundProducts(favorites.slice(0, 3));
            } else {
              addBotMessage("❤️ Vous n'avez pas encore de favoris.");
              setQuickLinks([{ to: '/products', label: 'Découvrir nos produits' }]);
            }
          } catch {
            addBotMessage("Erreur lors de la récupération des favoris.");
          }
        }
        break;

      case 'NOTIFICATIONS':
        if (!isAuthenticated) {
          addBotMessage("Connectez-vous pour voir vos notifications.");
          setQuickLinks([{ to: '/login', label: 'Se connecter' }]);
        } else {
          setIsTyping(true);
          try {
            const notifications = await chatService.getNotifications();
            if (notifications && notifications.length > 0) {
              addBotMessage(`🔔 Vous avez ${notifications.length} notification(s) non lue(s).`);
              setQuickLinks([{ to: '/dashboard/notifications', label: 'Voir mes notifications' }]);
            } else {
              addBotMessage("🔔 Aucune nouvelle notification.");
            }
          } catch {
            addBotMessage("Erreur lors de la récupération des notifications.");
          }
        }
        break;

      case 'PROMOTIONS':
        setIsTyping(true);
        try {
          const promos = await chatService.getPromotions();
          if (promos && promos.length > 0) {
            addBotMessage(`🏷️ Voici les produits en promotion :`);
            setFoundProducts(promos.slice(0, 3));
          } else {
            addBotMessage("Aucune promotion en cours actuellement.");
            setQuickLinks([{ to: '/products', label: 'Voir tous les produits' }]);
          }
        } catch {
          addBotMessage("Erreur lors de la récupération des promotions.");
        }
        break;

      case 'NEW_PRODUCTS':
        setIsTyping(true);
        try {
          const newProducts = await chatService.getNewProducts();
          if (newProducts && newProducts.length > 0) {
            addBotMessage(`✨ Les dernières nouveautés :`);
            setFoundProducts(newProducts.slice(0, 3));
          } else {
            addBotMessage("Pas de nouveaux produits récemment.");
          }
        } catch {
          addBotMessage("Erreur lors de la récupération des nouveautés.");
        }
        break;

      case 'SUGGESTIONS':
        if (!isAuthenticated) {
          addBotMessage("Connectez-vous pour des suggestions personnalisées !");
          setQuickLinks([{ to: '/login', label: 'Se connecter' }]);
        } else {
          setIsTyping(true);
          try {
            const suggestions = await chatService.getSuggestions();
            if (suggestions && suggestions.length > 0) {
              addBotMessage(`⭐ Suggestions pour vous :`);
              setFoundProducts(suggestions.slice(0, 3));
            } else {
              addBotMessage("Je n'ai pas encore assez d'informations pour vous faire des suggestions personnalisées.");
              setQuickLinks([{ to: '/products', label: 'Découvrir nos produits' }]);
            }
          } catch {
            addBotMessage("Erreur lors de la récupération des suggestions.");
          }
        }
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

  // Gestion des actions rapides (liens avec action)
  const handleQuickAction = async (action) => {
    if (action === 'confirmClearCart') {
      try {
        await clearCartAction();
        addBotMessage("✓ Votre panier a été vidé.");
        setQuickLinks([]);
      } catch {
        addBotMessage("Erreur lors du vidage du panier.");
      }
    } else if (action === 'cancel') {
      addBotMessage("Action annulée.");
      setQuickLinks([]);
    }
  };

  // Feedback sur les réponses
  const handleFeedback = async (messageId, isPositive) => {
    setFeedbackGiven(prev => ({ ...prev, [messageId]: isPositive }));
    try {
      await chatService.sendFeedback(messageId, isPositive);
    } catch (e) {
      console.error('Erreur feedback:', e);
    }
  };

  const handleCategoryClick = (categoryId) => {
    const categoryFaqs = faqData.faqs.filter(f => f.category === categoryId);
    if (categoryFaqs.length > 0) {
      addBotMessage('Voici les questions fréquentes sur ce sujet :');
      setQuickQuestions(categoryFaqs);
    }
    setShowCategories(false);
  };

  const handleQuickQuestion = (faq) => {
    addUserMessage(faq.question);
    setQuickQuestions([]);
    addBotMessage(faq.answer);
  };

  const clearConversation = useCallback(() => {
    setMessages([]);
    setShowCategories(true);
    setQuickQuestions([]);
    sessionStorage.removeItem(STORAGE_KEY);
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
    }
  }, []);

  const categoryIcons = {
    livraison: Truck,
    paiement: CreditCard,
    commande: Package,
    compte: User,
    produits: ShoppingBag
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 w-14 h-14 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 hover:scale-110 transition-all duration-300 flex items-center justify-center z-40"
        aria-label="Ouvrir le chat"
      >
        <MessageCircle className="w-7 h-7" />
      </button>
    );
  }

  return (
    <div className={`fixed bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-2xl z-40 flex flex-col overflow-hidden transition-all duration-300 ${
      isMinimized ? 'h-14' : 'h-[500px] max-h-[70vh]'
    }`}>
      {/* Header */}
      <div className="bg-green-600 text-white px-4 py-3 flex items-center justify-between cursor-pointer" onClick={() => isMinimized && setIsMinimized(false)}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <MessageCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold">Assistant Harvests</h3>
            <p className="text-xs text-green-100">En ligne • Réponse instantanée</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {messages.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); clearConversation(); }}
              className="p-1 hover:bg-white/20 rounded"
              title="Effacer la conversation"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
            className="p-1 hover:bg-white/20 rounded"
            title="Réduire"
          >
            <Minimize2 className="w-5 h-5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
            className="p-1 hover:bg-white/20 rounded"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                message={msg.text}
                isBot={msg.isBot}
                timestamp={msg.timestamp}
                messageId={msg.id}
                onFeedback={handleFeedback}
                feedbackGiven={feedbackGiven[msg.id]}
              />
            ))}
            
            {isTyping && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div className="bg-gray-100 px-4 py-2 rounded-2xl rounded-tl-none">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            )}

            {/* Produits trouvés */}
            {foundProducts.length > 0 && (
              <div className="mt-2 space-y-2">
                {foundProducts.filter(p => !p.isLink).map((product) => (
                  <Link
                    key={product._id}
                    to={`/products/${product._id}`}
                    className="flex items-center gap-3 p-2 bg-white border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-400 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      {getProductImage(product) ? (
                        <img 
                          src={getProductImage(product)} 
                          alt={getProductName(product)}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Package className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {getProductName(product)}
                      </p>
                      <p className="text-sm text-green-600 font-semibold">
                        {product.price?.toLocaleString('fr-FR')} FCFA
                      </p>
                    </div>
                  </Link>
                ))}
                <Link
                  to="/products"
                  className="block text-center text-sm text-green-600 hover:text-green-700 py-2 bg-green-50 rounded-lg"
                  onClick={() => setIsOpen(false)}
                >
                  Voir notre catalogue →
                </Link>
              </div>
            )}

            {/* Vendeurs trouvés */}
            {foundSellers.length > 0 && (
              <div className="mt-2 space-y-2">
                {foundSellers.map((seller) => (
                  <Link
                    key={seller._id}
                    to={`/producers/${seller._id}`}
                    className="flex items-center gap-3 p-2 bg-white border border-gray-200 rounded-lg hover:bg-orange-50 hover:border-orange-400 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                      {getUserImage(seller) ? (
                        <img 
                          src={getUserImage(seller)} 
                          alt={getSellerName(seller)}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <User className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {getSellerName(seller)}
                      </p>
                      <p className="text-xs text-orange-600">
                        {getSellerType(seller.userType)}
                      </p>
                      {seller.address?.city && (
                        <p className="text-xs text-gray-500">{seller.address.city}</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Transporteurs trouvés */}
            {foundTransporters.length > 0 && (
              <div className="mt-2 space-y-2">
                {foundTransporters.map((transporter) => (
                  <div
                    key={transporter._id}
                    className="flex items-center gap-3 p-2 bg-white border border-gray-200 rounded-lg"
                  >
                    <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                      {getUserImage(transporter) ? (
                        <img 
                          src={getUserImage(transporter)} 
                          alt={getTransporterName(transporter)}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-blue-400">
                          <Truck className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {getTransporterName(transporter)}
                      </p>
                      <p className="text-xs text-blue-600">
                        {transporter.userType === 'exporter' ? 'Exportateur' : 'Transporteur'}
                      </p>
                      {transporter.serviceAreas?.length > 0 && (
                        <p className="text-xs text-gray-500">
                          {transporter.serviceAreas.slice(0, 2).map(a => a.region || a.city).join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Liens rapides cliquables */}
            {quickLinks.length > 0 && (
              <div className="mt-2 space-y-2">
                {quickLinks.map((link, idx) => (
                  link.action ? (
                    <button
                      key={idx}
                      onClick={() => handleQuickAction(link.action)}
                      className="w-full text-center px-4 py-2 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 hover:bg-green-100 hover:border-green-400 transition-colors"
                    >
                      {link.label}
                    </button>
                  ) : (
                    <Link
                      key={idx}
                      to={link.to}
                      className="block text-center px-4 py-2 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 hover:bg-green-100 hover:border-green-400 transition-colors"
                      onClick={() => { setQuickLinks([]); setIsOpen(false); }}
                    >
                      {link.label} →
                    </Link>
                  )
                ))}
              </div>
            )}

            {/* Raccourcis rapides pour utilisateurs connectés */}
            {showQuickActions && isAuthenticated && messages.length <= 1 && (
              <div className="mt-3">
                <p className="text-xs text-gray-500 mb-2">Accès rapide :</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => { handleIntent('MY_CART'); setShowQuickActions(false); }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs text-gray-700 hover:bg-green-50 hover:border-green-300"
                  >
                    <ShoppingCart className="w-3 h-3" /> Panier
                  </button>
                  <button
                    onClick={() => { handleIntent('MY_ORDERS'); setShowQuickActions(false); }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs text-gray-700 hover:bg-green-50 hover:border-green-300"
                  >
                    <Package className="w-3 h-3" /> Commandes
                  </button>
                  <button
                    onClick={() => { handleIntent('MY_FAVORITES'); setShowQuickActions(false); }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs text-gray-700 hover:bg-green-50 hover:border-green-300"
                  >
                    <Heart className="w-3 h-3" /> Favoris
                  </button>
                  <button
                    onClick={() => { handleIntent('NEW_PRODUCTS'); setShowQuickActions(false); }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs text-gray-700 hover:bg-green-50 hover:border-green-300"
                  >
                    <Sparkles className="w-3 h-3" /> Nouveautés
                  </button>
                </div>
              </div>
            )}

            {/* Questions rapides cliquables */}
            {quickQuestions.length > 0 && (
              <div className="mt-2 space-y-2">
                {quickQuestions.map((faq) => (
                  <button
                    key={faq.id}
                    onClick={() => handleQuickQuestion(faq)}
                    className="w-full text-left px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-green-50 hover:border-green-400 transition-colors"
                  >
                    {faq.question}
                  </button>
                ))}
              </div>
            )}

            {/* Catégories rapides */}
            {showCategories && messages.length > 0 && quickQuestions.length === 0 && (
              <div className="mt-4">
                <p className="text-xs text-gray-500 mb-2">Sujets populaires :</p>
                <div className="flex flex-wrap gap-2">
                  {faqData.categories.map((cat) => {
                    const Icon = categoryIcons[cat.id] || Package;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => handleCategoryClick(cat.id)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:bg-green-50 hover:border-green-300 transition-colors"
                      >
                        <Icon className="w-4 h-4" />
                        <span>{cat.label.replace(/[^\w\s]/gi, '').trim()}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <ChatInput onSend={handleSendMessage} disabled={isTyping} />
        </>
      )}
    </div>
  );
};

export default ChatBot;

