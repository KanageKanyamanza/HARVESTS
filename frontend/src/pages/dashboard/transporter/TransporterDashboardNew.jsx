import React, { useState, useEffect } from "react";
import { useAuth } from "../../../hooks/useAuth";
import ModularDashboardLayout from "../../../components/layout/ModularDashboardLayout";
import TransporterStatsOverview from "../../../components/dashboard/transporter/TransporterStatsOverview";
import OrdersSection from "../../../components/dashboard/sections/OrdersSection";
import QuickActionsSection from "../../../components/dashboard/sections/QuickActionsSection";
import SubscriptionSection from "../../../components/dashboard/sections/SubscriptionSection";
import FleetSummarySection from "../../../components/dashboard/sections/FleetSummarySection";
import { transporterService } from "../../../services";
import { FiPackage, FiTruck, FiStar } from "react-icons/fi";
import LoadingSpinner from "../../../components/common/LoadingSpinner";

const TransporterDashboard = () => {
	const { user } = useAuth();
	const [stats, setStats] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		loadStats();
	}, []);

	const loadStats = async () => {
		try {
			setLoading(true);
			const response = await transporterService.getStats();
			setStats(
				response.data?.data?.stats ||
					response.data?.stats ||
					response.data?.data ||
					response.data,
			);
		} catch (error) {
			console.error("Erreur lors du chargement des statistiques:", error);
		} finally {
			setLoading(false);
		}
	};

	if (loading && !stats) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<LoadingSpinner size="lg" text="Chargement..." />
			</div>
		);
	}

	const reachedQuota =
		stats?.maxWeeklyOrders !== -1 &&
		stats?.weeklyOrders >= stats?.maxWeeklyOrders;
	const nearQuota =
		stats?.maxWeeklyOrders !== -1 &&
		!reachedQuota &&
		stats?.weeklyOrders >= stats?.maxWeeklyOrders * 0.8;

	return (
		<div className="min-h-screen md:pl-3 pb-20 relative overflow-hidden">
			{/* Background radial glows for "wow" effect - Indigo/Blue theme for Transporter */}
			<div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
				<div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-100/30 rounded-full blur-[120px]"></div>
				<div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-blue-100/20 rounded-full blur-[100px]"></div>
				<div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] bg-purple-100/20 rounded-full blur-[120px]"></div>
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
									Vous ne pouvez plus accepter de nouvelles livraisons cette
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
									Limite de livraisons proche ({stats.weeklyOrders}/
									{stats.maxWeeklyOrders})
								</p>
								<p className="text-xs text-amber-600">
									Vous approchez de votre limite hebdomadaire de livraisons.
									Anticipez en passant à un plan supérieur.
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
						<div className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-[0.2em] mb-1.5">
							<div className="w-5 h-[2px] bg-indigo-600"></div>
							<span className="text-[9px]">Espace Transporteur</span>
						</div>
						<h1 className="text-2xl font-[1000] text-gray-900 tracking-tighter leading-[1] mb-1.5">
							Tableau de
							<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500 italic ml-1.5">
								Bord.
							</span>
						</h1>
						<p className="text-xs text-gray-500 max-w-2xl font-medium leading-relaxed">
							Gérez vos livraisons locales et optimisez votre flotte avec{" "}
							<span className="text-indigo-600 font-black">Harvests</span>.
							Suivez vos performances en temps réel.
						</p>
					</div>
				</div>

				{/* Stat Cards */}
				<div className="animate-fade-in-up">
					<TransporterStatsOverview stats={stats} loading={loading} />
				</div>

				{/* Recent Deliveries & Fleet Summary */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-5 animate-fade-in-up delay-300">
					<div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-sm border border-white/60 overflow-hidden transition-all hover:shadow-md h-full">
						<div className="p-4 border-b border-gray-100/50 flex items-center justify-between">
							<div className="flex items-center gap-2">
								<div className="p-1.5 bg-blue-50 rounded-lg text-blue-600">
									<FiPackage className="h-4 w-4" />
								</div>
								<h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">
									Livraisons Récentes
								</h3>
							</div>
							<a
								href="/transporter/orders"
								className="text-[10px] font-black text-blue-600 hover:underline"
							>
								VOIR TOUT
							</a>
						</div>
						<div className="p-4">
							<OrdersSection
								userType="transporter"
								service={transporterService}
								loading={loading}
							/>
						</div>
					</div>

					<div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-sm border border-white/60 overflow-hidden transition-all hover:shadow-md h-full">
						<div className="p-4 border-b border-gray-100/50 flex items-center justify-between">
							<div className="flex items-center gap-2">
								<div className="p-1.5 bg-indigo-50 rounded-lg text-indigo-600">
									<FiTruck className="h-4 w-4" />
								</div>
								<h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">
									Ma Flotte
								</h3>
							</div>
							<a
								href="/transporter/fleet"
								className="text-[10px] font-black text-indigo-600 hover:underline"
							>
								GÉRER
							</a>
						</div>
						<div className="p-4">
							<FleetSummarySection
								service={transporterService}
								loading={loading}
							/>
						</div>
					</div>
				</div>

				{/* Subscription & Quick Actions */}
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-5 animate-fade-in-up delay-450">
					<div className="lg:col-span-1 bg-white/70 backdrop-blur-xl rounded-2xl shadow-sm border border-white/60 overflow-hidden">
						<div className="p-4 border-b border-gray-100/50">
							<div className="flex items-center gap-2">
								<div className="p-1.5 bg-purple-50 rounded-lg text-purple-600">
									<FiStar className="h-4 w-4" />
								</div>
								<h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">
									Abonnement
								</h3>
							</div>
						</div>
						<div className="p-4">
							<SubscriptionSection />
						</div>
					</div>

					<div className="lg:col-span-2 bg-gray-900 rounded-2xl shadow-xl overflow-hidden relative group">
						<div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-50"></div>
						<div className="p-4 border-b border-white/5 relative z-10">
							<h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">
								Actions Rapides
							</h3>
						</div>
						<div className="p-4 relative z-10">
							<QuickActionsSection userType="transporter" />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default TransporterDashboard;
