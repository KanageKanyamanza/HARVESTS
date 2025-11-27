import React, { useState, useEffect, useRef } from 'react';
import { FiPackage } from 'react-icons/fi';
import OrderListItem from './OrderListItem';

const OrderList = ({ orders = [], userType = 'consumer', onUpdateStatus, loading = false, updatingOrders = new Set() }) => {
  const initializedOrderIds = useRef(new Set());
  const [collapsedOrders, setCollapsedOrders] = useState(() => {
    const initialCollapsed = new Set();
    orders.forEach(order => {
      if (order?._id) {
        initialCollapsed.add(order._id);
        initializedOrderIds.current.add(order._id);
      }
    });
    return initialCollapsed;
  });

  useEffect(() => {
    setCollapsedOrders(prev => {
      const newSet = new Set(prev);
      orders.forEach(order => {
        if (order?._id && !initializedOrderIds.current.has(order._id)) {
          newSet.add(order._id);
          initializedOrderIds.current.add(order._id);
        }
      });
      const orderIds = new Set(orders.map(o => o?._id).filter(Boolean));
      newSet.forEach(orderId => {
        if (!orderIds.has(orderId)) {
          newSet.delete(orderId);
          initializedOrderIds.current.delete(orderId);
        }
      });
      return newSet;
    });
  }, [orders]);

  const toggleCollapse = (orderId) => {
    setCollapsedOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) newSet.delete(orderId);
      else newSet.add(orderId);
      return newSet;
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-3">{[1, 2, 3].map(j => <div key={j} className="h-4 bg-gray-200 rounded"></div>)}</div>
          </div>
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <FiPackage className="mx-auto h-16 w-16 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">
          {['producer', 'transformer'].includes(userType) ? 'Aucune commande reçue' : 'Aucune commande'}
        </h3>
        <p className="mt-2 text-gray-600">
          {['producer', 'transformer'].includes(userType) ? 'Vous n\'avez pas encore reçu de commandes.' : 'Commencez vos achats pour voir vos commandes ici.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        if (!order?._id) return null;
        return (
          <OrderListItem
            key={order._id}
            order={order}
            userType={userType}
            onUpdateStatus={onUpdateStatus}
            updatingOrders={updatingOrders}
            isCollapsed={collapsedOrders.has(order._id)}
            toggleCollapse={toggleCollapse}
          />
        );
      })}
    </div>
  );
};

export default OrderList;
