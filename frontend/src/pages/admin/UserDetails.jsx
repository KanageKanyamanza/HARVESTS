import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
	ArrowLeft,
	Mail,
	Phone,
	MapPin,
	Calendar,
	Shield,
	ShieldCheck,
	Ban,
	UserCheck,
	Edit,
	Trash2,
	CheckCircle,
	XCircle,
	Clock,
	Truck,
	Globe,
} from "lucide-react";
import { adminService } from "../../services/adminService";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const UserDetails = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const [actionLoading, setActionLoading] = useState(false);

	useEffect(() => {
		loadUser();
	}, [id]);

	const loadUser = async () => {
		try {
			setLoading(true);
			const response = await adminService.getUserById(id);
			setUser(response.data.user);
		} catch (error) {
			console.error("Erreur lors du chargement de l'utilisateur:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleVerifyUser = async () => {
		if (window.confirm("Êtes-vous sûr de vouloir vérifier cet utilisateur ?")) {
			try {
				setActionLoading(true);
				await adminService.verifyUser(id);
				await loadUser(); // Recharger les données
			} catch (error) {
				console.error("Erreur lors de la vérification:", error);
			} finally {
				setActionLoading(false);
			}
		}
	};

	const handleBanUser = async () => {
		if (window.confirm("Êtes-vous sûr de vouloir bannir cet utilisateur ?")) {
			try {
				setActionLoading(true);
				await adminService.banUser(id, "Banni par un administrateur");
				await loadUser(); // Recharger les données
			} catch (error) {
				console.error("Erreur lors du bannissement:", error);
			} finally {
				setActionLoading(false);
			}
		}
	};

	const handleUnbanUser = async () => {
		if (window.confirm("Êtes-vous sûr de vouloir débannir cet utilisateur ?")) {
			try {
				setActionLoading(true);
				await adminService.unbanUser(id);
				await loadUser(); // Recharger les données
			} catch (error) {
				console.error("Erreur lors du débannissement:", error);
			} finally {
				setActionLoading(false);
			}
		}
	};

	const getStatusColor = (status) => {
		const colors = {
			Actif: "text-green-600 bg-green-100",
			Vérifié: "text-blue-600 bg-blue-100",
			"En attente": "text-yellow-600 bg-yellow-100",
			Banni: "text-red-600 bg-red-100",
		};
		return colors[status] || "text-gray-600 bg-gray-100";
	};

	const getStatusIcon = (status) => {
		switch (status) {
			case "Vérifié":
				return <CheckCircle className="h-5 w-5" />;
			case "En attente":
				return <Clock className="h-5 w-5" />;
			case "Banni":
				return <Ban className="h-5 w-5" />;
			default:
				return <Shield className="h-5 w-5" />;
		}
	};

	const formatDate = (date) => {
		return new Date(date).toLocaleDateString("fr-FR", {
			year: "numeric",
			month: "long",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center h-64">
				<LoadingSpinner size="lg" text="Chargement de l'utilisateur..." />
			</div>
		);
	}

	if (!user) {
		return (
			<div className="text-center py-12">
				<h2 className="text-2xl font-bold text-gray-900 mb-4">
					Utilisateur non trouvé
				</h2>
				<p className="text-gray-600 mb-6">
					L'utilisateur que vous recherchez n'existe pas.
				</p>
				<button
					onClick={() => navigate(-1)}
					className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
				>
					Retour
				</button>
			</div>
		);
	}

	return (
		<div className="max-w-6xl mx-auto p-6">
			{/* Header */}
			<div className="flex items-center justify-between mb-6">
				<div className="flex items-center space-x-4">
					<button
						onClick={() => navigate(-1)}
						className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
					>
						<ArrowLeft className="h-6 w-6" />
					</button>
					<div>
						<h1 className="text-2xl font-bold text-gray-900">
							{user.firstName} {user.lastName}
						</h1>
						<p className="text-gray-600">{user.email}</p>
					</div>
				</div>

				<div className="flex items-center space-x-3">
					<span
						className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
							user.status
						)}`}
					>
						{getStatusIcon(user.status)}
						<span className="ml-2">{user.status}</span>
					</span>
				</div>
			</div>

			{/* Actions */}
			<div className="bg-white rounded-lg shadow p-6 mb-6">
				<h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
				<div className="flex flex-wrap gap-3">
					{user.status !== "Vérifié" && (
						<button
							onClick={handleVerifyUser}
							disabled={actionLoading}
							className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
						>
							<UserCheck className="h-4 w-4 mr-2" />
							Vérifier
						</button>
					)}

					{user.status !== "Banni" ? (
						<button
							onClick={handleBanUser}
							disabled={actionLoading}
							className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center"
						>
							<Ban className="h-4 w-4 mr-2" />
							Bannir
						</button>
					) : (
						<button
							onClick={handleUnbanUser}
							disabled={actionLoading}
							className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center"
						>
							<ShieldCheck className="h-4 w-4 mr-2" />
							Débannir
						</button>
					)}
				</div>
			</div>

			{/* Informations générales */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
				<div className="bg-white rounded-lg shadow p-6">
					<h2 className="text-lg font-semibold text-gray-900 mb-4">
						Informations personnelles
					</h2>
					<div className="space-y-4">
						<div className="flex items-center">
							<Mail className="h-5 w-5 text-gray-400 mr-3" />
							<div>
								<p className="text-sm text-gray-500">Email</p>
								<p className="font-medium">{user.email}</p>
							</div>
						</div>

						<div className="flex items-center">
							<Phone className="h-5 w-5 text-gray-400 mr-3" />
							<div>
								<p className="text-sm text-gray-500">Téléphone</p>
								<p className="font-medium">{user.phone}</p>
							</div>
						</div>

						<div className="flex items-center">
							<MapPin className="h-5 w-5 text-gray-400 mr-3" />
							<div>
								<p className="text-sm text-gray-500">Pays</p>
								<p className="font-medium">{user.country}</p>
							</div>
						</div>

						<div className="flex items-center">
							<Calendar className="h-5 w-5 text-gray-400 mr-3" />
							<div>
								<p className="text-sm text-gray-500">Inscrit le</p>
								<p className="font-medium">{formatDate(user.createdAt)}</p>
							</div>
						</div>
					</div>
				</div>

				<div className="bg-white rounded-lg shadow p-6">
					<h2 className="text-lg font-semibold text-gray-900 mb-4">
						Informations du compte
					</h2>
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<span className="text-sm text-gray-500">Type d'utilisateur</span>
							<span className="font-medium capitalize">{user.userType}</span>
						</div>

						<div className="flex items-center justify-between">
							<span className="text-sm text-gray-500">Email vérifié</span>
							<div className="flex items-center">
								{user.isEmailVerified ? (
									<CheckCircle className="h-5 w-5 text-green-500" />
								) : (
									<XCircle className="h-5 w-5 text-red-500" />
								)}
							</div>
						</div>

						<div className="flex items-center justify-between">
							<span className="text-sm text-gray-500">Compte approuvé</span>
							<div className="flex items-center">
								{user.isApproved ? (
									<CheckCircle className="h-5 w-5 text-green-500" />
								) : (
									<XCircle className="h-5 w-5 text-red-500" />
								)}
							</div>
						</div>

						<div className="flex items-center justify-between">
							<span className="text-sm text-gray-500">Compte actif</span>
							<div className="flex items-center">
								{user.isActive ? (
									<CheckCircle className="h-5 w-5 text-green-500" />
								) : (
									<XCircle className="h-5 w-5 text-red-500" />
								)}
							</div>
						</div>

						<div className="flex items-center justify-between">
							<span className="text-sm text-gray-500">Profil complet</span>
							<div className="flex items-center">
								{user.isProfileComplete ? (
									<CheckCircle className="h-5 w-5 text-green-500" />
								) : (
									<XCircle className="h-5 w-5 text-red-500" />
								)}
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Adresse */}
			{user.address && (
				<div className="bg-white rounded-lg shadow p-6 mb-6">
					<h2 className="text-lg font-semibold text-gray-900 mb-4">Adresse</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<p className="text-sm text-gray-500">Rue</p>
							<p className="font-medium">{user.address.street}</p>
						</div>
						<div>
							<p className="text-sm text-gray-500">Ville</p>
							<p className="font-medium">{user.address.city}</p>
						</div>
						<div>
							<p className="text-sm text-gray-500">Région</p>
							<p className="font-medium">{user.address.region}</p>
						</div>
						<div>
							<p className="text-sm text-gray-500">Code postal</p>
							<p className="font-medium">
								{user.address.postalCode || "Non renseigné"}
							</p>
						</div>
					</div>
				</div>
			)}

			{/* Informations spécifiques selon le type d'utilisateur */}
			{user.userType === "producer" && (
				<div className="bg-white rounded-lg shadow p-6 mb-6">
					<h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
						<Shield className="h-5 w-5 mr-2 text-green-600" />
						Détails Producteur
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						<div>
							<p className="text-sm text-gray-500">Nom de la ferme</p>
							<p className="font-medium text-lg">
								{user.farmName || "Non renseigné"}
							</p>
						</div>
						<div>
							<p className="text-sm text-gray-500">Taille de l'exploitation</p>
							<p className="font-medium">
								{user.farmSize?.value} {user.farmSize?.unit || "hectares"}
							</p>
						</div>
						<div>
							<p className="text-sm text-gray-500">Type d'agriculture</p>
							<p className="font-medium capitalize">
								{user.farmingType || "Conventionnelle"}
							</p>
						</div>
						{user.crops && user.crops.length > 0 && (
							<div className="col-span-full">
								<p className="text-sm text-gray-500 mb-2">Cultures</p>
								<div className="flex flex-wrap gap-2">
									{user.crops.map((crop, i) => (
										<span
											key={i}
											className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs border border-green-100"
										>
											{crop.name} ({crop.category})
										</span>
									))}
								</div>
							</div>
						)}
						<div className="col-span-full pt-4 border-t border-gray-50">
							<p className="text-sm text-gray-500 mb-2">Livraison</p>
							<div className="flex space-x-6 text-sm">
								<span
									className={
										user.deliveryOptions?.canDeliver
											? "text-green-600 font-medium"
											: "text-gray-400"
									}
								>
									{user.deliveryOptions?.canDeliver
										? "✓ Propose la livraison"
										: "✗ Pas de livraison"}
								</span>
								{user.deliveryOptions?.canDeliver && (
									<>
										<span>Rayon: {user.deliveryOptions.deliveryRadius} km</span>
										<span>Frais: {user.deliveryOptions.deliveryFee} FCFA</span>
									</>
								)}
							</div>
						</div>
					</div>
				</div>
			)}

			{user.userType === "restaurateur" && (
				<div className="bg-white rounded-lg shadow p-6 mb-6">
					<h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
						<Shield className="h-5 w-5 mr-2 text-blue-600" />
						Détails Restaurant
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<p className="text-sm text-gray-500">Nom</p>
							<p className="font-medium text-lg">
								{user.restaurantName || "Non renseigné"}
							</p>
						</div>
						<div>
							<p className="text-sm text-gray-500">Type de restaurant</p>
							<p className="font-medium capitalize">
								{user.restaurantType || "Non renseigné"}
							</p>
						</div>
						<div>
							<p className="text-sm text-gray-500">Capacité</p>
							<p className="font-medium">
								{user.seatingCapacity || "0"} places
							</p>
						</div>
						<div className="col-span-full">
							<p className="text-sm text-gray-500 mb-2">Cuisines</p>
							<div className="flex flex-wrap gap-2">
								{(user.cuisineTypes || []).map((type, i) => (
									<span
										key={i}
										className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs"
									>
										{type}
									</span>
								))}
							</div>
						</div>
					</div>
				</div>
			)}

			{user.userType === "transporter" && (
				<div className="bg-white rounded-lg shadow p-6 mb-6">
					<h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
						<Truck className="h-5 w-5 mr-2 text-purple-600" />
						Détails Transporteur
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<p className="text-sm text-gray-500">Type de transport</p>
							<div className="flex flex-wrap gap-2 mt-1">
								{(user.transportType || []).map((t, i) => (
									<span
										key={i}
										className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded border border-blue-100 capitalize"
									>
										{t}
									</span>
								))}
							</div>
						</div>
						<div>
							<p className="text-sm text-gray-500">Modèle de prix</p>
							<p className="font-medium capitalize">
								{user.pricingModel ||
									user.pricingStructure?.model ||
									"À la demande"}
							</p>
						</div>
					</div>
				</div>
			)}

			{user.userType === "exporter" && (
				<div className="bg-white rounded-lg shadow p-6 mb-6">
					<h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
						<Globe className="h-5 w-5 mr-2 text-indigo-600" />
						Détails Exportateur
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<p className="text-sm text-gray-500">Incoterms acceptés</p>
							<div className="flex flex-wrap gap-2 mt-1">
								{(user.tradingTerms?.acceptedIncoterms || []).map((term, i) => (
									<span
										key={i}
										className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded border border-blue-100"
									>
										{term}
									</span>
								))}
							</div>
						</div>
						<div>
							<p className="text-sm text-gray-500">Devises</p>
							<div className="flex flex-wrap gap-2 mt-1">
								{(user.tradingTerms?.currencies || []).map((curr, i) => (
									<span
										key={i}
										className="px-2 py-0.5 bg-green-50 text-green-700 text-xs font-medium rounded border border-green-100"
									>
										{curr}
									</span>
								))}
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default UserDetails;
