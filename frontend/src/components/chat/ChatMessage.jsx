import React, { useState } from "react";
import { User, Bot, ThumbsUp, ThumbsDown } from "lucide-react";

const ChatMessage = ({
	message,
	isBot,
	timestamp,
	messageId,
	onFeedback,
	feedbackGiven,
	userAvatar,
	userName,
}) => {
	const [showFeedback, setShowFeedback] = useState(false);

	// Obtenir l'initiale du nom
	const getInitial = () => {
		if (userName) return userName.charAt(0).toUpperCase();
		return null;
	};

	return (
		<div
			className={`flex md:gap-3 gap-2 ${
				isBot ? "" : "flex-row-reverse"
			} animate-fade-in-up items-end`}
			onMouseEnter={() => isBot && setShowFeedback(true)}
			onMouseLeave={() => setShowFeedback(false)}
		>
			{/* Avatar */}
			{isBot ? (
				<div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-200 mb-1">
					<Bot className="w-5 h-5" />
				</div>
			) : userAvatar ? (
				<img
					src={userAvatar}
					alt={userName || "User"}
					className="flex-shrink-0 w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm mb-1"
				/>
			) : (
				<div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-indigo-100 text-indigo-600 font-bold text-sm border-2 border-white shadow-sm mb-1">
					{getInitial() || <User className="w-4 h-4" />}
				</div>
			)}

			{/* Message */}
			<div
				className={`flex flex-col ${
					isBot ? "items-start" : "items-end"
				} max-w-[85%]`}
			>
				<div
					className={`px-4 py-2.5 text-[13px] leading-relaxed shadow-sm ${
						isBot
							? "bg-white border border-gray-100 text-gray-700 rounded-2xl rounded-bl-sm"
							: "bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl rounded-br-sm shadow-emerald-100"
					}`}
				>
					{message}
				</div>

				<div className="flex items-center gap-2 mt-1 px-1 h-5">
					{timestamp && (
						<span className="text-[10px] font-medium text-gray-300">
							{new Date(timestamp).toLocaleTimeString("fr-FR", {
								hour: "2-digit",
								minute: "2-digit",
							})}
						</span>
					)}
					{/* Feedback buttons for bot messages */}
					{isBot &&
						messageId &&
						(showFeedback || feedbackGiven !== undefined) && (
							<div className="flex items-center gap-1.5 animate-fade-in ml-1">
								{feedbackGiven === undefined ? (
									<>
										<button
											onClick={() => onFeedback && onFeedback(messageId, true)}
											className="p-1 rounded-full bg-white text-gray-300 hover:text-emerald-500 hover:bg-emerald-50 transition-all shadow-sm border border-gray-50"
											title="Utile"
										>
											<ThumbsUp className="w-3 h-3" />
										</button>
										<button
											onClick={() => onFeedback && onFeedback(messageId, false)}
											className="p-1 rounded-full bg-white text-gray-300 hover:text-rose-500 hover:bg-rose-50 transition-all shadow-sm border border-gray-50"
											title="Pas utile"
										>
											<ThumbsDown className="w-3 h-3" />
										</button>
									</>
								) : (
									<span
										className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
											feedbackGiven
												? "bg-emerald-50 text-emerald-600"
												: "bg-rose-50 text-rose-600"
										}`}
									>
										{feedbackGiven ? (
											<ThumbsUp className="w-3 h-3" />
										) : (
											<ThumbsDown className="w-3 h-3" />
										)}
										{feedbackGiven ? "Merci !" : "Noté"}
									</span>
								)}
							</div>
						)}
				</div>
			</div>
		</div>
	);
};

export default ChatMessage;
