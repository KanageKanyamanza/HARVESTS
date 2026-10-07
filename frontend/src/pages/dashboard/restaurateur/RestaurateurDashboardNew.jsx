import React from "react";
import { useTranslation, Trans } from "react-i18next";
import StatCards from "../../admin/adminDashboard/StatCards";
import RecentOrders from "../../../components/admin/RecentOrders";
// Graphique des ventes générique (données { month, sales, orders })
import SalesStats from "../transformer/dashboard/TransformerSalesStats";
import RecentDishesWidget from "./dashboard/RecentDishesWidget";
import { useRestaurateurDashboardStats } from "./dashboard/dashboardHooks";
import { createRestaurateurStatCards } from "./dashboard/dashboardUtils";

// Jour 53 : même gabarit que les tableaux de bord producteur et transformateur
// (l'ancien GenericDashboard ajoutait un second gabarit qui décalait la page)
const QuotaAlert = ({ tone, title, text, action }) => (
	<div
		className={`${tone === "red" ? "bg-red-50 border-red-500" : "bg-amber-50 border-amber-500"} border-l-4 p-4 rounded shadow-sm`}
	>
		<div className="flex items-center gap-3">
			<div className="flex-1">
				<p className={`text-sm font-bold ${tone === "red" ? "text-red-700" : "text-amber-700"}`}>
					{title}
				</p>
				<p className={`text-xs ${tone === "red" ? "text-red-600" : "text-amber-600"}`}>{text}</p>
			</div>
			<button
				onClick={() => (window.location.href = "/pricing")}
				className={`text-xs text-white px-3 py-1 rounded font-bold transition-colors uppercase tracking-wider ${
					tone === "red" ? "bg-red-600 hover:bg-red-700" : "bg-amber-600 hover:bg-amber-700"
				}`}
			>
				{action}
			</button>
		</div>
	</div>
);

const RestaurateurDashboardNew = () => {
	const { t } = useTranslation(["dashboard-restaurateur", "dashboard-producer"]);
	const { stats, recentOrders, recentDishes, salesChartData, loading } =
		useRestaurateurDashboardStats();

	const statCards = createRestaurateurStatCards(stats);
	const quota = { count: stats.weeklyOrders, max: stats.maxWeeklyOrders };

	// Alertes de quota : seulement une fois les vrais chiffres chargés
	const limited = !loading && stats.maxWeeklyOrders > 0;
	const reachedQuota = limited && stats.weeklyOrders >= stats.maxWeeklyOrders;
	const nearQuota =
		limited && !reachedQuota && stats.weeklyOrders >= stats.maxWeeklyOrders * 0.8;

	return (
		<div className="dashboard-page">
			{/* Halos d'arrière-plan */}
			<div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
				<div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-orange-100/30 rounded-full blur-[120px]"></div>
				<div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-amber-100/20 rounded-full blur-[100px]"></div>
				<div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] bg-rose-100/20 rounded-full blur-[120px]"></div>
			</div>

			<div className="dashboard-container space-y-4 md:space-y-5">
				{reachedQuota && (
					<QuotaAlert
						tone="red"
						title={t("dashboard-producer:dashboard.quotaReachedTitle", quota)}
						text={t("dashboard-producer:dashboard.quotaReachedText")}
						action={t("dashboard-producer:dashboard.upgrade")}
					/>
				)}
				{nearQuota && (
					<QuotaAlert
						tone="amber"
						title={t("dashboard-producer:dashboard.quotaNearTitle", quota)}
						text={t("dashboard-producer:dashboard.quotaNearText")}
						action={t("dashboard-producer:dashboard.upgrade")}
					/>
				)}

				{/* En-tête */}
				<div className="animate-fade-in-down">
					<div className="flex items-center gap-2 text-orange-600 font-black text-[10px] uppercase tracking-[0.2em] mb-1.5">
						<div className="w-5 h-[2px] bg-orange-600"></div>
						<span className="text-[9px]">{t("dashboard.eyebrow")}</span>
					</div>
					<h1 className="text-2xl font-[1000] text-gray-900 tracking-tighter leading-[1] mb-1.5">
						{t("dashboard-producer:dashboard.titleStart")}
						<span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-500 italic ml-1.5">
							{t("dashboard-producer:dashboard.titleHighlight")}
						</span>
					</h1>
					<p className="text-xs text-gray-500 max-w-2xl font-medium leading-relaxed">
						<Trans
							i18nKey="dashboard.subtitle"
							ns="dashboard-restaurateur"
							components={{ brand: <span className="text-orange-600 font-black" /> }}
						/>
					</p>
				</div>

				{/* Chiffres clés */}
				<div className="animate-fade-in-up">
					<StatCards statCards={statCards} loading={loading} />
				</div>

				{/* Ventes des six derniers mois */}
				<div className="animate-fade-in-up delay-150">
					<SalesStats
						salesChartData={salesChartData}
						monthlyGrowth={stats.monthlyGrowth}
						loading={loading}
					/>
				</div>

				{/* Commandes récentes et derniers plats */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-5 animate-fade-in-up delay-300">
					<RecentOrders orders={recentOrders} basePath="/restaurateur/orders" loading={loading} />
					<RecentDishesWidget dishes={recentDishes} loading={loading} />
				</div>
			</div>
		</div>
	);
};

export default RestaurateurDashboardNew;
