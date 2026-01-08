import React from "react";
import {
	MessageCircle,
	ThumbsUp,
	ThumbsDown,
	Eye,
	ChevronLeft,
	ChevronRight,
	Search,
	Calendar,
	Filter,
} from "lucide-react";
import LoadingSpinner from "../../../components/common/LoadingSpinner";

const InteractionsTab = ({
	interactions,
	loading,
	interactionFilters,
	setInteractionFilters,
	interactionsPagination,
	loadInteractions,
	formatDate,
	handleViewChatDetails,
}) => {
	return (
		<div className="space-y-6 animate-fade-in-up">
			{/* Filters */}
			<div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-sm border border-white/60 p-4">
				<div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
					<div className="col-span-1 md:col-span-2">
						<label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">
							Recherche
						</label>
						<div className="relative">
							<Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400" />
							<input
								type="text"
								value={interactionFilters.search}
								onChange={(e) =>
									setInteractionFilters({
										...interactionFilters,
										search: e.target.value,
									})
								}
								placeholder="Question ou réponse..."
								className="w-full bg-white border-0 ring-1 ring-gray-100 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium transition-all"
							/>
						</div>
					</div>
					<div>
						<label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">
							Type de réponse
						</label>
						<div className="relative">
							<Filter className="absolute left-4 top-3.5 h-4 w-4 text-gray-400" />
							<select
								value={interactionFilters.responseType}
								onChange={(e) =>
									setInteractionFilters({
										...interactionFilters,
										responseType: e.target.value,
									})
								}
								className="w-full bg-white border-0 ring-1 ring-gray-200 rounded-2xl pl-10 pr-8 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium appearance-none transition-all"
							>
								<option value="">Tous</option>
								<option value="faq">FAQ</option>
								<option value="intent">Intention</option>
								<option value="product_search">Recherche produit</option>
								<option value="no_answer">Sans réponse</option>
								<option value="greeting">Salutation</option>
							</select>
						</div>
					</div>
					<div>
						<label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">
							Feedback
						</label>
						<select
							value={interactionFilters.feedback}
							onChange={(e) =>
								setInteractionFilters({
									...interactionFilters,
									feedback: e.target.value,
								})
							}
							className="w-full bg-white border-0 ring-1 ring-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium transition-all"
						>
							<option value="">Tous</option>
							<option value="helpful">Utile</option>
							<option value="not_helpful">Inutile</option>
						</select>
					</div>
					<div>
						<label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">
							Date début
						</label>
						<div className="relative">
							<Calendar className="absolute left-4 top-3.5 h-4 w-4 text-gray-400" />
							<input
								type="date"
								value={interactionFilters.startDate}
								onChange={(e) =>
									setInteractionFilters({
										...interactionFilters,
										startDate: e.target.value,
									})
								}
								className="w-full bg-white border-0 ring-1 ring-gray-200 rounded-2xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium transition-all"
							/>
						</div>
					</div>
					<div>
						<label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">
							Date fin
						</label>
						<div className="relative">
							<Calendar className="absolute left-4 top-3.5 h-4 w-4 text-gray-400" />
							<input
								type="date"
								value={interactionFilters.endDate}
								onChange={(e) =>
									setInteractionFilters({
										...interactionFilters,
										endDate: e.target.value,
									})
								}
								className="w-full bg-white border-0 ring-1 ring-gray-200 rounded-2xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium transition-all"
							/>
						</div>
					</div>
					<div className="flex items-end lg:col-start-6">
						<button
							onClick={() => {
								setInteractionFilters({
									responseType: "",
									feedback: "",
									search: "",
									userId: "",
									startDate: "",
									endDate: "",
								});
							}}
							className="w-full px-4 py-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-all text-[10px] font-black uppercase tracking-widest"
						>
							Réinitialiser
						</button>
					</div>
				</div>
			</div>

			{/* Interactions List */}
			{loading ? (
				<div className="flex justify-center py-20">
					<LoadingSpinner />
				</div>
			) : interactions.length === 0 ? (
				<div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] shadow-sm border border-white/60 p-20 text-center flex flex-col items-center">
					<div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
						<MessageCircle className="h-10 w-10 text-gray-400" />
					</div>
					<h3 className="text-xl font-bold text-gray-900 mb-2">
						Aucune interaction trouvée
					</h3>
					<p className="text-gray-500">
						Essayez de modifier vos filtres de recherche.
					</p>
				</div>
			) : (
				<div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-sm border border-white/60 overflow-hidden">
					<div className="overflow-x-auto">
						<table className="min-w-full">
							<thead>
								<tr className="border-b border-gray-100 bg-gray-50/50">
									<th className="px-4 py-3 text-left text-[9px] font-black text-gray-400 uppercase tracking-widest">
										Date
									</th>
									<th className="px-4 py-3 text-left text-[9px] font-black text-gray-400 uppercase tracking-widest">
										Utilisateur
									</th>
									<th className="px-4 py-3 text-left text-[9px] font-black text-gray-400 uppercase tracking-widest">
										Question
									</th>
									<th className="px-4 py-3 text-left text-[9px] font-black text-gray-400 uppercase tracking-widest">
										Réponse
									</th>
									<th className="px-4 py-3 text-left text-[9px] font-black text-gray-400 uppercase tracking-widest">
										Type
									</th>
									<th className="px-4 py-3 text-left text-[9px] font-black text-gray-400 uppercase tracking-widest">
										Feedback
									</th>
									<th className="px-4 py-3 text-left text-[9px] font-black text-gray-400 uppercase tracking-widest">
										Actions
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-100">
								{interactions.map((interaction) => (
									<tr
										key={interaction._id}
										className="hover:bg-white/50 transition-colors group"
									>
										<td className="px-4 py-3 whitespace-nowrap text-[11px] font-medium text-gray-500">
											{formatDate(interaction.createdAt)}
										</td>
										<td className="px-4 py-3 whitespace-nowrap text-[11px]">
											{interaction.userId ? (
												<div>
													<div className="font-black text-gray-900 leading-none mb-1">
														{interaction.userId.firstName}{" "}
														{interaction.userId.lastName}
													</div>
													<div className="text-gray-400 text-[10px] font-medium">
														{interaction.userId.email}
													</div>
												</div>
											) : (
												<span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-md text-[9px] font-black uppercase tracking-widest">
													Visiteur
												</span>
											)}
										</td>
										<td
											className="px-4 py-3 text-[11px] font-bold text-gray-900 max-w-xs truncate"
											title={interaction.question}
										>
											{interaction.question}
										</td>
										<td
											className="px-4 py-3 text-[11px] text-gray-500 max-w-xs truncate"
											title={interaction.response}
										>
											{interaction.response || "-"}
										</td>
										<td className="px-4 py-3 whitespace-nowrap">
											<span
												className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest inline-flex items-center gap-1 ${
													interaction.responseType === "faq"
														? "bg-green-100/50 text-green-700"
														: interaction.responseType === "product_search"
														? "bg-blue-100/50 text-blue-700"
														: interaction.responseType === "no_answer"
														? "bg-red-100/50 text-red-700"
														: interaction.responseType === "intent"
														? "bg-purple-100/50 text-purple-700"
														: "bg-gray-100/50 text-gray-700"
												}`}
											>
												{interaction.responseType || "N/A"}
											</span>
										</td>
										<td className="px-4 py-3 whitespace-nowrap">
											{interaction.feedback === "helpful" ? (
												<div className="bg-green-50 text-green-600 p-1.5 rounded-lg w-fit">
													<ThumbsUp className="h-3.5 w-3.5" />
												</div>
											) : interaction.feedback === "not_helpful" ? (
												<div className="bg-red-50 text-red-600 p-1.5 rounded-lg w-fit">
													<ThumbsDown className="h-3.5 w-3.5" />
												</div>
											) : (
												<span className="text-gray-200 font-bold">-</span>
											)}
										</td>
										<td className="px-4 py-3 whitespace-nowrap">
											{interaction.userId && (
												<button
													onClick={() => handleViewChatDetails(interaction)}
													className="inline-flex items-center px-3 py-1.5 border border-blue-100 text-[10px] font-black uppercase tracking-widest rounded-lg text-blue-600 bg-blue-50/50 hover:bg-blue-100 transition-all"
													title="Voir les détails complets du chat"
												>
													<Eye className="h-3.5 w-3.5 mr-1.5" />
													Détails
												</button>
											)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			)}

			{/* Pagination */}
			{interactionsPagination.totalPages > 1 && (
				<div className="flex items-center justify-center space-x-2 pt-6">
					<button
						onClick={() =>
							loadInteractions(interactionsPagination.currentPage - 1)
						}
						disabled={interactionsPagination.currentPage === 1}
						className="p-3 rounded-xl bg-white border border-gray-200 disabled:opacity-50 hover:bg-gray-50 transition-colors text-gray-600"
					>
						<ChevronLeft className="h-5 w-5" />
					</button>
					<span className="px-4 py-2 text-sm font-bold text-gray-600 bg-white rounded-xl border border-gray-200">
						Page {interactionsPagination.currentPage} /{" "}
						{interactionsPagination.totalPages}
						<span className="ml-2 px-2 py-0.5 bg-gray-100 rounded-md text-xs text-gray-500">
							{interactionsPagination.total} total
						</span>
					</span>
					<button
						onClick={() =>
							loadInteractions(interactionsPagination.currentPage + 1)
						}
						disabled={
							interactionsPagination.currentPage ===
							interactionsPagination.totalPages
						}
						className="p-3 rounded-xl bg-white border border-gray-200 disabled:opacity-50 hover:bg-gray-50 transition-colors text-gray-600"
					>
						<ChevronRight className="h-5 w-5" />
					</button>
				</div>
			)}
		</div>
	);
};

export default InteractionsTab;
