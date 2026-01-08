import React, { useState } from "react";
import { X, Save, UserCheck, Eye, EyeOff } from "lucide-react";

const AdminCreateModal = ({
	show,
	onClose,
	formData,
	setFormData,
	onSubmit,
	saving,
	resetForm,
}) => {
	const [showPassword, setShowPassword] = useState(false);

	if (!show) return null;

	return (
		<div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-fade-in">
			<div className="bg-white backdrop-blur-2xl rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-white/40">
				<div className="p-5 flex-col overflow-y-auto">
					<div className="flex justify-between items-center mb-5">
						<div>
							<h3 className="text-3xl font-[1000] text-gray-900 tracking-tight leading-none mb-2">
								Nouveau <span className="text-green-600">Profil</span>
							</h3>
							<p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
								Configuration des accès administrateur
							</p>
						</div>
						<button
							onClick={() => {
								onClose();
								resetForm();
							}}
							className="p-3 bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all duration-300"
						>
							<X className="h-6 w-6" />
						</button>
					</div>

					<form onSubmit={onSubmit} className="space-y-4">
						<div className="grid grid-cols-2 gap-6">
							<div className="space-y-3">
								<label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
									Prénom *
								</label>
								<input
									type="text"
									required
									value={formData.firstName}
									onChange={(e) =>
										setFormData({ ...formData, firstName: e.target.value })
									}
									className="w-full px-6 py-4 bg-gray-200/50 border border-transparent focus:border-green-100 focus:bg-white focus:ring-4 focus:ring-green-500/5 rounded-2xl transition-all duration-300 font-bold text-gray-900 placeholder:text-gray-300"
									placeholder="Jean"
								/>
							</div>
							<div className="space-y-3">
								<label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
									Nom *
								</label>
								<input
									type="text"
									required
									value={formData.lastName}
									onChange={(e) =>
										setFormData({ ...formData, lastName: e.target.value })
									}
									className="w-full px-6 py-4 bg-gray-200/50 border border-transparent focus:border-green-100 focus:bg-white focus:ring-4 focus:ring-green-500/5 rounded-2xl transition-all duration-300 font-bold text-gray-900 placeholder:text-gray-300"
									placeholder="Dupont"
								/>
							</div>
						</div>

						<div className="grid grid-cols-[100px_1fr] gap-6 items-center">
							<div className="h-[100px] w-[100px] rounded-[2rem] bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden">
								{formData.avatar ? (
									<img
										src={formData.avatar}
										alt="Preview"
										className="h-full w-full object-cover"
									/>
								) : (
									<div className="flex flex-col items-center">
										<div className="w-6 h-6 rounded-full bg-gray-200"></div>
										<span className="text-[8px] font-black text-gray-400 mt-2 uppercase">
											Aperçu
										</span>
									</div>
								)}
							</div>
							<div className="space-y-3">
								<label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
									URL de la Photo de Profil
								</label>
								<input
									type="url"
									value={formData.avatar}
									onChange={(e) =>
										setFormData({ ...formData, avatar: e.target.value })
									}
									className="w-full px-6 py-4 bg-gray-50/50 border border-transparent focus:border-green-100 focus:bg-white focus:ring-4 focus:ring-green-500/5 rounded-2xl transition-all duration-300 font-bold text-gray-900 placeholder:text-gray-300"
									placeholder="https://exemple.com/photo.jpg"
								/>
							</div>
						</div>

						<div className="space-y-3">
							<label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
								Adresse Email *
							</label>
							<input
								type="email"
								required
								value={formData.email}
								onChange={(e) =>
									setFormData({ ...formData, email: e.target.value })
								}
								className="w-full px-6 py-4 bg-gray-50/50 border border-transparent focus:border-green-100 focus:bg-white focus:ring-4 focus:ring-green-500/5 rounded-2xl transition-all duration-300 font-bold text-gray-900 placeholder:text-gray-300"
								placeholder="jean.dupont@exemple.com"
							/>
						</div>

						<div className="space-y-3">
							<label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
								Sécurité (Mot de passe) *
							</label>
							<div className="relative group/pass">
								<input
									type={showPassword ? "text" : "password"}
									required
									minLength={8}
									value={formData.password}
									onChange={(e) =>
										setFormData({ ...formData, password: e.target.value })
									}
									className="w-full px-6 py-4 bg-gray-200/50 border border-transparent focus:border-green-100 focus:bg-white focus:ring-4 focus:ring-green-500/5 rounded-2xl transition-all duration-300 font-bold text-gray-900 placeholder:text-gray-300 pr-14"
									placeholder="********"
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-green-600 transition-colors"
								>
									{showPassword ? (
										<EyeOff className="h-5 w-5" />
									) : (
										<Eye className="h-5 w-5" />
									)}
								</button>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-6">
							<div className="space-y-3">
								<label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
									Rôle *
								</label>
								<select
									required
									value={formData.role}
									onChange={(e) =>
										setFormData({ ...formData, role: e.target.value })
									}
									className="w-full px-6 py-4 bg-gray-200/50 border border-transparent focus:border-green-100 focus:bg-white focus:ring-4 focus:ring-green-500/5 rounded-2xl transition-all duration-300 font-bold text-gray-900 appearance-none cursor-pointer"
								>
									<option value="moderator">Modérateur</option>
									<option value="admin">Admin</option>
									<option value="super-admin">Super Admin</option>
									<option value="support">Support</option>
								</select>
							</div>
							<div className="space-y-3">
								<label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
									Département *
								</label>
								<select
									required
									value={formData.department}
									onChange={(e) =>
										setFormData({ ...formData, department: e.target.value })
									}
									className="w-full px-6 py-4 bg-gray-200/50 border border-transparent focus:border-green-100 focus:bg-white focus:ring-4 focus:ring-green-500/5 rounded-2xl transition-all duration-300 font-bold text-gray-900 appearance-none cursor-pointer"
								>
									<option value="support">Support Clients</option>
									<option value="technical">Technique / IT</option>
									<option value="marketing">Marketing / Com</option>
									<option value="finance">Compta / Finance</option>
									<option value="operations">Opérations</option>
								</select>
							</div>
						</div>

						<div className="flex items-center space-x-3 p-4 bg-gray-200/50 rounded-2xl border border-transparent hover:border-green-100 transition-all cursor-pointer group/check">
							<div className="relative flex items-center">
								<input
									type="checkbox"
									checked={formData.isActive}
									onChange={(e) =>
										setFormData({ ...formData, isActive: e.target.checked })
									}
									className="w-6 h-6 border-2 border-gray-200 rounded-lg bg-white checked:bg-green-600 checked:border-green-600 transition-all duration-300 cursor-pointer appearance-none"
								/>
								<UserCheck
									className={`absolute inset-0 m-auto h-4 w-4 text-white pointer-events-none transition-opacity duration-300 ${
										formData.isActive ? "opacity-100" : "opacity-0"
									}`}
								/>
							</div>
							<label className="text-xs font-black text-gray-900 uppercase tracking-widest cursor-pointer">
								Activer le profil immédiatement
							</label>
						</div>

						<div className="flex justify-end space-x-4 pt-6 border-t border-gray-100/50">
							<button
								type="button"
								onClick={() => {
									onClose();
									resetForm();
								}}
								className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-gray-900 transition-colors"
							>
								Annuler
							</button>
							<button
								type="submit"
								disabled={saving}
								className="flex items-center px-10 py-4 bg-gray-900 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:bg-green-600 transition-all duration-500 shadow-xl hover:shadow-green-200/50 disabled:opacity-50"
							>
								<Save className="h-4 w-4 mr-3" />
								{saving ? "Traitement..." : "Créer le Profil"}
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
};

export default AdminCreateModal;
