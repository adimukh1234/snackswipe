'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, MapPin, CreditCard, Wallet,
  CheckCircle2, Loader2, ShoppingBag,
  ArrowRight, Tag
} from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { useAuth, useUser } from '@clerk/nextjs';
import { ordersApi, paymentsApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
  const deliveryFee = items.length > 0 ? 40 : 0;
  const platformFee = 5;
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
    if (!isSignedIn) {
      router.push('/login');
      return;
    }

    setStep('processing');
    const token = await getToken();
    const orderItems = items.map(item => ({ dishId: item.dishId, quantity: item.quantity }));
    const deliveryAddress = { street: address.street, city: address.city, pincode: address.pincode };

    try {
      if (paymentMethod === 'cod') {
        // COD: create order directly
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

      // Open Razorpay checkout
      await new Promise<void>((resolve, reject) => {
        const rzp = new window.Razorpay({
          key: payData.key,
          amount: payData.amount,
          currency: payData.currency,
          order_id: payData.razorpayOrderId,
          name: 'Snackswipe',
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-white px-8">
        <ShoppingBag className="w-16 h-16 text-gray-300 mb-6" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Cart is empty</h2>
        <p className="text-gray-500 text-center mb-6">Add some dishes to checkout</p>
        <Link href="/discover"><Button>Start Discovering</Button></Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <header className="sticky top-0 z-40 glass safe-top">
        <div className="flex items-center justify-between px-5 py-4">
          {step !== 'success' && step !== 'processing' && (
            <button onClick={() => step === 'payment' ? setStep('address') : router.back()} className="btn-icon">
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
          )}
          {(step === 'success' || step === 'processing') && <div className="w-10" />}
          <h1 className="text-lg font-bold text-gray-900">
            {step === 'address' && 'Delivery Address'}
            {step === 'payment' && 'Payment'}
            {step === 'processing' && 'Processing'}
            {step === 'success' && 'Order Confirmed'}
          </h1>
          <div className="w-10" />
        </div>
      </header>

      <AnimatePresence mode="wait">
        {step === 'address' && (
          <motion.div key="address" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="px-5 py-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Street Address</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="text" value={address.street} onChange={(e) => setAddress({ ...address, street: e.target.value })} placeholder="Enter your street address" className="w-full h-14 pl-12 pr-4 bg-white border-2 border-gray-200 rounded-2xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">City</label>
                  <input type="text" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} placeholder="City" className="w-full h-14 px-4 bg-white border-2 border-gray-200 rounded-2xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Pincode</label>
                  <input type="text" value={address.pincode} onChange={(e) => setAddress({ ...address, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })} placeholder="110001" className="w-full h-14 px-4 bg-white border-2 border-gray-200 rounded-2xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all" />
                </div>
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>

            <div className="mt-8 bg-white rounded-2xl shadow-md border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>
              {Object.entries(groupedItems).map(([partnerId, group]) => (
                <div key={partnerId} className="mb-4 last:mb-0">
                  <p className="text-sm font-medium text-gray-600 mb-2">{group.partnerName}</p>
                  {group.items.map((item) => (
                    <div key={item.dishId} className="flex justify-between text-sm py-1">
                      <span className="text-gray-600">{item.name} × {item.quantity}</span>
                      <span className="font-medium">₹{(item.price * item.quantity).toFixed(0)}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <div className="mt-8">
              <Button onClick={handleAddressSubmit} size="lg" className="w-full">
                Continue to Payment <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </motion.div>
        )}

        {step === 'payment' && (
          <motion.div key="payment" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="px-5 py-6">
            <h3 className="font-semibold text-gray-900 mb-4">Payment Method</h3>
            <div className="space-y-3 mb-8">
              {([
                { id: 'upi', label: 'UPI', sub: 'Google Pay, PhonePe, Paytm', Icon: Wallet },
                { id: 'card', label: 'Credit/Debit Card', sub: 'Visa, Mastercard, RuPay', Icon: CreditCard },
                { id: 'cod', label: 'Cash on Delivery', sub: 'Pay when order arrives', Icon: Tag },
              ] as const).map(({ id, label, sub, Icon }) => (
                <button key={id} onClick={() => setPaymentMethod(id)} className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${paymentMethod === id ? 'border-purple-500 bg-purple-50' : 'border-gray-200 bg-white'}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${paymentMethod === id ? 'bg-purple-500' : 'bg-gray-100'}`}>
                    <Icon className={`w-5 h-5 ${paymentMethod === id ? 'text-white' : 'text-gray-500'}`} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-gray-900">{label}</p>
                    <p className="text-xs text-gray-500">{sub}</p>
                  </div>
                  {paymentMethod === id && <CheckCircle2 className="w-6 h-6 text-purple-500" />}
                </button>
              ))}
            </div>

            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 space-y-3">
              <div className="flex justify-between text-sm"><span className="text-gray-500">Subtotal</span><span className="font-medium">₹{subtotal.toFixed(0)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Delivery Fee</span><span className="font-medium">₹{deliveryFee}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Platform Fee</span><span className="font-medium">₹{platformFee}</span></div>
              <div className="border-t border-gray-100 pt-3 flex justify-between">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="font-bold text-xl text-purple-600">₹{total.toFixed(0)}</span>
              </div>
            </div>

            {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

            <div className="mt-8 pb-8">
              <Button onClick={handlePlaceOrder} size="lg" className="w-full">
                {isSignedIn
                  ? paymentMethod === 'cod'
                    ? `Place Order · ₹${total.toFixed(0)}`
                    : `Pay ₹${total.toFixed(0)}`
                  : 'Login to Order'}
              </Button>
            </div>
          </motion.div>
        )}

        {step === 'processing' && (
          <motion.div key="processing" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col items-center justify-center py-24">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
              <Loader2 className="w-16 h-16 text-purple-500" />
            </motion.div>
            <p className="mt-6 text-lg font-medium text-gray-900">Processing your order...</p>
            <p className="mt-2 text-gray-500">Please don&apos;t close this page</p>
          </motion.div>
        )}

        {step === 'success' && (
          <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col items-center justify-center py-16 px-8">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }} className="w-28 h-28 rounded-full bg-gradient-to-br from-green-400 to-green-500 flex items-center justify-center shadow-lg shadow-green-500/30 mb-8">
              <CheckCircle2 className="w-14 h-14 text-white" />
            </motion.div>
            <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-2xl font-bold text-gray-900 mb-2 text-center">Order Placed!</motion.h2>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-gray-500 text-center mb-8">Your order #{orderId?.slice(0, 8)} is being prepared</motion.p>
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
