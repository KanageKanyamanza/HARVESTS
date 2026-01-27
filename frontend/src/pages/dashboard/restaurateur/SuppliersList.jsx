import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { restaurateurService } from "../../../services";
import { useNotifications } from "../../../contexts/NotificationContext";
import ModularDashboardLayout from "../../../components/layout/ModularDashboardLayout";
import CloudinaryImage from "../../../components/common/CloudinaryImage";
import {
	FiUsers,
	FiSearch,
	FiFilter,
	FiRefreshCw,
	FiEye,
	FiStar,
	FiMapPin,
	FiPackage,
	FiPlus,
	FiHeart,
	FiMessageCircle,
	FiTruck,
	FiCheckCircle,
	FiAlertCircle,
} from "react-icons/fi";

const SuppliersList = () => {
	const { showSuccess, showError } = useNotifications();
	const [suppliers, setSuppliers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [filters, setFilters] = useState({
		search: "",
		userType: "",
		region: "",
		rating: "",
	});
	const [pagination, setPagination] = useState({
		page: 1,
		limit: 12,
		total: 0,
		totalPages: 0,
	});

	// Charger les fournisseurs
	useEffect(() => {
		const loadSuppliers = async () => {
			try {
				setLoading(true);
				const response = await restaurateurService.discoverSuppliers({
					page: pagination.page,
					limit: pagination.limit,
					...filters,
				});

				setSuppliers(response.data?.data?.suppliers || []);
				setPagination((prev) => ({
					...prev,
					total: response.data?.total || 0,
					totalPages: response.data?.totalPages || 0,
				}));
			} catch (error) {
				console.error("Erreur lors du chargement des fournisseurs:", error);
				setError("Erreur lors du chargement des fournisseurs");
				setSuppliers([]);
			} finally {
				setLoading(false);
			}
		};

		loadSuppliers();
	}, [pagination.page, pagination.limit, filters]);

	// Filtrer les fournisseurs
	const filteredSuppliers = suppliers.filter((supplier) => {
		const matchesSearch =
			!filters.search ||
			supplier.firstName
				?.toLowerCase()
				.includes(filters.search.toLowerCase()) ||
			supplier.lastName?.toLowerCase().includes(filters.search.toLowerCase()) ||
			supplier.companyName
				?.toLowerCase()
				.includes(filters.search.toLowerCase());

		const matchesUserType =
			!filters.userType || supplier.userType === filters.userType;
		const matchesRegion =
			!filters.region || supplier.address?.region === filters.region;
		const matchesRating =
			!filters.rating ||
			(supplier.rating && supplier.rating >= parseInt(filters.rating));

		return matchesSearch && matchesUserType && matchesRegion && matchesRating;
	});

	// Ajouter aux fournisseurs préférés
	const handleAddToFavorites = async (supplierId) => {
		try {
			await restaurateurService.addPreferredSupplier({ supplier: supplierId });
			showSuccess("Fournisseur ajouté aux favoris");
			// Mettre à jour la liste
			const response = await restaurateurService.discoverSuppliers({
				page: pagination.page,
				limit: pagination.limit,
				...filters,
			});
			setSuppliers(response.data?.data?.suppliers || []);
		} catch (error) {
			console.error("Erreur lors de l'ajout aux favoris:", error);
			showError("Erreur lors de l'ajout aux favoris");
		}
	};

	// Obtenir le type d'utilisateur
	const getUserTypeLabel = (userType) => {
		const typeMap = {
			producer: "Producteur",
			transformer: "Transformateur",
			exporter: "Exportateur",
			transporter: "Transporteur",
		};
		return typeMap[userType] || userType;
	};

	// Obtenir l'icône du type d'utilisateur
	const getUserTypeIcon = (userType) => {
		const iconMap = {
			producer: FiPackage,
			transformer: FiTruck,
			exporter: FiCheckCircle,
			transporter: FiTruck,
		};
		return iconMap[userType] || FiUsers;
	};

	// Formater la note
	const formatRating = (rating) => {
		if (!rating) return "N/A";
		return rating.toFixed(1);
	};

	// Changer de page
	const handlePageChange = (newPage) => {
		setPagination((prev) => ({ ...prev, page: newPage }));
	};

	if (loading) {
		return (
			<div className="p-6 max-w-7xl mx-auto pb-20">
				<div className="animate-pulse">
					<div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
					<div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
						{[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
							<div key={i} className="bg-white rounded-lg shadow p-6">
								<div className="h-4 bg-gray-200 rounded mb-2"></div>
								<div className="h-4 bg-gray-200 rounded w-1/2"></div>
							</div>
						))}
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="p-6 max-w-7xl mx-auto pb-20">
			{/* Header */}
			<div className="flex items-center justify-between mb-8">
				<div>
					<h1 className="text-2xl font-bold text-gray-900">Fournisseurs</h1>
					<p className="text-gray-600 mt-1">
						Découvrez et gérez vos fournisseurs
					</p>
				</div>
				<Link
					to="/restaurateur/suppliers/preferred"
					className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-harvests-green hover:bg-green-600"
				>
					<FiHeart className="h-4 w-4 mr-2" />
					Mes favoris
				</Link>
			</div>

			{/* Filtres */}
			<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
					<div className="lg:col-span-2">
						<div className="relative">
							<FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
							<input
								type="text"
								placeholder="Rechercher par nom ou entreprise..."
								value={filters.search}
								onChange={(e) =>
									setFilters((prev) => ({ ...prev, search: e.target.value }))
								}
								className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-harvests-green focus:border-transparent"
							/>
						</div>
					</div>
					<div>
						<select
							value={filters.userType}
							onChange={(e) =>
								setFilters((prev) => ({ ...prev, userType: e.target.value }))
							}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-harvests-green focus:border-transparent"
						>
							<option value="">Tous les types</option>
							<option value="producer">Producteurs</option>
							<option value="transformer">Transformateurs</option>
							<option value="exporter">Exportateurs</option>
							<option value="transporter">Transporteurs</option>
						</select>
					</div>
					<div>
						<select
							value={filters.rating}
							onChange={(e) =>
								setFilters((prev) => ({ ...prev, rating: e.target.value }))
							}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-harvests-green focus:border-transparent"
						>
							<option value="">Toutes les notes</option>
							<option value="4">4+ étoiles</option>
							<option value="3">3+ étoiles</option>
							<option value="2">2+ étoiles</option>
							<option value="1">1+ étoile</option>
						</select>
					</div>
				</div>
				<div className="mt-4 flex justify-between items-center">
					<button
						onClick={() =>
							setFilters({ search: "", userType: "", region: "", rating: "" })
						}
						className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-harvests-light"
					>
						<FiRefreshCw className="h-4 w-4 mr-2" />
						Réinitialiser
					</button>
					<div className="text-sm text-gray-500">
						{pagination.total} fournisseur(s) trouvé(s)
					</div>
				</div>
			</div>

			{/* Liste des fournisseurs */}
			{filteredSuppliers.length === 0 ?
				<div className="text-center py-12">
					<FiUsers className="mx-auto h-12 w-12 text-gray-400" />
					<h3 className="mt-2 text-sm font-medium text-gray-900">
						Aucun fournisseur
					</h3>
					<p className="mt-1 text-sm text-gray-500">
						{filters.search || filters.userType || filters.rating ?
							"Aucun fournisseur ne correspond à vos critères"
						:	"Aucun fournisseur disponible pour le moment"}
					</p>
				</div>
			:	<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
					{filteredSuppliers.map((supplier) => {
						const UserTypeIcon = getUserTypeIcon(supplier.userType);

						return (
							<div
								key={supplier._id}
								className="bg-white rounded-lg shadow hover:shadow-md transition-shadow"
							>
								<div className="p-6">
									<div className="flex items-center space-x-4 mb-4">
										<div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
											{supplier.avatar ?
												<CloudinaryImage
													src={supplier.avatar}
													alt={supplier.firstName}
													className="w-12 h-12 object-cover rounded-lg"
													width={200}
													height={200}
													quality="auto"
													crop="fill"
												/>
											:	<UserTypeIcon className="h-6 w-6 text-gray-400" />}
										</div>
										<div className="flex-1 min-w-0">
											<h3 className="text-sm font-medium text-gray-900 truncate">
												{supplier.firstName} {supplier.lastName}
											</h3>
											<p className="text-sm text-gray-500 truncate">
												{supplier.companyName ||
													getUserTypeLabel(supplier.userType)}
											</p>
										</div>
									</div>

									<div className="space-y-2 mb-4">
										<div className="flex items-center text-sm text-gray-500">
											<UserTypeIcon className="h-4 w-4 mr-2" />
											{getUserTypeLabel(supplier.userType)}
										</div>
										{supplier.address?.city && (
											<div className="flex items-center text-sm text-gray-500">
												<FiMapPin className="h-4 w-4 mr-2" />
												{supplier.address.city}
											</div>
										)}
										<div className="flex items-center text-sm text-gray-500">
											<FiStar className="h-4 w-4 mr-2" />
											{formatRating(supplier.rating)} étoiles
										</div>
									</div>

									<div className="flex space-x-2">
										<Link
											to={
												supplier.userType === "producer" ?
													`/producers/${supplier._id}`
												:	`/transformers/${supplier._id}`
											}
											className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-harvests-light"
										>
											<FiEye className="h-4 w-4 mr-2" />
											Voir
										</Link>
										<button
											onClick={() => handleAddToFavorites(supplier._id)}
											className="inline-flex items-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-harvests-green hover:bg-green-600"
											title="Ajouter aux favoris"
										>
											<FiHeart className="h-4 w-4" />
										</button>
									</div>
								</div>
							</div>
						);
					})}
				</div>
			}

			{/* Pagination */}
			{pagination.totalPages > 1 && (
				<div className="mt-8 flex items-center justify-between">
					<div className="text-sm text-gray-700">
						Affichage de {(pagination.page - 1) * pagination.limit + 1} à{" "}
						{Math.min(pagination.page * pagination.limit, pagination.total)} sur{" "}
						{pagination.total} fournisseurs
					</div>
					<div className="flex space-x-2">
						<button
							onClick={() => handlePageChange(pagination.page - 1)}
							disabled={pagination.page === 1}
							className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-harvests-light disabled:opacity-50 disabled:cursor-not-allowed"
						>
							Précédent
						</button>
						{Array.from(
							{ length: Math.min(5, pagination.totalPages) },
							(_, i) => {
								const page = i + 1;
								return (
									<button
										key={page}
										onClick={() => handlePageChange(page)}
										className={`px-3 py-2 border rounded-md text-sm font-medium ${
											page === pagination.page ?
												"border-harvests-green bg-harvests-green text-white"
											:	"border-gray-300 text-gray-700 bg-white hover:bg-harvests-light"
										}`}
									>
										{page}
									</button>
								);
							},
						)}
						<button
							onClick={() => handlePageChange(pagination.page + 1)}
							disabled={pagination.page === pagination.totalPages}
							className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-harvests-light disabled:opacity-50 disabled:cursor-not-allowed"
						>
							Suivant
						</button>
					</div>
				</div>
			)}
		</div>
	);
};

export default SuppliersList;
