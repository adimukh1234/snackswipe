'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Star, ChevronLeft, RotateCcw, Sparkles, Loader2 } from 'lucide-react';
import { SwipeCard, SwipeCardRef } from '@/components/ui/SwipeCard';
import { Button } from '@/components/ui/Button';
import { useCartStore } from '@/stores/cartStore';
import { useFeed, useSwipe } from '@/hooks/useDishes';
import { Dish } from '@/lib/api';
import Link from 'next/link';

export default function DiscoverPage() {
  const [localDishes, setLocalDishes] = useState<Dish[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'like' | 'superlike'>('like');
  const [sessionId] = useState(() => crypto.randomUUID());
  const cardRef = useRef<SwipeCardRef>(null);
  const addItem = useCartStore((state) => state.addItem);

  // Fetch dishes from API
  const { data, isLoading, error, refetch } = useFeed({ limit: 20 });
  const swipeMutation = useSwipe();

  // Sync API data to local state
  useEffect(() => {
    if (data?.dishes) {
      setLocalDishes(data.dishes);
    }
  }, [data?.dishes]);

  const currentDish = localDishes[0];
  const remainingCount = localDishes.length;

  const showAddedToast = (dishName: string, type: 'like' | 'superlike' = 'like') => {
    setToastMessage(type === 'superlike' ? `⭐ ${dishName}` : `${dishName}`);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 1800);
  };

  const handleSwipeLeft = useCallback(() => {
    if (currentDish) {
      // Record skip in backend
      swipeMutation.mutate({ dishId: currentDish.id, action: 'skip', sessionId });
    }
    setLocalDishes((prev) => prev.slice(1));
  }, [currentDish, swipeMutation, sessionId]);

  const handleSwipeRight = useCallback(() => {
    if (currentDish) {
      // Record like in backend
      swipeMutation.mutate({ dishId: currentDish.id, action: 'like', sessionId });
      
      // Add to cart
      addItem({
        dishId: currentDish.id,
        name: currentDish.name,
        price: parseFloat(currentDish.price),
        imageUrl: currentDish.thumbnailUrl || currentDish.imageUrls?.[0] || '',
        partnerName: currentDish.partnerName || 'Restaurant',
        partnerId: currentDish.partnerId,
      });
      showAddedToast(currentDish.name, 'like');
    }
    setLocalDishes((prev) => prev.slice(1));
  }, [currentDish, addItem, swipeMutation, sessionId]);

  const handleSuperLike = useCallback(() => {
    if (currentDish) {
      // Record superlike in backend
      swipeMutation.mutate({ dishId: currentDish.id, action: 'superlike', sessionId });
      
      // Add to cart
      addItem({
        dishId: currentDish.id,
        name: currentDish.name,
        price: parseFloat(currentDish.price),
        imageUrl: currentDish.thumbnailUrl || currentDish.imageUrls?.[0] || '',
        partnerName: currentDish.partnerName || 'Restaurant',
        partnerId: currentDish.partnerId,
      });
      showAddedToast(currentDish.name, 'superlike');
    }
    setLocalDishes((prev) => prev.slice(1));
  }, [currentDish, addItem, swipeMutation, sessionId]);

  const resetDishes = () => {
    refetch();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-b from-purple-50 via-white to-gray-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Loader2 className="w-12 h-12 text-purple-500" />
        </motion.div>
        <p className="mt-4 text-gray-500 font-medium">Loading delicious dishes...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-b from-purple-50 via-white to-gray-50 px-8">
        <span className="text-6xl mb-6">😕</span>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Oops!</h2>
        <p className="text-gray-500 text-center mb-6">Couldn't load dishes. Make sure the API is running.</p>
        <Button onClick={() => refetch()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-purple-50 via-white to-gray-50 overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-4 safe-top flex-shrink-0">
        <Link href="/">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-icon"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </motion.button>
        </Link>
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2"
        >
          <Sparkles className="w-5 h-5 text-purple-500" />
          <h1 className="text-lg font-bold text-gray-900">Discover</h1>
        </motion.div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-400">{remainingCount} left</span>
        </div>
      </header>

      {/* Swipe Area */}
      <div className="flex-1 relative px-4 pb-4 min-h-0">
        {localDishes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-4 flex flex-col items-center justify-center bg-white rounded-3xl shadow-2xl border border-gray-100"
          >
            <motion.span 
              className="text-8xl mb-6"
              animate={{ 
                scale: [1, 1.15, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              🎉
            </motion.span>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">All caught up!</h2>
            <p className="text-gray-500 text-center px-10 mb-8 leading-relaxed max-w-[280px]">
              You've seen all the dishes. Want to start fresh?
            </p>
            <Button onClick={resetDishes} size="lg">
              <RotateCcw className="w-5 h-5" />
              Start Over
            </Button>
          </motion.div>
        ) : (
          <div className="relative w-full h-full">
            {/* Stacked Cards */}
            <AnimatePresence mode="popLayout">
              {localDishes.slice(0, 3).map((dish, index) => {
                const isTop = index === 0;
                const stackOffset = index * 10;
                const stackScale = 1 - index * 0.05;
                const stackOpacity = 1 - index * 0.2;
                
                if (isTop) {
                  return (
                    <SwipeCard
                      key={dish.id}
                      ref={cardRef}
                      onSwipeLeft={handleSwipeLeft}
                      onSwipeRight={handleSwipeRight}
                      onSuperLike={handleSuperLike}
                    >
                      <DishCard dish={dish} />
                    </SwipeCard>
                  );
                }
                
                return (
                  <motion.div
                    key={dish.id}
                    className="absolute inset-0 pointer-events-none"
                    style={{ zIndex: -index }}
                    initial={{ scale: stackScale - 0.05, y: stackOffset + 10, opacity: 0 }}
                    animate={{ 
                      scale: stackScale, 
                      y: stackOffset,
                      opacity: stackOpacity 
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  >
                    <DishCard dish={dish} />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {localDishes.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-center gap-6 py-6 px-6 safe-bottom flex-shrink-0"
        >
          {/* Skip Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => cardRef.current?.swipeLeft()}
            className="w-16 h-16 flex items-center justify-center rounded-full bg-white border-2 border-red-100 shadow-lg hover:shadow-xl transition-shadow"
          >
            <X className="w-8 h-8 text-red-400" />
          </motion.button>
          
          {/* Super Like Button */}
          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => cardRef.current?.swipeSuperLike()}
            className="w-14 h-14 flex items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-shadow"
          >
            <Star className="w-6 h-6 text-white fill-white" />
          </motion.button>
          
          {/* Like Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => cardRef.current?.swipeRight()}
            className="w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-500 shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 transition-shadow"
          >
            <Heart className="w-8 h-8 text-white fill-white" />
          </motion.button>
        </motion.div>
      )}

      {/* Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className={`fixed bottom-40 left-1/2 -translate-x-1/2 px-6 py-3 rounded-2xl shadow-2xl z-50 flex items-center gap-3 ${
              toastType === 'superlike' 
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                : 'bg-gradient-to-r from-green-500 to-green-600 text-white'
            }`}
          >
            {toastType === 'superlike' ? (
              <Star className="w-5 h-5 fill-white" />
            ) : (
              <Heart className="w-5 h-5 fill-white" />
            )}
            <p className="font-semibold">{toastMessage} added!</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Dish Card Component
function DishCard({ dish }: { dish: Dish }) {
  const imageUrl = dish.thumbnailUrl || dish.imageUrls?.[0] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80';
  const tags = dish.tags || [];
  const isVeg = dish.isVeg;
  const rating = dish.partnerRating || '4.5';
  const prepTime = dish.prepTimeMins || 20;

  return (
    <div className="w-full h-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100/50">
      {/* Image Section - 65% height */}
      <div className="relative h-[65%]">
        <img
          src={imageUrl}
          alt={dish.name}
          className="w-full h-full object-cover"
          draggable={false}
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        {/* Tags */}
        <div className="absolute top-5 left-5 flex gap-2">
          {isVeg && (
            <span className="px-3 py-1.5 bg-green-500 text-white text-xs font-bold rounded-full shadow-lg">
              🥬 VEG
            </span>
          )}
          {tags.includes('bestseller') && (
            <span className="px-3 py-1.5 bg-orange-500 text-white text-xs font-bold rounded-full shadow-lg">
              🔥 BESTSELLER
            </span>
          )}
        </div>
        
        {/* Rating Badge */}
        <div className="absolute top-5 right-5 px-3 py-2 bg-white/95 backdrop-blur-md rounded-xl flex items-center gap-1.5 shadow-lg">
          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          <span className="text-sm font-bold text-gray-900">{rating}</span>
        </div>
        
        {/* Main Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <h2 className="text-3xl font-black tracking-tight leading-tight">{dish.name}</h2>
          <p className="text-white/80 font-medium mt-1.5">{dish.partnerName} • {prepTime} min</p>
        </div>
      </div>
      
      {/* Details Section - 35% height */}
      <div className="h-[35%] p-6 flex flex-col justify-between">
        <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
          {dish.description || 'A delicious dish prepared with care and premium ingredients.'}
        </p>
        
        <div className="flex items-end justify-between">
          <div>
            <p className="text-4xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              ₹{parseFloat(dish.price).toFixed(0)}
            </p>
          </div>
          <div className="flex gap-2">
            {tags.slice(0, 2).map((tag) => (
              <span 
                key={tag} 
                className="px-3 py-1.5 bg-purple-50 text-purple-600 text-xs font-semibold rounded-full capitalize"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
