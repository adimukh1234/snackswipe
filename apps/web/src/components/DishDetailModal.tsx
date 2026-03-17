'use client';

import { Star, Clock, Plus, Check } from 'lucide-react';
import { Dish } from '@/lib/api';
import { useCartStore } from '@/stores/cartStore';
import { Button } from './ui/Button';
import { Badge } from './ui/badge';
import { useState } from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from './ui/drawer';

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

  const imageUrl = dish?.thumbnailUrl || dish?.imageUrls?.[0] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80';
  const isInCart = dish ? items.some(item => item.dishId === dish.id) : false;
  const price = dish ? parseFloat(dish.price) : 0;

  const handleAddToCart = () => {
    if (!dish) return;
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
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent
        className="max-h-[92dvh] border-0 outline-none focus:outline-none"
        style={{
          background: '#0a0a0f',
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          boxShadow: '0 -8px 40px rgba(0,0,0,0.7)',
        }}
      >
        {/* Hero image */}
        {dish && (
          <>
            <div className="relative h-56 overflow-hidden rounded-t-[28px]">
              <img
                src={imageUrl}
                alt={dish.name}
                className="w-full h-full object-cover"
              />
              <div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(to top, #0a0a0f 5%, rgba(10,10,15,0.4) 50%, transparent 100%)' }}
              />
              {/* Tags on image */}
              <div className="absolute bottom-4 left-4 flex gap-2 z-10">
                {dish.isVeg && (
                  <Badge
                    className="text-[10px] font-bold backdrop-blur-sm border-0 px-3 py-1.5"
                    style={{ background: 'rgba(0,230,118,0.2)', color: '#00E676', border: '1px solid rgba(0,230,118,0.3)' }}
                  >
                    🥬 VEG
                  </Badge>
                )}
                {dish.tags?.includes('bestseller') && (
                  <Badge
                    className="text-[10px] font-bold backdrop-blur-sm border-0 px-3 py-1.5"
                    style={{ background: 'rgba(255,179,0,0.2)', color: '#FFB300', border: '1px solid rgba(255,179,0,0.3)' }}
                  >
                    🔥 BESTSELLER
                  </Badge>
                )}
              </div>
            </div>

            {/* Scrollable content */}
            <div className="overflow-y-auto px-6 pt-2 pb-4 flex-1">
              <DrawerHeader className="px-0 pt-4 pb-2 text-left">
                <div className="flex items-start justify-between">
                  <DrawerTitle
                    className="text-2xl font-bold flex-1 mr-3"
                    style={{ color: '#f5f0eb', fontFamily: 'var(--font-display)' }}
                  >
                    {dish.name}
                  </DrawerTitle>
                  <div
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg flex-shrink-0"
                    style={{ background: 'rgba(255,179,0,0.1)', border: '1px solid rgba(255,179,0,0.2)' }}
                  >
                    <Star className="w-4 h-4" style={{ color: '#FFB300', fill: '#FFB300' }} />
                    <span className="text-sm font-bold" style={{ color: '#FFB300' }}>
                      {dish.partnerRating || '4.5'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm mt-2" style={{ color: '#8b8b8b' }}>
                  <span>{dish.partnerName}</span>
                  {dish.prepTimeMins && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {dish.prepTimeMins} min
                    </span>
                  )}
                </div>
              </DrawerHeader>

              {/* Description */}
              <p className="leading-relaxed mb-5 text-[0.9375rem]" style={{ color: 'rgba(245,240,235,0.7)' }}>
                {dish.description || 'A delicious dish prepared with care and premium ingredients.'}
              </p>

              {/* Spice Level */}
              <div className="mb-5">
                <h3
                  className="text-sm font-semibold uppercase tracking-wider mb-3"
                  style={{ color: '#8b8b8b', fontFamily: 'var(--font-display)' }}
                >
                  Spice Level — <span style={{ color: '#f5f0eb' }}>{spiceLevels[spiceLevel]}</span>
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
                          : 'rgba(255,255,255,0.04)',
                        color: i <= spiceLevel ? '#FF2E63' : '#8b8b8b',
                        border: i === spiceLevel
                          ? '1px solid rgba(255,46,99,0.4)'
                          : '1px solid rgba(255,255,255,0.06)',
                      }}
                    >
                      {i === 0 ? '🌶' : '🌶'.repeat(Math.min(i + 1, 3))}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tags */}
              {dish.tags && dish.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-5">
                  {dish.tags.map((tag) => (
                    <Badge
                      key={tag}
                      className="px-3 py-1.5 text-xs font-semibold rounded-full capitalize border-0"
                      style={{
                        background: 'rgba(204,255,0,0.08)',
                        color: '#CCFF00',
                        border: '1px solid rgba(204,255,0,0.15)',
                      }}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Sticky footer CTA */}
            <DrawerFooter
              className="px-6 pt-4 pb-8"
              style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs mb-1 uppercase tracking-wider" style={{ color: '#8b8b8b' }}>Price</p>
                  <p
                    className="text-3xl font-black"
                    style={{ color: '#CCFF00', fontFamily: 'var(--font-mono)', textShadow: '0 0 20px rgba(204,255,0,0.2)' }}
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
                    <><Check className="w-5 h-5" />Stashed</>
                  ) : (
                    <><Plus className="w-5 h-5" />Add to Stash</>
                  )}
                </Button>
              </div>
            </DrawerFooter>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
}
