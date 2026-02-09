'use client';

import { motion, useMotionValue, useTransform, animate, PanInfo } from 'framer-motion';
import { useState, useCallback, forwardRef, useImperativeHandle } from 'react';

export type SwipeDirection = 'left' | 'right' | 'up' | 'down' | null;

export interface SwipeCardRef {
  swipeLeft: () => void;
  swipeRight: () => void;
  swipeSuperLike: () => void;
}

interface SwipeCardProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSuperLike?: () => void;
  onDrag?: (direction: SwipeDirection, offset: { x: number; y: number }) => void;
}

export const SwipeCard = forwardRef<SwipeCardRef, SwipeCardProps>(({ 
  children, 
  onSwipeLeft, 
  onSwipeRight, 
  onSuperLike,
  onDrag,
}, ref) => {
  const [isExiting, setIsExiting] = useState(false);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  // Rotation based on horizontal drag - subtle and natural
  const rotate = useTransform(x, [-400, 0, 400], [-15, 0, 15]);
  
  // Overlay opacity - smooth gradient appearance
  const likeOpacity = useTransform(x, [0, 60, 150], [0, 0.6, 1]);
  const nopeOpacity = useTransform(x, [-150, -60, 0], [1, 0.6, 0]);
  const superLikeOpacity = useTransform(y, [-150, -60, 0], [1, 0.6, 0]);
  
  // Scale effect during drag
  const dragScale = useTransform(
    x,
    [-200, 0, 200],
    [0.97, 1, 0.97]
  );

  // Exit animations
  const performSwipe = useCallback((direction: 'left' | 'right' | 'up') => {
    setIsExiting(true);
    
    const exitX = direction === 'right' ? 1200 : direction === 'left' ? -1200 : 0;
    const exitY = direction === 'up' ? -1200 : 0;
    const exitRotate = direction === 'right' ? 25 : direction === 'left' ? -25 : 0;
    
    // Animate out with satisfying spring
    animate(x, exitX, { 
      type: 'spring', 
      stiffness: 400, 
      damping: 40,
      velocity: direction === 'up' ? 0 : (direction === 'right' ? 500 : -500)
    });
    
    animate(y, exitY, { 
      type: 'spring', 
      stiffness: 400, 
      damping: 40,
      velocity: direction === 'up' ? -500 : 0
    });
    
    if (direction !== 'up') {
      animate(rotate, exitRotate);
    }
    
    // Trigger callback after animation starts
    setTimeout(() => {
      if (direction === 'left') onSwipeLeft?.();
      else if (direction === 'right') onSwipeRight?.();
      else if (direction === 'up') onSuperLike?.();
    }, 150);
  }, [onSwipeLeft, onSwipeRight, onSuperLike, x, y, rotate]);

  // Expose swipe methods to parent via ref
  useImperativeHandle(ref, () => ({
    swipeLeft: () => performSwipe('left'),
    swipeRight: () => performSwipe('right'),
    swipeSuperLike: () => performSwipe('up'),
  }), [performSwipe]);

  const handleDrag = useCallback((event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // Determine current swipe direction for visual feedback
    let direction: SwipeDirection = null;
    if (Math.abs(info.offset.x) > Math.abs(info.offset.y)) {
      direction = info.offset.x > 30 ? 'right' : info.offset.x < -30 ? 'left' : null;
    } else {
      direction = info.offset.y < -30 ? 'up' : info.offset.y > 30 ? 'down' : null;
    }
    onDrag?.(direction, { x: info.offset.x, y: info.offset.y });
  }, [onDrag]);

  const handleDragEnd = useCallback((event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 100;
    const velocityThreshold = 600;
    
    const absX = Math.abs(info.offset.x);
    const absY = Math.abs(info.offset.y);
    const absVelX = Math.abs(info.velocity.x);
    const absVelY = Math.abs(info.velocity.y);
    
    // Determine swipe direction based on offset and velocity
    const shouldSwipeRight = (info.offset.x > threshold || info.velocity.x > velocityThreshold);
    const shouldSwipeLeft = (info.offset.x < -threshold || info.velocity.x < -velocityThreshold);
    const shouldSuperLike = (info.offset.y < -threshold || info.velocity.y < -velocityThreshold) && absY > absX * 0.7;
    
    if (shouldSuperLike) {
      performSwipe('up');
    } else if (shouldSwipeRight && absX > absY) {
      performSwipe('right');
    } else if (shouldSwipeLeft && absX > absY) {
      performSwipe('left');
    } else {
      // Spring back to center with bounce
      animate(x, 0, { type: 'spring', stiffness: 600, damping: 30 });
      animate(y, 0, { type: 'spring', stiffness: 600, damping: 30 });
    }
    
    onDrag?.(null, { x: 0, y: 0 });
  }, [performSwipe, x, y, onDrag]);

  return (
    <motion.div
      className="absolute inset-0 cursor-grab active:cursor-grabbing touch-none select-none"
      style={{ 
        x, 
        y, 
        rotate,
        scale: dragScale,
      }}
      drag={!isExiting}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.9}
      dragTransition={{ bounceStiffness: 600, bounceDamping: 30 }}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      whileTap={{ cursor: 'grabbing' }}
    >
      {/* LIKE Indicator */}
      <motion.div
        className="absolute top-8 left-6 z-30 pointer-events-none"
        style={{ opacity: likeOpacity }}
      >
        <motion.div 
          className="px-6 py-3 bg-gradient-to-br from-green-400 to-green-500 text-white font-black text-3xl uppercase tracking-wider rounded-2xl border-4 border-green-300 shadow-2xl"
          style={{ 
            rotate: -12,
            boxShadow: '0 20px 40px rgba(34, 197, 94, 0.4), inset 0 2px 0 rgba(255,255,255,0.3)'
          }}
        >
          LIKE
        </motion.div>
      </motion.div>
      
      {/* NOPE Indicator */}
      <motion.div
        className="absolute top-8 right-6 z-30 pointer-events-none"
        style={{ opacity: nopeOpacity }}
      >
        <motion.div 
          className="px-6 py-3 bg-gradient-to-br from-red-400 to-red-500 text-white font-black text-3xl uppercase tracking-wider rounded-2xl border-4 border-red-300 shadow-2xl"
          style={{ 
            rotate: 12,
            boxShadow: '0 20px 40px rgba(239, 68, 68, 0.4), inset 0 2px 0 rgba(255,255,255,0.3)'
          }}
        >
          NOPE
        </motion.div>
      </motion.div>
      
      {/* SUPER LIKE Indicator */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none"
        style={{ opacity: superLikeOpacity }}
      >
        <motion.div 
          className="px-8 py-4 bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 text-white font-black text-2xl uppercase tracking-wider rounded-2xl border-4 border-purple-300 shadow-2xl flex items-center gap-3"
          style={{ 
            boxShadow: '0 25px 50px rgba(168, 85, 247, 0.5), inset 0 2px 0 rgba(255,255,255,0.3)'
          }}
        >
          <span className="text-3xl">⭐</span>
          SUPER LIKE
        </motion.div>
      </motion.div>
      
      {children}
    </motion.div>
  );
});

SwipeCard.displayName = 'SwipeCard';

// Card Stack Component - manages the visual stack effect
interface CardStackProps {
  children: React.ReactNode[];
  onSwipeLeft?: (index: number) => void;
  onSwipeRight?: (index: number) => void;
  onSuperLike?: (index: number) => void;
}

export function CardStack({ children, onSwipeLeft, onSwipeRight, onSuperLike }: CardStackProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const visibleCards = 3; // Number of stacked cards to show

  return (
    <div className="relative w-full h-full">
      {children.slice(currentIndex, currentIndex + visibleCards).map((child, i) => {
        const actualIndex = currentIndex + i;
        const isTop = i === 0;
        const stackIndex = i;
        
        // Calculate stack offset and scale
        const yOffset = stackIndex * 8;
        const scale = 1 - stackIndex * 0.04;
        const opacity = 1 - stackIndex * 0.15;
        
        return (
          <motion.div
            key={actualIndex}
            className="absolute inset-0"
            style={{ 
              zIndex: visibleCards - i,
            }}
            initial={{ scale: 0.9, opacity: 0, y: 40 }}
            animate={{ 
              scale,
              opacity,
              y: yOffset,
            }}
            transition={{ 
              type: 'spring', 
              stiffness: 400, 
              damping: 30,
              delay: isTop ? 0 : 0.05 * i
            }}
          >
            {isTop ? (
              <SwipeCard
                onSwipeLeft={() => {
                  onSwipeLeft?.(actualIndex);
                  setCurrentIndex(prev => prev + 1);
                }}
                onSwipeRight={() => {
                  onSwipeRight?.(actualIndex);
                  setCurrentIndex(prev => prev + 1);
                }}
                onSuperLike={() => {
                  onSuperLike?.(actualIndex);
                  setCurrentIndex(prev => prev + 1);
                }}
              >
                {child}
              </SwipeCard>
            ) : (
              <div className="w-full h-full pointer-events-none">
                {child}
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
