import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import { producerService } from "../../../services";
import ModularDashboardLayout from "../../../components/layout/ModularDashboardLayout";
import CloudinaryImage from "../../../components/common/CloudinaryImage";
import {
	FiSearch,
	FiPlus,
	FiEdit,
	FiEye,
	FiTrash2,
	FiPackage,
	FiCheckCircle,
	FiXCircle,
	FiClock,
	FiSend,
	FiStar,
	FiFilter,
	FiMoreVertical,
} from "react-icons/fi";

import { toPlainText } from "../../../utils/textHelpers";
import { formatPrice } from "../../../utils/currencyUtils";

const MyProducts = () => {
	const { user } = useAuth();
	const [products, setProducts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");

	useEffect(() => {
		const loadProducts = async () => {
			if (user?.userType === "producer") {
				try {
					setLoading(true);
					const response = await producerService.getProducts({
						status: statusFilter !== "all" ? statusFilter : undefined,
						search: searchTerm || undefined,
						sort: "-createdAt",
					});
					const productsData =
						response.data.data?.products ||
						response.data.products ||
						response.data ||
						[];

					// Handle both Mongoose documents and plain objects
					const formattedProducts =
						Array.isArray(productsData) ?
							productsData.map((product) => ({
								...product,
								name: toPlainText(product.name, ""),
								description: toPlainText(product.description, ""),
							}))
						:	[];
					setProducts(formattedProducts);
				} catch (error) {
					console.error("Erreur lors du chargement des produits:", error);
					setProducts([]);
				} finally {
					setLoading(false);
				}
			}
		};
		loadProducts();
	}, [user, statusFilter, searchTerm]);

	const getStatusConfig = (status) => {
		const configs = {
			approved: {
				color: "bg-emerald-100 text-emerald-700 border-emerald-200",
				text: "Publié",
				icon: FiCheckCircle,
			},
			"pending-review": {
				color: "bg-amber-100 text-amber-700 border-amber-200",
				text: "En révision",
				icon: FiClock,
			},
			draft: {
				color: "bg-slate-100 text-slate-700 border-slate-200",
				text: "Brouillon",
				icon: FiEdit,
			},
			rejected: {
				color: "bg-red-100 text-red-700 border-red-200",
				text: "Rejeté",
				icon: FiXCircle,
			},
			inactive: {
				color: "bg-gray-100 text-gray-700 border-gray-200",
				text: "Inactif",
				icon: FiXCircle,
			},
		};
		return configs[status] || configs["draft"];
	};

	const handleDeleteProduct = async (productId) => {
		if (window.confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) {
			try {
				await producerService.deleteProduct(productId);
				setProducts(products.filter((p) => p._id !== productId));
			} catch (error) {
				console.error("Erreur lors de la suppression:", error);
				alert("Erreur lors de la suppression du produit");
			}
		}
	};

	const handlePublishProduct = async (productId, e) => {
		e.preventDefault(); // Prevent navigation if button is inside Link
		if (
			window.confirm(
				"Êtes-vous sûr de vouloir publier ce produit ? Il sera soumis à révision.",
			)
		) {
			try {
				await producerService.updateProduct(productId, {
					status: "pending-review",
				});
				// Optimistic update
				setProducts(
					products.map((p) =>
						p._id === productId ? { ...p, status: "pending-review" } : p,
					),
				);

				// Background refresh
				const response = await producerService.getProducts();
				const productsData =
					response.data.data?.products || response.data.products || [];
				setProducts(Array.isArray(productsData) ? productsData : []);

				alert("Produit soumis à révision avec succès !");
			} catch (error) {
				console.error("Erreur lors de la publication:", error);
				alert("Erreur lors de la publication du produit");
			}
		}
	};

	// Skeleton Loader
	if (loading && products.length === 0) {
		return (
			<div className="min-h-screen relative overflow-hidden p-6 md:p-8 space-y-8">
				{/* Background Glows */}
				<div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
					<div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-50/40 rounded-full blur-[120px]"></div>
				</div>

				<div className="relative z-10 max-w-7xl mx-auto">
					<div className="flex justify-between items-center mb-10">
						<div className="h-10 bg-gray-200 rounded-xl w-64 animate-pulse"></div>
						<div className="h-10 bg-gray-200 rounded-xl w-40 animate-pulse"></div>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
						{[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
							<div
								key={i}
								className="bg-white/60 rounded-3xl h-[350px] animate-pulse"
							></div>
						))}
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen relative overflow-hidden">
			{/* Background radial glows */}
			<div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden ">
				<div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-100/30 rounded-full blur-[120px]"></div>
				<div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-blue-100/20 rounded-full blur-[100px]"></div>
				<div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] bg-amber-50/30 rounded-full blur-[120px]"></div>
			</div>

			<div className="relative z-10 p-6 md:p-8 max-w-[1600px] mx-auto space-y-8">
				{/* Header Section */}
				<div className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-fade-in-down">
					<div>
						<div className="flex items-center gap-2 text-emerald-600 font-black text-[9px] uppercase tracking-widest mb-2">
							<div className="w-5 h-[2px] bg-emerald-600"></div>
							<span>Catalogue</span>
						</div>
						<h1 className="text-3xl font-[1000] text-gray-900 tracking-tighter leading-none mb-2">
							Mes{" "}
							<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
								Produits.
							</span>
						</h1>
						<p className="text-xs text-gray-500 font-medium max-w-xl">
							Gérez votre inventaire, suivez vos stocks et mettez en valeur
							votre savoir-faire.
						</p>
					</div>

					<div className="flex flex-col items-end gap-2">
						{user?.subscriptionFeatures && (
							<div className="flex items-center gap-2 px-3 py-1.5 bg-white/50 border border-white/60 rounded-xl shadow-sm">
								<div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
								<span className="text-[10px] font-black text-gray-600 uppercase tracking-wider">
									Quota: {products.length} /{" "}
									{user.subscriptionFeatures.maxProducts === -1 ?
										"∞"
									:	user.subscriptionFeatures.maxProducts}
								</span>
							</div>
						)}
						<Link
							to={
								(
									user?.subscriptionFeatures?.maxProducts !== -1 &&
									products.length >= user?.subscriptionFeatures?.maxProducts
								) ?
									"#"
								:	"/producer/products/add"
							}
							onClick={(e) => {
								if (
									user?.subscriptionFeatures?.maxProducts !== -1 &&
									products.length >= user?.subscriptionFeatures?.maxProducts
								) {
									e.preventDefault();
									alert(
										`Limite atteinte (${user.subscriptionFeatures.maxProducts} produits). Passez au plan Standard ou Premium pour en ajouter plus !`,
									);
								}
							}}
							className={`group relative inline-flex items-center justify-center px-6 py-3 font-black text-xs uppercase tracking-widest rounded-2xl overflow-hidden transition-all duration-300 shadow-sm ${
								(
									user?.subscriptionFeatures?.maxProducts !== -1 &&
									products.length >= user?.subscriptionFeatures?.maxProducts
								) ?
									"bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-100"
								:	"bg-gray-900 text-white hover:bg-emerald-600 hover:shadow-emerald-200 hover:-translate-y-1"
							}`}
						>
							<span className="relative z-10 flex items-center gap-2">
								<FiPlus className="w-4 h-4" />
								Nouveau Produit
							</span>
						</Link>
					</div>
				</div>

				{/* Filters & Search Bar */}
				<div className="flex flex-col md:flex-row gap-4 animate-fade-in-up delay-100">
					<div className="relative flex-grow md:max-w-md group">
						<div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
							<FiSearch className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
						</div>
						<input
							type="text"
							placeholder="Rechercher par nom, catégorie..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="block w-full pl-11 pr-4 py-3.5 bg-white/70 backdrop-blur-xl border border-white/60 rounded-2xl text-sm font-bold text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm group-hover:shadow-md"
						/>
					</div>

					<div className="relative min-w-[200px]">
						<div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
							<FiFilter className="h-4 w-4 text-gray-400" />
						</div>
						<select
							value={statusFilter}
							onChange={(e) => setStatusFilter(e.target.value)}
							className="block w-full pl-10 pr-10 py-3.5 bg-white/70 backdrop-blur-xl border border-white/60 rounded-2xl text-xs font-bold uppercase tracking-wide text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm cursor-pointer appearance-none hover:bg-white"
						>
							<option value="all">Tous les statuts</option>
							<option value="approved">Publiés</option>
							<option value="pending-review">En révision</option>
							<option value="draft">Brouillons</option>
							<option value="rejected">Rejetés</option>
						</select>
						<div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
							<svg
								className="h-4 w-4 text-gray-400"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M19 9l-7 7-7-7"
								/>
							</svg>
						</div>
					</div>
				</div>

				{/* Products Grid */}
				{products.length === 0 && !loading ?
					<div className="bg-white/50 backdrop-blur-sm border-2 border-dashed border-gray-200 rounded-3xl p-12 text-center animate-fade-in-up">
						<div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
							<FiPackage className="h-10 w-10 text-gray-300" />
						</div>
						<h3 className="text-lg font-black text-gray-900 mb-2">
							Aucun produit trouvé
						</h3>
						<p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
							{searchTerm || statusFilter !== "all" ?
								"Essayez de modifier vos filtres ou votre recherche."
							:	"Commencez à vendre en ajoutant votre premier produit à votre catalogue."
							}
						</p>
						<Link
							to="/producer/products/add"
							className="inline-flex items-center px-5 py-2.5 bg-emerald-50 text-emerald-700 font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-emerald-100 transition-colors"
						>
							Ajouter un produit
						</Link>
					</div>
				:	<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in-up delay-200">
						{products.map((product) => {
							const statusConfig = getStatusConfig(product.status);
							const StatusIcon = statusConfig.icon;

							return (
								<div
									key={product._id}
									className="group bg-white/70 backdrop-blur-md rounded-[2rem] border border-white/60 shadow-[0_10px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] hover:border-white hover:-translate-y-1 transition-all duration-500 overflow-hidden flex flex-col h-full"
								>
									<div className="relative h-56 overflow-hidden">
										<div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 opacity-60 group-hover:opacity-40 transition-opacity"></div>

										{/* Status Badge */}
										<div className="absolute top-4 left-4 z-20">
											<span
												className={`inline-flex items-center px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${statusConfig.color} shadow-sm backdrop-blur-md bg-opacity-90`}
											>
												<StatusIcon className="w-3 h-3 mr-1.5" />
												{statusConfig.text}
											</span>
										</div>

										{/* Action Menu (Top Right) */}
										<div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
											<div className="flex flex-col gap-2">
												<Link
													to={`/producer/products/edit/${product._id}`}
													className="p-2 bg-white text-gray-700 rounded-full shadow-lg hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
													title="Modifier"
												>
													<FiEdit className="w-4 h-4" />
												</Link>
												<button
													onClick={() => handleDeleteProduct(product._id)}
													className="p-2 bg-white text-gray-700 rounded-full shadow-lg hover:bg-red-50 hover:text-red-500 transition-colors"
													title="Supprimer"
												>
													<FiTrash2 className="w-4 h-4" />
												</button>
											</div>
										</div>

										{product.images && product.images.length > 0 ?
											<CloudinaryImage
												src={product.images[0].url || product.images[0]}
												alt={product.name}
												className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
											/>
										:	<div className="w-full h-full bg-gray-100 flex items-center justify-center">
												<FiPackage className="h-12 w-12 text-gray-300" />
											</div>
										}
									</div>

									<div className="p-5 flex flex-col flex-grow relative">
										{/* Overlapping Price Tag */}
										<div className="absolute -top-6 right-5 bg-white px-4 py-2 rounded-2xl shadow-lg border border-gray-100 z-20">
											<span className="text-sm font-[1000] text-gray-900 tracking-tight">
												{formatPrice(product.price, product.currency)}
											</span>
										</div>

										<div className="mb-2">
											<span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] bg-emerald-50 px-2.5 py-1.5 rounded-lg inline-block">
												{product.category || "Produit"}
											</span>
										</div>

										<h3
											className="text-lg font-[1000] text-gray-900 mb-2 group-hover:text-emerald-700 transition-colors line-clamp-1 tracking-tight"
											title={product.name}
										>
											{product.name}
										</h3>

										<p className="text-[11px] font-medium text-gray-500 line-clamp-2 mb-6 flex-grow leading-relaxed">
											{product.description}
										</p>

										<div className="pt-5 border-t border-gray-100 flex items-center justify-between mt-auto">
											<div className="flex items-center text-gray-400 text-[10px] font-black uppercase tracking-widest">
												<FiPackage className="w-3.5 h-3.5 mr-1.5 text-emerald-500" />
												<span>
													Stock:{" "}
													<span
														className={
															product.stock < 10 ?
																"text-red-500"
															:	"text-gray-900"
														}
													>
														{product.stock}
													</span>
												</span>
											</div>

											{product.status === "draft" ?
												<button
													onClick={(e) => handlePublishProduct(product._id, e)}
													className="text-[10px] bg-emerald-100 hover:bg-emerald-600 hover:text-white px-5 py-2.5 rounded-xl font-black uppercase tracking-widest transition-all shadow-sm active:scale-95"
												>
													Publier
												</button>
											:	<Link
													to={`/products/${product._id}`}
													className="text-[10px] text-gray-400 hover:text-emerald-600 font-black uppercase tracking-widest transition-all flex items-center gap-1.5"
												>
													Détails <FiEye className="w-4 h-4" />
												</Link>
											}
										</div>
									</div>
								</div>
							);
						})}
					</div>
				}
			</div>
		</div>
	);
};

export default MyProducts;
