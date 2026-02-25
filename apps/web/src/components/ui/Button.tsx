'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 rounded-full cursor-pointer select-none',
          'active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed',
          // Font
          'font-[var(--font-display)]',
          // Variants
          variant === 'primary' && [
            'bg-[#CCFF00] text-black uppercase tracking-wider',
            'shadow-[0_0_20px_rgba(204,255,0,0.3),0_0_40px_rgba(204,255,0,0.1)]',
            'hover:shadow-[0_0_30px_rgba(204,255,0,0.45),0_0_60px_rgba(204,255,0,0.15)]',
          ],
          variant === 'secondary' && [
            'bg-transparent text-[#F5F0EB] border-[1.5px] border-[rgba(255,255,255,0.12)]',
            'hover:border-[#CCFF00] hover:text-[#CCFF00]',
          ],
          variant === 'ghost' && [
            'bg-transparent text-[#F5F0EB]',
            'hover:bg-[rgba(255,255,255,0.05)]',
          ],
          variant === 'danger' && [
            'bg-[rgba(255,46,99,0.15)] text-[#FF2E63] border border-[rgba(255,46,99,0.2)]',
            'hover:bg-[rgba(255,46,99,0.25)]',
          ],
          // Sizes
          size === 'sm' && 'text-xs px-4 py-2 min-h-[36px]',
          size === 'md' && 'text-sm px-6 py-3 min-h-[44px]',
          size === 'lg' && 'text-base px-8 py-3.5 min-h-[48px]',
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
