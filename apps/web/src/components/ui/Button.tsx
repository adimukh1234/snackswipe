'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', isLoading, className, children, disabled, ...props }, ref) => {
    const baseStyles = `
      inline-flex items-center justify-center gap-2.5
      font-semibold tracking-tight
      transition-all duration-200 
      disabled:opacity-50 disabled:cursor-not-allowed
      focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2
      min-h-[44px]
    `;
    
    const variants = {
      primary: `
        bg-gradient-to-r from-purple-500 to-purple-600 
        text-white 
        shadow-[0_8px_24px_rgba(147,51,234,0.25)]
        hover:shadow-[0_12px_32px_rgba(147,51,234,0.35)]
        active:shadow-[0_4px_16px_rgba(147,51,234,0.25)]
      `,
      secondary: `
        bg-white 
        text-purple-600 
        border-[1.5px] border-purple-200
        shadow-sm
        hover:bg-purple-50 hover:border-purple-300 hover:shadow-md
      `,
      ghost: `
        bg-transparent 
        text-purple-600 
        hover:bg-purple-50
      `,
    };
    
    const sizes = {
      sm: 'px-4 py-2.5 text-sm rounded-xl min-h-[40px]',
      md: 'px-6 py-3 text-[0.9375rem] rounded-2xl min-h-[48px]',
      lg: 'px-8 py-4 text-base rounded-2xl min-h-[52px]',
    };

    return (
      <motion.button
        ref={ref}
        type="button"
        whileHover={disabled || isLoading ? undefined : { y: -2, scale: 1.01 }}
        whileTap={disabled || isLoading ? undefined : { scale: 0.98, y: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
          />
        ) : null}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
