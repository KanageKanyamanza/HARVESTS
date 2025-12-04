import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../contexts/CartContext';
import useBackToTopVisible from '../../hooks/useBackToTopVisible';
import { useChatBot } from '../../hooks/useChatBot';
import { faqData, findBestAnswer } from '../../data/faqData';
import { chatService } from '../../services/chatService';
import ChatInput from './ChatInput';
import {
  ChatBotButton, ChatBotHeader, ChatMessages,
  ProductResults, SellerResults, TransporterResults,
  QuickLinks, QuickActions, QuickQuestions, Categories
} from './ChatBotUI';
import {
  getProductImage, getUserImage, getSellerName, getSellerType,
  getTransporterName, getProductName, findCustomAnswer, tryProductSearch, handleIntent
} from './chatHelpers';

const ChatBot = () => {
  const { isAuthenticated, user } = useAuth();
  const { cart, clearCart: clearCartAction } = useCart();
  const backToTopVisible = useBackToTopVisible();
  
  const state = useChatBot(isAuthenticated, user, cart, clearCartAction);
  const {
    isOpen, setIsOpen, isMinimized, setIsMinimized,
    messages, isTyping, setIsTyping,
    showCategories, setShowCategories, quickQuestions, setQuickQuestions,
    quickLinks, setQuickLinks, showQuickActions, setShowQuickActions,
    feedbackGiven, setFeedbackGiven, customAnswers,
    guestInfo, setGuestInfo, askingForInfo, setAskingForInfo,
    infoStep, setInfoStep, foundProducts, setFoundProducts,
    foundSellers, setFoundSellers, foundTransporters, setFoundTransporters,
    messagesEndRef, getUserFirstName, getUserAvatar,
    addBotMessage, addUserMessage, logInteraction, clearConversation
  } = state;

  const handleGuestInfoCollection = (message) => {
    if (infoStep === 'name') {
      setGuestInfo(prev => ({ ...prev, name: message }));
      setInfoStep('email');
      addBotMessage(`Enchanté ${message.split(' ')[0]} ! 😊\n\nPour mieux vous aider, votre email ? (tapez "passer" pour ignorer)`);
      return true;
    }
    if (infoStep === 'email') {
      if (message.toLowerCase() !== 'passer') setGuestInfo(prev => ({ ...prev, email: message }));
      setInfoStep(null);
      setAskingForInfo(false);
      
      // Récupérer la question en attente et y répondre directement
      const pendingMessage = sessionStorage.getItem('pending_chat_message');
      if (pendingMessage) {
        sessionStorage.removeItem('pending_chat_message');
        // Traiter directement la question en attente sans message intermédiaire
        setTimeout(() => {
          handleSendMessage(pendingMessage);
        }, 300);
      } else {
        addBotMessage(`Parfait ! Je suis prêt à vous aider. Que puis-je faire pour vous ?`);
        setShowCategories(true);
      }
      return true;
    }
    return false;
  };

  const askForGuestInfo = () => {
    if (!isAuthenticated && !guestInfo?.name && !askingForInfo) {
      setAskingForInfo(true);
      setInfoStep('name');
      addBotMessage(`Avant de commencer, puis-je connaître votre prénom ? 😊`);
      return true;
    }
    return false;
  };

  const handleSendMessage = async (message) => {
    addUserMessage(message);
    
    if (askingForInfo && infoStep) { handleGuestInfoCollection(message); return; }
    if (!isAuthenticated && !guestInfo?.name && messages.length <= 1) {
      askForGuestInfo();
      sessionStorage.setItem('pending_chat_message', message);
      return;
    }
    
    setShowCategories(false);
    setQuickLinks([]);
    setFoundProducts([]);
    setFoundSellers([]);
    setFoundTransporters([]);
    
    const customAnswer = findCustomAnswer(message, customAnswers);
    if (customAnswer) {
      addBotMessage(customAnswer.answer);
      logInteraction(message, customAnswer.answer, 'faq', customAnswer._id);
      return;
    }
    
    const result = findBestAnswer(message);
    
    if (result.type === 'faq') {
      addBotMessage(result.faq.answer);
      logInteraction(message, result.faq.answer, 'faq', result.faq.id);
    } else if (result.type === 'intent') {
      await handleIntent(result.intent, message, {
        isAuthenticated, getUserFirstName, addBotMessage, setIsTyping,
        setQuickLinks, setFoundProducts, setShowCategories, logInteraction,
        cart, clearCartAction
      });
      logInteraction(message, '', 'intent', null, result.intent);
    } else {
      const found = await tryProductSearch(message, {
        addBotMessage, setIsTyping, setFoundProducts, setFoundSellers,
        setFoundTransporters, setQuickLinks, setShowCategories, logInteraction
      });
      if (!found) logInteraction(message, faqData.defaultMessages.notUnderstood, 'no_answer');
    }
  };

  const handleQuickAction = async (action) => {
    if (action === 'confirmClearCart') {
      try { await clearCartAction(); addBotMessage('✓ Votre panier a été vidé.'); setQuickLinks([]); }
      catch { addBotMessage('Erreur lors du vidage.'); }
    } else if (action === 'cancel') {
      addBotMessage('Action annulée.');
      setQuickLinks([]);
    }
  };

  const handleFeedback = async (messageId, isPositive) => {
    setFeedbackGiven(prev => ({ ...prev, [messageId]: isPositive }));
    try { await chatService.sendFeedback(messageId, isPositive); } catch { /* ignore */ }
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

  const onIntentClick = (intent) => {
    handleIntent(intent, '', {
      isAuthenticated, getUserFirstName, addBotMessage, setIsTyping,
      setQuickLinks, setFoundProducts, setShowCategories, logInteraction,
      cart, clearCartAction
    });
    setShowQuickActions(false);
  };

  const [showTooltip, setShowTooltip] = React.useState(true);

  // Masquer la bulle après 7 secondes
  React.useEffect(() => {
    if (showTooltip && !isOpen) {
      const timer = setTimeout(() => {
        setShowTooltip(false);
      }, 7000); // 7 secondes

      return () => clearTimeout(timer);
    }
  }, [showTooltip, isOpen]);

  // Masquer la bulle si le chat est ouvert
  React.useEffect(() => {
    if (isOpen && showTooltip) {
      setShowTooltip(false);
    }
  }, [isOpen, showTooltip]);

  const handleCloseTooltip = () => {
    setShowTooltip(false);
  };

  if (!isOpen) {
    return (
      <>
        <div 
          className={`fixed right-6 z-50 ${backToTopVisible ? 'bottom-[80px]' : 'bottom-6'}`}
        >
          <ChatBotButton onClick={() => setIsOpen(true)} backToTopVisible={backToTopVisible} />
        </div>
        
        {/* Bulle d'information à côté du bouton */}
        {showTooltip && !isOpen && (
          <div 
            className="fixed right-24 z-[60] bg-white rounded-lg shadow-2xl p-4 border-2 border-green-200"
            style={{ 
              bottom: backToTopVisible ? '80px' : '24px',
              width: '320px',
              maxWidth: 'calc(100vw - 200px)'
            }}
          >
            <button
              onClick={handleCloseTooltip}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors z-10"
              aria-label="Fermer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="flex items-start gap-3 pr-6">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 text-sm mb-1">Salut ! 👋</h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Je suis l'assistant <span className="font-semibold text-green-600">Harvests</span> ! 
                  Posez-moi vos questions, je suis là pour vous aider ! 😊
                </p>
              </div>
            </div>
            {/* Flèche pointant vers le bouton (en bas) */}
            <div className="absolute right-0 bottom-0 translate-x-full">
              <div className="w-0 h-0 border-t-8 border-t-transparent border-l-8 border-l-gray-200 border-b-8 border-b-transparent"></div>
              <div className="absolute right-0 bottom-0 translate-x-full -ml-px">
                <div className="w-0 h-0 border-t-8 border-t-transparent border-l-8 border-l-white border-b-8 border-b-transparent"></div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className={`fixed right-6 w-96 max-w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-2xl z-40 flex flex-col overflow-hidden transition-all duration-300 ${
      isMinimized ? 'h-14' : 'h-[700px] max-h-[90vh]'
    } ${backToTopVisible ? 'bottom-[80px]' : 'bottom-6'}`}>
      <ChatBotHeader
        isMinimized={isMinimized}
        setIsMinimized={setIsMinimized}
        setIsOpen={setIsOpen}
        clearConversation={clearConversation}
        messagesCount={messages.length}
      />

      {!isMinimized && (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            <ChatMessages
              messages={messages}
              isTyping={isTyping}
              feedbackGiven={feedbackGiven}
              onFeedback={handleFeedback}
              getUserAvatar={getUserAvatar}
              getUserFirstName={getUserFirstName}
              guestInfo={guestInfo}
            />
            
            {foundProducts.length > 0 && (
              <ProductResults
                products={foundProducts}
                getProductImage={getProductImage}
                getProductName={getProductName}
                onClose={() => setIsOpen(false)}
              />
            )}

            {foundSellers.length > 0 && (
              <SellerResults
                sellers={foundSellers}
                getUserImage={getUserImage}
                getSellerName={getSellerName}
                getSellerType={getSellerType}
                onClose={() => setIsOpen(false)}
              />
            )}

            {foundTransporters.length > 0 && (
              <TransporterResults
                transporters={foundTransporters}
                getUserImage={getUserImage}
                getTransporterName={getTransporterName}
              />
            )}

            {quickLinks.length > 0 && (
              <QuickLinks links={quickLinks} onAction={handleQuickAction} onClose={() => { setQuickLinks([]); setIsOpen(false); }} />
            )}

            {showQuickActions && isAuthenticated && messages.length <= 1 && (
              <QuickActions onIntent={onIntentClick} />
            )}

            {quickQuestions.length > 0 && (
              <QuickQuestions questions={quickQuestions} onClick={handleQuickQuestion} />
            )}

            {showCategories && messages.length > 0 && quickQuestions.length === 0 && (
              <Categories onCategoryClick={handleCategoryClick} />
            )}

            <div ref={messagesEndRef} />
          </div>

          <ChatInput onSend={handleSendMessage} disabled={isTyping} />
        </>
      )}
    </div>
  );
};

export default ChatBot;
