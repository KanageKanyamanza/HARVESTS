import React from 'react';

const NotificationPagination = ({ 
  currentPage, 
  totalPages, 
  total, 
  onPageChange,
  isMobile = false 
}) => {
  if (totalPages <= 1) return null;

  if (isMobile) {
    return (
      <div className="md:hidden bg-white rounded-lg shadow p-4 mt-4">
        <div className="flex flex-col space-y-3">
          <div className="text-center text-sm text-gray-700">
            Page {currentPage} / {totalPages} • {total} notification{total > 1 ? 's' : ''}
          </div>
          <div className="flex items-center justify-between space-x-2">
            <button
              onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 bg-white"
            >
              Précédent
            </button>
            <button
              onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 bg-white"
            >
              Suivant
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="hidden md:flex bg-gray-50 px-6 py-4 border-t border-gray-200 items-center justify-between">
      <div className="text-sm text-gray-700">
        Affichage de {((currentPage - 1) * 20) + 1} à {Math.min(currentPage * 20, total)} sur {total} notifications
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          Précédent
        </button>
        <span className="px-4 py-2 text-sm text-gray-700">
          Page {currentPage} / {totalPages}
        </span>
        <button
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          Suivant
        </button>
      </div>
    </div>
  );
};

export default NotificationPagination;

