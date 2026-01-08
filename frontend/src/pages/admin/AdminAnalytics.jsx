import React, { useState, useEffect, useCallback } from "react";
import {
	BarChart3,
	TrendingUp,
	TrendingDown,
	Users,
	Package,
	ShoppingCart,
	DollarSign,
	Calendar,
	Download,
	Filter,
	ArrowRight,
	Activity,
} from "lucide-react";

import { adminService } from "../../services/adminService";
import { toPlainText } from "../../utils/textHelpers";
import UserRegistrationsChart from "../../components/admin/UserRegistrationsChart";
import RevenueTrendsChart from "../../components/admin/RevenueTrendsChart";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const AdminAnalytics = () => {
	const [analytics, setAnalytics] = useState({
		overview: {
			totalUsers: 0,
			totalProducts: 0,
			totalOrders: 0,
			totalRevenue: 0,
			userGrowth: 0,
			productGrowth: 0,
			orderGrowth: 0,
			revenueGrowth: 0,
		},
		charts: {
			userRegistrations: [],
			productCreations: [],
			orderTrends: [],
			revenueTrends: [],
			categoryDistribution: [],
			topProducers: [],
			topProducts: [],
		},
	});
	const [loading, setLoading] = useState(true);
	const [timeRange, setTimeRange] = useState("30d");

	const loadAnalytics = useCallback(async () => {
		try {
			setLoading(true);
			const response = await adminService.getAnalytics({ timeRange });

			if (response.data && response.data.analytics) {
				setAnalytics(response.data.analytics);
			} else if (response.data && response.data.data) {
				setAnalytics(response.data.data);
			}
		} catch (error) {
			console.error("Erreur lors du chargement des analytics:", error);
		} finally {
			setLoading(false);
		}
	}, [timeRange]);

	useEffect(() => {
		loadAnalytics();
	}, [loadAnalytics]);

	const formatPrice = (price) => {
		return new Intl.NumberFormat("fr-FR", {
			style: "currency",
			currency: "XOF",
			minimumFractionDigits: 0,
		}).format(price);
	};

	const formatNumber = (num) => {
		return new Intl.NumberFormat("fr-FR").format(num);
	};

	const getGrowthColor = (growth) => {
		return growth >= 0 ? "text-green-600" : "text-red-600";
	};

	const getGrowthBg = (growth) => {
		return growth >= 0 ? "bg-green-50" : "bg-red-50";
	};

	const getGrowthIcon = (growth) => {
		return growth >= 0 ? TrendingUp : TrendingDown;
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<LoadingSpinner size="lg" text="Chargement des analyses..." />
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

			<div className="max-w-full mx-auto px-4 py-6 relative z-10 pl-6">
				{/* Header */}
				<div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-5 animate-fade-in-down">
					<div>
						<div className="flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-[0.2em] mb-1.5">
							<div className="w-5 h-[2px] bg-emerald-600"></div>
							<span className="text-[9px]">Market Intelligence</span>
						</div>
						<h1 className="text-2xl font-[1000] text-gray-900 tracking-tighter leading-none mb-1.5">
							Analytiques <span className="text-green-600">Plateforme</span>
						</h1>
						<p className="text-xs text-gray-500 font-medium flex items-center gap-1.5">
							<Activity className="h-3.5 w-3.5 text-green-500" />
							Suivez la croissance et les performances en temps réel
						</p>
					</div>

					<div className="flex flex-wrap items-center gap-3 bg-white/70 backdrop-blur-xl p-1.5 rounded-[1rem] border border-white/60 shadow-[0_20px_50px_rgba(0,0,0,0.02)]">
						<div className="relative">
							<Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
							<select
								value={timeRange}
								onChange={(e) => setTimeRange(e.target.value)}
								className="pl-8 pr-7 py-1.5 bg-gray-200/50 border border-transparent focus:border-green-100 focus:bg-white focus:ring-4 focus:ring-green-500/5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all appearance-none cursor-pointer"
							>
								<option value="7d">7 derniers jours</option>
								<option value="30d">30 derniers jours</option>
								<option value="90d">90 derniers jours</option>
								<option value="1y">Dernière année</option>
							</select>
						</div>
						<button className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-lg active:scale-95">
							<Download className="h-3 w-3" />
							Exporter
						</button>
					</div>
				</div>

				{/* Overview Cards */}
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-6">
					{[
						{
							label: "UTILISATEURS",
							value: analytics.overview?.totalUsers,
							growth: analytics.overview?.userGrowth,
							icon: Users,
							color: "from-blue-600 via-blue-500 to-blue-400",
							shadowColor: "shadow-blue-200",
						},
						{
							label: "PRODUITS",
							value: analytics.overview?.totalProducts,
							growth: analytics.overview?.productGrowth,
							icon: Package,
							color: "from-purple-600 via-purple-500 to-fuchsia-500",
							shadowColor: "shadow-purple-200",
						},
						{
							label: "COMMANDES",
							value: analytics.overview?.totalOrders,
							growth: analytics.overview?.orderGrowth,
							icon: ShoppingCart,
							color: "from-orange-500 via-amber-500 to-yellow-400",
							shadowColor: "shadow-orange-200",
						},
						{
							label: "REVENUS",
							value: analytics.overview?.totalRevenue,
							growth: analytics.overview?.revenueGrowth,
							icon: DollarSign,
							color: "from-emerald-500 via-green-500 to-teal-400",
							shadowColor: "shadow-green-200",
							isPrice: true,
						},
					].map((stat, i) => {
						const Icon = stat.icon;
						const GrowthIcon = getGrowthIcon(stat.growth);
						return (
							<div
								key={i}
								className={`relative p-3.5 rounded-2xl bg-gradient-to-tr ${stat.color} shadow-lg hover:shadow-xl transition-all duration-500 group overflow-hidden border border-white/10`}
							>
								{/* Background Decorative Elements */}
								<div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full blur-2xl -mr-4 -mt-4 pointer-events-none group-hover:scale-150 transition-transform duration-700 ease-out"></div>
								<div className="absolute bottom-0 left-0 w-12 h-12 bg-black/5 rounded-full blur-2xl -ml-4 -mb-4 pointer-events-none group-hover:scale-150 transition-transform duration-700 ease-out"></div>

								{/* Large Background Icon */}
								<Icon className="absolute -right-1 -bottom-1 w-16 h-16 text-white/10 transform rotate-12 group-hover:scale-[1.2] group-hover:rotate-6 transition-transform duration-500 ease-out pointer-events-none" />

								<div className="relative z-10 flex flex-col h-full justify-between">
									<div className="flex items-start justify-between mb-2">
										<div className="w-7 h-7 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-md group-hover:scale-110 transition-transform duration-300">
											<Icon className="w-3.5 h-3.5 text-white drop-shadow-md" />
										</div>
										<div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-[7px] font-black text-white uppercase tracking-widest shadow-sm">
											<GrowthIcon className="h-1.5 w-1.5" />
											{Math.abs(stat.growth || 0)}%
										</div>
									</div>

									<div>
										<h3 className="text-[9px] font-bold text-white/80 uppercase tracking-wider mb-0.5">
											{stat.label}
										</h3>
										<h3 className="text-lg font-black text-white tracking-tighter drop-shadow-sm">
											{stat.isPrice
												? formatPrice(stat.value || 0)
												: formatNumber(stat.value || 0)}
										</h3>
									</div>
								</div>
							</div>
						);
					})}
				</div>

				{/* Charts Section */}
				<div className="grid grid-cols-1 gap-4 lg:grid-cols-2 mb-6">
					{/* User Registrations Chart */}
					<div className="bg-white/70 backdrop-blur-xl p-4 rounded-2xl border border-white/60 shadow-[0_20px_50px_rgba(0,0,0,0.02)]">
						<div className="flex items-center justify-between mb-3">
							<h3 className="text-sm font-[1000] text-gray-900 uppercase tracking-tight">
								Inscriptions
							</h3>
							<div className="w-6 h-6 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 border border-blue-50 shadow-sm">
								<Users className="h-3 w-3" />
							</div>
						</div>
						<div className="h-[200px]">
							<UserRegistrationsChart
								data={analytics.charts?.userRegistrations || []}
							/>
						</div>
					</div>

					{/* Revenue Trends Chart */}
					<div className="bg-white/70 backdrop-blur-xl p-4 rounded-2xl border border-white/60 shadow-[0_20px_50px_rgba(0,0,0,0.02)]">
						<div className="flex items-center justify-between mb-3">
							<h3 className="text-sm font-[1000] text-gray-900 uppercase tracking-tight">
								Tendances Revenus
							</h3>
							<div className="w-6 h-6 bg-green-50 rounded-lg flex items-center justify-center text-green-600 border border-green-50 shadow-sm">
								<DollarSign className="h-3 w-3" />
							</div>
						</div>
						<div className="h-[200px]">
							<RevenueTrendsChart
								data={analytics.charts?.revenueTrends || []}
							/>
						</div>
					</div>
				</div>

				{/* Top Producers and Products */}
				<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
					{/* Top Producers */}
					<div className="bg-white/70 backdrop-blur-xl p-4 rounded-2xl border border-white/60 shadow-[0_20px_50px_rgba(0,0,0,0.02)]">
						<div className="flex items-center justify-between mb-3">
							<h3 className="text-sm font-[1000] text-gray-900 uppercase tracking-tight">
								Top Producteurs
							</h3>
							<div className="w-6 h-6 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600 border border-purple-50 shadow-sm">
								<Users className="h-3 w-3" />
							</div>
						</div>

						<div className="space-y-1.5">
							{(analytics.charts?.topProducers || []).length > 0 ? (
								analytics.charts.topProducers.map((producer, index) => (
									<div
										key={producer._id}
										className="group flex items-center gap-2.5 p-2 bg-gray-50/50 rounded-xl border border-gray-100/50 hover:bg-white hover:shadow-lg hover:shadow-gray-200/40 transition-all duration-500"
									>
										<div className="relative">
											<div className="w-9 h-9 rounded-lg overflow-hidden border-2 border-white shadow-md bg-white p-0.5 flex-shrink-0">
												<div className="w-full h-full bg-purple-50 flex items-center justify-center rounded-lg text-purple-600">
													<span className="text-sm font-black">
														{producer.producerName?.charAt(0) ||
															producer.farmName?.charAt(0) ||
															"P"}
													</span>
												</div>
											</div>
											<div className="absolute -top-1 -right-1 w-4 h-4 bg-gray-900 text-white rounded-md flex items-center justify-center text-[7px] font-black shadow-lg">
												#{index + 1}
											</div>
										</div>
										<div className="flex-1 min-w-0">
											<p className="text-xs font-[1000] text-gray-900 tracking-tight leading-none mb-0.5">
												{producer.producerName ||
													producer.farmName ||
													"Producteur"}
											</p>
											<div className="flex items-center gap-1.5">
												<span className="text-[7px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
													<ShoppingCart className="h-1.5 w-1.5 text-green-500" />
													{producer.orderCount || 0} ventes
												</span>
												<span className="text-xs font-black text-green-600 tracking-tighter">
													{formatPrice(producer.totalSales || 0)}
												</span>
											</div>
										</div>
										<ArrowRight className="h-3 w-3 text-gray-300 group-hover:text-green-500 group-hover:translate-x-0.5 transition-all" />
									</div>
								))
							) : (
								<div className="text-center py-4 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
									<Users className="h-6 w-6 text-gray-200 mx-auto mb-1" />
									<p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">
										Aucun producteur actif
									</p>
								</div>
							)}
						</div>
					</div>

					{/* Top Products */}
					<div className="bg-white/70 backdrop-blur-xl p-4 rounded-2xl border border-white/60 shadow-[0_20px_50px_rgba(0,0,0,0.02)]">
						<div className="flex items-center justify-between mb-3">
							<h3 className="text-sm font-[1000] text-gray-900 uppercase tracking-tight">
								Top Produits
							</h3>
							<div className="w-6 h-6 bg-orange-50 rounded-lg flex items-center justify-center text-orange-600 border border-orange-50 shadow-sm">
								<Package className="h-3 w-3" />
							</div>
						</div>

						<div className="space-y-1.5">
							{(analytics.charts?.topProducts || []).length > 0 ? (
								analytics.charts.topProducts.map((product, index) => (
									<div
										key={product._id}
										className="group flex items-center gap-2.5 p-2 bg-gray-50/50 rounded-xl border border-gray-100/50 hover:bg-white hover:shadow-lg hover:shadow-gray-200/40 transition-all duration-500"
									>
										<div className="relative">
											<div className="w-9 h-9 rounded-lg overflow-hidden border-2 border-white shadow-md bg-white p-0.5 flex-shrink-0">
												<div className="w-full h-full bg-orange-50 flex items-center justify-center rounded-lg text-orange-600">
													<Package className="h-4 w-4" />
												</div>
											</div>
											<div className="absolute -top-1 -right-1 w-4 h-4 bg-gray-900 text-white rounded-md flex items-center justify-center text-[7px] font-black shadow-lg">
												#{index + 1}
											</div>
										</div>
										<div className="flex-1 min-w-0">
											<p className="text-xs font-[1000] text-gray-900 tracking-tight leading-none mb-0.5 truncate">
												{toPlainText(product.name, "Produit")}
											</p>
											<div className="flex items-center gap-1.5">
												<span className="text-[7px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
													<ShoppingCart className="h-1.5 w-1.5 text-orange-500" />
													{product.sales || 0} ventes
												</span>
												<span className="text-xs font-black text-gray-900 tracking-tighter">
													{formatPrice(product.price || 0)}
												</span>
											</div>
										</div>
										<ArrowRight className="h-3 w-3 text-gray-300 group-hover:text-green-500 group-hover:translate-x-0.5 transition-all" />
									</div>
								))
							) : (
								<div className="text-center py-4 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
									<Package className="h-6 w-6 text-gray-200 mx-auto mb-1" />
									<p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">
										Aucun produit vendu
									</p>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AdminAnalytics;
