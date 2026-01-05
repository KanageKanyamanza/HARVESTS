import React from "react";
import { X } from "lucide-react";

const AdminViewModal = ({
	show,
	onClose,
	admin,
	getRoleColor,
	getRoleLabel,
	getDepartmentLabel,
	formatDate,
}) => {
	if (!show || !admin) return null;

	return (
		<div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-fade-in">
			<div className="bg-white/95 backdrop-blur-2xl rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-white/40">
				<div className="p-10 flex-col overflow-y-auto">
					<div className="flex justify-between items-center mb-10">
						<div>
							<h3 className="text-3xl font-[1000] text-gray-900 tracking-tight leading-none mb-2">
								Fiche <span className="text-green-600">Détaillée</span>
							</h3>
							<p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
								Consultation du dossier administrateur
							</p>
						</div>
						<button
							onClick={onClose}
							className="p-3 bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all duration-300"
						>
							<X className="h-6 w-6" />
						</button>
					</div>

					<div className="space-y-5">
						{/* Identity Card */}
						<div className="flex flex-wrap gap-2 items-center sm:p-8 bg-gray-50/50 rounded-[2rem] border border-gray-100">
							<div className="h-20 w-20 rounded-[1.5rem] bg-white border border-gray-100 flex items-center justify-center shadow-sm overflow-hidden">
								{admin.avatar ? (
									<img
										src={admin.avatar}
										alt=""
										className="h-full w-full object-cover"
									/>
								) : (
									<span className="text-2xl font-black text-blue-600">
										{admin.firstName?.[0]}
										{admin.lastName?.[0]}
									</span>
								)}
							</div>
							<div className="sm:ml-8">
								<h4 className="text-2xl font-[1000] text-gray-900 leading-none mb-2">
									{admin.firstName} {admin.lastName}
								</h4>
								<p className="text-sm font-bold text-gray-400">{admin.email}</p>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-10">
							<div className="space-y-6">
								<div>
									<label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
										Niveau d'Accès
									</label>
									<span
										className={`inline-flex px-4 py-1.5 text-[10px] font-black rounded-xl uppercase tracking-widest border ${getRoleColor(
											admin.role
										)} shadow-sm`}
									>
										{getRoleLabel(admin.role)}
									</span>
								</div>
								<div>
									<label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
										Département
									</label>
									<p className="text-sm font-black text-gray-900 uppercase">
										{getDepartmentLabel(admin.department)}
									</p>
								</div>
							</div>

							<div className="space-y-6">
								<div>
									<label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
										Statut Compte
									</label>
									<span
										className={`inline-flex items-center px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
											admin.isActive
												? "bg-green-50 text-green-700 border-green-100"
												: "bg-red-50 text-red-700 border-red-100"
										}`}
									>
										{admin.isActive ? "Opérationnel" : "Suspendu"}
									</span>
								</div>
								<div>
									<label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
										Téléphone
									</label>
									<p className="text-sm font-black text-gray-900 leading-none">
										{admin.phone || "Non renseigné"}
									</p>
								</div>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-10 p-8 bg-gray-900 rounded-[2rem] text-white">
							<div>
								<label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">
									Dernière Connexion
								</label>
								<p className="text-xs font-bold">
									{formatDate(admin.lastLogin)}
								</p>
							</div>
							<div>
								<label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">
									Membre depuis le
								</label>
								<p className="text-xs font-bold">
									{formatDate(admin.createdAt)}
								</p>
							</div>
						</div>

						{admin.createdBy && (
							<div className="flex items-center justify-between p-6 bg-blue-50/50 rounded-2xl border border-blue-100/50">
								<span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
									Créé par
								</span>
								<span className="text-xs font-black text-blue-900">
									{admin.createdBy.firstName} {admin.createdBy.lastName}
								</span>
							</div>
						)}
					</div>

					<div className="flex justify-end mt-10">
						<button
							onClick={onClose}
							className="px-10 py-4 bg-gray-900 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all duration-300 shadow-xl"
						>
							Fermer le dossier
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AdminViewModal;
