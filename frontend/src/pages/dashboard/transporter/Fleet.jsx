import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { transporterService } from '../../../services';
import ModularDashboardLayout from '../../../components/layout/ModularDashboardLayout';
import { FiTruck, FiPlus, FiSearch, FiEdit, FiTrash2 } from 'react-icons/fi';
import { useNotifications } from '../../../contexts/NotificationContext';
import CloudinaryImage from '../../../components/common/CloudinaryImage';

const Fleet = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotifications();
  const [fleet, setFleet] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadFleet = async () => {
      if (user?.userType === 'transporter') {
        try {
          setLoading(true);
          const fleetResponse = await transporterService.getFleet();
          const fleetData = fleetResponse.data.data?.fleet || fleetResponse.data.fleet || [];
          setFleet(Array.isArray(fleetData) ? fleetData : []);
        } catch (error) {
          console.error('Erreur lors du chargement de la flotte:', error);
          setFleet([]);
        } finally {
          setLoading(false);
        }
      }
    };

    loadFleet();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.userType, user?.id]);

  const handleDeleteVehicle = useCallback(async (vehicleId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce véhicule ?')) {
      return;
    }

    try {
      await transporterService.removeFleetVehicle(vehicleId);
      showSuccess('Véhicule supprimé avec succès');
      setFleet(prev => prev.filter(v => v._id !== vehicleId));
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      showError('Erreur lors de la suppression du véhicule');
    }
  }, [showSuccess, showError]);

  const filteredFleet = useMemo(() => {
    return fleet.filter(vehicle => {
      if (!vehicle) return false;
      
      const matchesSearch = searchTerm === '' || 
        vehicle.vehicleType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.registrationNumber?.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesSearch;
    });
  }, [fleet, searchTerm]);

  const getVehicleTypeLabel = (type) => {
    const types = {
      'motorcycle': 'Moto',
      'van': 'Fourgonnette',
      'truck': 'Camion',
      'refrigerated-truck': 'Camion frigorifique',
      'trailer': 'Remorque',
      'container-truck': 'Camion conteneur'
    };
    return types[type] || type || 'Véhicule';
  };

  return (
    <ModularDashboardLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Ma flotte</h1>
            <p className="text-gray-600 mt-1">
              Gérez vos véhicules de livraison locale
            </p>
          </div>
          <button
            onClick={() => navigate('/transporter/fleet/add')}
            className="inline-flex items-center px-4 py-2 bg-harvests-green text-white rounded-md hover:bg-green-600"
          >
            <FiPlus className="h-5 w-5 mr-2" />
            Ajouter un véhicule
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="relative">
            <FiSearch className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par type ou numéro d'immatriculation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-harvests-green"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-harvests-green"></div>
            <p className="mt-4 text-gray-600">Chargement de la flotte...</p>
          </div>
        ) : filteredFleet.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <FiTruck className="mx-auto h-16 w-16 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              {searchTerm ? 'Aucun véhicule trouvé' : 'Aucun véhicule dans votre flotte'}
            </h3>
            <p className="mt-2 text-gray-600">
              {searchTerm 
                ? 'Essayez de modifier votre recherche.'
                : 'Commencez par ajouter votre premier véhicule de livraison.'
              }
            </p>
            {!searchTerm && (
              <button
                onClick={() => navigate('/transporter/fleet/add')}
                className="mt-6 inline-flex items-center px-6 py-3 bg-harvests-green text-white rounded-md hover:bg-green-600"
              >
                <FiPlus className="h-5 w-5 mr-2" />
                Ajouter un véhicule
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFleet.map((vehicle, idx) => (
              <div
                key={vehicle._id || vehicle.registrationNumber || idx}
                className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Image du véhicule */}
                {vehicle.image?.url ? (
                  <div className="h-48 bg-gray-200">
                    <CloudinaryImage
                      src={vehicle.image.url}
                      alt={vehicle.image.alt || getVehicleTypeLabel(vehicle.vehicleType)}
                      className="w-full h-full object-cover"
                      width={400}
                      height={200}
                    />
                  </div>
                ) : (
                  <div className="h-48 bg-gray-200 flex items-center justify-center">
                    <FiTruck className="h-16 w-16 text-gray-400" />
                  </div>
                )}

                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FiTruck className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {getVehicleTypeLabel(vehicle.vehicleType)}
                        </h3>
                        {vehicle.registrationNumber && (
                          <p className="text-sm text-gray-500">
                            {vehicle.registrationNumber}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      vehicle.isAvailable 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {vehicle.isAvailable ? 'Disponible' : 'Indisponible'}
                    </div>
                  </div>

                  {vehicle.capacity && (
                    <div className="mb-4 space-y-2">
                      {vehicle.capacity.weight && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Poids:</span> {vehicle.capacity.weight.value} {vehicle.capacity.weight.unit}
                        </p>
                      )}
                      {vehicle.capacity.volume && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Volume:</span> {vehicle.capacity.volume.value} {vehicle.capacity.volume.unit}
                        </p>
                      )}
                    </div>
                  )}

                  {vehicle.specialFeatures && vehicle.specialFeatures.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-medium text-gray-500 mb-2">Caractéristiques:</p>
                      <div className="flex flex-wrap gap-2">
                        {vehicle.specialFeatures.map((feature, featureIdx) => {
                          const labels = {
                            'refrigerated': 'Frigorifique',
                            'insulated': 'Isolé',
                            'ventilated': 'Ventilé',
                            'covered': 'Couvert',
                            'gps-tracked': 'Suivi GPS',
                            'temperature-controlled': 'Température contrôlée'
                          };
                          return (
                            <span 
                              key={featureIdx}
                              className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs"
                            >
                              {labels[feature] || feature}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t">
                    <span className="text-sm text-gray-600">
                      État: <span className="font-medium">
                        {vehicle.condition === 'excellent' ? 'Excellent' :
                         vehicle.condition === 'good' ? 'Bon' :
                         vehicle.condition === 'fair' ? 'Moyen' :
                         vehicle.condition === 'needs-maintenance' ? 'Entretien requis' :
                         vehicle.condition || 'Non renseigné'}
                      </span>
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/transporter/fleet/edit/${vehicle._id}`)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        title="Modifier"
                      >
                        <FiEdit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteVehicle(vehicle._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                        title="Supprimer"
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ModularDashboardLayout>
  );
};

export default Fleet;

