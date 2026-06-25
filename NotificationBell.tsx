import React, { useState } from 'react';
import { Image } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  className?: string;
  fallbackClassName?: string;
  /** Background color/gradient to show when image fails, e.g. 'bg-rose-50' */
  fallbackBg?: string;
  /** Icon color class, e.g. 'text-rose-300' */
  fallbackIconColor?: string;
  /** Whether to show a fallback icon */
  showFallbackIcon?: boolean;
  /** Extra props to pass to the img element */
  imgProps?: React.ImgHTMLAttributes<HTMLImageElement>;
}

/**
 * Image component that gracefully falls back to a colored background + icon
 * when the image fails to load (broken URL, network error, etc.)
 */
export function ImageWithFallback({
  src,
  alt,
  className,
  fallbackClassName,
  fallbackBg = 'bg-rose-50',
  fallbackIconColor = 'text-rose-300',
  showFallbackIcon = true,
  imgProps,
}: ImageWithFallbackProps) {
  const [hasError, setHasError] = useState(!src);

  // Reset error if src changes
  React.useEffect(() => {
    setHasError(!src);
  }, [src]);

  if (hasError) {
    return (
      <div
        className={cn(
          'flex items-center justify-center',
          fallbackBg,
          fallbackClassName || className
        )}
        aria-label={alt}
        role="img"
      >
        {showFallbackIcon && (
          <Image className={cn('w-8 h-8', fallbackIconColor)} />
        )}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setHasError(true)}
      {...imgProps}
    />
  );
}
