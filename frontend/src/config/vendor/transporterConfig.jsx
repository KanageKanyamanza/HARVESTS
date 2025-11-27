import React from 'react';
import { FiStar, FiTruck, FiCheckCircle, FiPackage, FiMapPin } from 'react-icons/fi';
import { getVendorAverageRating, formatAverageRating } from '../../utils/vendorRatings';
import { formatPriceOrQuote, getBaseContact } from './baseConfig.jsx';
import { VendorFleetCard, VendorReviewsList, VendorHours, VendorEmptyState } from '../../components/common/vendor';

const TRANSPORT_TYPES = {
  'road': 'Transport routier',
  'rail': 'Transport ferroviaire',
  'air': 'Transport aérien',
  'sea': 'Transport maritime',
  'multimodal': 'Transport multimodal'
};

const SERVICE_LABELS = {
  'local-delivery': 'Livraison locale',
  'regional-transport': 'Transport régional',
  'national-transport': 'Transport national',
  'international-shipping': 'Transport international',
  'cold-chain': 'Chaîne du froid',
  'express-delivery': 'Livraison express'
};

const VEHICLE_TYPES = {
  'motorcycle': 'Moto',
  'van': 'Camionnette',
  'truck': 'Camion',
  'refrigerated-truck': 'Camion frigorifique',
  'trailer': 'Remorque',
  'container-truck': 'Camion conteneur'
};

const CONDITION_LABELS = {
  'excellent': 'Excellent',
  'good': 'Bon',
  'fair': 'Moyen',
  'needs-maintenance': 'Entretien requis'
};

export const transporterConfig = {
  vendorType: 'transporter',
  getVendorName: (t) => t.companyName || `${t.firstName} ${t.lastName}`,
  getVendorSubtitle: (t) => (t.transportType || []).map(type => TRANSPORT_TYPES[type] || type).join(', ') || 'Transporteur',
  
  getVendorStats: (transporter, _items, reviews = []) => {
    const averageRating = getVendorAverageRating(transporter, reviews);
    return [
      { icon: <FiStar className="w-5 h-5 text-yellow-500" />, value: formatAverageRating(averageRating), label: 'Note moyenne' },
      { icon: <FiTruck className="w-5 h-5 text-blue-500" />, value: transporter.fleet?.length || 0, label: 'Véhicules' },
      { icon: <FiCheckCircle className="w-5 h-5 text-green-500" />, value: `${transporter.performanceStats?.onTimeDeliveryRate || 0}%`, label: 'Ponctualité' },
      { icon: <FiPackage className="w-5 h-5 text-purple-500" />, value: transporter.performanceStats?.totalDeliveries || 0, label: 'Livraisons' }
    ];
  },
  
  getVendorContact: getBaseContact,
  getVendorTags: (t) => {
    const tags = [];
    if (t.serviceTypes?.length > 0) {
      tags.push({ label: 'Services', items: t.serviceTypes.map(type => SERVICE_LABELS[type] || type) });
    }
    if (t.serviceAreas?.length > 0) {
      tags.push({ label: 'Zones de couverture', items: [...new Set(t.serviceAreas.map(a => a.region))] });
    }
    return tags;
  },
  
  formatPrice: formatPriceOrQuote,
  getItemName: (v) => VEHICLE_TYPES[v.vehicleType] || v.vehicleType || 'Véhicule',
  getItemDescription: (v) => {
    const capacity = [];
    if (v.capacity?.weight) capacity.push(`${v.capacity.weight.value} ${v.capacity.weight.unit}`);
    if (v.capacity?.volume) capacity.push(`${v.capacity.volume.value} ${v.capacity.volume.unit}`);
    return capacity.length > 0 ? `Capacité: ${capacity.join(', ')}` : 'Véhicule de transport';
  },
  getItemPrice: () => null,
  getItemImage: (v) => v.image?.url || v.image?.secure_url || (typeof v.image === 'string' ? v.image : null),
  getItemExtraInfo: (v) => `${v.isAvailable ? 'Disponible' : 'Indisponible'} - ${CONDITION_LABELS[v.condition] || v.condition}`,
  getItemButtonText: 'Réserver',
  getItemButtonIcon: <FiTruck className="w-4 h-4 mr-2" />,
  getItemButtonColor: 'bg-blue-600 hover:bg-blue-700',
  getEmptyStateIcon: <FiTruck className="w-12 h-12 text-gray-400 mx-auto mb-4" />,
  getEmptyStateTitle: 'Aucun véhicule disponible',
  getEmptyStateDescription: 'Ce transporteur n\'a pas encore de véhicules enregistrés.',
  
  tabs: ['fleet', 'services', 'reviews', 'hours'],
  getTabLabel: (tab) => ({ 'fleet': 'Flotte', 'services': 'Services', 'reviews': 'Avis', 'hours': 'Horaires' }[tab] || tab),
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
            <VendorFleetCard 
              key={vehicle._id || vehicle.registrationNumber || idx} 
              vehicle={vehicle} 
              helpers={helpers}
              onAction={() => alert('Fonctionnalité de réservation à venir')}
            />
          ))}
        </div>
      );
    }
    
    if (tab === 'services') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {vendor.serviceAreas?.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FiMapPin className="w-5 h-5 mr-2 text-blue-500" />
                Zones de couverture
              </h3>
              <div className="space-y-3">
                {vendor.serviceAreas.map((area, idx) => (
                  <div key={idx} className="border-b border-gray-100 pb-3 last:border-b-0">
                    <p className="font-medium text-gray-900">{area.region}</p>
                    {area.cities?.length > 0 && <p className="text-sm text-gray-600 mt-1">Villes: {area.cities.join(', ')}</p>}
                    {area.deliveryRadius && <p className="text-sm text-gray-500 mt-1">Rayon: {area.deliveryRadius} km</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
          {vendor.specialCapabilities && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Capacités spéciales</h3>
              <div className="space-y-2">
                {vendor.specialCapabilities.coldChain?.available && (
                  <div className="flex items-center text-sm">
                    <FiCheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    <span>Chaîne du froid</span>
                    {vendor.specialCapabilities.coldChain.temperatureRange && (
                      <span className="text-gray-500 ml-2">
                        ({vendor.specialCapabilities.coldChain.temperatureRange.min}°C - {vendor.specialCapabilities.coldChain.temperatureRange.max}°C)
                      </span>
                    )}
                  </div>
                )}
                {vendor.specialCapabilities.oversizedCargo && (
                  <div className="flex items-center text-sm"><FiCheckCircle className="w-4 h-4 text-green-500 mr-2" /><span>Fret volumineux</span></div>
                )}
                {vendor.specialCapabilities.crossBorder && (
                  <div className="flex items-center text-sm"><FiCheckCircle className="w-4 h-4 text-green-500 mr-2" /><span>Transport transfrontalier</span></div>
                )}
              </div>
            </div>
          )}
        </div>
      );
    }
    
    if (tab === 'hours') {
      return <VendorHours hours={vendor.operatingHours} openField="start" closeField="end" isOpenField="isAvailable" />;
    }
    if (tab === 'reviews') {
      return <VendorReviewsList reviews={reviews} />;
    }
    return null;
  }
};

