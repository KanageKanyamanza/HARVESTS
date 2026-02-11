import api from "./api";

const messageService = {
	// Obtenir toutes les conversations de l'utilisateur
	getMyConversations: async () => {
		const response = await api.get("/messages/conversations");
		return response.data;
	},

	// Créer une nouvelle conversation
	createConversation: async (data) => {
		const response = await api.post("/messages/conversations", data);
		return response.data;
	},

	// Obtenir une conversation spécifique
	getConversation: async (id) => {
		const response = await api.get(`/messages/conversations/${id}`);
		return response.data;
	},

	// Obtenir les messages d'une conversation
	getMessages: async (conversationId) => {
		const response = await api.get(
			`/messages/conversations/${conversationId}/messages`,
		);
		return response.data;
	},

	// Envoyer un message
	sendMessage: async (conversationId, content, attachments = []) => {
		// Si présence de pièces jointes, utiliser FormData
		if (attachments && attachments.length > 0) {
			const formData = new FormData();
			formData.append("content", content);
			attachments.forEach((file) => {
				formData.append("attachments", file);
			});

			const response = await api.post(
				`/messages/conversations/${conversationId}/messages`,
				formData,
				{
					headers: {
						"Content-Type": "multipart/form-data",
					},
				},
			);
			return response.data;
		} else {
			// Sinon JSON standard
			const response = await api.post(
				`/messages/conversations/${conversationId}/messages`,
				{ content },
			);
			return response.data;
		}
	},

	// Marquer comme lu
	markAsRead: async (conversationId) => {
		const response = await api.patch(
			`/messages/conversations/${conversationId}/read`,
		);
		return response.data;
	},
};

export default messageService;
