import { Eye, Edit, Trash2, UserCheck, UserX } from "lucide-react";

const AdminTable = ({
	admins,
	getRoleColor,
	getRoleLabel,
	getDepartmentLabel,
	formatDate,
	handleView,
	handleEditClick,
	handleDelete,
	handleToggleStatus,
}) => {
	return (
		<div className="overflow-x-auto">
			<table className="min-w-full divide-y divide-gray-200/50">
				<thead className="bg-gray-200/50">
					<tr>
						<th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
							Identité
						</th>
						<th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
							Rôle
						</th>
						<th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
							Statut
						</th>
						<th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
							Département
						</th>
						<th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">
							Actions
						</th>
					</tr>
				</thead>
				<tbody className="divide-y divide-gray-200/50">
					{admins.length === 0 ? (
						<tr>
							<td colSpan="5" className="px-8 py-20 text-center">
								<p className="text-sm font-black text-gray-300 uppercase tracking-widest">
									Aucun administrateur enregistré
								</p>
							</td>
						</tr>
					) : (
						admins.map((admin) => (
							<tr
								key={admin._id}
								className="group hover:bg-white/60 transition-all duration-300"
							>
								<td className="px-8 py-6 whitespace-nowrap">
									<div className="flex items-center">
										<div className="relative flex-shrink-0 h-12 w-12 group-hover:scale-110 transition-transform duration-500">
											{admin.avatar ? (
												<img
													src={admin.avatar}
													alt=""
													className="h-12 w-12 rounded-[1.25rem] object-cover border border-gray-100 shadow-sm"
												/>
											) : (
												<div className="h-12 w-12 rounded-[1.25rem] bg-gradient-to-br from-gray-100 to-gray-50 border border-gray-100 flex items-center justify-center shadow-sm">
													<span className="text-sm font-black text-gray-700">
														{admin.firstName?.[0] || ""}
														{admin.lastName?.[0] || ""}
													</span>
												</div>
											)}
											<div
												className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
													admin.isActive
														? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]"
														: "bg-gray-300 shadow-[0_0_10px_rgba(209,213,219,0.4)]"
												}`}
											></div>
										</div>
										<div className="ml-5">
											<div className="text-sm font-black text-gray-900 leading-none mb-1">
												{admin.firstName} {admin.lastName}
											</div>
											<div className="text-[10px] font-bold text-gray-400">
												{admin.email}
											</div>
										</div>
									</div>
								</td>
								<td className="px-8 py-6 whitespace-nowrap">
									<span
										className={`inline-flex px-4 py-1.5 text-[10px] font-black rounded-xl uppercase tracking-widest border ${getRoleColor(
											admin.role
										)} shadow-sm`}
									>
										{getRoleLabel(admin.role)}
									</span>
								</td>
								<td className="px-8 py-6 whitespace-nowrap">
									<button
										onClick={() => handleToggleStatus(admin)}
										className={`group/btn relative inline-flex items-center px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all duration-300 shadow-sm ${
											admin.isActive
												? "bg-green-50 text-green-700 border-green-100 hover:bg-green-600 hover:text-white hover:border-green-600"
												: "bg-red-50 text-red-700 border-red-100 hover:bg-red-600 hover:text-white hover:border-red-600"
										}`}
									>
										{admin.isActive ? (
											<>
												<UserCheck className="h-3 w-3 mr-2" />
												Actif
											</>
										) : (
											<>
												<UserX className="h-3 w-3 mr-2" />
												Inactif
											</>
										)}
									</button>
								</td>
								<td className="px-8 py-6 whitespace-nowrap">
									<div className="flex flex-col">
										<span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">
											{getDepartmentLabel(admin.department)}
										</span>
										<span className="text-[9px] font-bold text-gray-400 uppercase mt-1">
											Connex: {formatDate(admin.lastLogin)}
										</span>
									</div>
								</td>
								<td className="px-8 py-6 whitespace-nowrap text-right">
									<div className="flex items-center justify-end space-x-3 opacit-0 group-hover:opacity-100 transition-opacity duration-300">
										<button
											onClick={() => handleView(admin)}
											className="p-2.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl transition-all duration-300 border border-blue-100"
											title="Détails"
										>
											<Eye className="h-4 w-4" />
										</button>
										<button
											onClick={() => handleEditClick(admin)}
											className="p-2.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-xl transition-all duration-300 border border-indigo-100"
											title="Modifier"
										>
											<Edit className="h-4 w-4" />
										</button>
										<button
											onClick={() => handleDelete(admin)}
											className="p-2.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl transition-all duration-300 border border-red-100"
											title="Supprimer"
										>
											<Trash2 className="h-4 w-4" />
										</button>
									</div>
								</td>
							</tr>
						))
					)}
				</tbody>
			</table>
		</div>
	);
};

export default AdminTable;
