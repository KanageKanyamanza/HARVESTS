import React from "react";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import StatCards from "../../admin/adminDashboard/StatCards";
import RecentOrders from "../../../components/admin/RecentOrders";
import ModularDashboardLayout from "../../../components/layout/ModularDashboardLayout";
import TransformerSalesStats from "./dashboard/TransformerSalesStats";
import RecentProductsWidget from "./dashboard/RecentProductsWidget";
import { useTransformerDashboardStats } from "./dashboard/dashboardHooks";
import { createTransformerStatCards } from "./dashboard/dashboardUtils";

const TransformerDashboardNew = () => {
	const { stats, recentOrders, salesChartData, recentProducts, loading } =
		useTransformerDashboardStats();

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<LoadingSpinner size="lg" text="Chargement..." />
			</div>
		);
	}

	const statCards = createTransformerStatCards(stats);

	const reachedQuota =
		stats.maxWeeklyOrders !== -1 && stats.weeklyOrders >= stats.maxWeeklyOrders;
	const nearQuota =
		stats.maxWeeklyOrders !== -1 &&
		!reachedQuota &&
		stats.weeklyOrders >= stats.maxWeeklyOrders * 0.8;

	return (
		<div className="min-h-screen md:pl-3 pb-20 relative overflow-hidden">
			{/* Background radial glows for "wow" effect - Purple theme for Transformer */}
			<div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden ">
				<div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-100/30 rounded-full blur-[120px]"></div>
				<div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-fuchsia-100/20 rounded-full blur-[100px]"></div>
				<div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] bg-indigo-100/20 rounded-full blur-[120px]"></div>
			</div>

			<div className="max-w-full mx-auto px-3 py-4 space-y-4 relative z-10 md:pl-6 md:px-4 md:py-6 md:space-y-5">
				{/* Quota Alerts */}
				{reachedQuota && (
					<div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded shadow-sm">
						<div className="flex items-center">
							<div className="flex-shrink-0">
								<svg
									className="h-5 w-5 text-red-500"
									viewBox="0 0 20 20"
									fill="currentColor"
								>
									<path
										fillRule="evenodd"
										d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
										clipRule="evenodd"
									/>
								</svg>
							</div>
							<div className="ml-3">
								<p className="text-sm text-red-700 font-bold">
									Quota hebdomadaire atteint ({stats.weeklyOrders}/
									{stats.maxWeeklyOrders})
								</p>
								<p className="text-xs text-red-600">
									Vous ne pouvez plus recevoir de nouvelles commandes cette
									semaine. Passez au plan Standard ou Premium pour lever cette
									limite.
								</p>
							</div>
							<div className="ml-auto">
								<button
									onClick={() => (window.location.href = "/pricing")}
									className="text-xs bg-red-600 text-white px-3 py-1 rounded font-bold hover:bg-red-700 transition-colors uppercase tracking-wider"
								>
									Upgrade
								</button>
							</div>
						</div>
					</div>
				)}

				{nearQuota && (
					<div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-4 rounded shadow-sm">
						<div className="flex items-center">
							<div className="flex-shrink-0">
								<svg
									className="h-5 w-5 text-amber-500"
									viewBox="0 0 20 20"
									fill="currentColor"
								>
									<path
										fillRule="evenodd"
										d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
										clipRule="evenodd"
									/>
								</svg>
							</div>
							<div className="ml-3">
								<p className="text-sm text-amber-700 font-bold">
									Limite de commandes proche ({stats.weeklyOrders}/
									{stats.maxWeeklyOrders})
								</p>
								<p className="text-xs text-amber-600">
									Vous approchez de votre limite hebdomadaire. Anticipez en
									passant à un plan supérieur.
								</p>
							</div>
							<div className="ml-auto">
								<button
									onClick={() => (window.location.href = "/pricing")}
									className="text-xs bg-amber-600 text-white px-3 py-1 rounded font-bold hover:bg-amber-700 transition-colors uppercase tracking-wider"
								>
									Upgrade
								</button>
							</div>
						</div>
					</div>
				)}

				{/* Header */}
				<div className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-2 animate-fade-in-down">
					<div>
						<div className="flex items-center gap-2 text-purple-600 font-black text-[10px] uppercase tracking-[0.2em] mb-1.5">
							<div className="w-5 h-[2px] bg-purple-600"></div>
							<span className="text-[9px]">Espace Transformateur</span>
						</div>
						<h1 className="text-2xl font-[1000] text-gray-900 tracking-tighter leading-[1] mb-1.5">
							Tableau de
							<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-fuchsia-500 italic ml-1.5">
								Bord.
							</span>
						</h1>
						<p className="text-xs text-gray-500 max-w-2xl font-medium leading-relaxed">
							Gérez votre production et transformation avec{" "}
							<span className="text-purple-600 font-black">Harvests</span>.
							Suivez vos ventes, vos produits transformés et vos commandes en
							temps réel.
						</p>
					</div>
				</div>

				{/* Stat Cards */}
				<div className="animate-fade-in-up">
					<StatCards statCards={statCards} />
				</div>

				{/* Sales Chart */}
				<div className="animate-fade-in-up delay-150">
					<TransformerSalesStats
						salesChartData={salesChartData}
						monthlyRevenue={stats.monthlyRevenue}
						monthlyGrowth={stats.monthlyGrowth}
					/>
				</div>

				{/* Recent Orders & Other widgets */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-5 animate-fade-in-up delay-300">
					<div>
						<RecentOrders orders={recentOrders} />
					</div>
					<div>
						<RecentProductsWidget products={recentProducts} />
					</div>
				</div>
			</div>
		</div>
	);
};

export default TransformerDashboardNew;
