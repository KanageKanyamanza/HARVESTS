import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiTruck, FiPlusCircle } from 'react-icons/fi';
import CloudinaryImage from '../../common/CloudinaryImage';

// basePath : la flotte du transporteur et celle de l'exportateur n'ont pas la même route
const FleetSummarySection = ({ service, loading, basePath = '/exporter/fleet' }) => {
  const { t } = useTranslation('dashboard-transporter');
  const [vehicles, setVehicles] = useState([]);
  const [fleetLoading, setFleetLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadFleet = async () => {
      try {
        setFleetLoading(true);
        const response = await service.getFleet({ limit: 5 });
        const fleetData =
          response?.data?.data?.fleet ||
          response?.data?.fleet ||
          response?.data?.vehicles ||
          [];
        setVehicles(Array.isArray(fleetData) ? fleetData : []);
      } catch (err) {
        console.error('Erreur lors du chargement de la flotte :', err);
        setError('fleet.summary.loadError');
      } finally {
        setFleetLoading(false);
      }
    };

    if (service?.getFleet) {
      loadFleet();
    }
  }, [service]);

  const isLoading = loading || fleetLoading;
  const unitLabel = (unit) => t(`vehicle.units.${unit}`, { defaultValue: unit });

  if (error) {
    return (
      <div className="text-sm text-red-600">
        {t(error)}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((key) => (
          <div key={key} className="animate-pulse h-12 bg-gray-100 rounded-md" />
        ))}
      </div>
    );
  }

  if (!vehicles.length) {
    return (
      <div className="text-center py-6">
        <FiTruck className="mx-auto h-10 w-10 text-gray-400 mb-4" />
        <h4 className="text-lg font-semibold text-gray-900 mb-1">{t('fleet.summary.emptyTitle')}</h4>
        <p className="text-gray-500 mb-4">
          {t('fleet.summary.emptyText')}
        </p>
        <Link
          to={`${basePath}/add`}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FiPlusCircle className="mr-2" />
          {t('fleet.addVehicle')}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {vehicles.map((vehicle) => (
        <div
          key={vehicle._id || vehicle.id}
          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100"
        >
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 rounded-lg overflow-hidden bg-blue-100 flex items-center justify-center text-blue-600">
              {vehicle?.image?.url || vehicle?.image ? (
                <CloudinaryImage
                  src={vehicle.image.url || vehicle.image}
                  alt={vehicle?.name || t('vehicle.fallbackName')}
                  className="h-full w-full object-cover"
                />
              ) : (
                <FiTruck className="h-5 w-5" />
              )}
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900">
                {vehicle?.name || vehicle?.identifier || vehicle?.registrationNumber || t('vehicle.fallbackName')}
              </h4>
              <p className="text-xs text-gray-500">
                {vehicle?.type || vehicle?.vehicleType ?
                  t(`vehicle.types.${vehicle.type || vehicle.vehicleType}`, {
                    defaultValue: vehicle.type || vehicle.vehicleType,
                  })
                : t('vehicle.unknownType')}
              </p>
            </div>
          </div>
          <div className="text-right">
            {vehicle?.capacity && (
              <p className="text-sm font-medium text-gray-900">
                {t('fleet.summary.capacity', {
                  value:
                    typeof vehicle.capacity === 'object'
                      ? [
                          vehicle.capacity.weight
                            ? `${vehicle.capacity.weight.value ?? vehicle.capacity.weight} ${unitLabel(vehicle.capacity.weight.unit ?? 't')}`
                            : null,
                          vehicle.capacity.volume
                            ? `${vehicle.capacity.volume.value ?? vehicle.capacity.volume} ${unitLabel(vehicle.capacity.volume.unit ?? 'm³')}`
                            : null
                        ]
                          .filter(Boolean)
                          .join(' / ') || t('fleet.summary.unspecified')
                      : vehicle.capacity,
                })}
              </p>
            )}
            {vehicle?.status && (
              <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-50 text-green-700">
                {vehicle.status}
              </span>
            )}
          </div>
        </div>
      ))}

      <Link
        to={basePath}
        className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
      >
        {t('fleet.summary.seeAll')}
      </Link>
    </div>
  );
};

export default FleetSummarySection;


