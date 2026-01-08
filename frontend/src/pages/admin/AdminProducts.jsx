import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
	Search,
	Filter,
	Eye,
	CheckCircle,
	XCircle,
	Star,
	Package,
	Calendar,
	User,
	MapPin,
	DollarSign,
	AlertTriangle,
	MoreVertical,
} from "lucide-react";
import { adminService } from "../../services/adminService";
import CloudinaryImage from "../../components/common/CloudinaryImage";
import { toPlainText } from "../../utils/textHelpers";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const AdminProducts = () => {
	const [products, setProducts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState("");
	const [categoryFilter, setCategoryFilter] = useState("");
	const [featuredFilter, setFeaturedFilter] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [selectedProducts, setSelectedProducts] = useState([]);

	const getLocalizedText = (text, fallback = "") => toPlainText(text, fallback);

	useEffect(() => {
		loadProducts();
	}, [currentPage, statusFilter, categoryFilter, searchTerm, featuredFilter]);

	// Fonction loadProducts
	const loadProducts = async () => {
		try {
			setLoading(true);
			const params = {
				page: currentPage,
				limit: 10,
				search: searchTerm,
				status: statusFilter,
				category: categoryFilter,
				featured: featuredFilter,
			};
			const response = await adminService.getProducts(params);
			// Vérifier si la réponse contient des produits
			if (response.data && response.data.products) {
				setProducts(response.data.products || []);
				setTotalPages(response.data.pagination?.totalPages || 1);
			} else if (
				response.data &&
				response.data.data &&
				response.data.data.products
			) {
				// Structure alternative avec data.products
				setProducts(response.data.data.products || []);
				setTotalPages(response.data.data.pagination?.totalPages || 1);
			} else {
				setProducts([]);
				setTotalPages(1);
			}
		} catch (error) {
			console.error("Erreur lors du chargement des produits:", error);
			setProducts([]);
			setTotalPages(1);
		} finally {
			setLoading(false);
		}
	};

	const handleSearch = (e) => {
		setSearchTerm(e.target.value);
		setCurrentPage(1);
	};

	const handleStatusFilter = (e) => {
		setStatusFilter(e.target.value);
		setCurrentPage(1);
	};

	const handleCategoryFilter = (e) => {
		setCategoryFilter(e.target.value);
		setCurrentPage(1);
	};

	const handleFeaturedFilter = (e) => {
		setFeaturedFilter(e.target.value);
		setCurrentPage(1);
	};

	const handleSelectProduct = (productId) => {
		setSelectedProducts((prev) =>
			prev.includes(productId)
				? prev.filter((id) => id !== productId)
				: [...prev, productId]
		);
	};

	const handleSelectAll = () => {
		setSelectedProducts(
			selectedProducts.length === products.length
				? []
				: products.map((product) => product._id)
		);
	};

	const handleApproveProduct = async (productId) => {
		if (window.confirm("Êtes-vous sûr de vouloir approuver ce produit ?")) {
			try {
				await adminService.approveProduct(productId);
				loadProducts();
			} catch (error) {
				console.error("Erreur lors de l'approbation:", error);
			}
		}
	};

	const handleRejectProduct = async (productId) => {
		const reason = window.prompt("Raison du rejet:");
		if (reason) {
			try {
				await adminService.rejectProduct(productId, reason);
				loadProducts();
			} catch (error) {
				console.error("Erreur lors du rejet:", error);
			}
		}
	};

	const handleFeatureProduct = async (productId) => {
		try {
			const product = products.find((p) => p._id === productId);
			if (product?.isFeatured) {
				await adminService.unfeatureProduct(productId);
			} else {
				await adminService.featureProduct(productId);
			}
			loadProducts();
		} catch (error) {
			console.error("Erreur lors de la gestion de la vedette:", error);
		}
	};

	const formatPrice = (price, currency = "XOF") => {
		return new Intl.NumberFormat("fr-FR", {
			style: "currency",
			currency: currency,
			minimumFractionDigits: 0,
		}).format(price);
	};

	const formatDate = (date) => {
		return new Date(date).toLocaleDateString("fr-FR", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	const getStatusColor = (status) => {
		const colors = {
			approved: "bg-emerald-50 text-emerald-600 border-emerald-100",
			"pending-review": "bg-amber-50 text-amber-600 border-amber-100",
			draft: "bg-gray-50 text-gray-600 border-gray-100",
			rejected: "bg-rose-50 text-rose-600 border-rose-100",
			inactive: "bg-slate-50 text-slate-600 border-slate-100",
		};
		return colors[status] || "bg-gray-50 text-gray-600 border-gray-100";
	};

	const getStatusText = (status) => {
		const statusMap = {
			approved: "Approuvé",
			"pending-review": "En attente",
			draft: "Brouillon",
			rejected: "Rejeté",
			inactive: "Inactif",
		};
		return statusMap[status] || status;
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<LoadingSpinner size="lg" text="Chargement du catalogue..." />
			</div>
		);
	}

	return (
		<div className="min-h-screen md:pl-3 pb-20 relative overflow-hidden">
			{/* Background radial glows pour un effet "wow" */}
			<div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden ">
				<div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-green-100/30 rounded-full blur-[120px]"></div>
				<div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-blue-100/20 rounded-full blur-[100px]"></div>
				<div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] bg-purple-100/20 rounded-full blur-[120px]"></div>
			</div>

			<div className="max-w-full mx-auto px-4 py-6 space-y-5 relative z-10 pl-6">
				{/* Header avec typographie premium */}
				<div className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-2">
					<div className="animate-fade-in-down">
						<div className="flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-[0.2em] mb-1.5">
							<div className="w-5 h-[2px] bg-emerald-600"></div>
							<span className="text-[9px]">Inventory Control</span>
						</div>
						<h1 className="text-2xl font-[1000] text-gray-900 tracking-tighter leading-[1] mb-1.5">
							Gestion du <span className="text-green-600">Catalogue</span>
						</h1>
						<p className="text-xs text-gray-500 font-medium max-w-xl">
							Modérez les nouveaux produits et gérez l'ensemble des articles
							disponibles sur la plateforme Harvests.
						</p>
					</div>
					<div className="flex items-center gap-4 animate-fade-in-up"></div>
				</div>

				{/* Section Filtres avec Glassmorphism */}
				<div className="bg-white/70 backdrop-blur-xl rounded-[1.5rem] p-3.5 shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-white/60 animate-fade-in-up delay-100">
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-2.5">
						<div className="relative group">
							<Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400 group-focus-within:text-green-500 transition-colors" />
							<input
								type="text"
								placeholder="Rechercher..."
								value={searchTerm}
								onChange={handleSearch}
								className="w-full pl-9 pr-3 py-1.5 bg-gray-200/50 border border-transparent focus:border-green-100 focus:bg-white focus:ring-4 focus:ring-green-500/5 rounded-xl transition-all duration-300 font-bold text-gray-900 placeholder:text-gray-400 text-xs"
							/>
						</div>

						<div className="relative">
							<select
								value={statusFilter}
								onChange={handleStatusFilter}
								className="w-full px-3 py-1.5 bg-gray-200/50 border border-transparent focus:border-green-100 focus:bg-white focus:ring-4 focus:ring-green-500/5 rounded-xl transition-all duration-300 font-bold text-gray-900 appearance-none cursor-pointer text-xs"
							>
								<option value="">Tous les statuts</option>
								<option value="pending-review">En attente (À valider)</option>
								<option value="approved">Approuvé</option>
								<option value="draft">Brouillon</option>
								<option value="rejected">Rejeté</option>
								<option value="inactive">Inactif</option>
							</select>
						</div>

						<div className="relative">
							<select
								value={categoryFilter}
								onChange={handleCategoryFilter}
								className="w-full px-3 py-1.5 bg-gray-200/50 border border-transparent focus:border-green-100 focus:bg-white focus:ring-4 focus:ring-green-500/5 rounded-xl transition-all duration-300 font-bold text-gray-900 appearance-none cursor-pointer text-xs"
							>
								<option value="">Toutes catégories</option>
								<option value="fruits">Fruits</option>
								<option value="vegetables">Légumes</option>
								<option value="grains">Céréales</option>
								<option value="herbs">Herbes</option>
								<option value="other">Autres</option>
							</select>
						</div>

						<div className="relative">
							<select
								value={featuredFilter}
								onChange={handleFeaturedFilter}
								className="w-full px-3 py-1.5 bg-gray-200/50 border border-transparent focus:border-green-100 focus:bg-white focus:ring-4 focus:ring-green-500/5 rounded-xl transition-all duration-300 font-bold text-gray-900 appearance-none cursor-pointer text-xs"
							>
								<option value="">Tous les produits</option>
								<option value="featured">En vedette</option>
								<option value="not-featured">Non en vedette</option>
							</select>
						</div>

						<button className="flex items-center justify-center px-4 py-1.5 bg-gray-200/50 hover:bg-white border border-transparent hover:border-gray-100 rounded-xl transition-all duration-300 text-gray-600 font-black text-[9px] uppercase tracking-widest gap-2">
							<Filter className="h-3.5 w-3.5" />
							Plus
						</button>
					</div>
				</div>

				{/* Table des Produits Modernisée */}
				<div className="bg-white/70 backdrop-blur-xl rounded-[1rem] shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-white/60 overflow-hidden animate-fade-in-up delay-200">
					<div className="p-3.5 border-b border-gray-200/50 flex items-center justify-between bg-white/30">
						<div>
							<h3 className="text-sm font-[1000] text-gray-900 tracking-tight">
								Liste des Articles
							</h3>
							<p className="text-[8px] font-black text-gray-400 mt-0.5 uppercase tracking-[0.2em]">
								Total: {products.length} produits trouvés
							</p>
						</div>
						{selectedProducts.length > 0 && (
							<div className="flex gap-2 animate-fade-in">
								<button className="px-2 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all duration-300">
									Approuver ({selectedProducts.length})
								</button>
								<button className="px-2 py-1 bg-rose-50 text-rose-600 border border-rose-100 rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all duration-300">
									Rejeter ({selectedProducts.length})
								</button>
							</div>
						)}
					</div>

					<div className="overflow-x-auto">
						<table className="w-full">
							<thead>
								<tr className="border-b border-gray-200/50">
									<th className="px-4 py-2.5 text-left">
										<input
											type="checkbox"
											checked={
												selectedProducts.length === products.length &&
												products.length > 0
											}
											onChange={handleSelectAll}
											className="w-3.5 h-3.5 border-2 border-gray-200 rounded-md bg-white checked:bg-green-600 checked:border-green-600 transition-all cursor-pointer appearance-none"
										/>
									</th>
									<th className="px-4 py-2.5 text-left text-[9px] font-black text-gray-400 uppercase tracking-widest">
										Produit
									</th>
									<th className="px-4 py-2.5 text-left text-[9px] font-black text-gray-400 uppercase tracking-widest">
										Producteur
									</th>
									<th className="px-4 py-2.5 text-left text-[9px] font-black text-gray-400 uppercase tracking-widest">
										Prix
									</th>
									<th className="px-4 py-2.5 text-left text-[9px] font-black text-gray-400 uppercase tracking-widest">
										Statut
									</th>
									<th className="px-4 py-2.5 text-left text-[9px] font-black text-gray-400 uppercase tracking-widest">
										Date
									</th>
									<th className="px-4 py-2.5 text-right text-[9px] font-black text-gray-400 uppercase tracking-widest">
										Actions
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-200/50">
								{products.length === 0 ? (
									<tr>
										<td colSpan="7" className="px-6 py-10 text-center">
											<div className="flex flex-col items-center">
												<div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-2">
													<Package className="h-6 w-6 text-gray-300" />
												</div>
												<p className="text-base font-[1000] text-gray-900 tracking-tight">
													Aucun produit trouvé
												</p>
											</div>
										</td>
									</tr>
								) : (
									products.map((product) => (
										<tr
											key={product._id}
											className="group hover:bg-gray-50/50 transition-colors duration-300"
										>
											<td className="px-4 py-2">
												<input
													type="checkbox"
													checked={selectedProducts.includes(product._id)}
													onChange={() => handleSelectProduct(product._id)}
													className="w-3.5 h-3.5 border-2 border-gray-200 rounded-md bg-white checked:bg-green-600 checked:border-green-600 transition-all cursor-pointer appearance-none"
												/>
											</td>
											<td className="px-4 py-2">
												<div className="flex items-center gap-2.5">
													<div className="h-8 w-8 rounded-lg overflow-hidden border border-gray-100 shadow-sm flex-shrink-0 relative">
														<CloudinaryImage
															src={
																product.images?.[0]?.url ||
																product.primaryImage?.url
															}
															alt={getLocalizedText(product.name)}
															className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
														/>
														{product.isFeatured && (
															<div className="absolute top-0.5 right-0.5 bg-yellow-400 p-0.5 rounded shadow-sm">
																<Star className="h-1.5 w-1.5 text-white fill-current" />
															</div>
														)}
													</div>
													<div>
														<p className="text-xs font-black text-gray-900 tracking-tight leading-tight mb-0.5 group-hover:text-green-600 transition-colors">
															{getLocalizedText(product.name, "Sans nom")}
														</p>
														<span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">
															{product.category}
														</span>
													</div>
												</div>
											</td>
											<td className="px-4 py-2">
												<div className="flex items-center gap-2">
													<div className="h-4 w-4 rounded bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
														<User className="h-2 w-2" />
													</div>
													<div>
														<p className="text-[9px] font-black text-gray-900 tracking-tight leading-none mb-0.5">
															{product.producer?.farmName ||
																`${product.producer?.firstName} ${product.producer?.lastName}`}
														</p>
														<div className="flex items-center gap-1 text-[7px] font-bold text-gray-400">
															<MapPin className="h-2 w-2" />
															{product.producer?.address?.city ||
																"Localisation..."}
														</div>
													</div>
												</div>
											</td>
											<td className="px-4 py-2">
												<p className="text-xs font-[1000] text-gray-900 tracking-tighter">
													{formatPrice(product.price, product.currency)}
												</p>
											</td>
											<td className="px-4 py-2">
												<span
													className={`inline-flex px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${getStatusColor(
														product.status
													)}`}
												>
													{getStatusText(product.status)}
												</span>
											</td>
											<td className="px-4 py-2">
												<div className="flex items-center gap-1 text-[8px] font-black text-gray-400 uppercase tracking-widest">
													<Calendar className="h-2.5 w-2.5" />
													{formatDate(product.createdAt)}
												</div>
											</td>
											<td className="px-4 py-2 text-right">
												<div className="flex items-center justify-end gap-1">
													<Link
														to={`/admin/products/${product._id}`}
														className="p-1.5 bg-gray-100 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300 border border-transparent hover:border-blue-100"
														title="Voir détails"
													>
														<Eye className="h-3 w-3" />
													</Link>

													{product.status === "pending-review" && (
														<>
															<button
																onClick={() =>
																	handleApproveProduct(product._id)
																}
																className="p-1 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded transition-all duration-300 border border-emerald-100"
																title="Approuver"
															>
																<CheckCircle className="h-3 w-3" />
															</button>
															<button
																onClick={() => handleRejectProduct(product._id)}
																className="p-1 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded transition-all duration-300 border border-rose-100"
																title="Rejeter"
															>
																<XCircle className="h-3 w-3" />
															</button>
														</>
													)}

													{product.status === "approved" && (
														<button
															onClick={() => handleFeatureProduct(product._id)}
															className={`p-1.5 rounded-lg transition-all duration-300 border ${
																product.isFeatured
																	? "bg-amber-50 text-amber-500 border-amber-100 hover:bg-amber-500 hover:text-white"
																	: "bg-gray-100 text-gray-400 border-transparent hover:border-amber-100 hover:text-amber-500 hover:bg-amber-50"
															}`}
															title={
																product.isFeatured
																	? "Retirer des vedettes"
																	: "Mettre en vedette"
															}
														>
															<Star
																className={`h-3 w-3 ${
																	product.isFeatured ? "fill-current" : ""
																}`}
															/>
														</button>
													)}
												</div>
											</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>

					{/* Pagination Style Premium */}
					<div className="p-3 border-t border-gray-100/50 bg-white/30 flex items-center justify-between">
						<p className="text-[8px] font-black text-gray-400 uppercase tracking-[0.2em]">
							Page{" "}
							<span className="text-gray-900 font-black">{currentPage}</span>{" "}
							sur {totalPages}
						</p>
						<div className="flex gap-1.5">
							<button
								onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
								disabled={currentPage === 1}
								className="px-2.5 py-1.5 bg-white text-gray-500 rounded-lg text-[8px] font-black uppercase tracking-widest border border-gray-100 hover:bg-gray-900 hover:text-white transition-all duration-300 shadow-sm"
							>
								Précédent
							</button>
							<button
								onClick={() =>
									setCurrentPage((prev) => Math.min(prev + 1, totalPages))
								}
								disabled={currentPage === totalPages}
								className="px-2.5 py-1.5 bg-white text-gray-500 rounded-lg text-[8px] font-black uppercase tracking-widest border border-gray-100 hover:bg-gray-900 hover:text-white transition-all duration-300 shadow-sm"
							>
								Suivant
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AdminProducts;
