import React, { useState } from "react";
import { Send } from "lucide-react";

const ChatInput = ({
	onSend,
	disabled,
	placeholder = "Tapez votre message...",
}) => {
	const [message, setMessage] = useState("");

	const handleSubmit = (e) => {
		e.preventDefault();
		if (message.trim() && !disabled) {
			onSend(message.trim());
			setMessage("");
		}
	};

	const handleKeyPress = (e) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSubmit(e);
		}
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="flex items-center gap-2 p-3 border-t border-gray-100 bg-white"
		>
			<div className="flex-1 relative">
				<input
					type="text"
					value={message}
					onChange={(e) => setMessage(e.target.value)}
					onKeyPress={handleKeyPress}
					placeholder={placeholder}
					disabled={disabled}
					autoComplete="off"
					className="w-full px-5 py-3 border border-gray-100 rounded-full bg-gray-50 focus:bg-white text-base focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all placeholder-gray-400 font-medium"
					style={{ fontSize: "15px" }}
				/>
			</div>
			<button
				type="submit"
				disabled={!message.trim() || disabled}
				className="p-3 bg-gradient-to-tr from-emerald-600 to-teal-500 text-white rounded-full hover:shadow-lg hover:shadow-emerald-200 hover:scale-105 disabled:opacity-50 disabled:shadow-none disabled:scale-100 disabled:cursor-not-allowed transition-all duration-300 transform"
			>
				<Send className="w-5 h-5 ml-0.5" />
			</button>
		</form>
	);
};

export default ChatInput;
