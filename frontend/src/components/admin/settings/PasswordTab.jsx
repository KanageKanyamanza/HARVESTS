import React from 'react';
import { Lock, Save, X } from 'lucide-react';

const PasswordTab = ({
  passwordData,
  errors,
  saving,
  onPasswordChange,
  onSubmit,
  onReset
}) => {
  return (
    <form onSubmit={onSubmit} className="p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
        <Lock className="h-5 w-5 mr-2" />
        Changer le mot de passe
      </h2>

      <div className="space-y-4 max-w-md">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mot de passe actuel *
          </label>
          <input
            type="password"
            value={passwordData.currentPassword}
            onChange={(e) => onPasswordChange('currentPassword', e.target.value)}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nouveau mot de passe *
          </label>
          <input
            type="password"
            value={passwordData.newPassword}
            onChange={(e) => onPasswordChange('newPassword', e.target.value)}
            required
            minLength={6}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <p className="text-xs text-gray-500 mt-1">Minimum 6 caractères</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confirmer le nouveau mot de passe *
          </label>
          <input
            type="password"
            value={passwordData.confirmPassword}
            onChange={(e) => onPasswordChange('confirmPassword', e.target.value)}
            required
            minLength={6}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        {errors.password && (
          <div className="text-sm text-red-600">{errors.password}</div>
        )}
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
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="h-4 w-4 inline mr-2" />
          {saving ? 'Enregistrement...' : 'Changer le mot de passe'}
        </button>
      </div>
    </form>
  );
};

export default PasswordTab;

