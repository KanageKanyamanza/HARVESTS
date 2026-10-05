import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import DataValue from "../../../components/common/DataValue";
import { useAuth } from "../../../hooks/useAuth";
import { formatPrice } from "../../../utils/currencyUtils";
import { formatMonthCode, formatNumber } from "../../../utils/i18n";
import { toPlainText } from "../../../utils/textHelpers";
import { getCategoryLabel } from "../../../utils/productHelpers";
import { producerService } from "../../../services";
import ModularDashboardLayout from "../../../components/layout/ModularDashboardLayout";
import {
	TrendingUp,
	DollarSign,
	Package,
	ShoppingBag,
	Users,
	BarChart3,
	CheckCircle2,
	Clock,
	Calendar,
	Zap,
	Star,
	Activity,
} from "lucide-react";

const Stats = () => {
	const { t, i18n } = useTranslation("dashboard-producer");
	const { user } = useAuth();
	const [stats, setStats] = useState(null);
	const [salesAnalytics, setSalesAnalytics] = useState(null);
	const [, setRevenueAnalytics] = useState(null);
	const [orders, setOrders] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadStats = async () => {
			if (user?.userType === "producer") {
				try {
					setLoading(true);
					const [
						statsResponse,
						salesResponse,
						revenueResponse,
						ordersResponse,
					] = await Promise.all([
						producerService.getStats(),
						producerService.getSalesAnalytics(),
						producerService.getRevenueAnalytics(),
						producerService.getOrders(),
					]);

					setStats(
						statsResponse.data.data?.stats ||
							statsResponse.data.stats ||
							statsResponse.data,
					);
					setSalesAnalytics(
						salesResponse.data.data?.analytics ||
							salesResponse.data.analytics ||
							salesResponse.data,
					);
					setRevenueAnalytics(
						revenueResponse.data.data?.analytics ||
							revenueResponse.data.analytics ||
							revenueResponse.data,
					);
					setOrders(
						ordersResponse.data.data?.orders ||
							ordersResponse.data.orders ||
							[],
					);
				} catch (error) {
					console.error("Erreur lors du chargement des statistiques:", error);
					setStats(null);
					setSalesAnalytics(null);
					setRevenueAnalytics(null);
					setOrders([]);
				} finally {
					setLoading(false);
				}
			}
		};

		loadStats();
	}, [user]);


	// Calculer les statuts des commandes
	const pendingOrdersCount = orders.filter(
		(o) => o.status === "pending" || o.status === "processing",
	).length;
	const completedOrdersCount = orders.filter(
		(o) => o.status === "completed" || o.status === "delivered",
	).length;
	const cancelledOrdersCount = orders.filter(
		(o) => o.status === "cancelled",
	).length;
	const inTransitOrdersCount = orders.filter(
		(o) => o.status === "in-transit" || o.status === "shipped",
	).length;

	return (
		<div className="dashboard-page bg-harvests-light/20">
			{/* Background Decorative Glows */}
			<div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
				<div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-100/30 rounded-full blur-[120px]"></div>
				<div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/20 rounded-full blur-[100px]"></div>
			</div>

			<div className="dashboard-container space-y-10">
				{/* Header */}
				<div className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-fade-in-down">
					<div className="space-y-3">
						<div className="flex items-center gap-2 text-emerald-600 font-black text-[9px] uppercase tracking-widest mb-2">
							<div className="w-5 h-[2px] bg-emerald-600 rounded-full"></div>
							<span>{t("stats.eyebrow")}</span>
						</div>
						<h1 className="text-3xl font-[1000] text-gray-900 tracking-tighter leading-none mb-2">
							{t("stats.titleStart")}{" "}
							<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
								{t("stats.titleHighlight")}
							</span>
						</h1>
						<p className="text-xs text-gray-500 font-medium max-w-xl">
							{t("stats.subtitle")}
						</p>
					</div>

					<div className="flex gap-4">
						<div className="bg-white/70 backdrop-blur-xl px-5 py-3 rounded-2xl border border-white/60 shadow-sm flex items-center gap-3">
							<Calendar className="h-4 w-4 text-emerald-600" />
							<span className="text-[9px] font-black uppercase tracking-widest text-gray-900">
								{t("stats.allTime")}
							</span>
						</div>
					</div>
				</div>

				{/* Key Metrics Cards */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in-up delay-100">
					{[
						{
							label: t("stats.totalRevenue"),
							value: formatPrice(stats?.totalRevenue || 0, "XOF"),
							icon: DollarSign,
							color: "emerald",
						},
						{
							label: t("stats.orders"),
							value: formatNumber(orders.length || stats?.totalOrders || 0, i18n.language),
							icon: ShoppingBag,
							color: "blue",
						},
						{
							label: t("stats.productsSold"),
							value: formatNumber(stats?.totalProductsSold || 0, i18n.language),
							icon: Package,
							color: "purple",
						},
						{
							label: t("stats.uniqueCustomers"),
							value: formatNumber(stats?.uniqueCustomers || 0, i18n.language),
							icon: Users,
							color: "amber",
						},
					].map((item, idx) => (
						<div
							key={idx}
							className="bg-white/70 backdrop-blur-xl p-7 rounded-[2.5rem] border border-white/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 group"
						>
							<div className="flex items-center justify-between mb-6">
								<div
									className={`w-12 h-12 rounded-2xl flex items-center justify-center
                        ${item.color === "emerald" ? "bg-emerald-50 text-emerald-600" : ""}
                        ${item.color === "blue" ? "bg-blue-50 text-blue-600" : ""}
                        ${item.color === "purple" ? "bg-purple-50 text-purple-600" : ""}
                        ${item.color === "amber" ? "bg-amber-50 text-amber-600" : ""}
                      `}
								>
									<item.icon className="w-6 h-6" />
								</div>
							</div>
							<p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] mb-1">
								{item.label}
							</p>
							<p className="text-3xl font-[1000] text-gray-900 tracking-tighter">
								<DataValue loading={loading} className="w-24 h-[0.8em]">{item.value}</DataValue>
							</p>
						</div>
					))}
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
					{/* Sales Analytics Chart Area (Simulated) */}
					<div className="lg:col-span-8 flex flex-col gap-8 animate-fade-in-up delay-200">
						<div className="bg-white/70 backdrop-blur-xl rounded-[3rem] p-8 md:p-10 border border-white/60 shadow-sm">
							<div className="flex items-center justify-between mb-10">
								<div className="flex items-center gap-4">
									<div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white">
										<BarChart3 className="h-5 w-5" />
									</div>
									<div>
										<h3 className="text-xl font-[1000] text-gray-900 tracking-tight">
											{t("stats.monthlySales")}
										</h3>
										<p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">
											{t("stats.lastMonths", { count: 6 })}
										</p>
									</div>
								</div>
								<div className="flex gap-2">
									<div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
									<span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
										{t("stats.revenue")}
									</span>
								</div>
							</div>

							<div className="space-y-6">
								{loading ?
									[1, 2, 3, 4].map((i) => (
										<div key={i} className="space-y-2 animate-pulse">
											<div className="h-3 bg-gray-100 rounded w-1/3" />
											<div className="h-3 bg-gray-100 rounded-full" />
										</div>
									))
								: (
									salesAnalytics?.monthlySales &&
									salesAnalytics.monthlySales.length > 0
								) ?
									salesAnalytics.monthlySales.slice(0, 6).map((sale, index) => {
										const maxRevenue = Math.max(
											...salesAnalytics.monthlySales.map((s) => s.revenue || 0),
										);
										const percentage = (sale.revenue / (maxRevenue || 1)) * 100;

										return (
											<div key={index} className="space-y-2">
												<div className="flex items-end justify-between px-2">
													<p className="text-xs font-black text-gray-800 uppercase tracking-widest">
														{formatMonthCode(sale.month, i18n.language, { month: "long", year: "numeric" })}
													</p>
													<p className="text-xs font-[1000] text-gray-900">
														{formatPrice(sale.revenue || 0, "XOF")}
													</p>
												</div>
												<div className="h-3 bg-gray-100/50 rounded-full overflow-hidden border border-gray-100">
													<div
														className="h-full bg-gradient-to-r from-emerald-600 to-teal-500 rounded-full transition-all duration-1000 delay-300"
														style={{ width: `${percentage}%` }}
													></div>
												</div>
												<div className="flex justify-between px-2">
													<span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">
														{t("stats.monthOrders", { count: sale.orders || 0 })}
													</span>
													<span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">
														{t("stats.monthProducts", { count: sale.products || 0 })}
													</span>
												</div>
											</div>
										);
									})
								:	<div className="text-center py-16">
										<BarChart3 className="mx-auto h-12 w-12 text-gray-200 mb-4" />
										<p className="text-gray-600 font-bold text-xs uppercase tracking-widest">
											{t("stats.noData")}
										</p>
									</div>
								}
							</div>
						</div>

						{/* Top Products Grid */}
						<div className="bg-white/70 backdrop-blur-xl rounded-[3rem] p-8 md:p-10 border border-white/60 shadow-sm">
							<div className="flex items-center gap-4 mb-10">
								<div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white">
									<Zap className="h-5 w-5" />
								</div>
								<div>
									<h3 className="text-xl font-[1000] text-gray-900 tracking-tight">
										{t("stats.bestSellers")}
									</h3>
									<p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">
										{t("stats.bestSellersSubtitle")}
									</p>
								</div>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{loading ?
									[1, 2].map((i) => (
										<div key={i} className="h-20 bg-gray-50 rounded-[2rem] animate-pulse" />
									))
								: stats?.topProducts && stats.topProducts.length > 0 ?
									stats.topProducts.map((product, index) => (
										<div
											key={index}
											className="flex items-center gap-5 p-5 bg-gray-50/50 rounded-[2rem] border border-gray-100/50 hover:bg-white transition-all group"
										>
											<div className="w-12 h-12 bg-gray-900 text-white rounded-2xl flex items-center justify-center text-sm font-[1000] shrink-0 group-hover:bg-emerald-600 transition-colors">
												{index + 1}
											</div>
											<div className="flex-1 min-w-0">
												<p className="text-xs font-black text-gray-900 uppercase tracking-tight truncate mb-0.5">
													{toPlainText(product.name, "")}
												</p>
												<p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">
													{getCategoryLabel(product.category, i18n.language)}
												</p>
											</div>
											<div className="text-right">
												<p className="text-xs font-[1000] text-gray-900">
													{formatPrice(product.revenue || 0, "XOF")}
												</p>
												<p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">
													{t("stats.sold", { count: product.quantitySold || 0 })}
												</p>
											</div>
										</div>
									))
								:	<div className="col-span-full py-10 text-center">
										<Package className="h-10 w-10 text-gray-100 mx-auto mb-3" />
										<p className="text-gray-600 font-bold text-xs uppercase tracking-widest">
											{t("stats.noProductSold")}
										</p>
									</div>
								}
							</div>
						</div>
					</div>

					{/* Sidebar Stats Area */}
					<div className="lg:col-span-4 flex flex-col gap-8 animate-fade-in-up delay-300">
						{/* Order Status Breakdown */}
						<div className="bg-white/70 backdrop-blur-xl rounded-[3rem] p-8 md:p-10 border border-white/60 shadow-sm">
							<div className="flex items-center gap-4 mb-10">
								<div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
									<Activity className="h-5 w-5" />
								</div>
								<div>
									<h3 className="text-xl font-[1000] text-gray-900 tracking-tight">
										{t("stats.orderFlow")}
									</h3>
									<p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">
										{t("stats.statusBreakdown")}
									</p>
								</div>
							</div>

							<div className="space-y-4">
								{[
									{
										label: t("stats.toProcess"),
										count: pendingOrdersCount,
										color: "text-amber-600",
										bg: "bg-amber-50",
										icon: Clock,
									},
									{
										label: t("stats.inDelivery"),
										count: inTransitOrdersCount,
										color: "text-blue-600",
										bg: "bg-blue-50",
										icon: Truck,
									},
									{
										label: t("stats.delivered"),
										count: completedOrdersCount,
										color: "text-emerald-600",
										bg: "bg-emerald-50",
										icon: CheckCircle2,
									},
									{
										label: t("stats.cancelled"),
										count: cancelledOrdersCount,
										color: "text-rose-600",
										bg: "bg-rose-50",
										icon: XCircle,
									},
								].map((s, i) => (
									<div
										key={i}
										className={`flex items-center justify-between p-5 ${s.bg} rounded-3xl border border-transparent hover:border-white transition-all`}
									>
										<div className="flex items-center gap-4">
											<s.icon className={`h-5 w-5 ${s.color}`} />
											<span className="text-xs font-black text-gray-700 uppercase tracking-widest">
												{s.label}
											</span>
										</div>
										<span className={`text-xl font-[1000] ${s.color}`}>
											<DataValue loading={loading} className="w-8 h-[0.8em]">{s.count}</DataValue>
										</span>
									</div>
								))}
							</div>
						</div>

						{/* Performance Summary Card */}
						<div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-[3rem] p-8 md:p-10 text-white shadow-xl shadow-emerald-200/50 relative overflow-hidden group">
							<div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform duration-700">
								<TrendingUp className="w-32 h-32" />
							</div>
							<div className="relative z-10 space-y-8">
								<div className="flex items-center gap-3">
									<div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
										<Star className="h-5 w-5 text-white fill-current" />
									</div>
									<h3 className="text-xl font-[1000] tracking-tight text-white">
										{t("stats.qualitySummary")}
									</h3>
								</div>

								<div className="grid grid-cols-2 gap-6">
									<div>
										<p className="text-[9px] font-black text-white/70 uppercase tracking-widest mb-1">
											{t("stats.averageBasket")}
										</p>
										<p className="text-xl font-[1000] tracking-tight text-white">
											<DataValue loading={loading} light>{formatPrice(Math.round(stats?.averageOrderValue || 0), "XOF")}</DataValue>
										</p>
									</div>
									<div>
										<p className="text-[9px] font-black text-white/70 uppercase tracking-widest mb-1">
											{t("stats.conversion")}
										</p>
										<p className="text-xl font-[1000] tracking-tight text-white">
											<DataValue loading={loading} light>{stats?.conversionRate || 0}%</DataValue>
										</p>
									</div>
									<div>
										<p className="text-[9px] font-black text-white/70 uppercase tracking-widest mb-1">
											{t("stats.retention")}
										</p>
										<p className="text-xl font-[1000] tracking-tight text-white">
											<DataValue loading={loading} light>{stats?.customerRetentionRate || 0}%</DataValue>
										</p>
									</div>
									<div>
										<p className="text-[9px] font-black text-white/70 uppercase tracking-widest mb-1">
											{t("stats.satisfaction")}
										</p>
										<p className="text-xl font-[1000] tracking-tight text-white">
											<DataValue loading={loading} light>
												{stats?.averageRating ?
													`${Number(stats.averageRating).toFixed(1)}/5`
												:	t("stats.noRating")}
											</DataValue>
										</p>
									</div>
								</div>

							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

// Helper icons needed but not imported
const Truck = ({ className }) => (
	<svg
		className={className}
		fill="none"
		viewBox="0 0 24 24"
		stroke="currentColor"
	>
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth={2}
			d="M5 18h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
		/>
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth={2}
			d="M16 6v12M8 6v12"
		/>
	</svg>
);

const XCircle = ({ className }) => (
	<svg
		className={className}
		fill="none"
		viewBox="0 0 24 24"
		stroke="currentColor"
	>
		<circle cx="12" cy="12" r="10" strokeWidth={2} />
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth={2}
			d="M15 9l-6 6M9 9l6 6"
		/>
	</svg>
);

export default Stats;
