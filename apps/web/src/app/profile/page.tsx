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
  Crown,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SignInButton, UserButton, useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { useOrderHistory } from '@/hooks/useOrders';

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
  const { isLoaded, isSignedIn, user } = useUser();
  const { data: orderData } = useOrderHistory();

  // Loading state
  if (!isLoaded) {
    return (
      <div className="page-container flex items-center justify-center" style={{ background: '#000000' }}>
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#CCFF00' }} />
      </div>
    );
  }

  // Not logged in state
  if (!isSignedIn) {
    return (
      <div className="page-container" style={{ background: '#000000' }}>
        <header className="px-5 py-4 safe-top">
          <h1 className="text-2xl font-bold" style={{ color: '#F5F0EB', fontFamily: 'var(--font-display)' }}>
            Profile
          </h1>
        </header>

        <div className="flex flex-col items-center justify-center px-8 py-16">
          <div className="w-24 h-24 rounded-full mb-6 flex items-center justify-center" style={{ background: 'rgba(204, 255, 0, 0.08)', border: '1px solid rgba(204, 255, 0, 0.15)' }}>
            <span className="text-4xl">👤</span>
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ color: '#F5F0EB', fontFamily: 'var(--font-display)' }}>Welcome to CRAVE</h2>
          <p className="text-center mb-8 max-w-[260px]" style={{ color: '#8B8B8B' }}>
            Login to track orders, save favorites, and get personalized recommendations
          </p>
          <SignInButton mode="modal">
            <Button size="lg">Login / Sign Up</Button>
          </SignInButton>
        </div>
      </div>
    );
  }

  const menuItems = [
    { icon: Clock, label: 'Order History', href: '/orders' },
    { icon: MapPin, label: 'Saved Addresses', value: 'Coming soon' },
    { icon: CreditCard, label: 'Payment Methods', value: 'Coming soon' },
    { icon: Heart, label: 'Favorites', value: 'Coming soon' },
    { icon: Bell, label: 'Notifications', badge: true },
    { icon: Settings, label: 'Settings', value: '' },
    { icon: HelpCircle, label: 'Help & Support', value: '' },
  ];

  // Get user initials
  const initials = user?.firstName
    ? `${user.firstName[0]}${user.lastName?.[0] || ''}`.toUpperCase()
    : user?.emailAddresses?.[0]?.emailAddress?.[0]?.toUpperCase() || 'U';

  return (
    <div className="page-container" style={{ background: '#000000' }}>
      {/* Header */}
      <header className="px-5 py-4 safe-top">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold"
          style={{ color: '#F5F0EB', fontFamily: 'var(--font-display)' }}
        >
          Profile
        </motion.h1>
      </header>

      {/* User Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-5 p-5 rounded-2xl"
        style={{
          background: '#0A0A0F',
          border: '1px solid rgba(255, 255, 255, 0.06)',
        }}
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold overflow-hidden" style={{ background: 'rgba(204, 255, 0, 0.12)', border: '2px solid rgba(204, 255, 0, 0.3)', boxShadow: '0 0 20px rgba(204, 255, 0, 0.15)' }}>
            {user?.imageUrl ? (
              <img src={user.imageUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span style={{ color: '#CCFF00' }}>{initials}</span>
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold" style={{ color: '#F5F0EB' }}>
              {user?.fullName || user?.firstName || 'CRAVE User'}
            </h2>
            <p className="text-sm" style={{ color: '#8B8B8B' }}>
              {user?.emailAddresses?.[0]?.emailAddress || user?.phoneNumbers?.[0]?.phoneNumber || ''}
            </p>
          </div>
          <UserButton
            appearance={{
              elements: {
                avatarBox: 'w-10 h-10',
              }
            }}
          />
        </div>

        {/* Stats */}
        <div className="flex justify-around mt-5 pt-5" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
          <div className="text-center">
            <p className="text-2xl font-bold" style={{ color: '#F5F0EB' }}>{orderData?.orders?.length ?? 0}</p>
            <p className="text-xs font-medium mt-0.5" style={{ color: '#8B8B8B' }}>Orders</p>
          </div>
          <div className="w-px" style={{ background: 'rgba(255, 255, 255, 0.06)' }} />
          <div className="text-center">
            <p className="text-2xl font-bold" style={{ color: '#F5F0EB' }}>0</p>
            <p className="text-xs font-medium mt-0.5" style={{ color: '#8B8B8B' }}>Favorites</p>
          </div>
          <div className="w-px" style={{ background: 'rgba(255, 255, 255, 0.06)' }} />
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <Star className="w-4 h-4" style={{ color: '#CCFF00', fill: '#CCFF00' }} />
              <p className="text-2xl font-bold" style={{ color: '#F5F0EB' }}>-</p>
            </div>
            <p className="text-xs font-medium mt-0.5" style={{ color: '#8B8B8B' }}>Rating</p>
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
            <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: 'rgba(204, 255, 0, 0.15)' }}>
              <Crown className="w-6 h-6" style={{ color: '#CCFF00' }} />
            </div>
            <div>
              <p className="text-sm" style={{ color: 'rgba(245, 240, 235, 0.6)' }}>Upgrade to</p>
              <p className="text-lg font-bold" style={{ color: '#F5F0EB', fontFamily: 'var(--font-display)' }}>CRAVE Pro</p>
            </div>
          </div>
          <Button variant="secondary" size="sm" className="!text-white">
            ₹99/mo
          </Button>
        </div>
        <p className="text-xs mt-3 relative z-10" style={{ color: 'rgba(245, 240, 235, 0.5)' }}>Free delivery • Priority support • Exclusive deals</p>
      </motion.div>

      {/* Menu Items */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mx-5 mt-6 rounded-2xl overflow-hidden"
        style={{
          background: '#0A0A0F',
          border: '1px solid rgba(255, 255, 255, 0.06)',
        }}
      >
        {menuItems.map((item) => {
          const Icon = item.icon;
          const content = (
            <motion.div
              variants={itemVariants}
              className="w-full flex items-center justify-between px-5 py-4 transition-colors last:border-b-0"
              style={{
                borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(255, 255, 255, 0.05)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'transparent';
              }}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(204, 255, 0, 0.08)' }}>
                  <Icon className="w-5 h-5" style={{ color: '#CCFF00' }} />
                </div>
                <span className="font-medium" style={{ color: '#F5F0EB' }}>{item.label}</span>
              </div>
              <div className="flex items-center gap-3">
                {item.value && (
                  <span className="text-sm" style={{ color: '#8B8B8B' }}>{item.value}</span>
                )}
                {item.badge && (
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FF2E63', boxShadow: '0 0 0 2px #0A0A0F' }} />
                )}
                <ChevronRight className="w-5 h-5" style={{ color: '#8B8B8B' }} />
              </div>
            </motion.div>
          );

          if (item.href) {
            return (
              <Link key={item.label} href={item.href}>
                {content}
              </Link>
            );
          }

          return (
            <button key={item.label} className="w-full text-left">
              {content}
            </button>
          );
        })}
      </motion.div>

      {/* Manage Account - Using Clerk UserButton */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mx-5 mt-5 mb-8 flex justify-center"
      >
        <UserButton
          showName
          appearance={{
            elements: {
              rootBox: 'w-full',
              userButtonTrigger: 'w-full flex items-center justify-center gap-2 py-4 font-semibold rounded-xl transition-colors',
            }
          }}
        />
      </motion.div>
    </div>
  );
}
