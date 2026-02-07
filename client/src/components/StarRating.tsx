import React, { useState } from 'react';

interface StarRatingProps {
  rating: number;
  onRate: (rating: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  onRate,
  readonly = false,
  size = 'md',
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeClass = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
  }[size];

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => !readonly && onRate(star)}
          onMouseEnter={() => !readonly && setHoverRating(star)}
          onMouseLeave={() => setHoverRating(0)}
          disabled={readonly}
          className={`${sizeClass} transition-colors ${
            readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
          }`}
        >
          {star <= (hoverRating || rating) ? (
            <span className="text-yellow-400">★</span>
          ) : (
            <span className="text-gray-300">★</span>
          )}
        </button>
      ))}
    </div>
  );
};
