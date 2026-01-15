import React, { useState, useEffect, useCallback } from "react";
import { adminService } from "../../services/adminService";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { Plus } from "lucide-react";
import AdminFilters from "./adminManagement/AdminFilters";
import AdminTable from "./adminManagement/AdminTable";
import AdminPagination from "./adminManagement/AdminPagination";
import AdminCreateModal from "./adminManagement/AdminCreateModal";
import AdminViewModal from "./adminManagement/AdminViewModal";
import AdminEditModal from "./adminManagement/AdminEditModal";
import {
	getRoleColor,
	getRoleLabel,
	getDepartmentLabel,
	formatDate,
} from "./adminManagement/utils";

const AdminManagement = () => {
	const [admins, setAdmins] = useState([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [roleFilter, setRoleFilter] = useState("");
	const [statusFilter, setStatusFilter] = useState("");
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [showViewModal, setShowViewModal] = useState(false);
	const [showEditModal, setShowEditModal] = useState(false);
	const [selectedAdmin, setSelectedAdmin] = useState(null);
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [totalItems, setTotalItems] = useState(0);
	const [itemsPerPage] = useState(10);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");

	// Formulaire de création/édition
	const [formData, setFormData] = useState({
		firstName: "",
		lastName: "",
		email: "",
		password: "",
		phone: "",
		avatar: "",
		role: "moderator",
		department: "support",
		isActive: true,
	});

	// Fonction loadAdmins mémorisée
	const loadAdmins = useCallback(async () => {
		try {
			setLoading(true);
			setError("");
			const response = await adminService.getAdmins({
				page: currentPage,
				limit: itemsPerPage,
				search: searchTerm,
				role: roleFilter,
				status:
					statusFilter === "active"
						? "true"
						: statusFilter === "inactive"
						? "false"
						: undefined,
			});

			if (response.status === "success" || response.data) {
				const data = response.data || response;
				setAdmins(data.admins || []);
				const total = data.total || data.admins?.length || 0;
				setTotalItems(total);
				setTotalPages(Math.ceil(total / itemsPerPage));
			} else {
				setAdmins([]);
				setTotalPages(1);
				setTotalItems(0);
			}
		} catch (error) {
			console.error("Erreur lors du chargement des administrateurs:", error);
			setError("Erreur lors du chargement des administrateurs");
			setAdmins([]);
			setTotalPages(1);
			setTotalItems(0);
		} finally {
			setLoading(false);
		}
	}, [currentPage, searchTerm, roleFilter, statusFilter, itemsPerPage]);

	useEffect(() => {
		loadAdmins();
	}, [loadAdmins]);

	// Réinitialiser les filtres quand ils changent
	useEffect(() => {
		setCurrentPage(1);
	}, [searchTerm, roleFilter, statusFilter]);

	// Gestion de la création
	const handleCreate = async (e) => {
		e.preventDefault();
		setSaving(true);
		setError("");
		setSuccess("");

		try {
			await adminService.createAdmin(formData);
			setSuccess("Administrateur créé avec succès");
			setShowCreateModal(false);
			resetForm();
			loadAdmins();
			setTimeout(() => setSuccess(""), 3000);
		} catch (error) {
			setError(
				error.response?.data?.message ||
					"Erreur lors de la création de l'administrateur"
			);
		} finally {
			setSaving(false);
		}
	};

	// Gestion de l'édition
	const handleEdit = async (e) => {
		e.preventDefault();
		if (!selectedAdmin) return;

		setSaving(true);
		setError("");
		setSuccess("");

		try {
			const updateData = { ...formData };
			// Ne pas envoyer le mot de passe s'il est vide
			if (!updateData.password) {
				delete updateData.password;
			}
			await adminService.updateAdmin(selectedAdmin._id, updateData);
			setSuccess("Administrateur mis à jour avec succès");
			setShowEditModal(false);
			setSelectedAdmin(null);
			resetForm();
			loadAdmins();
			setTimeout(() => setSuccess(""), 3000);
		} catch (error) {
			setError(
				error.response?.data?.message ||
					"Erreur lors de la mise à jour de l'administrateur"
			);
		} finally {
			setSaving(false);
		}
	};

	// Gestion de la suppression
	const handleDelete = async (admin) => {
		if (
			!window.confirm(
				`Êtes-vous sûr de vouloir supprimer l'administrateur ${admin.firstName} ${admin.lastName} ?`
			)
		) {
			return;
		}

		try {
			setError("");
			await adminService.deleteAdmin(admin._id);
			setSuccess("Administrateur supprimé avec succès");
			loadAdmins();
			setTimeout(() => setSuccess(""), 3000);
		} catch (error) {
			setError(
				error.response?.data?.message ||
					"Erreur lors de la suppression de l'administrateur"
			);
		}
	};

	// Gestion du toggle status
	const handleToggleStatus = async (admin) => {
		try {
			setError("");
			await adminService.toggleAdminStatus(admin._id);
			setSuccess(
				`Administrateur ${admin.isActive ? "désactivé" : "activé"} avec succès`
			);
			loadAdmins();
			setTimeout(() => setSuccess(""), 3000);
		} catch (error) {
			setError(
				error.response?.data?.message || "Erreur lors du changement de statut"
			);
		}
	};

	// Ouvrir modal de visualisation
	const handleView = async (admin) => {
		try {
			const response = await adminService.getAdminById(admin._id);
			setSelectedAdmin(response.data?.admin || response.admin || admin);
			setShowViewModal(true);
		} catch (error) {
			setError("Erreur lors du chargement des détails");
			setSelectedAdmin(admin);
			setShowViewModal(true);
		}
	};

	// Ouvrir modal d'édition
	const handleEditClick = (admin) => {
		setSelectedAdmin(admin);
		setFormData({
			firstName: admin.firstName || "",
			lastName: admin.lastName || "",
			email: admin.email || "",
			password: "",
			phone: admin.phone || "",
			role: admin.role || "moderator",
			department: admin.department || "support",
			avatar: admin.avatar || "",
			isActive: admin.isActive !== undefined ? admin.isActive : true,
		});
		setShowEditModal(true);
	};

	// Réinitialiser le formulaire
	const resetForm = () => {
		setFormData({
			firstName: "",
			lastName: "",
			email: "",
			password: "",
			phone: "",
			role: "moderator",
			department: "support",
			avatar: "",
			isActive: true,
		});
		setSelectedAdmin(null);
	};

	if (loading && admins.length === 0) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<LoadingSpinner size="lg" text="Chargement des admins..." />
			</div>
		);
	}

	return (
		<div className="min-h-screen md:pl-3 pb-20 relative overflow-hidden">
			{/* Background radial glows */}
			<div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden ">
				<div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-100/30 rounded-full blur-[120px]"></div>
				<div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100/20 rounded-full blur-[100px]"></div>
			</div>

			<div className="max-w-full mx-auto px-3 py-4 relative z-10 pl-1 space-y-3 md:pl-6 md:px-4 md:py-6 md:space-y-4">
				{/* Messages de succès/erreur */}
				{success && (
					<div className="mb-4 animate-fade-in">
						<div className="bg-green-50/80 backdrop-blur-md border border-green-100 text-green-700 px-4 py-3 rounded-xl shadow-sm flex items-center">
							<div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 animate-pulse"></div>
							<span className="text-[10px] font-black uppercase tracking-widest">
								{success}
							</span>
						</div>
					</div>
				)}
				{error && (
					<div className="mb-4 animate-fade-in">
						<div className="bg-red-50/80 backdrop-blur-md border border-red-100 text-red-700 px-4 py-3 rounded-xl shadow-sm flex items-center">
							<div className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2 animate-pulse"></div>
							<span className="text-[10px] font-black uppercase tracking-widest">
								{error}
							</span>
						</div>
					</div>
				)}

				{/* En-tête Premium */}
				<div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
					<div>
						<div className="flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-[0.2em] mb-1.5">
							<div className="w-6 h-[2px] bg-emerald-600"></div>
							<span>Operational Security</span>
						</div>
						<h1 className="text-2xl md:text-3xl font-[1000] text-gray-900 tracking-tighter leading-none mb-1.5">
							Gestion <span className="text-green-600">Admin</span>
						</h1>
						<p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
							Contrôle des accès et privilèges plateforme
						</p>
					</div>

					<button
						onClick={() => {
							resetForm();
							setShowCreateModal(true);
						}}
						className="group relative flex items-center px-6 py-3 bg-gray-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-green-600 transition-all duration-500 shadow-lg hover:-translate-y-0.5 overflow-hidden"
					>
						<Plus className="h-4 w-4 mr-2 transition-transform group-hover:rotate-90 duration-500" />
						Nouveau Profil
					</button>
				</div>

				{/* Section Principale en Glassmorphism */}
				<div className="space-y-4">
					{/* Filtres Intégrés */}
					<div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-sm border border-white/60 p-4">
						<AdminFilters
							searchTerm={searchTerm}
							setSearchTerm={setSearchTerm}
							roleFilter={roleFilter}
							setRoleFilter={setRoleFilter}
							statusFilter={statusFilter}
							setStatusFilter={setStatusFilter}
						/>
					</div>

					{/* Liste des Administrateurs */}
					<div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-sm border border-white/60 overflow-hidden">
						<div className="p-4 border-b border-gray-100/50 flex items-center justify-between">
							<div>
								<h3 className="text-sm font-[1000] text-gray-900 tracking-tight">
									Staff Autorisé
								</h3>
								<p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-0.5">
									{totalItems} administrateurs trouvés
								</p>
							</div>
						</div>

						<AdminTable
							admins={admins}
							getRoleColor={getRoleColor}
							getRoleLabel={getRoleLabel}
							getDepartmentLabel={getDepartmentLabel}
							formatDate={formatDate}
							handleView={handleView}
							handleEditClick={handleEditClick}
							handleDelete={handleDelete}
							handleToggleStatus={handleToggleStatus}
						/>

						<div className="px-4 py-3 bg-gray-50/30 border-t border-gray-100/50">
							<AdminPagination
								currentPage={currentPage}
								totalPages={totalPages}
								totalItems={totalItems}
								itemsPerPage={itemsPerPage}
								setCurrentPage={setCurrentPage}
							/>
						</div>
					</div>
				</div>

				{/* Modaux Stylisés */}
				<AdminCreateModal
					show={showCreateModal}
					onClose={() => setShowCreateModal(false)}
					formData={formData}
					setFormData={setFormData}
					onSubmit={handleCreate}
					saving={saving}
					resetForm={resetForm}
				/>

				<AdminViewModal
					show={showViewModal}
					onClose={() => {
						setShowViewModal(false);
						setSelectedAdmin(null);
					}}
					admin={selectedAdmin}
					getRoleColor={getRoleColor}
					getRoleLabel={getRoleLabel}
					getDepartmentLabel={getDepartmentLabel}
					formatDate={formatDate}
				/>

				<AdminEditModal
					show={showEditModal}
					onClose={() => setShowEditModal(false)}
					admin={selectedAdmin}
					formData={formData}
					setFormData={setFormData}
					onSubmit={handleEdit}
					saving={saving}
					resetForm={resetForm}
				/>
			</div>
		</div>
	);
};

export default AdminManagement;
