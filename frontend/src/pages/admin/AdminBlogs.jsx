import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
	Search,
	Filter,
	Eye,
	EyeOff,
	Edit,
	Trash2,
	Plus,
	BarChart3,
	Calendar,
	User,
	FileText,
	ExternalLink,
	ChevronRight,
	Heart,
	TrendingUp,
} from "lucide-react";
import { adminService } from "../../services/adminService";
import { useNotifications } from "../../contexts/NotificationContext";
import CloudinaryImage from "../../components/common/CloudinaryImage";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const AdminBlogs = () => {
	const { showSuccess, showError } = useNotifications();
	const navigate = useNavigate();
	const [blogs, setBlogs] = useState([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState("");
	const [typeFilter, setTypeFilter] = useState("");
	const [categoryFilter, setCategoryFilter] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);

	// Fonction utilitaire pour extraire le texte multilingue
	const getLocalizedText = (text, fallback = "") => {
		if (!text) return fallback;
		if (typeof text === "string") return text;
		if (typeof text === "object") {
			return text.fr || text.en || fallback;
		}
		return fallback;
	};

	useEffect(() => {
		loadBlogs();
		loadStats();
	}, [currentPage, statusFilter, typeFilter, categoryFilter, searchTerm]);

	const [stats, setStats] = useState({
		total: 0,
		published: 0,
		draft: 0,
		totalViews: 0,
	});

	const loadStats = async () => {
		try {
			const response = await adminService.getBlogStats();
			if (response.success && response.data) {
				setStats({
					total: response.data.total || 0,
					published: response.data.published || 0,
					draft: response.data.draft || 0,
					totalViews: response.data.totalViews || 0,
				});
			}
		} catch (error) {
			console.error("Erreur lors du chargement des stats:", error);
		}
	};

	const loadBlogs = async () => {
		try {
			setLoading(true);
			const params = {
				page: currentPage,
				limit: 10,
				status: statusFilter || undefined,
				type: typeFilter || undefined,
				category: categoryFilter || undefined,
			};

			const response = await adminService.getBlogs(params);

			if (response.success) {
				let blogsData = response.data || [];

				// Filtrer par recherche si nécessaire
				if (searchTerm) {
					const searchLower = searchTerm.toLowerCase();
					blogsData = blogsData.filter((blog) => {
						const title = getLocalizedText(blog.title).toLowerCase();
						const excerpt = getLocalizedText(blog.excerpt).toLowerCase();
						return title.includes(searchLower) || excerpt.includes(searchLower);
					});
				}

				setBlogs(blogsData);
				setTotalPages(response.pagination?.pages || 1);
			}
		} catch (error) {
			console.error("Erreur lors du chargement des blogs:", error);
			showError("Erreur lors du chargement des blogs");
			setBlogs([]);
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async (blogId) => {
		if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce blog ?")) {
			return;
		}

		try {
			await adminService.deleteBlog(blogId);
			setBlogs(blogs.filter((b) => b._id !== blogId));
			showSuccess("Blog supprimé avec succès");
			loadStats();
		} catch (error) {
			console.error("Erreur lors de la suppression:", error);
			showError("Erreur lors de la suppression du blog");
		}
	};

	const handleTogglePublish = async (blog) => {
		try {
			const newStatus = blog.status === "published" ? "draft" : "published";
			await adminService.updateBlog(blog._id, { status: newStatus });

			setBlogs(
				blogs.map((b) => (b._id === blog._id ? { ...b, status: newStatus } : b))
			);

			showSuccess(
				newStatus === "published"
					? "Blog publié avec succès"
					: "Blog dépublié avec succès"
			);
			loadStats();
		} catch (error) {
			console.error("Erreur lors de la mise à jour:", error);
			showError("Erreur lors de la mise à jour du statut");
		}
	};

	const getStatusBadge = (status) => {
		const badges = {
			published: { color: "bg-emerald-100 text-emerald-800", label: "Publié" },
			draft: { color: "bg-amber-100 text-amber-800", label: "Brouillon" },
			archived: { color: "bg-slate-100 text-slate-800", label: "Archivé" },
		};
		const badge = badges[status] || badges.draft;
		return (
			<span
				className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-full ${badge.color}`}
			>
				{badge.label}
			</span>
		);
	};

	const getTypeBadge = (type) => {
		const types = {
			article: { color: "bg-indigo-100 text-indigo-800", label: "Article" },
			"etude-cas": {
				color: "bg-fuchsia-100 text-fuchsia-800",
				label: "Étude de cas",
			},
			tutoriel: { color: "bg-orange-100 text-orange-800", label: "Tutoriel" },
			actualite: { color: "bg-rose-100 text-rose-800", label: "Actualité" },
			temoignage: { color: "bg-pink-100 text-pink-800", label: "Témoignage" },
		};
		const typeInfo = types[type] || types.article;
		return (
			<span
				className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-full ${typeInfo.color}`}
			>
				{typeInfo.label}
			</span>
		);
	};

	const formatDate = (dateString) => {
		if (!dateString) return "N/A";
		const date = new Date(dateString);
		return date.toLocaleDateString("fr-FR", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	const MiniMetric = ({ label, value, icon: Icon, color, imageUrl }) => (
		<div className="bg-white/50 backdrop-blur-sm border border-white rounded-2xl p-4 flex items-center gap-3 hover:bg-white transition-all group shadow-sm hover:shadow-md">
			<div
				className={`w-10 h-10 rounded-xl overflow-hidden ${
					imageUrl ? "bg-white" : `bg-${color}-50`
				} flex items-center justify-center text-${color}-500 group-hover:scale-110 transition-transform shadow-sm`}
			>
				{imageUrl ? (
					<img
						src={imageUrl}
						className="w-full h-full object-cover"
						alt={label}
					/>
				) : (
					<Icon className="w-5 h-5" />
				)}
			</div>
			<div>
				<p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
					{label}
				</p>
				<h4 className="text-lg font-black text-slate-900 tracking-tighter">
					{value}
				</h4>
			</div>
		</div>
	);

	return (
		<div className="min-h-screen md:pl-3 pb-20 relative overflow-hidden">
			{/* Background radial glows */}
			<div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden ">
				<div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-100/30 rounded-full blur-[120px]"></div>
				<div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100/20 rounded-full blur-[100px]"></div>
			</div>

			<div className="max-w-full mx-auto px-3 py-4 relative z-10 pl-1 md:pl-6 md:px-4 md:py-6">
				{/* Header Section */}
				<div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
					<div>
						<div className="flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-[0.2em] mb-1.5">
							<div className="w-6 h-[2px] bg-emerald-600"></div>
							<span>Library Control</span>
						</div>
						<h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter">
							Publication{" "}
							<span className="text-emerald-500 text-stroke-thin">
								Archives
							</span>
						</h1>
					</div>

					<div className="flex items-center gap-2">
						<Link
							to="/admin/blog/stats"
							className="group flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 font-bold text-xs hover:border-emerald-500 hover:text-emerald-600 transition-all duration-300 shadow-sm"
						>
							<BarChart3 className="w-4 h-4 transition-transform group-hover:scale-110" />
							<span>Performance</span>
						</Link>
						<Link
							to="/admin/blog/create"
							className="group flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl font-bold text-xs hover:bg-emerald-600 transition-all duration-300 shadow-xl shadow-slate-200"
						>
							<Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
							<span>Composer</span>
						</Link>
					</div>
				</div>

				{/* Global Stats Bar */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
					<MiniMetric
						label="Total Articles"
						value={stats.total}
						icon={FileText}
						color="emerald"
						imageUrl={blogs[0]?.featuredImage?.url}
					/>
					<MiniMetric
						label="Live Content"
						value={stats.published}
						icon={Eye}
						color="blue"
					/>
					<MiniMetric
						label="Work in Progress"
						value={stats.draft}
						icon={Edit}
						color="amber"
					/>
					<MiniMetric
						label="Cumulative Reach"
						value={stats.totalViews.toLocaleString()}
						icon={TrendingUp}
						color="indigo"
					/>
				</div>

				{/* Filters Card */}
				<div className="bg-white/70 backdrop-blur-xl border border-white rounded-2xl p-4 mb-8 shadow-sm">
					<div className="grid grid-cols-1 md:grid-cols-4 gap-3">
						<div className="relative group">
							<Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors w-4 h-4" />
							<input
								type="text"
								placeholder="Rechercher un article..."
								value={searchTerm}
								onChange={(e) => {
									setSearchTerm(e.target.value);
									setCurrentPage(1);
								}}
								className="w-full pl-10 pr-4 py-2 bg-white border border-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-xs font-bold text-slate-700 placeholder:text-slate-300"
							/>
						</div>

						<div className="relative">
							<select
								value={statusFilter}
								onChange={(e) => {
									setStatusFilter(e.target.value);
									setCurrentPage(1);
								}}
								className="w-full px-4 py-2 bg-white border border-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-[11px] font-black uppercase tracking-widest text-slate-700 appearance-none cursor-pointer"
							>
								<option value="">Tous les statuts</option>
								<option value="published">Publié</option>
								<option value="draft">Brouillon</option>
								<option value="archived">Archivé</option>
							</select>
							<ChevronRight className="absolute right-3.5 top-1/2 -translate-y-1/2 rotate-90 w-3.5 h-3.5 text-slate-300 pointer-events-none" />
						</div>

						<div className="relative">
							<select
								value={typeFilter}
								onChange={(e) => {
									setTypeFilter(e.target.value);
									setCurrentPage(1);
								}}
								className="w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm font-bold text-slate-700 appearance-none cursor-pointer"
							>
								<option value="">Tous les types</option>
								<option value="article">Article</option>
								<option value="etude-cas">Étude de cas</option>
								<option value="tutoriel">Tutoriel</option>
								<option value="actualite">Actualité</option>
								<option value="temoignage">Témoignage</option>
							</select>
							<ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 w-4 h-4 text-slate-300 pointer-events-none" />
						</div>

						<div className="relative">
							<select
								value={categoryFilter}
								onChange={(e) => {
									setCategoryFilter(e.target.value);
									setCurrentPage(1);
								}}
								className="w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm font-bold text-slate-700 appearance-none cursor-pointer"
							>
								<option value="">Toutes les catégories</option>
								<option value="strategie">Stratégie</option>
								<option value="technologie">Technologie</option>
								<option value="finance">Finance</option>
								<option value="ressources-humaines">Ressources Humaines</option>
								<option value="marketing">Marketing</option>
								<option value="operations">Opérations</option>
								<option value="gouvernance">Gouvernance</option>
							</select>
							<ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 w-4 h-4 text-slate-300 pointer-events-none" />
						</div>
					</div>
				</div>

				{/* Content Area */}
				{loading ? (
					<div className="flex flex-col items-center justify-center py-32 space-y-6">
						<LoadingSpinner size="lg" />
						<p className="text-slate-400 font-bold uppercase tracking-widest text-xs animate-pulse">
							Synchronisation des articles...
						</p>
					</div>
				) : blogs.length === 0 ? (
					<div className="bg-white rounded-[32px] p-20 text-center border border-slate-100 shadow-xl">
						<div className="w-24 h-24 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto mb-8">
							<FileText className="w-12 h-12 text-emerald-500" />
						</div>
						<h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">
							Aucun article trouvé
						</h3>
						<p className="text-slate-500 mb-10 max-w-md mx-auto leading-relaxed">
							{searchTerm || statusFilter || typeFilter || categoryFilter
								? "Nous n'avons trouvé aucun article correspondant à vos filtres actuels."
								: "Votre blog est encore vide. Commencez par rédiger votre premier article inspirant."}
						</p>
						<Link
							to="/admin/blog/create"
							className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-emerald-600 transition-all duration-300 shadow-2xl shadow-slate-200"
						>
							<Plus className="w-5 h-5" />
							Créer un premier blog
						</Link>
					</div>
				) : (
					<div className="space-y-6">
						{/* Desktop Table View */}
						<div className="hidden lg:block bg-white rounded-[24px] border border-slate-100 shadow-2xl shadow-slate-100 overflow-x-auto">
							<table className="w-full border-collapse min-w-[1000px]">
								<thead>
									<tr className="bg-slate-50/50">
										<th className="px-5 py-3 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">
											Blog Article
										</th>
										<th className="px-5 py-3 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">
											Tags
										</th>
										<th className="px-5 py-3 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">
											Statut
										</th>
										<th className="px-5 py-3 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">
											Auteur & Date
										</th>
										<th className="px-5 py-3 text-center text-[9px] font-black text-slate-400 uppercase tracking-widest">
											Engagement
										</th>
										<th className="px-5 py-3 text-right text-[9px] font-black text-slate-400 uppercase tracking-widest">
											Actions
										</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-slate-50">
									{blogs.map((blog) => (
										<tr
											key={blog._id}
											className="group hover:bg-slate-50/50 transition-colors duration-300"
										>
											<td className="px-5 py-2.5">
												<div className="flex items-center gap-4">
													{blog.featuredImage?.url ? (
														<div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-500">
															<CloudinaryImage
																src={blog.featuredImage.url}
																alt={getLocalizedText(blog.title)}
																className="w-full h-full object-cover"
															/>
														</div>
													) : (
														<div className="w-14 h-14 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
															<FileText className="w-6 h-6 text-emerald-200" />
														</div>
													)}
													<div className="flex-1 min-w-0">
														<p
															className="text-sm font-black text-slate-900 truncate mb-0.5 max-w-[300px]"
															title={getLocalizedText(blog.title)}
														>
															{getLocalizedText(blog.title)}
														</p>
														<p className="text-[10px] text-slate-400 line-clamp-1 leading-relaxed">
															{getLocalizedText(blog.excerpt)}
														</p>
													</div>
												</div>
											</td>
											<td className="px-5 py-2.5">
												<div className="flex flex-col gap-1.5">
													{getTypeBadge(blog.type)}
													{blog.category && (
														<span className="text-[9px] font-bold text-slate-500 px-2.5 py-0.5 bg-slate-100 rounded-lg inline-block w-fit">
															{blog.category}
														</span>
													)}
												</div>
											</td>
											<td className="px-5 py-2.5">
												{getStatusBadge(blog.status)}
											</td>
											<td className="px-5 py-2.5">
												<div className="flex flex-col gap-0.5">
													<div className="flex items-center gap-2 text-[11px] font-bold text-slate-700">
														<div className="w-6 h-6 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center shrink-0 border border-white shadow-sm">
															{blog.author?.avatar?.url ? (
																<img
																	src={blog.author.avatar.url}
																	className="w-full h-full object-cover"
																	alt=""
																/>
															) : (
																<User className="w-3 h-3 text-slate-400" />
															)}
														</div>
														<span className="truncate max-w-[120px]">
															{blog.author
																? `${blog.author.firstName} ${blog.author.lastName}`
																: "Admin"}
														</span>
													</div>
													<div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-wider pl-8">
														<Calendar className="w-2.5 h-2.5" />
														<span>{formatDate(blog.createdAt)}</span>
													</div>
												</div>
											</td>
											<td className="px-5 py-2.5">
												<div className="flex items-center justify-center gap-4">
													<div className="text-center group/stat">
														<div className="flex items-center gap-1 text-slate-900 font-black mb-0.5">
															<Eye className="w-3.5 h-3.5 text-emerald-500" />
															<span className="text-[11px]">
																{blog.views || 0}
															</span>
														</div>
														<span className="text-[8px] font-bold text-slate-300 uppercase tracking-[0.1em] group-hover/stat:text-emerald-500 transition-colors">
															Vues
														</span>
													</div>
													<div className="text-center group/stat">
														<div className="flex items-center gap-1 text-slate-900 font-black mb-0.5">
															<Heart className="w-3.5 h-3.5 text-rose-500" />
															<span className="text-[11px]">
																{blog.likes || 0}
															</span>
														</div>
														<span className="text-[8px] font-bold text-slate-300 uppercase tracking-[0.1em] group-hover/stat:text-rose-500 transition-colors">
															Likes
														</span>
													</div>
												</div>
											</td>
											<td className="px-5 py-2.5">
												<div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
													<a
														href={`/blog/${getLocalizedText(
															blog.slug
														)}?preview=true&admin=true`}
														target="_blank"
														rel="noopener noreferrer"
														className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:border-emerald-200 transition-all hover:shadow-lg"
														title="Voir l'article"
													>
														<ExternalLink className="w-3.5 h-3.5" />
													</a>
													<button
														onClick={() =>
															navigate(`/admin/blog/edit/${blog._id}`)
														}
														className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-all hover:shadow-lg"
														title="Modifier"
													>
														<Edit className="w-3.5 h-3.5" />
													</button>
													<button
														onClick={() => handleTogglePublish(blog)}
														className={`w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center transition-all hover:shadow-lg ${
															blog.status === "published"
																? "text-rose-400 hover:text-rose-600 hover:border-rose-200"
																: "text-emerald-400 hover:text-emerald-600 hover:border-emerald-200"
														}`}
														title={
															blog.status === "published"
																? "Dépublier"
																: "Publier"
														}
													>
														{blog.status === "published" ? (
															<EyeOff className="w-3.5 h-3.5" />
														) : (
															<Eye className="w-3.5 h-3.5" />
														)}
													</button>
													<button
														onClick={() => handleDelete(blog._id)}
														className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-red-600 hover:border-red-200 transition-all hover:shadow-lg"
														title="Supprimer"
													>
														<Trash2 className="w-3.5 h-3.5" />
													</button>
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>

						{/* Mobile Card View */}
						<div className="lg:hidden space-y-3">
							{blogs.map((blog) => (
								<div
									key={blog._id}
									className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm"
								>
									<div className="flex items-start gap-3 mb-4">
										{blog.featuredImage?.url ? (
											<div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 shadow-sm">
												<CloudinaryImage
													src={blog.featuredImage.url}
													alt={getLocalizedText(blog.title)}
													className="w-full h-full object-cover"
												/>
											</div>
										) : (
											<div className="w-16 h-16 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
												<FileText className="w-8 h-8 text-emerald-200" />
											</div>
										)}
										<div className="min-w-0 flex-1">
											<div className="flex flex-wrap gap-1.5 mb-1.5">
												{getStatusBadge(blog.status)}
												{getTypeBadge(blog.type)}
											</div>
											<h4 className="text-sm font-black text-slate-900 leading-tight truncate">
												{getLocalizedText(blog.title)}
											</h4>
										</div>
									</div>

									<div className="grid grid-cols-2 gap-3 py-3 border-y border-slate-50 mb-4 font-black text-[9px] uppercase tracking-widest text-slate-400">
										<div className="flex items-center gap-1.5">
											<Eye className="w-3.5 h-3.5 text-emerald-500" />
											<span>
												<span className="text-slate-900">
													{blog.views || 0}
												</span>{" "}
												Vues
											</span>
										</div>
										<div className="flex items-center gap-1.5">
											<Heart className="w-3.5 h-3.5 text-rose-500" />
											<span>
												<span className="text-slate-900">
													{blog.likes || 0}
												</span>{" "}
												Likes
											</span>
										</div>
									</div>

									<div className="flex items-center justify-between">
										<div className="flex items-center gap-1.5">
											<div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center shrink-0 border border-white shadow-sm">
												{blog.author?.avatar?.url ? (
													<img
														src={blog.author.avatar.url}
														className="w-full h-full object-cover"
														alt=""
													/>
												) : (
													<div className="w-full h-full bg-slate-900 flex items-center justify-center text-white text-[9px] font-black">
														{blog.author ? blog.author.firstName[0] : "A"}
													</div>
												)}
											</div>
											<div className="text-[9px] font-bold text-slate-400 leading-tight">
												<p className="text-slate-900">
													{blog.author
														? `${blog.author.firstName} ${blog.author.lastName}`
														: "Admin"}
												</p>
												<p>{formatDate(blog.createdAt)}</p>
											</div>
										</div>

										<div className="flex items-center gap-1.5">
											<button
												onClick={() => navigate(`/admin/blog/edit/${blog._id}`)}
												className="p-2 bg-slate-50 text-slate-900 rounded-lg hover:bg-emerald-500 hover:text-white transition-all"
											>
												<Edit className="w-3.5 h-3.5" />
											</button>
											<button
												onClick={() => handleDelete(blog._id)}
												className="p-2 bg-slate-50 text-slate-900 rounded-lg hover:bg-rose-500 hover:text-white transition-all"
											>
												<Trash2 className="w-3.5 h-3.5" />
											</button>
										</div>
									</div>
								</div>
							))}
						</div>

						{/* Premium Pagination */}
						{totalPages > 1 && (
							<div className="flex items-center justify-center gap-2 pt-6">
								<button
									onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
									disabled={currentPage === 1}
									className="px-3.5 py-2 bg-white border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-emerald-600 disabled:opacity-50 transition-all shadow-sm"
								>
									Précédent
								</button>

								<div className="flex items-center gap-1.5 bg-white/50 backdrop-blur-md p-1.5 rounded-2xl border border-white">
									{Array.from({ length: totalPages }).map((_, i) => {
										const pageNum = i + 1;
										const isActive = currentPage === pageNum;

										if (
											totalPages > 6 &&
											!isActive &&
											pageNum !== 1 &&
											pageNum !== totalPages &&
											Math.abs(pageNum - currentPage) > 1
										) {
											if (pageNum === 2 && currentPage > 3 && totalPages > 5)
												return (
													<span
														key="dots1"
														className="w-10 text-center text-slate-300"
													>
														...
													</span>
												);
											if (
												pageNum === totalPages - 1 &&
												currentPage < totalPages - 2 &&
												totalPages > 5
											)
												return (
													<span
														key="dots2"
														className="w-10 text-center text-slate-300"
													>
														...
													</span>
												);
											return null;
										}

										return (
											<button
												key={pageNum}
												onClick={() => setCurrentPage(pageNum)}
												className={`w-10 h-10 rounded-xl text-[10px] font-black transition-all duration-300 ${
													isActive
														? "bg-slate-900 text-white shadow-lg shadow-slate-200"
														: "text-slate-400 hover:bg-white hover:text-emerald-600"
												}`}
											>
												{pageNum}
											</button>
										);
									})}
								</div>

								<button
									onClick={() =>
										setCurrentPage(Math.min(totalPages, currentPage + 1))
									}
									disabled={currentPage === totalPages}
									className="px-3.5 py-2 bg-white border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-emerald-600 disabled:opacity-50 transition-all shadow-sm"
								>
									Suivant
								</button>
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
};

export default AdminBlogs;
