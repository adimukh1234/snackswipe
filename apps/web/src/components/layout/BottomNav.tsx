'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, Compass, ShoppingCart, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/stores/cartStore';

const navItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/discover', icon: Compass, label: 'Discover' },
  { href: '/cart', icon: ShoppingCart, label: 'Cart' },
  { href: '/profile', icon: User, label: 'Profile' },
];

export function BottomNav() {
  const pathname = usePathname();
  const itemCount = useCartStore((state) => state.getItemCount());

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      {/* Center nav within mobile container on desktop */}
      <div className="max-w-[430px] mx-auto bg-white border-t border-gray-100 safe-bottom">
        <div className="flex items-center justify-around h-[72px] px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            const isCart = item.href === '/cart';
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative flex flex-col items-center justify-center w-16 h-full"
              >
                <motion.div
                  whileTap={{ scale: 0.85 }}
                  transition={{ duration: 0.1 }}
                  className={cn(
                    'flex flex-col items-center justify-center gap-1 transition-colors duration-150',
                    isActive ? 'text-purple-600' : 'text-gray-400'
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute -top-0.5 w-8 h-1 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                  <div className="relative">
                    <Icon 
                      className={cn(
                        'w-6 h-6 transition-transform duration-150',
                        isActive && 'scale-110'
                      )} 
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                    {isCart && itemCount > 0 && (
                      <motion.span 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1.5 -right-2 min-w-[18px] h-[18px] px-1 bg-purple-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white"
                      >
                        {itemCount > 9 ? '9+' : itemCount}
                      </motion.span>
                    )}
                  </div>
                  <span className={cn(
                    'text-[10px] font-medium transition-all duration-150',
                    isActive && 'font-semibold'
                  )}>
                    {item.label}
                  </span>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
