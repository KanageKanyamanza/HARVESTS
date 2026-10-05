import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../../hooks/useAuth";
import { transporterService } from "../../../services";
import ModularDashboardLayout from "../../../components/layout/ModularDashboardLayout";
import { FiTruck, FiPlus, FiSearch, FiEdit, FiTrash2 } from "react-icons/fi";
import { useNotifications } from "../../../hooks/useNotifications";
import CloudinaryImage from "../../../components/common/CloudinaryImage";
import CardGridSkeleton from "../../../components/common/CardGridSkeleton";

const Fleet = () => {
	const { t } = useTranslation("dashboard-transporter");
	const { user } = useAuth();
	const navigate = useNavigate();
	const { showSuccess, showError } = useNotifications();
	const [fleet, setFleet] = useState([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");

	useEffect(() => {
		const loadFleet = async () => {
			if (user?.userType === "transporter") {
				try {
					setLoading(true);
					const fleetResponse = await transporterService.getFleet();
					const fleetData =
						fleetResponse.data.data?.fleet || fleetResponse.data.fleet || [];
					setFleet(Array.isArray(fleetData) ? fleetData : []);
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
			if (!window.confirm(t("fleet.confirmDelete"))) {
				return;
			}

			try {
				await transporterService.removeFleetVehicle(vehicleId);
				showSuccess(t("fleet.deleted"));
				setFleet((prev) => prev.filter((v) => v._id !== vehicleId));
			} catch (error) {
				console.error("Erreur lors de la suppression:", error);
				showError(t("fleet.deleteError"));
			}
		},
		[showSuccess, showError, t],
	);

	const getVehicleTypeLabel = useCallback(
		(type) =>
			type ?
				t(`vehicle.types.${type}`, { defaultValue: type })
			:	t("vehicle.fallbackName"),
		[t],
	);

	const filteredFleet = useMemo(() => {
		const term = searchTerm.toLowerCase();
		return fleet.filter((vehicle) => {
			if (!vehicle) return false;

			// La recherche porte aussi sur le libellé traduit (« camion », « truck »)
			return (
				term === "" ||
				vehicle.vehicleType?.toLowerCase().includes(term) ||
				getVehicleTypeLabel(vehicle.vehicleType).toLowerCase().includes(term) ||
				vehicle.registrationNumber?.toLowerCase().includes(term)
			);
		});
	}, [fleet, searchTerm, getVehicleTypeLabel]);

	return (
		<div className="dashboard-page bg-gray-50/30">
			{/* Background radial glows */}
			<div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
				<div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-100/30 rounded-full blur-[120px]"></div>
				<div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-blue-100/20 rounded-full blur-[100px]"></div>
				<div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] bg-purple-100/20 rounded-full blur-[120px]"></div>
			</div>

			<div className="dashboard-container space-y-8">
				{/* Header Section */}
				<div className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-fade-in-down">
					<div>
						<div className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-[0.2em] mb-2">
							<div className="w-5 h-[2px] bg-indigo-600"></div>
							<span>{t("fleet.eyebrow")}</span>
						</div>
						<h1 className="text-3xl font-black text-gray-900 tracking-tighter leading-none mb-2">
							{t("fleet.titleStart")}{" "}
							<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500 italic">
								{t("fleet.titleHighlight")}
							</span>
						</h1>
						<p className="text-xs text-gray-500 font-medium max-w-xl">
							{t("fleet.subtitle")}
						</p>
					</div>

					<button
						onClick={() => navigate("/transporter/fleet/add")}
						className="group relative inline-flex items-center justify-center px-6 py-3 font-black text-[10px] uppercase tracking-widest text-white transition-all duration-300 ease-out bg-gray-900 rounded-xl hover:bg-indigo-600 hover:ring-4 hover:ring-indigo-500/10"
					>
						<FiPlus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform duration-500" />
						{t("fleet.addVehicle")}
					</button>
				</div>

				{/* Search Bar */}
				<div className="animate-fade-in-up delay-100">
					<div className="relative group max-w-2xl">
						<div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-2xl blur opacity-10 group-focus-within:opacity-20 transition duration-1000"></div>
						<div className="relative flex items-center bg-white border border-gray-100 rounded-2xl p-1 shadow-sm">
							<div className="pl-4 text-indigo-500">
								<FiSearch className="w-4 h-4" />
							</div>
							<input
								type="text"
								placeholder={t("fleet.searchPlaceholder")}
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="w-full px-4 py-3 bg-transparent text-sm font-bold text-gray-900 placeholder:text-gray-400 focus:outline-none border-none ring-0 focus:ring-0"
							/>
						</div>
					</div>
				</div>

				{/* Fleet Grid */}
				<div className="animate-fade-in-up delay-200">
					{loading ?
						<CardGridSkeleton
							count={6}
							className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
						/>
					: filteredFleet.length === 0 ?
						<div className="bg-white/50 backdrop-blur-xl rounded-[2.5rem] p-20 flex flex-col items-center justify-center border border-white/60 text-center">
							<div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
								<FiTruck className="w-10 h-10 text-indigo-300" />
							</div>
							<h3 className="text-xl font-black text-gray-900 tracking-tight mb-2">
								{searchTerm ? t("fleet.noResultTitle") : t("fleet.emptyTitle")}
							</h3>
							<p className="text-xs text-gray-500 font-medium max-w-xs mb-8">
								{searchTerm ?
									t("fleet.noResultText")
								:	t("fleet.emptyText")}
							</p>
							{!searchTerm && (
								<button
									onClick={() => navigate("/transporter/fleet/add")}
									className="px-8 py-4 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
								>
									{t("fleet.registerVehicle")}
								</button>
							)}
						</div>
					:	<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{filteredFleet.map((vehicle, idx) => (
								<div
									key={vehicle._id || idx}
									className="group bg-white/70 backdrop-blur-xl border border-white/60 rounded-[2rem] overflow-hidden shadow-xl shadow-indigo-900/5 hover:shadow-2xl hover:shadow-indigo-900/10 transition-all duration-500 hover:-translate-y-1"
								>
									{/* Image Container */}
									<div className="relative h-52 overflow-hidden bg-gray-100">
										{vehicle.image?.url ?
											<CloudinaryImage
												src={vehicle.image.url}
												alt={vehicle.registrationNumber}
												className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
												width={600}
												height={400}
											/>
										:	<div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-50">
												<FiTruck className="w-12 h-12 text-indigo-200" />
												<span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mt-2">
													{t("fleet.noImage")}
												</span>
											</div>
										}

										{/* Status Badge */}
										<div className="absolute top-4 right-4">
											<div
												className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest backdrop-blur-md shadow-lg border ${
													vehicle.isAvailable ?
														"bg-emerald-500/90 text-white border-emerald-400"
													:	"bg-red-500/90 text-white border-red-400"
												}`}
											>
												{vehicle.isAvailable ? t("fleet.available") : t("fleet.unavailable")}
											</div>
										</div>
									</div>

									{/* Content */}
									<div className="p-6">
										<div className="flex justify-between items-start mb-4">
											<div>
												<h3 className="text-lg font-black text-gray-900 tracking-tight leading-none mb-1">
													{getVehicleTypeLabel(vehicle.vehicleType)}
												</h3>
												<p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">
													{t("fleet.registration", {
														value: vehicle.registrationNumber || t("fleet.notAvailable"),
													})}
												</p>
											</div>
											<div className="flex gap-2">
												<button
													onClick={() =>
														navigate(`/transporter/fleet/edit/${vehicle._id}`)
													}
													title={t("fleet.edit")}
													aria-label={t("fleet.edit")}
													className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all transform hover:rotate-12"
												>
													<FiEdit className="w-4 h-4" />
												</button>
												<button
													onClick={() => handleDeleteVehicle(vehicle._id)}
													title={t("fleet.delete")}
													aria-label={t("fleet.delete")}
													className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all transform hover:-rotate-12"
												>
													<FiTrash2 className="w-4 h-4" />
												</button>
											</div>
										</div>

										{/* Features Grid */}
										<div className="grid grid-cols-2 gap-3 mb-6">
											<div className="bg-gray-50/50 rounded-xl p-3 border border-gray-100">
												<p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1">
													{t("fleet.weightCapacity")}
												</p>
												<p className="text-xs font-bold text-gray-700">
													{vehicle.capacity?.weight?.value || 0}{" "}
													<span className="text-[10px] opacity-60">
														{t(`vehicle.units.${vehicle.capacity?.weight?.unit || "kg"}`, {
															defaultValue: vehicle.capacity?.weight?.unit,
														})}
													</span>
												</p>
											</div>
											<div className="bg-gray-50/50 rounded-xl p-3 border border-gray-100">
												<p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1">
													{t("fleet.volume")}
												</p>
												<p className="text-xs font-bold text-gray-700">
													{vehicle.capacity?.volume?.value || 0}{" "}
													<span className="text-[10px] opacity-60">
														{t(`vehicle.units.${vehicle.capacity?.volume?.unit || "m³"}`, {
															defaultValue: vehicle.capacity?.volume?.unit,
														})}
													</span>
												</p>
											</div>
										</div>

										{/* Tags */}
										<div className="flex flex-wrap gap-2">
											{vehicle.specialFeatures?.map((feature, fIdx) => (
												<span
													key={fIdx}
													className="px-2 py-1 bg-indigo-50/50 text-indigo-600 rounded-md text-[8px] font-black uppercase tracking-widest border border-indigo-100"
												>
													{t(`vehicle.features.${feature}`, { defaultValue: feature })}
												</span>
											))}
											{!vehicle.specialFeatures?.length && (
												<span className="text-[8px] font-bold text-gray-400 italic">
													{t("fleet.standard")}
												</span>
											)}
										</div>
									</div>

									{/* Progress Footer */}
									<div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex justify-between items-center text-[10px] font-bold text-gray-500">
										<span>
											{t("fleet.condition", {
												value: t(`vehicle.conditions.${vehicle.condition || "good"}`, {
													defaultValue: vehicle.condition,
												}),
											})}
										</span>
										<div className="flex gap-1">
											<div className="w-2 h-2 rounded-full bg-indigo-500"></div>
											<div className="w-2 h-2 rounded-full bg-indigo-300"></div>
											<div className="w-2 h-2 rounded-full bg-indigo-100"></div>
										</div>
									</div>
								</div>
							))}
						</div>
					}
				</div>
			</div>
		</div>
	);
};

export default Fleet;
