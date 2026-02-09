'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Clock, Plus, Check } from 'lucide-react';
import { Dish } from '@/lib/api';
import { useCartStore } from '@/stores/cartStore';
import { Button } from './ui/Button';
import { useState } from 'react';

interface DishDetailModalProps {
  dish: Dish | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DishDetailModal({ dish, isOpen, onClose }: DishDetailModalProps) {
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const items = useCartStore((state) => state.items);

  if (!dish) return null;

  const imageUrl = dish.thumbnailUrl || dish.imageUrls?.[0] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80';
  const isInCart = items.some(item => item.dishId === dish.id);

  const handleAddToCart = () => {
    addItem({
      dishId: dish.id,
      name: dish.name,
      price: parseFloat(dish.price),
      imageUrl,
      partnerName: dish.partnerName || 'Restaurant',
      partnerId: dish.partnerId,
    });
    setAdded(true);
    setTimeout(() => {
      onClose();
      setAdded(false);
    }, 800);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl max-h-[85vh] overflow-hidden"
          >
            {/* Close Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg z-10"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>

            {/* Image */}
            <div className="relative h-56 overflow-hidden">
              <img
                src={imageUrl}
                alt={dish.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              
              {/* Tags */}
              <div className="absolute bottom-4 left-4 flex gap-2">
                {dish.isVeg && (
                  <span className="px-3 py-1.5 bg-green-500 text-white text-xs font-bold rounded-full">
                    🥬 VEG
                  </span>
                )}
                {dish.tags?.includes('bestseller') && (
                  <span className="px-3 py-1.5 bg-orange-500 text-white text-xs font-bold rounded-full">
                    🔥 BESTSELLER
                  </span>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Title & Rating */}
              <div className="flex items-start justify-between mb-2">
                <h2 className="text-2xl font-bold text-gray-900">{dish.name}</h2>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-50 rounded-lg">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-sm font-bold text-gray-900">{dish.partnerRating || '4.5'}</span>
                </div>
              </div>

              {/* Restaurant & Time */}
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <span>{dish.partnerName}</span>
                {dish.prepTimeMins && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {dish.prepTimeMins} min
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-gray-600 leading-relaxed mb-6">
                {dish.description || 'A delicious dish prepared with care and premium ingredients.'}
              </p>

              {/* Tags */}
              {dish.tags && dish.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {dish.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1.5 bg-purple-50 text-purple-600 text-xs font-semibold rounded-full capitalize"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Price & Add Button */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div>
                  <p className="text-sm text-gray-500">Price</p>
                  <p className="text-3xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    ₹{parseFloat(dish.price).toFixed(0)}
                  </p>
                </div>
                <Button
                  onClick={handleAddToCart}
                  disabled={added || isInCart}
                  size="lg"
                  className="min-w-[140px]"
                >
                  {added || isInCart ? (
                    <>
                      <Check className="w-5 h-5" />
                      Added
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      Add to Cart
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
