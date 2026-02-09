'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  elevated?: boolean;
  gradient?: boolean;
  onClick?: () => void;
}

export function Card({ children, className, elevated = false, gradient = false, onClick }: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={onClick ? { scale: 1.02, y: -2 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      onClick={onClick}
      className={cn(
        'overflow-hidden border',
        elevated 
          ? 'bg-white rounded-3xl shadow-xl border-gray-100/50' 
          : 'bg-white rounded-2xl shadow-md border-gray-100',
        gradient && 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-100/50',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </motion.div>
  );
}

interface CardImageProps {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: 'square' | 'video' | 'wide';
}

export function CardImage({ src, alt, className, aspectRatio = 'square' }: CardImageProps) {
  const aspectClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    wide: 'aspect-[4/3]',
  };

  return (
    <div className={cn('relative w-full overflow-hidden', aspectClasses[aspectRatio], className)}>
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        loading="lazy"
      />
    </div>
  );
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function CardContent({ children, className }: CardContentProps) {
  return (
    <div className={cn('p-4', className)}>
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <div className={cn('px-4 pt-4 pb-2', className)}>
      {children}
    </div>
  );
}

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function CardFooter({ children, className }: CardFooterProps) {
  return (
    <div className={cn('px-4 pb-4 pt-2 border-t border-gray-100', className)}>
      {children}
    </div>
  );
}
