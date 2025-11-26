import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MessageCircle, X, Minimize2, Package, Truck, CreditCard, User, ShoppingBag, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { faqData, findBestAnswer } from '../../data/faqData';
import { useAuth } from '../../hooks/useAuth';
import { chatService } from '../../services/chatService';

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
  const messagesEndRef = useRef(null);
  const inactivityTimer = useRef(null);
  const { isAuthenticated } = useAuth();

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
    }
  }, [isOpen]);

  // Scroll automatique vers le bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

  const tryProductSearch = async (message) => {
    // Nettoyer le message pour extraire les termes de recherche
    const cleanedMessage = message
      .replace(/\?|!|,|\.|vous|je|j'ai|des|du|de la|de|un|une|le|la|les|est-ce que|avez|vendez|proposez|cherche|veux|voudrais|besoin|acheter/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    if (cleanedMessage.length >= 2) {
      setIsTyping(true);
      try {
        const products = await chatService.searchProducts(cleanedMessage);
        if (products && products.length > 0) {
          addBotMessage(`🔍 Voici ce que j'ai trouvé :`);
          setFoundProducts(products.slice(0, 3));
          return;
        }
      } catch (error) {
        console.error('Erreur recherche:', error);
      }
    }
    
    // Aucun produit trouvé, afficher le message par défaut
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

      case 'CONTACT_SUPPORT':
        addBotMessage(faqData.defaultMessages.contactSupport);
        setQuickLinks([{ to: '/contact', label: 'Page Contact' }]);
        break;

      default:
        addBotMessage(faqData.defaultMessages.notUnderstood);
        setShowCategories(true);
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

            {/* Liens rapides cliquables */}
            {quickLinks.length > 0 && (
              <div className="mt-2 space-y-2">
                {quickLinks.map((link, idx) => (
                  <Link
                    key={idx}
                    to={link.to}
                    className="block text-center px-4 py-2 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 hover:bg-green-100 hover:border-green-400 transition-colors"
                    onClick={() => { setQuickLinks([]); setIsOpen(false); }}
                  >
                    {link.label} →
                  </Link>
                ))}
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

