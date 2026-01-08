import React from "react";
import { XCircle, Banknote, CreditCard } from "lucide-react";
import {
	formatPrice,
	formatDate,
	getStatusBadge,
	getPaymentStatusBadge,
	getPlanBadge,
} from "../../../utils/subscriptionHelpers";
import { adminService } from "../../../services/adminService";

const SubscriptionDetailsModal = ({ subscription, onClose, onUpdate }) => {
	if (!subscription) return null;

	const handleStatusUpdate = async (newStatus, newPaymentStatus) => {
		try {
			await adminService.updateSubscriptionStatus(subscription._id, {
				status: newStatus,
				paymentStatus: newPaymentStatus,
			});
			onUpdate();
			onClose();
		} catch (error) {
			console.error("Erreur lors de la mise à jour:", error);
			alert("Erreur lors de la mise à jour du statut");
		}
	};

	const isExpired = new Date(subscription.endDate) < new Date();
	const statusBadge = getStatusBadge(
		isExpired ? "expired" : subscription.status
	);
	const paymentBadge = getPaymentStatusBadge(subscription.paymentStatus);
	const planBadge = getPlanBadge(subscription.planId);
	const StatusIcon = statusBadge.Icon;

	return (
		<div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-8 animate-fade-in">
			<div
				className="absolute inset-0 bg-gray-900/95 backdrop-blur-2xl transition-opacity"
				onClick={onClose}
			></div>

			<div className="relative w-full max-w-2xl bg-white rounded-[2.5rem] overflow-hidden shadow-2xl animate-scale-in">
				{/* Modal Header */}
				<div className="p-8 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
					<div>
						<div className="flex items-center gap-3 mb-2">
							<div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-200">
								<CreditCard className="h-6 w-6" />
							</div>
							<h3 className="text-2xl font-[1000] text-gray-900 tracking-tighter uppercase">
								Détails Abonnement
							</h3>
						</div>
						<p className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">
							ID: {subscription._id}
						</p>
					</div>
					<button
						onClick={onClose}
						className="p-3 bg-white text-gray-400 hover:text-rose-600 rounded-2xl transition-all shadow-sm border border-gray-100 hover:border-rose-100 hover:bg-rose-50"
					>
						<XCircle className="h-6 w-6" />
					</button>
				</div>

				<div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{/* User Info Card */}
						<div className="md:col-span-2 p-6 bg-gray-50 rounded-[2rem] border border-gray-100 flex items-center gap-5">
							<div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl font-black shadow-inner">
								{subscription.user?.firstName?.charAt(0)}
							</div>
							<div>
								<p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
									Abonné
								</p>
								<h4 className="text-xl font-[1000] text-gray-900 tracking-tight leading-none">
									{subscription.user?.firstName} {subscription.user?.lastName}
								</h4>
								<p className="text-sm font-medium text-gray-500 mt-1">
									{subscription.user?.email}
								</p>
							</div>
						</div>

						{/* Plan & Pricing */}
						<div className="p-6 bg-white border border-gray-100 rounded-[2rem] hover:shadow-lg transition-shadow">
							<p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
								Plan & Tarif
							</p>
							<div className="flex items-baseline gap-1 mb-2">
								<span className="text-3xl font-[1000] text-gray-900 tracking-tighter">
									{formatPrice(subscription.amount)}
								</span>
								<span className="text-xs font-bold text-gray-400">
									{subscription.currency}
								</span>
							</div>
							<div className="flex items-center gap-2">
								<span
									className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${planBadge.color
										.replace("text-", "border-")
										.replace("bg-", "bg-opacity-10 ")}`}
								>
									{planBadge.label}
								</span>
								<span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">
									{subscription.billingPeriod === "monthly"
										? "MENSUEL"
										: "ANNUEL"}
								</span>
							</div>
						</div>

						{/* Status & Payment */}
						<div className="p-6 bg-white border border-gray-100 rounded-[2rem] hover:shadow-lg transition-shadow">
							<p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
								Statut & Paiement
							</p>
							<div className="space-y-3">
								<div
									className={`flex items-center gap-3 px-3 py-2 rounded-xl border ${
										isExpired
											? "bg-gray-50 border-gray-200"
											: "bg-emerald-50 border-emerald-100"
									}`}
								>
									<StatusIcon
										className={`w-5 h-5 ${
											isExpired ? "text-gray-500" : "text-emerald-600"
										}`}
									/>
									<div>
										<p
											className={`text-xs font-black uppercase tracking-wide ${
												isExpired ? "text-gray-600" : "text-emerald-700"
											}`}
										>
											{statusBadge.label}
										</p>
									</div>
								</div>
								<div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl">
									{subscription.paymentMethod === "cash" ? (
										<Banknote className="w-4 h-4 text-gray-400" />
									) : (
										<CreditCard className="w-4 h-4 text-blue-500" />
									)}
									<span className="text-xs font-bold text-gray-600">
										{paymentBadge.label}
									</span>
								</div>
							</div>
						</div>

						{/* Dates Timeline */}
						<div className="md:col-span-2 p-6 bg-gray-900 text-white rounded-[2rem] relative overflow-hidden">
							<div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
							<div className="relative z-10 grid grid-cols-2 gap-8">
								<div>
									<p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">
										Début
									</p>
									<p className="text-lg font-bold">
										{formatDate(subscription.startDate)}
									</p>
								</div>
								<div>
									<p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">
										Fin (Expiration)
									</p>
									<p className="text-lg font-bold">
										{formatDate(subscription.endDate)}
									</p>
								</div>
							</div>
							{subscription.nextBillingDate && (
								<div className="mt-6 pt-6 border-t border-white/10 flex items-center gap-3">
									<div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
									<p className="text-xs font-medium text-gray-400">
										Prochaine facturation prévue le{" "}
										<span className="text-white font-bold">
											{formatDate(subscription.nextBillingDate)}
										</span>
									</p>
								</div>
							)}
						</div>
					</div>

					{/* Admin Actions */}
					<div className="mt-8 pt-8 border-t border-gray-100">
						<p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">
							Actions Administrateur
						</p>
						<div className="flex flex-wrap gap-3">
							{subscription.status === "pending" && (
								<button
									onClick={() => handleStatusUpdate("active", "completed")}
									className="flex-1 px-6 py-4 bg-emerald-500 text-white rounded-2xl hover:bg-emerald-600 font-bold text-sm transition-all shadow-lg shadow-emerald-200 transform hover:-translate-y-1"
								>
									✅ Activer
								</button>
							)}
							{subscription.status === "active" && (
								<button
									onClick={() =>
										handleStatusUpdate("suspended", subscription.paymentStatus)
									}
									className="flex-1 px-6 py-4 bg-amber-500 text-white rounded-2xl hover:bg-amber-600 font-bold text-sm transition-all shadow-lg shadow-amber-200 transform hover:-translate-y-1"
								>
									⏸️ Suspendre
								</button>
							)}
							{subscription.status === "suspended" && (
								<button
									onClick={() =>
										handleStatusUpdate("active", subscription.paymentStatus)
									}
									className="flex-1 px-6 py-4 bg-emerald-500 text-white rounded-2xl hover:bg-emerald-600 font-bold text-sm transition-all shadow-lg shadow-emerald-200 transform hover:-translate-y-1"
								>
									▶️ Réactiver
								</button>
							)}
							{subscription.paymentStatus === "pending" && (
								<button
									onClick={() =>
										handleStatusUpdate(subscription.status, "completed")
									}
									className="flex-1 px-6 py-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 font-bold text-sm transition-all shadow-lg shadow-blue-200 transform hover:-translate-y-1"
								>
									💰 Marquer payé
								</button>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default SubscriptionDetailsModal;
