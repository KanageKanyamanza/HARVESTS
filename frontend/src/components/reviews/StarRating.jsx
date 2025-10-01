import React from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ 
  rating = 0, 
  maxRating = 5, 
  size = 'md', 
  interactive = false, 
  onRatingChange = null,
  showText = false,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
    xl: 'h-6 w-6'
  };

  const textClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  };

  const getRatingText = (rating) => {
    const texts = {
      1: 'Très mauvais',
      2: 'Mauvais',
      3: 'Moyen',
      4: 'Bon',
      5: 'Excellent'
    };
    return texts[rating] || '';
  };

  const handleStarClick = (starRating) => {
    if (interactive && onRatingChange) {
      onRatingChange(starRating);
    }
  };

  const handleMouseEnter = (starRating) => {
    if (interactive) {
      // Effet de survol pour l'interactivité
    }
  };

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      <div className="flex">
        {Array.from({ length: maxRating }, (_, index) => {
          const starRating = index + 1;
          const isFilled = starRating <= rating;
          const isHalf = starRating === Math.ceil(rating) && rating % 1 !== 0;
          
          return (
            <button
              key={index}
              type="button"
              className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'} focus:outline-none`}
              onClick={() => handleStarClick(starRating)}
              onMouseEnter={() => handleMouseEnter(starRating)}
              disabled={!interactive}
            >
              <Star
                className={`${sizeClasses[size]} ${
                  isFilled 
                    ? 'text-yellow-400 fill-current' 
                    : 'text-gray-300'
                } transition-colors`}
              />
            </button>
          );
        })}
      </div>
      {showText && (
        <span className={`${textClasses[size]} text-gray-600 ml-2`}>
          {getRatingText(Math.round(rating))}
        </span>
      )}
      {interactive && (
        <span className={`${textClasses[size]} text-gray-500 ml-2`}>
          {rating > 0 ? `${rating}/${maxRating}` : 'Noter'}
        </span>
      )}
    </div>
  );
};

export default StarRating;
