import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services';
import { FiMail, FiX, FiRefreshCw, FiCheck, FiAlertCircle } from 'react-icons/fi';

const EmailVerificationModal = ({ isOpen, onClose, email, isRegistration = false }) => {
  const { verifyEmail } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState(null);

  const handleResendEmail = async () => {
    setIsResending(true);
    setResendStatus(null);
    
    try {
      // Appel API pour renvoyer l'email de vérification
      await authService.resendVerification(email);
      setResendStatus('success');
    } catch (error) {
      console.error('Erreur lors du renvoi de l\'email:', error);
      setResendStatus('error');
    } finally {
      setIsResending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" data-modal-open="true">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md transform overflow-hidden rounded-lg bg-white shadow-xl transition-all">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <FiMail className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {isRegistration ? 'Vérifiez votre email' : 'Email non vérifié'}
                </h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-harvests-green focus:ring-offset-2 rounded-md"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {isRegistration ? (
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                  <FiCheck className="h-8 w-8 text-green-600" />
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  Inscription réussie !
                </h4>
                <p className="text-gray-600 mb-4">
                  Nous avons envoyé un email de vérification à :
                </p>
                <p className="font-medium text-harvests-green mb-4">
                  {email}
                </p>
                <p className="text-sm text-gray-500 mb-6">
                  Cliquez sur le lien dans l'email pour activer votre compte et commencer à utiliser Harvests.
                </p>
              </div>
            ) : (
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-4">
                  <FiAlertCircle className="h-8 w-8 text-yellow-600" />
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  Vérification requise
                </h4>
                <p className="text-gray-600 mb-4">
                  Votre email n'est pas encore vérifié. Vous devez vérifier votre email avant de pouvoir vous connecter.
                </p>
                <p className="font-medium text-gray-900 mb-4">
                  {email}
                </p>
                <p className="text-sm text-gray-500 mb-6">
                  Vérifiez votre boîte email et cliquez sur le lien de vérification.
                </p>
              </div>
            )}

            {/* Resend Email Section */}
            <div className="border-t border-gray-200 pt-4">
              <p className="text-sm text-gray-600 mb-3">
                Vous n'avez pas reçu l'email ?
              </p>
              
              {resendStatus === 'success' && (
                <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex items-center">
                    <FiCheck className="h-4 w-4 text-green-600 mr-2" />
                    <p className="text-sm text-green-700">
                      Email de vérification renvoyé avec succès !
                    </p>
                  </div>
                </div>
              )}

              {resendStatus === 'error' && (
                <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-md">
                  <div className="flex items-center">
                    <FiAlertCircle className="h-4 w-4 text-red-600 mr-2" />
                    <p className="text-sm text-red-700">
                      Erreur lors du renvoi. Veuillez réessayer.
                    </p>
                  </div>
                </div>
              )}

              <button
                onClick={handleResendEmail}
                disabled={isResending || resendStatus === 'success'}
                className="w-full flex items-center justify-center px-4 py-2 border border-harvests-green text-harvests-green bg-white rounded-md hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-harvests-green focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isResending ? (
                  <>
                    <FiRefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <FiMail className="w-4 h-4 mr-2" />
                    Renvoyer l'email de vérification
                  </>
                )}
              </button>
            </div>

            {/* Instructions */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h5 className="text-sm font-medium text-blue-900 mb-2">
                Instructions :
              </h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Vérifiez votre boîte de réception</li>
                <li>• Regardez aussi dans les spams/indésirables</li>
                <li>• Cliquez sur le lien de vérification</li>
                <li>• Revenez vous connecter</li>
              </ul>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
            {isRegistration ? (
              <button
                onClick={onClose}
                className="px-4 py-2 bg-harvests-green text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-harvests-green focus:ring-offset-2 transition-colors"
              >
                J'ai compris
              </button>
            ) : (
              <>
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-harvests-green focus:ring-offset-2 transition-colors"
                >
                  Fermer
                </button>
                <button
                  onClick={() => window.location.href = '/login'}
                  className="px-4 py-2 bg-harvests-green text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-harvests-green focus:ring-offset-2 transition-colors"
                >
                  Aller à la connexion
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationModal;
