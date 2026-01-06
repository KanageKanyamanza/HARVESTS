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
		<div className="min-h-screen pb-20 relative overflow-hidden">
			{/* Background radial glows */}
			<div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden ">
				<div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-green-100/30 rounded-full blur-[120px]"></div>
				<div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100/20 rounded-full blur-[100px]"></div>
			</div>

			<div className="max-w-[1400px] mx-auto px-4 py-12 relative z-10">
				{/* Header */}
				<div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 animate-fade-in-down">
					<div>
						<div className="flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-[0.2em] mb-3">
							<div className="w-8 h-[2px] bg-emerald-600"></div>
							<span>Market Intelligence</span>
						</div>
						<h1 className="text-5xl font-[1000] text-gray-900 tracking-tighter leading-none mb-4">
							Analytiques <span className="text-green-600">Plateforme</span>
						</h1>
						<p className="text-gray-500 font-medium flex items-center gap-2">
							<Activity className="h-4 w-4 text-green-500" />
							Suivez la croissance et les performances en temps réel
						</p>
					</div>

					<div className="flex flex-wrap items-center gap-4 bg-white/70 backdrop-blur-xl p-3 rounded-[2rem] border border-white/60 shadow-[0_20px_50px_rgba(0,0,0,0.02)]">
						<div className="relative">
							<Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
							<select
								value={timeRange}
								onChange={(e) => setTimeRange(e.target.value)}
								className="pl-11 pr-10 py-3 bg-gray-200/50 border border-transparent focus:border-green-100 focus:bg-white focus:ring-4 focus:ring-green-500/5 rounded-2xl text-sm font-black uppercase tracking-widest transition-all appearance-none cursor-pointer"
							>
								<option value="7d">7 derniers jours</option>
								<option value="30d">30 derniers jours</option>
								<option value="90d">90 derniers jours</option>
								<option value="1y">Dernière année</option>
							</select>
						</div>
						<button className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-lg active:scale-95">
							<Download className="h-4 w-4" />
							Exporter
						</button>
					</div>
				</div>

				{/* Overview Cards */}
				<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-12">
					{[
						{
							label: "Utilisateurs",
							value: analytics.overview?.totalUsers,
							growth: analytics.overview?.userGrowth,
							icon: Users,
							color: "text-blue-600",
							bg: "bg-blue-50",
						},
						{
							label: "Produits",
							value: analytics.overview?.totalProducts,
							growth: analytics.overview?.productGrowth,
							icon: Package,
							color: "text-purple-600",
							bg: "bg-purple-50",
						},
						{
							label: "Commandes",
							value: analytics.overview?.totalOrders,
							growth: analytics.overview?.orderGrowth,
							icon: ShoppingCart,
							color: "text-orange-600",
							bg: "bg-orange-50",
						},
						{
							label: "Revenus",
							value: analytics.overview?.totalRevenue,
							growth: analytics.overview?.revenueGrowth,
							icon: DollarSign,
							color: "text-green-600",
							bg: "bg-green-50",
							isPrice: true,
						},
					].map((stat, i) => {
						const Icon = stat.icon;
						const GrowthIcon = getGrowthIcon(stat.growth);
						return (
							<div
								key={i}
								className="bg-white/70 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/60 shadow-[0_20px_50px_rgba(0,0,0,0.02)] group hover:scale-[1.02] transition-all duration-500"
							>
								<div className="flex items-center justify-between mb-6">
									<div
										className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center shadow-inner border border-white/50 group-hover:rotate-6 transition-transform`}
									>
										<Icon className="h-7 w-7" />
									</div>
									<div
										className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${getGrowthBg(
											stat.growth
										)} ${getGrowthColor(
											stat.growth
										)} border border-white shadow-sm`}
									>
										<GrowthIcon className="h-3 w-3" />
										{Math.abs(stat.growth || 0)}%
									</div>
								</div>
								<div>
									<p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
										{stat.label}
									</p>
									<h3 className="text-3xl font-[1000] text-gray-900 tracking-tighter">
										{stat.isPrice
											? formatPrice(stat.value || 0)
											: formatNumber(stat.value || 0)}
									</h3>
								</div>
							</div>
						);
					})}
				</div>

				{/* Charts Section */}
				<div className="grid grid-cols-1 gap-8 lg:grid-cols-2 mb-12">
					{/* User Registrations Chart */}
					<div className="bg-white/70 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/60 shadow-[0_20px_50px_rgba(0,0,0,0.02)]">
						<div className="flex items-center justify-between mb-8">
							<h3 className="text-xl font-[1000] text-gray-900 uppercase tracking-tight">
								Inscriptions
							</h3>
							<div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 border border-blue-50 shadow-sm">
								<Users className="h-5 w-5" />
							</div>
						</div>
						<div className="h-[300px]">
							<UserRegistrationsChart
								data={analytics.charts?.userRegistrations || []}
							/>
						</div>
					</div>

					{/* Revenue Trends Chart */}
					<div className="bg-white/70 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/60 shadow-[0_20px_50px_rgba(0,0,0,0.02)]">
						<div className="flex items-center justify-between mb-8">
							<h3 className="text-xl font-[1000] text-gray-900 uppercase tracking-tight">
								Tendances Revenus
							</h3>
							<div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600 border border-green-50 shadow-sm">
								<DollarSign className="h-5 w-5" />
							</div>
						</div>
						<div className="h-[300px]">
							<RevenueTrendsChart
								data={analytics.charts?.revenueTrends || []}
							/>
						</div>
					</div>
				</div>

				{/* Top Producers and Products */}
				<div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
					{/* Top Producers */}
					<div className="bg-white/70 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/60 shadow-[0_20px_50px_rgba(0,0,0,0.02)]">
						<div className="flex items-center justify-between mb-8">
							<h3 className="text-xl font-[1000] text-gray-900 uppercase tracking-tight">
								Top Producteurs
							</h3>
							<div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 border border-purple-50 shadow-sm">
								<Users className="h-5 w-5" />
							</div>
						</div>

						<div className="space-y-4">
							{(analytics.charts?.topProducers || []).length > 0 ? (
								analytics.charts.topProducers.map((producer, index) => (
									<div
										key={producer._id}
										className="group flex items-center gap-6 p-6 bg-gray-50/50 rounded-3xl border border-gray-100/50 hover:bg-white hover:shadow-xl hover:shadow-gray-200/40 transition-all duration-500"
									>
										<div className="relative">
											<div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white shadow-md bg-white p-1 flex-shrink-0">
												<div className="w-full h-full bg-purple-50 flex items-center justify-center rounded-xl text-purple-600">
													<span className="text-xl font-black">
														{producer.producerName?.charAt(0) ||
															producer.farmName?.charAt(0) ||
															"P"}
													</span>
												</div>
											</div>
											<div className="absolute -top-2 -right-2 w-8 h-8 bg-gray-900 text-white rounded-xl flex items-center justify-center text-[10px] font-black shadow-lg">
												#{index + 1}
											</div>
										</div>
										<div className="flex-1 min-w-0">
											<p className="text-lg font-[1000] text-gray-900 tracking-tight leading-none mb-2">
												{producer.producerName ||
													producer.farmName ||
													"Producteur"}
											</p>
											<div className="flex items-center gap-4">
												<span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
													<ShoppingCart className="h-3 w-3 text-green-500" />
													{producer.orderCount || 0} ventes
												</span>
												<span className="text-sm font-black text-green-600 tracking-tighter">
													{formatPrice(producer.totalSales || 0)}
												</span>
											</div>
										</div>
										<ArrowRight className="h-5 w-5 text-gray-300 group-hover:text-green-500 group-hover:translate-x-2 transition-all" />
									</div>
								))
							) : (
								<div className="text-center py-12 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
									<Users className="h-12 w-12 text-gray-200 mx-auto mb-4" />
									<p className="text-sm font-black text-gray-400 uppercase tracking-widest">
										Aucun producteur actif
									</p>
								</div>
							)}
						</div>
					</div>

					{/* Top Products */}
					<div className="bg-white/70 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/60 shadow-[0_20px_50px_rgba(0,0,0,0.02)]">
						<div className="flex items-center justify-between mb-8">
							<h3 className="text-xl font-[1000] text-gray-900 uppercase tracking-tight">
								Top Produits
							</h3>
							<div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 border border-orange-50 shadow-sm">
								<Package className="h-5 w-5" />
							</div>
						</div>

						<div className="space-y-4">
							{(analytics.charts?.topProducts || []).length > 0 ? (
								analytics.charts.topProducts.map((product, index) => (
									<div
										key={product._id}
										className="group flex items-center gap-6 p-6 bg-gray-50/50 rounded-3xl border border-gray-100/50 hover:bg-white hover:shadow-xl hover:shadow-gray-200/40 transition-all duration-500"
									>
										<div className="relative">
											<div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white shadow-md bg-white p-1 flex-shrink-0">
												<div className="w-full h-full bg-orange-50 flex items-center justify-center rounded-xl text-orange-600">
													<Package className="h-8 w-8" />
												</div>
											</div>
											<div className="absolute -top-2 -right-2 w-8 h-8 bg-gray-900 text-white rounded-xl flex items-center justify-center text-[10px] font-black shadow-lg">
												#{index + 1}
											</div>
										</div>
										<div className="flex-1 min-w-0">
											<p className="text-lg font-[1000] text-gray-900 tracking-tight leading-none mb-2 truncate">
												{toPlainText(product.name, "Produit")}
											</p>
											<div className="flex items-center gap-4">
												<span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
													<ShoppingCart className="h-3 w-3 text-orange-500" />
													{product.sales || 0} ventes
												</span>
												<span className="text-sm font-black text-gray-900 tracking-tighter">
													{formatPrice(product.price || 0)}
												</span>
											</div>
										</div>
										<ArrowRight className="h-5 w-5 text-gray-300 group-hover:text-green-500 group-hover:translate-x-2 transition-all" />
									</div>
								))
							) : (
								<div className="text-center py-12 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
									<Package className="h-12 w-12 text-gray-200 mx-auto mb-4" />
									<p className="text-sm font-black text-gray-400 uppercase tracking-widest">
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
