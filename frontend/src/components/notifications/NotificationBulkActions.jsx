import React from 'react';
import { Check, Trash2 } from 'lucide-react';

const NotificationBulkActions = ({ 
  selectedCount, 
  onMarkAsRead, 
  onDelete 
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
      <span className="text-sm sm:text-base text-green-800 font-medium">
        {selectedCount} notification{selectedCount > 1 ? 's' : ''} sélectionnée{selectedCount > 1 ? 's' : ''}
      </span>
      <div className="flex items-center space-x-2 sm:space-x-3">
        <button
          onClick={onMarkAsRead}
          className="px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center text-sm sm:text-base"
        >
          <Check className="h-4 w-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Marquer comme lu</span>
          <span className="sm:hidden">Lire</span>
        </button>
        <button
          onClick={onDelete}
          className="px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center text-sm sm:text-base"
        >
          <Trash2 className="h-4 w-4 mr-1 sm:mr-2" />
          Supprimer
        </button>
      </div>
    </div>
  );
};

export default NotificationBulkActions;

