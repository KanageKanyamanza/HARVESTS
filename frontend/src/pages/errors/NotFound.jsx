import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, ArrowLeft, Search } from 'lucide-react';

const NotFound = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          {/* 404 Animation */}
          <div className="mb-8">
            <div className="text-9xl font-bold text-primary-500 mb-4">404</div>
            <div className="w-24 h-1 bg-primary-500 mx-auto rounded-full"></div>
          </div>

          <h1 className="text-3xl font-display font-bold text-gray-900 mb-4">
            {t('errors.pageNotFound')}
          </h1>
          
          <p className="text-lg text-gray-600 mb-8">
            La page que vous recherchez n'existe pas ou a été déplacée.
          </p>

          <div className="space-y-4">
            <Link
              to="/"
              className="btn-primary btn-lg w-full inline-flex items-center justify-center"
            >
              <Home className="h-5 w-5 mr-2" />
              Retour à l'Accueil
            </Link>
            
            <Link
              to="/products"
              className="btn-outline btn-lg w-full inline-flex items-center justify-center"
            >
              <Search className="h-5 w-5 mr-2" />
              Explorer les Produits
            </Link>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Besoin d'aide ?{' '}
              <Link to="/contact" className="text-primary-600 hover:text-primary-500">
                Contactez-nous
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
