import React from "react";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import StatCards from "../../admin/adminDashboard/StatCards";
import RecentOrders from "../../../components/admin/RecentOrders";
import ModularDashboardLayout from "../../../components/layout/ModularDashboardLayout";
import ProducerSalesStats from "./dashboard/ProducerSalesStats";
import RecentProductsWidget from "./dashboard/RecentProductsWidget";
import { useProducerDashboardStats } from "./dashboard/dashboardHooks";
import { createProducerStatCards } from "./dashboard/dashboardUtils";

const ProducerDashboardNew = () => {
	const { stats, recentOrders, salesChartData, recentProducts, loading } =
		useProducerDashboardStats();

	if (loading) {
		return (
			<ModularDashboardLayout>
				<div className="min-h-screen flex items-center justify-center">
					<LoadingSpinner size="lg" text="Chargement..." />
				</div>
			</ModularDashboardLayout>
		);
	}

	const statCards = createProducerStatCards(stats);

	return (
		<ModularDashboardLayout>
			<div className="min-h-screen md:pl-3 pb-20 relative overflow-hidden">
				{/* Background radial glows for "wow" effect - Copied from AdminDashboard */}
				<div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden ">
					<div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-green-100/30 rounded-full blur-[120px]"></div>
					<div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-blue-100/20 rounded-full blur-[100px]"></div>
					<div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] bg-purple-100/20 rounded-full blur-[120px]"></div>
				</div>

				<div className="max-w-full mx-auto px-3 py-4 space-y-4 relative z-10 md:pl-6 md:px-4 md:py-6 md:space-y-5">
					{/* Header */}
					<div className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-2 animate-fade-in-down">
						<div>
							<div className="flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-[0.2em] mb-1.5">
								<div className="w-5 h-[2px] bg-emerald-600"></div>
								<span className="text-[9px]">Espace Producteur</span>
							</div>
							<h1 className="text-2xl font-[1000] text-gray-900 tracking-tighter leading-[1] mb-1.5">
								Tableau de
								<span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500 italic ml-1.5">
									Bord.
								</span>
							</h1>
							<p className="text-xs text-gray-500 max-w-2xl font-medium leading-relaxed">
								Gérez votre activité agricole avec{" "}
								<span className="text-harvests-green font-black">Harvests</span>
								. Suivez vos ventes, vos produits et vos commandes en temps
								réel.
							</p>
						</div>
					</div>

					{/* Stat Cards */}
					<div className="animate-fade-in-up">
						<StatCards statCards={statCards} />
					</div>

					{/* Sales Chart */}
					<div className="animate-fade-in-up delay-150">
						<ProducerSalesStats
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
		</ModularDashboardLayout>
	);
};

export default ProducerDashboardNew;
