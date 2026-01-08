import React from "react";
import {
	Filter,
	CheckCircle,
	ChevronLeft,
	ChevronRight,
	MessageCircle,
	MoreHorizontal,
} from "lucide-react";
import LoadingSpinner from "../../../components/common/LoadingSpinner";

const QuestionsTab = ({
	questions,
	loading,
	statusFilter,
	setStatusFilter,
	pagination,
	loadQuestions,
	formatDate,
	setSelectedQuestion,
	setAnswerForm,
	handleIgnoreQuestion,
}) => {
	return (
		<div className="space-y-6 animate-fade-in-up">
			{/* Filters */}
			<div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-sm border border-white/60 p-4">
				<div className="flex items-center space-x-3">
					<div className="w-8 h-8 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
						<Filter className="h-4 w-4" />
					</div>
					<select
						value={statusFilter}
						onChange={(e) => setStatusFilter(e.target.value)}
						className="bg-white border-0 ring-1 ring-gray-100 rounded-xl px-3 py-2 text-[11px] font-black uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-700 min-w-[150px]"
					>
						<option value="pending">En attente</option>
						<option value="answered">Répondues</option>
						<option value="ignored">Ignorées</option>
						<option value="all">Toutes</option>
					</select>
				</div>
			</div>

			{/* Questions List */}
			{loading ? (
				<div className="flex justify-center py-20">
					<LoadingSpinner />
				</div>
			) : questions.length === 0 ? (
				<div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] shadow-sm border border-white/60 p-20 text-center flex flex-col items-center">
					<div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
						<CheckCircle className="h-10 w-10 text-green-500" />
					</div>
					<h3 className="text-xl font-bold text-gray-900 mb-2">
						Tout est calme ici
					</h3>
					<p className="text-gray-500">
						Aucune question{" "}
						{statusFilter === "pending"
							? "en attente pour le moment"
							: "trouvée"}
						.
					</p>
				</div>
			) : (
				<div className="space-y-3">
					{questions.map((question) => (
						<div
							key={question._id}
							className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/60 p-4 hover:shadow-md transition-all group"
						>
							<div className="flex items-start justify-between gap-6">
								<div className="flex-1">
									<div className="flex items-center space-x-3 mb-3">
										<span
											className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide ${
												question.status === "pending"
													? "bg-orange-100/50 text-orange-700"
													: question.status === "answered"
													? "bg-green-100/50 text-green-700"
													: "bg-gray-100/50 text-gray-700"
											}`}
										>
											{question.status === "pending"
												? "En attente"
												: question.status === "answered"
												? "Répondue"
												: "Ignorée"}
										</span>
										<span className="text-xs font-bold text-gray-400">
											Posée {question.count}x
										</span>
									</div>
									<div className="flex items-start gap-4">
										<div className="mt-1 w-10 h-10 rounded-2xl bg-gray-100 flex items-center justify-center shrink-0 text-gray-400">
											<MessageCircle className="w-5 h-5" />
										</div>
										<div>
											<p className="text-base text-gray-900 font-black tracking-tight mb-2 leading-relaxed">
												"{question.question}"
											</p>

											{question.similarQuestions &&
												question.similarQuestions.length > 0 && (
													<div className="text-sm text-gray-500 mb-4 bg-gray-50/50 p-3 rounded-xl border border-gray-100">
														<span className="font-bold mr-1">Variantes :</span>
														{question.similarQuestions
															.map((sq) => sq.text)
															.join(", ")}
													</div>
												)}

											{question.answer && (
												<div className="mt-4 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100/50">
													<div className="flex items-center gap-2 mb-2 text-emerald-700 font-bold text-xs uppercase tracking-wider">
														<CheckCircle className="w-4 h-4" /> Réponse actuelle
													</div>
													<p className="text-gray-700 font-medium">
														{question.answer}
													</p>
												</div>
											)}

											<div className="flex items-center gap-4 mt-4 text-xs font-medium text-gray-400">
												<span>Créée le {formatDate(question.createdAt)}</span>
												{question.answeredAt && (
													<>
														<span>•</span>
														<span>
															Répondue le {formatDate(question.answeredAt)}
														</span>
													</>
												)}
											</div>
										</div>
									</div>
								</div>
								{question.status === "pending" && (
									<div className="flex flex-col gap-1.5 shrink-0">
										<button
											onClick={() => {
												setSelectedQuestion(question);
												setAnswerForm({
													answer: "",
													keywords: "",
													category: question.category || "autre",
												});
											}}
											className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-[10px] uppercase font-black tracking-widest shadow-md"
										>
											Répondre
										</button>
										<button
											onClick={() => handleIgnoreQuestion(question._id)}
											className="px-4 py-2 bg-white text-gray-500 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors text-[10px] uppercase font-black tracking-widest"
										>
											Ignorer
										</button>
									</div>
								)}
							</div>
						</div>
					))}
				</div>
			)}

			{/* Pagination */}
			{pagination.totalPages > 1 && (
				<div className="flex items-center justify-center space-x-2 pt-6">
					<button
						onClick={() => loadQuestions(pagination.currentPage - 1)}
						disabled={pagination.currentPage === 1}
						className="p-3 rounded-xl bg-white border border-gray-200 disabled:opacity-50 hover:bg-gray-50 transition-colors text-gray-600"
					>
						<ChevronLeft className="h-5 w-5" />
					</button>
					<span className="px-4 py-2 text-sm font-bold text-gray-600 bg-white rounded-xl border border-gray-200">
						Page {pagination.currentPage} / {pagination.totalPages}
					</span>
					<button
						onClick={() => loadQuestions(pagination.currentPage + 1)}
						disabled={pagination.currentPage === pagination.totalPages}
						className="p-3 rounded-xl bg-white border border-gray-200 disabled:opacity-50 hover:bg-gray-50 transition-colors text-gray-600"
					>
						<ChevronRight className="h-5 w-5" />
					</button>
				</div>
			)}
		</div>
	);
};

export default QuestionsTab;
