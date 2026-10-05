import React, { useState } from "react";
import CardGridSkeleton from "../../components/common/CardGridSkeleton";
import SubscriptionStats from "../../components/admin/subscriptions/SubscriptionStats";
import SubscriptionFilters from "../../components/admin/subscriptions/SubscriptionFilters";
import SubscriptionTable from "../../components/admin/subscriptions/SubscriptionTable";
import SubscriptionDetailsModal from "../../components/admin/subscriptions/SubscriptionDetailsModal";
import SubscriptionPagination from "../../components/admin/subscriptions/SubscriptionPagination";
import { useAdminSubscriptions } from "../../hooks/useAdminSubscriptions";

const AdminSubscriptions = () => {
	const [selectedSubscription, setSelectedSubscription] = useState(null);
	const [showDetailsModal, setShowDetailsModal] = useState(false);

	const {
		subscriptions,
		filteredSubscriptions,
		stats,
		loading,
		searchTerm,
		setSearchTerm,
		statusFilter,
		setStatusFilter,
		planFilter,
		setPlanFilter,
		paymentStatusFilter,
		setPaymentStatusFilter,
		currentPage,
		setCurrentPage,
		totalPages,
		totalItems,
		loadSubscriptions,
	} = useAdminSubscriptions();

	const handleViewDetails = (subscription) => {
		setSelectedSubscription(subscription);
		setShowDetailsModal(true);
	};

	const handleFilterChange = () => {
		setCurrentPage(1);
	};


	return (
		<div className="dashboard-page">
			{/* Background radial glows */}
			<div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden ">
				<div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-100/30 rounded-full blur-[120px]"></div>
				<div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100/20 rounded-full blur-[100px]"></div>
			</div>

			<div className="dashboard-container">
				{/* Header */}
				<div className="mb-8 animate-fade-in-down">
					<div className="flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-[0.2em] mb-1.5">
						<div className="w-6 h-[2px] bg-emerald-600"></div>
						<span>Revenue Pipeline</span>
					</div>
					<h1 className="text-2xl md:text-3xl font-[1000] text-gray-900 tracking-tighter leading-none mb-1.5">
						Abonnements <span className="text-emerald-600">& Plans</span>
					</h1>
					<p className="text-xs text-gray-500 font-medium">
						Supervisez les flux de revenus et les engagements utilisateurs
						Harvests
					</p>
				</div>

				{/* Statistiques */}
				<SubscriptionStats stats={stats} />

				{/* Filtres et recherche */}
				<SubscriptionFilters
					searchTerm={searchTerm}
					onSearchChange={setSearchTerm}
					statusFilter={statusFilter}
					onStatusFilterChange={setStatusFilter}
					planFilter={planFilter}
					onPlanFilterChange={setPlanFilter}
					paymentStatusFilter={paymentStatusFilter}
					onPaymentStatusFilterChange={setPaymentStatusFilter}
					onFilterChange={handleFilterChange}
				/>

				{/* Tableau des souscriptions */}
				{loading && !subscriptions.length ? (
					<CardGridSkeleton count={5} variant="row" className="space-y-3" />
				) : (
					<SubscriptionTable
						subscriptions={filteredSubscriptions}
						onViewDetails={handleViewDetails}
					/>
				)}

				{/* Pagination */}
				<SubscriptionPagination
					currentPage={currentPage}
					totalPages={totalPages}
					totalItems={totalItems}
					onPageChange={setCurrentPage}
				/>

				{/* Modal de détails */}
				{showDetailsModal && (
					<SubscriptionDetailsModal
						subscription={selectedSubscription}
						onClose={() => setShowDetailsModal(false)}
						onUpdate={loadSubscriptions}
					/>
				)}
			</div>
		</div>
	);
};

export default AdminSubscriptions;
