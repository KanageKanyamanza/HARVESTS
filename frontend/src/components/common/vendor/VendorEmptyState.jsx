import React from 'react';

const VendorEmptyState = ({ icon, title, description }) => {
  return (
    <div className="text-center py-12">
      {icon}
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500">{description}</p>
    </div>
  );
};

export default VendorEmptyState;

