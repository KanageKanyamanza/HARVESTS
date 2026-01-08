import React, { useState } from "react";
import { Lock, Save, X, Eye, EyeOff } from "lucide-react";

const PasswordTab = ({
	passwordData,
	errors,
	saving,
	onPasswordChange,
	onSubmit,
	onReset,
}) => {
	const [showPasswords, setShowPasswords] = useState({
		current: false,
		new: false,
		confirm: false,
	});

	const togglePassword = (field) => {
		setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
	};

	return (
		<form onSubmit={onSubmit} className="p-6">
			<div className="flex items-center gap-3 mb-6">
				<div className="w-10 h-10 rounded-xl bg-rose-100/50 flex items-center justify-center text-rose-600">
					<Lock className="h-5 w-5" />
				</div>
				<div>
					<h2 className="text-xl font-black text-gray-900 tracking-tight leading-none mb-1">
						Sécurité
					</h2>
					<p className="text-gray-500 font-medium text-xs">
						Mettez à jour votre mot de passe et sécurisez votre compte
					</p>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
				<div className="lg:col-span-2 space-y-6">
					<div className="bg-rose-50/50 rounded-2xl p-6 border border-rose-100">
						<div className="flex items-start gap-3">
							<div className="p-2 bg-rose-100/80 rounded-lg text-rose-600">
								<Lock className="h-5 w-5" />
							</div>
							<div>
								<h3 className="text-base font-black text-rose-900 mb-1">
									Renforcez votre sécurité
								</h3>
								<p className="text-rose-700/80 leading-tight text-xs">
									Utilisez un mot de passe fort contenant au moins 8 caractères,
									des majuscules, des minuscules et des chiffres. Ne partagez
									jamais votre mot de passe administrateur.
								</p>
							</div>
						</div>
					</div>

					<div className="space-y-6 max-w-xl">
						<div className="space-y-4 max-w-xl">
							<div className="space-y-1.5">
								<label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
									Mot de passe actuel <span className="text-rose-500">*</span>
								</label>
								<div className="relative">
									<input
										type={showPasswords.current ? "text" : "password"}
										value={passwordData.currentPassword}
										onChange={(e) =>
											onPasswordChange("currentPassword", e.target.value)
										}
										required
										className="w-full bg-gray-50/50 border border-gray-100 rounded-xl px-4 py-2 text-xs font-bold text-gray-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-rose-500/20 transition-all placeholder-gray-400 pr-10"
										placeholder="••••••••••••"
									/>
									<button
										type="button"
										onClick={() => togglePassword("current")}
										className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-rose-600 transition-colors"
									>
										{showPasswords.current ? (
											<EyeOff className="h-4 w-4" />
										) : (
											<Eye className="h-4 w-4" />
										)}
									</button>
								</div>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-50">
								<div className="space-y-1.5">
									<label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
										Nouveau <span className="text-rose-500">*</span>
									</label>
									<div className="relative">
										<input
											type={showPasswords.new ? "text" : "password"}
											value={passwordData.newPassword}
											onChange={(e) =>
												onPasswordChange("newPassword", e.target.value)
											}
											required
											minLength={6}
											className="w-full bg-gray-50/50 border border-gray-100 rounded-xl px-4 py-2 text-xs font-bold text-gray-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-rose-500/20 transition-all placeholder-gray-400 pr-10"
											placeholder="••••••••••••"
										/>
										<button
											type="button"
											onClick={() => togglePassword("new")}
											className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-rose-600 transition-colors"
										>
											{showPasswords.new ? (
												<EyeOff className="h-4 w-4" />
											) : (
												<Eye className="h-4 w-4" />
											)}
										</button>
									</div>
									<p className="text-[9px] font-black text-gray-400 px-2 uppercase tracking-tight">
										Min 6 caractères
									</p>
								</div>
								<div className="space-y-1.5">
									<label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
										Confirmer <span className="text-rose-500">*</span>
									</label>
									<div className="relative">
										<input
											type={showPasswords.confirm ? "text" : "password"}
											value={passwordData.confirmPassword}
											onChange={(e) =>
												onPasswordChange("confirmPassword", e.target.value)
											}
											required
											minLength={6}
											className="w-full bg-gray-50/50 border border-gray-100 rounded-xl px-4 py-2 text-xs font-bold text-gray-700 focus:outline-none focus:bg-white focus:ring-2 focus:ring-rose-500/20 transition-all placeholder-gray-400 pr-10"
											placeholder="••••••••••••"
										/>
										<button
											type="button"
											onClick={() => togglePassword("confirm")}
											className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-rose-600 transition-colors"
										>
											{showPasswords.confirm ? (
												<EyeOff className="h-4 w-4" />
											) : (
												<Eye className="h-4 w-4" />
											)}
										</button>
									</div>
								</div>
							</div>

							{errors.password && (
								<div className="bg-rose-50 text-rose-600 px-4 py-3 rounded-xl text-sm font-bold border border-rose-100 animate-shake">
									⚠️ {errors.password}
								</div>
							)}
						</div>

						<div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-50">
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
								className="px-6 py-2 bg-rose-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-700 disabled:opacity-50 shadow-md transform hover:-translate-y-0.5 transition-all flex items-center gap-2"
							>
								{saving ? (
									<>
										<div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
										<span>Envoi...</span>
									</>
								) : (
									<>
										<Save className="h-3.5 w-3.5" />
										<span>Mettre à jour</span>
									</>
								)}
							</button>
						</div>
					</div>
				</div>

				<div className="lg:col-span-1">
					<div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 h-full">
						<h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">
							Critères de sécurité
						</h3>
						<ul className="space-y-3">
							{[
								{
									label: "Minimum 8 caractères",
									active: passwordData.newPassword.length >= 8,
								},
								{
									label: "Une majuscule",
									active: /[A-Z]/.test(passwordData.newPassword),
								},
								{
									label: "Une minuscule",
									active: /[a-z]/.test(passwordData.newPassword),
								},
								{
									label: "Un chiffre",
									active: /[0-9]/.test(passwordData.newPassword),
								},
								{
									label: "Identiques",
									active:
										passwordData.newPassword &&
										passwordData.newPassword === passwordData.confirmPassword,
								},
							].map((item, index) => (
								<li
									key={index}
									className={`flex items-center gap-2.5 text-[11px] font-bold transition-all duration-300 ${
										item.active ? "text-emerald-600" : "text-gray-400"
									}`}
								>
									<div
										className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-300 ${
											item.active
												? "bg-emerald-100 text-emerald-600"
												: "bg-gray-200 text-gray-400"
										}`}
									>
										<span className="text-[8px] font-black">
											{item.active ? "✓" : "•"}
										</span>
									</div>
									{item.label}
								</li>
							))}
						</ul>
					</div>
				</div>
			</div>
		</form>
	);
};

export default PasswordTab;
