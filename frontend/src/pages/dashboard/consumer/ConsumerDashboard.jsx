import React from "react";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import StatCards from "../../admin/adminDashboard/StatCards";
import RecentOrders from "../../../components/admin/RecentOrders";
import ModularDashboardLayout from "../../../components/layout/ModularDashboardLayout";
import ConsumerSpendingStats from "./ConsumerSpendingStats";
import QuickActionsWidget from "./QuickActionsWidget";
import { useConsumerDashboardStats } from "./dashboardHooks";
import { createConsumerStatCards } from "./dashboardUtils";
import { FiShoppingCart, FiGift, FiArrowRight } from "react-icons/fi";
import { Link } from "react-router-dom";

const ConsumerDashboard = () => {
	const { stats, recentOrders, favoriteProducts, loading } =
		useConsumerDashboardStats();

	if (loading) {
		return (
			<ModularDashboardLayout>
				<div className="min-h-screen flex items-center justify-center">
					<LoadingSpinner size="lg" text="Préparation de votre espace..." />
				</div>
			</ModularDashboardLayout>
		);
	}

	const statCards = createConsumerStatCards(stats);

	const formatCurrency = (val) => {
		return new Intl.NumberFormat("fr-FR", {
			style: "currency",
			currency: "XAF",
			minimumFractionDigits: 0,
		}).format(val || 0);
	};

	return (
		<ModularDashboardLayout>
			<div className="min-h-screen md:pl-3 pb-20 relative overflow-hidden bg-harvests-light/20">
				{/* Background radial glows - Blue/Sky theme for Consumer */}
				<div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden ">
					<div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-100/30 rounded-full blur-[120px]"></div>
					<div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-sky-100/20 rounded-full blur-[100px]"></div>
					<div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] bg-cyan-100/20 rounded-full blur-[120px]"></div>
				</div>

				<div className="max-w-full mx-auto px-3 py-4 space-y-4 relative z-10 md:pl-6 md:px-4 md:py-6 md:space-y-6">
					{/* Header */}
					<div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 px-2 animate-fade-in-down">
						<div className="flex-1">
							<div className="flex items-center gap-2 text-blue-600 font-black text-[10px] uppercase tracking-[0.2em] mb-1.5">
								<div className="w-5 h-[2px] bg-blue-600"></div>
								<span className="text-[9px]">Espace Client Harvests</span>
							</div>
							<h1 className="text-3xl font-[1000] text-gray-900 tracking-tighter leading-tight mb-2">
								Bonjour, Ravi de vous
								<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-sky-500 italic ml-2">
									Revoir !
								</span>
							</h1>
							<p className="text-xs text-gray-500 max-w-2xl font-medium leading-relaxed">
								Trouvez les meilleurs produits frais directement chez les
								producteurs. Suivez vos commandes et profitez de vos points
								fidélité.
							</p>
						</div>

						{/* Loyalty Points Mini-Widget */}
						<div className="bg-white/70 backdrop-blur-xl p-4 rounded-3xl border border-white/60 shadow-sm flex items-center gap-4 animate-scale-in">
							<div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 shadow-inner">
								<FiGift className="w-6 h-6" />
							</div>
							<div>
								<p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">
									Mes Points Fidélité
								</p>
								<div className="flex items-baseline gap-1">
									<h3 className="text-xl font-[1000] text-gray-900 tracking-tighter">
										{stats.loyaltyPoints.toLocaleString()}
									</h3>
									<span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">
										pts
									</span>
								</div>
							</div>
							<div className="w-[1px] h-8 bg-gray-100 mx-1"></div>
							<Link
								to="/loyalty"
								className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-white hover:bg-blue-600 transition-colors"
							>
								<FiArrowRight className="w-4 h-4" />
							</Link>
						</div>
					</div>

					{/* Stat Cards */}
					<div className="animate-fade-in-up">
						<StatCards statCards={statCards} />
					</div>

					{/* Main Grid: Analysis & Quick Actions */}
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in-up delay-200">
						<div className="lg:col-span-2">
							<ConsumerSpendingStats
								monthlySpentChart={stats.monthlySpentChart}
								totalSpent={stats.totalSpent}
							/>
						</div>
						<div>
							<QuickActionsWidget />
						</div>
					</div>

					{/* Recent Activity & Orders */}
					<div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-fade-in-up delay-300">
						<div className="xl:col-span-2">
							<RecentOrders orders={recentOrders} />
						</div>

						{/* My Favorites Preview */}
						<div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-white/60 relative overflow-hidden group">
							<div className="flex items-center justify-between mb-6">
								<div>
									<h3 className="text-lg font-[1000] text-gray-900 tracking-tight leading-none mb-1">
										Mes Favoris
									</h3>
									<p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">
										Accès direct
									</p>
								</div>
								<Link
									to="/consumer/favorites"
									className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline"
								>
									Voir tout
								</Link>
							</div>

							<div className="space-y-4">
								{favoriteProducts && favoriteProducts.length > 0 ?
									favoriteProducts.map((product) => (
										<div
											key={product.id}
											className="flex items-center gap-4 p-3 rounded-2xl bg-white/40 border border-transparent hover:border-gray-100 hover:bg-white hover:shadow-lg transition-all duration-300"
										>
											<div className="w-14 h-14 rounded-xl bg-gray-50 overflow-hidden shadow-sm">
												<img
													src={
														product.image || "/images/placeholder-product.svg"
													}
													alt={product.name}
													className="w-full h-full object-cover"
													onError={(e) => {
														e.target.src = "/images/placeholder-product.svg";
													}}
												/>
											</div>
											<div className="flex-1 min-w-0">
												<h4 className="text-sm font-[900] text-gray-900 leading-none mb-1 truncate">
													{product.name}
												</h4>
												<p className="text-[10px] font-black text-blue-600">
													{formatCurrency(product.price)}
												</p>
											</div>
											<Link
												to={`/products/${product.id}`}
												className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
											>
												<FiShoppingCart className="w-4 h-4" />
											</Link>
										</div>
									))
								:	<div className="py-10 text-center">
										<p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
											Aucun favori pour le moment
										</p>
									</div>
								}
							</div>
						</div>
					</div>
				</div>
			</div>
		</ModularDashboardLayout>
	);
};

export default ConsumerDashboard;
