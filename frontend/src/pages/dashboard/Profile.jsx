import React from 'react';
import ModularDashboardLayout from '../../components/layout/ModularDashboardLayout';
import { useAuth } from '../../hooks/useAuth';
import UserStatusBadge from '../../components/user/UserStatusBadge';

const Profile = () => {
  const { user } = useAuth();

  return (
    <ModularDashboardLayout>
      <div className="p-6 max-w-7xl mx-auto pb-20">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Mon profil</h1>
          <p className="text-gray-600 mt-1">
            Gérez vos informations personnelles et préférences
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-6">
            <UserStatusBadge showDetails={true} />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations personnelles</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Prénom</label>
                  <p className="text-gray-900">{user?.firstName || 'Non renseigné'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nom</label>
                  <p className="text-gray-900">{user?.lastName || 'Non renseigné'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="text-gray-900">{user?.email || 'Non renseigné'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Téléphone</label>
                  <p className="text-gray-900">{user?.phone || 'Non renseigné'}</p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Préférences</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type de compte</label>
                  <p className="text-gray-900 capitalize">{user?.userType || 'Non défini'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Langue préférée</label>
                  <p className="text-gray-900">{user?.preferredLanguage === 'fr' ? 'Français' : 'English'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Pays</label>
                  <p className="text-gray-900">{user?.country || 'Non renseigné'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button className="px-6 py-2 bg-harvests-green text-white rounded-md hover:bg-green-600 transition-colors">
              Modifier le profil
            </button>
          </div>
        </div>
      </div>
    </ModularDashboardLayout>
  );
};

export default Profile;
