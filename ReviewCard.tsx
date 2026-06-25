import React from 'react';
import { cn } from '../../utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none cursor-pointer';
  
  const variants = {
    primary: 'bg-rose-400 text-white hover:bg-rose-600 active:bg-rose-800',
    secondary: 'bg-transparent border-[1.5px] border-rose-400 text-rose-400 hover:bg-rose-50',
    ghost: 'bg-transparent text-ivory-600 hover:text-rose-400 hover:bg-rose-50',
    danger: 'bg-rose-600 text-white hover:bg-rose-800 active:bg-rose-900',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm rounded-full',
    md: 'px-6 py-3 text-base rounded-full',
    lg: 'px-8 py-4 text-lg rounded-full',
  };

  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}