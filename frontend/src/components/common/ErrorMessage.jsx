import React from 'react';
import { FiAlertCircle } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

const ErrorMessage = ({ message, onRetry, className = '' }) => {
  const { t } = useTranslation('common');
  return (
    <div className={`bg-red-50 border border-red-200 rounded-lg p-6 text-center ${className}`}>
      <div className="flex flex-col items-center">
        <FiAlertCircle className="h-12 w-12 text-red-400 mb-4" />
        <h3 className="text-lg font-medium text-red-800 mb-2">
          {t('errorMessage.title')}
        </h3>
        <p className="text-red-600 mb-4">
          {message || t('errorMessage.default')}
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            {t('errorMessage.retry')}
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;
