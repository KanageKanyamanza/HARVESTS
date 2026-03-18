import React, { useState } from "react";
import { Mail, Save, X, Smartphone, BellRing } from "lucide-react";
import PushNotificationToggle from "../../common/PushNotificationToggle";
import { notificationService } from "../../../services/notificationService";

const NotificationsTab = ({
	user,
	formData,
	saving,
	onInputChange,
	onSubmit,
	onReset,
}) => {
	return (
		<div className="p-6">
			{/* ── Section Email ─────────────────────────────────────────── */}
			<div className="flex items-center gap-3 mb-6">
				<div className="w-10 h-10 rounded-xl bg-indigo-100/50 flex items-center justify-center text-indigo-600">
					<Mail className="h-5 w-5" />
				</div>
				<div>
					<h2 className="text-xl font-black text-gray-900 tracking-tight leading-none mb-1">
						Notifications Email
					</h2>
					<p className="text-gray-500 font-medium text-xs">
						Gérez vos préférences de réception d'emails
					</p>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
				<div className="lg:col-span-2 space-y-6">
					<div className="bg-indigo-50/50 rounded-2xl p-6 border border-indigo-100">
						<div className="flex items-start gap-3">
							<div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
								<Mail className="h-5 w-5" />
							</div>
							<div>
								<h3 className="text-base font-black text-indigo-900 mb-1">
									Configuration de l'adresse
								</h3>
								<p className="text-indigo-700/80 leading-tight text-xs">
									Configurez une adresse spécifique pour recevoir les alertes
									importantes du système (nouvelles commandes, messages,
									approbations...). Cette adresse peut être différente de votre
									email de connexion.
								</p>
							</div>
						</div>
					</div>

					<div className="space-y-4">
						<div className="space-y-1.5">
							<label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
								Email de notification
							</label>
							<input
								type="email"
								name="notificationEmail"
								value={formData.notificationEmail}
								onChange={onInputChange}
								placeholder={
									user?.notificationEmail || "Ex: notifications@votresite.com"
								}
								className="w-full bg-gray-50/50 border border-gray-100 rounded-xl px-4 py-2 text-xs font-bold text-gray-700 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder-gray-400"
							/>

							{user?.notificationEmail ? (
								<div className="flex items-center gap-1.5 mt-2 px-2 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-[10px] font-black uppercase tracking-widest w-fit">
									<span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
									{user.notificationEmail}
								</div>
							) : (
								<div className="flex items-center gap-1.5 mt-2 px-2 py-1 bg-gray-100 text-gray-500 rounded-lg text-[10px] font-black uppercase tracking-widest w-fit">
									<span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
									Aucun email
								</div>
							)}
						</div>

						{formData.notificationEmail &&
							formData.notificationEmail !== user?.notificationEmail && (
								<div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100 animate-fade-in">
									<p className="text-[10px] font-black uppercase tracking-widest text-indigo-900">
										✨ Nouveau :{" "}
										<span className="text-indigo-600">
											{formData.notificationEmail}
										</span>
									</p>
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
							type="button"
							onClick={onSubmit}
							disabled={saving}
							className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 disabled:opacity-50 shadow-md transform hover:-translate-y-0.5 transition-all flex items-center gap-2"
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

				<div className="lg:col-span-1">
					<div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 h-full">
						<h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">
							Types de notifications
						</h3>
						<ul className="space-y-3">
							{[
								"Messages du formulaire de contact",
								"Nouvelles commandes importantes",
								"Produits en attente de validation",
								"Alertes de sécurité système",
								"Rapports d'activité hebdomadaires",
							].map((item, index) => (
								<li
									key={index}
									className="flex items-start gap-2.5 text-[11px] font-bold text-gray-500"
								>
									<div className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5">
										<span className="text-[8px] font-black">✓</span>
									</div>
									<span className="leading-tight">{item}</span>
								</li>
							))}
						</ul>
					</div>
				</div>
			</div>

			{/* ── Section Push Notifications ─────────────────────────────── */}
			<div className="mt-8 pt-8 border-t border-gray-100">
				<div className="flex items-center gap-3 mb-5">
					<div className="w-10 h-10 rounded-xl bg-violet-100/50 flex items-center justify-center text-violet-600">
						<Smartphone className="h-5 w-5" />
					</div>
					<div>
						<h2 className="text-xl font-black text-gray-900 tracking-tight leading-none mb-1">
							Notifications Push Mobile
						</h2>
						<p className="text-gray-500 font-medium text-xs">
							Recevez des alertes push sur cet appareil, même lorsque l'app est
							fermée
						</p>
					</div>
				</div>
				<div className="flex flex-col md:flex-row md:items-center gap-6">
					<PushNotificationToggle isAdmin={true} />

					<div className="flex-1 flex justify-end">
						<button
							onClick={async () => {
								try {
									await notificationService.sendTestNotification();
									window.alert("✅ Notification de test envoyée avec succès !");
								} catch (err) {
									console.error(err);
									window.alert(
										"❌ Erreur lors de l'envoi du test. Vérifiez la console."
									);
								}
							}}
							className="group flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-violet-100 rounded-xl text-[11px] font-black uppercase tracking-widest text-violet-600 hover:bg-violet-50 hover:border-violet-200 transition-all shadow-sm active:scale-95"
						>
							<BellRing className="h-4 w-4 group-hover:animate-bounce" />
							Tester les notifications
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default NotificationsTab;
