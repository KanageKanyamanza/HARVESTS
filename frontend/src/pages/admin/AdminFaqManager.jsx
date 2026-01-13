import React, { useState, useEffect, useCallback } from "react";
import {
	MessageSquare,
	Search,
	Filter,
	Plus,
	Edit2,
	Trash2,
	Save,
	X,
	CheckCircle,
	AlertCircle,
	ChevronLeft,
	ChevronRight,
} from "lucide-react";
import { adminService } from "../../services/adminService";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const AdminFaqManager = () => {
	const [faqs, setFaqs] = useState([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [categoryFilter, setCategoryFilter] = useState("all");
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingFaq, setEditingFaq] = useState(null);
	const [formData, setFormData] = useState({
		question: "",
		answer: "",
		category: "general",
		keywords: "",
	});
	const [actionLoading, setActionLoading] = useState(false);

	const loadFaqs = useCallback(async () => {
		try {
			setLoading(true);
			const params = {
				page: currentPage,
				limit: 10,
				search: searchTerm,
				category: categoryFilter,
			};
			const response = await adminService.getFaqs(params);
			if (response.status === "success") {
				setFaqs(response.data.faqs);
				setTotalPages(response.data.pagination.totalPages);
			}
		} catch (error) {
			console.error("Error loading FAQs:", error);
		} finally {
			setLoading(false);
		}
	}, [currentPage, searchTerm, categoryFilter]);

	useEffect(() => {
		loadFaqs();
	}, [loadFaqs]);

	const handleOpenModal = (faq = null) => {
		if (faq) {
			setEditingFaq(faq);
			setFormData({
				question: faq.question,
				answer: faq.answer,
				category: faq.category,
				keywords: faq.keywords.join(", "),
			});
		} else {
			setEditingFaq(null);
			setFormData({
				question: "",
				answer: "",
				category: "general",
				keywords: "",
			});
		}
		setIsModalOpen(true);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setActionLoading(true);
		try {
			const data = {
				...formData,
				keywords: formData.keywords
					.split(",")
					.map((k) => k.trim())
					.filter((k) => k),
			};

			if (editingFaq) {
				await adminService.updateFaq(editingFaq._id, data);
			} else {
				await adminService.createFaq(data);
			}

			setIsModalOpen(false);
			loadFaqs();
		} catch (error) {
			console.error("Error saving FAQ:", error);
			alert("Erreur lors de l'enregistrement");
		} finally {
			setActionLoading(false);
		}
	};

	const handleDelete = async (id) => {
		if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette FAQ ?"))
			return;
		setActionLoading(true);
		try {
			await adminService.deleteFaq(id);
			loadFaqs();
		} catch (error) {
			console.error("Error deleting FAQ:", error);
		} finally {
			setActionLoading(false);
		}
	};

	return (
		<div className="min-h-screen md:pl-3 pb-20 relative overflow-hidden">
			{/* Background Effect */}
			<div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
				<div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-100/30 rounded-full blur-[120px]"></div>
			</div>

			<div className="max-w-full mx-auto px-3 py-4 relative z-10 pl-1 md:pl-6 md:px-4 md:py-6">
				{/* Header */}
				<div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-5">
					<div>
						<div className="flex items-center gap-2 text-purple-600 font-black text-[9px] uppercase tracking-[0.2em] mb-1">
							<div className="w-5 h-[2px] bg-purple-600"></div>
							<span>Chatbot Knowledge</span>
						</div>
						<h1 className="text-xl font-black text-gray-900 tracking-tight leading-none mb-1">
							Gestion des <span className="text-purple-600">FAQs</span>
						</h1>
					</div>
					<button
						onClick={() => handleOpenModal()}
						className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl font-bold text-xs hover:bg-purple-700 transition-all shadow-lg hover:shadow-purple-500/20"
					>
						<Plus className="h-4 w-4" /> Nouvelle FAQ
					</button>
				</div>

				{/* Filters */}
				<div className="flex flex-wrap items-center gap-2 bg-white/70 backdrop-blur-xl p-1.5 rounded-xl border border-white/60 shadow-sm mb-4">
					<div className="relative flex-1 min-w-[200px]">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
						<input
							type="text"
							placeholder="Rechercher une question..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="pl-8 pr-4 py-1.5 bg-gray-100/50 border border-transparent focus:border-purple-100 focus:bg-white focus:ring-2 focus:ring-purple-500/10 rounded-lg text-xs font-medium w-full transition-all"
						/>
					</div>
					<select
						value={categoryFilter}
						onChange={(e) => setCategoryFilter(e.target.value)}
						className="pl-3 pr-8 py-1.5 bg-gray-100/50 border border-transparent focus:border-purple-100 focus:bg-white focus:ring-2 focus:ring-purple-500/10 rounded-lg text-xs font-medium appearance-none cursor-pointer"
					>
						<option value="all">Toutes les catégories</option>
						<option value="livraison">Livraison</option>
						<option value="paiement">Paiement</option>
						<option value="commande">Commande</option>
						<option value="compte">Compte</option>
						<option value="produits">Produits</option>
						<option value="general">Général</option>
					</select>
				</div>

				{/* Table */}
				{loading ? (
					<div className="flex justify-center p-8">
						<LoadingSpinner size="lg" text="Chargement..." />
					</div>
				) : (
					<div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/60 shadow-sm overflow-hidden">
						<div className="overflow-x-auto">
							<table className="w-full">
								<thead className="bg-gray-50/50 border-b border-gray-100">
									<tr>
										<th className="px-4 py-3 text-left text-[9px] font-black text-gray-400 uppercase tracking-widest">
											Question
										</th>
										<th className="px-4 py-3 text-left text-[9px] font-black text-gray-400 uppercase tracking-widest">
											Réponse
										</th>
										<th className="px-4 py-3 text-left text-[9px] font-black text-gray-400 uppercase tracking-widest">
											Catégorie
										</th>
										<th className="px-4 py-3 text-right text-[9px] font-black text-gray-400 uppercase tracking-widest">
											Actions
										</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-gray-100">
									{faqs.map((faq) => (
										<tr
											key={faq._id}
											className="hover:bg-gray-50/50 transition-colors"
										>
											<td className="px-4 py-3">
												<p className="text-xs font-bold text-gray-900 line-clamp-2">
													{faq.question}
												</p>
												<p className="text-[10px] text-gray-400 mt-0.5">
													{faq.keywords.join(", ")}
												</p>
											</td>
											<td className="px-4 py-3">
												<p className="text-xs text-gray-600 line-clamp-2">
													{faq.answer}
												</p>
											</td>
											<td className="px-4 py-3">
												<span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-600 text-[9px] font-black uppercase tracking-widest">
													{faq.category}
												</span>
											</td>
											<td className="px-4 py-3">
												<div className="flex justify-end gap-1">
													<button
														onClick={() => handleOpenModal(faq)}
														className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
													>
														<Edit2 className="h-3.5 w-3.5" />
													</button>
													<button
														onClick={() => handleDelete(faq._id)}
														className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
													>
														<Trash2 className="h-3.5 w-3.5" />
													</button>
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				)}

				{/* Modal */}
				{isModalOpen && (
					<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/80 backdrop-blur-sm">
						<div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl p-6 relative animate-scale-in">
							<button
								onClick={() => setIsModalOpen(false)}
								className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-900 rounded-lg"
							>
								<X className="h-4 w-4" />
							</button>
							<h2 className="text-lg font-black text-gray-900 mb-6">
								{editingFaq ? "Modifier la FAQ" : "Nouvelle FAQ"}
							</h2>
							<form onSubmit={handleSubmit} className="space-y-4">
								<div>
									<label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">
										Question
									</label>
									<input
										type="text"
										required
										value={formData.question}
										onChange={(e) =>
											setFormData({ ...formData, question: e.target.value })
										}
										className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
										placeholder="Ex: Quels sont les délais ?"
									/>
								</div>
								<div>
									<label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">
										Réponse
									</label>
									<textarea
										required
										rows="4"
										value={formData.answer}
										onChange={(e) =>
											setFormData({ ...formData, answer: e.target.value })
										}
										className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all resize-none"
										placeholder="La réponse du chatbot..."
									/>
								</div>
								<div className="grid grid-cols-2 gap-4">
									<div>
										<label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">
											Catégorie
										</label>
										<select
											value={formData.category}
											onChange={(e) =>
												setFormData({ ...formData, category: e.target.value })
											}
											className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
										>
											<option value="general">Général</option>
											<option value="livraison">Livraison</option>
											<option value="paiement">Paiement</option>
											<option value="commande">Commande</option>
											<option value="compte">Compte</option>
											<option value="produits">Produits</option>
										</select>
									</div>
									<div>
										<label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">
											Mots-clés (séparés par virgule)
										</label>
										<input
											type="text"
											value={formData.keywords}
											onChange={(e) =>
												setFormData({ ...formData, keywords: e.target.value })
											}
											className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
											placeholder="délai, temps, livraison"
										/>
									</div>
								</div>
								<div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
									<button
										type="button"
										onClick={() => setIsModalOpen(false)}
										className="px-4 py-2 text-gray-500 font-bold text-xs uppercase tracking-wider hover:bg-gray-50 rounded-lg transition-all"
									>
										Annuler
									</button>
									<button
										type="submit"
										disabled={actionLoading}
										className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-purple-700 transition-all shadow-lg hover:shadow-purple-500/20 disabled:opacity-70 disabled:cursor-not-allowed"
									>
										{actionLoading ? (
											<LoadingSpinner size="sm" color="white" />
										) : (
											<>
												<Save className="h-4 w-4" /> Enregistrer
											</>
										)}
									</button>
								</div>
							</form>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default AdminFaqManager;
