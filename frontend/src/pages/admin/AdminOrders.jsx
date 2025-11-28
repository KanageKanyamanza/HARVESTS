import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AdminOrdersTable from '../../components/admin/AdminOrdersTable';
import TransporterAssignModal from '../../components/admin/TransporterAssignModal';

const AdminOrders = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [confirmingPayment, setConfirmingPayment] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [availableTransporters, setAvailableTransporters] = useState([]);
  const [loadingTransporters, setLoadingTransporters] = useState(false);
  const [assigning, setAssigning] = useState(false);

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminService.getOrders({ page: currentPage, limit: 10, status: statusFilter, search: searchTerm });
      
      if (response.status === 'success' && response.data?.orders) {
        setOrders(response.data.orders);
        setTotalPages(response.data.pagination?.totalPages || 1);
        setTotalOrders(response.data.pagination?.totalOrders || response.data.orders.length);
      } else if (response.data?.orders) {
        setOrders(response.data.orders);
        setTotalPages(response.data.pagination?.totalPages || 1);
        setTotalOrders(response.data.pagination?.totalOrders || response.data.orders.length);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error('Erreur:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, searchTerm]);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  const handleConfirmPayment = async (orderId) => {
    if (!window.confirm('Confirmer ce paiement ?')) return;
    try {
      setConfirmingPayment(orderId);
      await adminService.updatePaymentStatus(orderId, { paymentStatus: 'completed', paidAt: new Date().toISOString() });
      loadOrders();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la confirmation');
    } finally {
      setConfirmingPayment(null);
    }
  };

  const handleOpenAssignModal = async (order) => {
    setSelectedOrder(order);
    setShowAssignModal(true);
    setLoadingTransporters(true);
    try {
      const response = await adminService.getAvailableTransporters(order._id);
      setAvailableTransporters(response.status === 'success' && response.data ? response.data.transporters || [] : []);
    } catch { setAvailableTransporters([]); }
    finally { setLoadingTransporters(false); }
  };

  const handleAssignTransporter = async (transporterId) => {
    if (!selectedOrder) return;
    setAssigning(true);
    try {
      await adminService.assignTransporterToOrder(selectedOrder._id, transporterId);
      setShowAssignModal(false);
      setSelectedOrder(null);
      loadOrders();
    } catch (error) {
      alert(error.response?.data?.message || 'Erreur');
    } finally {
      setAssigning(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><LoadingSpinner size="lg" /></div>;

  return (
      <div className="space-y-6">
        {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestion des commandes</h1>
        <p className="mt-1 text-sm text-gray-500">Gérez les commandes et résolvez les litiges</p>
        </div>

      {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
            <label className="block text-sm font-medium text-gray-700">Rechercher</label>
            <input type="text" placeholder="Rechercher..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm" />
            </div>
            <div>
            <label className="block text-sm font-medium text-gray-700">Statut</label>
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm">
                <option value="">Tous les statuts</option>
                <option value="pending">En attente</option>
              <option value="confirmed">Confirmée</option>
                <option value="processing">En cours</option>
              <option value="shipped">Expédiée</option>
              <option value="delivered">Livrée</option>
              <option value="cancelled">Annulée</option>
              </select>
            </div>
          </div>
        </div>

      {/* Stats */}
      <div className="text-sm text-gray-600">{totalOrders} commande(s) trouvée(s)</div>

      {/* Table */}
      <AdminOrdersTable orders={orders} onConfirmPayment={handleConfirmPayment} onOpenAssignModal={handleOpenAssignModal} confirmingPayment={confirmingPayment} />

        {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          <button onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); setSearchParams({ page: Math.max(1, currentPage - 1).toString() }); }} disabled={currentPage === 1} className="px-4 py-2 border rounded-md disabled:opacity-50">Précédent</button>
          <span className="px-4 py-2">Page {currentPage} / {totalPages}</span>
          <button onClick={() => { setCurrentPage(p => Math.min(totalPages, p + 1)); setSearchParams({ page: Math.min(totalPages, currentPage + 1).toString() }); }} disabled={currentPage === totalPages} className="px-4 py-2 border rounded-md disabled:opacity-50">Suivant</button>
        </div>
      )}

      {/* Modal */}
      <TransporterAssignModal show={showAssignModal} order={selectedOrder} transporters={availableTransporters} loading={loadingTransporters} assigning={assigning} onAssign={handleAssignTransporter} onClose={() => { setShowAssignModal(false); setSelectedOrder(null); }} />
    </div>
  );
};

export default AdminOrders;
