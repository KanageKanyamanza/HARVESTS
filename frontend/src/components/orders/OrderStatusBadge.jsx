import React from 'react';
import { getStatusConfig } from '../../utils/orderStatusBadgeHelpers';

const OrderStatusBadge = ({ status }) => {
  const config = getStatusConfig(status);
  const StatusIcon = config.icon;
  
  return (
    <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${config.color}`}>
      <StatusIcon className="h-5 w-5 mr-2" />
      {config.text}
    </span>
  );
};

export default OrderStatusBadge;

