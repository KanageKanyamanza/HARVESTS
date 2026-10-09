import React, { useState, useEffect } from "react";
import { useTranslation, Trans } from "react-i18next";
import ExporterStatsOverview from "../../../components/dashboard/exporter/ExporterStatsOverview";
import ExporterCharts from "../../../components/dashboard/exporter/ExporterCharts";
import OrdersSection from "../../../components/dashboard/sections/OrdersSection";
import QuickActionsSection from "../../../components/dashboard/sections/QuickActionsSection";
import FleetSummarySection from "../../../components/dashboard/sections/FleetSummarySection";
import SubscriptionSection from "../../../components/dashboard/sections/SubscriptionSection";
import { exporterService } from "../../../services";
import { FiPackage, FiTruck, FiStar } from "react-icons/fi";

const ExporterDashboard = () => {
	const { t } = useTranslation("dashboard-transporter");
	const [exporterStats, setExporterStats] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		loadExporterStats();
	}, []);

	const loadExporterStats = async () => {
		try {
			setLoading(true);
			const response = await exporterService.getStats();
			setExporterStats(
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


	const limited = !loading && exporterStats?.maxWeeklyOrders > 0;
	const reachedQuota =
		limited && exporterStats.weeklyOrders >= exporterStats.maxWeeklyOrders;
	const nearQuota =
		limited &&
		!reachedQuota &&
		exporterStats?.weeklyOrders >= exporterStats?.maxWeeklyOrders * 0.8;

	return (
		<div className="dashboard-page">
			{/* Background radial glows for "wow" effect - Copied from ProducerDashboard */}
			<div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden ">
				<div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-100/30 rounded-full blur-[120px]"></div>
				<div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-blue-100/20 rounded-full blur-[100px]"></div>
				<div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] bg-orange-100/20 rounded-full blur-[120px]"></div>
			</div>

			<div className="dashboard-container space-y-4 md:space-y-5">
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
									{t("dashboard.quotaReachedTitle", {
										count: exporterStats.weeklyOrders,
										max: exporterStats.maxWeeklyOrders,
									})}
								</p>
								<p className="text-xs text-red-600">
									{t("exporter.dashboard.quotaReachedText")}
								</p>
							</div>
							<div className="ml-auto">
								<button
									onClick={() => (window.location.href = "/pricing")}
									className="text-xs bg-red-600 text-white px-3 py-1 rounded font-bold hover:bg-red-700 transition-colors uppercase tracking-wider"
								>
									{t("dashboard.upgrade")}
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
									{t("exporter.dashboard.quotaNearTitle", {
										count: exporterStats.weeklyOrders,
										max: exporterStats.maxWeeklyOrders,
									})}
								</p>
								<p className="text-xs text-amber-600">
									{t("exporter.dashboard.quotaNearText")}
								</p>
							</div>
							<div className="ml-auto">
								<button
									onClick={() => (window.location.href = "/pricing")}
									className="text-xs bg-amber-600 text-white px-3 py-1 rounded font-bold hover:bg-amber-700 transition-colors uppercase tracking-wider"
								>
									{t("dashboard.upgrade")}
								</button>
							</div>
						</div>
					</div>
				)}

				{/* Header */}
				<div className="flex flex-col md:flex-row md:items-end justify-between gap-4 animate-fade-in-down">
					<div>
						<div className="flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-[0.2em] mb-1.5">
							<div className="w-5 h-[2px] bg-emerald-600"></div>
							<span className="text-[9px]">{t("exporter.dashboard.eyebrow")}</span>
						</div>
						<h1 className="text-2xl font-[1000] text-gray-900 tracking-tighter leading-[1] mb-1.5">
							{t("dashboard.titleStart")}
							<span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-500 italic ml-1.5">
								{t("dashboard.titleHighlight")}
							</span>
						</h1>
						<p className="text-xs text-gray-500 max-w-2xl font-medium leading-relaxed">
							<Trans
								i18nKey="exporter.dashboard.subtitle"
								ns="dashboard-transporter"
								components={{ brand: <span className="text-emerald-600 font-black" /> }}
							/>
						</p>
					</div>
				</div>

				{/* Stat Cards */}
				<div className="animate-fade-in-up">
					<ExporterStatsOverview stats={exporterStats} loading={loading} />
				</div>

				{/* Charts Section */}
				<div className="animate-fade-in-up delay-150">
					<ExporterCharts loading={loading} stats={exporterStats} />
				</div>

				{/* Recent Orders & Fleet Summary */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-5 animate-fade-in-up delay-300">
					<div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-sm border border-white/60 overflow-hidden transition-all hover:shadow-md h-full">
						<div className="p-4 border-b border-gray-100/50 flex items-center justify-between">
							<div className="flex items-center gap-2">
								<div className="p-1.5 bg-blue-50 rounded-lg text-blue-600">
									<FiPackage className="h-4 w-4" />
								</div>
								<h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">
									{t("exporter.dashboard.recentOrders")}
								</h3>
							</div>
							<a
								href="/exporter/orders"
								className="text-[10px] font-black uppercase text-blue-600 hover:underline"
							>
								{t("dashboard.seeAll")}
							</a>
						</div>
						<div className="p-4">
							<OrdersSection
								userType="exporter"
								service={exporterService}
								loading={loading}
							/>
						</div>
					</div>

					<div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-sm border border-white/60 overflow-hidden transition-all hover:shadow-md h-full">
						<div className="p-4 border-b border-gray-100/50 flex items-center justify-between">
							<div className="flex items-center gap-2">
								<div className="p-1.5 bg-orange-50 rounded-lg text-orange-600">
									<FiTruck className="h-4 w-4" />
								</div>
								<h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">
									{t("dashboard.myFleet")}
								</h3>
							</div>
							<a
								href="/exporter/fleet"
								className="text-[10px] font-black uppercase text-orange-600 hover:underline"
							>
								{t("dashboard.manage")}
							</a>
						</div>
						<div className="p-4">
							<FleetSummarySection
								service={exporterService}
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
									{t("dashboard.subscription")}
								</h3>
							</div>
						</div>
						<div className="p-4">
							<SubscriptionSection />
						</div>
					</div>

					<div className="lg:col-span-2 bg-gray-900 rounded-2xl shadow-xl overflow-hidden relative group">
						<div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-transparent opacity-50"></div>
						<div className="p-4 border-b border-white/5 relative z-10">
							<h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">
								{t("dashboard.quickActions")}
							</h3>
						</div>
						<div className="p-4 relative z-10">
							<QuickActionsSection userType="exporter" />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ExporterDashboard;
