import React from 'react';
import { FiTruck, FiCheckCircle, FiXCircle, FiRefreshCw } from 'react-icons/fi';

const OrderActions = ({
  displayedStatus, order, user, updating,
  cancelOrder, prepareOrder, readyOrder, deliverOrder, completeOrder, updateOrderStatus,
  isSellerView, isTransporterView, isAdmin, isBuyerView
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 space-y-2 sm:space-y-0">
      {isSellerView && displayedStatus === 'pending' && (
        <ActionButton onClick={cancelOrder} disabled={updating} color="red" icon={FiXCircle} text="Annuler" />
      )}
      {isSellerView && displayedStatus === 'confirmed' && (
        <ActionButton onClick={prepareOrder} disabled={updating} color="blue" icon={FiTruck} text={updating ? 'Préparation...' : 'Commencer préparation'} />
      )}
      {isSellerView && displayedStatus === 'preparing' && (
        <ActionButton onClick={readyOrder} disabled={updating} color="blue" icon={FiTruck} text={updating ? 'Préparation...' : 'Prête pour collecte'} />
      )}
      {isSellerView && displayedStatus === 'ready-for-pickup' && (
        <ActionButton onClick={cancelOrder} disabled={updating} color="red" icon={FiXCircle} text="Annuler" />
      )}
      
      {isTransporterView && displayedStatus === 'ready-for-pickup' && (
        <ActionButton onClick={() => updateOrderStatus('ready-for-pickup')} disabled={updating} color="orange" icon={FiTruck} text={updating ? 'Collecte...' : 'Marquer collectée'} />
      )}
      {isTransporterView && (order.delivery?.status === 'picked-up') && displayedStatus !== 'in-transit' && displayedStatus !== 'delivered' && (
        <ActionButton onClick={() => updateOrderStatus('in-transit')} disabled={updating} color="blue" icon={FiTruck} text={updating ? 'En cours...' : 'Marquer en transit'} />
      )}
      {isTransporterView && displayedStatus === 'in-transit' && (
        <ActionButton onClick={deliverOrder} disabled={updating} color="green" icon={FiCheckCircle} text={updating ? 'Livraison...' : 'Marquer livrée'} />
      )}
      {isAdmin && displayedStatus === 'in-transit' && !isTransporterView && (
        <ActionButton onClick={deliverOrder} disabled={updating} color="green" icon={FiCheckCircle} text={updating ? 'Confirmation...' : 'Confirmer la livraison'} />
      )}
      {isBuyerView && displayedStatus === 'delivered' && (
        <ActionButton onClick={completeOrder} disabled={updating} color="green" icon={FiCheckCircle} text={updating ? 'Validation...' : 'Marquer terminée'} />
      )}
    </div>
  );
};

const ActionButton = ({ onClick, disabled, color, icon: Icon, text }) => {
  const colors = {
    red: 'bg-red-600 hover:bg-red-700',
    blue: 'bg-blue-600 hover:bg-blue-700',
    green: 'bg-green-600 hover:bg-green-700',
    orange: 'bg-orange-600 hover:bg-orange-700'
  };
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white ${colors[color]} disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      <Icon className="h-4 w-4 mr-1" />
      {text}
    </button>
  );
};

export default OrderActions;

