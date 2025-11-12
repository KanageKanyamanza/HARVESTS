import React, { useState } from 'react';
import { FiEdit2, FiCheck, FiX, FiCreditCard, FiShield, FiAlertCircle } from 'react-icons/fi';
import { commonService } from '../../services';
import { useNotifications } from '../../contexts/NotificationContext';

// Composant pour gérer les informations financières communes
const FinancialInfo = ({ bankAccount, paymentMethods, onUpdate, loading = false }) => {
  const { showSuccess, showError } = useNotifications();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    accountName: bankAccount?.accountName || '',
    accountNumber: bankAccount?.accountNumber || '',
    bankName: bankAccount?.bankName || '',
    bankCode: bankAccount?.bankCode || '',
    swiftCode: bankAccount?.swiftCode || '',
    paymentMethods: paymentMethods || ['cash', 'paypal']
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePaymentMethodChange = (method) => {
    setFormData(prev => ({
      ...prev,
      paymentMethods: prev.paymentMethods.includes(method)
        ? prev.paymentMethods.filter(m => m !== method)
        : [...prev.paymentMethods, method]
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Mettre à jour le compte bancaire
      if (formData.accountName || formData.accountNumber) {
        await commonService.updateBankAccount({
          accountName: formData.accountName,
          accountNumber: formData.accountNumber,
          bankName: formData.bankName,
          bankCode: formData.bankCode,
          swiftCode: formData.swiftCode
        });
      }

      // Mettre à jour les méthodes de paiement
      await commonService.updatePaymentMethods(formData.paymentMethods);

      showSuccess('Informations financières mises à jour avec succès');
      setIsEditing(false);
      onUpdate && onUpdate();
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      showError('Erreur lors de la mise à jour des informations financières');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      accountName: bankAccount?.accountName || '',
      accountNumber: bankAccount?.accountNumber || '',
      bankName: bankAccount?.bankName || '',
      bankCode: bankAccount?.bankCode || '',
      swiftCode: bankAccount?.swiftCode || '',
      paymentMethods: paymentMethods || ['cash', 'paypal']
    });
    setIsEditing(false);
  };

  const paymentMethodOptions = [
    { value: 'cash', label: 'Paiement à la livraison' },
    { value: 'paypal', label: 'PayPal' }
  ];

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <FiCreditCard className="mr-2" />
          Informations financières
        </h3>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center px-3 py-2 text-sm text-harvests-green hover:text-green-600 transition-colors"
          >
            <FiEdit2 className="mr-1" />
            Modifier
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center px-3 py-2 text-sm text-white bg-harvests-green hover:bg-green-600 rounded-md transition-colors disabled:opacity-50"
            >
              <FiCheck className="mr-1" />
              {saving ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              <FiX className="mr-1" />
              Annuler
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-6">
          {/* Informations bancaires */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4">Compte bancaire</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom du titulaire
                </label>
                <input
                  type="text"
                  name="accountName"
                  value={formData.accountName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-harvests-green focus:border-transparent"
                  placeholder="Nom du titulaire du compte"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Numéro de compte
                </label>
                <input
                  type="text"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-harvests-green focus:border-transparent"
                  placeholder="Numéro de compte"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom de la banque
                </label>
                <input
                  type="text"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-harvests-green focus:border-transparent"
                  placeholder="Nom de la banque"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Code banque
                </label>
                <input
                  type="text"
                  name="bankCode"
                  value={formData.bankCode}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-harvests-green focus:border-transparent"
                  placeholder="Code banque"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Code SWIFT (optionnel)
                </label>
                <input
                  type="text"
                  name="swiftCode"
                  value={formData.swiftCode}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-harvests-green focus:border-transparent"
                  placeholder="Code SWIFT"
                />
              </div>
            </div>
          </div>

          {/* Méthodes de paiement */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4">Méthodes de paiement acceptées</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {paymentMethodOptions.map((option) => (
                <label key={option.value} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.paymentMethods.includes(option.value)}
                    onChange={() => handlePaymentMethodChange(option.value)}
                    className="h-4 w-4 text-harvests-green focus:ring-harvests-green border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Affichage des informations bancaires */}
          {bankAccount?.accountName ? (
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3">Compte bancaire</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Titulaire</p>
                    <p className="font-medium">{bankAccount.accountName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Numéro de compte</p>
                    <p className="font-medium">{bankAccount.accountNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Banque</p>
                    <p className="font-medium">{bankAccount.bankName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Code banque</p>
                    <p className="font-medium">{bankAccount.bankCode}</p>
                  </div>
                  {bankAccount.swiftCode && (
                    <div>
                      <p className="text-sm text-gray-600">Code SWIFT</p>
                      <p className="font-medium">{bankAccount.swiftCode}</p>
                    </div>
                  )}
                </div>
                <div className="mt-3 flex items-center">
                  {bankAccount.isVerified ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <FiShield className="mr-1" />
                      Vérifié
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      <FiAlertCircle className="mr-1" />
                      Non vérifié
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FiCreditCard className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p>Aucune information bancaire enregistrée</p>
              <p className="text-sm">Cliquez sur "Modifier" pour ajouter vos informations bancaires</p>
            </div>
          )}

          {/* Affichage des méthodes de paiement */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-3">Méthodes de paiement acceptées</h4>
            <div className="flex flex-wrap gap-2">
              {paymentMethods?.map((method) => {
                const option = paymentMethodOptions.find(opt => opt.value === method);
                return option ? (
                  <span
                    key={method}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-harvests-light text-harvests-green"
                  >
                    {option.label}
                  </span>
                ) : null;
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialInfo;
