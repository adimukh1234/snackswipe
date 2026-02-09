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
      whileHover={onClick ? { scale: 1.02 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
      className={cn(
        'overflow-hidden',
        elevated 
          ? 'bg-white rounded-3xl shadow-xl' 
          : 'bg-white rounded-2xl shadow-md',
        gradient && 'bg-gradient-to-br from-purple-50 to-pink-50',
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
}

export function CardImage({ src, alt, className }: CardImageProps) {
  return (
    <div className={cn('relative w-full aspect-square overflow-hidden', className)}>
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
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
