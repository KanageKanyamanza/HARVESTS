import React, { useState } from 'react';
import { 
  ThumbsUp, 
  ThumbsDown, 
  Calendar, 
  User, 
  CheckCircle,
  Image as ImageIcon,
  Video
} from 'lucide-react';
import StarRating from './StarRating';
import CloudinaryImage from '../common/CloudinaryImage';

const ReviewCard = ({ 
  review, 
  showProductInfo = false, 
  showProducerResponse = true,
  onVoteHelpful = null,
  onVoteUnhelpful = null,
  currentUserId = null
}) => {
  const [isVoting, setIsVoting] = useState(false);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleVote = async (voteType) => {
    if (!onVoteHelpful || !onVoteUnhelpful || isVoting) return;
    
    setIsVoting(true);
    try {
      if (voteType === 'helpful') {
        await onVoteHelpful(review._id);
      } else {
        await onVoteUnhelpful(review._id);
      }
    } catch (error) {
      console.error('Erreur lors du vote:', error);
    } finally {
      setIsVoting(false);
    }
  };

  const hasUserVoted = currentUserId && review.voters?.includes(currentUserId);
  const canVote = currentUserId && !hasUserVoted && review.reviewer._id !== currentUserId;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            {review.reviewer.avatar ? (
              <CloudinaryImage
                src={review.reviewer.avatar}
                alt={review.reviewer.firstName}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                <User className="h-5 w-5 text-gray-600" />
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="text-sm font-medium text-gray-900">
                {review.reviewer.firstName} {review.reviewer.lastName}
              </h4>
              {review.isVerifiedPurchase && (
                <CheckCircle className="h-4 w-4 text-green-500" title="Achat vérifié" />
              )}
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(review.createdAt)}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <StarRating rating={review.rating} size="sm" />
        </div>
      </div>

      {/* Product Info */}
      {showProductInfo && review.product && (
        <div className="mb-4 p-3 bg-harvests-light rounded-lg">
          <div className="flex items-center space-x-3">
            {review.product.images?.[0] && (
              <CloudinaryImage
                src={review.product.images[0].url}
                alt={review.product.name}
                className="h-12 w-12 rounded object-cover"
              />
            )}
            <div>
              <h5 className="text-sm font-medium text-gray-900">
                {review.product.name}
              </h5>
              <p className="text-xs text-gray-500">
                Par {review.producer?.firstName} {review.producer?.lastName}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Rating Details */}
      {review.detailedRating && (
        <div className="mb-4 p-3 bg-harvests-light rounded-lg">
          <h5 className="text-sm font-medium text-gray-900 mb-2">Détails de l'évaluation</h5>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex justify-between">
              <span>Qualité:</span>
              <StarRating rating={review.detailedRating.quality} size="sm" />
            </div>
            <div className="flex justify-between">
              <span>Fraîcheur:</span>
              <StarRating rating={review.detailedRating.freshness} size="sm" />
            </div>
            <div className="flex justify-between">
              <span>Emballage:</span>
              <StarRating rating={review.detailedRating.packaging} size="sm" />
            </div>
            <div className="flex justify-between">
              <span>Livraison:</span>
              <StarRating rating={review.detailedRating.delivery} size="sm" />
            </div>
            <div className="flex justify-between">
              <span>Communication:</span>
              <StarRating rating={review.detailedRating.communication} size="sm" />
            </div>
            <div className="flex justify-between">
              <span>Rapport qualité/prix:</span>
              <StarRating rating={review.detailedRating.valueForMoney} size="sm" />
            </div>
          </div>
        </div>
      )}

      {/* Review Content */}
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {review.title}
        </h3>
        <p className="text-gray-700 leading-relaxed">
          {review.comment}
        </p>
      </div>

      {/* Media */}
      {review.media && review.media.length > 0 && (
        <div className="mb-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {review.media.map((media, index) => (
              <div key={index} className="relative">
                {media.type === 'image' ? (
                  <CloudinaryImage
                    src={media.url}
                    alt={`Image ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                    <Video className="h-6 w-6 text-gray-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Producer Response */}
      {showProducerResponse && review.producerResponse && (
        <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-400 rounded-r-lg">
          <div className="flex items-center space-x-2 mb-2">
            <h5 className="text-sm font-medium text-green-800">
              Réponse du producteur
            </h5>
            <span className="text-xs text-green-600">
              {formatDate(review.producerResponse.respondedAt)}
            </span>
          </div>
          <p className="text-sm text-green-700">
            {review.producerResponse.comment}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => handleVote('helpful')}
            disabled={!canVote || isVoting}
            className={`flex items-center space-x-1 text-sm ${
              canVote 
                ? 'text-gray-600 hover:text-green-600' 
                : 'text-gray-400 cursor-not-allowed'
            }`}
          >
            <ThumbsUp className="h-4 w-4" />
            <span>{review.helpfulVotes || 0}</span>
          </button>
          
          <button
            onClick={() => handleVote('unhelpful')}
            disabled={!canVote || isVoting}
            className={`flex items-center space-x-1 text-sm ${
              canVote 
                ? 'text-gray-600 hover:text-red-600' 
                : 'text-gray-400 cursor-not-allowed'
            }`}
          >
            <ThumbsDown className="h-4 w-4" />
            <span>{review.unhelpfulVotes || 0}</span>
          </button>
        </div>

        {hasUserVoted && (
          <span className="text-xs text-gray-500">
            Vous avez voté
          </span>
        )}
      </div>
    </div>
  );
};

export default ReviewCard;
