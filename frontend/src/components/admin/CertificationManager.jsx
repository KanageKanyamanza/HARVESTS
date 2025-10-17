import React, { useState } from 'react';
import { 
  FiShield, FiPlus, FiEdit, FiTrash2, FiCheckCircle, 
  FiXCircle, FiClock, FiExternalLink, FiSave, FiX 
} from 'react-icons/fi';

const CertificationManager = ({ 
  productId, 
  certifications = [], 
  onUpdate, 
  isAdmin = false,
  canEdit = false 
}) => {
  const [editingIndex, setEditingIndex] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    certifyingBody: '',
    certificateNumber: '',
    validUntil: '',
    document: '',
    status: 'pending', // pending, approved, rejected, expired
    adminNotes: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEdit = (cert, index) => {
    setFormData({ ...cert });
    setEditingIndex(index);
    setShowAddForm(true);
  };

  const handleAdd = () => {
    setFormData({
      name: '',
      certifyingBody: '',
      certificateNumber: '',
      validUntil: '',
      document: '',
      status: 'pending',
      adminNotes: ''
    });
    setEditingIndex(null);
    setShowAddForm(true);
  };

  const handleSave = () => {
    if (editingIndex !== null) {
      // Mise à jour d'une certification existante
      const updatedCertifications = [...certifications];
      updatedCertifications[editingIndex] = { ...formData };
      onUpdate(updatedCertifications);
    } else {
      // Ajout d'une nouvelle certification
      onUpdate([...certifications, { ...formData }]);
    }
    
    setShowAddForm(false);
    setEditingIndex(null);
    setFormData({
      name: '',
      certifyingBody: '',
      certificateNumber: '',
      validUntil: '',
      document: '',
      status: 'pending',
      adminNotes: ''
    });
  };

  const handleDelete = (index) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette certification ?')) {
      const updatedCertifications = certifications.filter((_, i) => i !== index);
      onUpdate(updatedCertifications);
    }
  };

  const handleStatusChange = (index, newStatus) => {
    const updatedCertifications = [...certifications];
    updatedCertifications[index].status = newStatus;
    onUpdate(updatedCertifications);
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: { 
        icon: FiClock, 
        color: 'text-yellow-600', 
        bg: 'bg-yellow-100', 
        text: 'En attente' 
      },
      approved: { 
        icon: FiCheckCircle, 
        color: 'text-green-600', 
        bg: 'bg-green-100', 
        text: 'Approuvée' 
      },
      rejected: { 
        icon: FiXCircle, 
        color: 'text-red-600', 
        bg: 'bg-red-100', 
        text: 'Rejetée' 
      },
      expired: { 
        icon: FiClock, 
        color: 'text-gray-600', 
        bg: 'bg-gray-100', 
        text: 'Expirée' 
      }
    };
    return configs[status] || configs.pending;
  };

  const isExpired = (validUntil) => {
    if (!validUntil) return false;
    return new Date(validUntil) < new Date();
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <FiShield className="h-5 w-5 mr-2" />
          Certifications et labels
        </h3>
        {canEdit && (
          <button
            onClick={handleAdd}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-harvests-green hover:bg-green-600"
          >
            <FiPlus className="h-4 w-4 mr-1" />
            Ajouter
          </button>
        )}
      </div>

      {/* Liste des certifications */}
      <div className="space-y-4">
        {certifications.map((cert, index) => {
          const statusConfig = getStatusConfig(cert.status);
          const StatusIcon = statusConfig.icon;
          const expired = isExpired(cert.validUntil);
          
          return (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-medium text-gray-900">{cert.name}</h4>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.color}`}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {statusConfig.text}
                    </span>
                    {expired && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Expirée
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-1 text-sm text-gray-600">
                    {cert.certifyingBody && (
                      <p><span className="font-medium">Organisme:</span> {cert.certifyingBody}</p>
                    )}
                    {cert.certificateNumber && (
                      <p><span className="font-medium">N°:</span> {cert.certificateNumber}</p>
                    )}
                    {cert.validUntil && (
                      <p><span className="font-medium">Valide jusqu'au:</span> {new Date(cert.validUntil).toLocaleDateString('fr-FR')}</p>
                    )}
                    {cert.adminNotes && (
                      <p><span className="font-medium">Notes admin:</span> {cert.adminNotes}</p>
                    )}
                  </div>
                  
                  {cert.document && (
                    <div className="mt-2">
                      <a
                        href={cert.document}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm text-harvests-green hover:text-green-600"
                      >
                        <FiExternalLink className="h-4 w-4 mr-1" />
                        Voir le document
                      </a>
                    </div>
                  )}
                </div>
                
                {/* Actions */}
                <div className="flex items-center space-x-2">
                  {isAdmin && (
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleStatusChange(index, 'approved')}
                        className="p-1 text-green-600 hover:text-green-700"
                        title="Approuver"
                      >
                        <FiCheckCircle className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleStatusChange(index, 'rejected')}
                        className="p-1 text-red-600 hover:text-red-700"
                        title="Rejeter"
                      >
                        <FiXCircle className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  
                  {canEdit && (
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleEdit(cert, index)}
                        className="p-1 text-gray-600 hover:text-gray-700"
                        title="Modifier"
                      >
                        <FiEdit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(index)}
                        className="p-1 text-red-600 hover:text-red-700"
                        title="Supprimer"
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        
        {certifications.length === 0 && (
          <div className="text-center py-8">
            <FiShield className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune certification</h3>
            <p className="mt-1 text-sm text-gray-500">
              {canEdit ? 'Ajoutez des certifications pour ce produit' : 'Aucune certification disponible'}
            </p>
          </div>
        )}
      </div>

      {/* Formulaire d'ajout/modification */}
      {showAddForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingIndex !== null ? 'Modifier la certification' : 'Ajouter une certification'}
                </h3>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX className="h-5 w-5" />
                </button>
              </div>
              
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom de la certification *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                    placeholder="Ex: Agriculture Biologique"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Organisme certificateur
                  </label>
                  <input
                    type="text"
                    name="certifyingBody"
                    value={formData.certifyingBody}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                    placeholder="Ex: Ecocert"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Numéro de certificat
                  </label>
                  <input
                    type="text"
                    name="certificateNumber"
                    value={formData.certificateNumber}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                    placeholder="Ex: BIO-2024-001"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valide jusqu'au
                  </label>
                  <input
                    type="date"
                    name="validUntil"
                    value={formData.validUntil}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Document (URL)
                  </label>
                  <input
                    type="url"
                    name="document"
                    value={formData.document}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                    placeholder="https://example.com/certificate.pdf"
                  />
                </div>
                
                {isAdmin && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Statut
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                    >
                      <option value="pending">En attente</option>
                      <option value="approved">Approuvée</option>
                      <option value="rejected">Rejetée</option>
                      <option value="expired">Expirée</option>
                    </select>
                  </div>
                )}
                
                {isAdmin && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes admin
                    </label>
                    <textarea
                      name="adminNotes"
                      value={formData.adminNotes}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-harvests-green"
                      placeholder="Notes internes sur cette certification..."
                    />
                  </div>
                )}
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-harvests-light"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-harvests-green hover:bg-green-600 flex items-center"
                  >
                    <FiSave className="h-4 w-4 mr-1" />
                    {editingIndex !== null ? 'Modifier' : 'Ajouter'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CertificationManager;
