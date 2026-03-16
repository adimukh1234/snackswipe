'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Loader2, Star } from 'lucide-react';
import { dishesApi, Dish } from '@/lib/api';
import { useCartStore } from '@/stores/cartStore';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Dish[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
      setResults([]);
      setHasSearched(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      setHasSearched(true);

      const { data } = await dishesApi.search(query, 10);
      setResults(data?.dishes ?? []);

      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleAddToCart = (dish: Dish) => {
    addItem({
      dishId: dish.id,
      name: dish.name,
      price: parseFloat(dish.price),
      imageUrl: dish.thumbnailUrl || dish.imageUrls?.[0] || '',
      partnerName: dish.partnerName || 'Restaurant',
      partnerId: dish.partnerId,
    });
    onClose();
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
            className="fixed inset-0 z-50"
            style={{ background: 'rgba(0, 0, 0, 0.75)' }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-0 left-0 right-0 z-50 max-h-[80vh] overflow-hidden"
            style={{
              background: '#0A0A0F',
              borderBottomLeftRadius: 24,
              borderBottomRightRadius: 24,
              boxShadow: '0 8px 40px rgba(0, 0, 0, 0.6)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            {/* Search Input */}
            <div 
              className="p-5 safe-top"
              style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}
            >
              <div className="relative flex items-center">
                <Search className="absolute left-4 w-5 h-5" style={{ color: '#8B8B8B' }} />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search dishes, restaurants..."
                  className="w-full h-12 pl-12 pr-12 rounded-xl focus:outline-none"
                  style={{
                    background: '#1A1A2E',
                    color: '#F5F0EB',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    fontFamily: 'var(--font-body)',
                  }}
                />
                {query && (
                  <button
                    onClick={() => setQuery('')}
                    className="absolute right-12 p-1 rounded-full"
                    style={{ color: '#8B8B8B' }}
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="ml-3 font-medium text-sm"
                  style={{ color: '#CCFF00' }}
                >
                  Cancel
                </button>
              </div>
            </div>

            {/* Results */}
            <div className="overflow-y-auto max-h-[60vh] p-5">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#CCFF00' }} />
                </div>
              ) : results.length > 0 ? (
                <div className="space-y-3">
                  {results.map((dish) => (
                    <motion.button
                      key={dish.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => handleAddToCart(dish)}
                      className="w-full flex items-center gap-4 p-3 rounded-2xl transition-colors text-left"
                      style={{
                        background: '#1A1A2E',
                        border: '1px solid rgba(255, 255, 255, 0.04)',
                      }}
                    >
                      <img
                        src={dish.thumbnailUrl || dish.imageUrls?.[0] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100'}
                        alt={dish.name}
                        className="w-16 h-16 rounded-xl object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate" style={{ color: '#F5F0EB' }}>{dish.name}</h3>
                        <p className="text-sm truncate" style={{ color: '#8B8B8B' }}>{dish.partnerName}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-bold" style={{ color: '#CCFF00', fontFamily: 'var(--font-mono)' }}>
                            ₹{parseFloat(dish.price).toFixed(0)}
                          </span>
                          {dish.partnerRating && (
                            <span className="flex items-center gap-1 text-xs" style={{ color: '#8B8B8B' }}>
                              <Star className="w-3 h-3" style={{ color: '#FFB300', fill: '#FFB300' }} />
                              {dish.partnerRating}
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              ) : hasSearched && query ? (
                <div className="text-center py-12">
                  <span className="text-4xl mb-4 block">🔍</span>
                  <p style={{ color: '#8B8B8B' }}>No dishes found for &ldquo;{query}&rdquo;</p>
                </div>
              ) : (
                <div className="text-center py-12">
                  <span className="text-4xl mb-4 block">🍽️</span>
                  <p style={{ color: '#8B8B8B' }}>Search for your favorite dishes</p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
