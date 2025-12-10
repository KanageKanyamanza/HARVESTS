import React from 'react';
import { Mail, Save, X } from 'lucide-react';

const NotificationsTab = ({
  user,
  formData,
  saving,
  onInputChange,
  onSubmit,
  onReset
}) => {
  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
        <Mail className="h-5 w-5 mr-2" />
        Configuration des notifications par email
      </h2>

      <div className="space-y-4 max-w-2xl">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            <strong>💡 Information :</strong> Configurez votre email pour recevoir les notifications importantes 
            (messages de contact, nouvelles commandes, produits en attente d'approbation, etc.). 
            Tous les admins actifs qui ont configuré leur email recevront ces notifications.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <span className="flex items-center">
              <Mail className="h-4 w-4 mr-1" />
              Email pour les notifications
            </span>
          </label>
          
          {user?.notificationEmail ? (
            <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-xs text-gray-600 mb-1">Email actuellement configuré :</p>
              <p className="text-sm font-medium text-green-700">{user.notificationEmail}</p>
            </div>
          ) : (
            <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-xs text-yellow-700">
                Aucun email de notification configuré. Vous ne recevrez pas d'emails de notification.
              </p>
            </div>
          )}
          
          <input
            type="email"
            name="notificationEmail"
            value={formData.notificationEmail}
            onChange={onInputChange}
            placeholder={user?.notificationEmail || "votre-email@exemple.com"}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            {user?.notificationEmail 
              ? "Modifiez cet email pour changer votre adresse de notification. Laissez vide pour désactiver les notifications."
              : "Saisissez votre email pour recevoir toutes les notifications importantes. Laissez vide pour ne pas recevoir d'emails."
            }
          </p>
          {formData.notificationEmail && formData.notificationEmail !== user?.notificationEmail && (
            <p className="text-xs text-blue-600 mt-1">
              Nouvel email : {formData.notificationEmail}
            </p>
          )}
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mt-6">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Types de notifications reçues :</h3>
          <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
            <li>Messages depuis le formulaire de contact</li>
            <li>Nouvelles commandes importantes</li>
            <li>Produits en attente d'approbation</li>
            <li>Alertes système importantes</li>
          </ul>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={onReset}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            <X className="h-4 w-4 inline mr-2" />
            Annuler
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={saving}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4 inline mr-2" />
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationsTab;

