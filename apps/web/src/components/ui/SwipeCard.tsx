'use client';

import { motion, useMotionValue, useTransform, animate, PanInfo } from 'framer-motion';
import { useState, useCallback, forwardRef, useImperativeHandle, useRef } from 'react';

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
  const isExitingRef = useRef(false);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Ease-in rotation curve — slow start, accelerates at edges
  const rotate = useTransform(x, [-300, -80, 0, 80, 300], [-20, -5, 0, 5, 20]);

  // Stamp opacity
  const craveOpacity = useTransform(x, [0, 50, 130], [0, 0.7, 1]);
  const passOpacity = useTransform(x, [-130, -50, 0], [1, 0.7, 0]);
  const superLikeOpacity = useTransform(y, [-150, -60, 0], [1, 0.6, 0]);

  // Stamp scale — stamps "snap in" as confidence increases
  const craveScale = useTransform(x, [0, 50, 130], [0.75, 0.9, 1]);
  const passScale = useTransform(x, [-130, -50, 0], [1, 0.9, 0.75]);
  const superLikeScale = useTransform(y, [-150, -60, 0], [1, 0.9, 0.75]);

  // Scale effect during drag
  const dragScale = useTransform(x, [-200, 0, 200], [0.97, 1, 0.97]);

  // Background glow intensity based on swipe direction
  const craveGlow = useTransform(x, [0, 100, 200], [0, 0.15, 0.35]);
  const passGlow = useTransform(x, [-200, -100, 0], [0.35, 0.15, 0]);

  // Exit animations
  const performSwipe = useCallback((direction: 'left' | 'right' | 'up') => {
    if (isExitingRef.current) return;
    isExitingRef.current = true;
    
    const exitX = direction === 'right' ? 1200 : direction === 'left' ? -1200 : 0;
    const exitY = direction === 'up' ? -1200 : 0;
    const exitRotate = direction === 'right' ? 25 : direction === 'left' ? -25 : 0;
    
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
    
    setTimeout(() => {
      if (direction === 'left') onSwipeLeft?.();
      else if (direction === 'right') onSwipeRight?.();
      else if (direction === 'up') onSuperLike?.();
    }, 150);
  }, [onSwipeLeft, onSwipeRight, onSuperLike, x, y, rotate]);

  useImperativeHandle(ref, () => ({
    swipeLeft: () => performSwipe('left'),
    swipeRight: () => performSwipe('right'),
    swipeSuperLike: () => performSwipe('up'),
  }), [performSwipe]);

  const handleDrag = useCallback((event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
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
      drag={!isExitingRef.current}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.9}
      dragTransition={{ bounceStiffness: 600, bounceDamping: 30 }}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      whileTap={{ cursor: 'grabbing' }}
    >
      {/* CRAVE Stamp — Acid Lime (Brutalist) */}
      <motion.div
        className="absolute top-16 left-6 z-30 pointer-events-none"
        style={{ opacity: craveOpacity, scale: craveScale }}
      >
        <div 
          className="px-5 py-2 border-[3px] rounded-lg"
          style={{ 
            borderColor: '#CCFF00', 
            rotate: '-15deg',
            boxShadow: '0 0 20px rgba(204, 255, 0, 0.3)',
          }}
        >
          <span 
            className="font-black text-3xl uppercase tracking-[0.2em]"
            style={{ 
              color: '#CCFF00',
              fontFamily: 'var(--font-display)',
              textShadow: '0 0 10px rgba(204, 255, 0, 0.5)',
            }}
          >
            CRAVE
          </span>
        </div>
      </motion.div>
      
      {/* PASS Stamp — Raspberry (Brutalist) */}
      <motion.div
        className="absolute top-16 right-6 z-30 pointer-events-none"
        style={{ opacity: passOpacity, scale: passScale }}
      >
        <div 
          className="px-5 py-2 border-[3px] rounded-lg"
          style={{ 
            borderColor: '#FF2E63', 
            rotate: '15deg',
            boxShadow: '0 0 20px rgba(255, 46, 99, 0.3)',
          }}
        >
          <span 
            className="font-black text-3xl uppercase tracking-[0.2em]"
            style={{ 
              color: '#FF2E63',
              fontFamily: 'var(--font-display)',
              textShadow: '0 0 10px rgba(255, 46, 99, 0.5)',
            }}
          >
            PASS
          </span>
        </div>
      </motion.div>
      
      {/* SUPER Stamp — Acid Lime Vertical (Brutalist) */}
      <motion.div
        className="absolute bottom-32 left-1/2 -translate-x-1/2 z-30 pointer-events-none"
        style={{ opacity: superLikeOpacity, scale: superLikeScale }}
      >
        <div 
          className="px-5 py-2 border-[3px] rounded-lg"
          style={{ 
            borderColor: '#CCFF00',
            boxShadow: '0 0 30px rgba(204, 255, 0, 0.4)',
          }}
        >
          <span 
            className="font-black text-2xl uppercase tracking-[0.2em]"
            style={{ 
              color: '#CCFF00',
              fontFamily: 'var(--font-display)',
              textShadow: '0 0 15px rgba(204, 255, 0, 0.6)',
            }}
          >
            SUPER
          </span>
        </div>
      </motion.div>

      {/* Edge glow effects */}
      <motion.div 
        className="absolute inset-0 z-20 pointer-events-none rounded-[28px]"
        style={{ 
          opacity: craveGlow,
          boxShadow: 'inset 0 0 60px rgba(204, 255, 0, 0.3), 0 0 30px rgba(204, 255, 0, 0.15)',
        }}
      />
      <motion.div 
        className="absolute inset-0 z-20 pointer-events-none rounded-[28px]"
        style={{ 
          opacity: passGlow,
          boxShadow: 'inset 0 0 60px rgba(255, 46, 99, 0.3), 0 0 30px rgba(255, 46, 99, 0.15)',
        }}
      />
      
      {children}
    </motion.div>
  );
});

SwipeCard.displayName = 'SwipeCard';

// Card Stack Component
interface CardStackProps {
  children: React.ReactNode[];
  onSwipeLeft?: (index: number) => void;
  onSwipeRight?: (index: number) => void;
  onSuperLike?: (index: number) => void;
}

function CardStack({ children, onSwipeLeft, onSwipeRight, onSuperLike }: CardStackProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const visibleCards = 3;

  return (
    <div className="relative w-full h-full">
      {children.slice(currentIndex, currentIndex + visibleCards).map((child, i) => {
        const actualIndex = currentIndex + i;
        const isTop = i === 0;
        const stackIndex = i;
        
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
