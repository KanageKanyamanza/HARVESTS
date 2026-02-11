import React, {
	createContext,
	useContext,
	useEffect,
	useState,
	useCallback,
} from "react";
import messageService from "../services/messageService";
import { useSocket } from "./SocketContext";
import { useAuth } from "../store/AuthContext";

const ChatContext = createContext();

export const useChat = () => {
	return useContext(ChatContext);
};

export const ChatProvider = ({ children }) => {
	const { isAuthenticated, user } = useAuth();
	const { socket, isConnected } = useSocket();

	const [isOpen, setIsOpen] = useState(false);
	const [conversations, setConversations] = useState([]);
	const [activeConversation, setActiveConversation] = useState(null);
	const [unreadCount, setUnreadCount] = useState(0);
	const [isLoading, setIsLoading] = useState(false);

	// Charger les conversations
	const fetchConversations = useCallback(async () => {
		if (!isAuthenticated || !user) return;

		try {
			setIsLoading(true);
			const data = await messageService.getMyConversations();
			if (data.data?.conversations) {
				setConversations(data.data.conversations);

				// Calculer le nombre total de messages non lus
				const totalUnread = data.data.conversations.reduce((acc, conv) => {
					return acc + (conv.unreadCount || 0);
				}, 0);
				setUnreadCount(totalUnread);
			}
		} catch (error) {
			console.error("ChatContext: Erreur chargement conversations:", error);
		} finally {
			setIsLoading(false);
		}
	}, [isAuthenticated, user]);

	// Initialisation
	useEffect(() => {
		fetchConversations();

		// Rafraîchir périodiquement
		const interval = setInterval(fetchConversations, 60000);
		return () => clearInterval(interval);
	}, [fetchConversations]);

	// Écouteurs Socket
	useEffect(() => {
		if (socket && isConnected) {
			const handleNewMessage = (data) => {
				setConversations((prev) => {
					// Trouver l'index de la conversation
					const convIndex = prev.findIndex(
						(c) => c._id === data.conversationId,
					);

					if (convIndex !== -1) {
						const updated = [...prev];
						const conv = updated[convIndex];

						// Mettre à jour la conversation existante
						updated[convIndex] = {
							...conv,
							lastMessage: data.message,
							unreadCount:
								conv._id !== activeConversation?._id ?
									(conv.unreadCount || 0) + 1
								:	0,
							updatedAt: new Date(),
						};

						// Mettre à jour le compteur global si ce n'est pas la conversation active
						if (conv._id !== activeConversation?._id) {
							setUnreadCount((c) => c + 1);
						}

						// Trier: plus récent d'abord
						return updated.sort(
							(a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
						);
					} else {
						// Si la conversation n'existe pas dans la liste (cas rare), on recharge tout
						fetchConversations();
						return prev;
					}
				});

				// Si le message est pour la conversation active, on peut faire des updates spécifiques ici si besoin
			};

			const handleNewConversation = (conversation) => {
				setConversations((prev) => [conversation, ...prev]);
			};

			socket.on("new_message", handleNewMessage);
			socket.on("new_conversation", handleNewConversation);

			return () => {
				socket.off("new_message", handleNewMessage);
				socket.off("new_conversation", handleNewConversation);
			};
		}
	}, [socket, isConnected, activeConversation, fetchConversations]);

	// Actions
	const toggleChat = () => setIsOpen((prev) => !prev);

	const openChat = () => setIsOpen(true);

	const closeChat = () => setIsOpen(false);

	const selectConversation = (conversation) => {
		setActiveConversation(conversation);
		setIsOpen(true);

		// Marquer comme lu localement
		if (conversation.unreadCount > 0) {
			setUnreadCount((prev) => Math.max(0, prev - conversation.unreadCount));
			setConversations((prev) =>
				prev.map((c) =>
					c._id === conversation._id ? { ...c, unreadCount: 0 } : c,
				),
			);

			// Appel API pour marquer lu (async sans await pour ne pas bloquer UI)
			messageService.markAsRead(conversation._id).catch(console.error);
		}
	};

	const startConversation = async (recipientId) => {
		if (!isAuthenticated) return;

		setIsOpen(true);
		setIsLoading(true);

		try {
			// 1. Vérifier si une conversation existe déjà localement
			const existingConv = conversations.find(
				(c) =>
					c.type === "direct" &&
					c.participants.some(
						(p) => p.user?._id === recipientId || p.user === recipientId,
					),
			);

			if (existingConv) {
				selectConversation(existingConv);
				setIsLoading(false);
				return existingConv;
			}

			// 2. Sinon, créer une nouvelle conversation
			const response = await messageService.createConversation({
				type: "direct",
				participantIds: [recipientId],
			});

			const newConv = response.data?.conversation || response.conversation;

			if (newConv) {
				setConversations((prev) => [newConv, ...prev]);
				setActiveConversation(newConv);
				return newConv;
			}
		} catch (error) {
			console.error("ChatContext: Impossible de créer la conversation", error);
			// On pourrait essayer de recharger la liste au cas où
			fetchConversations();
		} finally {
			setIsLoading(false);
		}
	};

	const value = {
		isOpen,
		conversations,
		activeConversation,
		unreadCount,
		isLoading,
		toggleChat,
		openChat,
		closeChat,
		selectConversation,
		startConversation,
		setActiveConversation, // Pour permettre le retour à la liste (null)
	};

	return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export default ChatContext;
