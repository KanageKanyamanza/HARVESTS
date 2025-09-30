import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { producerService } from '../../../services';
import ModularDashboardLayout from '../../../components/layout/ModularDashboardLayout';
import { FiFileText, FiPlus, FiTrash2, FiDownload, FiUpload, FiEye } from 'react-icons/fi';

const Documents = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDocuments = async () => {
      if (user?.userType === 'producer') {
        try {
          setLoading(true);
          const response = await producerService.getDocuments();
          const docsData = Array.isArray(response.data.documents) ? response.data.documents : 
                          Array.isArray(response.data) ? response.data : [];
          setDocuments(docsData);
        } catch (error) {
          console.error('Erreur lors du chargement des documents:', error);
          setDocuments([]);
        } finally {
          setLoading(false);
        }
      }
    };

    loadDocuments();
  }, [user]);

  const removeDocument = async (documentId) => {
    try {
      // Note: Cette fonction n'existe pas encore dans le service, à implémenter
      console.log('Suppression du document:', documentId);
      setDocuments(prev => prev.filter(doc => doc.id !== documentId && doc._id !== documentId));
    } catch (error) {
      console.error('Erreur lors de la suppression du document:', error);
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
              <h1 className="text-2xl font-bold text-gray-900">Mes documents</h1>
              <p className="text-gray-600 mt-1">Gérez vos documents officiels et certificats</p>
            </div>
            <div className="mt-4 sm:mt-0">
              <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-harvests-green hover:bg-green-600">
                <FiPlus className="h-4 w-4 mr-2" />
                Ajouter un document
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {documents.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <FiFileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun document</h3>
              <p className="mt-1 text-sm text-gray-500">
                Vous n'avez pas encore ajouté de documents
              </p>
              <div className="mt-6">
                <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-harvests-green hover:bg-green-600">
                  <FiPlus className="h-4 w-4 mr-2" />
                  Ajouter mon premier document
                </button>
              </div>
            </div>
          ) : (
            documents.map((document) => (
              <div key={document.id || document._id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <FiFileText className="h-8 w-8 text-blue-500" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {document.name || document.title || 'Document'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {document.type || 'Type de document'} • {document.category || 'Catégorie'}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Ajouté le: {document.createdAt ? new Date(document.createdAt).toLocaleDateString() : 'Non spécifié'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        document.status === 'approved' ? 'bg-green-100 text-green-800' :
                        document.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        document.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {document.status === 'approved' ? 'Approuvé' :
                         document.status === 'pending' ? 'En attente' :
                         document.status === 'rejected' ? 'Rejeté' : 'Inconnu'}
                      </span>
                    </div>
                  </div>

                  {document.description && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-700">{document.description}</p>
                    </div>
                  )}

                  <div className="mt-4 flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">
                        Taille: {document.fileSize ? `${(document.fileSize / 1024).toFixed(1)} KB` : 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">
                        Format: {document.fileType || 'N/A'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between">
                    <div className="flex space-x-2">
                      {document.fileUrl && (
                        <>
                          <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                            <FiEye className="h-4 w-4 mr-2" />
                            Voir
                          </button>
                          <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                            <FiDownload className="h-4 w-4 mr-2" />
                            Télécharger
                          </button>
                        </>
                      )}
                    </div>
                    <button 
                      onClick={() => removeDocument(document.id || document._id)}
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

        {/* Zone de téléchargement */}
        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Télécharger un nouveau document
          </h3>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <label className="cursor-pointer">
                <span className="mt-2 block text-sm font-medium text-gray-900">
                  Cliquez pour sélectionner un fichier
                </span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  className="hidden"
                />
              </label>
              <p className="mt-1 text-sm text-gray-500">
                PDF, DOC, DOCX, JPG, PNG jusqu'à 10MB
              </p>
            </div>
          </div>
        </div>
      </div>
    </ModularDashboardLayout>
  );
};

export default Documents;
