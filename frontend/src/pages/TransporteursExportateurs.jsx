import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
	exporterService,
	transporterService,
} from "../services";
import {
	FiMapPin,
	FiStar,
	FiTruck,
	FiArrowRight,
	FiGlobe,
	FiPackage,
	FiSearch,
	FiGrid,
	FiList,
} from "react-icons/fi";
import { Truck as TruckIcon, ShieldCheck } from "lucide-react";
import { getCountryName } from "../utils/countryMapper";
import LoadingSpinner from "../components/common/LoadingSpinner";
import SEOHead from "../components/seo/SEOHead";

const TransporteursExportateurs = () => {
	const [logistics, setLogistics] = useState([]);
	const [loading, setLoading] = useState(true);
	const [filter, setFilter] = useState("all"); // 'all', 'exporters', 'transporters'
	const [searchQuery, setSearchQuery] = useState("");
	const [viewMode, setViewMode] = useState(() => {
		return localStorage.getItem('preferred_view_mode') || 'grid';
	});

	const handleViewModeChange = (mode) => {
		setViewMode(mode);
		localStorage.setItem('preferred_view_mode', mode);
	};

	useEffect(() => {
		const loadLogistics = async () => {
			try {
				setLoading(true);

				const [exportersResponse, transportersAllResp, transportersLocalResp] = await Promise.allSettled([
					exporterService.getAllPublic({ limit: 24 }),
					transporterService.getAllPublic({ limit: 24, useLocation: 'false' }),
					transporterService.getAllPublic({ limit: 24, useLocation: 'true' }),
				]);

				const allLogistics = [];

				if (
					exportersResponse.status === "fulfilled" &&
					exportersResponse.value.data.status === "success"
				) {
					const exporters =
						exportersResponse.value.data.data.exporters || [];

					allLogistics.push(
						...exporters.map((exporter) => ({
							...exporter,
							type: "exporter",
							displayName: exporter.companyName || "Exportateur",
							profileUrl: `/exporters/${exporter._id}`,
							shopBanner: exporter.shopBanner,
							logo: exporter.shopLogo,
						}))
					);
				}

				const transportersAll = transportersAllResp.status === "fulfilled" && transportersAllResp.value.data.status === "success" ? transportersAllResp.value.data.data.transporters || [] : [];
				const transportersLocal = transportersLocalResp.status === "fulfilled" && transportersLocalResp.value.data.status === "success" ? transportersLocalResp.value.data.data.transporters || [] : [];
				const seen = new Set();
				const mergedTransporters = [];
				for (const t of transportersLocal) { mergedTransporters.push(t); seen.add(t._id); }
				for (const t of transportersAll) { if (!seen.has(t._id)) mergedTransporters.push(t); }

				allLogistics.push(...mergedTransporters.map((transporter) => ({
					...transporter,
					type: "transporter",
					displayName: transporter.companyName || "Transporteur",
					profileUrl: `/transporters/${transporter._id}`,
					shopBanner: transporter.shopBanner,
					logo: transporter.shopLogo,
				})));

				setLogistics(allLogistics);
			} catch (error) {
				console.error("Erreur lors du chargement des transporteurs et exportateurs:", error);
			} finally {
				setLoading(false);
			}
		};

		loadLogistics();
	}, []);

	const filteredLogistics = logistics.filter((item) => {
		if (filter !== "all" && item.type !== filter) return false;
		if (!searchQuery.trim()) return true;
		const term = searchQuery.toLowerCase().trim();
		const name = (item.displayName || '').toLowerCase();
		const city = (item.city || item.address?.city || '').toLowerCase();
		const country = getCountryName(item.country).toLowerCase();
		return name.includes(term) || city.includes(term) || country.includes(term);
	});

	if (loading) {
		return (
			<div className="min-h-screen bg-[#F8FAF6] flex items-center justify-center">
				<LoadingSpinner size="lg" text="Chargement des transporteurs et exportateurs..." />
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-[#F8FAF6] pb-16">
			<SEOHead title="Transport & Logistique | Harvests" description="Découvrez nos partenaires logistiques pour vos besoins de transport local et d'export international." />

			<div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 pt-3 sm:pt-4">

				{/* Hero Banner Agritech */}
				<div className="relative rounded-2xl bg-gradient-to-r from-[#161D14] via-[#1A5514] to-[#0D330A] text-white p-6 sm:p-10 mb-6 overflow-hidden shadow-xl border border-emerald-800/40">
					<div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

					<div className="relative z-10 max-w-2xl">
						<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-4">
							<TruckIcon className="w-4 h-4 text-[#31BC2E]" />
							<span>Transport & Chaîne du Froid</span>
						</div>

						<h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-4">
							Transporteurs & Exportateurs
						</h1>

						<p className="text-emerald-100/90 text-sm sm:text-base leading-relaxed">
							Découvrez nos partenaires logistiques pour vos besoins de transport local et d'export international, du champ à la table.
						</p>
					</div>
				</div>

				{/* Barre de recherche, filtres type & vue */}
				<div className="sticky top-16 sm:top-20 lg:top-[116px] z-30 bg-white/95 backdrop-blur-md rounded-2xl shadow-md border border-emerald-100/90 p-3 sm:p-4 mb-8 transition-all space-y-4">
					<div className="flex flex-col sm:flex-row items-center justify-between gap-4">
						<div className="relative flex-1 w-full">
							<FiSearch className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
							<input
								type="text"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								placeholder="Rechercher un partenaire logistique (nom, ville, pays)..."
								className="w-full pl-11 pr-4 py-3 text-sm border border-gray-200/90 rounded-xl focus:ring-2 focus:ring-[#1A5514] focus:border-transparent outline-none transition-all shadow-sm"
							/>
							{searchQuery && (
								<button
									onClick={() => setSearchQuery('')}
									className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs font-bold text-gray-400 hover:text-gray-600 bg-gray-100 px-2 py-1 rounded-md"
								>
									Effacer
								</button>
							)}
						</div>

						<div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
							<span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
								{filteredLogistics.length} Partenaire{filteredLogistics.length > 1 ? 's' : ''}
							</span>

							<div className="flex items-center bg-gray-100 p-1 rounded-xl gap-1 border border-gray-200">
								<button
									onClick={() => handleViewModeChange('grid')}
									className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 text-xs font-bold ${viewMode === 'grid' ? 'bg-[#1A5514] text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
									title="Vue en grille"
								>
									<FiGrid className="h-4 w-4" />
									<span className="hidden sm:inline">Grille</span>
								</button>
								<button
									onClick={() => handleViewModeChange('list')}
									className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 text-xs font-bold ${viewMode === 'list' ? 'bg-[#1A5514] text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
									title="Vue en liste"
								>
									<FiList className="h-4 w-4" />
									<span className="hidden sm:inline">Liste</span>
								</button>
							</div>
						</div>
					</div>

					{/* Filtres de type */}
					<div className="flex items-center gap-2">
						{[
							{ id: "all", label: "Tous" },
							{ id: "exporter", label: "Exportateurs" },
							{ id: "transporter", label: "Transporteurs" },
						].map((f) => (
							<button
								key={f.id}
								onClick={() => setFilter(f.id)}
								className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border ${
									filter === f.id
										? 'bg-[#1A5514] text-white border-[#1A5514] shadow-sm'
										: 'bg-white text-gray-600 border-gray-200 hover:border-emerald-300'
								}`}
							>
								{f.label}
							</button>
						))}
					</div>
				</div>

				{/* Grille / Liste */}
				{filteredLogistics.length > 0 ? (
					viewMode === 'grid' ? (
						<div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
							{filteredLogistics.map((item) => {
								const isExporter = item.type === "exporter";
								const rating = item.businessStats?.averageRating || item.stats?.averageRating || 0;

								return (
									<Link
										key={`${item.type}-${item._id}`}
										to={item.profileUrl}
										className="group bg-white border border-gray-200/90 rounded-2xl hover:border-emerald-500/40 hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden"
									>
										{/* Banner */}
										<div className="h-32 bg-gradient-to-r from-emerald-900 to-emerald-700 relative overflow-hidden">
											{item.shopBanner ? (
												<img
													src={item.shopBanner}
													alt={item.displayName}
													className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
												/>
											) : (
												<div className="w-full h-full opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
											)}

											<div className="absolute top-2.5 left-2.5 bg-[#1A5514]/90 backdrop-blur-md border border-emerald-500/40 text-white px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 shadow-sm z-10">
												{isExporter ? <FiGlobe className="w-3.5 h-3.5 text-[#31BC2E]" /> : <FiTruck className="w-3.5 h-3.5 text-[#31BC2E]" />}
												<span>{isExporter ? "Exportateur" : "Transporteur"}</span>
											</div>

											{rating > 0 && (
												<div className="absolute top-2.5 right-2.5 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full text-white text-[11px] font-bold flex items-center gap-1 shadow-sm z-10">
													<FiStar className="w-3 h-3 text-yellow-400 fill-yellow-400" />
													<span>{rating.toFixed(1)}</span>
												</div>
											)}
										</div>

										{/* Avatar */}
										<div className="px-4 -mt-7 flex items-end justify-between relative z-10">
											<div className="w-14 h-14 rounded-xl bg-white p-0.5 border border-gray-200/90 shadow-md overflow-hidden flex-shrink-0">
												{item.logo ? (
													<img src={item.logo} alt={item.displayName} className="w-full h-full object-cover rounded-lg" />
												) : (
													<div className="w-full h-full rounded-lg bg-emerald-50 text-[#1A5514] font-black flex items-center justify-center text-lg">
														{item.displayName?.[0] || item.firstName?.[0] || 'L'}
													</div>
												)}
											</div>
											<div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-2 py-0.5 rounded-md text-[10px] font-extrabold flex items-center gap-1">
												<ShieldCheck className="w-3 h-3 text-emerald-600" />
												<span>Vérifié</span>
											</div>
										</div>

										{/* Details */}
										<div className="p-4 pt-3 space-y-2 min-w-0 flex-1 flex flex-col justify-between">
											<div className="space-y-1.5">
												<h3 className="text-base font-extrabold text-[#161D14] group-hover:text-[#1A5514] transition-colors truncate" title={item.displayName}>
													{item.displayName}
												</h3>

												<div className="flex items-center text-xs text-gray-500 font-medium truncate">
													<FiMapPin className="w-3.5 h-3.5 text-emerald-600 mr-1 flex-shrink-0" />
													<span className="truncate">
														{getCountryName(item.country)}
														{item.city && ` • ${item.city}`}
														{item.region && ` • ${item.region}`}
													</span>
												</div>

												<span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
													{isExporter ? <FiGlobe className="w-3 h-3" /> : <FiTruck className="w-3 h-3" />}
													{isExporter ? "Export International" : "Livraison Locale"}
												</span>
											</div>

											<div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-[#1A5514] group-hover:text-[#31BC2E] transition-colors">
												<span className="flex items-center gap-1">
													<FiPackage className="w-3.5 h-3.5" />
													{isExporter ? "Flotte" : "Véhicules"}
												</span>
												<FiArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
											</div>
										</div>
									</Link>
								);
							})}
						</div>
					) : (
						<div className="grid grid-cols-1 gap-3.5">
							{filteredLogistics.map((item) => {
								const isExporter = item.type === "exporter";
								const rating = item.businessStats?.averageRating || item.stats?.averageRating || 0;

								return (
									<Link
										key={`${item.type}-${item._id}`}
										to={item.profileUrl}
										className="group bg-white rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-lg hover:border-emerald-300 transition-all p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 min-w-0"
									>
										<div className="flex items-center gap-3.5 flex-1 min-w-0">
											<div className="w-14 h-14 rounded-xl bg-white p-0.5 border border-gray-200/90 shadow-md overflow-hidden flex-shrink-0">
												{item.logo ? (
													<img src={item.logo} alt={item.displayName} className="w-full h-full object-cover rounded-lg" />
												) : (
													<div className="w-full h-full rounded-lg bg-emerald-50 text-[#1A5514] font-black flex items-center justify-center text-lg">
														{item.displayName?.[0] || item.firstName?.[0] || 'L'}
													</div>
												)}
											</div>

											<div className="space-y-1 min-w-0 flex-1">
												<div className="flex items-center gap-2 min-w-0">
													<h3 className="text-sm sm:text-base font-extrabold text-[#161D14] group-hover:text-[#1A5514] transition-colors truncate" title={item.displayName}>
														{item.displayName}
													</h3>
													<span className="hidden sm:flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 flex-shrink-0">
														<ShieldCheck className="w-3 h-3 text-[#31BC2E]" />
														Vérifié
													</span>
												</div>
												<div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
													<span className="flex items-center gap-1 truncate">
														<FiMapPin className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
														{getCountryName(item.country)}
														{item.city && ` • ${item.city}`}
														{item.region && ` • ${item.region}`}
													</span>
													{rating > 0 && (
														<span className="flex items-center gap-1 text-yellow-600 shrink-0">
															<FiStar className="w-3.5 h-3.5" />
															{rating.toFixed(1)}
														</span>
													)}
												</div>
												<span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
													{isExporter ? <FiGlobe className="w-3 h-3" /> : <FiTruck className="w-3 h-3" />}
													{isExporter ? "Export International" : "Livraison Locale"}
												</span>
											</div>
										</div>

										<div className="flex-shrink-0 self-end md:self-center">
											<span className="bg-[#1A5514] group-hover:bg-[#31BC2E] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2">
												Voir le profil
												<FiArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
											</span>
										</div>
									</Link>
								);
							})}
						</div>
					)
				) : (
					<div className="text-center py-16 bg-white rounded-2xl border border-emerald-100 shadow-sm">
						<FiTruck className="mx-auto h-12 w-12 text-gray-300 mb-4" />
						<h3 className="text-lg font-extrabold text-[#161D14] mb-2">
							Aucun partenaire trouvé
						</h3>
						<p className="text-xs text-gray-500 mb-6 max-w-sm mx-auto">
							{searchQuery ? `Aucun partenaire ne correspond à "${searchQuery}".` : "Revenez plus tard pour découvrir nos partenaires logistiques."}
						</p>
						{searchQuery && (
							<button
								onClick={() => setSearchQuery('')}
								className="px-6 py-2.5 bg-[#1A5514] text-white font-bold rounded-full hover:bg-[#144210] text-xs transition-colors"
							>
								Effacer la recherche
							</button>
						)}
					</div>
				)}
			</div>
		</div>
	);
};

export default TransporteursExportateurs;
