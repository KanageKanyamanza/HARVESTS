import React from "react";
import { Search } from "lucide-react";

const AdminFilters = ({
	searchTerm,
	setSearchTerm,
	roleFilter,
	setRoleFilter,
	statusFilter,
	setStatusFilter,
}) => {
	return (
		<div className="flex flex-col lg:flex-row items-end gap-8">
			<div className="flex-1 w-full">
				<label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">
					Recherche Rapide
				</label>
				<div className="relative group">
					<Search className="absolute left-5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-300 group-focus-within:text-green-500 transition-colors duration-300" />
					<input
						type="text"
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						placeholder="Nom, email ou ID..."
						className="w-full pl-14 pr-6 py-4 bg-gray-200/50 border border-transparent focus:border-green-100 focus:bg-white focus:ring-4 focus:ring-green-500/5 rounded-2xl transition-all duration-300 font-bold text-gray-900 placeholder:text-gray-300"
					/>
				</div>
			</div>

			<div className="w-full lg:w-64">
				<label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">
					Niveau d'accès
				</label>
				<select
					value={roleFilter}
					onChange={(e) => setRoleFilter(e.target.value)}
					className="w-full px-6 py-4 bg-gray-200/50 border border-transparent focus:border-green-100 focus:bg-white focus:ring-4 focus:ring-green-500/5 rounded-2xl transition-all duration-300 font-bold text-gray-900 appearance-none cursor-pointer"
				>
					<option value="">Tous les rôles</option>
					<option value="super-admin">Super Admin</option>
					<option value="admin">Admin</option>
					<option value="moderator">Modérateur</option>
					<option value="support">Support</option>
				</select>
			</div>

			<div className="w-full lg:w-64">
				<label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-1">
					État du compte
				</label>
				<select
					value={statusFilter}
					onChange={(e) => setStatusFilter(e.target.value)}
					className="w-full px-6 py-4 bg-gray-200/50 border border-transparent focus:border-green-100 focus:bg-white focus:ring-4 focus:ring-green-500/5 rounded-2xl transition-all duration-300 font-bold text-gray-900 appearance-none cursor-pointer"
				>
					<option value="">Tous les statuts</option>
					<option value="active">Actif uniquement</option>
					<option value="inactive">Inactif uniquement</option>
				</select>
			</div>
		</div>
	);
};

export default AdminFilters;
