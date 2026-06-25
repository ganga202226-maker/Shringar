import React from 'react';
import { cn } from '../../utils/cn';

interface LoadingShimmerProps {
  className?: string;
  count?: number;
}

export function LoadingShimmer({ className, count = 1 }: LoadingShimmerProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn('shimmer', className)}
        />
      ))}
    </>
  );
}

// Skeleton variants for common components
export function SalonCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="shimmer h-48 w-full" />
      <div className="p-4 space-y-3">
        <div className="shimmer h-5 w-3/4" />
        <div className="shimmer h-4 w-1/2" />
        <div className="flex gap-2">
          <div className="shimmer h-4 w-20" />
          <div className="shimmer h-4 w-16" />
        </div>
        <div className="shimmer h-6 w-24" />
      </div>
    </div>
  );
}