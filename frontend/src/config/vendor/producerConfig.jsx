import React from 'react';
import { FiStar, FiPackage, FiUsers, FiCalendar } from 'react-icons/fi';
import { getVendorAverageRating, getVendorReviewCount, formatAverageRating } from '../../utils/vendorRatings';
import { toPlainText } from '../../utils/textHelpers';
import { formatPrice, getBaseContact } from './baseConfig.jsx';
import { VendorProductCard, VendorReviewsList, VendorEmptyState } from '../../components/common/vendor';

export const producerConfig = {
  vendorType: 'producer',
  getVendorName: (producer) => producer.farmName || `${producer.firstName} ${producer.lastName}`,
  getVendorSubtitle: (producer) => producer.farmName ? `${producer.firstName} ${producer.lastName}` : 'Producteur',
  
  getVendorStats: (producer, products, reviews = []) => {
    const averageRating = getVendorAverageRating(producer, reviews);
    const reviewCount = getVendorReviewCount(producer, reviews);

    return [
      { icon: <FiStar className="w-5 h-5 text-yellow-500" />, value: formatAverageRating(averageRating), label: 'Note moyenne' },
      { icon: <FiPackage className="w-5 h-5 text-blue-500" />, value: products.length, label: 'Produits' },
      { icon: <FiUsers className="w-5 h-5 text-green-500" />, value: reviewCount, label: 'Avis' },
      { icon: <FiCalendar className="w-5 h-5 text-purple-500" />, value: new Date(producer.createdAt).getFullYear(), label: 'Membre depuis' }
    ];
  },
  
  getVendorContact: getBaseContact,
  getVendorTags: (producer) => [{ label: 'Spécialités', items: producer.specialties || [] }],
  
  formatPrice,
  getItemName: (product) => toPlainText(product.name, 'Produit sans nom'),
  getItemDescription: (product) => toPlainText(product.description, 'Aucune description'),
  getItemPrice: (product) => product.price,
  getItemImage: (product) => product.images?.[0]?.url,
  getItemExtraInfo: (product) => `${product.inventory?.quantity || 0} en stock`,
  getItemButtonText: 'Ajouter au panier',
  getItemButtonIcon: <FiPackage className="w-4 h-4 mr-2" />,
  getItemButtonColor: 'bg-green-600 hover:bg-green-700',
  getEmptyStateIcon: <FiPackage className="w-12 h-12 text-gray-400 mx-auto mb-4" />,
  getEmptyStateTitle: 'Aucun produit disponible',
  getEmptyStateDescription: 'Ce producteur n\'a pas encore de produits en vente.',
  
  tabs: ['products', 'reviews'],
  getTabLabel: (tab) => ({ 'products': 'Produits', 'reviews': 'Avis' }[tab] || tab),
  getTabCount: (tab, items, reviews = []) => {
    if (tab === 'products') return items.length;
    if (tab === 'reviews') return reviews.length;
    return 0;
  },
  
  getTabContent: (tab, items, vendor, helpers, reviews = []) => {
    if (tab === 'products') {
      if (items.length === 0) {
        return <VendorEmptyState icon={helpers.getEmptyStateIcon} title={helpers.getEmptyStateTitle} description={helpers.getEmptyStateDescription} />;
      }
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((item) => (
            <VendorProductCard key={item._id} item={item} helpers={helpers} />
          ))}
        </div>
      );
    }
    if (tab === 'reviews') {
      return <VendorReviewsList reviews={reviews} />;
    }
    return null;
  }
};

