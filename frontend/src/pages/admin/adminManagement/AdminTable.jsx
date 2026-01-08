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
				<thead className="bg-slate-50/50">
					<tr>
						<th className="px-5 py-3 text-left text-[9px] font-black text-gray-400 uppercase tracking-widest">
							Identité
						</th>
						<th className="px-3 py-3 text-left text-[9px] font-black text-gray-400 uppercase tracking-widest">
							Rôle
						</th>
						<th className="px-3 py-3 text-left text-[9px] font-black text-gray-400 uppercase tracking-widest">
							Statut
						</th>
						<th className="px-3 py-3 text-left text-[9px] font-black text-gray-400 uppercase tracking-widest">
							Département
						</th>
						<th className="px-5 py-3 text-right text-[9px] font-black text-gray-400 uppercase tracking-widest">
							Actions
						</th>
					</tr>
				</thead>
				<tbody className="divide-y divide-gray-100">
					{admins.length === 0 ? (
						<tr>
							<td colSpan="5" className="px-5 py-12 text-center">
								<p className="text-xs font-black text-gray-300 uppercase tracking-widest">
									Aucun administrateur enregistré
								</p>
							</td>
						</tr>
					) : (
						admins.map((admin) => (
							<tr
								key={admin._id}
								className="group hover:bg-slate-50 transition-all duration-300"
							>
								<td className="px-5 py-2.5 whitespace-nowrap">
									<div className="flex items-center">
										<div className="relative flex-shrink-0 h-9 w-9 group-hover:scale-110 transition-transform duration-500">
											{admin.avatar ? (
												<img
													src={admin.avatar}
													alt=""
													className="h-9 w-9 rounded-xl object-cover border border-gray-100 shadow-sm"
												/>
											) : (
												<div className="h-9 w-9 rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 border border-gray-100 flex items-center justify-center shadow-sm">
													<span className="text-[10px] font-black text-gray-700">
														{admin.firstName?.[0] || ""}
														{admin.lastName?.[0] || ""}
													</span>
												</div>
											)}
											<div
												className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
													admin.isActive
														? "bg-green-500 shadow-sm"
														: "bg-gray-300 shadow-sm"
												}`}
											></div>
										</div>
										<div className="ml-3">
											<div className="text-xs font-black text-gray-900 leading-none mb-0.5">
												{admin.firstName} {admin.lastName}
											</div>
											<div className="text-[9px] font-bold text-gray-400">
												{admin.email}
											</div>
										</div>
									</div>
								</td>
								<td className="px-3 py-2.5 whitespace-nowrap">
									<span
										className={`inline-flex px-2 py-0.5 text-[8px] font-black rounded-lg uppercase tracking-widest border ${getRoleColor(
											admin.role
										)} shadow-sm`}
									>
										{getRoleLabel(admin.role)}
									</span>
								</td>
								<td className="px-3 py-2.5 whitespace-nowrap">
									<button
										onClick={() => handleToggleStatus(admin)}
										className={`group/btn relative inline-flex items-center px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border transition-all duration-300 shadow-sm ${
											admin.isActive
												? "bg-green-50 text-green-700 border-green-100 hover:bg-green-600 hover:text-white"
												: "bg-red-50 text-red-700 border-red-100 hover:bg-red-600 hover:text-white"
										}`}
									>
										{admin.isActive ? (
											<>
												<UserCheck className="h-2.5 w-2.5 mr-1" />
												Actif
											</>
										) : (
											<>
												<UserX className="h-2.5 w-2.5 mr-1" />
												Inactif
											</>
										)}
									</button>
								</td>
								<td className="px-3 py-2.5 whitespace-nowrap">
									<div className="flex flex-col">
										<span className="text-[9px] font-black text-gray-900 uppercase tracking-widest">
											{getDepartmentLabel(admin.department)}
										</span>
										<span className="text-[8px] font-bold text-gray-400 uppercase mt-0.5">
											{formatDate(admin.lastLogin)}
										</span>
									</div>
								</td>
								<td className="px-5 py-2.5 whitespace-nowrap text-right">
									<div className="flex items-center justify-end space-x-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
										<button
											onClick={() => handleView(admin)}
											className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg transition-all border border-blue-100"
											title="Détails"
										>
											<Eye className="h-3.5 w-3.5" />
										</button>
										<button
											onClick={() => handleEditClick(admin)}
											className="p-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-lg transition-all border border-indigo-100"
											title="Modifier"
										>
											<Edit className="h-3.5 w-3.5" />
										</button>
										<button
											onClick={() => handleDelete(admin)}
											className="p-1.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-all border border-red-100"
											title="Supprimer"
										>
											<Trash2 className="h-3.5 w-3.5" />
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
