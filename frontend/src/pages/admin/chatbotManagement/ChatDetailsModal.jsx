import React from "react";
import {
	X,
	MessageCircle,
	Bot,
	User,
	ThumbsUp,
	ThumbsDown,
	MessageSquare,
} from "lucide-react";
import LoadingSpinner from "../../../components/common/LoadingSpinner";

const ChatDetailsModal = ({
	selectedInteraction,
	chatHistory,
	loadingHistory,
	formatDate,
	formatTime,
	onClose,
}) => {
	if (!selectedInteraction) return null;

	return (
		<div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
			<div className="bg-white rounded-[2.5rem] shadow-2xl max-w-4xl w-full max-h-[85vh] flex flex-col overflow-hidden border border-white/40">
				{/* Header */}
				<div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
					<div className="flex items-center gap-4">
						<div className="w-12 h-12 rounded-2xl bg-primary-100 text-primary-600 flex items-center justify-center shrink-0">
							<MessageSquare className="h-6 w-6" />
						</div>
						<div>
							<h3 className="text-2xl font-black text-gray-900 tracking-tight">
								Historique de conversation
							</h3>
							{selectedInteraction.userId && (
								<p className="text-sm font-medium text-gray-500 mt-0.5">
									{selectedInteraction.userId.firstName}{" "}
									{selectedInteraction.userId.lastName}
									{selectedInteraction.userId.email && (
										<span className="text-primary-600/80 font-bold ml-1">
											• {selectedInteraction.userId.email}
										</span>
									)}
								</p>
							)}
						</div>
					</div>
					<button
						onClick={onClose}
						className="w-10 h-10 rounded-full bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center"
					>
						<X className="h-5 w-5" />
					</button>
				</div>

				{/* Chat History */}
				<div className="flex-1 overflow-y-auto p-8 bg-gray-50 space-y-6 custom-scrollbar">
					{loadingHistory ? (
						<div className="flex justify-center py-20">
							<LoadingSpinner />
						</div>
					) : chatHistory.length === 0 ? (
						<div className="text-center py-20 flex flex-col items-center">
							<div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-6 opacity-50">
								<MessageCircle className="h-10 w-10 text-gray-500" />
							</div>
							<h4 className="text-xl font-bold text-gray-900 mb-2">
								Historique vide
							</h4>
							<p className="text-gray-500">
								Aucune interaction trouvée pour cette session.
							</p>
						</div>
					) : (
						<div className="space-y-6">
							{chatHistory.map((interaction, index) => (
								<div
									key={interaction._id || index}
									className="flex flex-col space-y-4"
								>
									{/* User Question */}
									<div className="flex items-end justify-end space-x-3 space-x-reverse">
										<div className="flex-1 bg-primary-600 text-white rounded-2xl rounded-tr-sm shadow-md shadow-primary-200 p-5 max-w-[80%] ml-auto">
											<div className="flex items-center justify-between mb-2">
												<span className="text-xs font-bold text-primary-200 uppercase tracking-wide">
													Utilisateur
												</span>
												<span className="text-xs text-primary-200/80 font-medium">
													{formatTime(interaction.createdAt)}
												</span>
											</div>
											<p className="text-white leading-relaxed">
												{interaction.question}
											</p>
										</div>
										<div className="flex-shrink-0">
											<div className="h-10 w-10 rounded-full bg-primary-100 border-2 border-white shadow-sm flex items-center justify-center">
												<User className="h-5 w-5 text-primary-600" />
											</div>
										</div>
									</div>

									{/* Bot Response */}
									{interaction.response && (
										<div className="flex items-end space-x-3">
											<div className="flex-shrink-0">
												<div className="h-10 w-10 rounded-full bg-emerald-100 border-2 border-white shadow-sm flex items-center justify-center bg-gradient-to-br from-emerald-400 to-teal-500">
													<Bot className="h-5 w-5 text-white" />
												</div>
											</div>
											<div className="flex-1 bg-white rounded-2xl rounded-tl-sm shadow-sm border border-gray-100 p-5 max-w-[80%]">
												<div className="flex items-center justify-between mb-3">
													<div className="flex items-center space-x-2">
														<span className="text-xs font-bold text-emerald-600 uppercase tracking-wide">
															Assistant
														</span>
														{interaction.responseType && (
															<span
																className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
																	interaction.responseType === "faq"
																		? "bg-green-100 text-green-700"
																		: interaction.responseType ===
																		  "product_search"
																		? "bg-blue-100 text-blue-700"
																		: interaction.responseType === "intent"
																		? "bg-purple-100 text-purple-700"
																		: "bg-gray-100 text-gray-700"
																}`}
															>
																{interaction.responseType}
															</span>
														)}
													</div>
													<div className="flex items-center space-x-3">
														{interaction.feedback === "helpful" && (
															<div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
																<ThumbsUp className="h-3 w-3" />{" "}
																<span className="text-[10px] font-bold">
																	Utile
																</span>
															</div>
														)}
														{interaction.feedback === "not_helpful" && (
															<div className="flex items-center gap-1 text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
																<ThumbsDown className="h-3 w-3" />{" "}
																<span className="text-[10px] font-bold">
																	Inutile
																</span>
															</div>
														)}
														<span className="text-xs text-gray-300 font-medium">
															{formatTime(interaction.createdAt)}
														</span>
													</div>
												</div>
												<p className="text-gray-700 leading-relaxed font-medium">
													{interaction.response}
												</p>
											</div>
										</div>
									)}
								</div>
							))}
						</div>
					)}
				</div>

				{/* Footer */}
				<div className="p-6 border-t border-gray-100 bg-white">
					<div className="flex items-center justify-between text-sm font-medium text-gray-500">
						<span>
							Total interactions:{" "}
							<span className="font-bold text-gray-900">
								{chatHistory.length}
							</span>
						</span>
						<button
							onClick={onClose}
							className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors font-bold"
						>
							Fermer
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ChatDetailsModal;
