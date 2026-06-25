import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '../../utils/cn';

interface StarRatingProps {
  rating: number;
  reviewCount?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

export function StarRating({
  rating,
  reviewCount,
  size = 'sm',
  interactive = false,
  onChange,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = React.useState(0);

  const sizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <div className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= Math.floor(interactive ? hoverRating || rating : rating);
        const half = !filled && star - 0.5 <= rating;

        return (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onMouseEnter={() => interactive && setHoverRating(star)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            onClick={() => interactive && onChange?.(star)}
            className={cn(
              'transition-colors',
              interactive ? 'cursor-pointer' : 'cursor-default'
            )}
          >
            <Star
              className={cn(
                sizes[size],
                filled
                  ? 'star-filled fill-gold-200'
                  : half
                  ? 'star-filled fill-gold-200 opacity-50'
                  : 'star-empty'
              )}
            />
          </button>
        );
      })}
      {reviewCount !== undefined && (
        <span className="ml-1.5 muted-text">({reviewCount})</span>
      )}
    </div>
  );
}