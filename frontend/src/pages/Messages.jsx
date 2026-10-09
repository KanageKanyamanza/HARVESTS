import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useChat } from "../contexts/ChatContext";
import ChatList from "../components/chat/ChatList";
import ChatWindow from "../components/chat/ChatWindow";
import { useAuth } from "../hooks/useAuth";
import { FiMessageSquare, FiSearch } from "react-icons/fi";
import CardGridSkeleton from "../components/common/CardGridSkeleton";

// Nom affiché d'une conversation (titre du groupe ou nom de l'autre participant)
const conversationName = (conversation, currentUser) => {
	if (conversation.type === "group") return conversation.title || "";
	const other = conversation.participants?.find(
		(p) => p.user?._id !== currentUser?._id,
	)?.user;
	return other ? `${other.firstName || ""} ${other.lastName || ""}` : "";
};

const Messages = () => {
	const { t } = useTranslation("common");
	const { id } = useParams();
	const {
		conversations,
		activeConversation,
		selectConversation,
		setActiveConversation,
		isLoading,
	} = useChat();
	const { user } = useAuth();
	const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
	const [searchTerm, setSearchTerm] = useState("");

	useEffect(() => {
		const handleResize = () => setIsMobile(window.innerWidth < 768);
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	// Gérer l'ouverture d'une conversation via l'URL
	useEffect(() => {
		if (id && conversations.length > 0) {
			const conversation = conversations.find((c) => c._id === id);
			if (conversation && activeConversation?._id !== id) {
				selectConversation(conversation);
			}
		}
	}, [id, conversations, activeConversation, selectConversation]);

	// Recherche par nom du contact ou par contenu du dernier message
	const filteredConversations = useMemo(() => {
		const term = searchTerm.trim().toLowerCase();
		if (!term) return conversations;
		return conversations.filter(
			(c) =>
				conversationName(c, user).toLowerCase().includes(term) ||
				(c.lastMessage?.content || "").toLowerCase().includes(term),
		);
	}, [conversations, searchTerm, user]);

	return (
		<div className="dashboard-page bg-harvests-light/20">
			{/* Halos d'arrière-plan */}
			<div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
				<div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-100/30 rounded-full blur-[120px]"></div>
				<div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-teal-100/20 rounded-full blur-[100px]"></div>
			</div>

			<div className="dashboard-container space-y-6">
				{/* En-tête (masqué sur mobile pendant une discussion pour laisser la place) */}
				<div
					className={`flex-col md:flex-row md:items-end justify-between gap-4 animate-fade-in-down ${
						activeConversation ? "hidden md:flex" : "flex"
					}`}
				>
					<div>
						<div className="flex items-center gap-2 text-emerald-600 font-black text-[9px] uppercase tracking-widest mb-2">
							<div className="w-5 h-[2px] bg-emerald-600"></div>
							<span>{t("messaging.eyebrow")}</span>
						</div>
						<h1 className="text-3xl font-[1000] text-gray-900 tracking-tighter leading-none mb-2">
							{t("messaging.titleStart")}{" "}
							<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
								{t("messaging.titleHighlight")}
							</span>
						</h1>
						<p className="text-xs text-gray-500 font-medium max-w-xl">
							{t("messaging.subtitle")}
						</p>
					</div>
				</div>

				{/* Panneau de messagerie */}
				<div className="h-[calc(100vh-150px)] md:h-[calc(100vh-240px)] min-h-[480px] flex bg-white/70 backdrop-blur-xl rounded-[2rem] border border-white/60 shadow-[0_20px_50px_rgba(0,0,0,0.04)] overflow-hidden animate-fade-in-up">
					{/* Liste des conversations (mobile : seulement sans discussion ouverte) */}
					<div
						className={`flex-col border-r border-gray-100 bg-white/60 md:flex md:w-1/3 lg:w-[320px] lg:shrink-0 ${
							activeConversation ? "hidden" : "flex w-full"
						}`}
					>
						<div className="p-4 space-y-3 border-b border-gray-100">
							<div className="flex items-center justify-between">
								<h2 className="text-base font-[1000] text-gray-900 tracking-tight">
									{t("messaging.title")}
								</h2>
								<span className="text-[9px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
									{t("messaging.conversationsCount", { count: conversations.length })}
								</span>
							</div>
							<div className="relative group">
								<FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
								<input
									type="text"
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									placeholder={t("messaging.searchPlaceholder")}
									className="w-full pl-10 pr-3 py-2.5 bg-gray-50/80 border border-gray-100 rounded-xl text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
								/>
							</div>
						</div>

						{isLoading && conversations.length === 0 ?
							<CardGridSkeleton count={6} variant="row" className="flex-1 space-y-2 p-3" />
						: searchTerm && filteredConversations.length === 0 ?
							<p className="p-6 text-center text-sm text-gray-500">{t("messaging.noResult")}</p>
						:	<ChatList
								conversations={filteredConversations}
								activeConversationId={activeConversation?._id}
								onSelectConversation={selectConversation}
								currentUser={user}
							/>
						}
					</div>

					{/* Discussion (mobile : seulement si une conversation est ouverte) */}
					<div className={`flex-col flex-1 min-w-0 md:flex ${activeConversation ? "flex w-full" : "hidden"}`}>
						{activeConversation ?
							<ChatWindow
								conversation={activeConversation}
								currentUser={user}
								mobileView={isMobile}
								onBack={() => setActiveConversation(null)}
							/>
						:	<div className="flex flex-col items-center justify-center h-full p-8 text-center bg-gradient-to-br from-emerald-50/40 via-white/40 to-teal-50/30">
								<div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center mb-6 shadow-lg shadow-emerald-900/5 border border-emerald-50">
									<FiMessageSquare className="w-10 h-10 text-emerald-400" />
								</div>
								<h3 className="text-xl font-[1000] text-gray-900 tracking-tight mb-2">
									{t("messaging.selectTitle")}
								</h3>
								<p className="max-w-md text-sm text-gray-500 font-medium">
									{t("messaging.selectText")}
								</p>
							</div>
						}
					</div>
				</div>
			</div>
		</div>
	);
};

export default Messages;
