import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
	DollarSign,
	ShoppingBag,
	Utensils,
	Users,
	BarChart3,
	PieChart,
	TrendingUp,
	RefreshCw,
	Sparkles,
} from "lucide-react";
import DataValue from "../../../components/common/DataValue";
import SalesChart from "../../../components/admin/SalesChart";
import { useAuth } from "../../../hooks/useAuth";
import { restaurateurService } from "../../../services";
import { toPlainText } from "../../../utils/textHelpers";
import { formatNumber } from "../../../utils/i18n";
import { formatPrice } from "../../../utils/currencyUtils";

// Jour 53 : même design que les statistiques du transformateur
const StatCard = ({ icon: Icon, color, label, value, hint, loading }) => (
	<div className="bg-white/70 backdrop-blur-xl p-7 rounded-[2.5rem] border border-white/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 relative overflow-hidden group">
		<div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
			<Icon className="w-24 h-24" />
		</div>
		<div className="relative z-10">
			<div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg mb-4 ${color}`}>
				<Icon className="w-6 h-6" />
			</div>
			<p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] mb-1">{label}</p>
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

const Panel = ({ icon: Icon, iconClass, title, subtitle, className = "", children }) => (
	<div className={`bg-white/70 backdrop-blur-xl p-6 md:p-8 rounded-[2.5rem] border border-white/60 shadow-sm flex flex-col ${className}`}>
		<div className="flex items-center gap-4 mb-6">
			<div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${iconClass}`}>
				<Icon className="w-6 h-6" />
			</div>
			<div>
				<h3 className="text-xl font-[1000] text-gray-900 tracking-tight">{title}</h3>
				{subtitle && (
					<p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{subtitle}</p>
				)}
			</div>
		</div>
		{children}
	</div>
);

// Six derniers mois au format « AAAA-MM » (format attendu par SalesChart)
const lastSixMonths = () => {
	const today = new Date();
	return Array.from({ length: 6 }, (_, i) => {
		const d = new Date(today.getFullYear(), today.getMonth() - 5 + i, 1);
		return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
	});
};

// Commandes où le restaurateur est vendeur (commandes reçues)
const isReceivedOrder = (order) =>
	Boolean(
		order &&
			(order.role === "seller" ||
				order.segment?.seller ||
				order.segment?.items?.length ||
				order.segments?.some((segment) => segment?.seller) ||
				order.items?.some((item) => item?.seller) ||
				order.seller),
	);

const Stats = () => {
	const { t } = useTranslation(["dashboard-restaurateur", "dashboard-producer"]);
	const { user } = useAuth();
	const [stats, setStats] = useState(null);
	const [salesChartData, setSalesChartData] = useState([]);
	const [currentMonthRevenue, setCurrentMonthRevenue] = useState(0);
	const [orders, setOrders] = useState([]);
	const [loading, setLoading] = useState(true);

	const loadStats = useCallback(async () => {
		if (user?.userType !== "restaurateur") return;
		try {
			setLoading(true);
			const [statsResponse, salesResponse, revenueResponse, ordersResponse] = await Promise.all([
				restaurateurService.getStats(),
				restaurateurService.getSalesAnalytics(),
				restaurateurService.getRevenueAnalytics(),
				restaurateurService.getOrders(),
			]);

			setStats(statsResponse.data.data?.stats || statsResponse.data.stats || statsResponse.data);

			// Ventes mensuelles du backend ({ month: "AAAA-MM", orders, revenue })
			const monthlySales =
				salesResponse.data.data?.analytics?.monthlySales ||
				salesResponse.data.analytics?.monthlySales ||
				[];
			const byMonth = Object.fromEntries(monthlySales.map((m) => [m.month, m]));
			setSalesChartData(
				lastSixMonths().map((month) => ({
					month,
					sales: byMonth[month]?.revenue || 0,
					orders: byMonth[month]?.orders || 0,
				})),
			);

			const revenue =
				revenueResponse.data.data?.analytics || revenueResponse.data.analytics || {};
			setCurrentMonthRevenue(revenue.currentMonthRevenue || 0);

			const ordersData = ordersResponse.data.data?.orders || ordersResponse.data.orders || [];
			setOrders(ordersData.filter(isReceivedOrder));
		} catch (error) {
			console.error("Erreur lors du chargement des statistiques:", error);
			setStats(null);
			setOrders([]);
		} finally {
			setLoading(false);
		}
	}, [user?.userType]);

	useEffect(() => {
		loadStats();
	}, [loadStats]);

	// Répartition des commandes reçues par statut
	const count = (...statuses) => orders.filter((o) => statuses.includes(o.status)).length;
	const totalOrders = orders.length;
	const completedOrders = count("completed", "delivered");
	const breakdown = [
		{ key: "pending", hint: "toProcess", value: count("pending", "processing", "confirmed", "preparing"), bar: "bg-amber-400" },
		{ key: "inTransit", hint: "inDelivery", value: count("in-transit", "shipped", "ready-for-pickup", "out-for-delivery"), bar: "bg-blue-500" },
		{ key: "completedLabel", hint: "deliveredSuccessfully", value: completedOrders, bar: "bg-emerald-500" },
		{ key: "cancelled", hint: "notCompleted", value: count("cancelled"), bar: "bg-red-400" },
	];
	const percent = (value) => (totalOrders ? Math.round((value / totalOrders) * 100) : 0);
	const topDishes = Array.isArray(stats?.topProducts) ? stats.topProducts : [];
	const dishesSold = stats?.totalProductsSold || stats?.totalDishesSold || 0;

	return (
		<div className="dashboard-page bg-harvests-light/20">
			<div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
				<div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-orange-100/30 rounded-full blur-[120px]"></div>
				<div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-100/20 rounded-full blur-[100px]"></div>
			</div>

			<div className="dashboard-container space-y-8">
				{/* En-tête */}
				<div className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-fade-in-down">
					<div>
						<div className="flex items-center gap-2 text-orange-600 font-black text-[9px] uppercase tracking-widest mb-2">
							<div className="w-5 h-[2px] bg-orange-600"></div>
							<span>{t("stats.eyebrow")}</span>
						</div>
						<h1 className="text-3xl font-[1000] text-gray-900 tracking-tighter leading-none mb-2">
							{t("stats.titleStart")}{" "}
							<span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-500">
								{t("stats.titleHighlight")}
							</span>
						</h1>
						<p className="text-xs text-gray-500 font-medium max-w-xl">{t("stats.subtitle")}</p>
					</div>
					<button
						onClick={loadStats}
						aria-label={t("stats.refresh")}
						title={t("stats.refresh")}
						className="self-start md:self-auto p-3 bg-white/70 backdrop-blur-xl border border-white/60 rounded-2xl text-gray-600 hover:text-orange-600 shadow-sm transition-all group"
					>
						<RefreshCw className="w-4 h-4 group-active:rotate-180 transition-transform duration-500" />
					</button>
				</div>

				{/* Chiffres clés */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in-up delay-100">
					<StatCard
						loading={loading}
						icon={DollarSign}
						color="bg-emerald-50 text-emerald-600 shadow-emerald-200/50"
						label={t("stats.totalRevenue")}
						value={formatPrice(stats?.totalRevenue || 0, "XOF")}
						hint={t("stats.currentMonthValue", { amount: formatPrice(currentMonthRevenue, "XOF") })}
					/>
					<StatCard
						loading={loading}
						icon={ShoppingBag}
						color="bg-blue-50 text-blue-600 shadow-blue-200/50"
						label={t("stats.totalOrders")}
						value={formatNumber(totalOrders || stats?.totalOrders || 0)}
						hint={t("stats.completed", { count: completedOrders })}
					/>
					<StatCard
						loading={loading}
						icon={Utensils}
						color="bg-orange-50 text-orange-600 shadow-orange-200/50"
						label={t("stats.dishesSold")}
						value={formatNumber(dishesSold)}
						hint={t("stats.activeDishesValue", { count: stats?.activeProducts || 0 })}
					/>
					<StatCard
						loading={loading}
						icon={Users}
						color="bg-purple-50 text-purple-600 shadow-purple-200/50"
						label={t("stats.uniqueCustomers")}
						value={formatNumber(stats?.uniqueCustomers || 0)}
					/>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in-up delay-200">
					{/* Ventes des six derniers mois */}
					<Panel
						icon={BarChart3}
						iconClass="bg-orange-50 text-orange-600"
						title={t("dashboard-producer:dashboard.salesTitle")}
						subtitle={t("stats.salesSubtitle")}
						className="lg:col-span-2"
					>
						{loading ?
							<div className="h-[260px] bg-gray-100/70 rounded-2xl animate-pulse" />
						:	<div className="h-[260px]">
								<SalesChart data={salesChartData} type="area" />
							</div>
						}
					</Panel>

					{/* Répartition des commandes */}
					<Panel icon={PieChart} iconClass="bg-amber-50 text-amber-600" title={t("stats.orderStatuses")}>
						{loading ?
							<div className="flex-1 space-y-4 animate-pulse">
								<div className="h-12 w-28 mx-auto bg-gray-100 rounded-xl" />
								{[1, 2, 3, 4].map((i) => (
									<div key={i} className="h-2 bg-gray-100 rounded-full" />
								))}
							</div>
						: totalOrders === 0 ?
							<div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400 space-y-2 min-h-[200px]">
								<Sparkles className="w-10 h-10 text-gray-200" />
								<p className="text-xs font-bold uppercase tracking-widest">{t("stats.noOrders")}</p>
							</div>
						:	<div className="flex-1 flex flex-col justify-center space-y-6">
								<div className="text-center">
									<span className="text-5xl font-[1000] text-gray-900 tracking-tighter">
										{percent(completedOrders)} %
									</span>
									<p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mt-1">
										{t("stats.completionRate")}
									</p>
								</div>
								<div className="space-y-4">
									{breakdown.map((item) => (
										<div key={item.key} className="space-y-1.5" title={t(`stats.${item.hint}`)}>
											<div className="flex items-center justify-between">
												<span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
													{t(`stats.${item.key}`)}
												</span>
												<span className="text-xs font-[1000] text-gray-900">
													{formatNumber(item.value)} · {percent(item.value)} %
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
					</Panel>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in-up delay-300">
					{/* Plats les plus vendus */}
					<Panel
						icon={TrendingUp}
						iconClass="bg-emerald-50 text-emerald-600"
						title={t("stats.topDishes")}
						className="lg:col-span-2"
					>
						{loading ?
							<div className="space-y-3 animate-pulse">
								{[1, 2, 3].map((i) => (
									<div key={i} className="h-14 bg-gray-100/70 rounded-2xl" />
								))}
							</div>
						: topDishes.length === 0 ?
							<div className="flex flex-col items-center justify-center text-center text-gray-400 space-y-2 py-10">
								<Utensils className="w-10 h-10 text-gray-200" />
								<p className="text-xs font-bold uppercase tracking-widest">{t("stats.noDishSold")}</p>
							</div>
						:	<div className="space-y-3">
								{topDishes.map((dish, index) => {
									const category = toPlainText(dish.category, "plat");
									return (
										<div
											key={dish.id || index}
											className="flex items-center justify-between gap-4 p-3 rounded-2xl bg-white/60 border border-gray-100 hover:bg-white hover:shadow-sm transition-all"
										>
											<div className="flex items-center gap-3 min-w-0">
												<div className="w-9 h-9 shrink-0 bg-gray-900 text-white rounded-xl flex items-center justify-center text-sm font-black">
													{index + 1}
												</div>
												<div className="min-w-0">
													<p className="text-sm font-[1000] text-gray-900 truncate">
														{toPlainText(dish.name, t("dish.fallbackName"))}
													</p>
													<p className="text-[10px] font-black text-orange-600 uppercase tracking-widest">
														{t(`dish.categories.${category}`, { defaultValue: category })}
													</p>
												</div>
											</div>
											<div className="text-right shrink-0">
												<p className="text-sm font-[1000] text-gray-900">
													{t("stats.sold", { count: dish.quantitySold || 0 })}
												</p>
												<p className="text-[10px] font-bold text-emerald-600">
													{formatPrice(dish.revenue || 0, "XOF")}
												</p>
											</div>
										</div>
									);
								})}
							</div>
						}
					</Panel>

					{/* Statut des plats */}
					<Panel icon={Utensils} iconClass="bg-orange-50 text-orange-600" title={t("stats.dishStatus")}>
						<div className="space-y-3">
							{[
								{ key: "activeDishes", value: stats?.activeProducts, tone: "bg-emerald-50 text-emerald-700" },
								{ key: "totalDishes", value: stats?.totalProducts, tone: "bg-gray-50 text-gray-700" },
								{ key: "unitsSold", value: dishesSold, tone: "bg-blue-50 text-blue-700" },
							].map((item) => (
								<div key={item.key} className={`flex items-center justify-between p-4 rounded-2xl ${item.tone}`}>
									<span className="text-[10px] font-black uppercase tracking-widest">{t(`stats.${item.key}`)}</span>
									<span className="text-xl font-[1000]">
										<DataValue loading={loading}>{formatNumber(item.value || 0)}</DataValue>
									</span>
								</div>
							))}
						</div>
					</Panel>
				</div>

				{/* Synthèse des performances */}
				<div className="bg-gray-900 rounded-[2.5rem] shadow-xl text-white p-8 relative overflow-hidden animate-fade-in-up delay-300">
					<div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-transparent"></div>
					<h3 className="relative text-[10px] font-black text-white/70 uppercase tracking-[0.2em] mb-6">
						{t("stats.summary")}
					</h3>
					<div className="relative grid grid-cols-2 lg:grid-cols-4 gap-6">
						{[
							{ key: "averageOrderValue", value: formatPrice(Math.round(stats?.averageOrderValue || 0), "XOF") },
							{ key: "conversionRate", value: `${Math.round(stats?.conversionRate || 0)} %` },
							{ key: "retentionRate", value: `${Math.round(stats?.customerRetentionRate || 0)} %` },
							{ key: "uniqueCustomers", value: formatNumber(stats?.uniqueCustomers || 0) },
						].map((item) => (
							<div key={item.key} className="text-center">
								<p className="text-2xl md:text-3xl font-[1000] tracking-tighter mb-1">
									<DataValue loading={loading} light>{item.value}</DataValue>
								</p>
								<p className="text-[10px] font-black text-white/70 uppercase tracking-widest">
									{t(`stats.${item.key}`)}
								</p>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
};

export default Stats;
