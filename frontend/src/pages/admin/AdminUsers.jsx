import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
	Search,
	Filter,
	MoreVertical,
	Eye,
	Edit,
	Trash2,
	Shield,
	ShieldOff,
	CheckCircle,
	XCircle,
	User,
	Mail,
	Phone,
	MapPin,
	Calendar,
	Ban,
	UserCheck,
} from "lucide-react";
import { adminService } from "../../services/adminService";
import CloudinaryImage from "../../components/common/CloudinaryImage";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const AdminUsers = () => {
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [roleFilter, setRoleFilter] = useState("");
	const [statusFilter, setStatusFilter] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [selectedUsers, setSelectedUsers] = useState([]);

	const loadUsers = useCallback(async () => {
		try {
			setLoading(true);
			const params = {
				page: currentPage,
				limit: 10,
				search: searchTerm,
				role: roleFilter,
				status: statusFilter,
			};
			const response = await adminService.getUsers(params);

			if (response.data && response.data.users) {
				setUsers(response.data.users || []);
				setTotalPages(response.data.pagination?.totalPages || 1);
			} else if (
				response.data &&
				response.data.data &&
				response.data.data.users
			) {
				setUsers(response.data.data.users || []);
				setTotalPages(response.data.data.pagination?.totalPages || 1);
			} else {
				setUsers([]);
				setTotalPages(1);
			}
		} catch (error) {
			console.error("Erreur lors du chargement des utilisateurs:", error);
			setUsers([]);
			setTotalPages(1);
		} finally {
			setLoading(false);
		}
	}, [currentPage, roleFilter, statusFilter, searchTerm]);

	useEffect(() => {
		loadUsers();
	}, [loadUsers]);

	const handleSearch = (e) => {
		setSearchTerm(e.target.value);
		setCurrentPage(1);
	};

	const handleRoleFilter = (e) => {
		setRoleFilter(e.target.value);
		setCurrentPage(1);
	};

	const handleStatusFilter = (e) => {
		setStatusFilter(e.target.value);
		setCurrentPage(1);
	};

	const handleSelectUser = (userId) => {
		setSelectedUsers((prev) =>
			prev.includes(userId)
				? prev.filter((id) => id !== userId)
				: [...prev, userId]
		);
	};

	const handleSelectAll = () => {
		setSelectedUsers(
			selectedUsers.length === users.length ? [] : users.map((user) => user._id)
		);
	};

	const handleBanUser = async (userId) => {
		if (window.confirm("Êtes-vous sûr de vouloir bannir cet utilisateur ?")) {
			try {
				await adminService.banUser(userId, "Violation des règles");
				loadUsers();
			} catch (error) {
				console.error("Erreur lors du bannissement:", error);
			}
		}
	};

	const handleVerifyUser = async (userId) => {
		try {
			await adminService.verifyUser(userId);
			loadUsers();
		} catch (error) {
			console.error("Erreur lors de la vérification:", error);
		}
	};

	const handleDeleteUser = async (userId) => {
		const user = users.find((u) => u._id === userId);
		const userName = user
			? `${user.firstName} ${user.lastName}`
			: "cet utilisateur";

		if (
			window.confirm(
				`⚠️ ATTENTION : Êtes-vous sûr de vouloir supprimer définitivement ${userName} ?\n\nCette action supprimera également tous les produits associés à cet utilisateur. Cette action est irréversible.`
			)
		) {
			try {
				await adminService.deleteUser(userId);
				loadUsers();
			} catch (error) {
				console.error("Erreur lors de la suppression:", error);
			}
		}
	};

	const handleDeleteSelected = async () => {
		if (selectedUsers.length === 0) return;

		if (
			window.confirm(
				`⚠️ ATTENTION : Êtes-vous sûr de vouloir supprimer définitivement ${selectedUsers.length} utilisateur(s) ?\n\nCette action supprimera également tous les produits associés à ces utilisateurs. Cette action est irréversible.`
			)
		) {
			try {
				const deletePromises = selectedUsers.map((userId) =>
					adminService.deleteUser(userId)
				);
				await Promise.all(deletePromises);
				setSelectedUsers([]);
				loadUsers();
			} catch (error) {
				console.error("Erreur lors de la suppression:", error);
			}
		}
	};

	const formatDate = (date) => {
		return new Date(date).toLocaleDateString("fr-FR", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	const getRoleColor = (role) => {
		const colors = {
			admin: "text-rose-600 bg-rose-50 border-rose-100",
			producer: "text-emerald-600 bg-emerald-50 border-emerald-100",
			consumer: "text-sky-600 bg-sky-50 border-sky-100",
			transformer: "text-purple-600 bg-purple-50 border-purple-100",
			restaurateur: "text-amber-600 bg-amber-50 border-amber-100",
			exporter: "text-indigo-600 bg-indigo-50 border-indigo-100",
			transporter: "text-slate-600 bg-slate-50 border-slate-100",
		};
		return colors[role] || "text-gray-600 bg-gray-50 border-gray-100";
	};

	const getRoleLabel = (userType) => {
		const labels = {
			producer: "Producteur",
			consumer: "Consommateur",
			transformer: "Transformateur",
			restaurateur: "Restaurateur",
			exporter: "Exportateur",
			transporter: "Transporteur",
			admin: "Admin",
		};
		return labels[userType] || userType;
	};

	const getStatusColor = (status) => {
		const colors = {
			Actif: "text-emerald-600 bg-emerald-50 border-emerald-100",
			Vérifié: "text-sky-600 bg-sky-50 border-sky-100",
			"En attente": "text-amber-600 bg-amber-50 border-amber-100",
			Banni: "text-rose-600 bg-rose-50 border-rose-100",
		};
		return colors[status] || "text-gray-600 bg-gray-50 border-gray-100";
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<LoadingSpinner size="lg" text="Chargement des utilisateurs..." />
			</div>
		);
	}

	return (
		<div className="min-h-screen md:pl-3 pb-20 relative overflow-hidden">
			{/* Background radial glows */}
			<div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden ">
				<div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-green-100/30 rounded-full blur-[120px]"></div>
				<div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-blue-100/20 rounded-full blur-[100px]"></div>
				<div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] bg-purple-100/20 rounded-full blur-[120px]"></div>
			</div>

			<div className="max-w-full mx-auto px-3 py-4 space-y-4 relative z-10 pl-1 md:pl-6 md:px-4 md:py-6 md:space-y-5">
				{/* Header */}
				<div className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-2">
					<div className="animate-fade-in-down">
						<div className="flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-[0.2em] mb-1.5">
							<div className="w-5 h-[2px] bg-emerald-600"></div>
							<span className="text-[9px]">User Ecosystem</span>
						</div>
						<h1 className="text-2xl font-[1000] text-gray-900 tracking-tighter leading-[1] mb-1.5">
							Gestion des <span className="text-green-600">Utilisateurs</span>
						</h1>
						<p className="text-xs text-gray-500 font-medium max-w-xl">
							Gérez les comptes, les rôles et les accès de l'ensemble de la
							communauté Harvests.
						</p>
					</div>
					<div className="flex items-center gap-4 animate-fade-in-up">
						{/* Boutons simplifiés/premium style optionnels */}
					</div>
				</div>

				{/* Filtres */}
				<div className="bg-white/70 backdrop-blur-xl rounded-[1.5rem] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-white/60 animate-fade-in-up delay-100">
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3">
						<div className="relative group">
							<Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-green-500 transition-colors" />
							<input
								type="text"
								placeholder="Rechercher..."
								value={searchTerm}
								onChange={handleSearch}
								className="w-full pl-10 pr-4 py-2 bg-gray-200/50 border border-transparent focus:border-green-100 focus:bg-white focus:ring-4 focus:ring-green-500/5 rounded-xl transition-all duration-300 font-bold text-gray-900 placeholder:text-gray-400 text-sm"
							/>
						</div>

						<div className="relative">
							<select
								value={roleFilter}
								onChange={handleRoleFilter}
								className="w-full px-4 py-2 bg-gray-200/50 border border-transparent focus:border-green-100 focus:bg-white focus:ring-4 focus:ring-green-500/5 rounded-xl transition-all duration-300 font-bold text-gray-900 appearance-none cursor-pointer text-sm"
							>
								<option value="">Tous les rôles</option>
								<option value="producer">Producteur</option>
								<option value="consumer">Consommateur</option>
								<option value="transformer">Transformateur</option>
								<option value="restaurateur">Restaurateur</option>
								<option value="exporter">Exportateur</option>
								<option value="transporter">Transporteur</option>
								<option value="admin">Admin</option>
							</select>
						</div>

						<div className="relative">
							<select
								value={statusFilter}
								onChange={handleStatusFilter}
								className="w-full px-4 py-2 bg-gray-200/50 border border-transparent focus:border-green-100 focus:bg-white focus:ring-4 focus:ring-green-500/5 rounded-xl transition-all duration-300 font-bold text-gray-900 appearance-none cursor-pointer text-sm"
							>
								<option value="">Tous les statuts</option>
								<option value="Actif">Actif</option>
								<option value="Vérifié">Vérifié</option>
								<option value="En attente">En attente</option>
								<option value="Banni">Banni</option>
							</select>
						</div>

						<button className="flex items-center justify-center px-4 py-2 bg-gray-200/50 hover:bg-white border border-transparent hover:border-gray-100 rounded-xl transition-all duration-300 text-gray-600 font-black text-[10px] uppercase tracking-widest gap-2">
							<Filter className="h-4 w-4" />
							Plus
						</button>
					</div>
				</div>

				{/* Table */}
				<div className="bg-white/70 backdrop-blur-xl rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-white/60 overflow-hidden animate-fade-in-up delay-200">
					<div className="p-4 border-b border-gray-200/50 flex items-center justify-between bg-white/30">
						<div>
							<h3 className="text-base font-[1000] text-gray-900 tracking-tight">
								Liste des Membres
							</h3>
							<p className="text-[9px] font-black text-gray-400 mt-0.5 uppercase tracking-[0.2em]">
								Total: {users.length} utilisateurs
							</p>
						</div>
						{selectedUsers.length > 0 && (
							<div className="flex gap-2 animate-fade-in">
								<button
									onClick={() =>
										selectedUsers.forEach((id) => handleVerifyUser(id))
									}
									className="px-4 py-2 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all duration-300"
								>
									Vérifier ({selectedUsers.length})
								</button>
								<button
									onClick={handleDeleteSelected}
									className="px-4 py-2 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all duration-300"
								>
									Supprimer ({selectedUsers.length})
								</button>
							</div>
						)}
					</div>

					<div className="overflow-x-auto">
						<table className="w-full">
							<thead>
								<tr className="border-b border-gray-200/50">
									<th className="px-5 py-3 text-left">
										<input
											type="checkbox"
											checked={
												selectedUsers.length === users.length &&
												users.length > 0
											}
											onChange={handleSelectAll}
											className="w-3.5 h-3.5 border-2 border-gray-200 rounded-md bg-white checked:bg-green-600 checked:border-green-600 transition-all cursor-pointer appearance-none"
										/>
									</th>
									<th className="px-4 py-3 text-left text-[9px] font-black text-gray-400 uppercase tracking-widest">
										Utilisateur
									</th>
									<th className="px-4 py-3 text-left text-[9px] font-black text-gray-400 uppercase tracking-widest">
										Rôle
									</th>
									<th className="px-4 py-3 text-left text-[9px] font-black text-gray-400 uppercase tracking-widest">
										Statut
									</th>
									<th className="px-4 py-3 text-left text-[9px] font-black text-gray-400 uppercase tracking-widest">
										Membre
									</th>
									<th className="px-5 py-3 text-right text-[9px] font-black text-gray-400 uppercase tracking-widest">
										Actions
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-200/50">
								{users.length === 0 ? (
									<tr>
										<td colSpan="6" className="px-5 py-10 text-center">
											<div className="flex flex-col items-center">
												<div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-2">
													<User className="h-6 w-6 text-gray-300" />
												</div>
												<p className="text-sm font-[1000] text-gray-900 tracking-tight">
													Aucun utilisateur
												</p>
											</div>
										</td>
									</tr>
								) : (
									users.map((user) => (
										<tr
											key={user._id}
											className="group hover:bg-gray-50/50 transition-colors duration-300"
										>
											<td className="px-5 py-2.5">
												<input
													type="checkbox"
													checked={selectedUsers.includes(user._id)}
													onChange={() => handleSelectUser(user._id)}
													className="w-3.5 h-3.5 border-2 border-gray-200 rounded-md bg-white checked:bg-green-600 checked:border-green-600 transition-all cursor-pointer appearance-none"
												/>
											</td>
											<td className="px-4 py-2.5">
												<div className="flex items-center gap-2.5">
													<div className="h-8 w-8 rounded-lg overflow-hidden border border-gray-100 shadow-sm flex-shrink-0">
														{user.avatar ? (
															<CloudinaryImage
																src={user.avatar}
																alt={`${user.firstName} ${user.lastName}`}
																className="h-full w-full object-cover"
															/>
														) : (
															<div className="h-full w-full bg-gray-200 flex items-center justify-center">
																<span className="text-[10px] font-black text-gray-500">
																	{user.firstName?.charAt(0)}
																	{user.lastName?.charAt(0)}
																</span>
															</div>
														)}
													</div>
													<div>
														<p className="text-xs font-black text-gray-900 tracking-tight leading-tight mb-0.5 group-hover:text-green-600 transition-colors">
															{user.firstName} {user.lastName}
														</p>
														<p className="text-[8px] font-bold text-gray-400">
															{user.email}
														</p>
													</div>
												</div>
											</td>
											<td className="px-4 py-2.5">
												<span
													className={`inline-flex px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border ${getRoleColor(
														user.userType
													)}`}
												>
													{getRoleLabel(user.userType)}
												</span>
											</td>
											<td className="px-4 py-2.5">
												<span
													className={`inline-flex px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border ${getStatusColor(
														user.status
													)}`}
												>
													{user.status}
												</span>
											</td>
											<td className="px-4 py-2.5">
												<div className="flex items-center gap-1.5 text-[8px] font-black text-gray-400 uppercase tracking-widest">
													<Calendar className="h-2.5 w-2.5" />
													{formatDate(user.createdAt)}
												</div>
											</td>
											<td className="px-5 py-2.5 text-right">
												<div className="flex items-center justify-end gap-1">
													<Link
														to={`/admin/users/${user._id}`}
														className="p-1.5 bg-gray-50 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300 border border-transparent hover:border-blue-100"
														title="Voir détails"
													>
														<Eye className="h-3 w-3" />
													</Link>
													{user.status !== "Vérifié" && (
														<button
															onClick={() => handleVerifyUser(user._id)}
															className="p-1.5 bg-gray-50 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-300 border border-transparent hover:border-green-100"
															title="Vérifier"
														>
															<UserCheck className="h-3 w-3" />
														</button>
													)}
													{user.status !== "Banni" && (
														<button
															onClick={() => handleBanUser(user._id)}
															className="p-1.5 bg-gray-50 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all duration-300 border border-transparent hover:border-rose-100"
															title="Bannir"
														>
															<Ban className="h-3 w-3" />
														</button>
													)}
													<button
														onClick={() => handleDeleteUser(user._id)}
														className="p-1.5 bg-gray-50 text-gray-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-300 border border-transparent hover:border-red-100"
														title="Supprimer"
													>
														<Trash2 className="h-3 w-3" />
													</button>
												</div>
											</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>

					{/* Pagination */}
					<div className="p-3.5 border-t border-gray-200/50 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/30">
						<p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">
							Page {currentPage} sur {totalPages}
						</p>
						<div className="flex items-center gap-2">
							<button
								onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
								disabled={currentPage === 1}
								className="px-3 py-1.5 bg-white text-gray-500 rounded-lg text-[8px] font-black uppercase tracking-widest border border-gray-100 hover:bg-gray-900 hover:text-white transition-all duration-300 disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-gray-500"
							>
								Précédent
							</button>
							<button
								onClick={() =>
									setCurrentPage((prev) => Math.min(prev + 1, totalPages))
								}
								disabled={currentPage === totalPages}
								className="px-3 py-1.5 bg-white text-gray-500 rounded-lg text-[8px] font-black uppercase tracking-widest border border-gray-100 hover:bg-gray-900 hover:text-white transition-all duration-300 disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-gray-500"
							>
								Suivant
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AdminUsers;
