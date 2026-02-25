'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function CartPage() {
  const { items, updateQuantity, removeItem, getTotal, clearCart } = useCartStore();
  const total = getTotal();
  const deliveryFee = items.length > 0 ? 40 : 0;
  const platformFee = items.length > 0 ? 5 : 0;
  const gst = total * 0.05;
  const grandTotal = total + deliveryFee + platformFee + gst;

  // Group items by partner
  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.partnerId]) {
      acc[item.partnerId] = {
        partnerName: item.partnerName,
        items: [],
      };
    }
    acc[item.partnerId].items.push(item);
    return acc;
  }, {} as Record<string, { partnerName: string; items: typeof items }>);

  return (
    <div className="page-container" style={{ background: '#000000' }}>
      {/* Header */}
      <header className="sticky top-0 z-40 safe-top" style={{
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
      }}>
        <div className="flex items-center justify-between px-5 py-4">
          <Link href="/">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-icon"
            >
              <ChevronLeft className="w-5 h-5" style={{ color: '#8B8B8B' }} />
            </motion.button>
          </Link>
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-lg font-bold uppercase tracking-wider"
            style={{ color: '#CCFF00', fontFamily: 'var(--font-display)', textShadow: '0 0 20px rgba(204, 255, 0, 0.3)' }}
          >
            The Stash <span style={{ color: '#8B8B8B', fontSize: '0.8em' }}>({items.length})</span>
          </motion.h1>
          {items.length > 0 ? (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={clearCart}
              className="text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors"
              style={{ color: '#FF2E63' }}
            >
              Clear
            </motion.button>
          ) : (
            <div className="w-12" />
          )}
        </div>
      </header>

      {items.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center px-8 py-24"
        >
          <motion.div 
            className="w-28 h-28 rounded-full flex items-center justify-center mb-8"
            style={{ 
              background: 'rgba(204, 255, 0, 0.08)', 
              border: '1px solid rgba(204, 255, 0, 0.15)',
            }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <ShoppingBag className="w-14 h-14" style={{ color: 'rgba(204, 255, 0, 0.4)' }} />
          </motion.div>
          <h2 className="text-xl font-bold mb-3" style={{ color: '#F5F0EB', fontFamily: 'var(--font-display)' }}>
            Your stash is empty
          </h2>
          <p className="text-center mb-8 max-w-[260px] leading-relaxed" style={{ color: '#8B8B8B' }}>
            Swipe right on dishes you crave to add them here!
          </p>
          <Link href="/discover">
            <Button>Start Discovering</Button>
          </Link>
        </motion.div>
      ) : (
        <>
          {/* Receipt-style header */}
          <div className="px-5 pt-5 pb-2 text-center">
            <p className="text-xs uppercase tracking-[0.2em]" style={{ color: '#8B8B8B', fontFamily: 'var(--font-mono)' }}>
              ── ORDER RECEIPT ──
            </p>
          </div>

          {/* Cart Items */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="px-5 py-3 space-y-4"
          >
            {Object.entries(groupedItems).map(([partnerId, group]) => (
              <motion.div
                key={partnerId}
                variants={itemVariants}
                className="rounded-2xl overflow-hidden"
                style={{ 
                  background: '#0A0A0F',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                }}
              >
                <div className="px-4 py-3.5" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <p className="font-semibold text-sm" style={{ color: '#F5F0EB', fontFamily: 'var(--font-display)' }}>
                    {group.partnerName}
                  </p>
                </div>
                <div>
                  <AnimatePresence mode="popLayout">
                    {group.items.map((item, idx) => (
                      <motion.div
                        key={item.dishId}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="flex items-center gap-4 p-4"
                        style={{ borderBottom: idx < group.items.length - 1 ? '1px solid rgba(255, 255, 255, 0.04)' : 'none' }}
                      >
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm truncate" style={{ color: '#F5F0EB' }}>{item.name}</h3>
                          <p className="font-bold text-base mt-1" style={{ color: '#CCFF00', fontFamily: 'var(--font-mono)' }}>
                            ₹{item.price}
                          </p>
                        </div>
                        <div 
                          className="flex items-center gap-2 rounded-xl p-1"
                          style={{ background: '#1A1A2E', border: '1px solid rgba(255, 255, 255, 0.06)' }}
                        >
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => updateQuantity(item.dishId, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg"
                            style={{ background: 'rgba(255, 255, 255, 0.05)' }}
                          >
                            {item.quantity === 1 ? (
                              <Trash2 className="w-4 h-4" style={{ color: '#FF2E63' }} />
                            ) : (
                              <Minus className="w-4 h-4" style={{ color: '#8B8B8B' }} />
                            )}
                          </motion.button>
                          <span className="w-8 text-center font-semibold text-sm" style={{ color: '#F5F0EB' }}>
                            {item.quantity}
                          </span>
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => updateQuantity(item.dishId, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg"
                            style={{ background: '#CCFF00' }}
                          >
                            <Plus className="w-4 h-4" style={{ color: '#000000' }} />
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Receipt Divider */}
          <div className="px-5">
            <hr className="receipt-divider" />
          </div>

          {/* Bill Breakdown — Receipt style */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="px-5 pb-36"
          >
            <div 
              className="rounded-2xl p-5 space-y-4"
              style={{ 
                background: '#0A0A0F',
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <h3 className="font-semibold text-sm uppercase tracking-wider" style={{ color: '#8B8B8B', fontFamily: 'var(--font-display)' }}>
                Bill Details
              </h3>
              <div className="space-y-3" style={{ fontFamily: 'var(--font-mono)' }}>
                <div className="flex justify-between text-sm">
                  <span style={{ color: '#8B8B8B' }}>Subtotal</span>
                  <span className="font-medium" style={{ color: '#F5F0EB' }}>₹{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: '#8B8B8B' }}>Delivery fee</span>
                  <span className="font-medium" style={{ color: '#F5F0EB' }}>₹{deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: '#8B8B8B' }}>Platform fee</span>
                  <span className="font-medium" style={{ color: '#F5F0EB' }}>₹{platformFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: '#8B8B8B' }}>GST (5%)</span>
                  <span className="font-medium" style={{ color: '#F5F0EB' }}>₹{gst.toFixed(2)}</span>
                </div>
              </div>
              <div 
                className="pt-4 flex justify-between items-center"
                style={{ borderTop: '2px dashed rgba(255, 255, 255, 0.08)' }}
              >
                <span className="font-bold uppercase tracking-wider text-sm" style={{ color: '#F5F0EB', fontFamily: 'var(--font-display)' }}>Total</span>
                <span 
                  className="font-bold text-xl"
                  style={{ color: '#CCFF00', fontFamily: 'var(--font-mono)', textShadow: '0 0 20px rgba(204, 255, 0, 0.2)' }}
                >
                  ₹{grandTotal.toFixed(2)}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Slide to Pay CTA */}
          <div className="fixed bottom-20 left-0 right-0 px-5 py-4" style={{
            background: 'rgba(0, 0, 0, 0.9)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          }}>
            <div className="max-w-[430px] mx-auto">
              <Link href="/checkout">
                <div className="slide-to-pay">
                  <div className="slide-to-pay-track">
                    <ArrowRight className="w-5 h-5" style={{ color: '#000000' }} />
                  </div>
                  <span className="slide-to-pay-text">
                    Slide to Pay • ₹{grandTotal.toFixed(0)}
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
