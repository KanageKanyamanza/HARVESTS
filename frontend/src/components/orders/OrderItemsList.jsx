import React from 'react';
import { FiPackage, FiCheckCircle } from 'react-icons/fi';
import CloudinaryImage from '../common/CloudinaryImage';
import { parseProductName } from '../../utils/productUtils';
import { getItemStatusConfig } from './OrderStatusBadge';

const getImageUrl = (productImages, productName) => {
  if (!productImages?.length) return { url: null, alt: null };
  
  const firstImg = productImages[0];
  
  if (typeof firstImg === 'string') {
    if (firstImg.startsWith('http') || firstImg.startsWith('//')) {
      return { url: firstImg, alt: parseProductName(productName) };
    }
    try {
      const parsed = JSON.parse(firstImg);
      if (parsed?.url) return { url: parsed.url, alt: parsed.alt || parseProductName(productName) };
    } catch {
      const urlMatch = firstImg.match(/url:\s*['"]([^'"]+)['"]/);
      if (urlMatch?.[1]) return { url: urlMatch[1], alt: parseProductName(productName) };
    }
  } else if (typeof firstImg === 'object') {
    if (firstImg.url) return { url: firstImg.url, alt: firstImg.alt || parseProductName(productName) };
    if (firstImg.secure_url) return { url: firstImg.secure_url, alt: firstImg.alt || parseProductName(productName) };
    if (firstImg.public_id) return { url: `https://res.cloudinary.com/harvests/image/upload/${firstImg.public_id}`, alt: firstImg.alt || parseProductName(productName) };
  }
  
  return { url: null, alt: null };
};

const OrderItemsList = ({ order, isSellerView, updateOrderStatus, updating }) => {
  const items = isSellerView ? (order.segment?.items || order.items || []) : (order.items || []);
  const currentSegmentStatus = order.segment?.status || order.status;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Articles commandés</h3>
      <div className="space-y-4">
        {items.map((item, index) => {
          const productData = item.product || item.productSnapshot || {};
          const productSnapshot = item.productSnapshot || {};
          const productName = productData.name || productSnapshot.name || item.name || 'Produit inconnu';
          const productImages = productData.images || productSnapshot.images || item.images || [];
          const productPrice = productSnapshot.price || item.price || item.unitPrice || 0;
          const productUnit = productSnapshot.unit || item.unit || 'unité';
          const quantity = item.quantity || 1;
          const totalPrice = item.totalPrice || (productPrice * quantity);
          const { url: imageUrl, alt: imageAlt } = getImageUrl(productImages, productName);
          
          const itemStatus = item.status || 'pending';
          const itemStatusConfig = getItemStatusConfig(itemStatus);
          const itemId = item._id || item.id || `${order._id}-${index}`;
          const canConfirmItem = isSellerView && currentSegmentStatus === 'pending' && itemStatus === 'pending' && item._id;

          return (
            <div key={itemId} className="p-4 border border-gray-200 rounded-lg bg-gray-50/40">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center space-x-4">
                  <div className="h-16 w-16 bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0">
                    {imageUrl ? (
                      <CloudinaryImage src={imageUrl} alt={imageAlt || parseProductName(productName)} className="h-full w-full object-cover"
                        fallback={<div className="h-full w-full flex items-center justify-center"><FiPackage className="h-8 w-8 text-gray-400" /></div>}
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center"><FiPackage className="h-8 w-8 text-gray-400" /></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900">{parseProductName(productName)}</h4>
                    <p className="text-sm text-gray-500 mt-1">Quantité: {quantity} {productUnit}</p>
                    <p className="text-sm text-gray-500">Prix unitaire: {productPrice.toLocaleString('fr-FR')} FCFA / {productUnit}</p>
                  </div>
                </div>
                <div className="flex flex-col items-start md:items-end gap-2">
                  <p className="text-sm font-medium text-gray-900">Total: {totalPrice.toLocaleString('fr-FR')} FCFA</p>
                  <div className="flex items-center flex-wrap gap-2">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${itemStatusConfig.color}`}>{itemStatusConfig.text}</span>
                    {canConfirmItem && (
                      <button onClick={() => updateOrderStatus('confirmed', { itemId: item._id })} disabled={updating}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md text-xs font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50">
                        <FiCheckCircle className="h-3.5 w-3.5 mr-1" />{updating ? 'Confirmation...' : 'Confirmer'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderItemsList;

