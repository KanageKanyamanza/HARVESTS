import React from 'react';
import { FiTruck, FiCheckCircle, FiXCircle } from 'react-icons/fi';

const OrderActions = ({
  displayedStatus, order, updating,
  cancelOrder, prepareOrder, readyOrder, deliverOrder, completeOrder, updateOrderStatus,
  isSellerView, isTransporterView, isAdmin, isBuyerView
}) => {
  return (
    <div className="flex flex-col space-y-3 w-full">
      {/* SELLER ACTIONS */}
      {isSellerView && (
        <>
          {displayedStatus === 'pending' && (
            <ActionButton onClick={cancelOrder} disabled={updating} color="red" icon={FiXCircle} text="Annuler" />
          )}
          {displayedStatus === 'confirmed' && (
            <ActionButton onClick={prepareOrder} disabled={updating} color="blue" icon={FiTruck} text={updating ? 'Préparation...' : 'Commencer préparation'} />
          )}
          {displayedStatus === 'preparing' && (
            <ActionButton onClick={readyOrder} disabled={updating} color="blue" icon={FiTruck} text={updating ? 'Préparation...' : 'Prête pour collecte'} />
          )}
          {displayedStatus === 'ready-for-pickup' && (
            <>
              <ActionButton onClick={deliverOrder} disabled={updating} color="green" icon={FiCheckCircle} text={updating ? 'Envoi...' : 'Marquer comme livrée'} />
              <ActionButton onClick={cancelOrder} disabled={updating} color="red" icon={FiXCircle} text="Annuler" />
            </>
          )}
        </>
      )}
      
      {/* BUYER ACTIONS */}
      {isBuyerView && (
        <>
          {(displayedStatus === 'ready-for-pickup' || displayedStatus === 'in-transit') && (
            <ActionButton onClick={deliverOrder} disabled={updating} color="blue" icon={FiCheckCircle} text={updating ? 'Validation...' : 'Confirmer la réception'} />
          )}
          {displayedStatus === 'delivered' && (
            <ActionButton onClick={completeOrder} disabled={updating} color="green" icon={FiCheckCircle} text={updating ? 'Validation...' : 'Marquer terminée'} />
          )}
        </>
      )}
      
      {/* TRANSPORTER ACTIONS */}
      {isTransporterView && (
        <>
          {displayedStatus === 'ready-for-pickup' && (
            <ActionButton onClick={() => updateOrderStatus('ready-for-pickup')} disabled={updating} color="orange" icon={FiTruck} text={updating ? 'Collecte...' : 'Marquer collectée'} />
          )}
          {order.delivery?.status === 'picked-up' && displayedStatus !== 'in-transit' && displayedStatus !== 'delivered' && (
            <ActionButton onClick={() => updateOrderStatus('in-transit')} disabled={updating} color="blue" icon={FiTruck} text={updating ? 'En cours...' : 'Marquer en transit'} />
          )}
          {displayedStatus === 'in-transit' && (
            <ActionButton onClick={deliverOrder} disabled={updating} color="green" icon={FiCheckCircle} text={updating ? 'Livraison...' : 'Marquer livrée'} />
          )}
        </>
      )}

      {/* ADMIN ACTIONS */}
      {isAdmin && !isTransporterView && displayedStatus === 'in-transit' && (
        <ActionButton onClick={deliverOrder} disabled={updating} color="green" icon={FiCheckCircle} text={updating ? 'Confirmation...' : 'Confirmer la livraison'} />
      )}
    </div>
  );
};

const ActionButton = (props) => {
  const { onClick, disabled, color, icon: Icon, text } = props;
  const colors = {
    red: 'bg-red-600 hover:bg-red-700 shadow-red-900/20',
    blue: 'bg-blue-600 hover:bg-blue-700 shadow-blue-900/20',
    green: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-900/20',
    orange: 'bg-orange-600 hover:bg-orange-700 shadow-orange-900/20'
  };
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center w-full px-4 py-3 border border-transparent rounded-[1.25rem] text-xs font-black uppercase tracking-widest text-white shadow-lg transition-all duration-300 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${colors[color]}`}
    >
      {Icon && <Icon className="h-4 w-4 mr-2" />}
      {text}
    </button>
  );
};

export default OrderActions;
