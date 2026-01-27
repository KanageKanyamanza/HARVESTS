import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { producerService } from "../../../services";
import { useNotifications } from "../../../contexts/NotificationContext";
import ModularDashboardLayout from "../../../components/layout/ModularDashboardLayout";
import ProductImageManager from "../../../components/common/ProductImageManager";
import {
	FiSave,
	FiPackage,
	FiDollarSign,
	FiTag,
	FiAlignLeft,
	FiArrowLeft,
	FiLayers,
	FiImage,
	FiDatabase,
} from "react-icons/fi";
import { CURRENCIES, DEFAULT_CURRENCY } from "../../../config/currencies";
import { UNITS, DEFAULT_UNIT } from "../../../config/units";

const AddProduct = () => {
	const { showSuccess, showError } = useNotifications();
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);
	const [uploadingImages, setUploadingImages] = useState(false);
	const [productImages, setProductImages] = useState([]);
	const [product, setProduct] = useState({
		name: "",
		description: "",
		price: "",
		currency: DEFAULT_CURRENCY,
		category: "",
		stock: "",
		unit: DEFAULT_UNIT,
	});

	const categories = [
		{ value: "cereals", label: "Céréales" },
		{ value: "vegetables", label: "Légumes" },
		{ value: "fruits", label: "Fruits" },
		{ value: "legumes", label: "Légumineuses" },
		{ value: "tubers", label: "Tubercules" },
		{ value: "spices", label: "Épices" },
		{ value: "herbs", label: "Herbes" },
		{ value: "nuts", label: "Noix" },
		{ value: "seeds", label: "Graines" },
		{ value: "dairy", label: "Produits laitiers" },
		{ value: "meat", label: "Viande" },
		{ value: "poultry", label: "Volaille" },
		{ value: "fish", label: "Poisson" },
		{ value: "processed-foods", label: "Aliments transformés" },
		{ value: "beverages", label: "Boissons" },
		{ value: "other", label: "Autres" },
	];

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setProduct((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (
			!product.name ||
			!product.description ||
			!product.category ||
			!product.price ||
			!product.stock
		) {
			showError("Veuillez remplir tous les champs obligatoires");
			return;
		}

		try {
			setLoading(true);

			const productData = {
				...product,
				images: productImages,
				status: "draft",
			};

			await producerService.createProduct(productData);
			showSuccess("Produit créé avec succès");
			navigate("/producer/products");
		} catch (error) {
			console.error("Erreur lors de la création du produit:", error);
			showError("Erreur lors de la création du produit");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen relative overflow-hidden pb-10">
			{/* Background radial glows */}
			<div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden ">
				<div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-100/30 rounded-full blur-[120px]"></div>
				<div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-blue-100/20 rounded-full blur-[100px]"></div>
				<div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] bg-amber-50/30 rounded-full blur-[120px]"></div>
			</div>

			<div className="max-w-5xl mx-auto p-4 md:p-5 relative z-10">
				{/* Header with Breadcrumb-like Feel */}
				<div className="mb-4 animate-fade-in-down">
					<button
						onClick={() => navigate(-1)}
						className="flex items-center text-gray-400 hover:text-gray-900 transition-colors mb-2 text-[10px] font-bold uppercase tracking-widest group"
					>
						<FiArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" />
						Retour au catalogue
					</button>

					<div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
						<div>
							<h1 className="text-2xl md:text-3xl font-[1000] text-gray-900 tracking-tighter leading-tight mb-1">
								Nouveau{" "}
								<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
									Produit.
								</span>
							</h1>
							<p className="text-xs font-medium text-gray-500">
								Ajoutez une nouvelle référence à votre catalogue et commencez à
								vendre.
							</p>
						</div>
					</div>
				</div>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
						{/* Left Column: Main Info */}
						<div className="lg:col-span-2 space-y-4 animate-fade-in-up delay-100">
							{/* Section: General Info */}
							<div className="bg-white/70 backdrop-blur-xl rounded-[1.5rem] border border-white/60 shadow-sm p-4 md:p-5">
								<div className="flex items-center gap-3 mb-4">
									<div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-sm">
										<FiLayers className="w-4 h-4" />
									</div>
									<div>
										<h2 className="text-base font-[900] text-gray-900 leading-tight">
											Informations Générales
										</h2>
										<p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
											Détails de base du produit
										</p>
									</div>
								</div>

								<div className="space-y-4">
									<div>
										<label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1.5">
											Nom du produit <span className="text-red-500">*</span>
										</label>
										<div className="relative group">
											<FiPackage className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
											<input
												type="text"
												name="name"
												value={product.name}
												onChange={handleInputChange}
												required
												className="w-full pl-10 pr-3 py-2.5 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-bold text-gray-800 placeholder-gray-300 text-sm"
												placeholder="Ex: Tomates Bio"
											/>
										</div>
									</div>

									<div>
										<label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1.5">
											Description <span className="text-red-500">*</span>
										</label>
										<div className="relative group">
											<FiAlignLeft className="absolute left-3 top-3 h-4 w-4 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
											<textarea
												name="description"
												value={product.description}
												onChange={handleInputChange}
												required
												rows={4}
												className="w-full pl-10 pr-3 py-2.5 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-gray-800 placeholder-gray-300 resize-none text-sm"
												placeholder="Décrivez les caractéristiques, l'origine et la qualité de votre produit..."
											/>
										</div>
									</div>
								</div>
							</div>

							{/* Section: Media */}
							<div className="bg-white/70 backdrop-blur-xl rounded-[1.5rem] border border-white/60 shadow-sm p-4 md:p-5">
								<div className="flex items-center gap-3 mb-4">
									<div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm">
										<FiImage className="w-4 h-4" />
									</div>
									<div>
										<h2 className="text-base font-[900] text-gray-900 leading-tight">
											Médias
										</h2>
										<p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
											Photos du produit
										</p>
									</div>
								</div>

								<div className="bg-white/50 rounded-xl p-3 border border-dashed border-gray-300 hover:border-emerald-400 transition-colors">
									<ProductImageManager
										images={productImages}
										onImagesChange={setProductImages}
										maxImages={5}
										uploading={uploadingImages}
										setUploading={setUploadingImages}
										errors={{}}
									/>
								</div>
							</div>
						</div>

						{/* Right Column: Settings & Price */}
						<div className="space-y-4 animate-fade-in-up delay-200">
							<div className="bg-white/70 backdrop-blur-xl rounded-[1.5rem] border border-white/60 shadow-sm p-4 md:p-5">
								<div className="flex items-center gap-3 mb-4">
									<div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 shadow-sm">
										<FiDatabase className="w-4 h-4" />
									</div>
									<div>
										<h2 className="text-base font-[900] text-gray-900 leading-tight">
											Détails de Vente
										</h2>
										<p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
											Prix et inventaire
										</p>
									</div>
								</div>

								<div className="space-y-4">
									<div>
										<label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1.5">
											Catégorie <span className="text-red-500">*</span>
										</label>
										<div className="relative group">
											<FiTag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
											<select
												name="category"
												value={product.category}
												onChange={handleInputChange}
												required
												className="w-full pl-10 pr-3 py-2.5 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-bold text-gray-800 appearance-none cursor-pointer text-sm"
											>
												<option value="">Sélectionner...</option>
												{categories.map((category) => (
													<option key={category.value} value={category.value}>
														{category.label}
													</option>
												))}
											</select>
											<div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
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

									<div className="grid grid-cols-2 gap-3">
										<div>
											<label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1.5">
												Prix <span className="text-red-500">*</span>
											</label>
											<div className="relative group">
												<FiDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
												<input
													type="number"
													name="price"
													value={product.price}
													onChange={handleInputChange}
													required
													min="0"
													step="0.01"
													className="w-full pl-8 pr-3 py-2.5 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-bold text-gray-800 text-sm"
													placeholder="0.00"
												/>
											</div>
										</div>
										<div>
											<label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1.5">
												Devise
											</label>
											<select
												name="currency"
												value={product.currency}
												onChange={handleInputChange}
												className="w-full px-3 py-2.5 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-bold text-gray-600 text-sm"
											>
												{CURRENCIES.map((currency) => (
													<option key={currency.code} value={currency.code}>
														{currency.code}
													</option>
												))}
											</select>
										</div>
									</div>

									<div className="grid grid-cols-2 gap-3">
										<div>
											<label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1.5">
												Stock <span className="text-red-500">*</span>
											</label>
											<input
												type="number"
												name="stock"
												value={product.stock}
												onChange={handleInputChange}
												required
												min="0"
												className="w-full px-3 py-2.5 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-bold text-gray-800 text-sm"
												placeholder="0"
											/>
										</div>
										<div>
											<label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1.5">
												Unité
											</label>
											<select
												name="unit"
												value={product.unit}
												onChange={handleInputChange}
												className="w-full px-3 py-2.5 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-bold text-gray-600 text-sm"
											>
												{UNITS.map((unit) => (
													<option key={unit.value} value={unit.value}>
														{unit.label}
													</option>
												))}
											</select>
										</div>
									</div>
								</div>
							</div>

							{/* Info Box */}
							<div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100 flex gap-3">
								<div className="mt-1 min-w-[20px] text-blue-500">
									<svg
										className="w-5 h-5"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
										/>
									</svg>
								</div>
								<p className="text-xs text-blue-700 leading-relaxed font-medium">
									Une fois créé, votre produit sera en statut{" "}
									<span className="font-bold">Brouillon</span>. Vous pourrez le
									publier pour validation par nos équipes depuis votre
									catalogue.
								</p>
							</div>

							{/* Actions */}
							<div className="pt-2 flex flex-col gap-3">
								<button
									type="submit"
									disabled={loading}
									className="w-full inline-flex items-center justify-center px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-sm uppercase tracking-widest rounded-xl hover:shadow-lg hover:shadow-emerald-200 transition-all disabled:opacity-50 hover:-translate-y-1"
								>
									{loading ?
										<>
											<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
											Création...
										</>
									:	<>
											<FiSave className="h-4 w-4 mr-2" />
											Enregistrer le produit
										</>
									}
								</button>
								<button
									type="button"
									onClick={() => navigate(-1)}
									className="w-full inline-flex items-center justify-center px-6 py-3 border border-gray-200 text-gray-600 font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-gray-50 transition-colors"
								>
									Annuler
								</button>
							</div>
						</div>
					</div>
				</form>
			</div>
		</div>
	);
};

export default AddProduct;
