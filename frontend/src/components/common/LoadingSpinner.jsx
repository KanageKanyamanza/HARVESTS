import React from 'react';
import { useTranslation } from 'react-i18next';

const LoadingSpinner = ({ size = 'md', text = null, className = '' }) => {
  const { t } = useTranslation();

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-3 ${className}`}>
      <div className="relative">
        {/* Spinner principal */}
        <div
          className={`${sizeClasses[size]} border-4 border-gray-200 border-t-primary-500 rounded-full animate-spin`}
        />
        
        {/* Spinner secondaire pour effet plus riche */}
        <div
          className={`absolute inset-0 ${sizeClasses[size]} border-4 border-transparent border-r-secondary-400 rounded-full animate-spin`}
          style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}
        />
      </div>
      
      {(text || size === 'lg' || size === 'xl') && (
        <p className={`text-gray-600 font-medium ${textSizeClasses[size]}`}>
          {text || t('common.loading')}
        </p>
      )}
    </div>
  );
};

// Composant pour page de chargement pleine
export const FullPageLoader = ({ text }) => {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-90 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-card p-8">
        <LoadingSpinner size="xl" text={text} />
      </div>
    </div>
  );
};

// Composant pour overlay de chargement
export const LoadingOverlay = ({ isLoading, children, text }) => {
  if (!isLoading) {
    return children;
  }

  return (
    <div className="relative">
      {children}
      <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
        <LoadingSpinner size="lg" text={text} />
      </div>
    </div>
  );
};

export default LoadingSpinner;
