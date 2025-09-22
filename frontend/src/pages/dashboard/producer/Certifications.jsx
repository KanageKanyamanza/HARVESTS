import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { producerService } from '../../../services';
import ModularDashboardLayout from '../../../components/layout/ModularDashboardLayout';
import { FiAward, FiPlus, FiEdit, FiTrash2, FiUpload, FiFileText } from 'react-icons/fi';

const Certifications = () => {
  const { user } = useAuth();
  const [certifications, setCertifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCertifications = async () => {
      if (user?.userType === 'producer') {
        try {
          setLoading(true);
          const response = await producerService.getCertifications();
          const certsData = Array.isArray(response.data.certifications) ? response.data.certifications : 
                           Array.isArray(response.data) ? response.data : [];
          setCertifications(certsData);
        } catch (error) {
          console.error('Erreur lors du chargement des certifications:', error);
          setCertifications([]);
        } finally {
          setLoading(false);
        }
      }
    };

    loadCertifications();
  }, [user]);

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
              <h1 className="text-2xl font-bold text-gray-900">Mes certifications</h1>
              <p className="text-gray-600 mt-1">Gérez vos certifications et documents officiels</p>
            </div>
            <div className="mt-4 sm:mt-0">
              <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-harvests-green hover:bg-green-600">
                <FiPlus className="h-4 w-4 mr-2" />
                Ajouter une certification
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {certifications.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <FiAward className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune certification</h3>
              <p className="mt-1 text-sm text-gray-500">
                Vous n'avez pas encore ajouté de certifications
              </p>
              <div className="mt-6">
                <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-harvests-green hover:bg-green-600">
                  <FiPlus className="h-4 w-4 mr-2" />
                  Ajouter ma première certification
                </button>
              </div>
            </div>
          ) : (
            certifications.map((cert) => (
              <div key={cert.id || cert._id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <FiAward className="h-8 w-8 text-yellow-500" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {cert.name || cert.title || 'Certification'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {cert.issuer || 'Organisme émetteur'} • {cert.type || 'Type'}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Émise le: {cert.issueDate || 'Non spécifiée'} • 
                          Expire le: {cert.expiryDate || 'Non spécifiée'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        cert.status === 'active' ? 'bg-green-100 text-green-800' :
                        cert.status === 'expired' ? 'bg-red-100 text-red-800' :
                        cert.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {cert.status === 'active' ? 'Active' :
                         cert.status === 'expired' ? 'Expirée' :
                         cert.status === 'pending' ? 'En attente' : 'Inconnu'}
                      </span>
                    </div>
                  </div>

                  {cert.description && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-700">{cert.description}</p>
                    </div>
                  )}

                  {cert.documentUrl && (
                    <div className="mt-4 flex items-center space-x-2">
                      <FiFileText className="h-4 w-4 text-gray-400" />
                      <a
                        href={cert.documentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Voir le document
                      </a>
                    </div>
                  )}

                  <div className="mt-6 flex items-center justify-between">
                    <div className="flex space-x-2">
                      <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                        <FiEdit className="h-4 w-4 mr-2" />
                        Modifier
                      </button>
                      <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                        <FiUpload className="h-4 w-4 mr-2" />
                        Télécharger
                      </button>
                    </div>
                    <button className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50">
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

export default Certifications;
