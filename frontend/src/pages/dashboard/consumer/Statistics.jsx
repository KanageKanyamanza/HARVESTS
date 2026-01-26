import React, { useState, useEffect } from "react";
import {
	FiTrendingUp,
	FiDollarSign,
	FiStar,
	FiShoppingBag,
	FiEye,
	FiCalendar,
	FiAward,
	FiArrowUpRight,
	FiCreditCard,
	FiRefreshCw,
} from "react-icons/fi";
import { consumerService } from "../../../services/genericService";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import ErrorMessage from "../../../components/common/ErrorMessage";
import ModularDashboardLayout from "../../../components/layout/ModularDashboardLayout";

const Statistics = () => {
	const [stats, setStats] = useState(null);
	const [analytics, setAnalytics] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		loadStatistics();
	}, []);

	const loadStatistics = async () => {
		try {
			setLoading(true);
			const [statsResponse, analyticsResponse] = await Promise.allSettled([
				consumerService.getStats(),
				consumerService.getSpendingAnalytics(),
			]);

			if (
				statsResponse.status === "fulfilled" &&
				statsResponse.value.data.status === "success"
			) {
				setStats(statsResponse.value.data.data);
			}

			if (
				analyticsResponse.status === "fulfilled" &&
				analyticsResponse.value.data.status === "success"
			) {
				setAnalytics(analyticsResponse.value.data.data);
			}
		} catch (err) {
			console.error("Erreur lors du chargement des statistiques:", err);
			setError("Impossible de charger vos statistiques");
		} finally {
			setLoading(false);
		}
	};

	const formatCurrency = (amount) => {
		return new Intl.NumberFormat("fr-FR", {
			style: "currency",
			currency: "XAF",
			minimumFractionDigits: 0,
		}).format(amount);
	};

	const formatDate = (dateString) => {
		return new Date(dateString).toLocaleDateString("fr-FR", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	if (loading) {
		return (
			<ModularDashboardLayout userType="consumer">
				<div className="min-h-screen flex items-center justify-center">
					<LoadingSpinner size="lg" text="Analyse de vos habitudes..." />
				</div>
			</ModularDashboardLayout>
		);
	}

	const statsData = stats?.stats || {};
	const activityStats = stats?.activityStats || {};
	const loyaltyStats = stats?.loyaltyStats || {};
	const analyticsData = analytics?.analytics || {};

	return (
		<ModularDashboardLayout userType="consumer">
			<div className="min-h-screen relative overflow-hidden bg-harvests-light/20 pb-20">
				{/* Background radial glows - Blue/Sky theme */}
				<div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden ">
					<div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-100/30 rounded-full blur-[120px]"></div>
					<div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-sky-100/30 rounded-full blur-[100px]"></div>
					<div className="absolute top-[20%] left-[10%] w-[30%] h-[30%] bg-cyan-100/20 rounded-full blur-[120px]"></div>
				</div>

				<div className="relative z-10 max-w-7xl mx-auto px-4 py-8 md:py-12 space-y-10">
					{/* Header */}
					<div className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-fade-in-down">
						<div className="space-y-3">
							<div className="flex items-center gap-2 text-blue-600 font-black text-[9px] uppercase tracking-widest mb-2">
								<div className="w-5 h-[2px] bg-blue-600 rounded-full"></div>
								<span>Performances</span>
							</div>
							<h1 className="text-3xl font-[1000] text-gray-900 tracking-tighter leading-none mb-2">
								Mes{" "}
								<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-sky-500 italic">
									Statistiques.
								</span>
							</h1>
							<p className="text-xs text-gray-500 font-medium max-w-xl">
								Visualisez vos habitudes de consommation, vos économies et vos
								points de fidélité.
							</p>
						</div>

						<button
							onClick={loadStatistics}
							className="group relative inline-flex items-center justify-center px-6 py-3 bg-white/70 backdrop-blur-xl border border-white/60 text-gray-900 font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all duration-300 hover:bg-blue-600 hover:text-white hover:border-blue-600 shadow-sm"
						>
							<FiRefreshCw className="w-4 h-4 mr-2 group-active:rotate-180 transition-transform duration-500" />
							Actualiser
						</button>
					</div>

					{error && (
						<div className="animate-fade-in">
							<ErrorMessage message={error} />
						</div>
					)}

					{/* Top Metrics Grid */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in-up delay-100">
						{[
							{
								label: "Commandes Totales",
								value: statsData.totalOrders || 0,
								icon: FiShoppingBag,
								color: "blue",
								trend: "+5%",
							},
							{
								label: "Montant Dépensé",
								value: formatCurrency(statsData.totalSpent || 0),
								icon: FiCreditCard,
								color: "cyan",
								trend: null,
							},
							{
								label: "Avis Laissés",
								value: activityStats.reviewsWritten || 0,
								icon: FiStar,
								color: "amber",
								sub: `${activityStats.averageRatingGiven?.toFixed(1) || "0.0"}/5`,
							},
							{
								label: "Vues Profil",
								value: statsData.profileViews || 0,
								icon: FiEye,
								color: "indigo",
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
								<div className="relative z-10 flex flex-col h-full">
									<div
										className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-lg
                                        ${item.color === "blue" ? "bg-blue-50 text-blue-600 shadow-blue-200/50" : ""}
                                        ${item.color === "cyan" ? "bg-cyan-50 text-cyan-600 shadow-cyan-200/50" : ""}
                                        ${item.color === "amber" ? "bg-amber-50 text-amber-600 shadow-amber-200/50" : ""}
                                        ${item.color === "indigo" ? "bg-indigo-50 text-indigo-600 shadow-indigo-200/50" : ""}
                                        `}
									>
										<item.icon className="w-6 h-6" />
									</div>
									<div className="flex items-baseline justify-between mb-1">
										<p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
											{item.label}
										</p>
										{item.trend && (
											<span className="text-[9px] font-black text-emerald-500">
												{item.trend}
											</span>
										)}
									</div>
									<h3 className="text-2xl font-[1000] text-gray-900 tracking-tighter">
										{item.value}
									</h3>
									{item.sub && (
										<p className="text-[9px] font-bold text-gray-400 mt-1 uppercase tracking-widest">
											{item.sub}
										</p>
									)}
								</div>
							</div>
						))}
					</div>

					{/* Detailed Analysis Sections */}
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in-up delay-200">
						{/* Activity Section */}
						<div className="bg-white/70 backdrop-blur-xl p-8 rounded-[3rem] border border-white/60 shadow-sm flex flex-col space-y-8">
							<div className="flex items-center gap-4">
								<div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-inner">
									<FiCalendar className="w-6 h-6" />
								</div>
								<div>
									<h3 className="text-xl font-[1000] text-gray-900 tracking-tight">
										Historique d'Activité
									</h3>
									<p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
										Récapitulatif de vos interactions
									</p>
								</div>
							</div>

							<div className="space-y-4">
								{[
									{
										label: "Commandes complétées",
										val: activityStats.completedOrders || 0,
										color: "emerald",
									},
									{
										label: "Commandes annulées",
										val: activityStats.cancelledOrders || 0,
										color: "rose",
									},
									{
										label: "Avis laissés",
										val: activityStats.reviewsWritten || 0,
										color: "blue",
									},
									{
										label: "Note moyenne",
										val: `${activityStats.averageRatingGiven?.toFixed(1) || "0.0"}/5`,
										color: "amber",
									},
								].map((row, i) => (
									<div
										key={i}
										className="flex items-center justify-between p-4 rounded-2xl bg-white/40 border border-gray-100/50 hover:bg-white transition-all"
									>
										<span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
											{row.label}
										</span>
										<span
											className={`text-sm font-[1000] 
                                            ${row.color === "emerald" ? "text-emerald-600" : ""}
                                            ${row.color === "rose" ? "text-rose-600" : ""}
                                            ${row.color === "blue" ? "text-blue-600" : ""}
                                            ${row.color === "amber" ? "text-amber-600" : ""}
                                        `}
										>
											{row.val}
										</span>
									</div>
								))}
							</div>
						</div>

						{/* Loyalty Section */}
						<div className="bg-gradient-to-br from-blue-600 to-sky-600 p-8 rounded-[3rem] shadow-xl shadow-blue-200 relative overflow-hidden group">
							<div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform duration-1000">
								<FiAward className="w-48 h-48 text-white" />
							</div>

							<div className="relative z-10 flex flex-col h-full justify-between">
								<div className="space-y-6">
									<div className="flex items-center gap-3">
										<div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-white">
											<FiAward className="w-5 h-5" />
										</div>
										<span className="text-[10px] font-black text-blue-100 uppercase tracking-[0.2em]">
											Programme Fidélité
										</span>
									</div>

									<div className="space-y-1">
										<p className="text-blue-100/80 font-black text-[10px] uppercase tracking-widest">
											Niveau actuel
										</p>
										<h2 className="text-4xl font-[1000] text-white tracking-tighter uppercase italic">
											{loyaltyStats.tier || "Bronze"}
										</h2>
									</div>

									<div className="grid grid-cols-2 gap-6 pt-4">
										<div>
											<p className="text-blue-100/60 font-black text-[9px] uppercase tracking-widest leading-none mb-1">
												Points Actuels
											</p>
											<p className="text-2xl font-[1000] text-white tracking-tighter">
												{loyaltyStats.points || 0}
											</p>
										</div>
										<div>
											<p className="text-blue-100/60 font-black text-[9px] uppercase tracking-widest leading-none mb-1">
												Total Gagné
											</p>
											<p className="text-2xl font-[1000] text-white tracking-tighter">
												{loyaltyStats.totalPointsEarned || 0}
											</p>
										</div>
									</div>
								</div>

								<div className="pt-8">
									<button className="w-full py-4 bg-white text-blue-600 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg hover:-translate-y-1 transition-all flex items-center justify-center gap-3">
										Réclamer mes récompenses
										<FiArrowUpRight className="w-4 h-4" />
									</button>
								</div>
							</div>
						</div>
					</div>

					{/* Spending Analytics Section */}
					{analyticsData && Object.keys(analyticsData).length > 0 && (
						<div className="bg-white/70 backdrop-blur-xl p-8 rounded-[3rem] border border-white/60 shadow-sm animate-fade-in-up delay-300">
							<div className="flex items-center gap-4 mb-10">
								<div className="w-12 h-12 bg-cyan-50 rounded-2xl flex items-center justify-center text-cyan-600 shadow-inner">
									<FiTrendingUp className="w-6 h-6" />
								</div>
								<div>
									<h3 className="text-xl font-[1000] text-gray-900 tracking-tight">
										Dépenses Mensuelles
									</h3>
									<p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
										Analyse financière de vos achats
									</p>
								</div>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
								{[
									{
										label: "Panier Moyen",
										val: formatCurrency(analyticsData.averageOrderValue || 0),
										icon: FiDollarSign,
									},
									{
										label: "Achat ce mois",
										val: analyticsData.ordersThisMonth || 0,
										icon: FiShoppingBag,
									},
									{
										label: "Total ce mois",
										val: formatCurrency(analyticsData.spentThisMonth || 0),
										icon: FiCreditCard,
									},
									{
										label: "Dernier achat",
										val:
											analyticsData.lastOrderDate ?
												formatDate(analyticsData.lastOrderDate)
											:	"N/A",
										icon: FiCalendar,
									},
								].map((metric, i) => (
									<div
										key={i}
										className="flex items-center gap-4 p-5 rounded-3xl bg-gray-50/50 border border-gray-100 group hover:bg-white hover:shadow-lg transition-all duration-300"
									>
										<div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-400 group-hover:text-blue-600 transition-colors shadow-sm">
											<metric.icon className="w-4 h-4" />
										</div>
										<div className="min-w-0">
											<p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5 truncate">
												{metric.label}
											</p>
											<p className="text-base font-[1000] text-gray-900 truncate">
												{metric.val}
											</p>
										</div>
									</div>
								))}
							</div>
						</div>
					)}
				</div>
			</div>
		</ModularDashboardLayout>
	);
};

export default Statistics;
