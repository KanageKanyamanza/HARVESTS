import React, { useState, useEffect, useCallback } from "react";
import {
	MessageSquare,
	User,
	Mail,
	Clock,
	CheckCircle,
	Reply,
	Trash2,
	Eye,
	Search,
	Filter,
	Calendar,
	MoreVertical,
	X,
	XCircle,
	ArrowLeft,
	Send,
	ChevronLeft,
	ChevronRight,
	AlertCircle,
} from "lucide-react";

import { adminService } from "../../services/adminService";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import CloudinaryImage from "../../components/common/CloudinaryImage";

const AdminMessages = () => {
	const [messages, setMessages] = useState([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [selectedMessage, setSelectedMessage] = useState(null);
	const [replyText, setReplyText] = useState("");
	const [actionLoading, setActionLoading] = useState(false);

	const loadMessages = useCallback(async () => {
		try {
			setLoading(true);
			const params = {
				page: currentPage,
				limit: 10,
				status: statusFilter,
				search: searchTerm,
			};

			const response = await adminService.getMessages(params);

			if (response.data && response.data.messages) {
				setMessages(response.data.messages || []);
				setTotalPages(response.data.pagination?.totalPages || 1);
			} else if (
				response.data &&
				response.data.data &&
				response.data.data.messages
			) {
				setMessages(response.data.data.messages || []);
				setTotalPages(response.data.data.pagination?.totalPages || 1);
			} else {
				setMessages([]);
				setTotalPages(1);
			}
		} catch (error) {
			console.error("Erreur lors du chargement des messages:", error);
			setMessages([]);
			setTotalPages(1);
		} finally {
			setLoading(false);
		}
	}, [currentPage, statusFilter, searchTerm]);

	useEffect(() => {
		loadMessages();
	}, [loadMessages]);

	const handleSearch = (e) => {
		setSearchTerm(e.target.value);
		setCurrentPage(1);
	};

	const handleStatusFilter = (e) => {
		setStatusFilter(e.target.value);
		setCurrentPage(1);
	};

	const handleMarkAsRead = async (messageId) => {
		try {
			setActionLoading(true);
			await adminService.markAsRead(messageId);
			loadMessages();
		} catch (error) {
			console.error("Erreur lors du marquage comme lu:", error);
		} finally {
			setActionLoading(false);
		}
	};

	const handleReply = async (messageId) => {
		if (!replyText.trim()) return;

		try {
			setActionLoading(true);
			await adminService.replyToMessage(messageId, replyText);
			setReplyText("");
			setSelectedMessage(null);
			loadMessages();
		} catch (error) {
			console.error("Erreur lors de la réponse:", error);
		} finally {
			setActionLoading(false);
		}
	};

	const handleDeleteMessage = async (messageId) => {
		if (window.confirm("Êtes-vous sûr de vouloir supprimer ce message ?")) {
			try {
				setActionLoading(true);
				await adminService.deleteMessage(messageId);
				loadMessages();
			} catch (error) {
				console.error("Erreur lors de la suppression:", error);
			} finally {
				setActionLoading(false);
			}
		}
	};

	const formatDate = (date) => {
		return new Date(date).toLocaleDateString("fr-FR", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const getStatusColor = (status) => {
		const colors = {
			unread: "text-blue-600 bg-blue-50 border-blue-100",
			read: "text-emerald-600 bg-emerald-50 border-emerald-100",
			pending: "text-amber-600 bg-amber-50 border-amber-100",
			replied: "text-purple-600 bg-purple-50 border-purple-100",
		};
		return colors[status] || "text-gray-600 bg-gray-50 border-gray-100";
	};

	const getStatusText = (status) => {
		const statusMap = {
			unread: "Non lu",
			read: "Lu",
			pending: "En attente",
			replied: "Répondu",
		};
		return statusMap[status] || status;
	};

	const getPriorityColor = (priority) => {
		const colors = {
			high: "text-rose-600 bg-rose-50 border-rose-100",
			medium: "text-amber-600 bg-amber-50 border-amber-100",
			low: "text-emerald-600 bg-emerald-50 border-emerald-100",
		};
		return colors[priority] || "text-gray-600 bg-gray-50 border-gray-100";
	};

	const getPriorityText = (priority) => {
		const priorityMap = {
			high: "Élevée",
			medium: "Moyenne",
			low: "Faible",
		};
		return priorityMap[priority] || priority;
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<LoadingSpinner size="lg" text="Chargement des messages..." />
			</div>
		);
	}

	return (
		<div className="min-h-screen md:pl-3 pb-20 relative overflow-hidden">
			{/* Background radial glows */}
			<div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden ">
				<div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-green-100/30 rounded-full blur-[120px]"></div>
				<div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100/20 rounded-full blur-[100px]"></div>
			</div>

			<div className="max-w-full mx-auto px-3 py-4 relative z-10 pl-1 md:pl-6 md:px-4 md:py-6">
				{/* Header */}
				<div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-5 animate-fade-in-down">
					<div>
						<div className="flex items-center gap-2 text-emerald-600 font-black text-[9px] uppercase tracking-[0.2em] mb-1">
							<div className="w-5 h-[2px] bg-emerald-600"></div>
							<span>Support Hub</span>
						</div>
						<h1 className="text-xl font-black text-gray-900 tracking-tight leading-none mb-1">
							Support <span className="text-green-600">Client</span>
						</h1>
						<p className="text-[10px] text-gray-500 font-medium flex items-center gap-1">
							<MessageSquare className="h-3 w-3 text-green-500" />
							Gérez les messages et demandes d'assistance de vos utilisateurs
						</p>
					</div>

					{/* Search & Filter Bar */}
					<div className="flex flex-wrap items-center gap-2 bg-white/70 backdrop-blur-xl p-1 rounded-xl border border-white/60 shadow-sm">
						<div className="relative">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
							<input
								type="text"
								placeholder="Rechercher..."
								value={searchTerm}
								onChange={handleSearch}
								className="pl-8 pr-4 py-1.5 bg-gray-100/50 border border-transparent focus:border-green-100 focus:bg-white focus:ring-2 focus:ring-green-500/10 rounded-lg text-xs font-medium transition-all w-full md:w-48"
							/>
						</div>
						<div className="relative">
							<Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
							<select
								value={statusFilter}
								onChange={handleStatusFilter}
								className="pl-8 pr-6 py-1.5 bg-gray-100/50 border border-transparent focus:border-green-100 focus:bg-white focus:ring-2 focus:ring-green-500/10 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all appearance-none cursor-pointer"
							>
								<option value="">Tous les statuts</option>
								<option value="unread">Non lus</option>
								<option value="read">Lus</option>
								<option value="pending">En attente</option>
								<option value="replied">Répondus</option>
							</select>
						</div>
					</div>
				</div>

				{/* Messages List */}
				<div className="space-y-3">
					{messages.length === 0 ? (
						<div className="bg-white/70 backdrop-blur-xl rounded-2xl p-8 text-center border border-white/60 shadow-sm">
							<div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
								<Mail className="h-6 w-6 text-gray-200" />
							</div>
							<h3 className="text-lg font-black text-gray-900 tracking-tight">
								Aucun message trouvé
							</h3>
						</div>
					) : (
						messages.map((message) => (
							<div
								key={message._id}
								className="group bg-white/70 backdrop-blur-xl rounded-2xl p-3 border border-white/60 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
							>
								<div className="flex flex-col lg:flex-row gap-3">
									{/* Sender Info */}
									<div className="flex items-center gap-3 lg:w-1/5">
										<div className="w-10 h-10 rounded-xl overflow-hidden border border-gray-100 shadow-sm bg-white p-0.5 flex-shrink-0">
											{message.sender?.avatar ? (
												<CloudinaryImage
													src={message.sender.avatar}
													className="w-full h-full object-cover rounded-lg"
												/>
											) : (
												<div className="w-full h-full bg-gray-50 flex items-center justify-center rounded-lg">
													<User className="h-4 w-4 text-gray-300" />
												</div>
											)}
										</div>
										<div className="flex-1 min-w-0">
											<p className="text-xs font-black text-gray-900 tracking-tight leading-none mb-1 truncate">
												{message.sender?.firstName || "Utilisateur"}{" "}
												{message.sender?.lastName || ""}
											</p>
											<p className="text-[8px] font-black text-gray-400 uppercase tracking-widest truncate">
												{message.sender?.email}
											</p>
										</div>
									</div>

									{/* Message Content */}
									<div className="flex-1 lg:border-l lg:border-r lg:border-gray-50 lg:px-4">
										<div className="flex flex-wrap items-center gap-2 mb-1.5">
											<span
												className={`px-1.5 py-0.5 rounded-md text-[7px] font-black uppercase tracking-widest border ${getStatusColor(
													message.status
												)}`}
											>
												{getStatusText(message.status)}
											</span>
											<span
												className={`px-1.5 py-0.5 rounded-md text-[7px] font-black uppercase tracking-widest border ${getPriorityColor(
													message.priority
												)}`}
											>
												{getPriorityText(message.priority)}
											</span>
											<span className="flex items-center gap-1 text-[8px] font-black text-gray-400 uppercase tracking-widest">
												<Clock className="h-2 w-2" />
												{formatDate(message.createdAt)}
											</span>
										</div>

										<h4 className="text-sm font-black text-gray-900 tracking-tight mb-1">
											{message.subject}
										</h4>
										<p className="text-[11px] text-gray-600 leading-tight font-medium bg-gray-50/50 p-2 rounded-lg border border-gray-100/50">
											{message.content}
										</p>

										{message.replies?.length > 0 && (
											<div className="mt-1.5 p-1.5 px-2 bg-emerald-50/50 border border-emerald-100/50 rounded-lg">
												<div className="flex items-center gap-1 mb-0.5 font-black text-[7px] text-emerald-600 uppercase tracking-widest">
													<Reply className="h-2 w-2" />
													Dernière réponse
												</div>
												<p className="text-[9px] text-emerald-700 font-medium italic">
													"{message.replies[message.replies.length - 1].content}
													"
												</p>
											</div>
										)}
									</div>

									{/* Actions */}
									<div className="lg:w-32 flex lg:flex-col items-center justify-center gap-1.5">
										{message.status === "unread" && (
											<button
												onClick={() => handleMarkAsRead(message._id)}
												disabled={actionLoading}
												className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg hover:bg-blue-600 hover:text-white transition-all duration-300"
											>
												<Eye className="h-3.5 w-3.5" />
												<span className="text-[8px] font-black uppercase tracking-widest">
													Lu
												</span>
											</button>
										)}
										<button
											onClick={() => setSelectedMessage(message)}
											disabled={actionLoading}
											className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg hover:bg-emerald-600 hover:text-white transition-all duration-300 shadow-sm"
										>
											<Reply className="h-3.5 w-3.5" />
											<span className="text-[8px] font-black uppercase tracking-widest">
												Répondre
											</span>
										</button>
										<button
											onClick={() => handleDeleteMessage(message._id)}
											disabled={actionLoading}
											className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-gray-50 text-gray-400 border border-transparent hover:border-gray-200 hover:text-gray-900 rounded-lg transition-all duration-300"
										>
											<Trash2 className="h-3.5 w-3.5" />
											<span className="text-[8px] font-black uppercase tracking-widest">
												Supprimer
											</span>
										</button>
									</div>
								</div>
							</div>
						))
					)}
				</div>

				{/* Pagination */}
				{totalPages > 1 && (
					<div className="mt-6 flex items-center justify-between bg-white/70 backdrop-blur-xl p-2 px-4 rounded-[1rem] border border-white/60 shadow-[0_20px_50px_rgba(0,0,0,0.02)]">
						<button
							onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
							disabled={currentPage === 1}
							className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-400 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-gray-900 hover:text-white transition-all duration-300 disabled:opacity-50"
						>
							<ChevronLeft className="h-3.5 w-3.5" /> Précédent
						</button>
						<div className="flex items-center gap-1.5">
							{Array.from({ length: totalPages }).map((_, i) => (
								<button
									key={i}
									onClick={() => setCurrentPage(i + 1)}
									className={`w-8 h-8 rounded-lg text-[9px] font-black transition-all duration-300 ${
										currentPage === i + 1
											? "bg-gray-900 text-white shadow-xl shadow-gray-200"
											: "text-gray-400 hover:bg-gray-50"
									}`}
								>
									{i + 1}
								</button>
							))}
						</div>
						<button
							onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
							disabled={currentPage === totalPages}
							className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-400 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-gray-900 hover:text-white transition-all duration-300 disabled:opacity-50"
						>
							Suivant <ChevronRight className="h-3.5 w-3.5" />
						</button>
					</div>
				)}
			</div>

			{/* Reply Modal Premium */}
			{selectedMessage && (
				<div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
					<div
						className="absolute inset-0 bg-gray-900/80 backdrop-blur-md"
						onClick={() => setSelectedMessage(null)}
					></div>
					<div className="relative w-full max-w-lg bg-white rounded-2xl overflow-hidden shadow-2xl animate-scale-in">
						<div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
							<div>
								<div className="flex items-center gap-2.5 mb-1 text-emerald-600 font-black text-[10px] uppercase tracking-widest">
									<Reply className="h-3.5 w-3.5" />
									Répondre au support
								</div>
								<p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
									Destinataire : {selectedMessage.sender?.firstName}{" "}
									{selectedMessage.sender?.lastName}
								</p>
							</div>
							<button
								onClick={() => setSelectedMessage(null)}
								className="p-2 text-gray-400 hover:text-rose-600 rounded-lg transition-all"
							>
								<X className="h-4 w-4" />
							</button>
						</div>

						<div className="p-4 space-y-4">
							<div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
								<p className="text-[10px] font-black text-gray-900 mb-1 uppercase tracking-tight">
									Sujet : {selectedMessage.subject}
								</p>
								<p className="text-[11px] text-gray-600 leading-tight italic line-clamp-2">
									"{selectedMessage.content}"
								</p>
							</div>

							<div className="space-y-2">
								<label className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5 ml-1">
									<Send className="h-2.5 w-2.5" /> Votre réponse
								</label>
								<textarea
									value={replyText}
									onChange={(e) => setReplyText(e.target.value)}
									placeholder="Écrivez votre réponse..."
									className="w-full px-4 py-3 bg-gray-100 border border-transparent focus:border-green-100 focus:bg-white focus:ring-2 focus:ring-green-500/10 rounded-xl text-xs font-medium transition-all min-h-[100px] resize-none"
								/>
							</div>

							<div className="flex gap-2">
								<button
									onClick={() => setSelectedMessage(null)}
									className="flex-1 py-2 bg-gray-50 text-gray-400 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-gray-100 hover:text-gray-900 transition-all duration-300"
								>
									Annuler
								</button>
								<button
									onClick={() => handleReply(selectedMessage._id)}
									disabled={!replyText.trim() || actionLoading}
									className="flex-[2] py-2 bg-gray-900 text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-green-600 transition-all duration-500 shadow-lg disabled:opacity-50"
								>
									{actionLoading ? "Envoi..." : "Envoyer"}
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default AdminMessages;
