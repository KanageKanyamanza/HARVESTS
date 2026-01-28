import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import { exporterService } from "../../../services";
import ModularDashboardLayout from "../../../components/layout/ModularDashboardLayout";
import {
	FiTruck,
	FiPlus,
	FiSearch,
	FiPackage,
	FiGlobe,
	FiBox,
	FiEdit,
	FiTrash2,
	FiMapPin,
	FiZap,
	FiStar,
} from "react-icons/fi";
import { useNotifications } from "../../../contexts/NotificationContext";
import CloudinaryImage from "../../../components/common/CloudinaryImage";
import LoadingSpinner from "../../../components/common/LoadingSpinner";

const Fleet = () => {
	const { user } = useAuth();
	const navigate = useNavigate();
	const { showSuccess, showError } = useNotifications();
	const [fleet, setFleet] = useState([]);
	const [exporter, setExporter] = useState(null);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");

	useEffect(() => {
		const loadFleet = async () => {
			if (user?.userType === "exporter") {
				try {
					setLoading(true);
					const fleetResponse = await exporterService.getFleet();
					const fleetData =
						fleetResponse.data.data?.fleet || fleetResponse.data.fleet || [];
					setFleet(Array.isArray(fleetData) ? fleetData : []);

					try {
						const profileResponse = await exporterService.getProfile();
						const exporterData =
							profileResponse.data.data || profileResponse.data;
						setExporter(exporterData);
					} catch (error) {
						console.warn("Erreur lors du chargement du profil:", error);
					}
				} catch (error) {
					console.error("Erreur lors du chargement de la flotte:", error);
					setFleet([]);
				} finally {
					setLoading(false);
				}
			}
		};

		loadFleet();
	}, [user?.userType, user?.id]);

	const handleDeleteVehicle = useCallback(
		async (vehicleId) => {
			if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce véhicule ?")) {
				return;
			}

			try {
				await exporterService.removeFleetVehicle(vehicleId);
				showSuccess("Véhicule supprimé avec succès");
				setFleet((prev) => prev.filter((v) => v._id !== vehicleId));
			} catch (error) {
				console.error("Erreur lors de la suppression:", error);
				showError("Erreur lors de la suppression du véhicule");
			}
		},
		[showSuccess, showError],
	);

	const filteredFleet = useMemo(() => {
		return fleet.filter((vehicle) => {
			if (!vehicle) return false;

			const matchesSearch =
				searchTerm === "" ||
				vehicle.vehicleType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				vehicle.registrationNumber
					?.toLowerCase()
					.includes(searchTerm.toLowerCase()) ||
				vehicle.containerNumber
					?.toLowerCase()
					.includes(searchTerm.toLowerCase());

			return matchesSearch;
		});
	}, [fleet, searchTerm]);

	const getVehicleTypeLabel = (type) => {
		const types = {
			container: "Conteneur",
			"container-20ft": "Conteneur 20 pieds",
			"container-40ft": "Conteneur 40 pieds",
			"container-refrigerated": "Conteneur frigorifique",
			truck: "Camion",
			"refrigerated-truck": "Camion frigorifique",
			trailer: "Remorque",
			vessel: "Navire",
			aircraft: "Avion cargo",
		};
		return types[type] || type || "Véhicule";
	};

	const getVehicleIcon = (type) => {
		if (
			type?.includes("container") ||
			type?.includes("vessel") ||
			type === "container"
		) {
			return <FiBox className="h-6 w-6" />;
		}
		return <FiTruck className="h-6 w-6" />;
	};

	return (
		<div className="min-h-screen relative overflow-hidden">
			{/* Background radial glows */}
			<div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
				<div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-100/30 rounded-full blur-[120px]"></div>
				<div className="absolute top-[20%] left-[-10%] w-[40%] h-[40%] bg-blue-100/20 rounded-full blur-[100px]"></div>
				<div className="absolute bottom-[-10%] right-[20%] w-[40%] h-[40%] bg-amber-50/30 rounded-full blur-[120px]"></div>
			</div>

			<div className="relative z-10 p-4 md:p-6 max-w-[1600px] mx-auto space-y-8">
				{/* Header Section */}
				<div className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-fade-in-down">
					<div>
						<div className="flex items-center gap-2 text-emerald-600 font-black text-[9px] uppercase tracking-widest mb-2">
							<div className="w-5 h-[2px] bg-emerald-600"></div>
							<span>Opérations Logistiques</span>
						</div>
						<h1 className="text-3xl font-[1000] text-gray-900 tracking-tighter leading-none mb-2">
							Ma{" "}
							<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 italic">
								Flotte.
							</span>
						</h1>
						<p className="text-xs text-gray-500 font-medium max-w-xl">
							Gérez vos ressources de transport et conteneurs pour une chaîne
							logistique optimisée.
						</p>
					</div>

					<button
						onClick={() => navigate("/exporter/fleet/add")}
						className="group relative inline-flex items-center justify-center px-6 py-3 bg-gray-900 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all duration-300 hover:bg-emerald-600 hover:-translate-y-1 shadow-lg active:scale-95"
					>
						<FiPlus className="w-4 h-4 mr-2" />
						Ajouter un véhicule
					</button>
				</div>

				{/* Search Bar */}
				<div className="flex flex-col md:flex-row gap-4 animate-fade-in-up delay-100 pb-2">
					<div className="relative flex-grow md:max-w-md group">
						<div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
							<FiSearch className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
						</div>
						<input
							type="text"
							placeholder="Rechercher par type, immatriculation..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="block w-full pl-11 pr-4 py-3 bg-white/70 backdrop-blur-xl border border-white/60 rounded-2xl text-sm font-bold text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm group-hover:shadow-md"
						/>
					</div>
				</div>

				{/* Fleet Grid */}
				<div className="animate-fade-in-up delay-200">
					{loading ?
						<div className="bg-white/50 backdrop-blur-xl border border-white/60 rounded-3xl p-12 text-center">
							<LoadingSpinner size="lg" text="Initialisation de la flotte..." />
						</div>
					: filteredFleet.length === 0 ?
						<div className="bg-white/50 backdrop-blur-xl border border-white/60 rounded-3xl p-20 text-center shadow-sm">
							<div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-gray-400">
								<FiTruck className="w-8 h-8" />
							</div>
							<h3 className="text-xl font-black text-gray-900 mb-2 uppercase tracking-tighter">
								Aucun véhicule
							</h3>
							<p className="text-gray-500 text-sm font-medium mb-8">
								{searchTerm ?
									"Aucun élément de votre flotte ne correspond à votre recherche."
								:	"Votre inventaire logistique est actuellement vide."}
							</p>
							{!searchTerm && (
								<button
									onClick={() => navigate("/exporter/fleet/add")}
									className="px-6 py-3 bg-emerald-600 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-emerald-700 transition-all active:scale-95 shadow-md"
								>
									Ajouter votre premier véhicule
								</button>
							)}
						</div>
					:	<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{filteredFleet.map((vehicle, idx) => (
								<div
									key={vehicle._id || idx}
									className="group bg-white/70 backdrop-blur-xl border border-white/60 rounded-3xl shadow-sm overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
								>
									{/* Photo Section */}
									<div className="relative h-44 overflow-hidden">
										{vehicle.image?.url ?
											<CloudinaryImage
												src={vehicle.image.url}
												alt={
													vehicle.image.alt ||
													getVehicleTypeLabel(vehicle.vehicleType)
												}
												className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
												width={400}
												height={200}
											/>
										:	<div className="w-full h-full bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center text-emerald-400/50">
												<FiBox className="w-16 h-16" />
											</div>
										}
										<div className="absolute top-4 right-4">
											<span
												className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm backdrop-blur-md border ${
													vehicle.isAvailable ?
														"bg-emerald-500/90 text-white border-emerald-400/50"
													:	"bg-red-500/90 text-white border-red-400/50"
												}`}
											>
												{vehicle.isAvailable ? "Disponible" : "En service"}
											</span>
										</div>
									</div>

									{/* Info Section */}
									<div className="p-6">
										<div className="flex items-center gap-3 mb-4">
											<div className="p-2.5 bg-gray-900 rounded-xl text-white shadow-lg shadow-gray-200">
												{getVehicleIcon(vehicle.vehicleType)}
											</div>
											<div>
												<h3 className="font-black text-gray-900 text-sm uppercase tracking-tight">
													{getVehicleTypeLabel(vehicle.vehicleType)}
												</h3>
												<p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
													{vehicle.registrationNumber ||
														vehicle.containerNumber ||
														"IDENTIFIANT N/A"}
												</p>
											</div>
										</div>

										<div className="grid grid-cols-2 gap-3 mb-6">
											<div className="bg-gray-50/50 rounded-2xl p-3 border border-gray-100">
												<p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">
													Capacité
												</p>
												<p className="text-xs font-bold text-gray-900">
													{vehicle.capacity?.weight?.value || "0"}{" "}
													{vehicle.capacity?.weight?.unit || "tons"}
												</p>
											</div>
											<div className="bg-gray-50/50 rounded-2xl p-3 border border-gray-100">
												<p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">
													Volume
												</p>
												<p className="text-xs font-bold text-gray-900">
													{vehicle.capacity?.volume?.value || "0"}{" "}
													{vehicle.capacity?.volume?.unit || "m³"}
												</p>
											</div>
										</div>

										{/* Features Tags */}
										{vehicle.specialFeatures &&
											vehicle.specialFeatures.length > 0 && (
												<div className="flex flex-wrap gap-1.5 mb-6">
													{vehicle.specialFeatures.map((feature, fIdx) => (
														<span
															key={fIdx}
															className="px-2 py-1 bg-white border border-gray-100 rounded-lg text-[8px] font-black text-gray-500 uppercase tracking-tighter"
														>
															{feature}
														</span>
													))}
												</div>
											)}

										{/* Footer Actions */}
										<div className="flex items-center justify-between pt-5 border-t border-gray-100">
											<div className="flex items-center gap-2">
												<FiZap
													className={`w-3.5 h-3.5 ${
														vehicle.condition === "excellent" ?
															"text-emerald-500"
														:	"text-amber-500"
													}`}
												/>
												<span className="text-[10px] font-bold text-gray-600 uppercase">
													{vehicle.condition || "Standard"}
												</span>
											</div>
											<div className="flex gap-1.5">
												<button
													onClick={() =>
														navigate(`/exporter/fleet/edit/${vehicle._id}`)
													}
													className="p-2.5 bg-white border border-gray-100 text-gray-400 hover:text-blue-600 hover:border-blue-100 rounded-xl transition-all shadow-sm"
												>
													<FiEdit className="h-4 w-4" />
												</button>
												<button
													onClick={() => handleDeleteVehicle(vehicle._id)}
													className="p-2.5 bg-white border border-gray-100 text-gray-400 hover:text-red-600 hover:border-red-100 rounded-xl transition-all shadow-sm"
												>
													<FiTrash2 className="h-4 w-4" />
												</button>
											</div>
										</div>
									</div>
								</div>
							))}
						</div>
					}
				</div>

				{/* Partners Section */}
				{exporter?.shippingPartners && exporter.shippingPartners.length > 0 && (
					<div className="animate-fade-in-up delay-300 pt-8">
						<div className="flex items-center gap-3 mb-6">
							<FiGlobe className="h-6 w-6 text-emerald-600" />
							<h2 className="text-xl font-black text-gray-900 tracking-tighter uppercase">
								Partenaires Logistiques
							</h2>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{exporter.shippingPartners.map((partner, idx) => (
								<div
									key={idx}
									className="bg-white/50 backdrop-blur-xl border border-white/60 rounded-3xl p-6 shadow-sm flex items-center justify-between hover:shadow-md transition-all"
								>
									<div className="flex items-center gap-4">
										<div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white text-xl font-black">
											{partner.companyName.charAt(0)}
										</div>
										<div>
											<h3 className="font-black text-gray-900 text-sm uppercase">
												{partner.companyName}
											</h3>
											<p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
												{partner.serviceType} •{" "}
												{partner.routes?.join(", ") || "Réseau global"}
											</p>
										</div>
									</div>
									{partner.rating && (
										<div className="flex items-center bg-gray-900 rounded-xl px-2.5 py-1.5 gap-1.5">
											<FiStar className="w-3 h-3 text-amber-400 fill-amber-400" />
											<span className="text-[10px] font-black text-white">
												{partner.rating}
											</span>
										</div>
									)}
								</div>
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default Fleet;
