'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Minus, Plus, Trash2, ShoppingBag, Ticket } from 'lucide-react';
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
  const grandTotal = total + deliveryFee;

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
    <div className="page-container bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-40 glass safe-top">
        <div className="flex items-center justify-between px-5 py-4">
          <Link href="/">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-icon"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </motion.button>
          </Link>
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-lg font-bold text-gray-900"
          >
            Cart <span className="text-purple-500">({items.length})</span>
          </motion.h1>
          {items.length > 0 ? (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={clearCart}
              className="text-red-500 text-sm font-semibold px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
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
            className="w-28 h-28 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mb-8"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <ShoppingBag className="w-14 h-14 text-purple-400" />
          </motion.div>
          <h2 className="text-xl font-bold text-gray-900 mb-3">Your cart is empty</h2>
          <p className="text-gray-500 text-center mb-8 max-w-[260px] leading-relaxed">
            Swipe right on dishes you love to add them to your cart!
          </p>
          <Link href="/discover">
            <Button>Start Discovering</Button>
          </Link>
        </motion.div>
      ) : (
        <>
          {/* Promo Banner */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-5 mt-5 p-4 rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 flex items-center gap-4"
          >
            <div className="w-11 h-11 rounded-xl bg-purple-500 flex items-center justify-center flex-shrink-0">
              <Ticket className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">3 vouchers available</p>
              <p className="text-xs text-gray-500">Apply at checkout for discounts</p>
            </div>
            <button className="text-purple-600 text-sm font-semibold px-3 py-1.5 rounded-lg hover:bg-purple-100 transition-colors">
              View
            </button>
          </motion.div>

          {/* Cart Items */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="px-5 py-5 space-y-4"
          >
            {Object.entries(groupedItems).map(([partnerId, group]) => (
              <motion.div
                key={partnerId}
                variants={itemVariants}
                className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden"
              >
                <div className="px-4 py-3.5 bg-gray-50 border-b border-gray-100">
                  <p className="font-semibold text-gray-900 text-sm">{group.partnerName}</p>
                </div>
                <div className="divide-y divide-gray-100">
                  <AnimatePresence mode="popLayout">
                    {group.items.map((item) => (
                      <motion.div
                        key={item.dishId}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="flex items-center gap-4 p-4"
                      >
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 text-sm truncate">{item.name}</h3>
                          <p className="text-purple-600 font-bold text-base mt-1">₹{item.price}</p>
                        </div>
                        <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-1">
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => updateQuantity(item.dishId, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white shadow-sm border border-gray-100"
                          >
                            {item.quantity === 1 ? (
                              <Trash2 className="w-4 h-4 text-red-500" />
                            ) : (
                              <Minus className="w-4 h-4 text-gray-600" />
                            )}
                          </motion.button>
                          <span className="w-8 text-center font-semibold text-sm">{item.quantity}</span>
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => updateQuantity(item.dishId, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-purple-500 text-white shadow-sm"
                          >
                            <Plus className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Order Summary */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="px-5 pb-36"
          >
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 space-y-4">
              <h3 className="font-semibold text-gray-900">Order Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium text-gray-900">₹{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Delivery Fee</span>
                  <span className="font-medium text-gray-900">₹{deliveryFee.toFixed(2)}</span>
                </div>
              </div>
              <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
                <span className="text-gray-900 font-semibold">Total</span>
                <span className="text-purple-600 font-bold text-xl">₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </motion.div>

          {/* Checkout Button */}
          <div className="fixed bottom-20 left-0 right-0 px-5 py-4 glass border-t border-gray-200/50">
            <div className="max-w-[430px] mx-auto">
              <Link href="/checkout">
                <Button className="w-full" size="lg">
                  Proceed to Checkout • ₹{grandTotal.toFixed(2)}
                </Button>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
