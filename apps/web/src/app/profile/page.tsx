'use client';

import { motion } from 'framer-motion';
import { 
  ChevronRight, 
  MapPin, 
  CreditCard, 
  Bell, 
  HelpCircle, 
  LogOut,
  Settings,
  Heart,
  Clock,
  Star,
  Crown
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

const menuItems = [
  { icon: MapPin, label: 'Saved Addresses', value: '2 addresses' },
  { icon: CreditCard, label: 'Payment Methods', value: '1 card' },
  { icon: Heart, label: 'Favorites', value: '12 dishes' },
  { icon: Clock, label: 'Order History', value: '' },
  { icon: Bell, label: 'Notifications', badge: true },
  { icon: Settings, label: 'Settings', value: '' },
  { icon: HelpCircle, label: 'Help & Support', value: '' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
};

export default function ProfilePage() {
  return (
    <div className="page-container bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="px-5 py-6 safe-top">
        <motion.h1 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-gray-900"
        >
          Profile
        </motion.h1>
      </header>

      {/* User Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-5 p-5 bg-white rounded-2xl shadow-md border border-gray-100"
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-purple-500/30">
            J
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-gray-900">John Doe</h2>
            <p className="text-gray-500 text-sm">+91 98765 43210</p>
          </div>
          <button className="text-purple-600 text-sm font-semibold px-3 py-1.5 rounded-lg hover:bg-purple-50 transition-colors">
            Edit
          </button>
        </div>

        {/* Stats */}
        <div className="flex justify-around mt-5 pt-5 border-t border-gray-100">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">23</p>
            <p className="text-xs text-gray-400 font-medium mt-0.5">Orders</p>
          </div>
          <div className="w-px bg-gray-100" />
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">12</p>
            <p className="text-xs text-gray-400 font-medium mt-0.5">Favorites</p>
          </div>
          <div className="w-px bg-gray-100" />
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <p className="text-2xl font-bold text-gray-900">4.8</p>
            </div>
            <p className="text-xs text-gray-400 font-medium mt-0.5">Rating</p>
          </div>
        </div>
      </motion.div>

      {/* Promo Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mx-5 mt-5 promo-card"
      >
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-white/80 text-sm">Upgrade to</p>
              <p className="text-lg font-bold text-white">Zomagram Pro</p>
            </div>
          </div>
          <Button variant="secondary" size="sm" className="!bg-white !text-purple-600 !shadow-lg">
            ₹99/mo
          </Button>
        </div>
        <p className="text-white/70 text-xs mt-3 relative z-10">Free delivery • Priority support • Exclusive deals</p>
      </motion.div>

      {/* Menu Items */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mx-5 mt-6 bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden"
      >
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.button
              key={item.label}
              variants={itemVariants}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-purple-600" />
                </div>
                <span className="font-medium text-gray-900">{item.label}</span>
              </div>
              <div className="flex items-center gap-3">
                {item.value && (
                  <span className="text-sm text-gray-400">{item.value}</span>
                )}
                {item.badge && (
                  <span className="w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white" />
                )}
                <ChevronRight className="w-5 h-5 text-gray-300" />
              </div>
            </motion.button>
          );
        })}
      </motion.div>

      {/* Logout */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mx-5 mt-5 mb-8 w-[calc(100%-40px)] flex items-center justify-center gap-2 py-4 text-red-500 font-semibold hover:bg-red-50 rounded-xl transition-colors"
      >
        <LogOut className="w-5 h-5" />
        Log Out
      </motion.button>
    </div>
  );
}
