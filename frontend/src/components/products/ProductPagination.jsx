import React from 'react';
import { useTranslation } from 'react-i18next';

const ProductPagination = ({ currentPage, totalPages, onPageChange }) => {
  const { t } = useTranslation('public');
  if (totalPages <= 1) return null;

  return (
    <div className="mt-8 flex justify-center">
      <nav className="flex items-center space-x-2">
        <button
          onClick={() => {
            const newPage = Math.max(1, currentPage - 1);
            onPageChange(newPage);
          }}
          disabled={currentPage === 1}
          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-harvests-light disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t('products.pagination.previous')}
        </button>

        {[...Array(totalPages)].map((_, i) => {
          const page = i + 1;
          const isCurrentPage = page === currentPage;
          const isNearCurrent = Math.abs(page - currentPage) <= 2;
          const isFirstOrLast = page === 1 || page === totalPages;

          if (!isNearCurrent && !isFirstOrLast) {
            if (page === 2 || page === totalPages - 1) {
              return (
                <span
                  key={page}
                  className="px-3 py-2 text-sm text-gray-500"
                >
                  ...
                </span>
              );
            }
            return null;
          }

          return (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                isCurrentPage
                  ? "bg-green-600 text-white"
                  : "text-gray-700 bg-white border border-gray-300 hover:bg-harvests-light"
              }`}
            >
              {page}
            </button>
          );
        })}

        <button
          onClick={() => {
            const newPage = Math.min(totalPages, currentPage + 1);
            onPageChange(newPage);
          }}
          disabled={currentPage === totalPages}
          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-harvests-light disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t('products.pagination.next')}
        </button>
      </nav>
    </div>
  );
};

export default ProductPagination;

