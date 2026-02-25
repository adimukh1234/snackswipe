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
  const [spiceLevel, setSpiceLevel] = useState(2);
  const addItem = useCartStore((state) => state.addItem);
  const items = useCartStore((state) => state.items);

  if (!dish) return null;

  const imageUrl = dish.thumbnailUrl || dish.imageUrls?.[0] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80';
  const isInCart = items.some(item => item.dishId === dish.id);
  const price = parseFloat(dish.price);

  const handleAddToCart = () => {
    addItem({
      dishId: dish.id,
      name: dish.name,
      price,
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

  const spiceLevels = ['Mild', 'Medium', 'Hot', 'Fire', 'Inferno'];

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
            className="fixed inset-0 z-50"
            style={{ background: 'rgba(0, 0, 0, 0.8)' }}
          />

          {/* Modal — Dish Anatomy Sheet */}
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 max-h-[90vh] overflow-hidden"
            style={{
              background: '#0A0A0F',
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              boxShadow: '0 -8px 40px rgba(0, 0, 0, 0.6)',
              borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            {/* Drag Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div 
                className="w-12 h-1.5 rounded-full"
                style={{ background: 'rgba(255, 255, 255, 0.15)' }}
              />
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center z-10"
              style={{
                background: 'rgba(26, 26, 46, 0.9)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <X className="w-5 h-5" style={{ color: '#F5F0EB' }} />
            </button>

            {/* Hero Image */}
            <div className="relative h-56 overflow-hidden">
              <img
                src={imageUrl}
                alt={dish.name}
                className="w-full h-full object-cover"
              />
              {/* Scrim */}
              <div 
                className="absolute inset-0"
                style={{ background: 'linear-gradient(to top, #0A0A0F 5%, rgba(10,10,15,0.4) 50%, transparent 100%)' }}
              />
              
              {/* Tags on image */}
              <div className="absolute bottom-4 left-4 flex gap-2 z-10">
                {dish.isVeg && (
                  <span 
                    className="px-3 py-1.5 text-xs font-bold rounded-full backdrop-blur-sm"
                    style={{ background: 'rgba(0, 230, 118, 0.2)', color: '#00E676', border: '1px solid rgba(0, 230, 118, 0.3)' }}
                  >
                    🥬 VEG
                  </span>
                )}
                {dish.tags?.includes('bestseller') && (
                  <span 
                    className="px-3 py-1.5 text-xs font-bold rounded-full backdrop-blur-sm"
                    style={{ background: 'rgba(255, 179, 0, 0.2)', color: '#FFB300', border: '1px solid rgba(255, 179, 0, 0.3)' }}
                  >
                    🔥 BESTSELLER
                  </span>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[50vh]">
              {/* Title & Rating */}
              <div className="flex items-start justify-between mb-3">
                <h2 
                  className="text-2xl font-bold"
                  style={{ color: '#F5F0EB', fontFamily: 'var(--font-display)' }}
                >
                  {dish.name}
                </h2>
                <div 
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
                  style={{ background: 'rgba(255, 179, 0, 0.1)', border: '1px solid rgba(255, 179, 0, 0.2)' }}
                >
                  <Star className="w-4 h-4" style={{ color: '#FFB300', fill: '#FFB300' }} />
                  <span className="text-sm font-bold" style={{ color: '#FFB300' }}>
                    {dish.partnerRating || '4.5'}
                  </span>
                </div>
              </div>

              {/* Restaurant & Time */}
              <div className="flex items-center gap-4 text-sm mb-5" style={{ color: '#8B8B8B' }}>
                <span>{dish.partnerName}</span>
                {dish.prepTimeMins && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {dish.prepTimeMins} min
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="leading-relaxed mb-6" style={{ color: 'rgba(245, 240, 235, 0.7)', fontSize: '0.9375rem' }}>
                {dish.description || 'A delicious dish prepared with care and premium ingredients.'}
              </p>

              {/* Spice Level */}
              <div className="mb-6">
                <h3 
                  className="text-sm font-semibold uppercase tracking-wider mb-3"
                  style={{ color: '#8B8B8B', fontFamily: 'var(--font-display)' }}
                >
                  Spice Level
                </h3>
                <div className="flex gap-2">
                  {spiceLevels.map((level, i) => (
                    <button
                      key={level}
                      onClick={() => setSpiceLevel(i)}
                      className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all duration-200"
                      style={{
                        background: i <= spiceLevel 
                          ? `rgba(255, ${Math.max(46, 179 - i * 40)}, ${Math.max(0, 99 - i * 25)}, ${0.15 + i * 0.05})` 
                          : 'rgba(255, 255, 255, 0.04)',
                        color: i <= spiceLevel ? '#FF2E63' : '#8B8B8B',
                        border: i === spiceLevel 
                          ? '1px solid rgba(255, 46, 99, 0.4)' 
                          : '1px solid rgba(255, 255, 255, 0.06)',
                      }}
                    >
                      {i === 0 ? '🌶' : '🌶'.repeat(Math.min(i + 1, 3))}
                    </button>
                  ))}
                </div>
                <p className="text-xs mt-2" style={{ color: '#8B8B8B' }}>
                  {spiceLevels[spiceLevel]}
                </p>
              </div>

              {/* Tags */}
              {dish.tags && dish.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {dish.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1.5 text-xs font-semibold rounded-full capitalize"
                      style={{ 
                        background: 'rgba(204, 255, 0, 0.08)', 
                        color: '#CCFF00',
                        border: '1px solid rgba(204, 255, 0, 0.15)',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Price & Add Button — Sticky CTA */}
              <div 
                className="flex items-center justify-between pt-5 mt-2"
                style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}
              >
                <div>
                  <p className="text-xs mb-1" style={{ color: '#8B8B8B', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Price</p>
                  <p 
                    className="text-3xl font-black"
                    style={{ 
                      color: '#CCFF00',
                      fontFamily: 'var(--font-mono)',
                      textShadow: '0 0 20px rgba(204, 255, 0, 0.2)',
                    }}
                  >
                    ₹{price.toFixed(0)}
                  </p>
                </div>
                <Button
                  onClick={handleAddToCart}
                  disabled={added || isInCart}
                  size="lg"
                  className="min-w-[160px]"
                >
                  {added || isInCart ? (
                    <>
                      <Check className="w-5 h-5" />
                      Stashed
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      Add to Stash
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
