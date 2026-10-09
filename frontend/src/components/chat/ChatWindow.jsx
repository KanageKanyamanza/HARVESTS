import React, { useState, useEffect, useRef } from "react";
import {
	Send,
	Paperclip,
	ArrowLeft,
	X,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import ChatBubble from "./ChatBubble";
import CloudinaryImage from "../common/CloudinaryImage";
import { useSocket } from "../../contexts/SocketContext";
import messageService from "../../services/messageService";

const ChatWindow = ({ conversation, currentUser, mobileView, onBack }) => {
	const { t } = useTranslation("common");
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
		:	t("messaging.unknownUser");

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
					setMessages((prev) => {
						if (prev.find((m) => m._id === data.message._id)) return prev;
						return [...prev, data.message];
					});
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
			alert(t("messaging.sendError"));
		}
	};

	if (!conversation) {
		return (
			<div className="flex-1 flex items-center justify-center bg-gray-50">
				<div className="text-center text-gray-500">
					<p className="mb-2">{t("messaging.selectText")}</p>
				</div>
			</div>
		);
	}

	return (
		<div className="flex-1 flex flex-col h-full min-h-0">
			{/* Header */}
			<div className="h-[72px] shrink-0 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center px-4 md:px-6 justify-between z-10">
				<div className="flex items-center min-w-0">
					{mobileView && (
						<button
							onClick={onBack}
							title={t("messaging.back")}
							aria-label={t("messaging.back")}
							className="mr-3 p-2 rounded-xl text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
						>
							<ArrowLeft size={20} />
						</button>
					)}

					<div className="w-11 h-11 shrink-0 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 overflow-hidden mr-3 shadow-sm">
						{displayAvatar ?
							<CloudinaryImage
								publicId={displayAvatar}
								alt={displayName}
								width={40}
								height={40}
								className="w-full h-full object-cover"
							/>
						:	<div className="w-full h-full flex items-center justify-center text-white font-black">
								{displayName.charAt(0)}
							</div>
						}
					</div>

					<div className="min-w-0">
						<h3 className="font-[1000] text-gray-900 tracking-tight leading-tight truncate">
							{displayName}
						</h3>
						{otherParticipant?.userType && (
							<p className="text-[9px] font-black uppercase tracking-widest text-emerald-600 mt-0.5">
								{t(`userTypes.${otherParticipant.userType}`, {
									defaultValue: otherParticipant.userType,
								})}
							</p>
						)}
					</div>
				</div>
			</div>

			{/* Messages */}
			<div className="flex-1 overflow-y-auto px-4 md:px-6 py-5 space-y-2 bg-gradient-to-b from-gray-50/60 via-white/30 to-emerald-50/20">
				{loading ?
					<div className="space-y-4 animate-pulse" aria-busy="true">
						{["w-2/3", "w-1/2 ml-auto", "w-3/5", "w-2/5 ml-auto"].map((width) => (
							<div key={width} className={`h-12 bg-white/80 rounded-2xl ${width}`} />
						))}
					</div>
				:	<>
						{messages.map((msg, index) => {
							// Messages système (ex: création de conversation) : pas d'expéditeur, affichage neutre
							if (!msg.sender) {
								return (
									<div key={msg._id} className="flex justify-center">
										<span className="text-[11px] text-gray-400 bg-white/60 px-3 py-1 rounded-full">
											{msg.content}
										</span>
									</div>
								);
							}

							// Vérifier si le message précédent est du même auteur pour le regroupement visuel
							const prevMsg = index > 0 ? messages[index - 1] : null;
							const isSequence =
								prevMsg?.sender && prevMsg.sender._id === msg.sender._id;
							return (
								<ChatBubble
									key={msg._id}
									message={msg}
									isOwn={msg.sender._id === currentUser?._id}
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
			<div className="shrink-0 bg-white/80 backdrop-blur-md p-3 md:p-4 border-t border-gray-100">
				{/* Preview attachments */}
				{attachments.length > 0 && (
					<div className="flex gap-2 mb-2 overflow-x-auto pb-2 px-2">
						{attachments.map((file, index) => (
							<div
								key={index}
								className="relative bg-emerald-50 rounded-xl p-2 min-w-[100px] max-w-[150px] flex items-center gap-2 border border-emerald-100"
							>
								<span className="text-xs truncate w-full">{file.name}</span>
								<button
									onClick={() => removeAttachment(index)}
									title={t("messaging.removeAttachment")}
									aria-label={t("messaging.removeAttachment")}
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
						title={t("messaging.attachFile")}
						aria-label={t("messaging.attachFile")}
						className="p-3 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-2xl transition-colors"
					>
						<Paperclip size={20} />
					</button>

					<div className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl flex items-center focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
						<textarea
							value={newMessage}
							onChange={(e) => setNewMessage(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter" && !e.shiftKey) {
									e.preventDefault();
									handleSendMessage(e);
								}
							}}
							placeholder={t("messaging.placeholder")}
							className="w-full bg-transparent border-none focus:ring-0 px-4 py-3 max-h-32 min-h-[44px] resize-none text-gray-800 placeholder-gray-500"
							rows={1}
						/>
					</div>

					<button
						type="submit"
						title={t("messaging.send")}
						aria-label={t("messaging.send")}
						disabled={!newMessage.trim() && attachments.length === 0}
						className={`p-3 rounded-2xl flex items-center justify-center transition-all ${
							newMessage.trim() || attachments.length > 0 ?
								"bg-gradient-to-br from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-900/20 hover:scale-105"
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
