import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import DataValue from "../../../components/common/DataValue";
import { transformerService as genericTransformerService } from "../../../services/genericService";
import transformerService from "../../../services/transformerService";
import { useNotifications } from "../../../hooks/useNotifications";
import { formatPrice } from "../../../utils/currencyUtils";
import { formatDateTime, formatNumber } from "../../../utils/i18n";
import {
	DollarSign,
	Package,
	Star,
	ShoppingBag,
	RefreshCw,
	BarChart3,
	PieChart,
	Sparkles,
} from "lucide-react";

// Jour 51 : page reconstruite sur les seules données réelles du serveur.
// L'ancienne version affichait des chiffres écrits en dur (revenu « estimé »
// de 850 000 FCFA, efficacité 84 %, temps moyen 2,4 h…), identiques pour tous
// les transformateurs, et ses cartes restaient à 0 (données lues au mauvais
// endroit de la réponse, champs inexistants) ; les boutons de période ne
// changeaient rien.
const PERIODS = ["7d", "30d", "90d", "1y"];

const StatCard = ({ icon: Icon, color, label, value, hint, loading }) => (
	<div className="bg-white/70 backdrop-blur-xl p-7 rounded-[2.5rem] border border-white/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 relative overflow-hidden group">
		<div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
			<Icon className="w-24 h-24" />
		</div>
		<div className="relative z-10">
			<div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg mb-4 ${color}`}>
				<Icon className="w-6 h-6" />
			</div>
			<p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] mb-1">
				{label}
			</p>
			<h3 className="text-2xl font-[1000] text-gray-900 tracking-tighter">
				<DataValue loading={loading} className="w-24 h-[0.8em]">{value}</DataValue>
			</h3>
			{hint && (
				<p className="text-[10px] font-bold text-gray-400 mt-1">
					<DataValue loading={loading} className="w-20 h-[0.9em]">{hint}</DataValue>
				</p>
			)}
		</div>
	</div>
);

const TransformerStats = () => {
	const { t, i18n } = useTranslation("dashboard-producer");
	const { showError } = useNotifications();
	const [loading, setLoading] = useState(true);
	const [loadingProduction, setLoadingProduction] = useState(false);
	const [stats, setStats] = useState({});
	const [dailyProduction, setDailyProduction] = useState([]);
	const [selectedPeriod, setSelectedPeriod] = useState("30d");

	const loadStats = useCallback(async () => {
		try {
			setLoading(true);
			const response = await genericTransformerService.getStats();
			setStats(response.data?.data?.stats || response.data?.stats || {});
		} catch (error) {
			console.error("Erreur lors du chargement des statistiques:", error);
			showError(t("transformer.stats.loadError"));
		} finally {
			setLoading(false);
		}
	}, [showError, t]);

	const loadProduction = useCallback(
		async (period) => {
			try {
				setLoadingProduction(true);
				const response = await transformerService.getProductionAnalytics({ period });
				setDailyProduction(response.data?.data?.dailyProduction || []);
			} catch (error) {
				console.error("Erreur lors du chargement de la production:", error);
				setDailyProduction([]);
			} finally {
				setLoadingProduction(false);
			}
		},
		[],
	);

	useEffect(() => {
		loadStats();
	}, [loadStats]);

	useEffect(() => {
		loadProduction(selectedPeriod);
	}, [loadProduction, selectedPeriod]);

	const refresh = () => {
		loadStats();
		loadProduction(selectedPeriod);
	};

	// Totaux de la période sélectionnée (commandes livrées ou terminées)
	const periodTotals = useMemo(
		() =>
			dailyProduction.reduce(
				(acc, day) => ({
					orders: acc.orders + (day.orders || 0),
					revenue: acc.revenue + (day.revenue || 0),
					products: acc.products + (day.products || 0),
				}),
				{ orders: 0, revenue: 0, products: 0 },
			),
		[dailyProduction],
	);
	const maxDailyOrders = Math.max(1, ...dailyProduction.map((d) => d.orders || 0));

	// Répartition des commandes (toutes périodes confondues)
	const totalOrders = stats.totalOrders || 0;
	const completedOrders = stats.completedOrders || 0;
	const pendingOrders = stats.pendingOrders || 0;
	const otherOrders = Math.max(0, totalOrders - completedOrders - pendingOrders);
	const percent = (value) => (totalOrders ? Math.round((value / totalOrders) * 100) : 0);
	const breakdown = [
		{ key: "completed", value: completedOrders, bar: "bg-purple-600" },
		{ key: "pending", value: pendingOrders, bar: "bg-amber-400" },
		{ key: "inProgress", value: otherOrders, bar: "bg-indigo-400" },
	];

	const number = (value) => formatNumber(value || 0, i18n.language);
	const dayLabel = (isoDate) =>
		formatDateTime(isoDate, i18n.language, { day: "numeric", month: "short" });


	return (
		<div className="dashboard-page bg-harvests-light/20">
			{/* Background Decorative Glows */}
			<div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
				<div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-100/30 rounded-full blur-[120px]"></div>
				<div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-100/20 rounded-full blur-[100px]"></div>
			</div>

			<div className="dashboard-container space-y-10">
				{/* Header */}
				<div className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-fade-in-down">
					<div className="space-y-3">
						<div className="flex items-center gap-2 text-purple-600 font-black text-[9px] uppercase tracking-widest mb-2">
							<div className="w-5 h-[2px] bg-purple-600 rounded-full"></div>
							<span>{t("transformer.stats.eyebrow")}</span>
						</div>
						<h1 className="text-3xl font-[1000] text-gray-900 tracking-tighter leading-none mb-2">
							{t("transformer.stats.titleStart")}{" "}
							<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-500">
								{t("transformer.stats.titleHighlight")}
							</span>
						</h1>
						<p className="text-xs text-gray-500 font-medium max-w-xl">
							{t("transformer.stats.subtitle")}
						</p>
					</div>
					<button
						onClick={refresh}
						aria-label={t("transformer.stats.refresh")}
						title={t("transformer.stats.refresh")}
						className="self-start md:self-auto p-3 bg-white/70 backdrop-blur-xl border border-white/60 rounded-2xl text-gray-600 hover:text-purple-600 shadow-sm transition-all group"
					>
						<RefreshCw className="w-4 h-4 group-active:rotate-180 transition-transform duration-500" />
					</button>
				</div>

				{/* Cartes (cumulées depuis le début, revenu = mois en cours) */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in-up delay-100">
					<StatCard
						loading={loading}
						icon={DollarSign}
						color="bg-emerald-50 text-emerald-600 shadow-emerald-200/50"
						label={t("transformer.stats.monthlyRevenue")}
						value={formatPrice(stats.monthlyRevenue || 0, "XOF")}
						hint={t("transformer.stats.monthlyRevenueHint")}
					/>
					<StatCard
						loading={loading}
						icon={ShoppingBag}
						color="bg-blue-50 text-blue-600 shadow-blue-200/50"
						label={t("transformer.stats.orders")}
						value={number(totalOrders)}
						hint={t("transformer.stats.pendingCount", { count: pendingOrders })}
					/>
					<StatCard
						loading={loading}
						icon={Package}
						color="bg-purple-50 text-purple-600 shadow-purple-200/50"
						label={t("transformer.stats.activeProducts")}
						value={number(stats.activeProducts)}
						hint={t("transformer.stats.productsTotal", { count: stats.totalProducts || 0 })}
					/>
					<StatCard
						loading={loading}
						icon={Star}
						color="bg-amber-50 text-amber-600 shadow-amber-200/50"
						label={t("transformer.stats.averageRating")}
						value={
							stats.totalReviews ?
								`${Number(stats.averageRating || 0).toFixed(1)}/5`
							:	"—"
						}
						hint={t("transformer.stats.reviewsCount", { count: stats.totalReviews || 0 })}
					/>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in-up delay-200">
					{/* Production par jour */}
					<div className="lg:col-span-2 bg-white/70 backdrop-blur-xl p-8 rounded-[3rem] border border-white/60 shadow-sm flex flex-col space-y-6">
						<div className="flex flex-wrap items-center justify-between gap-4">
							<div className="flex items-center gap-4">
								<div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 shadow-inner">
									<BarChart3 className="w-6 h-6" />
								</div>
								<div>
									<h3 className="text-xl font-[1000] text-gray-900 tracking-tight">
										{t("transformer.stats.dailyProduction")}
									</h3>
									<p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">
										{t("transformer.stats.dailyProductionSubtitle")}
									</p>
								</div>
							</div>
							<div className="bg-white/70 p-1.5 rounded-2xl border border-white/60 shadow-sm flex gap-1">
								{PERIODS.map((period) => (
									<button
										key={period}
										onClick={() => setSelectedPeriod(period)}
										aria-pressed={selectedPeriod === period}
										className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
											selectedPeriod === period ?
												"bg-gray-900 text-white shadow-lg"
											:	"text-gray-400 hover:text-gray-900 hover:bg-white"
										}`}
									>
										{t(`transformer.stats.periods.${period}`)}
									</button>
								))}
							</div>
						</div>

						{loadingProduction ?
							<div className="flex-1 min-h-[240px] bg-gray-100/70 rounded-2xl animate-pulse" />
						: dailyProduction.length === 0 ?
							<div className="flex-1 min-h-[240px] flex flex-col items-center justify-center text-center text-gray-400 space-y-2">
								<BarChart3 className="w-10 h-10 text-gray-200" />
								<p className="text-xs font-bold uppercase tracking-widest">
									{t("transformer.stats.noProduction")}
								</p>
							</div>
						:	<div className="flex-1 min-h-[240px] flex items-end gap-2 overflow-x-auto pb-2">
								{dailyProduction.map((day) => (
									<div
										key={day.date}
										className="flex-1 min-w-[28px] flex flex-col items-center gap-2 group/bar"
										title={t("transformer.stats.dayTooltip", {
											date: dayLabel(day.date),
											count: day.orders || 0,
											amount: formatPrice(day.revenue || 0, "XOF"),
										})}
									>
										<span className="text-[9px] font-black text-gray-500 opacity-0 group-hover/bar:opacity-100 transition-opacity">
											{day.orders}
										</span>
										<div
											className="w-full bg-gradient-to-t from-purple-600 to-indigo-400 rounded-t-xl"
											style={{ height: `${Math.max(6, (day.orders / maxDailyOrders) * 200)}px` }}
										></div>
										<span className="text-[9px] font-bold text-gray-400 whitespace-nowrap">
											{dayLabel(day.date)}
										</span>
									</div>
								))}
							</div>
						}

						<div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
							{[
								{ key: "periodOrders", value: number(periodTotals.orders) },
								{ key: "periodRevenue", value: formatPrice(periodTotals.revenue, "XOF") },
								{ key: "periodProducts", value: number(periodTotals.products) },
							].map((item) => (
								<div key={item.key}>
									<p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">
										{t(`transformer.stats.${item.key}`)}
									</p>
									<p className="text-lg font-[1000] text-gray-900 tracking-tight">
										<DataValue loading={loadingProduction}>{item.value}</DataValue>
									</p>
								</div>
							))}
						</div>
					</div>

					{/* Répartition des commandes */}
					<div className="bg-white/70 backdrop-blur-xl p-8 rounded-[3rem] border border-white/60 shadow-sm flex flex-col">
						<div className="flex items-center gap-4 mb-8">
							<div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-inner">
								<PieChart className="w-6 h-6" />
							</div>
							<div>
								<h3 className="text-xl font-[1000] text-gray-900 tracking-tight">
									{t("transformer.stats.breakdownTitle")}
								</h3>
								<p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">
									{t("transformer.stats.breakdownSubtitle")}
								</p>
							</div>
						</div>

						{loading ?
							<div className="flex-1 space-y-4 animate-pulse">
								<div className="h-12 w-28 mx-auto bg-gray-100 rounded-xl" />
								{[1, 2, 3].map((i) => (
									<div key={i} className="h-2 bg-gray-100 rounded-full" />
								))}
							</div>
						: totalOrders === 0 ?
							<div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400 space-y-2">
								<Sparkles className="w-10 h-10 text-gray-200" />
								<p className="text-xs font-bold uppercase tracking-widest">
									{t("transformer.stats.noOrders")}
								</p>
							</div>
						:	<div className="flex-1 flex flex-col justify-center space-y-6">
								<div className="text-center">
									<span className="text-5xl font-[1000] text-gray-900 tracking-tighter">
										{percent(completedOrders)} %
									</span>
									<p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mt-1">
										{t("transformer.stats.completionRate")}
									</p>
								</div>
								<div className="space-y-4">
									{breakdown.map((item) => (
										<div key={item.key} className="space-y-1.5">
											<div className="flex items-center justify-between">
												<span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
													{t(`transformer.stats.breakdown.${item.key}`)}
												</span>
												<span className="text-xs font-[1000] text-gray-900">
													{number(item.value)} · {percent(item.value)} %
												</span>
											</div>
											<div className="h-2 bg-gray-100 rounded-full overflow-hidden">
												<div
													className={`h-full rounded-full ${item.bar}`}
													style={{ width: `${percent(item.value)}%` }}
												></div>
											</div>
										</div>
									))}
								</div>
							</div>
						}
					</div>
				</div>
			</div>
		</div>
	);
};

export default TransformerStats;
