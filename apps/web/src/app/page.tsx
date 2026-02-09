'use client';

import { motion } from 'framer-motion';
import { MapPin, Search, Bell, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import Link from 'next/link';

// Mock featured dishes data
const featuredDishes = [
  {
    id: '1',
    name: 'Butter Chicken',
    price: 350,
    imageUrl: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400',
    partnerName: 'Punjab Grill',
    rating: 4.8,
  },
  {
    id: '2',
    name: 'Margherita Pizza',
    price: 299,
    imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400',
    partnerName: 'Pizza Palace',
    rating: 4.6,
  },
  {
    id: '3',
    name: 'Sushi Platter',
    price: 599,
    imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400',
    partnerName: 'Tokyo Bites',
    rating: 4.9,
  },
  {
    id: '4',
    name: 'Loaded Burger',
    price: 249,
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
    partnerName: 'Burger Barn',
    rating: 4.5,
  },
];

const categories = [
  { name: 'All', emoji: '🍽️', active: true },
  { name: 'Burger', emoji: '🍔' },
  { name: 'Pizza', emoji: '🍕' },
  { name: 'Sushi', emoji: '🍣' },
  { name: 'Indian', emoji: '🍛' },
  { name: 'Dessert', emoji: '🍰' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
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
  return (
    <div className="page-container gradient-subtle">
      {/* Header */}
      <header className="sticky top-0 z-40 glass safe-top">
        <div className="flex items-center justify-between px-5 py-4">
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400">Deliver to</p>
              <div className="flex items-center gap-1">
                <p className="text-sm font-semibold text-gray-900">Current Location</p>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <button className="btn-icon">
              <Search className="w-5 h-5 text-gray-600" />
            </button>
            <button className="btn-icon relative">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white" />
            </button>
          </motion.div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-5 pt-6 pb-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <h1 className="text-2xl font-bold text-gray-900 leading-tight tracking-tight">
            What are you going
            <br />
            <span className="text-purple-600">to eat today?</span>
          </h1>
        </motion.div>

        {/* Promo Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.15, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          className="promo-card mt-5"
        >
          <div className="relative z-10">
            <p className="text-sm font-medium opacity-90">Big discount</p>
            <p className="text-4xl font-black tracking-tight mt-1">10.10</p>
            <p className="text-sm opacity-80 mt-1">Claim your voucher now!</p>
          </div>
          <div className="absolute right-4 bottom-0 opacity-30">
            <span className="text-7xl">🍟</span>
          </div>
        </motion.div>
      </section>

      {/* Categories */}
      <section className="py-4">
        <div className="section-header px-5">
          <h2 className="section-title">Category</h2>
          <button className="section-link">See more</button>
        </div>
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex gap-3 overflow-x-auto hide-scrollbar px-5 pb-2"
        >
          {categories.map((cat) => (
            <motion.button
              key={cat.name}
              variants={itemVariants}
              whileTap={{ scale: 0.95 }}
              className={`category-pill ${cat.active ? 'active' : ''}`}
            >
              <span className="text-2xl">{cat.emoji}</span>
              <span className="text-xs font-semibold">{cat.name}</span>
            </motion.button>
          ))}
        </motion.div>
      </section>

      {/* Discover CTA */}
      <section className="px-5 py-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="bg-gradient-to-br from-purple-50 via-white to-pink-50 rounded-3xl p-8 text-center border border-purple-100/50 shadow-lg shadow-purple-100/30"
        >
          <motion.span 
            className="text-6xl mb-4 block"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            👆
          </motion.span>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Ready to discover?
          </h3>
          <p className="text-gray-500 text-sm mb-6 max-w-[240px] mx-auto leading-relaxed">
            Swipe through delicious dishes and find your next favorite meal
          </p>
          <Link href="/discover">
            <Button variant="primary" size="lg">
              Start Swiping
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Popular Dishes */}
      <section className="py-4 pb-8">
        <div className="section-header px-5">
          <h2 className="section-title">Popular near you</h2>
          <button className="section-link">See all</button>
        </div>
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 gap-4 px-5"
        >
          {featuredDishes.map((dish) => (
            <motion.div key={dish.id} variants={itemVariants}>
              <Card className="group cursor-pointer">
                <div className="relative overflow-hidden">
                  <img
                    src={dish.imageUrl}
                    alt={dish.name}
                    className="w-full h-32 object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  <span className="absolute top-2.5 right-2.5 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 shadow-sm">
                    <span className="text-yellow-500">★</span> {dish.rating}
                  </span>
                </div>
                <CardContent className="p-3.5">
                  <h3 className="font-semibold text-gray-900 text-sm truncate leading-tight">
                    {dish.name}
                  </h3>
                  <p className="text-xs text-gray-400 truncate mt-0.5">{dish.partnerName}</p>
                  <p className="text-purple-600 font-bold mt-2 text-base">₹{dish.price}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </div>
  );
}
