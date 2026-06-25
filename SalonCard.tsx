import React from 'react';
import { cn } from '../../utils/cn';

interface BadgeProps {
  variant?: 'rose' | 'gold' | 'success' | 'gray';
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = 'rose', children, className }: BadgeProps) {
  const variants = {
    rose: 'badge-rose',
    gold: 'badge-gold',
    success: 'badge-success',
    gray: 'bg-ivory-100 text-ivory-600 border border-ivory-200 rounded-full px-2.5 py-0.5 text-xs font-medium',
  };

  return (
    <span className={cn(variants[variant], className)}>
      {children}
    </span>
  );
}