import React from 'react';
import { FiStar } from 'react-icons/fi';

const VendorReviewsList = ({ reviews }) => {
  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <FiStar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun avis</h3>
        <p className="text-gray-500">Ce vendeur n'a pas encore reçu d'avis.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div key={review._id} className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-gray-600">
                  {review.reviewer?.firstName?.[0] || 'A'}
                </span>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h4 className="text-sm font-medium text-gray-900">
                  {review.reviewer?.firstName} {review.reviewer?.lastName}
                </h4>
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <FiStar
                      key={i}
                      className={`w-4 h-4 ${
                        i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-2">{review.comment}</p>
              <div className="text-xs text-gray-500">
                {new Date(review.createdAt).toLocaleDateString('fr-FR')}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default VendorReviewsList;

