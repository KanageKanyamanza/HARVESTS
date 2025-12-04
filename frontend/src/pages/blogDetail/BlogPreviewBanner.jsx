import React from 'react';
import { Eye } from 'lucide-react';

const BlogPreviewBanner = ({ onClose }) => {
  return (
    <div className="bg-yellow-100 border-b border-yellow-200 px-4 py-2">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <Eye className="h-4 w-4 text-yellow-600 mr-2" />
          <span className="text-sm font-medium text-yellow-800">
            Mode prévisualisation - Article non publié
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-sm text-yellow-600 hover:text-yellow-800"
        >
          Fermer
        </button>
      </div>
    </div>
  );
};

export default BlogPreviewBanner;

