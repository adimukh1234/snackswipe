'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, MapPin, CreditCard, Wallet,
  CheckCircle2, Loader2, ShoppingBag,
  ArrowRight, Tag
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCartStore } from '@/stores/cartStore';
import { useAuth, useUser, SignInButton } from '@clerk/nextjs';
import { ordersApi, paymentsApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DELIVERY_FEE, PLATFORM_FEE } from '@/lib/constants';

// Razorpay types
declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open(): void };
  }
}

type Step = 'address' | 'payment' | 'processing' | 'success';

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function CheckoutPage() {
  const [step, setStep] = useState<Step>('address');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'cod'>('upi');
  const [address, setAddress] = useState({ street: '', city: '', pincode: '' });
  const [error, setError] = useState('');
  const [orderId, setOrderId] = useState<string | null>(null);

  const { items, getTotal, clearCart } = useCartStore();
  const { isSignedIn } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();

  const subtotal = getTotal();
  const deliveryFee = items.length > 0 ? DELIVERY_FEE : 0;
  const platformFee = PLATFORM_FEE;
  const total = subtotal + deliveryFee + platformFee;

  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.partnerId]) acc[item.partnerId] = { partnerName: item.partnerName, items: [] };
    acc[item.partnerId].items.push(item);
    return acc;
  }, {} as Record<string, { partnerName: string; items: typeof items }>);

  const handleAddressSubmit = () => {
    if (!address.street.trim() || !address.city.trim() || !address.pincode.trim()) {
      setError('Please fill all address fields');
      return;
    }
    if (address.pincode.length !== 6) {
      setError('Please enter a valid 6-digit pincode');
      return;
    }
    setError('');
    setStep('payment');
  };

  const handlePlaceOrder = async () => {
    setStep('processing');
    const token = await getToken();
    const orderItems = items.map(item => ({ dishId: item.dishId, quantity: item.quantity }));
    const deliveryAddress = { street: address.street, city: address.city, pincode: address.pincode };

    try {
      if (paymentMethod === 'cod') {
        const { data, error: apiError } = await ordersApi.create(orderItems, deliveryAddress, token ?? undefined);
        if (apiError || !data) { setError(apiError || 'Failed to place order'); setStep('payment'); return; }
        setOrderId(data.order.id);
        clearCart();
        setStep('success');
        return;
      }

      // UPI / Card: Razorpay flow
      const loaded = await loadRazorpayScript();
      if (!loaded) { setError('Payment service unavailable. Try again.'); setStep('payment'); return; }

      const { data: payData, error: payError } = await paymentsApi.initiate(orderItems, deliveryAddress, token!);
      if (payError || !payData) { setError(payError || 'Failed to initiate payment'); setStep('payment'); return; }

      await new Promise<void>((resolve, reject) => {
        const rzp = new window.Razorpay({
          key: payData.key,
          amount: payData.amount,
          currency: payData.currency,
          order_id: payData.razorpayOrderId,
          name: 'CRAVE',
          description: 'Food Order',
          handler: async (response: {
            razorpay_payment_id: string;
            razorpay_order_id: string;
            razorpay_signature: string;
          }) => {
            const { data: verifyData, error: verifyError } = await paymentsApi.verify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              items: orderItems,
              deliveryAddress,
            }, token!);
            if (verifyError || !verifyData) { reject(new Error(verifyError || 'Payment verification failed')); return; }
            setOrderId(verifyData.order.id);
            clearCart();
            setStep('success');
            resolve();
          },
          modal: { ondismiss: () => reject(new Error('dismissed')) },
          prefill: {},
          theme: { color: '#CCFF00' },
        });
        rzp.open();
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      if (message !== 'dismissed') setError(message);
      setStep('payment');
    }
  };

  if (items.length === 0 && step !== 'success') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-8" style={{ background: '#000000' }}>
        <div className="max-w-[430px] mx-auto">
          <ShoppingBag className="w-16 h-16 mb-6" style={{ color: 'rgba(255,255,255,0.15)' }} />
          <h2 className="text-xl font-bold mb-2" style={{ color: '#F5F0EB', fontFamily: 'var(--font-display)' }}>Cart is empty</h2>
          <p className="text-center mb-6" style={{ color: '#8B8B8B' }}>Add some dishes to checkout</p>
          <Link href="/discover"><Button>Start Discovering</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#000000' }}>
      {/* Header */}
      <header
        className="sticky top-0 z-40 safe-top"
        style={{
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        }}
      >
        <div className="flex items-center justify-between px-5 py-4">
          {step !== 'success' && step !== 'processing' && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => step === 'payment' ? setStep('address') : router.back()}
              className="w-10 h-10 flex items-center justify-center rounded-full"
              style={{ background: 'rgba(255,255,255,0.05)' }}
            >
              <ChevronLeft className="w-5 h-5" style={{ color: '#8B8B8B' }} />
            </motion.button>
          )}
          {(step === 'success' || step === 'processing') && <div className="w-10" />}
          <h1
            className="text-lg font-bold uppercase tracking-wider"
            style={{ color: '#CCFF00', fontFamily: 'var(--font-display)', textShadow: '0 0 20px rgba(204,255,0,0.3)' }}
          >
            {step === 'address' && 'Delivery'}
            {step === 'payment' && 'Payment'}
            {step === 'processing' && 'Processing'}
            {step === 'success' && 'Confirmed'}
          </h1>
          <div className="w-10" />
        </div>
      </header>

      <AnimatePresence mode="wait">
        {/* ── Address Step ── */}
        {step === 'address' && (
          <motion.div key="address" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="px-5 py-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium" style={{ color: '#8B8B8B' }}>Street Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 z-10" style={{ color: '#8B8B8B' }} />
                  <Input
                    type="text"
                    value={address.street}
                    onChange={(e) => setAddress({ ...address, street: e.target.value })}
                    placeholder="Enter your street address"
                    className="h-14 pl-12 rounded-2xl border-white/10 focus-visible:ring-[#CCFF00] focus-visible:border-[#CCFF00]"
                    style={{ background: '#0A0A0F', color: '#F5F0EB' }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium" style={{ color: '#8B8B8B' }}>City</Label>
                  <Input
                    type="text"
                    value={address.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    placeholder="City"
                    className="h-14 rounded-2xl border-white/10 focus-visible:ring-[#CCFF00] focus-visible:border-[#CCFF00]"
                    style={{ background: '#0A0A0F', color: '#F5F0EB' }}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium" style={{ color: '#8B8B8B' }}>Pincode</Label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    value={address.pincode}
                    onChange={(e) => setAddress({ ...address, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                    placeholder="110001"
                    className="h-14 rounded-2xl border-white/10 focus-visible:ring-[#CCFF00] focus-visible:border-[#CCFF00]"
                    style={{ background: '#0A0A0F', color: '#F5F0EB' }}
                  />
                </div>
              </div>
              {error && <p className="text-sm" style={{ color: '#FF2E63' }}>{error}</p>}
            </div>

            {/* Order Summary */}
            <div
              className="mt-6 rounded-2xl p-5"
              style={{ background: '#0A0A0F', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <h3 className="font-semibold mb-4 uppercase tracking-wider text-sm" style={{ color: '#8B8B8B', fontFamily: 'var(--font-display)' }}>
                Order Summary
              </h3>
              {Object.entries(groupedItems).map(([partnerId, group]) => (
                <div key={partnerId} className="mb-4 last:mb-0">
                  <p className="text-sm font-semibold mb-2" style={{ color: '#CCFF00', fontFamily: 'var(--font-display)' }}>{group.partnerName}</p>
                  {group.items.map((item) => (
                    <div key={item.dishId} className="flex justify-between text-sm py-1">
                      <span style={{ color: '#8B8B8B' }}>{item.name} × {item.quantity}</span>
                      <span className="font-medium" style={{ color: '#F5F0EB' }}>₹{(item.price * item.quantity).toFixed(0)}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <div className="mt-6">
              <Button onClick={handleAddressSubmit} size="lg" className="w-full">
                Continue to Payment <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* ── Payment Step ── */}
        {step === 'payment' && (
          <motion.div key="payment" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="px-5 py-6">
            <h3 className="font-semibold mb-4 uppercase tracking-wider text-sm" style={{ color: '#8B8B8B', fontFamily: 'var(--font-display)' }}>
              Payment Method
            </h3>
            <div className="space-y-3 mb-8">
              {([
                { id: 'upi', label: 'UPI', sub: 'Google Pay, PhonePe, Paytm', Icon: Wallet },
                { id: 'card', label: 'Credit / Debit Card', sub: 'Visa, Mastercard, RuPay', Icon: CreditCard },
                { id: 'cod', label: 'Cash on Delivery', sub: 'Pay when order arrives', Icon: Tag },
              ] as const).map(({ id, label, sub, Icon }) => (
                <button
                  key={id}
                  onClick={() => setPaymentMethod(id)}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl transition-all"
                  style={{
                    background: paymentMethod === id ? 'rgba(204,255,0,0.08)' : '#0A0A0F',
                    border: `2px solid ${paymentMethod === id ? '#CCFF00' : 'rgba(255,255,255,0.08)'}`,
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: paymentMethod === id ? 'rgba(204,255,0,0.15)' : 'rgba(255,255,255,0.05)' }}
                  >
                    <Icon className="w-5 h-5" style={{ color: paymentMethod === id ? '#CCFF00' : '#8B8B8B' }} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium" style={{ color: paymentMethod === id ? '#CCFF00' : '#F5F0EB' }}>{label}</p>
                    <p className="text-xs" style={{ color: '#8B8B8B' }}>{sub}</p>
                  </div>
                  {paymentMethod === id && <CheckCircle2 className="w-6 h-6" style={{ color: '#CCFF00' }} />}
                </button>
              ))}
            </div>

            {/* Bill */}
            <div
              className="rounded-2xl p-5 space-y-3"
              style={{ background: '#0A0A0F', border: '1px solid rgba(255,255,255,0.06)', fontFamily: 'var(--font-mono)' }}
            >
              <div className="flex justify-between text-sm">
                <span style={{ color: '#8B8B8B' }}>Subtotal</span>
                <span className="font-medium" style={{ color: '#F5F0EB' }}>₹{subtotal.toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: '#8B8B8B' }}>Delivery fee</span>
                <span className="font-medium" style={{ color: '#F5F0EB' }}>₹{deliveryFee}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: '#8B8B8B' }}>Platform fee</span>
                <span className="font-medium" style={{ color: '#F5F0EB' }}>₹{platformFee}</span>
              </div>
              <div className="pt-3 flex justify-between items-center" style={{ borderTop: '2px dashed rgba(255,255,255,0.08)' }}>
                <span className="font-bold uppercase tracking-wider text-sm" style={{ color: '#F5F0EB', fontFamily: 'var(--font-display)' }}>Total</span>
                <span className="font-bold text-xl" style={{ color: '#CCFF00', textShadow: '0 0 20px rgba(204,255,0,0.2)' }}>₹{total.toFixed(0)}</span>
              </div>
            </div>

            {error && <p className="text-sm mt-4" style={{ color: '#FF2E63' }}>{error}</p>}

            <div className="mt-6 pb-8">
              {isSignedIn ? (
                <Button onClick={handlePlaceOrder} size="lg" className="w-full">
                  {paymentMethod === 'cod' ? `Place Order · ₹${total.toFixed(0)}` : `Pay ₹${total.toFixed(0)}`}
                </Button>
              ) : (
                <SignInButton mode="modal">
                  <Button size="lg" className="w-full">Login to Order</Button>
                </SignInButton>
              )}
            </div>
          </motion.div>
        )}

        {/* ── Processing Step ── */}
        {step === 'processing' && (
          <motion.div key="processing" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col items-center justify-center py-24">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
              <Loader2 className="w-16 h-16" style={{ color: '#CCFF00' }} />
            </motion.div>
            <p className="mt-6 text-lg font-medium" style={{ color: '#F5F0EB', fontFamily: 'var(--font-display)' }}>Processing your order...</p>
            <p className="mt-2" style={{ color: '#8B8B8B' }}>Please don&apos;t close this page</p>
          </motion.div>
        )}

        {/* ── Success Step ── */}
        {step === 'success' && (
          <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col items-center justify-center py-16 px-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
              className="w-28 h-28 rounded-full flex items-center justify-center mb-8"
              style={{ background: 'rgba(204,255,0,0.15)', border: '2px solid #CCFF00', boxShadow: '0 0 40px rgba(204,255,0,0.3)' }}
            >
              <CheckCircle2 className="w-14 h-14" style={{ color: '#CCFF00' }} />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-bold mb-2 text-center uppercase tracking-tighter"
              style={{ color: '#F5F0EB', fontFamily: 'var(--font-display)' }}
            >
              Order Placed!
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center mb-8"
              style={{ color: '#8B8B8B', fontFamily: 'var(--font-mono)' }}
            >
              #{orderId?.slice(0, 8)} is being prepared
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="w-full space-y-3">
              <Link href="/orders"><Button size="lg" className="w-full">Track Order</Button></Link>
              <Link href="/"><Button variant="secondary" size="lg" className="w-full">Back to Home</Button></Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
