'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, Compass, ShoppingCart, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/stores/cartStore';

const navItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/discover', icon: Compass, label: 'Swipe' },
  { href: '/cart', icon: ShoppingCart, label: 'Cart' },
  { href: '/profile', icon: User, label: 'Profile' },
];

export function BottomNav() {
  const pathname = usePathname();
  const itemCount = useCartStore((state) => state.getItemCount());

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      {/* Dark glassmorphism nav */}
      <div className="max-w-[430px] mx-auto safe-bottom rounded-b-[40px]"
        style={{
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        }}
      >
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
                  className="flex flex-col items-center justify-center gap-1 transition-colors duration-150"
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute -top-0.5 w-8 h-1 rounded-full"
                      style={{
                        background: '#CCFF00',
                        boxShadow: '0 0 12px rgba(204, 255, 0, 0.5)',
                      }}
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                  <div className="relative">
                    <Icon
                      className={cn(
                        'w-6 h-6 transition-all duration-150',
                        isActive ? 'scale-110' : ''
                      )}
                      style={{ color: isActive ? '#CCFF00' : '#8B8B8B' }}
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                    {isCart && itemCount > 0 && (
                      <motion.span
                        data-testid="cart-badge"
                        key={itemCount}
                        initial={{ scale: 1.6, y: -2 }}
                        animate={{ scale: 1, y: 0 }}
                        transition={{ type: 'spring', stiffness: 600, damping: 12 }}
                        className="absolute -top-1.5 -right-2 min-w-[18px] h-[18px] px-1 text-[10px] font-bold rounded-full flex items-center justify-center"
                        style={{
                          background: '#CCFF00',
                          color: '#000000',
                          boxShadow: '0 0 8px rgba(204, 255, 0, 0.4)',
                        }}
                      >
                        {itemCount > 9 ? '9+' : itemCount}
                      </motion.span>
                    )}
                  </div>
                  <span
                    className={cn(
                      'text-[10px] transition-all duration-150',
                      isActive ? 'font-bold' : 'font-medium'
                    )}
                    style={{ color: isActive ? '#CCFF00' : '#8B8B8B' }}
                  >
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
