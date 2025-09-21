import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, RefreshCw, AlertTriangle } from 'lucide-react';

const ServerError = () => {
  const { t } = useTranslation();

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          {/* Error Icon */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
              <AlertTriangle className="h-10 w-10 text-red-600" />
            </div>
          </div>

          <h1 className="text-3xl font-display font-bold text-gray-900 mb-4">
            {t('errors.serverError')}
          </h1>
          
          <p className="text-lg text-gray-600 mb-8">
            Une erreur inattendue s'est produite sur nos serveurs. Nous travaillons à résoudre le problème.
          </p>

          <div className="space-y-4">
            <button
              onClick={handleRefresh}
              className="btn-primary btn-lg w-full inline-flex items-center justify-center"
            >
              <RefreshCw className="h-5 w-5 mr-2" />
              {t('errors.tryAgain')}
            </button>
            
            <Link
              to="/"
              className="btn-outline btn-lg w-full inline-flex items-center justify-center"
            >
              <Home className="h-5 w-5 mr-2" />
              Retour à l'Accueil
            </Link>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Le problème persiste ?{' '}
              <Link to="/contact" className="text-primary-600 hover:text-primary-500">
                {t('errors.contactSupport')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServerError;
