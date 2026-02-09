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

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
      setResults([]);
      setHasSearched(false);
    }
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      setHasSearched(true);
      
      // Use the feed API and filter client-side for now
      // In production, add a search endpoint
      const { data } = await dishesApi.getFeed({ limit: 50 });
      
      if (data?.dishes) {
        const filtered = data.dishes.filter(dish => 
          dish.name.toLowerCase().includes(query.toLowerCase()) ||
          dish.description?.toLowerCase().includes(query.toLowerCase()) ||
          dish.partnerName?.toLowerCase().includes(query.toLowerCase()) ||
          dish.category?.toLowerCase().includes(query.toLowerCase())
        );
        setResults(filtered.slice(0, 10));
      }
      
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
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-0 left-0 right-0 z-50 bg-white rounded-b-3xl shadow-2xl max-h-[80vh] overflow-hidden"
          >
            {/* Search Input */}
            <div className="p-5 border-b border-gray-100 safe-top">
              <div className="relative flex items-center">
                <Search className="absolute left-4 w-5 h-5 text-gray-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search dishes, restaurants..."
                  className="w-full h-12 pl-12 pr-12 bg-gray-100 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                {query && (
                  <button
                    onClick={() => setQuery('')}
                    className="absolute right-12 p-1 hover:bg-gray-200 rounded-full"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="ml-3 text-purple-600 font-medium text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>

            {/* Results */}
            <div className="overflow-y-auto max-h-[60vh] p-5">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                </div>
              ) : results.length > 0 ? (
                <div className="space-y-3">
                  {results.map((dish) => (
                    <motion.button
                      key={dish.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => handleAddToCart(dish)}
                      className="w-full flex items-center gap-4 p-3 bg-gray-50 hover:bg-purple-50 rounded-2xl transition-colors text-left"
                    >
                      <img
                        src={dish.thumbnailUrl || dish.imageUrls?.[0] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100'}
                        alt={dish.name}
                        className="w-16 h-16 rounded-xl object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{dish.name}</h3>
                        <p className="text-sm text-gray-500 truncate">{dish.partnerName}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-purple-600 font-bold">₹{parseFloat(dish.price).toFixed(0)}</span>
                          {dish.partnerRating && (
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
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
                  <p className="text-gray-500">No dishes found for "{query}"</p>
                </div>
              ) : (
                <div className="text-center py-12">
                  <span className="text-4xl mb-4 block">🍽️</span>
                  <p className="text-gray-500">Search for your favorite dishes</p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
