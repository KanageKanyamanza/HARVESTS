import React from 'react';
import { FiShield, FiCheckCircle, FiAlertCircle, FiRefreshCw } from 'react-icons/fi';

const VerificationStatus = ({ verificationStatus, onRefresh }) => {
  if (!verificationStatus) return null;

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center justify-between">
          <div className="flex items-center">
            <FiShield className="mr-2" />
            Statut de vérification
          </div>
          <button
            onClick={onRefresh}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Rafraîchir le statut"
          >
            <FiRefreshCw className="w-4 h-4" />
          </button>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-3 ${
                verificationStatus.email?.verified ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <div>
                <p className="font-medium">Email</p>
                <p className="text-sm text-gray-600">
                  {verificationStatus.email?.verified ? 'Vérifié' : 'Non vérifié'}
                </p>
              </div>
            </div>
            {verificationStatus.email?.verified ? (
              <FiCheckCircle className="text-green-500" />
            ) : (
              <FiAlertCircle className="text-red-500" />
            )}
          </div>
          
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-3 ${
                verificationStatus.phone?.verified ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <div>
                <p className="font-medium">Téléphone</p>
                <p className="text-sm text-gray-600">
                  {verificationStatus.phone?.verified ? 'Vérifié' : 'Non vérifié'}
                </p>
              </div>
            </div>
            {verificationStatus.phone?.verified ? (
              <FiCheckCircle className="text-green-500" />
            ) : (
              <FiAlertCircle className="text-red-500" />
            )}
          </div>
        </div>
        
        <div className="mt-6">
          <h4 className="font-medium mb-3">Niveau de vérification</h4>
          <div className="bg-gray-100 rounded-lg p-4">
            <p className="text-sm text-gray-600">
              {verificationStatus.overall?.level || 'Non vérifié'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationStatus;

