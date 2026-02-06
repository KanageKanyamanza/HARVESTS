import { useState, useEffect, useRef, useCallback } from "react";
import { faqData, findBestAnswer } from "../data/faqData";
import { chatService } from "../services/chatService";

const STORAGE_KEY = "harvests_chat";
const INACTIVITY_TIMEOUT = 300000;

export const getSessionId = () => {
	let sessionId = sessionStorage.getItem("chat_session_id");
	if (!sessionId) {
		sessionId =
			"session_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
		sessionStorage.setItem("chat_session_id", sessionId);
	}
	return sessionId;
};

export const useChatBot = (isAuthenticated, user, cart, clearCartAction) => {
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
	const [customAnswers, setCustomAnswers] = useState([]);
	const [guestInfo, setGuestInfo] = useState(() => {
		const saved = sessionStorage.getItem("chat_guest_info");
		return saved ? JSON.parse(saved) : null;
	});
	const [askingForInfo, setAskingForInfo] = useState(false);
	const [infoStep, setInfoStep] = useState(null);
	const [foundProducts, setFoundProducts] = useState([]);
	const [foundSellers, setFoundSellers] = useState([]);
	const [foundTransporters, setFoundTransporters] = useState([]);

	const messagesEndRef = useRef(null);
	const inactivityTimer = useRef(null);
	const sessionId = getSessionId();

	const getUserFirstName = useCallback(() => {
		if (isAuthenticated && user?.firstName) return user.firstName;
		if (guestInfo?.name) return guestInfo.name.split(" ")[0];
		return null;
	}, [isAuthenticated, user, guestInfo]);

	const getUserAvatar = useCallback(() => {
		if (isAuthenticated && user) {
			const avatar = user.avatar || user.profileImage || user.photo;
			if (avatar) {
				if (typeof avatar === "string") return avatar;
				if (avatar.url) return avatar.url;
				if (avatar.secure_url) return avatar.secure_url;
			}
		}
		return null;
	}, [isAuthenticated, user]);

	const addBotMessage = useCallback((text, delay = 0) => {
		const tempId = Date.now() + Math.random();
		if (delay > 0) {
			setIsTyping(true);
			setTimeout(() => {
				setMessages((prev) => [
					...prev,
					{ id: tempId, text, isBot: true, timestamp: new Date() },
				]);
				setIsTyping(false);
			}, delay);
		} else {
			setMessages((prev) => [
				...prev,
				{ id: tempId, text, isBot: true, timestamp: new Date() },
			]);
			setIsTyping(false);
		}
		return tempId;
	}, []);

	const updateMessageInteractionId = useCallback((localId, interactionId) => {
		setMessages((prev) =>
			prev.map((msg) => (msg.id === localId ? { ...msg, interactionId } : msg)),
		);
	}, []);

	const addUserMessage = useCallback((text) => {
		setMessages((prev) => [
			...prev,
			{ id: Date.now(), text, isBot: false, timestamp: new Date() },
		]);
	}, []);

	const logChatBotInteraction = useCallback(
		async (
			question,
			response,
			responseType,
			matchedFaqId = null,
			matchedIntent = null,
			startTime = null,
		) => {
			try {
				const responseTime = startTime ? Date.now() - startTime : null;
				return await chatService.logInteraction({
					question,
					response,
					responseType,
					matchedFaqId,
					matchedIntent,
					sessionId,
					responseTime,
				});
			} catch (error) {
				console.error("Erreur logging interaction:", error);
				return null;
			}
		},
		[sessionId],
	);

	const clearConversation = useCallback(() => {
		setMessages([]);
		setShowCategories(true);
		setQuickQuestions([]);
		setQuickLinks([]);
		setFoundProducts([]);
		setFoundSellers([]);
		setFoundTransporters([]);
		sessionStorage.removeItem(STORAGE_KEY);
		if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
	}, []);

	// Save to sessionStorage
	useEffect(() => {
		sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ isOpen, messages }));
	}, [isOpen, messages]);

	useEffect(() => {
		if (guestInfo)
			sessionStorage.setItem("chat_guest_info", JSON.stringify(guestInfo));
	}, [guestInfo]);

	// Inactivity timer
	useEffect(() => {
		if (messages.length > 0) {
			if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
			inactivityTimer.current = setTimeout(() => {
				clearConversation();
			}, INACTIVITY_TIMEOUT);
		}
		return () => {
			if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
		};
	}, [messages, clearConversation]);

	// Block body scroll when open
	useEffect(() => {
		document.body.style.overflow = isOpen && !isMinimized ? "hidden" : "";
		return () => {
			document.body.style.overflow = "";
		};
	}, [isOpen, isMinimized]);

	// Load custom answers
	useEffect(() => {
		chatService.getCustomAnswers().then(setCustomAnswers);
	}, []);

	// Auto scroll
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	useEffect(() => {
		if (isOpen && !isMinimized) {
			setTimeout(
				() => messagesEndRef.current?.scrollIntoView({ behavior: "auto" }),
				100,
			);
		}
	}, [isOpen, isMinimized]);

	// Welcome message
	useEffect(() => {
		if (isOpen && messages.length === 0) {
			const firstName = getUserFirstName();
			if (isAuthenticated && firstName) {
				addBotMessage(
					`Bonjour ${firstName} ! 👋 Comment puis-je vous aider aujourd'hui ?`,
				);
				setShowQuickActions(true);
			} else if (guestInfo?.name) {
				addBotMessage(
					`Re-bonjour ${
						guestInfo.name.split(" ")[0]
					} ! 👋 Comment puis-je vous aider ?`,
				);
			} else {
				addBotMessage(faqData.defaultMessages.welcome);
			}
		}
	}, [
		isOpen,
		isAuthenticated,
		guestInfo,
		messages.length,
		getUserFirstName,
		addBotMessage,
	]);

	return {
		isOpen,
		setIsOpen,
		isMinimized,
		setIsMinimized,
		messages,
		setMessages,
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
		customAnswers,
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
		sessionId,
		getUserFirstName,
		getUserAvatar,
		addBotMessage,
		addUserMessage,
		logChatBotInteraction,
		clearConversation,
		cart,
		clearCartAction,
		updateMessageInteractionId,
	};
};
