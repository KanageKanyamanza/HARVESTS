import React from "react";
import { Search } from "lucide-react";

const SubscriptionFilters = ({
	searchTerm,
	onSearchChange,
	statusFilter,
	onStatusFilterChange,
	planFilter,
	onPlanFilterChange,
	paymentStatusFilter,
	onPaymentStatusFilterChange,
	onFilterChange,
}) => {
	const handleSearchChange = (e) => {
		onSearchChange(e.target.value);
		onFilterChange();
	};

	const handleStatusChange = (e) => {
		onStatusFilterChange(e.target.value);
		onFilterChange();
	};

	const handlePlanChange = (e) => {
		onPlanFilterChange(e.target.value);
		onFilterChange();
	};

	const handlePaymentStatusChange = (e) => {
		onPaymentStatusFilterChange(e.target.value);
		onFilterChange();
	};

	return (
		<div className="backdrop-blur-xl bg-white/70 border border-white/60 shadow-sm rounded-xl p-3 mb-4 relative overflow-hidden transition-all">
			{/* Decorative background element */}
			<div className="absolute top-0 right-0 w-48 h-48 bg-emerald-50 rounded-full blur-[60px] -z-10 opacity-60"></div>

			<div className="grid grid-cols-1 md:grid-cols-12 gap-3">
				<div className="md:col-span-12 lg:col-span-5 relative group">
					<Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-emerald-500 transition-colors duration-300" />
					<input
						type="text"
						placeholder="Rechercher par nom ou email..."
						value={searchTerm}
						onChange={handleSearchChange}
						className="w-full pl-10 pr-4 py-2 bg-white/50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all duration-300 outline-none hover:border-emerald-200 font-bold text-gray-700 placeholder-gray-400 shadow-sm text-sm"
					/>
				</div>

				<div className="md:col-span-4 lg:col-span-2 relative group">
					<select
						value={statusFilter}
						onChange={handleStatusChange}
						className="w-full h-full px-4 py-2 bg-white/50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all duration-300 outline-none cursor-pointer appearance-none font-bold text-gray-700 hover:border-emerald-200 shadow-sm text-xs"
					>
						<option value="">Tous statuts</option>
						<option value="active">🟢 Actif</option>
						<option value="pending">⏳ En attente</option>
						<option value="cancelled">🔴 Annulé</option>
						<option value="expired">🕰️ Expiré</option>
						<option value="suspended">⛔ Suspendu</option>
					</select>
					<div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none group-hover:translate-x-1 transition-transform">
						<svg
							className="w-3.5 h-3.5 text-emerald-500"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2.5"
								d="M19 9l-7 7-7-7"
							></path>
						</svg>
					</div>
				</div>

				<div className="md:col-span-4 lg:col-span-2 relative group">
					<select
						value={planFilter}
						onChange={handlePlanChange}
						className="w-full h-full px-4 py-2 bg-white/50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all duration-300 outline-none cursor-pointer appearance-none font-bold text-gray-700 hover:border-emerald-200 shadow-sm text-xs"
					>
						<option value="">Tous plans</option>
						<option value="gratuit">🌱 Gratuit</option>
						<option value="standard">🌾 Standard</option>
						<option value="premium">🚜 Premium</option>
					</select>
					<div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none group-hover:translate-x-1 transition-transform">
						<svg
							className="w-3.5 h-3.5 text-emerald-500"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2.5"
								d="M19 9l-7 7-7-7"
							></path>
						</svg>
					</div>
				</div>

				<div className="md:col-span-4 lg:col-span-3 relative group">
					<select
						value={paymentStatusFilter}
						onChange={handlePaymentStatusChange}
						className="w-full h-full px-4 py-2 bg-white/50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all duration-300 outline-none cursor-pointer appearance-none font-bold text-gray-700 hover:border-emerald-200 shadow-sm text-xs"
					>
						<option value="">Tous paiements</option>
						<option value="completed">✅ Payé</option>
						<option value="pending">🕒 En attente</option>
						<option value="failed">❌ Échoué</option>
					</select>
					<div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none group-hover:translate-x-1 transition-transform">
						<svg
							className="w-3.5 h-3.5 text-emerald-500"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2.5"
								d="M19 9l-7 7-7-7"
							></path>
						</svg>
					</div>
				</div>
			</div>
		</div>
	);
};

export default SubscriptionFilters;
