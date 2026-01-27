import React, { useState, useEffect } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { exporterService } from "../../../services";
import ModularDashboardLayout from "../../../components/layout/ModularDashboardLayout";
import { FaChartBar } from "react-icons/fa";
import { FiTrendingUp, FiPackage, FiGlobe, FiDollarSign } from "react-icons/fi";
import LoadingSpinner from "../../../components/common/LoadingSpinner";

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
					console.log("[Statistics] Stats response:", response);
					// La réponse est { status: 'success', data: { stats: {...} } }
					// Donc response.data = { status: 'success', data: { stats: {...} } }
					// Et response.data.data = { stats: {...} }
					// Donc response.data.data.stats = { totalExports, totalValue, ... }
					setStats(
						response.data?.data?.stats || response.data?.stats || response.data,
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

	if (loading) {
		return (
			<div className="p-6 max-w-7xl mx-auto">
				<div className="text-center py-12">
					<LoadingSpinner size="lg" text="Chargement des statistiques..." />
				</div>
			</div>
		);
	}

	return (
		<div className="p-6 max-w-7xl mx-auto">
			<div className="mb-8">
				<h1 className="text-2xl font-bold text-gray-900">
					Statistiques d'export
				</h1>
				<p className="text-gray-600 mt-1">
					Analysez vos performances d'exportation
				</p>
			</div>

			{stats && (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
					<div className="bg-white rounded-lg shadow p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-gray-600">
									Exportations totales
								</p>
								<p className="text-2xl font-bold text-gray-900 mt-2">
									{stats.totalExports || 0}
								</p>
							</div>
							<FiPackage className="h-8 w-8 text-blue-500" />
						</div>
					</div>

					<div className="bg-white rounded-lg shadow p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-gray-600">
									Valeur totale
								</p>
								<p className="text-2xl font-bold text-gray-900 mt-2">
									{stats.totalValue ?
										new Intl.NumberFormat("fr-FR", {
											style: "currency",
											currency: "XOF",
										}).format(stats.totalValue)
									:	"0 XOF"}
								</p>
							</div>
							<FiDollarSign className="h-8 w-8 text-green-500" />
						</div>
					</div>

					<div className="bg-white rounded-lg shadow p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-gray-600">
									Pays d'export
								</p>
								<p className="text-2xl font-bold text-gray-900 mt-2">
									{typeof stats.exportCountries === "number" ?
										stats.exportCountries
									:	stats.exportCountries?.length || 0}
								</p>
							</div>
							<FiGlobe className="h-8 w-8 text-purple-500" />
						</div>
					</div>

					<div className="bg-white rounded-lg shadow p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-gray-600">
									Note moyenne
								</p>
								<p className="text-2xl font-bold text-gray-900 mt-2">
									{stats.averageRating?.toFixed(1) || "0.0"}
								</p>
							</div>
							<FaChartBar className="h-8 w-8 text-yellow-500" />
						</div>
					</div>

					<div className="bg-white rounded-lg shadow p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-gray-600">
									Commandes actives
								</p>
								<p className="text-2xl font-bold text-gray-900 mt-2">
									{stats.activeOrders || stats.pendingOrders || 0}
								</p>
							</div>
							<FiTrendingUp className="h-8 w-8 text-orange-500" />
						</div>
					</div>

					<div className="bg-white rounded-lg shadow p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-gray-600">
									Licences actives
								</p>
								<p className="text-2xl font-bold text-gray-900 mt-2">
									{stats.activeLicenses || 0}
								</p>
							</div>
							<FiPackage className="h-8 w-8 text-indigo-500" />
						</div>
					</div>

					<div className="bg-white rounded-lg shadow p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-gray-600">
									Revenu mensuel
								</p>
								<p className="text-2xl font-bold text-gray-900 mt-2">
									{stats.monthlyRevenue ?
										new Intl.NumberFormat("fr-FR", {
											style: "currency",
											currency: "XOF",
										}).format(stats.monthlyRevenue)
									:	"0 XOF"}
								</p>
							</div>
							<FiDollarSign className="h-8 w-8 text-teal-500" />
						</div>
					</div>

					<div className="bg-white rounded-lg shadow p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-gray-600">
									Taux de réussite
								</p>
								<p className="text-2xl font-bold text-gray-900 mt-2">
									{stats.successfulDeliveryRate ?
										`${stats.successfulDeliveryRate}%`
									:	"0%"}
								</p>
							</div>
							<FiTrendingUp className="h-8 w-8 text-green-500" />
						</div>
					</div>
				</div>
			)}

			{!stats && (
				<div className="bg-white rounded-lg shadow p-12 text-center">
					<FaChartBar className="mx-auto h-16 w-16 text-gray-400" />
					<h3 className="mt-4 text-lg font-medium text-gray-900">
						Aucune statistique disponible
					</h3>
					<p className="mt-2 text-gray-600">
						Vos statistiques apparaîtront ici une fois que vous commencerez à
						exporter.
					</p>
				</div>
			)}
		</div>
	);
};

export default Statistics;
