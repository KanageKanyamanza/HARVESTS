import React from 'react';
import { X, Truck, Loader, User } from 'lucide-react';

const TransporterAssignModal = ({ show, order, transporters, loading, assigning, onAssign, onClose }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Truck className="h-5 w-5 mr-2" />Assigner un transporteur
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
        </div>

        {order && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-900">Commande #{order.orderNumber || order._id.slice(-8).toUpperCase()}</p>
            <p className="text-xs text-gray-500">{order.delivery?.deliveryAddress?.city}, {order.delivery?.deliveryAddress?.region}</p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader className="h-8 w-8 text-green-600 animate-spin" />
          </div>
        ) : transporters.length === 0 ? (
          <div className="text-center py-8">
            <Truck className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">Aucun transporteur disponible</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {transporters.map((transporter) => (
              <button
                key={transporter._id}
                onClick={() => onAssign(transporter._id)}
                disabled={assigning}
                className="w-full p-3 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center justify-between disabled:opacity-50"
              >
                <div className="flex items-center">
                  <User className="h-8 w-8 text-gray-400 mr-3" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900">{transporter.companyName || `${transporter.firstName} ${transporter.lastName}`}</p>
                    <p className="text-xs text-gray-500">{transporter.fleet?.length || 0} véhicule(s)</p>
                  </div>
                </div>
                {assigning && <Loader className="h-4 w-4 text-green-600 animate-spin" />}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TransporterAssignModal;

