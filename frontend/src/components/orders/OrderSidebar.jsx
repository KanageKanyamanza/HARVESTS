import React from 'react';
import { FiUser, FiPhone, FiMapPin, FiTruck, FiCalendar, FiMail } from 'react-icons/fi';

const formatDate = (dateString) => new Date(dateString).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
const formatCurrency = (amount) => amount?.toLocaleString('fr-FR') || '0';

const deliveryMethodLabels = {
  pickup: 'Retrait sur place',
  'standard-delivery': 'Livraison standard',
  'express-delivery': 'Livraison express',
  'same-day': 'Livraison jour même',
  'scheduled': 'Livraison programmée'
};

export const DeliveryAddressCard = ({ order, user }) => {
  const isProducerView = user?.userType === 'producer' || user?.userType === 'transformer';
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">{isProducerView ? 'Informations client' : 'Adresse de livraison'}</h3>
      {isProducerView ? (
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <FiUser className="h-5 w-5 text-gray-400 mt-1" />
            <div>
              <p className="font-medium text-gray-900">{order.buyer?.firstName} {order.buyer?.lastName}</p>
              <p className="text-sm text-gray-500">{order.buyer?.email}</p>
            </div>
          </div>
          {order.buyer?.phone && (
            <div className="flex items-center space-x-3"><FiPhone className="h-5 w-5 text-gray-400" /><p className="text-gray-900">{order.buyer.phone}</p></div>
          )}
          {order.delivery?.deliveryAddress && <AddressDisplay address={order.delivery.deliveryAddress} />}
        </div>
      ) : order.delivery?.deliveryAddress ? (
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <FiUser className="h-5 w-5 text-gray-400 mt-1" />
            <div>
              <p className="font-medium text-gray-900">{order.delivery.deliveryAddress.firstName} {order.delivery.deliveryAddress.lastName}</p>
              {order.delivery.deliveryAddress.label && <p className="text-sm text-gray-500">{order.delivery.deliveryAddress.label}</p>}
            </div>
          </div>
          <AddressDisplay address={order.delivery.deliveryAddress} />
          {order.delivery.deliveryAddress.phone && (
            <div className="flex items-center space-x-3"><FiPhone className="h-5 w-5 text-gray-400" /><p className="text-gray-900">{order.delivery.deliveryAddress.phone}</p></div>
          )}
          {order.delivery.deliveryAddress.deliveryInstructions && (
            <div className="mt-3 p-3 bg-harvests-light rounded-md"><p className="text-sm text-gray-600"><strong>Instructions:</strong> {order.delivery.deliveryAddress.deliveryInstructions}</p></div>
          )}
        </div>
      ) : (
        <p className="text-gray-500 italic">Adresse de livraison non disponible</p>
      )}
    </div>
  );
};

const AddressDisplay = ({ address }) => (
  <div className="flex items-start space-x-3">
    <FiMapPin className="h-5 w-5 text-gray-400 mt-1" />
    <div>
      <p className="text-gray-900">{address.street}</p>
      <p className="text-gray-900">{address.city}, {address.region}</p>
      <p className="text-gray-900">{address.country} {address.postalCode}</p>
    </div>
  </div>
);

export const OrderSummaryCard = ({ order, isSellerView, deliveryFee, deliveryDetail }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <h3 className="text-lg font-medium text-gray-900 mb-4">Résumé de la commande</h3>
    <div className="space-y-3">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">Sous-total</span>
        <span className="text-gray-900">{formatCurrency(isSellerView ? (order.segment?.subtotal ?? order.subtotal ?? 0) : (order.subtotal ?? order.originalTotals?.subtotal ?? (order.total - deliveryFee + (order.couponDiscount || 0))))} FCFA</span>
      </div>
      
      {((!isSellerView && deliveryFee > 0) || (isSellerView && (order.segment?.deliveryFee ?? 0) > 0)) && (
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Frais de livraison</span>
          <span className="text-gray-900">{formatCurrency(isSellerView ? (order.segment?.deliveryFee ?? 0) : deliveryFee)} FCFA</span>
        </div>
      )}
      {deliveryFee > 0 && !isSellerView && deliveryDetail?.reason && <p className="text-xs text-gray-500 text-right">{deliveryDetail.reason}</p>}
      
      {(order.couponDiscount > 0 || (isSellerView && order.segment?.discount > 0)) && (
        <div className="flex justify-between text-sm text-green-600">
          <span>Réduction</span>
          <span>-{formatCurrency(isSellerView ? (order.segment?.discount ?? 0) : (order.couponDiscount ?? 0))} FCFA</span>
        </div>
      )}
      
      <div className="border-t border-gray-200 pt-3">
        <div className="flex justify-between">
          <span className="text-lg font-medium text-gray-900">Total</span>
          <span className="text-lg font-medium text-gray-900">{formatCurrency(isSellerView ? (order.segment?.total ?? order.segment?.subtotal ?? order.subtotal ?? 0) : (order.total ?? 0))} FCFA</span>
        </div>
      </div>
    </div>
  </div>
);

export const DeliveryInfoCard = ({ order }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <h3 className="text-lg font-medium text-gray-900 mb-4">Informations de livraison</h3>
    <div className="space-y-3">
      <div className="flex items-center space-x-3">
        <FiTruck className="h-5 w-5 text-gray-400" />
        <div>
          <p className="text-sm font-medium text-gray-900">{deliveryMethodLabels[order.delivery?.method] || 'Mode de livraison'}</p>
          <p className="text-sm text-gray-500">Statut: {order.delivery?.status || 'En attente'}</p>
        </div>
      </div>
      {order.delivery?.estimatedDeliveryDate && (
        <div className="flex items-center space-x-3">
          <FiCalendar className="h-5 w-5 text-gray-400" />
          <div>
            <p className="text-sm font-medium text-gray-900">Date de livraison prévue</p>
            <p className="text-sm text-gray-500">{formatDate(order.delivery.estimatedDeliveryDate)}</p>
          </div>
        </div>
      )}
    </div>
  </div>
);

export const TransporterCard = ({ order }) => {
  if (!order.delivery?.transporter) return null;
  
  return (
    <div className="bg-white rounded-lg shadow p-6 mt-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center"><FiTruck className="h-5 w-5 mr-2 text-blue-600" />Livreur assigné</h3>
      <div className="space-y-3">
        <div className="flex items-start space-x-3">
          <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0"><FiTruck className="h-6 w-6 text-blue-600" /></div>
          <div className="flex-1">
            <p className="font-medium text-gray-900">{order.delivery.transporter?.companyName || `${order.delivery.transporter?.firstName || ''} ${order.delivery.transporter?.lastName || ''}`.trim() || 'Livreur'}</p>
            {order.delivery.transporter?.userType && (
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${order.delivery.transporter.userType === 'exporter' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                {order.delivery.transporter.userType === 'exporter' ? 'Exportateur' : 'Transporteur'}
              </span>
            )}
          </div>
        </div>
        {order.delivery.transporter?.email && <div className="flex items-center space-x-3 ml-14"><FiMail className="h-4 w-4 text-gray-400" /><p className="text-sm text-gray-700">{order.delivery.transporter.email}</p></div>}
        {order.delivery.transporter?.phone && <div className="flex items-center space-x-3 ml-14"><FiPhone className="h-4 w-4 text-gray-400" /><p className="text-sm text-gray-700">{order.delivery.transporter.phone}</p></div>}
        
        {order.delivery?.timeline?.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-3">Historique de livraison:</p>
            <div className="space-y-2">
              {order.delivery.timeline.map((event, idx) => (
                <div key={idx} className="flex items-start text-sm">
                  <div className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-500 mt-1.5 mr-3"></div>
                  <div className="flex-1">
                    <p className="text-gray-700 font-medium">{event.status === 'picked-up' ? 'Collectée' : event.status === 'in-transit' ? 'En transit' : event.status === 'delivered' ? 'Livrée' : event.status}</p>
                    <p className="text-gray-500 text-xs">{formatDate(event.timestamp)}{event.location && ` • ${event.location}`}</p>
                    {event.note && <p className="text-gray-400 italic text-xs mt-1">{event.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

