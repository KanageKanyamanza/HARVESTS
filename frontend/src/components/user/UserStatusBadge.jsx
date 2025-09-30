import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useUserType } from '../../hooks/useUserType';
import { 
  FiCheck, 
  FiClock, 
  FiAlertCircle, 
  FiMail, 
  FiShield,
  FiUser 
} from 'react-icons/fi';

/**
 * Composant pour afficher le statut et les badges de l'utilisateur
 */
const UserStatusBadge = ({ showDetails = false, className = '' }) => {
  const { 
    isEmailVerified, 
    isAccountApproved, 
    isAccountActive,
    isProfileComplete,
    userType 
  } = useAuth();
  
  const { displayLabel, displayIcon } = useUserType();

  const getStatusConfig = () => {
    // Compte inactif
    if (!isAccountActive) {
      return {
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: FiAlertCircle,
        text: 'Compte désactivé',
        description: 'Votre compte a été désactivé. Contactez le support.'
      };
    }

    // Email non vérifié
    if (!isEmailVerified) {
      return {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: FiMail,
        text: 'Email non vérifié',
        description: 'Vérifiez votre email pour activer votre compte.'
      };
    }

    // Compte en attente d'approbation (pour certains types)
    if (['producer', 'transformer', 'exporter', 'transporter'].includes(userType) && !isAccountApproved) {
      return {
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: FiClock,
        text: 'En attente d\'approbation',
        description: 'Votre compte est en cours de vérification par notre équipe.'
      };
    }

    // Profil incomplet
    if (!isProfileComplete) {
      return {
        color: 'bg-orange-100 text-orange-800 border-orange-200',
        icon: FiUser,
        text: 'Profil incomplet',
        description: 'Complétez votre profil pour accéder à toutes les fonctionnalités.'
      };
    }

    // Compte actif
    return {
      color: 'bg-green-100 text-green-800 border-green-200',
      icon: FiCheck,
      text: 'Compte actif',
      description: 'Votre compte est entièrement configuré et actif.'
    };
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Badge principal */}
      <div className="flex items-center space-x-2">
        {/* Type d'utilisateur */}
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
          <span className="mr-1">{displayIcon}</span>
          {displayLabel}
        </span>

        {/* Statut */}
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusConfig.color}`}>
          <StatusIcon className="w-3 h-3 mr-1" />
          {statusConfig.text}
        </span>
      </div>

      {/* Détails additionnels */}
      {showDetails && (
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            {statusConfig.description}
          </p>

          {/* Badges de vérification */}
          <div className="flex flex-wrap gap-1">
            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
              isEmailVerified 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              <FiMail className="w-3 h-3 mr-1" />
              Email {isEmailVerified ? 'vérifié' : 'non vérifié'}
            </span>

            {['producer', 'transformer', 'exporter', 'transporter'].includes(userType) && (
              <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                isAccountApproved 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                <FiShield className="w-3 h-3 mr-1" />
                {isAccountApproved ? 'Approuvé' : 'En attente'}
              </span>
            )}

            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
              isProfileComplete 
                ? 'bg-green-100 text-green-800' 
                : 'bg-orange-100 text-orange-800'
            }`}>
              <FiUser className="w-3 h-3 mr-1" />
              Profil {isProfileComplete ? 'complet' : 'incomplet'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserStatusBadge;
