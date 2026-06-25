import React from 'react';
import { cn } from '../../utils/cn';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-16 px-4 text-center',
        className
      )}
    >
      {icon && <div className="mb-4 text-ivory-400">{icon}</div>}
      <h3 className="text-xl font-heading text-ivory-900 mb-2">{title}</h3>
      <p className="muted-text max-w-md mb-6">{description}</p>
      {action}
    </div>
  );
}