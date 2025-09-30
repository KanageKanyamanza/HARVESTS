import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { producerService } from '../../../services';
import ModularDashboardLayout from '../../../components/layout/ModularDashboardLayout';
import { FiTruck, FiPlus, FiTrash2, FiMapPin, FiPhone, FiMail, FiStar } from 'react-icons/fi';

const Transporters = () => {
  const { user } = useAuth();
  const [transporters, setTransporters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTransporters = async () => {
      if (user?.userType === 'producer') {
        try {
          setLoading(true);
          const response = await producerService.getPreferredTransporters();
          const transData = Array.isArray(response.data.transporters) ? response.data.transporters : 
                           Array.isArray(response.data) ? response.data : [];
          setTransporters(transData);
        } catch (error) {
          console.error('Erreur lors du chargement des transporteurs:', error);
          setTransporters([]);
        } finally {
          setLoading(false);
        }
      }
    };

    loadTransporters();
  }, [user]);

  const removeTransporter = async (transporterId) => {
    try {
      await producerService.removePreferredTransporter(transporterId);
      setTransporters(prev => prev.filter(t => t.id !== transporterId && t._id !== transporterId));
    } catch (error) {
      console.error('Erreur lors de la suppression du transporteur:', error);
    }
  };

  if (loading) {
    return (
      <ModularDashboardLayout>
        <div className="p-6 max-w-7xl mx-auto pb-20">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-lg shadow p-6">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ModularDashboardLayout>
    );
  }

  return (
    <ModularDashboardLayout>
      <div className="p-6 max-w-7xl mx-auto pb-20">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Transporteurs préférés</h1>
              <p className="text-gray-600 mt-1">Gérez vos transporteurs de confiance</p>
            </div>
            <div className="mt-4 sm:mt-0">
              <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-harvests-green hover:bg-green-600">
                <FiPlus className="h-4 w-4 mr-2" />
                Ajouter un transporteur
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {transporters.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <FiTruck className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun transporteur</h3>
              <p className="mt-1 text-sm text-gray-500">
                Vous n'avez pas encore ajouté de transporteurs préférés
              </p>
              <div className="mt-6">
                <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-harvests-green hover:bg-green-600">
                  <FiPlus className="h-4 w-4 mr-2" />
                  Ajouter mon premier transporteur
                </button>
              </div>
            </div>
          ) : (
            transporters.map((transporter) => (
              <div key={transporter.id || transporter._id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <FiTruck className="h-8 w-8 text-blue-500" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {transporter.name || transporter.companyName || 'Transporteur'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {transporter.type || 'Type de transport'} • {transporter.vehicleType || 'Véhicule'}
                        </p>
                        <div className="flex items-center mt-1">
                          <FiStar className="h-4 w-4 text-yellow-400 mr-1" />
                          <span className="text-sm text-gray-600">
                            {transporter.rating || 'N/A'} • {transporter.reviewsCount || 0} avis
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        transporter.status === 'active' ? 'bg-green-100 text-green-800' :
                        transporter.status === 'inactive' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {transporter.status === 'active' ? 'Actif' :
                         transporter.status === 'inactive' ? 'Inactif' : 'Inconnu'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <FiMapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {transporter.address || 'Adresse non spécifiée'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FiPhone className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {transporter.phone || 'Téléphone non spécifié'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FiMail className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {transporter.email || 'Email non spécifié'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">
                        Capacité: {transporter.capacity || 'N/A'} kg
                      </span>
                    </div>
                  </div>

                  {transporter.description && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-700">{transporter.description}</p>
                    </div>
                  )}

                  <div className="mt-6 flex items-center justify-between">
                    <div className="flex space-x-2">
                      <span className="text-sm text-gray-600">
                        Tarif: {transporter.rate ? `${transporter.rate.toLocaleString()} FCFA/km` : 'Non spécifié'}
                      </span>
                    </div>
                    <button 
                      onClick={() => removeTransporter(transporter.id || transporter._id)}
                      className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                    >
                      <FiTrash2 className="h-4 w-4 mr-2" />
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </ModularDashboardLayout>
  );
};

export default Transporters;
