import React from 'react';
import { X } from 'lucide-react';

const AdminViewModal = ({ show, onClose, admin, getRoleColor, getRoleLabel, getDepartmentLabel, formatDate }) => {
  if (!show || !admin) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-gray-900">Détails de l'administrateur</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Prénom</label>
                <p className="text-gray-900">{admin.firstName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Nom</label>
                <p className="text-gray-900">{admin.lastName}</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
              <p className="text-gray-900">{admin.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Téléphone</label>
              <p className="text-gray-900">{admin.phone || 'Non renseigné'}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Rôle</label>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(admin.role)}`}>
                  {getRoleLabel(admin.role)}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Département</label>
                <p className="text-gray-900">{getDepartmentLabel(admin.department)}</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Statut</label>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                admin.isActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {admin.isActive ? 'Actif' : 'Inactif'}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Dernière connexion</label>
              <p className="text-gray-900">{formatDate(admin.lastLogin)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Date de création</label>
              <p className="text-gray-900">{formatDate(admin.createdAt)}</p>
            </div>
            {admin.createdBy && (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Créé par</label>
                <p className="text-gray-900">
                  {admin.createdBy.firstName} {admin.createdBy.lastName}
                </p>
              </div>
            )}
          </div>
          <div className="flex justify-end mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminViewModal;

