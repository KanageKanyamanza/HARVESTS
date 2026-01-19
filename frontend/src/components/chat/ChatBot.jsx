import React from "react";
import { MessageCircle } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../contexts/CartContext";
import useBackToTopVisible from "../../hooks/useBackToTopVisible";
import { useChatBot } from "../../hooks/useChatBot";
import { chatService } from "../../services/chatService";
import ChatInput from "./ChatInput";
import {
	ChatBotButton,
	ChatBotHeader,
	ChatMessages,
	ProductResults,
	SellerResults,
	TransporterResults,
	QuickLinks,
	QuickActions,
	QuickQuestions,
	Categories,
} from "./ChatBotUI";
import {
	getProductImage,
	getUserImage,
	getSellerName,
	getSellerType,
	getTransporterName,
	getProductName,
} from "./chatHelpers";

const ChatBot = () => {
	const { isAuthenticated, user } = useAuth();
	const { cart, clearCart: clearCartAction } = useCart();
	const backToTopVisible = useBackToTopVisible();
	const location = useLocation();
	const isHomePage = location.pathname === "/";

	const state = useChatBot(isAuthenticated, user, cart, clearCartAction);
	const {
		isOpen,
		setIsOpen,
		isMinimized,
		setIsMinimized,
		messages,
		isTyping,
		setIsTyping,
		showCategories,
		setShowCategories,
		quickQuestions,
		setQuickQuestions,
		quickLinks,
		setQuickLinks,
		showQuickActions,
		setShowQuickActions,
		feedbackGiven,
		setFeedbackGiven,
		guestInfo,
		setGuestInfo,
		askingForInfo,
		setAskingForInfo,
		infoStep,
		setInfoStep,
		foundProducts,
		setFoundProducts,
		foundSellers,
		setFoundSellers,
		foundTransporters,
		setFoundTransporters,
		messagesEndRef,
		getUserFirstName,
		getUserAvatar,
		addBotMessage,
		addUserMessage,
		clearConversation,
	} = state;

	const [isMaximized, setIsMaximized] = React.useState(false);

	const handleGuestInfoCollection = (message) => {
		const isSkip = ["passer", "skip", "non", "ignorer"].includes(
			message.toLowerCase().trim(),
		);

		if (infoStep === "name") {
			if (!isSkip) {
				setGuestInfo((prev) => ({ ...prev, name: message }));
				addBotMessage(
					`Enchanté ${
						message.split(" ")[0]
					} ! 😊\n\nPour mieux vous aider, pourriez-vous me donner votre adresse email ? (Tapez "passer" si vous préférez ne pas le partager)`,
				);
			} else {
				addBotMessage(
					`Pas de souci ! 😊 Pouvez-vous me donner votre adresse email pour le suivi ? (Ou tapez "passer")`,
				);
			}
			setInfoStep("email");
			return true;
		}
		if (infoStep === "email") {
			if (!isSkip) setGuestInfo((prev) => ({ ...prev, email: message }));
			setInfoStep(null);
			setAskingForInfo(false);

			const pendingMessage = sessionStorage.getItem("pending_chat_message");
			if (pendingMessage) {
				sessionStorage.removeItem("pending_chat_message");
				setTimeout(() => {
					processResponse(pendingMessage);
				}, 300);
			} else {
				addBotMessage(
					`Parfait ! Je suis prêt à vous aider. Que puis-je faire pour vous ?`,
				);
				setShowCategories(true);
			}
			return true;
		}
		return false;
	};

	const askForGuestInfo = () => {
		if (!isAuthenticated && !guestInfo?.name && !askingForInfo) {
			setAskingForInfo(true);
			setInfoStep("name");
			addBotMessage(`Avant de commencer, puis-je connaître votre prénom ? 😊`);
			return true;
		}
		return false;
	};

	const processResponse = async (message) => {
		setShowCategories(false);
		setQuickLinks([]);
		setFoundProducts([]);
		setFoundSellers([]);
		setFoundTransporters([]);
		setIsTyping(true);

		try {
			// Appel au backend NLP
			const context = {
				isAuthenticated,
				userId: user?._id,
				cartItems: cart?.items || [],
				currentPage: location.pathname,
			};

			const response = await chatService.sendMessage(message, context);

			setIsTyping(false);

			if (response) {
				// 1. Afficher le texte de réponse
				if (response.text) {
					addBotMessage(response.text);
				}

				// 2. Gérer les données supplémentaires (produits, etc.)
				if (response.data) {
					// TODO: Adapter selon la structure retournée par le backend
					// Pour l'instant on suppose que le backend renvoie data.products, etc.
					if (response.data.products) setFoundProducts(response.data.products);
					if (response.data.sellers) setFoundSellers(response.data.sellers);
					if (response.data.transporters)
						setFoundTransporters(response.data.transporters);
				}

				// 3. Gérer les actions rapides / liens
				if (response.actions && response.actions.length > 0) {
					setQuickLinks(response.actions);
				}
			} else {
				addBotMessage(
					"Désolé, je rencontre un problème technique. Veuillez réessayer plus tard.",
				);
			}
		} catch (error) {
			setIsTyping(false);
			addBotMessage("Une erreur est survenue. Veuillez réessayer.");
			console.error("Chat processing error:", error);
		}
	};

	const handleSendMessage = async (message) => {
		addUserMessage(message);

		if (askingForInfo && infoStep) {
			handleGuestInfoCollection(message);
			return;
		}
		if (!isAuthenticated && !guestInfo?.name && messages.length <= 1) {
			askForGuestInfo();
			sessionStorage.setItem("pending_chat_message", message);
			return;
		}

		await processResponse(message);
	};

	const handleQuickAction = async (action) => {
		// Gérer les actions locales si nécessaire, sinon envoyer au backend
		if (action === "confirmClearCart") {
			try {
				await clearCartAction();
				addBotMessage("✓ Votre panier a été vidé.");
				setQuickLinks([]);
			} catch {
				addBotMessage("Erreur lors du vidage.");
			}
		} else if (action === "cancel") {
			addBotMessage("Action annulée.");
			setQuickLinks([]);
		} else {
			// Si c'est une action de navigation ou autre, on peut rediriger ou envoyer un message
			// Pour l'instant on rejoue l'action comme un message si ce n'est pas une url
			if (action.startsWith("/")) {
				// Navigation handled by QuickLinks component usually?
				// Actually QuickLinks component handles navigation if 'to' is present.
				// Here we handle 'action' string.
			}
		}
	};

	const handleFeedback = async (messageId, isPositive) => {
		setFeedbackGiven((prev) => ({ ...prev, [messageId]: isPositive }));
		try {
			await chatService.sendFeedback(messageId, isPositive);
		} catch {
			/* ignore */
		}
	};

	const handleCategoryClick = async (categoryId) => {
		// Optionnel: demander au backend les questions pour cette catégorie
		// Pour l'instant on peut envoyer un message "Questions sur [Catégorie]"
		await processResponse(`Questions fréquentes sur ${categoryId}`);
	};

	const handleQuickQuestion = (faq) => {
		addUserMessage(faq.question);
		setQuickQuestions([]);
		// On envoie la question au backend pour avoir la réponse (cohérence)
		processResponse(faq.question);
	};

	const onIntentClick = (intent) => {
		// Mapper les intents rapides vers des messages naturels ou des appels backend
		const intentMessages = {
			TRACK_ORDER: "Où est ma commande ?",
			MY_ORDERS: "Mes commandes",
			CONTACT_SUPPORT: "Contacter le support",
		};
		const msg = intentMessages[intent] || intent;
		handleSendMessage(msg);
		setShowQuickActions(false);
	};

	// ... (Code tooltip existant conservé)
	const [showTooltip, setShowTooltip] = React.useState(false);
	const TOOLTIP_STORAGE_KEY = "chatbot_tooltip_last_shown";
	const TOOLTIP_DISPLAY_DURATION = 10000;
	const TOOLTIP_COOLDOWN = 5 * 60 * 1000;

	React.useEffect(() => {
		if (!isHomePage || isOpen) {
			setShowTooltip(false);
			return;
		}
		try {
			const now = Date.now();
			const lastShownRaw = localStorage.getItem(TOOLTIP_STORAGE_KEY);
			const lastShown = lastShownRaw ? parseInt(lastShownRaw, 10) : 0;
			if (!Number.isNaN(lastShown)) {
				const elapsed = now - lastShown;
				if (elapsed < TOOLTIP_COOLDOWN) return;
			}
			setShowTooltip(true);
			localStorage.setItem(TOOLTIP_STORAGE_KEY, String(now));
		} catch {
			setShowTooltip(true);
		}
	}, [isHomePage, isOpen, location.pathname]);

	React.useEffect(() => {
		if (showTooltip && !isOpen) {
			const timer = setTimeout(() => {
				setShowTooltip(false);
			}, TOOLTIP_DISPLAY_DURATION);
			return () => clearTimeout(timer);
		}
	}, [showTooltip, isOpen]);

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
					className={`fixed right-6 z-50 ${
						backToTopVisible ? "bottom-[80px]" : "bottom-6"
					}`}
				>
					<ChatBotButton
						onClick={() => setIsOpen(true)}
						backToTopVisible={backToTopVisible}
					/>
				</div>

				{showTooltip && !isOpen && (
					<div
						className="fixed right-24 z-[60] bg-white rounded-lg shadow-2xl p-4 border-2 border-green-200"
						style={{
							bottom: backToTopVisible ? "80px" : "24px",
							width: "320px",
							maxWidth: "calc(100vw - 110px)",
						}}
					>
						{/* Tooltip content preserved */}
						<button
							onClick={handleCloseTooltip}
							className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors z-10"
							aria-label="Fermer"
						>
							<svg
								className="w-4 h-4"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						</button>
						<div className="flex items-start gap-3 pr-6">
							<div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
								<MessageCircle className="w-5 h-5 text-green-600" />
							</div>
							<div className="flex-1">
								<h4 className="font-semibold text-gray-900 text-sm mb-1">
									Salut ! 👋
								</h4>
								<p className="text-xs text-gray-600 leading-relaxed">
									Je suis l'assistant{" "}
									<span className="font-semibold text-green-600">Harvests</span>{" "}
									! Posez-moi vos questions, je suis là pour vous aider ! 😊
								</p>
							</div>
						</div>
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
		<div
			className={`fixed z-40 flex flex-col overflow-hidden transition-all duration-500 ease-out border border-white/50 ring-1 ring-black/5 bg-white rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] ${
				isMinimized ? "right-6 w-96 max-w-[calc(100vw-3rem)] h-[4rem]"
				: isMaximized ? "right-[5vw] left-[5vw] w-[90vw] bottom-[5vh] h-[90vh]"
				: "right-6 w-96 max-w-[calc(100vw-3rem)] h-[700px] max-h-[85vh]"
			} ${!isMaximized && (backToTopVisible ? "bottom-[90px]" : "bottom-8")} ${
				isMinimized && (backToTopVisible ? "bottom-[90px]" : "bottom-8")
			}`}
		>
			<ChatBotHeader
				isMinimized={isMinimized}
				setIsMinimized={setIsMinimized}
				isMaximized={isMaximized}
				setIsMaximized={setIsMaximized}
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
							<QuickLinks
								links={quickLinks}
								onAction={handleQuickAction}
								onClose={() => {
									setQuickLinks([]);
									setIsOpen(false);
								}}
							/>
						)}

						{showQuickActions && isAuthenticated && messages.length <= 1 && (
							<QuickActions onIntent={onIntentClick} />
						)}

						{quickQuestions.length > 0 && (
							<QuickQuestions
								questions={quickQuestions}
								onClick={handleQuickQuestion}
							/>
						)}

						{showCategories &&
							messages.length > 0 &&
							quickQuestions.length === 0 && (
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
