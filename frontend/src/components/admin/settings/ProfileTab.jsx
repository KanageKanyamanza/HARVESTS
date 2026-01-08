import React from "react";
import { User, Mail, Phone, Camera, Save, X } from "lucide-react";
import CloudinaryImage from "../../common/CloudinaryImage";

const ProfileTab = ({
	user,
	formData,
	avatarPreview,
	errors,
	saving,
	onInputChange,
	onAvatarChange,
	onSubmit,
	onReset,
}) => {
	return (
		<form onSubmit={onSubmit} className="p-6">
			<div className="flex items-center gap-3 mb-6">
				<div className="w-10 h-10 rounded-xl bg-emerald-100/50 flex items-center justify-center text-emerald-600">
					<User className="h-5 w-5" />
				</div>
				<div>
					<h2 className="text-xl font-black text-gray-900 tracking-tight leading-none mb-1">
						Informations Personnelles
					</h2>
					<p className="text-gray-500 font-medium text-xs">
						Gérez vos informations publiques et privées
					</p>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
				{/* Avatar Section */}
				<div className="lg:col-span-1">
					<div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-100 border-dashed text-center">
						<div className="relative inline-block group">
							<div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full blur opacity-10 group-hover:opacity-20 transition duration-1000 group-hover:duration-200"></div>
							<div className="relative">
								{avatarPreview || user?.avatar ? (
									<CloudinaryImage
										src={avatarPreview || user.avatar}
										alt="Avatar"
										className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-md"
										fallback={
											<div className="h-24 w-24 rounded-full bg-white flex items-center justify-center border-4 border-gray-50 shadow-inner">
												<User className="h-8 w-8 text-gray-300" />
											</div>
										}
									/>
								) : (
									<div className="h-24 w-24 rounded-full bg-white flex items-center justify-center border-4 border-gray-50 shadow-inner mx-auto">
										<User className="h-8 w-8 text-gray-300" />
									</div>
								)}
								<label className="absolute bottom-0 right-0 bg-gray-900 text-white p-2 rounded-xl cursor-pointer hover:bg-emerald-600 transition-all shadow-md border-2 border-white">
									<Camera className="h-3.5 w-3.5" />
									<input
										type="file"
										accept="image/jpeg,image/png,image/webp"
										onChange={onAvatarChange}
										className="hidden"
									/>
								</label>
							</div>
						</div>
						<div className="mt-4">
							<h3 className="text-sm font-black text-gray-900">
								Photo de profil
							</h3>
							<p className="text-[10px] text-gray-500 mt-1 max-w-[150px] mx-auto leading-tight">
								JPG, PNG ou WEBP. <br />
								Taille max: 5MB
							</p>
							{errors.avatar && (
								<p className="text-[10px] font-black text-rose-500 mt-2 bg-rose-50 py-0.5 px-2 rounded-md inline-block uppercase tracking-widest">
									{errors.avatar}
								</p>
							)}
						</div>
					</div>
				</div>

				{/* Inputs Section */}
				<div className="lg:col-span-2 space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-1.5">
							<label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
								Prénom <span className="text-emerald-500">*</span>
							</label>
							<input
								type="text"
								name="firstName"
								value={formData.firstName}
								onChange={onInputChange}
								required
								className="w-full bg-gray-50/50 border border-gray-100 rounded-xl px-4 py-2 text-xs font-bold text-gray-700 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all"
								placeholder="Votre prénom"
							/>
						</div>
						<div className="space-y-1.5">
							<label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
								Nom <span className="text-emerald-500">*</span>
							</label>
							<input
								type="text"
								name="lastName"
								value={formData.lastName}
								onChange={onInputChange}
								required
								className="w-full bg-gray-50/50 border border-gray-100 rounded-xl px-4 py-2 text-xs font-bold text-gray-700 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all"
								placeholder="Votre nom"
							/>
						</div>
					</div>

					<div className="space-y-1.5">
						<label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
							<Mail className="h-3 w-3" />
							Email de connexion
						</label>
						<div className="relative">
							<input
								type="email"
								value={user?.email || ""}
								disabled
								className="w-full bg-gray-100/50 border border-gray-100 rounded-xl px-4 py-2 text-xs font-medium text-gray-400 cursor-not-allowed select-none"
							/>
							<div className="absolute right-3 top-1/2 -translate-y-1/2">
								<span className="text-[8px] font-black bg-gray-200/50 text-gray-400 px-1.5 py-0.5 rounded text-center uppercase tracking-widest">
									Lecture seule
								</span>
							</div>
						</div>
					</div>

					<div className="space-y-1.5">
						<label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
							<Phone className="h-3 w-3" />
							Téléphone
						</label>
						<input
							type="tel"
							name="phone"
							value={formData.phone}
							onChange={onInputChange}
							className="w-full bg-gray-50/50 border border-gray-100 rounded-xl px-4 py-2 text-xs font-bold text-gray-700 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all"
							placeholder="+33 6 12 34 56 78"
						/>
					</div>

					{/* Actions */}
					<div className="flex items-center justify-end gap-3 pt-4 mt-4 border-t border-gray-50">
						<button
							type="button"
							onClick={onReset}
							className="px-4 py-2 border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:bg-gray-50 transition-all"
						>
							Annuler
						</button>
						<button
							type="submit"
							disabled={saving}
							className="px-6 py-2 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 disabled:opacity-50 shadow-md transform hover:-translate-y-0.5 transition-all flex items-center gap-2"
						>
							{saving ? (
								<>
									<div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
									<span>Envoi...</span>
								</>
							) : (
								<>
									<Save className="h-3.5 w-3.5" />
									<span>Enregistrer</span>
								</>
							)}
						</button>
					</div>
				</div>
			</div>
		</form>
	);
};

export default ProfileTab;
