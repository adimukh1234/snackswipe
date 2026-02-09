'use client';

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Star, ChevronLeft, RotateCcw, Sparkles } from 'lucide-react';
import { SwipeCard, SwipeCardRef } from '@/components/ui/SwipeCard';
import { Button } from '@/components/ui/Button';
import { useCartStore } from '@/stores/cartStore';
import Link from 'next/link';

// Mock dishes data
const mockDishes = [
  {
    id: '1',
    name: 'Butter Chicken',
    description: 'Creamy tomato-based curry with tender chicken pieces, served with garlic naan and fragrant basmati rice.',
    price: 350,
    imageUrl: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800&q=80',
    partnerName: 'Punjab Grill',
    partnerId: 'p1',
    rating: 4.8,
    prepTime: 25,
    isVeg: false,
    tags: ['spicy', 'bestseller'],
  },
  {
    id: '2',
    name: 'Margherita Pizza',
    description: 'Classic Italian pizza with fresh mozzarella, San Marzano tomatoes, and aromatic fresh basil.',
    price: 299,
    imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80',
    partnerName: 'Pizza Palace',
    partnerId: 'p2',
    rating: 4.6,
    prepTime: 20,
    isVeg: true,
    tags: ['italian', 'vegetarian'],
  },
  {
    id: '3',
    name: 'Sushi Platter',
    description: 'Chef\'s selection of fresh nigiri and maki rolls with premium wasabi and pickled ginger.',
    price: 599,
    imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&q=80',
    partnerName: 'Tokyo Bites',
    partnerId: 'p3',
    rating: 4.9,
    prepTime: 15,
    isVeg: false,
    tags: ['japanese', 'fresh'],
  },
  {
    id: '4',
    name: 'Loaded Burger',
    description: 'Juicy Angus beef patty with aged cheddar, caramelized onions, and our signature sauce.',
    price: 249,
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80',
    partnerName: 'Burger Barn',
    partnerId: 'p4',
    rating: 4.5,
    prepTime: 18,
    isVeg: false,
    tags: ['american', 'popular'],
  },
  {
    id: '5',
    name: 'Pad Thai',
    description: 'Authentic stir-fried rice noodles with tiger prawns, crushed peanuts, and tamarind.',
    price: 320,
    imageUrl: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=800&q=80',
    partnerName: 'Thai Orchid',
    partnerId: 'p5',
    rating: 4.7,
    prepTime: 22,
    isVeg: false,
    tags: ['thai', 'noodles'],
  },
  {
    id: '6',
    name: 'Paneer Tikka',
    description: 'Smoky grilled cottage cheese cubes marinated in spiced yogurt with mint chutney.',
    price: 280,
    imageUrl: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=800&q=80',
    partnerName: 'Spice Garden',
    partnerId: 'p6',
    rating: 4.6,
    prepTime: 20,
    isVeg: true,
    tags: ['indian', 'vegetarian'],
  },
];

export default function DiscoverPage() {
  const [dishes, setDishes] = useState(mockDishes);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'like' | 'superlike'>('like');
  const cardRef = useRef<SwipeCardRef>(null);
  const addItem = useCartStore((state) => state.addItem);

  const currentDish = dishes[0];
  const remainingCount = dishes.length;

  const showAddedToast = (dishName: string, type: 'like' | 'superlike' = 'like') => {
    setToastMessage(type === 'superlike' ? `⭐ ${dishName}` : `${dishName}`);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 1800);
  };

  const handleSwipeLeft = useCallback(() => {
    setDishes((prev) => prev.slice(1));
  }, []);

  const handleSwipeRight = useCallback(() => {
    if (currentDish) {
      addItem({
        dishId: currentDish.id,
        name: currentDish.name,
        price: currentDish.price,
        imageUrl: currentDish.imageUrl,
        partnerName: currentDish.partnerName,
        partnerId: currentDish.partnerId,
      });
      showAddedToast(currentDish.name, 'like');
    }
    setDishes((prev) => prev.slice(1));
  }, [currentDish, addItem]);

  const handleSuperLike = useCallback(() => {
    if (currentDish) {
      addItem({
        dishId: currentDish.id,
        name: currentDish.name,
        price: currentDish.price,
        imageUrl: currentDish.imageUrl,
        partnerName: currentDish.partnerName,
        partnerId: currentDish.partnerId,
      });
      showAddedToast(currentDish.name, 'superlike');
    }
    setDishes((prev) => prev.slice(1));
  }, [currentDish, addItem]);

  const resetDishes = () => {
    setDishes(mockDishes);
  };

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
        {dishes.length === 0 ? (
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
              {dishes.slice(0, 3).map((dish, index) => {
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
      {dishes.length > 0 && (
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

// Separate DishCard component for cleaner code
function DishCard({ dish }: { dish: typeof mockDishes[0] }) {
  return (
    <div className="w-full h-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100/50">
      {/* Image Section - 65% height */}
      <div className="relative h-[65%]">
        <img
          src={dish.imageUrl}
          alt={dish.name}
          className="w-full h-full object-cover"
          draggable={false}
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        {/* Tags */}
        <div className="absolute top-5 left-5 flex gap-2">
          {dish.isVeg && (
            <span className="px-3 py-1.5 bg-green-500 text-white text-xs font-bold rounded-full shadow-lg">
              🥬 VEG
            </span>
          )}
          {dish.tags.includes('bestseller') && (
            <span className="px-3 py-1.5 bg-orange-500 text-white text-xs font-bold rounded-full shadow-lg">
              🔥 BESTSELLER
            </span>
          )}
        </div>
        
        {/* Rating Badge */}
        <div className="absolute top-5 right-5 px-3 py-2 bg-white/95 backdrop-blur-md rounded-xl flex items-center gap-1.5 shadow-lg">
          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          <span className="text-sm font-bold text-gray-900">{dish.rating}</span>
        </div>
        
        {/* Main Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <h2 className="text-3xl font-black tracking-tight leading-tight">{dish.name}</h2>
          <p className="text-white/80 font-medium mt-1.5">{dish.partnerName} • {dish.prepTime} min</p>
        </div>
      </div>
      
      {/* Details Section - 35% height */}
      <div className="h-[35%] p-6 flex flex-col justify-between">
        <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
          {dish.description}
        </p>
        
        <div className="flex items-end justify-between">
          <div>
            <p className="text-4xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              ₹{dish.price}
            </p>
          </div>
          <div className="flex gap-2">
            {dish.tags.slice(0, 2).map((tag) => (
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
