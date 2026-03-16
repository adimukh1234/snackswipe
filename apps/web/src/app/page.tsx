'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, ArrowRight, Search } from 'lucide-react';
import { SearchModal } from '@/components/SearchModal';
import { DishDetailModal } from '@/components/DishDetailModal';
import { useFeed } from '@/hooks/useDishes';
import { Dish } from '@/lib/api';
import Link from 'next/link';

// Shimmer skeleton component
function Shimmer({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`relative overflow-hidden ${className ?? ''}`}
      style={style}
    >
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%)',
          backgroundSize: '200% 100%',
        }}
        animate={{ backgroundPositionX: ['200%', '-200%'] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
}

const CATEGORIES = ['All', 'Pizza', 'Sushi', 'Burgers', 'Indian', 'Healthy', 'Desserts', 'Chinese'];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }
  },
};

export default function HomePage() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const [isDishModalOpen, setIsDishModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');

  const { data, isLoading } = useFeed({ limit: 12, category: activeCategory === 'All' ? undefined : activeCategory.toLowerCase() });
  const dishes = data?.dishes || [];

  const handleDishClick = (dish: Dish) => {
    setSelectedDish(dish);
    setIsDishModalOpen(true);
  };

  // Recent craves — take first 4 dishes
  const recentCraves = dishes.slice(0, 4);
  // Trending — take next dishes
  const trendingDishes = dishes.slice(4, 8);

  return (
    <div className="page-container" style={{ background: '#000000' }}>
      {/* ═══ Header ═══ */}
      <header 
        className="flex items-center justify-between p-6 sticky top-0 z-50 safe-top"
        style={{
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
      >
        <h1 
          className="text-3xl font-bold tracking-tighter uppercase italic"
          style={{ color: '#CCFF00', fontFamily: 'var(--font-display)' }}
        >
          Crave
        </h1>
        <div className="flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center justify-center p-2 rounded-full"
            style={{
              background: '#1a1a1a',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <Search className="w-5 h-5 text-white" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="flex items-center justify-center p-2 rounded-full"
            style={{
              background: '#1a1a1a',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <Bell className="w-5 h-5 text-white" />
          </motion.button>
          <div 
            className="w-10 h-10 rounded-full overflow-hidden"
            style={{ border: '2px solid #CCFF00' }}
          >
            <img 
              src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop" 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </header>

      <main className="flex-1 pb-24">
        {/* ═══ Hero Section: The Stack ═══ */}
        <section className="px-6 mb-8">
          <Link href="/discover">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="relative group cursor-pointer overflow-hidden rounded-xl"
              style={{ aspectRatio: '4/5', background: '#1a1a1a', border: '1px solid rgba(255, 255, 255, 0.2)' }}
            >
              <img 
                src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80" 
                alt="Start Swiping" 
                className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, black 0%, rgba(0,0,0,0.2) 40%, transparent 100%)' }} />
              <div className="absolute bottom-0 left-0 p-6 w-full">
                <span 
                  className="inline-block px-3 py-1 text-xs font-bold uppercase mb-3"
                  style={{ background: '#CCFF00', color: '#000000' }}
                >
                  Live Feed
                </span>
                <h2 
                  className="text-5xl font-bold tracking-tighter uppercase text-white mb-4"
                  style={{ lineHeight: 0.9, fontFamily: 'var(--font-display)' }}
                >
                  Start<br/>Swiping
                </h2>
                <div className="flex items-center justify-between">
                  <p className="font-medium tracking-tight" style={{ color: '#CCFF00' }}>
                    Enter The Stack
                  </p>
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ background: '#CCFF00' }}
                  >
                    <ArrowRight className="w-5 h-5" style={{ color: '#000000' }} strokeWidth={2.5} />
                  </div>
                </div>
              </div>
            </motion.div>
          </Link>
        </section>

        {/* ═══ Category Chips ═══ */}
        <section className="mb-8">
          <div className="flex gap-3 overflow-x-auto px-6 hide-scrollbar pb-1">
            {CATEGORIES.map((cat) => (
              <motion.button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                whileTap={{ scale: 0.93 }}
                className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider relative"
                style={{
                  fontFamily: 'var(--font-display)',
                  color: activeCategory === cat ? '#000000' : '#8B8B8B',
                  border: activeCategory === cat ? 'none' : '1px solid rgba(255,255,255,0.12)',
                  background: activeCategory === cat ? '#CCFF00' : 'rgba(255,255,255,0.04)',
                  transition: 'color 0.15s, background 0.15s',
                }}
              >
                {activeCategory === cat && (
                  <motion.span
                    layoutId="categoryPill"
                    className="absolute inset-0 rounded-full"
                    style={{ background: '#CCFF00', zIndex: -1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
                {cat}
              </motion.button>
            ))}
          </div>
        </section>

        {/* ═══ Active Order Status ═══ */}
        <section className="px-6 mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="p-5 rounded-xl flex flex-col gap-4"
            style={{ 
              background: '#CCFF00', 
              boxShadow: '0 0 20px rgba(204, 255, 0, 0.3)',
            }}
          >
            <div className="flex justify-between items-start">
              <div className="flex flex-col">
                <span className="text-xs font-bold uppercase tracking-[0.15em]" style={{ color: 'rgba(0,0,0,0.6)' }}>
                  Active Order
                </span>
                <h3 className="text-xl font-extrabold leading-tight" style={{ color: '#000000', fontFamily: 'var(--font-display)' }}>
                  Ramen on the way
                </h3>
              </div>
              <span className="text-lg font-bold" style={{ color: '#000000', fontFamily: 'var(--font-mono)' }}>
                12 min
              </span>
            </div>
            <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.1)' }}>
              <div className="h-full rounded-full" style={{ width: '70%', background: '#000000' }} />
            </div>
            <div className="flex items-center gap-2 text-sm font-medium" style={{ color: 'rgba(0,0,0,0.8)' }}>
              <span className="text-sm">📍</span>
              <span>Motto Ramen • 2.4 miles away</span>
            </div>
          </motion.div>
        </section>

        {/* ═══ Recent Craves ═══ */}
        <section className="mb-8">
          <div className="flex items-center justify-between px-6 mb-4">
            <h3 
              className="text-xl font-bold uppercase tracking-tighter text-white"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Recent Craves
            </h3>
            <button 
              className="text-sm font-bold uppercase"
              style={{ color: '#CCFF00' }}
            >
              View All
            </button>
          </div>
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex gap-4 overflow-x-auto px-6 hide-scrollbar"
          >
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-32">
                  <Shimmer
                    className="aspect-square rounded-lg mb-2"
                    style={{ background: '#1a1a1a', border: '1px solid rgba(255, 255, 255, 0.1)' }}
                  />
                  <Shimmer className="h-3 w-20 rounded" style={{ background: '#1a1a1a' }} />
                </div>
              ))
            ) : recentCraves.length > 0 ? (
              recentCraves.map((dish) => (
                <motion.div 
                  key={dish.id} 
                  variants={itemVariants}
                  className="flex-shrink-0 w-32 cursor-pointer"
                  onClick={() => handleDishClick(dish)}
                >
                  <div 
                    className="aspect-square rounded-lg overflow-hidden mb-2"
                    style={{ border: '1px solid rgba(255, 255, 255, 0.1)' }}
                  >
                    <img 
                      src={dish.thumbnailUrl || dish.imageUrls?.[0] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200'} 
                      alt={dish.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-xs font-medium truncate" style={{ color: '#94a3b8' }}>
                    {dish.name}
                  </p>
                </motion.div>
              ))
            ) : (
              // Placeholder items when no data
              ['Harvest Bowl', 'Spicy Pepperoni', 'Glazed Noir', 'Sticky Ribs'].map((name, i) => (
                <div key={i} className="flex-shrink-0 w-32">
                  <div 
                    className="aspect-square rounded-lg overflow-hidden mb-2"
                    style={{ background: '#1a1a1a', border: '1px solid rgba(255, 255, 255, 0.1)' }}
                  />
                  <p className="text-xs font-medium truncate" style={{ color: '#94a3b8' }}>
                    {name}
                  </p>
                </div>
              ))
            )}
          </motion.div>
        </section>

        {/* ═══ Trending Nearby ═══ */}
        <section className="px-6">
          <div className="flex items-center justify-between mb-6">
            <h3 
              className="text-xl font-bold uppercase tracking-tighter text-white"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Trending Nearby
            </h3>
          </div>
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 gap-6"
          >
            {isLoading ? (
              Array.from({ length: 2 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl overflow-hidden"
                  style={{ background: '#1a1a1a', border: '1px solid rgba(255, 255, 255, 0.05)' }}
                >
                  <Shimmer className="h-48 w-full" style={{ background: '#121212' }} />
                  <div className="p-4 space-y-3">
                    <Shimmer className="h-5 w-40 rounded" style={{ background: '#121212' }} />
                    <Shimmer className="h-3 w-32 rounded" style={{ background: '#121212' }} />
                    <Shimmer className="h-10 w-full rounded" style={{ background: '#121212' }} />
                  </div>
                </div>
              ))
            ) : trendingDishes.length > 0 ? (
              trendingDishes.map((dish) => (
                <motion.div 
                  key={dish.id}
                  variants={itemVariants}
                  className="relative rounded-xl overflow-hidden cursor-pointer"
                  style={{ background: '#1a1a1a', border: '1px solid rgba(255, 255, 255, 0.05)' }}
                  onClick={() => handleDishClick(dish)}
                >
                  <div className="h-48 w-full">
                    <img 
                      src={dish.thumbnailUrl || dish.imageUrls?.[0] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600'} 
                      alt={dish.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 
                        className="text-lg font-bold text-white uppercase"
                        style={{ fontFamily: 'var(--font-display)' }}
                      >
                        {dish.name}
                      </h4>
                      <span className="font-bold" style={{ color: '#CCFF00' }}>
                        {dish.partnerRating || '4.5'}★
                      </span>
                    </div>
                    <div className="flex gap-2 text-xs font-medium mb-4" style={{ color: '#94a3b8' }}>
                      <span style={{ color: '#CCFF00', fontFamily: 'var(--font-mono)' }}>
                        ₹{parseFloat(dish.price).toFixed(0)}
                      </span>
                      <span>•</span>
                      <span>{dish.category || 'Food'}</span>
                      <span>•</span>
                      <span>{dish.partnerName}</span>
                    </div>
                    <button 
                      className="w-full py-3 text-xs font-bold uppercase tracking-[0.15em] transition-colors text-white"
                      style={{ 
                        background: 'rgba(255, 255, 255, 0.05)', 
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                      }}
                      onMouseEnter={(e) => {
                        (e.target as HTMLButtonElement).style.borderColor = '#CCFF00';
                        (e.target as HTMLButtonElement).style.color = '#CCFF00';
                      }}
                      onMouseLeave={(e) => {
                        (e.target as HTMLButtonElement).style.borderColor = 'rgba(255, 255, 255, 0.1)';
                        (e.target as HTMLButtonElement).style.color = '#FFFFFF';
                      }}
                    >
                      Order Now
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              // Placeholder cards when no data
              [
                { name: 'Midnight Dumplings', rating: '4.9', type: 'Chinese', dist: '0.8 miles' },
                { name: 'Neon Sushi Bar', rating: '4.7', type: 'Japanese', dist: '1.2 miles' },
              ].map((item, i) => (
                <div 
                  key={i}
                  className="relative rounded-xl overflow-hidden"
                  style={{ background: '#1a1a1a', border: '1px solid rgba(255, 255, 255, 0.05)' }}
                >
                  <div className="h-48 w-full" style={{ background: '#121212' }} />
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-lg font-bold text-white uppercase" style={{ fontFamily: 'var(--font-display)' }}>
                        {item.name}
                      </h4>
                      <span className="font-bold" style={{ color: '#CCFF00' }}>{item.rating}★</span>
                    </div>
                    <div className="flex gap-2 text-xs font-medium mb-4" style={{ color: '#94a3b8' }}>
                      <span>$$</span>
                      <span>•</span>
                      <span>{item.type}</span>
                      <span>•</span>
                      <span>{item.dist}</span>
                    </div>
                    <button 
                      className="w-full py-3 text-xs font-bold uppercase tracking-[0.15em] text-white transition-colors"
                      style={{ 
                        background: 'rgba(255, 255, 255, 0.05)', 
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                      }}
                    >
                      Order Now
                    </button>
                  </div>
                </div>
              ))
            )}
          </motion.div>
        </section>
      </main>

      {/* Search Modal */}
      <SearchModal 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />

      {/* Dish Detail Modal */}
      <DishDetailModal
        dish={selectedDish}
        isOpen={isDishModalOpen}
        onClose={() => setIsDishModalOpen(false)}
      />
    </div>
  );
}
