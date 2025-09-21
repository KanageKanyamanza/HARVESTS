import React from 'react';
import { useTranslation } from 'react-i18next';

const Products = () => {
  const { t } = useTranslation();

  return (
    <div className="container-xl py-8">
      <div className="text-center">
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-4">
          {t('products.title')}
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Page en cours de développement
        </p>
        <div className="animate-bounce-gentle">🚧</div>
      </div>
    </div>
  );
};

export default Products;
