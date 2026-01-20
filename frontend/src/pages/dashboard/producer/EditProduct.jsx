import React from "react";
import { useNavigate } from "react-router-dom";
import ModularDashboardLayout from "../../../components/layout/ModularDashboardLayout";
import CloudinaryImage from "../../../components/common/CloudinaryImage";
import ProductImageUpload from "../../../components/common/ProductImageUpload";
import {
	FiSave,
	FiArrowLeft,
	FiPackage,
	FiDollarSign,
	FiTag,
	FiAlignLeft,
	FiLayers,
	FiImage,
	FiDatabase,
	FiX,
	FiChevronLeft,
	FiChevronRight,
	FiAlertCircle,
} from "react-icons/fi";
import { useEditProduct } from "../../../hooks/useEditProduct";
import { CURRENCIES } from "../../../config/currencies";
import { UNITS } from "../../../config/units";

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

const EditProduct = () => {
	const navigate = useNavigate();
	const {
		product,
		loading,
		saving,
		errors,
		formData,
		productImages,
		uploadingImages,
		setUploadingImages,
		handleInputChange,
		handleImageAdd,
		handleImageRemove,
		handleImageReorder,
		handleSubmit,
	} = useEditProduct();

	if (loading) {
		return (
			<ModularDashboardLayout userType="producer">
				<div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4">
					<div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
					<p className="text-xs font-black text-gray-400 uppercase tracking-widest">
						Chargement du produit...
					</p>
				</div>
			</ModularDashboardLayout>
		);
	}

	if (!product) {
		return (
			<ModularDashboardLayout userType="producer">
				<div className="max-w-xl mx-auto mt-20 p-10 bg-white/70 backdrop-blur-xl rounded-[2.5rem] border border-white/60 shadow-xl text-center">
					<div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6 text-rose-500">
						<FiAlertCircle className="w-10 h-10" />
					</div>
					<h1 className="text-2xl font-[1000] text-gray-900 mb-2 tracking-tight">
						Produit Erroné
					</h1>
					<p className="text-gray-500 font-medium mb-8">
						Nous n'avons pas pu trouver la référence demandée. Elle a peut-être
						été supprimée.
					</p>
					<button
						onClick={() => navigate("/producer/products")}
						className="inline-flex items-center px-8 py-3 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-emerald-600"
					>
						<FiArrowLeft className="mr-2" />
						Retour au catalogue
					</button>
				</div>
			</ModularDashboardLayout>
		);
	}

	return (
		<ModularDashboardLayout userType="producer">
			<div className="min-h-screen relative overflow-hidden pb-10">
				{/* Background radial glows */}
				<div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden ">
					<div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-100/30 rounded-full blur-[120px]"></div>
					<div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-blue-100/20 rounded-full blur-[100px]"></div>
				</div>

				<div className="max-w-5xl mx-auto p-4 md:p-5 relative z-10">
					{/* Header */}
					<div className="mb-6 animate-fade-in-down">
						<button
							onClick={() => navigate(-1)}
							className="flex items-center text-gray-400 hover:text-gray-900 transition-colors mb-2 text-[10px] font-bold uppercase tracking-widest group"
						>
							<FiArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" />
							Retour
						</button>

						<div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
							<div>
								<h1 className="text-2xl md:text-3xl font-[1000] text-gray-900 tracking-tighter leading-tight mb-1">
									Modifier{" "}
									<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
										Product.
									</span>
								</h1>
								<p className="text-xs font-medium text-gray-500 flex items-center gap-2">
									ID:{" "}
									<span className="text-gray-900 font-black">
										#{product._id.slice(-8).toUpperCase()}
									</span>
								</p>
							</div>
						</div>
					</div>

					{errors.submit && (
						<div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-xs font-bold animate-shake flex items-center gap-3">
							<FiAlertCircle className="shrink-0" />
							{errors.submit}
						</div>
					)}

					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
							{/* Left Column: Main Info */}
							<div className="lg:col-span-2 space-y-4 animate-fade-in-up delay-100">
								{/* Section: General Info */}
								<div className="bg-white/70 backdrop-blur-xl rounded-[1.5rem] border border-white/60 shadow-sm p-4 md:p-6">
									<div className="flex items-center gap-3 mb-6">
										<div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-sm">
											<FiLayers className="w-4 h-4" />
										</div>
										<div>
											<h2 className="text-base font-[900] text-gray-900 leading-tight">
												Détails Essentiels
											</h2>
											<p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
												Nom et description publique
											</p>
										</div>
									</div>

									<div className="space-y-5">
										<div>
											<label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1.5 ml-1">
												Nom du produit <span className="text-rose-500">*</span>
											</label>
											<div className="relative group">
												<FiPackage className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
												<input
													type="text"
													name="name"
													value={formData.name}
													onChange={handleInputChange}
													className={`w-full pl-11 pr-4 py-3 bg-white/50 border rounded-2xl focus:outline-none focus:ring-4 transition-all font-bold text-gray-800 text-sm ${
														errors.name ?
															"border-rose-300 ring-rose-500/5"
														:	"border-gray-100 focus:ring-emerald-500/5 focus:border-emerald-500/50"
													}`}
													placeholder="Ex: Tomates Cerises Bio"
												/>
											</div>
											{errors.name && (
												<p className="mt-1.5 ml-1 text-[10px] font-bold text-rose-500">
													{errors.name}
												</p>
											)}
										</div>

										<div>
											<label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1.5 ml-1">
												Description <span className="text-rose-500">*</span>
											</label>
											<div className="relative group">
												<FiAlignLeft className="absolute left-4 top-4 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
												<textarea
													name="description"
													value={formData.description}
													onChange={handleInputChange}
													rows={5}
													className={`w-full pl-11 pr-4 py-3 bg-white/50 border rounded-2xl focus:outline-none focus:ring-4 transition-all font-medium text-gray-800 text-sm resize-none ${
														errors.description ?
															"border-rose-300 ring-rose-500/5"
														:	"border-gray-100 focus:ring-emerald-500/5 focus:border-emerald-500/50"
													}`}
													placeholder="Décrivez votre produit en quelques mots..."
												/>
											</div>
											{errors.description && (
												<p className="mt-1.5 ml-1 text-[10px] font-bold text-rose-500">
													{errors.description}
												</p>
											)}
										</div>
									</div>
								</div>

								{/* Section: Images */}
								<div className="bg-white/70 backdrop-blur-xl rounded-[1.5rem] border border-white/60 shadow-sm p-4 md:p-6">
									<div className="flex items-center gap-3 mb-6">
										<div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm">
											<FiImage className="w-4 h-4" />
										</div>
										<div>
											<h2 className="text-base font-[900] text-gray-900 leading-tight">
												Galerie Photo
											</h2>
											<p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
												Jusqu'à 5 images de haute qualité
											</p>
										</div>
									</div>

									<div className="space-y-6">
										<div className="bg-gray-50/50 rounded-2xl p-4 border border-dashed border-gray-200 hover:border-emerald-300 transition-all">
											<ProductImageUpload
												onImageUpload={handleImageAdd}
												uploading={uploadingImages}
												setUploading={setUploadingImages}
												maxImages={5}
												currentCount={productImages.length}
											/>
										</div>

										{productImages.length > 0 && (
											<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
												{productImages.map((image, index) => (
													<div
														key={index}
														className="relative group aspect-square rounded-xl overflow-hidden border border-gray-100 shadow-sm"
													>
														<CloudinaryImage
															src={image.url}
															alt={image.alt || `Image ${index + 1}`}
															className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500"
														/>
														{/* Overlay Controls */}
														<div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
															<div className="flex gap-1.5">
																{index > 0 && (
																	<button
																		type="button"
																		onClick={() =>
																			handleImageReorder(index, index - 1)
																		}
																		className="w-8 h-8 bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center text-white hover:bg-white hover:text-gray-900 transition-all"
																	>
																		<FiChevronLeft />
																	</button>
																)}
																{index < productImages.length - 1 && (
																	<button
																		type="button"
																		onClick={() =>
																			handleImageReorder(index, index + 1)
																		}
																		className="w-8 h-8 bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center text-white hover:bg-white hover:text-gray-900 transition-all"
																	>
																		<FiChevronRight />
																	</button>
																)}
															</div>
															<button
																type="button"
																onClick={() => handleImageRemove(index)}
																className="w-10 h-10 bg-rose-500 rounded-full flex items-center justify-center text-white hover:bg-rose-600 hover:scale-110 transition-all shadow-lg"
															>
																<FiX className="w-5 h-5" />
															</button>
														</div>
														{image.isPrimary && (
															<div className="absolute top-2 left-2 px-2 py-0.5 bg-emerald-500 text-white text-[8px] font-black uppercase tracking-widest rounded-md">
																Principale
															</div>
														)}
													</div>
												))}
											</div>
										)}
									</div>
								</div>
							</div>

							{/* Right Column: Pricing & Category */}
							<div className="space-y-4 animate-fade-in-up delay-200">
								<div className="bg-white/70 backdrop-blur-xl rounded-[1.5rem] border border-white/60 shadow-sm p-4 md:p-6">
									<div className="flex items-center gap-3 mb-6">
										<div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 shadow-sm">
											<FiDatabase className="w-4 h-4" />
										</div>
										<div>
											<h2 className="text-base font-[900] text-gray-900 leading-tight">
												Vente & Stock
											</h2>
											<p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
												Paramètres commerciaux
											</p>
										</div>
									</div>

									<div className="space-y-4">
										<div>
											<label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1.5 ml-1">
												Catégorie <span className="text-rose-500">*</span>
											</label>
											<div className="relative group">
												<FiTag className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500" />
												<select
													name="category"
													value={formData.category}
													onChange={handleInputChange}
													className={`w-full pl-11 pr-10 py-3 bg-white/50 border rounded-2xl focus:outline-none focus:ring-4 transition-all font-bold text-gray-800 text-sm appearance-none cursor-pointer ${
														errors.category ?
															"border-rose-300 ring-rose-500/5"
														:	"border-gray-100 focus:ring-emerald-500/5 focus:border-emerald-500/50"
													}`}
												>
													<option value="">Choisir...</option>
													{categories.map((cat) => (
														<option key={cat.value} value={cat.value}>
															{cat.label}
														</option>
													))}
												</select>
												<div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400">
													<svg
														className="w-4 h-4"
														fill="none"
														viewBox="0 0 24 24"
														stroke="currentColor"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={3}
															d="M19 9l-7 7-7-7"
														/>
													</svg>
												</div>
											</div>
											{errors.category && (
												<p className="mt-1.5 ml-1 text-[10px] font-bold text-rose-500">
													{errors.category}
												</p>
											)}
										</div>

										<div className="grid grid-cols-2 gap-3">
											<div>
												<label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1.5 ml-1">
													Prix <span className="text-rose-500">*</span>
												</label>
												<div className="relative group">
													<FiDollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
													<input
														type="number"
														name="price"
														value={formData.price}
														onChange={handleInputChange}
														className="w-full pl-9 pr-3 py-3 bg-white/50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/50 transition-all font-black text-gray-800 text-sm"
														placeholder="0"
													/>
												</div>
											</div>
											<div>
												<label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1.5 ml-1">
													Devise
												</label>
												<select
													name="currency"
													value={formData.currency}
													onChange={handleInputChange}
													className="w-full px-4 py-3 bg-white/50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/50 transition-all font-bold text-gray-600 text-sm appearance-none"
												>
													{CURRENCIES.map((c) => (
														<option key={c.code} value={c.code}>
															{c.code}
														</option>
													))}
												</select>
											</div>
										</div>

										<div className="grid grid-cols-2 gap-3">
											<div>
												<label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1.5 ml-1">
													Stock <span className="text-rose-500">*</span>
												</label>
												<input
													type="number"
													name="stock"
													value={formData.stock}
													onChange={handleInputChange}
													className="w-full px-4 py-3 bg-white/50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/50 transition-all font-black text-gray-800 text-sm"
													placeholder="0"
												/>
											</div>
											<div>
												<label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1.5 ml-1">
													Unité
												</label>
												<select
													name="unit"
													value={formData.unit}
													onChange={handleInputChange}
													className="w-full px-4 py-3 bg-white/50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/50 transition-all font-bold text-gray-600 text-sm"
												>
													{UNITS.map((u) => (
														<option key={u.value} value={u.value}>
															{u.label}
														</option>
													))}
												</select>
											</div>
										</div>

										<div>
											<label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1.5 ml-1">
												Cycle de Vie
											</label>
											<select
												name="status"
												value={formData.status}
												onChange={handleInputChange}
												className="w-full px-4 py-3 bg-white/50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/50 transition-all font-bold text-gray-600 text-sm"
											>
												<option value="draft">Brouillon</option>
												<option value="pending-review">
													En attente de révision
												</option>
												<option value="approved">Approuvé (Public)</option>
												<option value="inactive">Inactif</option>
											</select>
										</div>
									</div>
								</div>

								{/* Action Box */}
								<div className="bg-emerald-600 rounded-[2rem] p-6 text-white shadow-xl shadow-emerald-200/50 relative overflow-hidden group">
									<div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
										<FiSave className="w-24 h-24" />
									</div>
									<div className="relative z-10 space-y-4">
										<p className="text-[10px] font-black text-emerald-200 uppercase tracking-[0.2em]">
											Validation Finale
										</p>
										<h3 className="text-xl font-[1000] tracking-tight leading-tight">
											Prêt à diffuser vos changements ?
										</h3>
										<div className="pt-2 flex flex-col gap-3">
											<button
												type="submit"
												disabled={saving}
												className="w-full inline-flex items-center justify-center px-6 py-4 bg-white text-emerald-600 font-black text-[10px] uppercase tracking-widest rounded-xl hover:shadow-xl hover:-translate-y-1 transition-all disabled:opacity-50"
											>
												{saving ?
													<div className="flex items-center gap-2">
														<div className="w-3 h-3 border-2 border-emerald-600/20 border-t-emerald-600 rounded-full animate-spin"></div>
														<span>Sauvegarde...</span>
													</div>
												:	<>
														<FiSave className="mr-2 h-4 w-4" />
														Enregistrer les modifications
													</>
												}
											</button>
											<button
												type="button"
												onClick={() => navigate("/producer/products")}
												className="w-full inline-flex items-center justify-center px-6 py-3 bg-emerald-500/20 border border-emerald-400/30 text-white font-bold text-[10px] uppercase tracking-widest rounded-xl hover:bg-emerald-500/40 transition-all"
											>
												Annuler
											</button>
										</div>
									</div>
								</div>
							</div>
						</div>
					</form>
				</div>
			</div>
		</ModularDashboardLayout>
	);
};

export default EditProduct;
