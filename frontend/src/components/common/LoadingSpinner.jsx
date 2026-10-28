import React from 'react';

const LoadingSpinner = ({ size = 'md', text = null, className = '' }) => {

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
          {text || 'Chargement...'}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;
