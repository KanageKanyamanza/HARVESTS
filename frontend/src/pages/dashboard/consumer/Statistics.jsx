import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
	FiTrendingUp,
	FiStar,
	FiShoppingBag,
	FiCalendar,
	FiAward,
	FiArrowUpRight,
	FiCreditCard,
	FiRefreshCw,
} from "react-icons/fi";
import { consumerService } from "../../../services/genericService";
import DataValue from "../../../components/common/DataValue";
import ErrorMessage from "../../../components/common/ErrorMessage";
import SalesChart from "../../../components/admin/SalesChart";
import { formatPrice } from "../../../utils/currencyUtils";
import { formatNumber } from "../../../utils/i18n";

const TIERS = ["bronze", "silver", "gold", "platinum"];

// Douze derniers mois au format « AAAA-MM » (format attendu par SalesChart)
const lastTwelveMonths = () => {
	const today = new Date();
	return Array.from({ length: 12 }, (_, i) => {
		const d = new Date(today.getFullYear(), today.getMonth() - 11 + i, 1);
		return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
	});
};

const METRIC_COLORS = {
	blue: "bg-blue-50 text-blue-600 shadow-blue-200/50",
	cyan: "bg-cyan-50 text-cyan-600 shadow-cyan-200/50",
	amber: "bg-amber-50 text-amber-600 shadow-amber-200/50",
	indigo: "bg-indigo-50 text-indigo-600 shadow-indigo-200/50",
};

/**
 * Jour 54 : la page lisait des champs que le backend ne renvoie pas
 * (activityStats, loyaltyStats, ordersThisMonth…) et affichait donc des zéros
 * et le niveau « Bronze » ; elle affichait aussi une tendance « +5 % » inventée.
 * Elle utilise désormais /consumers/me/stats et /consumers/me/spending-analytics.
 */
const Statistics = () => {
	const { t } = useTranslation("dashboard-consumer");
	const [stats, setStats] = useState({});
	const [chartData, setChartData] = useState([]);
	const [currentMonthSpent, setCurrentMonthSpent] = useState(0);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const loadStatistics = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);
			const [statsResponse, analyticsResponse] = await Promise.all([
				consumerService.getStats(),
				consumerService.getSpendingAnalytics().catch(() => null),
			]);
			setStats(statsResponse.data?.data?.stats || statsResponse.data?.stats || {});

			const analytics =
				analyticsResponse?.data?.data?.analytics || analyticsResponse?.data?.analytics || {};
			const byMonth = Object.fromEntries(
				(analytics.monthlySpending || []).map((m) => [m.month, m.spending]),
			);
			setChartData(
				lastTwelveMonths().map((month) => ({ month, sales: byMonth[month] || 0 })),
			);
			setCurrentMonthSpent(analytics.currentMonthSpending || 0);
		} catch (err) {
			console.error("Erreur lors du chargement des statistiques:", err);
			setError(t("stats.loadError"));
		} finally {
			setLoading(false);
		}
		// `t` exclu : changer de langue ne doit pas recharger les données
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		loadStatistics();
	}, [loadStatistics]);

	const totalOrders = stats.totalOrders || 0;
	const completedOrders = stats.completedOrders || 0;
	const tier = TIERS.includes(stats.loyaltyTier) ? stats.loyaltyTier : "bronze";

	const metrics = [
		{
			label: t("stats.totalOrders"),
			value: formatNumber(totalOrders),
			sub: t("stats.completedCount", { count: completedOrders }),
			icon: FiShoppingBag,
			color: "blue",
		},
		{
			label: t("stats.totalSpent"),
			value: formatPrice(stats.totalSpent || 0, "XOF"),
			sub: t("stats.averageBasket", {
				amount: formatPrice(Math.round(stats.averageOrderValue || 0), "XOF"),
			}),
			icon: FiCreditCard,
			color: "cyan",
		},
		{
			label: t("stats.reviewsWritten"),
			value: formatNumber(stats.reviewsWritten || 0),
			icon: FiStar,
			color: "amber",
		},
		{
			label: t("stats.loyaltyPoints"),
			value: formatNumber(stats.loyaltyPoints || 0),
			icon: FiAward,
			color: "indigo",
		},
	];

	const activity = [
		{ label: t("stats.completedOrders"), value: completedOrders, color: "text-emerald-600" },
		{
			label: t("stats.ordersInProgress"),
			value: Math.max(0, totalOrders - completedOrders),
			color: "text-blue-600",
		},
		{ label: t("stats.reviewsWritten"), value: stats.reviewsWritten || 0, color: "text-amber-600" },
	];

	return (
		<div className="dashboard-page bg-harvests-light/20">
			<div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden ">
				<div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-100/30 rounded-full blur-[120px]"></div>
				<div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-sky-100/30 rounded-full blur-[100px]"></div>
				<div className="absolute top-[20%] left-[10%] w-[30%] h-[30%] bg-cyan-100/20 rounded-full blur-[120px]"></div>
			</div>

			<div className="dashboard-container space-y-10">
				{/* En-tête */}
				<div className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-fade-in-down">
					<div className="space-y-3">
						<div className="flex items-center gap-2 text-blue-600 font-black text-[9px] uppercase tracking-widest mb-2">
							<div className="w-5 h-[2px] bg-blue-600 rounded-full"></div>
							<span>{t("stats.eyebrow")}</span>
						</div>
						<h1 className="text-3xl font-[1000] text-gray-900 tracking-tighter leading-none mb-2">
							{t("stats.titleStart")}{" "}
							<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-sky-500 italic">
								{t("stats.titleHighlight")}
							</span>
						</h1>
						<p className="text-xs text-gray-500 font-medium max-w-xl">{t("stats.subtitle")}</p>
					</div>

					<button
						onClick={loadStatistics}
						className="group relative inline-flex items-center justify-center px-6 py-3 bg-white/70 backdrop-blur-xl border border-white/60 text-gray-900 font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all duration-300 hover:bg-blue-600 hover:text-white hover:border-blue-600 shadow-sm"
					>
						<FiRefreshCw className="w-4 h-4 mr-2 group-active:rotate-180 transition-transform duration-500" />
						{t("stats.refresh")}
					</button>
				</div>

				{error && (
					<div className="animate-fade-in">
						<ErrorMessage message={error} />
					</div>
				)}

				{/* Chiffres clés */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in-up delay-100">
					{metrics.map((item) => (
						<div
							key={item.label}
							className="group bg-white/70 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 relative overflow-hidden"
						>
							<div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
								<item.icon className="w-24 h-24" />
							</div>
							<div className="relative z-10 flex flex-col h-full">
								<div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-lg ${METRIC_COLORS[item.color]}`}>
									<item.icon className="w-6 h-6" />
								</div>
								<p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] mb-1">
									{item.label}
								</p>
								<h3 className="text-2xl font-[1000] text-gray-900 tracking-tighter">
									<DataValue loading={loading}>{item.value}</DataValue>
								</h3>
								{item.sub && (
									<p className="text-[9px] font-bold text-gray-500 mt-1 uppercase tracking-widest">
										<DataValue loading={loading} className="w-16 h-[0.9em]">{item.sub}</DataValue>
									</p>
								)}
							</div>
						</div>
					))}
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in-up delay-200">
					{/* Activité */}
					<div className="bg-white/70 backdrop-blur-xl p-8 rounded-[3rem] border border-white/60 shadow-sm flex flex-col space-y-8">
						<div className="flex items-center gap-4">
							<div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-inner">
								<FiCalendar className="w-6 h-6" />
							</div>
							<div>
								<h3 className="text-xl font-[1000] text-gray-900 tracking-tight">
									{t("stats.activityTitle")}
								</h3>
								<p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">
									{t("stats.activitySubtitle")}
								</p>
							</div>
						</div>

						<div className="space-y-4">
							{activity.map((row) => (
								<div
									key={row.label}
									className="flex items-center justify-between p-4 rounded-2xl bg-white/40 border border-gray-100/50 hover:bg-white transition-all"
								>
									<span className="text-xs font-bold text-gray-600 uppercase tracking-widest">
										{row.label}
									</span>
									<span className={`text-sm font-[1000] ${row.color}`}>
										<DataValue loading={loading} className="w-8 h-[0.9em]">
											{formatNumber(row.value)}
										</DataValue>
									</span>
								</div>
							))}
						</div>
					</div>

					{/* Fidélité */}
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
									<span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">
										{t("stats.loyaltyProgram")}
									</span>
								</div>

								<div className="space-y-1">
									<p className="text-blue-50 font-black text-[10px] uppercase tracking-widest">
										{t("stats.currentTier")}
									</p>
									<h2 className="text-4xl font-[1000] text-white tracking-tighter uppercase italic">
										<DataValue loading={loading} light className="w-32 h-[0.8em]">
											{t(`stats.tiers.${tier}`)}
										</DataValue>
									</h2>
								</div>

								<div className="grid grid-cols-2 gap-6 pt-4">
									<div>
										<p className="text-blue-50 font-black text-[9px] uppercase tracking-widest leading-none mb-1">
											{t("stats.currentPoints")}
										</p>
										<p className="text-2xl font-[1000] text-white tracking-tighter">
											<DataValue loading={loading} light>{formatNumber(stats.loyaltyPoints || 0)}</DataValue>
										</p>
									</div>
									<div>
										<p className="text-blue-50 font-black text-[9px] uppercase tracking-widest leading-none mb-1">
											{t("stats.totalEarned")}
										</p>
										<p className="text-2xl font-[1000] text-white tracking-tighter">
											<DataValue loading={loading} light>{formatNumber(stats.totalPointsEarned || 0)}</DataValue>
										</p>
									</div>
								</div>
							</div>

							<div className="pt-8">
								<Link
									to="/loyalty"
									className="w-full py-4 bg-white text-blue-600 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg hover:-translate-y-1 transition-all flex items-center justify-center gap-3"
								>
									{t("stats.seeProgram")}
									<FiArrowUpRight className="w-4 h-4" />
								</Link>
							</div>
						</div>
					</div>
				</div>

				{/* Dépenses mensuelles */}
				<div className="bg-white/70 backdrop-blur-xl p-8 rounded-[3rem] border border-white/60 shadow-sm animate-fade-in-up delay-300">
					<div className="flex flex-wrap items-center justify-between gap-4 mb-8">
						<div className="flex items-center gap-4">
							<div className="w-12 h-12 bg-cyan-50 rounded-2xl flex items-center justify-center text-cyan-600 shadow-inner">
								<FiTrendingUp className="w-6 h-6" />
							</div>
							<div>
								<h3 className="text-xl font-[1000] text-gray-900 tracking-tight">
									{t("stats.spendingTitle")}
								</h3>
								<p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">
									{t("stats.spendingSubtitle")}
								</p>
							</div>
						</div>
						<div className="text-right">
							<p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">
								{t("stats.thisMonth")}
							</p>
							<p className="text-2xl font-[1000] text-gray-900 tracking-tighter">
								<DataValue loading={loading}>{formatPrice(currentMonthSpent, "XOF")}</DataValue>
							</p>
						</div>
					</div>
					{loading ?
						<div className="h-[260px] bg-gray-100/70 rounded-2xl animate-pulse" />
					:	<div className="h-[260px]">
							<SalesChart data={chartData} type="area" />
						</div>
					}
				</div>
			</div>
		</div>
	);
};

export default Statistics;
