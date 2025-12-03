import React from 'react';
import { MessageCircle, X, Minimize2, Package, Truck, CreditCard, User, ShoppingBag, Trash2, Heart, Sparkles, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { faqData } from '../../data/faqData';

const categoryIcons = { livraison: Truck, paiement: CreditCard, commande: Package, compte: User, produits: ShoppingBag };

export const ChatBotButton = ({ onClick, backToTopVisible }) => (
  <button
    onClick={onClick}
    className={`fixed right-6 w-12 h-12 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 hover:scale-110 transition-all duration-300 flex items-center justify-center z-40 ${
      backToTopVisible ? 'bottom-[80px]' : 'bottom-6'
    }`}
    aria-label="Ouvrir le chat"
  >
    <span className="text-2xl">🤖</span>
  </button>
);

export const ChatBotHeader = ({ isMinimized, setIsMinimized, setIsOpen, clearConversation, messagesCount }) => (
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
      {messagesCount > 1 && (
        <button onClick={(e) => { e.stopPropagation(); clearConversation(); }} className="p-1 hover:bg-white/20 rounded" title="Effacer">
          <Trash2 className="w-4 h-4" />
        </button>
      )}
      <button onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }} className="p-1 hover:bg-white/20 rounded" title="Réduire">
        <Minimize2 className="w-5 h-5" />
      </button>
      <button onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} className="p-1 hover:bg-white/20 rounded" title="Fermer">
        <X className="w-5 h-5" />
      </button>
    </div>
  </div>
);

export const TypingIndicator = () => (
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
);

export const ProductResults = ({ products, getProductImage, getProductName, onClose }) => (
  <div className="mt-2 space-y-2">
    {products.filter(p => !p.isLink).map((product) => (
      <Link
        key={product._id}
        to={`/products/${product._id}`}
        className="flex items-center gap-3 p-2 bg-white border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-400 transition-colors"
        onClick={onClose}
      >
        <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
          {getProductImage(product) ? (
            <img src={getProductImage(product)} alt={getProductName(product)} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400"><Package className="w-6 h-6" /></div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{getProductName(product)}</p>
          <p className="text-sm text-green-600 font-semibold">{product.price?.toLocaleString('fr-FR')} FCFA</p>
        </div>
      </Link>
    ))}
    <Link to="/products" className="block text-center text-sm text-green-600 hover:text-green-700 py-2 bg-green-50 rounded-lg" onClick={onClose}>
      Voir notre catalogue →
    </Link>
  </div>
);

export const SellerResults = ({ sellers, getUserImage, getSellerName, getSellerType, onClose }) => (
  <div className="mt-2 space-y-2">
    {sellers.map((seller) => (
      <Link
        key={seller._id}
        to={`/producers/${seller._id}`}
        className="flex items-center gap-3 p-2 bg-white border border-gray-200 rounded-lg hover:bg-orange-50 hover:border-orange-400 transition-colors"
        onClick={onClose}
      >
        <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
          {getUserImage(seller) ? (
            <img src={getUserImage(seller)} alt={getSellerName(seller)} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400"><User className="w-6 h-6" /></div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{getSellerName(seller)}</p>
          <p className="text-xs text-orange-600">{getSellerType(seller.userType)}</p>
          {seller.address?.city && <p className="text-xs text-gray-500">{seller.address.city}</p>}
        </div>
      </Link>
    ))}
  </div>
);

export const TransporterResults = ({ transporters, getUserImage, getTransporterName }) => (
  <div className="mt-2 space-y-2">
    {transporters.map((t) => (
      <div key={t._id} className="flex items-center gap-3 p-2 bg-white border border-gray-200 rounded-lg">
        <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
          {getUserImage(t) ? (
            <img src={getUserImage(t)} alt={getTransporterName(t)} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-blue-400"><Truck className="w-6 h-6" /></div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{getTransporterName(t)}</p>
          <p className="text-xs text-blue-600">{t.userType === 'exporter' ? 'Exportateur' : 'Transporteur'}</p>
          {t.serviceAreas?.length > 0 && <p className="text-xs text-gray-500">{t.serviceAreas.slice(0, 2).map(a => a.region || a.city).join(', ')}</p>}
        </div>
      </div>
    ))}
  </div>
);

export const QuickLinks = ({ links, onAction, onClose }) => (
  <div className="mt-2 space-y-2">
    {links.map((link, idx) => (
      link.action ? (
        <button key={idx} onClick={() => onAction(link.action)} className="w-full text-center px-4 py-2 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 hover:bg-green-100">
          {link.label}
        </button>
      ) : (
        <Link key={idx} to={link.to} className="block text-center px-4 py-2 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 hover:bg-green-100" onClick={onClose}>
          {link.label} →
        </Link>
      )
    ))}
  </div>
);

export const QuickActions = ({ onIntent }) => (
  <div className="mt-3">
    <p className="text-xs text-gray-500 mb-2">Accès rapide :</p>
    <div className="flex flex-wrap gap-2">
      {[
        { intent: 'MY_CART', icon: ShoppingCart, label: 'Panier' },
        { intent: 'MY_ORDERS', icon: Package, label: 'Commandes' },
        { intent: 'MY_FAVORITES', icon: Heart, label: 'Favoris' },
        { intent: 'NEW_PRODUCTS', icon: Sparkles, label: 'Nouveautés' }
      ].map(({ intent, icon: Icon, label }) => (
        <button key={intent} onClick={() => onIntent(intent)} className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs text-gray-700 hover:bg-green-50 hover:border-green-300">
          <Icon className="w-3 h-3" /> {label}
        </button>
      ))}
    </div>
  </div>
);

export const QuickQuestions = ({ questions, onClick }) => (
  <div className="mt-2 space-y-2">
    {questions.map((faq) => (
      <button key={faq.id} onClick={() => onClick(faq)} className="w-full text-left px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-green-50 hover:border-green-400">
        {faq.question}
      </button>
    ))}
  </div>
);

export const Categories = ({ onCategoryClick }) => (
  <div className="mt-4">
    <p className="text-xs text-gray-500 mb-2">Sujets populaires :</p>
    <div className="flex flex-wrap gap-2">
      {faqData.categories.map((cat) => {
        const Icon = categoryIcons[cat.id] || Package;
        return (
          <button key={cat.id} onClick={() => onCategoryClick(cat.id)} className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:bg-green-50 hover:border-green-300">
            <Icon className="w-4 h-4" />
            <span>{cat.label.replace(/[^\w\s]/gi, '').trim()}</span>
          </button>
        );
      })}
    </div>
  </div>
);

export const ChatMessages = ({ messages, isTyping, feedbackGiven, onFeedback, getUserAvatar, getUserFirstName, guestInfo }) => (
  <>
    {messages.map((msg) => (
      <ChatMessage
        key={msg.id}
        message={msg.text}
        isBot={msg.isBot}
        timestamp={msg.timestamp}
        messageId={msg.id}
        onFeedback={onFeedback}
        feedbackGiven={feedbackGiven[msg.id]}
        userAvatar={!msg.isBot ? getUserAvatar() : null}
        userName={!msg.isBot ? getUserFirstName() || guestInfo?.name : null}
      />
    ))}
    {isTyping && <TypingIndicator />}
  </>
);

