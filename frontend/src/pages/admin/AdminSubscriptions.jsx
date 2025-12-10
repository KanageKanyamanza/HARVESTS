import React, { useState } from 'react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import SubscriptionStats from '../../components/admin/subscriptions/SubscriptionStats';
import SubscriptionFilters from '../../components/admin/subscriptions/SubscriptionFilters';
import SubscriptionTable from '../../components/admin/subscriptions/SubscriptionTable';
import SubscriptionDetailsModal from '../../components/admin/subscriptions/SubscriptionDetailsModal';
import SubscriptionPagination from '../../components/admin/subscriptions/SubscriptionPagination';
import { useAdminSubscriptions } from '../../hooks/useAdminSubscriptions';

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
    loadSubscriptions
  } = useAdminSubscriptions();

  const handleViewDetails = (subscription) => {
    setSelectedSubscription(subscription);
    setShowDetailsModal(true);
  };

  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  if (loading && !subscriptions.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Chargement des souscriptions..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 overflow-x-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gestion des souscriptions</h1>
          <p className="mt-2 text-gray-600">
            Gérez les abonnements et plans des utilisateurs
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
        <SubscriptionTable
          subscriptions={filteredSubscriptions}
          onViewDetails={handleViewDetails}
        />

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

