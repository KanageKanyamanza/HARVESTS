import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiHome, FiArrowLeft, FiSearch } from 'react-icons/fi';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-harvests-light flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Icône 404 */}
        <div className="mb-8">
          <div className="text-9xl font-bold text-harvests-green opacity-20">404</div>
        </div>

        {/* Message d'erreur */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Page non trouvée
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            Désolé, la page que vous recherchez n'existe pas.
          </p>
          <p className="text-sm text-gray-500">
            Vérifiez l'URL ou utilisez les liens ci-dessous pour naviguer.
          </p>
        </div>

        {/* Informations de debug */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-8">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Informations de debug :</h3>
          <div className="text-xs text-gray-600 space-y-1">
            <p><strong>URL actuelle :</strong> {window.location.pathname}</p>
            <p><strong>Timestamp :</strong> {new Date().toLocaleString()}</p>
            <p><strong>User Agent :</strong> {navigator.userAgent.substring(0, 50)}...</p>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <FiArrowLeft className="h-5 w-5 mr-2" />
              Retour
            </button>
            
            <Link
              to="/"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-harvests-green hover:bg-green-600 transition-colors"
            >
              <FiHome className="h-5 w-5 mr-2" />
              Accueil
            </Link>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <Link
              to="/products"
              className="inline-flex items-center text-sm text-harvests-green hover:text-green-600 hover:underline"
            >
              <FiSearch className="h-4 w-4 mr-1" />
              Voir tous les produits
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
