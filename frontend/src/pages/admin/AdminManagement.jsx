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
		<div className="min-h-screen pb-20">
			<div className="max-w-[1600px] mx-auto px-6 lg:px-10 py-10">
				{/* Messages de succès/erreur */}
				{success && (
					<div className="mb-6 animate-fade-in">
						<div className="bg-green-50/80 backdrop-blur-md border border-green-100 text-green-700 px-6 py-4 rounded-[2rem] shadow-sm flex items-center">
							<div className="w-2 h-2 bg-green-500 rounded-full mr-3 animate-pulse"></div>
							<span className="text-sm font-black uppercase tracking-widest">
								{success}
							</span>
						</div>
					</div>
				)}
				{error && (
					<div className="mb-6 animate-fade-in">
						<div className="bg-red-50/80 backdrop-blur-md border border-red-100 text-red-700 px-6 py-4 rounded-[2rem] shadow-sm flex items-center">
							<div className="w-2 h-2 bg-red-500 rounded-full mr-3 animate-pulse"></div>
							<span className="text-sm font-black uppercase tracking-widest">
								{error}
							</span>
						</div>
					</div>
				)}

				{/* En-tête Premium */}
				<div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
					<div>
						<div className="flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-[0.2em] mb-3">
							<div className="w-8 h-[2px] bg-emerald-600"></div>
							<span>Operational Security</span>
						</div>
						<h1 className="text-4xl lg:text-5xl font-[1000] text-gray-900 tracking-tight leading-none mb-4">
							Gestion <span className="text-green-600">Admin</span>
						</h1>
						<p className="text-sm font-bold text-gray-400 uppercase tracking-[0.2em]">
							Contrôle des accès et privilèges plateforme
						</p>
					</div>

					<button
						onClick={() => {
							resetForm();
							setShowCreateModal(true);
						}}
						className="group relative flex items-center px-8 py-4 bg-gray-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-green-600 transition-all duration-500 shadow-xl hover:shadow-green-200/50 hover:-translate-y-1 overflow-hidden"
					>
						<div className="absolute inset-0 bg-gradient-to-r from-green-600/0 via-white/10 to-green-600/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
						<Plus className="h-5 w-5 mr-3 transition-transform group-hover:rotate-90 duration-500" />
						Nouveau Profil
					</button>
				</div>

				{/* Section Principale en Glassmorphism */}
				<div className="space-y-10">
					{/* Filtres Intégrés */}
					<div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-white/60 p-6 transition-all duration-500">
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
					<div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-white/60 overflow-hidden transition-all duration-500">
						<div className="p-8 border-b border-gray-100/50 flex items-center justify-between">
							<div>
								<h3 className="text-2xl font-[1000] text-gray-900 tracking-tight">
									Staff Autorisé
								</h3>
								<p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
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

						<div className="p-8 bg-gray-50/30 border-t border-gray-100/50">
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
