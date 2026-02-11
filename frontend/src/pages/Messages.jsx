import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useChat } from "../contexts/ChatContext";
import ChatList from "../components/chat/ChatList";
import ChatWindow from "../components/chat/ChatWindow";
import { useAuth } from "../hooks/useAuth";
import { FiMessageSquare } from "react-icons/fi";

const Messages = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const {
		conversations,
		activeConversation,
		selectConversation,
		setActiveConversation,
		isLoading,
	} = useChat();
	const { user } = useAuth();
	const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

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

	// Mettre à jour l'URL quand on change de conversation (optionnel, pour garder l'URL synchro)
	/* useEffect(() => {
        if (activeConversation) {
            // Logique pour mettre à jour l'URL sans recharger la page si nécessaire
            // navigate(`../messages/${activeConversation._id}`, { replace: true });
        }
    }, [activeConversation, navigate]); */

	return (
		<div className="h-[calc(100vh-80px)] md:h-[calc(100vh-100px)] flex bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden m-2 md:m-4 animate-fade-in">
			{/* 
                Sidebar List 
                Desktop: Always visible (w-1/3 or 320px)
                Mobile: Visible ONLY if NO active conversation
             */}
			<div
				className={`
                flex-col border-r border-gray-200 bg-white
                md:flex md:w-1/3 lg:w-1/4
                ${activeConversation ? "hidden" : "flex w-full"}
            `}
			>
				<div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
					<h2 className="text-xl font-bold text-gray-800">Messages</h2>
					<span className="bg-harvests-green text-white text-xs px-2 py-1 rounded-full">
						{conversations.length}
					</span>
				</div>
				{isLoading && conversations.length === 0 ?
					<div className="flex-1 flex items-center justify-center">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-harvests-green"></div>
					</div>
				:	<ChatList
						conversations={conversations}
						activeConversationId={activeConversation?._id}
						onSelectConversation={selectConversation}
						currentUser={user}
					/>
				}
			</div>

			{/* 
                Chat Window 
                Desktop: Always visible (w-2/3)
                Mobile: Visible ONLY if active conversation
            */}
			<div
				className={`
                flex-col bg-gray-50
                md:flex md:w-2/3 lg:w-3/4
                ${activeConversation ? "flex w-full" : "hidden"}
            `}
			>
				{activeConversation ?
					<ChatWindow
						conversation={activeConversation}
						currentUser={user}
						mobileView={isMobile}
						onBack={() => setActiveConversation(null)}
					/>
				:	<div className="flex flex-col items-center justify-center h-full text-gray-400 p-8 text-center bg-gray-50/50">
						<div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
							<FiMessageSquare className="w-10 h-10 text-gray-300" />
						</div>
						<h3 className="text-xl font-medium text-gray-600 mb-2">
							Vos messages
						</h3>
						<p className="max-w-md text-gray-500">
							Sélectionnez une conversation dans la liste pour commencer à
							discuter avec vos contacts.
						</p>
					</div>
				}
			</div>
		</div>
	);
};

export default Messages;
