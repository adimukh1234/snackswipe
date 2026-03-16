'use client';

import { motion } from 'framer-motion';
import { ChevronLeft, Package, Clock, CheckCircle2, XCircle, Loader2, RotateCcw } from 'lucide-react';
import { useOrderHistory, useReorder } from '@/hooks/useOrders';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const statusConfig: Record<string, { icon: React.ElementType; color: string; bg: string; borderColor: string; label: string }> = {
  pending: { icon: Clock, color: '#FFB300', bg: 'rgba(255, 179, 0, 0.1)', borderColor: 'rgba(255, 179, 0, 0.2)', label: 'Pending' },
  confirmed: { icon: CheckCircle2, color: '#00B0FF', bg: 'rgba(0, 176, 255, 0.1)', borderColor: 'rgba(0, 176, 255, 0.2)', label: 'Confirmed' },
  preparing: { icon: Package, color: '#CCFF00', bg: 'rgba(204, 255, 0, 0.1)', borderColor: 'rgba(204, 255, 0, 0.2)', label: 'Preparing' },
  out_for_delivery: { icon: Package, color: '#FF9100', bg: 'rgba(255, 145, 0, 0.1)', borderColor: 'rgba(255, 145, 0, 0.2)', label: 'On the way' },
  delivered: { icon: CheckCircle2, color: '#00E676', bg: 'rgba(0, 230, 118, 0.1)', borderColor: 'rgba(0, 230, 118, 0.2)', label: 'Delivered' },
  cancelled: { icon: XCircle, color: '#FF2E63', bg: 'rgba(255, 46, 99, 0.1)', borderColor: 'rgba(255, 46, 99, 0.2)', label: 'Cancelled' },
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
  const { isSignedIn, isLoaded } = useUser();
  const { data, isLoading, error } = useOrderHistory(20);
  const reorderMutation = useReorder();
  const router = useRouter();

  // Auth check
  if (isLoaded && !isSignedIn) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-8" style={{ background: '#000000' }}>
        <Package className="w-16 h-16 mb-6" style={{ color: 'rgba(255, 255, 255, 0.15)' }} />
        <h2 className="text-xl font-bold mb-2" style={{ color: '#F5F0EB', fontFamily: 'var(--font-display)' }}>Login to see orders</h2>
        <p className="text-center mb-6" style={{ color: '#8B8B8B' }}>You need to be logged in to view your order history</p>
        <Link href="/login">
          <Button>Login</Button>
        </Link>
      </div>
    );
  }

  // Loading state
  if (isLoading || !isLoaded) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: '#000000' }}>
        <Loader2 className="w-12 h-12 animate-spin" style={{ color: '#CCFF00' }} />
        <p className="mt-4" style={{ color: '#8B8B8B' }}>Loading drops...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-8" style={{ background: '#000000' }}>
        <span className="text-6xl mb-6">😕</span>
        <h2 className="text-xl font-bold mb-2" style={{ color: '#F5F0EB', fontFamily: 'var(--font-display)' }}>Couldn&apos;t load orders</h2>
        <p className="text-center mb-6" style={{ color: '#8B8B8B' }}>{error.message}</p>
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
    <div className="min-h-screen pb-24" style={{ background: '#000000' }}>
      {/* Header */}
      <header className="sticky top-0 z-40 safe-top" style={{
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
      }}>
        <div className="flex items-center justify-between px-5 py-4">
          <Link href="/">
            <button className="btn-icon">
              <ChevronLeft className="w-5 h-5" style={{ color: '#8B8B8B' }} />
            </button>
          </Link>
          <h1 
            className="text-lg font-bold uppercase tracking-wider"
            style={{ color: '#CCFF00', fontFamily: 'var(--font-display)', textShadow: '0 0 20px rgba(204, 255, 0, 0.3)' }}
          >
            The Drop
          </h1>
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
          <Package className="w-20 h-20 mb-6" style={{ color: 'rgba(255, 255, 255, 0.1)' }} />
          <h2 className="text-xl font-bold mb-2" style={{ color: '#F5F0EB', fontFamily: 'var(--font-display)' }}>No drops yet</h2>
          <p className="text-center mb-8" style={{ color: '#8B8B8B' }}>Start discovering delicious dishes!</p>
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
                data-testid="order-card"
                variants={itemVariants}
                className="rounded-2xl overflow-hidden"
                style={{
                  background: '#0A0A0F',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                }}
              >
                {/* Order Header */}
                <div 
                  className="px-4 py-3 flex items-center justify-between"
                  style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}
                >
                  <div>
                    <p className="text-xs" style={{ color: '#8B8B8B', fontFamily: 'var(--font-mono)' }}>
                      #{order.id.slice(0, 8)}
                    </p>
                    <p className="text-sm font-medium" style={{ color: '#F5F0EB' }}>
                      {orderDate} • {orderTime}
                    </p>
                  </div>
                  <div 
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                    style={{ 
                      background: status.bg,
                      border: `1px solid ${status.borderColor}`,
                    }}
                  >
                    <StatusIcon className="w-4 h-4" style={{ color: status.color }} />
                    <span className="text-xs font-semibold" style={{ color: status.color }}>{status.label}</span>
                  </div>
                </div>

                {/* Order Items */}
                <div className="px-4 py-4">
                  <p className="text-sm font-medium mb-2" style={{ color: '#F5F0EB', fontFamily: 'var(--font-display)' }}>
                    {order.partnerName || 'Restaurant'}
                  </p>
                  <div className="space-y-1">
                    {order.items.slice(0, 3).map((item, idx) => (
                      <p key={idx} className="text-sm" style={{ color: '#8B8B8B' }}>
                        {item.qty}× {item.name}
                      </p>
                    ))}
                    {order.items.length > 3 && (
                      <p className="text-sm" style={{ color: 'rgba(139, 139, 139, 0.6)' }}>
                        +{order.items.length - 3} more items
                      </p>
                    )}
                  </div>
                </div>

                {/* Order Footer */}
                <div 
                  className="px-4 py-3 flex items-center justify-between"
                  style={{ borderTop: '1px dashed rgba(255, 255, 255, 0.06)' }}
                >
                  <p 
                    className="text-lg font-bold"
                    style={{ color: '#CCFF00', fontFamily: 'var(--font-mono)' }}
                  >
                    ₹{parseFloat(order.total).toFixed(0)}
                  </p>
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
