import React, { useState, useEffect } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { exporterService } from "../../../services";
import ModularDashboardLayout from "../../../components/layout/ModularDashboardLayout";
import ExporterStatsOverview from "../../../components/dashboard/exporter/ExporterStatsOverview";
import ExporterCharts from "../../../components/dashboard/exporter/ExporterCharts";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import {
	BarChart3,
	TrendingUp,
	Package,
	DollarSign,
	CheckCircle,
} from "lucide-react";
import StatCards from "../../admin/adminDashboard/StatCards";

const Statistics = () => {
	const { user } = useAuth();
	const [stats, setStats] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadStats = async () => {
			if (user?.userType === "exporter") {
				try {
					setLoading(true);
					const response = await exporterService.getStats();
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
			}
		};

		loadStats();
	}, [user]);

	if (loading && !stats) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<LoadingSpinner size="lg" text="Chargement..." />
			</div>
		);
	}

	const secondaryStats = [
		{
			title: "Commandes Actives",
			value: (stats?.activeOrders || stats?.pendingOrders || 0).toString(),
			icon: TrendingUp,
			color: "bg-orange-500",
			change: "En cours",
			link: "/exporter/orders",
		},
		{
			title: "Licences",
			value: (stats?.activeLicenses || 0).toString(),
			icon: Package,
			color: "bg-indigo-500",
			change: "Conformité",
			link: "/exporter/profile",
		},
		{
			title: "Revenu Mensuel",
			value:
				stats?.monthlyRevenue ?
					`${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(stats.monthlyRevenue)} FCFA`
				:	"0 FCFA",
			icon: DollarSign,
			color: "bg-pink-500",
			change: "Ce mois",
			link: "/exporter/stats",
		},
		{
			title: "Taux Succès",
			value: `${stats?.successfulDeliveryRate || 100}%`,
			icon: CheckCircle,
			color: "bg-emerald-500",
			change: "Livraisons",
			link: "/exporter/orders",
		},
	];

	return (
		<div className="min-h-screen md:pl-3 pb-20 relative overflow-hidden">
			{/* Background radial glows */}
			<div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden ">
				<div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-100/30 rounded-full blur-[120px]"></div>
				<div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-blue-100/20 rounded-full blur-[100px]"></div>
				<div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] bg-emerald-100/20 rounded-full blur-[120px]"></div>
			</div>

			<div className="max-w-full mx-auto px-3 py-4 space-y-4 relative z-10 md:pl-6 md:px-4 md:py-6 md:space-y-5">
				{/* Header */}
				<div className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-2 animate-fade-in-down">
					<div>
						<div className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-[0.2em] mb-1.5">
							<div className="w-5 h-[2px] bg-indigo-600"></div>
							<span className="text-[9px]">Analyses & Rapports</span>
						</div>
						<h1 className="text-2xl font-[1000] text-gray-900 tracking-tighter leading-[1] mb-1.5">
							Statistiques
							<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500 italic ml-1.5">
								Détaillées.
							</span>
						</h1>
						<p className="text-xs text-gray-500 max-w-2xl font-medium leading-relaxed">
							Explorez en profondeur les indicateurs de performance de votre
							activité internationale.
						</p>
					</div>
				</div>

				{/* Global Overview Section */}
				<div className="animate-fade-in-up">
					<div className="flex items-center gap-2 mb-4 px-2">
						<BarChart3 className="w-4 h-4 text-emerald-600" />
						<span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
							Vue d'ensemble
						</span>
					</div>
					<ExporterStatsOverview stats={stats} loading={loading} />
				</div>

				{/* Detailed Metrics */}
				<div className="animate-fade-in-up delay-150">
					<div className="flex items-center gap-2 mb-4 px-2">
						<TrendingUp className="w-4 h-4 text-indigo-600" />
						<span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
							Indicateurs clés
						</span>
					</div>
					<StatCards statCards={secondaryStats} />
				</div>

				{/* Visualizations Section */}
				<div className="animate-fade-in-up delay-300">
					<div className="flex items-center gap-2 mb-4 px-2">
						<BarChart3 className="w-4 h-4 text-blue-600" />
						<span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
							Analyse Temporelle
						</span>
					</div>
					<ExporterCharts loading={loading} stats={stats} />
				</div>

				{/* Empty State */}
				{!stats && !loading && (
					<div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-sm border border-white/60 p-16 text-center animate-fade-in-up">
						<div className="mx-auto h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
							<BarChart3 className="h-10 w-10 text-gray-300" />
						</div>
						<h3 className="text-xl font-bold text-gray-900 tracking-tight">
							Aucune donnée disponible
						</h3>
						<p className="mt-2 text-gray-500 max-w-sm mx-auto text-xs font-medium">
							Vos statistiques détaillées apparaîtront ici dès que vous aurez
							enregistré votre première exportation.
						</p>
					</div>
				)}
			</div>
		</div>
	);
};

export default Statistics;
