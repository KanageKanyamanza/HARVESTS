import React from 'react';
import { FiMail, FiAlertCircle, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services';

const EmailVerificationRequired = ({ errorData, onResendEmail }) => {
  const { user } = useAuth();
  const [isResending, setIsResending] = React.useState(false);
  const [resendStatus, setResendStatus] = React.useState(null);

  const handleResendEmail = async () => {
    if (!user?.email) return;

    setIsResending(true);
    setResendStatus(null);

    try {
      await authService.resendVerification(user.email);
      setResendStatus('success');
      if (onResendEmail) onResendEmail();
    } catch (error) {
      console.error('Erreur lors du renvoi de l\'email:', error);
      setResendStatus('error');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 my-6">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <FiMail className="h-6 w-6 text-yellow-600" />
        </div>
        <div className="ml-4 flex-1">
          <h3 className="text-lg font-medium text-yellow-800">
            {errorData?.message || 'Vérification d\'email requise'}
          </h3>
          <p className="mt-2 text-sm text-yellow-700">
            {errorData?.suggestion || 'Vérifiez votre email pour débloquer cette fonctionnalité'}
          </p>

          {/* Actions autorisées */}
          {errorData?.allowedActions && errorData.allowedActions.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-yellow-800 mb-2">Actions autorisées :</p>
              <ul className="list-disc list-inside space-y-1">
                {errorData.allowedActions.map((action, index) => (
                  <li key={index} className="text-sm text-yellow-700 flex items-center">
                    <FiCheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    {action}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions restreintes */}
          {errorData?.restrictedActions && errorData.restrictedActions.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-yellow-800 mb-2">Actions non disponibles :</p>
              <ul className="list-disc list-inside space-y-1">
                {errorData.restrictedActions.map((action, index) => (
                  <li key={index} className="text-sm text-yellow-700 flex items-center">
                    <FiXCircle className="h-4 w-4 text-red-500 mr-2" />
                    {action}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Message de statut du renvoi */}
          {resendStatus === 'success' && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-center">
                <FiCheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <p className="text-sm text-green-700">
                  Email de vérification renvoyé avec succès ! Vérifiez votre boîte de réception.
                </p>
              </div>
            </div>
          )}

          {resendStatus === 'error' && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center">
                <FiAlertCircle className="h-5 w-5 text-red-600 mr-2" />
                <p className="text-sm text-red-700">
                  Erreur lors du renvoi. Veuillez réessayer.
                </p>
              </div>
            </div>
          )}

          {/* Bouton de renvoi */}
          <div className="mt-4">
            <button
              onClick={handleResendEmail}
              disabled={isResending || resendStatus === 'success' || !user?.email}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isResending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Envoi en cours...
                </>
              ) : resendStatus === 'success' ? (
                <>
                  <FiCheckCircle className="h-4 w-4 mr-2" />
                  Email renvoyé
                </>
              ) : (
                <>
                  <FiMail className="h-4 w-4 mr-2" />
                  Renvoyer l'email de vérification
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationRequired;

