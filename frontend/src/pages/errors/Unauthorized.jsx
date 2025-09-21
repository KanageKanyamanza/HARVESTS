import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useUserType } from '../../hooks/useUserType';
import { FiShield, FiArrowLeft, FiHome } from 'react-icons/fi';

const Unauthorized = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userDisplayName } = useAuth();
  const { getDefaultRoute, userType } = useUserType();

  const message = location.state?.message || 'Vous n\'avez pas l\'autorisation d\'accéder à cette page.';
  const fromPath = location.state?.from;

  const handleGoBack = () => {
    if (fromPath) {
      navigate(-1);
    } else {
      navigate(getDefaultRoute(userType));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            {/* Icon */}
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
              <FiShield className="h-8 w-8 text-red-600" />
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Accès refusé
            </h1>

            {/* Message */}
            <p className="text-gray-600 mb-6">
              {message}
            </p>

            {/* User info */}
            {userDisplayName && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-500">Connecté en tant que</p>
                <p className="font-medium text-gray-900">{userDisplayName}</p>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={handleGoBack}
                className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-harvests-green hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-harvests-green"
              >
                <FiArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </button>

              <Link
                to={getDefaultRoute(userType)}
                className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-harvests-green"
              >
                <FiHome className="h-4 w-4 mr-2" />
                Aller au tableau de bord
              </Link>

              <Link
                to="/"
                className="w-full flex justify-center items-center px-4 py-2 text-sm font-medium text-harvests-green hover:text-green-600"
              >
                Retour à l'accueil
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Additional info */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Besoin d'aide ?
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  Si vous pensez que c'est une erreur, contactez notre support ou 
                  vérifiez que votre compte dispose des bonnes permissions.
                </p>
              </div>
              <div className="mt-4">
                <div className="-mx-2 -my-1.5 flex">
                  <Link
                    to="/support"
                    className="bg-blue-50 px-2 py-1.5 rounded-md text-sm font-medium text-blue-800 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-50 focus:ring-blue-600"
                  >
                    Contacter le support
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
