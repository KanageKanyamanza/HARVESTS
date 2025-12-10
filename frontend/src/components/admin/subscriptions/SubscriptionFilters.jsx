import React from 'react';
import { Search } from 'lucide-react';

const SubscriptionFilters = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  planFilter,
  onPlanFilterChange,
  paymentStatusFilter,
  onPaymentStatusFilterChange,
  onFilterChange
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
    <div className="bg-white rounded-lg shadow mb-6 p-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher par nom ou email..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        <select
          value={statusFilter}
          onChange={handleStatusChange}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="">Tous les statuts</option>
          <option value="active">Actif</option>
          <option value="pending">En attente</option>
          <option value="cancelled">Annulé</option>
          <option value="expired">Expiré</option>
          <option value="suspended">Suspendu</option>
        </select>
        <select
          value={planFilter}
          onChange={handlePlanChange}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="">Tous les plans</option>
          <option value="gratuit">Gratuit</option>
          <option value="standard">Standard</option>
          <option value="premium">Premium</option>
        </select>
        <select
          value={paymentStatusFilter}
          onChange={handlePaymentStatusChange}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="">Tous les paiements</option>
          <option value="completed">Payé</option>
          <option value="pending">En attente</option>
          <option value="failed">Échoué</option>
        </select>
      </div>
    </div>
  );
};

export default SubscriptionFilters;

