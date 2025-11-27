import React from 'react';
import { FiStar, FiTruck, FiGlobe, FiCheckCircle } from 'react-icons/fi';
import { getVendorAverageRating, formatAverageRating } from '../../utils/vendorRatings';
import { formatPriceOrQuote } from './baseConfig.jsx';
import { FiPhone, FiMail } from 'react-icons/fi';
import { VendorFleetCard, VendorReviewsList, VendorEmptyState } from '../../components/common/vendor';

const VEHICLE_TYPES = {
  'container': 'Conteneur standard',
  'container-20ft': 'Conteneur 20 pieds',
  'container-40ft': 'Conteneur 40 pieds',
  'container-refrigerated': 'Conteneur frigorifique',
  'truck': 'Camion',
  'refrigerated-truck': 'Camion frigorifique',
  'trailer': 'Remorque',
  'vessel': 'Navire',
  'aircraft': 'Avion cargo'
};

const CONDITION_LABELS = {
  'excellent': 'Excellent',
  'good': 'Bon',
  'fair': 'Moyen',
  'needs-maintenance': 'Entretien requis'
};

export const exporterConfig = {
  vendorType: 'exporter',
  getVendorName: (e) => e.companyName || `${e.firstName} ${e.lastName}`,
  getVendorSubtitle: (e) => {
    const markets = e.targetMarkets?.map(m => m.country).filter(Boolean) || [];
    return markets.length > 0 ? `Export vers ${markets.slice(0, 3).join(', ')}` : 'Exportateur';
  },
  
  getVendorStats: (exporter, _items, reviews = []) => {
    const averageRating = getVendorAverageRating(exporter, reviews);
    return [
      { icon: <FiStar className="w-5 h-5 text-yellow-500" />, value: formatAverageRating(averageRating), label: 'Note moyenne' },
      { icon: <FiGlobe className="w-5 h-5 text-blue-500" />, value: exporter.targetMarkets?.length || 0, label: 'Marchés cibles' },
      { icon: <FiTruck className="w-5 h-5 text-green-500" />, value: exporter.fleet?.length || 0, label: 'Flotte' },
      { icon: <FiCheckCircle className="w-5 h-5 text-purple-500" />, value: exporter.exportLicenses?.length || 0, label: 'Licences' }
    ];
  },
  
  getVendorContact: (e) => {
    const contact = [];
    if (e.phone) contact.push({ icon: <FiPhone className="h-5 w-5 text-gray-400 mr-3" />, text: e.phone, href: `tel:${e.phone}` });
    if (e.email) contact.push({ icon: <FiMail className="h-5 w-5 text-gray-400 mr-3" />, text: e.email, href: `mailto:${e.email}` });
    return contact;
  },
  getVendorLocation: (e) => [e.address, e.city, e.region, e.country].filter(Boolean),
  getVendorDescription: (e) => e.bio || e.description || '',
  getVendorTags: (e) => {
    const tags = [];
    if (e.targetMarkets?.length > 0) {
      tags.push({ label: 'Marchés cibles', items: e.targetMarkets.map(m => m.country).filter(Boolean) });
    }
    if (e.exportProducts?.length > 0) {
      tags.push({ label: 'Produits d\'export', items: [...new Set(e.exportProducts.map(p => p.category).filter(Boolean))] });
    }
    return tags;
  },
  
  formatPrice: formatPriceOrQuote,
  getItemName: (v) => VEHICLE_TYPES[v.vehicleType] || v.vehicleType || 'Véhicule',
  getItemDescription: (v) => {
    const capacity = [];
    if (v.capacity?.weight) capacity.push(`${v.capacity.weight.value} ${v.capacity.weight.unit}`);
    if (v.capacity?.volume) capacity.push(`${v.capacity.volume.value} ${v.capacity.volume.unit}`);
    return capacity.length > 0 ? `Capacité: ${capacity.join(', ')}` : 'Véhicule d\'export';
  },
  getItemPrice: () => null,
  getItemImage: (v) => v.image?.url || v.image?.secure_url || (typeof v.image === 'string' ? v.image : null),
  getItemExtraInfo: (v) => `${v.isAvailable ? 'Disponible' : 'Indisponible'} - ${CONDITION_LABELS[v.condition] || v.condition}`,
  getItemButtonText: 'Voir détails',
  getItemButtonIcon: <FiTruck className="w-4 h-4 mr-2" />,
  getItemButtonColor: 'bg-blue-600 hover:bg-blue-700',
  getEmptyStateIcon: <FiTruck className="w-12 h-12 text-gray-400 mx-auto mb-4" />,
  getEmptyStateTitle: 'Aucune flotte disponible',
  getEmptyStateDescription: 'Cet exportateur n\'a pas encore de véhicules ou conteneurs enregistrés.',
  
  tabs: ['fleet', 'markets', 'reviews'],
  getTabLabel: (tab) => ({ 'fleet': 'Flotte', 'markets': 'Marchés', 'reviews': 'Avis' }[tab] || tab),
  getTabCount: (tab, items, reviews = []) => {
    if (tab === 'fleet') return items.length;
    if (tab === 'reviews') return reviews.length;
    return 0;
  },
  
  getTabContent: (tab, items, vendor, helpers, reviews = []) => {
    if (tab === 'fleet') {
      if (items.length === 0) {
        return <VendorEmptyState icon={helpers.getEmptyStateIcon} title={helpers.getEmptyStateTitle} description={helpers.getEmptyStateDescription} />;
      }
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((vehicle, idx) => (
            <VendorFleetCard key={vehicle._id || vehicle.registrationNumber || idx} vehicle={vehicle} helpers={helpers} />
          ))}
        </div>
      );
    }
    
    if (tab === 'markets') {
      if (!vendor.targetMarkets?.length) {
        return (
          <div className="text-center py-12">
            <FiGlobe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun marché cible</h3>
            <p className="text-gray-500">Cet exportateur n'a pas encore renseigné ses marchés cibles.</p>
          </div>
        );
      }
      return (
        <div className="space-y-4">
          {vendor.targetMarkets.map((market, idx) => (
            <div key={idx} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">{market.country} {market.region && `- ${market.region}`}</h3>
                {market.experience && (
                  <span className="text-xs text-gray-500">
                    {{ 'new': 'Nouveau', '1-2-years': '1-2 ans', '3-5-years': '3-5 ans', '5+-years': '5+ ans' }[market.experience] || market.experience}
                  </span>
                )}
              </div>
              {market.marketType && (
                <p className="text-sm text-gray-600 mb-2">
                  Type: {{ 'wholesale': 'Gros', 'retail': 'Détail', 'industrial': 'Industriel', 'institutional': 'Institutionnel' }[market.marketType] || market.marketType}
                </p>
              )}
              {market.annualVolume && <p className="text-sm text-gray-600">Volume annuel: {market.annualVolume.value} {market.annualVolume.unit}</p>}
            </div>
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

