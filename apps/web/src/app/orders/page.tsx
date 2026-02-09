'use client';

import { motion } from 'framer-motion';
import { ChevronLeft, Package, Clock, CheckCircle2, XCircle, Loader2, RotateCcw } from 'lucide-react';
import { useOrderHistory, useReorder } from '@/hooks/useOrders';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const statusConfig: Record<string, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  pending: { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Pending' },
  confirmed: { icon: CheckCircle2, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Confirmed' },
  preparing: { icon: Package, color: 'text-purple-600', bg: 'bg-purple-100', label: 'Preparing' },
  out_for_delivery: { icon: Package, color: 'text-orange-600', bg: 'bg-orange-100', label: 'On the way' },
  delivered: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100', label: 'Delivered' },
  cancelled: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100', label: 'Cancelled' },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function OrdersPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { data, isLoading, error } = useOrderHistory(20);
  const reorderMutation = useReorder();
  const router = useRouter();

  // Auth check
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-white px-8">
        <Package className="w-16 h-16 text-gray-300 mb-6" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Login to see orders</h2>
        <p className="text-gray-500 text-center mb-6">You need to be logged in to view your order history</p>
        <Link href="/login">
          <Button>Login</Button>
        </Link>
      </div>
    );
  }

  // Loading state
  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
        <p className="mt-4 text-gray-500">Loading orders...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-white px-8">
        <span className="text-6xl mb-6">😕</span>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Couldn't load orders</h2>
        <p className="text-gray-500 text-center mb-6">{error.message}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  const orders = data?.orders || [];

  const handleReorder = async (orderId: string) => {
    await reorderMutation.mutateAsync(orderId);
    router.push('/cart');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 glass safe-top">
        <div className="flex items-center justify-between px-5 py-4">
          <Link href="/">
            <button className="btn-icon">
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
          </Link>
          <h1 className="text-lg font-bold text-gray-900">My Orders</h1>
          <div className="w-10" />
        </div>
      </header>

      {/* Orders List */}
      {orders.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-24 px-8"
        >
          <Package className="w-20 h-20 text-gray-200 mb-6" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">No orders yet</h2>
          <p className="text-gray-500 text-center mb-8">Start discovering delicious dishes!</p>
          <Link href="/discover">
            <Button>Start Discovering</Button>
          </Link>
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="px-5 py-6 space-y-4"
        >
          {orders.map((order) => {
            const status = statusConfig[order.status] || statusConfig.pending;
            const StatusIcon = status.icon;
            const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });
            const orderTime = new Date(order.createdAt).toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <motion.div
                key={order.id}
                variants={itemVariants}
                className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden"
              >
                {/* Order Header */}
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Order #{order.id.slice(0, 8)}</p>
                    <p className="text-sm font-medium text-gray-900">{orderDate} • {orderTime}</p>
                  </div>
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${status.bg}`}>
                    <StatusIcon className={`w-4 h-4 ${status.color}`} />
                    <span className={`text-xs font-semibold ${status.color}`}>{status.label}</span>
                  </div>
                </div>

                {/* Order Items */}
                <div className="px-4 py-4">
                  <p className="text-sm font-medium text-gray-900 mb-2">{order.partnerName || 'Restaurant'}</p>
                  <div className="space-y-1">
                    {order.items.slice(0, 3).map((item, idx) => (
                      <p key={idx} className="text-sm text-gray-600">
                        {item.qty}× {item.name}
                      </p>
                    ))}
                    {order.items.length > 3 && (
                      <p className="text-sm text-gray-400">+{order.items.length - 3} more items</p>
                    )}
                  </div>
                </div>

                {/* Order Footer */}
                <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
                  <p className="text-lg font-bold text-gray-900">₹{parseFloat(order.total).toFixed(0)}</p>
                  {order.status === 'delivered' && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleReorder(order.id)}
                      disabled={reorderMutation.isPending}
                    >
                      <RotateCcw className="w-4 h-4" />
                      Reorder
                    </Button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
