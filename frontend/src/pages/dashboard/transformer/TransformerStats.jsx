import React, { useState, useEffect } from "react";
import { transformerService } from "../../../services";
import { transformerService as genericTransformerService } from "../../../services/genericService";
import { useNotifications } from "../../../contexts/NotificationContext";
import ModularDashboardLayout from "../../../components/layout/ModularDashboardLayout";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import {
	TrendingUp,
	TrendingDown,
	DollarSign,
	Package,
	Users,
	Star,
	Calendar,
	RefreshCw,
	AlertCircle,
	BarChart3,
	PieChart,
	Activity,
	ArrowUpRight,
	ArrowDownRight,
	Timer,
	Target,
	Sparkles,
} from "lucide-react";

const TransformerStats = () => {
	const { showError } = useNotifications();
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [stats, setStats] = useState({
		businessStats: {},
		productionAnalytics: {},
		efficiencyMetrics: {},
		revenueAnalytics: {},
	});
	const [selectedPeriod, setSelectedPeriod] = useState("30d");

	// Charger les statistiques
	useEffect(() => {
		loadStats();
	}, [selectedPeriod]);

	const loadStats = async () => {
		try {
			setLoading(true);

			// Charger seulement les statistiques de base disponibles
			const businessResponse = await genericTransformerService.getStats();

			// Pour les transformateurs, les stats sont directement dans data, pas dans data.data
			const businessStats =
				businessResponse.data?.data ||
				businessResponse.data?.stats ||
				businessResponse.data ||
				{};

			setStats({
				businessStats: businessStats,
				productionAnalytics: {}, // Données simulées pour l'instant
				efficiencyMetrics: {}, // Données simulées pour l'instant
				revenueAnalytics: {}, // Données simulées pour l'instant
			});
		} catch (error) {
			console.error("Erreur lors du chargement des statistiques:", error);
			setError("Erreur lors du chargement des statistiques");
			showError("Erreur lors du chargement des statistiques");
		} finally {
			setLoading(false);
		}
	};

	const formatCurrency = (val) => {
		return new Intl.NumberFormat("fr-FR", {
			style: "currency",
			currency: "XAF",
			minimumFractionDigits: 0,
		}).format(val || 0);
	};

	if (loading) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
				<div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
				<p className="text-xs font-black text-gray-400 uppercase tracking-widest animate-pulse">
					Analyse de vos performances...
				</p>
			</div>
		);
	}

	return (
		<div className="min-h-screen relative overflow-hidden bg-harvests-light/20 pb-20">
			{/* Background Decorative Glows */}
			<div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
				<div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-100/30 rounded-full blur-[120px]"></div>
				<div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-100/20 rounded-full blur-[100px]"></div>
			</div>

			<div className="relative z-10 max-w-7xl mx-auto px-4 py-8 md:py-12 space-y-10">
				{/* Header */}
				<div className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-fade-in-down">
					<div className="space-y-3">
						<div className="flex items-center gap-2 text-purple-600 font-black text-[9px] uppercase tracking-widest mb-2">
							<div className="w-5 h-[2px] bg-purple-600 rounded-full"></div>
							<span>Analytics</span>
						</div>
						<h1 className="text-3xl font-[1000] text-gray-900 tracking-tighter leading-none mb-2">
							Performances{" "}
							<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-500">
								Transformer.
							</span>
						</h1>
						<p className="text-xs text-gray-500 font-medium max-w-xl">
							Visualisez l'évolution de votre activité, vos revenus et
							l'efficacité de votre production en temps réel.
						</p>
					</div>

					<div className="flex items-center gap-3">
						<div className="bg-white/70 backdrop-blur-xl p-1.5 rounded-2xl border border-white/60 shadow-sm flex gap-1">
							{["7d", "30d", "90d", "1y"].map((period) => (
								<button
									key={period}
									onClick={() => setSelectedPeriod(period)}
									className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
										selectedPeriod === period ?
											"bg-gray-900 text-white shadow-lg"
										:	"text-gray-400 hover:text-gray-900 hover:bg-white"
									}`}
								>
									{period === "7d" ? "7 Jours" : ""}
									{period === "30d" ? "30 Jours" : ""}
									{period === "90d" ? "90 Jours" : ""}
									{period === "1y" ? "1 An" : ""}
								</button>
							))}
						</div>
						<button
							onClick={loadStats}
							className="w-11 h-11 bg-white/70 backdrop-blur-xl rounded-2xl border border-white/60 shadow-sm flex items-center justify-center text-gray-500 hover:text-purple-600 transition-colors group"
						>
							<RefreshCw className="w-4 h-4 group-active:rotate-180 transition-transform duration-500" />
						</button>
					</div>
				</div>

				{/* Top Stats Cards */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in-up delay-100">
					{[
						{
							label: "Chiffre d'Affaires",
							value: formatCurrency(stats.businessStats.totalRevenue),
							icon: DollarSign,
							color: "emerald",
							trend: stats.businessStats.revenueGrowth,
						},
						{
							label: "Commandes Totales",
							value: stats.businessStats.totalOrders || 0,
							icon: Package,
							color: "blue",
							trend: stats.businessStats.ordersGrowth,
						},
						{
							label: "Clients Actifs",
							value: stats.businessStats.activeCustomers || 0,
							icon: Users,
							color: "purple",
							trend: stats.businessStats.customersGrowth,
						},
						{
							label: "Note Moyenne",
							value: (stats.businessStats.averageRating || 0).toFixed(1),
							icon: Star,
							color: "amber",
							trend: null,
						},
					].map((item, idx) => (
						<div
							key={idx}
							className="group bg-white/70 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 relative overflow-hidden"
						>
							<div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
								<item.icon className="w-24 h-24" />
							</div>
							<div className="relative z-10">
								<div className="flex items-center justify-between mb-4">
									<div
										className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg
                                            ${item.color === "emerald" ? "bg-emerald-50 text-emerald-600 shadow-emerald-200/50" : ""}
                                            ${item.color === "blue" ? "bg-blue-50 text-blue-600 shadow-blue-200/50" : ""}
                                            ${item.color === "purple" ? "bg-purple-50 text-purple-600 shadow-purple-200/50" : ""}
                                            ${item.color === "amber" ? "bg-amber-50 text-amber-600 shadow-amber-200/50" : ""}
                                            `}
									>
										<item.icon className="w-6 h-6" />
									</div>
									{item.trend !== undefined && item.trend !== null && (
										<div
											className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
												item.trend >= 0 ?
													"bg-emerald-50 text-emerald-600"
												:	"bg-rose-50 text-rose-600"
											}`}
										>
											{item.trend >= 0 ?
												<TrendingUp className="w-3 h-3" />
											:	<TrendingDown className="w-3 h-3" />}
											{Math.abs(item.trend)}%
										</div>
									)}
								</div>
								<p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">
									{item.label}
								</p>
								<h3 className="text-2xl font-[1000] text-gray-900 tracking-tighter">
									{item.value}
								</h3>
							</div>
						</div>
					))}
				</div>

				{/* Charts Row */}
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in-up delay-200">
					{/* Main Production Flow */}
					<div className="lg:col-span-2 bg-white/70 backdrop-blur-xl p-8 rounded-[3rem] border border-white/60 shadow-sm flex flex-col space-y-8">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-4">
								<div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 shadow-inner">
									<BarChart3 className="w-6 h-6" />
								</div>
								<div>
									<h3 className="text-xl font-[1000] text-gray-900 tracking-tight">
										Production Quotidienne
									</h3>
									<p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
										Commandes traitées par jour
									</p>
								</div>
							</div>
						</div>

						<div className="flex-1 min-h-[300px] flex items-end justify-between gap-2 px-2 pb-6">
							{/* Placeholder bars until real chart is integrated */}
							{[
								65, 45, 75, 55, 90, 80, 70, 85, 60, 95, 100, 75, 85, 90, 60, 70,
								80, 95, 40,
							].map((height, i) => (
								<div
									key={i}
									className="flex-1 flex flex-col items-center group/bar"
								>
									<div
										style={{ height: `${height * 2}px` }}
										className="w-full max-w-[12px] bg-gradient-to-t from-purple-600 to-indigo-400 rounded-full group-hover/bar:from-purple-500 group-hover/bar:to-indigo-300 transition-all duration-500 relative cursor-pointer"
									>
										<div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[9px] font-black px-2 py-1 rounded-lg opacity-0 group-hover/bar:opacity-100 transition-opacity">
											{height}
										</div>
									</div>
								</div>
							))}
						</div>
					</div>

					{/* Efficiency / Distribution Chart */}
					<div className="bg-white/70 backdrop-blur-xl p-8 rounded-[3rem] border border-white/60 shadow-sm flex flex-col">
						<div className="flex items-center gap-4 mb-8">
							<div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-inner">
								<PieChart className="w-6 h-6" />
							</div>
							<div>
								<h3 className="text-xl font-[1000] text-gray-900 tracking-tight">
									Efficacité
								</h3>
								<p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
									Taux de succès global
								</p>
							</div>
						</div>

						<div className="flex-1 flex flex-col justify-center space-y-8 px-4">
							<div className="relative h-48 w-48 mx-auto">
								<svg className="w-full h-full transform -rotate-90">
									<circle
										cx="96"
										cy="96"
										r="80"
										fill="none"
										stroke="currentColor"
										strokeWidth="20"
										className="text-gray-100"
									/>
									<circle
										cx="96"
										cy="96"
										r="80"
										fill="none"
										stroke="url(#purpleGradient)"
										strokeWidth="20"
										strokeDasharray="502"
										strokeDashoffset={502 * (1 - 0.84)}
										strokeLinecap="round"
										className="transition-all duration-1000"
									/>
									<defs>
										<linearGradient
											id="purpleGradient"
											x1="0%"
											y1="0%"
											x2="100%"
											y2="100%"
										>
											<stop offset="0%" stopColor="#9333ea" />
											<stop offset="100%" stopColor="#4f46e5" />
										</linearGradient>
									</defs>
								</svg>
								<div className="absolute inset-0 flex flex-col items-center justify-center">
									<span className="text-4xl font-[1000] text-gray-900 tracking-tighter">
										84%
									</span>
									<span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
										Optimal
									</span>
								</div>
							</div>

							<div className="space-y-3">
								{[
									{ label: "Traitées", val: 84, color: "purple" },
									{ label: "En Retard", val: 12, color: "amber" },
									{ label: "Annulées", val: 4, color: "rose" },
								].map((item, i) => (
									<div key={i} className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<div
												className={`w-2 h-2 rounded-full 
                                                    ${item.color === "purple" ? "bg-purple-600" : ""}
                                                    ${item.color === "amber" ? "bg-amber-400" : ""}
                                                    ${item.color === "rose" ? "bg-rose-500" : ""}
                                                    `}
											></div>
											<span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
												{item.label}
											</span>
										</div>
										<span className="text-xs font-[1000] text-gray-900">
											{item.val}%
										</span>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>

				{/* Secondary Metrics Grid */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in-up delay-300">
					{/* Efficiency Detailed Metrics */}
					<div className="bg-white/70 backdrop-blur-xl p-8 rounded-[3rem] border border-white/60 shadow-sm">
						<div className="flex items-center gap-4 mb-10">
							<div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shadow-inner">
								<Activity className="w-6 h-6" />
							</div>
							<div>
								<h3 className="text-xl font-[1000] text-gray-900 tracking-tight">
									Métriques de Traitement
								</h3>
								<p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
									Vitesse et qualité de service
								</p>
							</div>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
							{[
								{
									label: "Temps Moyen",
									val: "2.4h",
									icon: Timer,
									desc: "Par commande",
								},
								{
									label: "Taux Succès",
									val: "98.2%",
									icon: Target,
									desc: "Qualité produit",
								},
								{
									label: "Récurrence",
									val: "42%",
									icon: Users,
									desc: "Fidélité client",
								},
								{
									label: "Croissance",
									val: "+12%",
									icon: TrendingUp,
									desc: "Mensuelle",
								},
							].map((metric, i) => (
								<div
									key={i}
									className="flex items-center gap-4 p-4 rounded-3xl bg-gray-50/50 border border-gray-100 group hover:bg-white hover:shadow-lg transition-all duration-300"
								>
									<div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-400 group-hover:text-purple-600 transition-colors shadow-sm">
										<metric.icon className="w-5 h-5" />
									</div>
									<div>
										<p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">
											{metric.label}
										</p>
										<div className="flex items-end gap-2">
											<span className="text-xl font-[1000] text-gray-900 leading-none">
												{metric.val}
											</span>
											<span className="text-[9px] font-bold text-gray-400 lowercase mb-0.5">
												{metric.desc}
											</span>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>

					{/* Revenue Analysis Insight */}
					<div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-8 rounded-[3rem] shadow-xl shadow-purple-200 relative overflow-hidden group">
						<div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform duration-1000">
							<Sparkles className="w-48 h-48 text-white" />
						</div>

						<div className="relative z-10 flex flex-col h-full justify-between">
							<div className="space-y-4">
								<div className="flex items-center gap-3">
									<div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-white">
										<TrendingUp className="w-5 h-5" />
									</div>
									<span className="text-[10px] font-black text-purple-100 uppercase tracking-[0.2em]">
										Revenu Mensuel Estimé
									</span>
								</div>
								<h2 className="text-5xl font-[1000] text-white tracking-tighter leading-none">
									{formatCurrency(850000)}
								</h2>
								<p className="text-purple-100/80 font-bold text-sm leading-relaxed max-w-xs">
									Vos revenus ont augmenté de{" "}
									<span className="text-white">15.4%</span> ce mois-ci par
									rapport au mois dernier grâce à une augmentation du panier
									moyen.
								</p>
							</div>

							<div className="pt-8">
								<button className="px-8 py-4 bg-white text-purple-600 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg hover:-translate-y-1 transition-all flex items-center gap-3">
									Voir le rapport complet
									<ArrowUpRight className="w-4 h-4" />
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default TransformerStats;
