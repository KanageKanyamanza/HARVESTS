import React, { useState, useEffect, useRef } from "react";
import {
	Send,
	Paperclip,
	MoreVertical,
	Phone,
	Video,
	ArrowLeft,
	X,
} from "lucide-react";
import ChatBubble from "./ChatBubble";
import CloudinaryImage from "../common/CloudinaryImage";
import { useSocket } from "../../contexts/SocketContext";
import messageService from "../../services/messageService";

const ChatWindow = ({ conversation, currentUser, mobileView, onBack }) => {
	const [messages, setMessages] = useState([]);
	const [newMessage, setNewMessage] = useState("");
	const [attachments, setAttachments] = useState([]);
	const [loading, setLoading] = useState(false);
	const messagesEndRef = useRef(null);
	const fileInputRef = useRef(null);
	const { socket } = useSocket();

	// Identifier l'autre participant
	const otherParticipant = conversation?.participants?.find(
		(p) => p.user?._id !== currentUser?._id,
	)?.user;

	const displayName =
		conversation?.type === "group" ? conversation.title
		: otherParticipant ?
			`${otherParticipant.firstName} ${otherParticipant.lastName}`
		:	"Utilisateur inconnu";

	const displayAvatar =
		conversation?.type === "group" ?
			conversation.avatar
		:	otherParticipant?.avatar;

	// Récupérer les messages
	useEffect(() => {
		if (conversation) {
			const fetchMessages = async () => {
				try {
					setLoading(true);
					const data = await messageService.getMessages(conversation._id);
					// Gérer le cas où data.messages existe directement ou data.data.messages
					const msgs = data.data?.messages || data.messages || [];
					setMessages(msgs);
					setLoading(false);
					scrollToBottom();
				} catch (error) {
					console.error("Erreur chargement messages:", error);
					setLoading(false);
				}
			};

			fetchMessages();
		}
	}, [conversation]);

	// Écouter les nouveaux messages socket
	useEffect(() => {
		if (socket && conversation) {
			const handleNewMessage = (data) => {
				if (data.conversationId === conversation._id) {
					setMessages((prev) => [...prev, data.message]);
					scrollToBottom();

					// Marquer comme lu
					socket.emit("mark_read", {
						conversationId: conversation._id,
						messageId: data.message._id,
					});
				}
			};

			socket.on("new_message", handleNewMessage);

			return () => {
				socket.off("new_message", handleNewMessage);
			};
		}
	}, [socket, conversation]);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	const handleFileSelect = (e) => {
		if (e.target.files && e.target.files.length > 0) {
			setAttachments((prev) => [...prev, ...Array.from(e.target.files)]);
		}
	};

	const removeAttachment = (index) => {
		setAttachments((prev) => prev.filter((_, i) => i !== index));
	};

	const triggerFileInput = () => {
		fileInputRef.current?.click();
	};

	const handleSendMessage = async (e) => {
		e.preventDefault();
		if (!newMessage.trim() && attachments.length === 0) return;

		try {
			const content = newMessage;
			const currentAttachments = [...attachments];

			setNewMessage(""); // Optimistic clear
			setAttachments([]);

			// Envoyer via API
			const data = await messageService.sendMessage(
				conversation._id,
				content,
				currentAttachments,
			);

			// Le message sera ajouté via le socket ou on peut l'ajouter manuellement
			// API devrait retourner le message créé
			const optimMsg = data.data?.message || data.message;

			if (optimMsg) {
				setMessages((prev) => {
					if (prev.find((m) => m._id === optimMsg._id)) return prev;
					return [...prev, optimMsg];
				});
				scrollToBottom();
			}
		} catch (error) {
			console.error("Erreur envoi message:", error);
			alert("Erreur lors de l'envoi");
		}
	};

	if (!conversation) {
		return (
			<div className="flex-1 flex items-center justify-center bg-gray-50">
				<div className="text-center text-gray-500">
					<p className="mb-2">Sélectionnez une conversation pour commencer</p>
				</div>
			</div>
		);
	}

	return (
		<div className="flex-1 flex flex-col h-full bg-gray-50">
			{/* Header */}
			<div className="h-16 bg-white border-b flex items-center px-4 justify-between shadow-sm z-10">
				<div className="flex items-center">
					{mobileView && (
						<button
							onClick={onBack}
							className="mr-3 text-gray-600 hover:text-gray-900"
						>
							<ArrowLeft size={20} />
						</button>
					)}

					<div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden mr-3">
						{displayAvatar ?
							<CloudinaryImage
								publicId={displayAvatar}
								alt={displayName}
								width={40}
								height={40}
								className="w-full h-full object-cover"
							/>
						:	<div className="w-full h-full flex items-center justify-center text-gray-500 font-bold">
								{displayName.charAt(0)}
							</div>
						}
					</div>

					<div>
						<h3 className="font-semibold text-gray-900 leading-tight">
							{displayName}
						</h3>
						{otherParticipant?.userType && (
							<p className="text-xs text-green-600 font-medium capitalize">
								{otherParticipant.userType}
							</p>
						)}
					</div>
				</div>
			</div>

			{/* Messages */}
			<div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#e5ddd5]/10">
				{loading ?
					<div className="flex justify-center pt-10">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-harvests-green"></div>
					</div>
				:	<>
						{messages.map((msg, index) => {
							// Vérifier si le message précédent est du même auteur pour le regroupement visuel
							const isSequence =
								index > 0 && messages[index - 1].sender._id === msg.sender._id;
							return (
								<ChatBubble
									key={msg._id}
									message={msg}
									isOwn={msg.sender._id === currentUser._id}
									showAvatar={!isSequence}
									sender={msg.sender}
								/>
							);
						})}
						<div ref={messagesEndRef} />
					</>
				}
			</div>

			{/* Input */}
			<div className="bg-white p-3 border-t">
				{/* Preview attachments */}
				{attachments.length > 0 && (
					<div className="flex gap-2 mb-2 overflow-x-auto pb-2 px-2">
						{attachments.map((file, index) => (
							<div
								key={index}
								className="relative bg-gray-100 rounded-lg p-2 min-w-[100px] max-w-[150px] flex items-center gap-2 border border-gray-200"
							>
								<span className="text-xs truncate w-full">{file.name}</span>
								<button
									onClick={() => removeAttachment(index)}
									className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 shadow-sm"
									type="button"
								>
									<X size={12} />
								</button>
							</div>
						))}
					</div>
				)}

				<form
					onSubmit={handleSendMessage}
					className="flex items-end gap-2 max-w-4xl mx-auto"
				>
					<input
						type="file"
						ref={fileInputRef}
						onChange={handleFileSelect}
						className="hidden"
						multiple
					/>
					<button
						onClick={triggerFileInput}
						type="button"
						className="p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
					>
						<Paperclip size={20} />
					</button>

					<div className="flex-1 bg-gray-100 rounded-3xl flex items-center">
						<textarea
							value={newMessage}
							onChange={(e) => setNewMessage(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter" && !e.shiftKey) {
									e.preventDefault();
									handleSendMessage(e);
								}
							}}
							placeholder="Écrivez un message..."
							className="w-full bg-transparent border-none focus:ring-0 px-4 py-3 max-h-32 min-h-[44px] resize-none text-gray-800 placeholder-gray-500"
							rows={1}
						/>
					</div>

					<button
						type="submit"
						disabled={!newMessage.trim() && attachments.length === 0}
						className={`p-3 rounded-full flex items-center justify-center transition-colors ${
							newMessage.trim() || attachments.length > 0 ?
								"bg-harvests-green text-white shadow-md hover:bg-green-700"
							:	"bg-gray-200 text-gray-400 cursor-not-allowed"
						}`}
					>
						<Send
							size={18}
							className={
								newMessage.trim() || attachments.length > 0 ? "ml-0.5" : ""
							}
						/>
					</button>
				</form>
			</div>
		</div>
	);
};

export default ChatWindow;
