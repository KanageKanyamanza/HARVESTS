import React from "react";
import RecentOrders from "../../components/admin/RecentOrders";
import PendingProducts from "../../components/admin/PendingProducts";
import TopProducers from "../../components/admin/TopProducers";
import ProductStats from "../../components/admin/ProductStats";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import StatCards from "./adminDashboard/StatCards";
import SalesAndUserStats from "./adminDashboard/SalesAndUserStats";
import MainSections from "./adminDashboard/MainSections";
import { useDashboardStats } from "./adminDashboard/dashboardHooks";
import {
	createStatCards,
	createMarketplaceStats,
	createQuickActions,
} from "./adminDashboard/dashboardUtils";

const AdminDashboard = () => {
	const {
		stats,
		recentOrders,
		pendingProducts,
		salesChartData,
		topProducers,
		productStats,
		loading,
	} = useDashboardStats();

	if (loading) {
		return (
			<div className="min-h-screen bg-harvests-light flex items-center justify-center">
				<LoadingSpinner size="lg" text="Chargement..." />
			</div>
		);
	}

	const statCards = createStatCards(stats);
	const marketplaceStats = createMarketplaceStats(stats);
	const quickActions = createQuickActions(stats);

	return (
		<div className="min-h-screen md:pl-3 pb-20 relative overflow-hidden">
			{/* Background radial glows for "wow" effect */}
			<div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden ">
				<div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-green-100/30 rounded-full blur-[120px]"></div>
				<div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-blue-100/20 rounded-full blur-[100px]"></div>
				<div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] bg-purple-100/20 rounded-full blur-[120px]"></div>
			</div>

			<div className="max-w-full mx-auto px-4 py-6 space-y-5 relative z-10 pl-6">
				{/* En-tête avec message d'accueil */}
				<div className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-2 animate-fade-in-down">
					<div>
						<div className="flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-[0.2em] mb-1.5">
							<div className="w-5 h-[2px] bg-emerald-600"></div>
							<span className="text-[9px]">Command Center</span>
						</div>
						<h1 className="text-2xl font-[1000] text-gray-900 tracking-tighter leading-[1] mb-1.5">
							Tableau de
							<span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500 italic ml-1.5">
								Bord.
							</span>
						</h1>
						<p className="text-xs text-gray-500 max-w-2xl font-medium leading-relaxed">
							Bienvenue sur l'interface de pilotage{" "}
							<span className="text-harvests-green font-black">Harvests</span>.
							Voici les indicateurs clés de votre écosystème aujourd'hui.
						</p>
					</div>
				</div>

				{/* Cartes de statistiques principales */}
				<div className="animate-fade-in-up">
					<StatCards statCards={statCards} />
				</div>

				{/* Section Graphique & Stats Utilisateurs */}
				<div className="animate-fade-in-up delay-150">
					<SalesAndUserStats
						salesChartData={salesChartData}
						marketplaceStats={marketplaceStats}
						monthlyGrowth={stats.monthlyGrowth}
					/>
				</div>

				{/* Commandes & Produits */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-5 animate-fade-in-up delay-300">
					<div>
						<RecentOrders orders={recentOrders} />
					</div>
					<div>
						<PendingProducts products={pendingProducts} />
					</div>
				</div>

				{/* Dashboard Power Grid: TopProducers, ProductStats */}
				<div className="grid grid-cols-1 gap-5 animate-fade-in-up delay-[450ms]">
					<div className="flex flex-col">
						<TopProducers producers={topProducers} />
					</div>
					<div className="flex flex-col">
						<ProductStats data={productStats} />
					</div>
				</div>

				{/* Navigation Centrée */}
				<div className="pt-8 animate-fade-in-up delay-[600ms]">
					<MainSections />
				</div>
			</div>
		</div>
	);
};

export default AdminDashboard;
