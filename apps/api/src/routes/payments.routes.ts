import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { z } from 'zod';
import { db } from '../db';
import { orders, dishes } from '../db/schema';
import { eq } from 'drizzle-orm';
import { verifyClerkAuth } from '../lib/clerk-auth';

interface OrderItem {
  dishId: string;
  name: string;
  qty: number;
  price: number;
  notes?: string;
}

const DeliveryAddressSchema = z.object({
  street: z.string().min(1),
  city: z.string().min(1),
  state: z.string().optional(),
  pincode: z.string().regex(/^\d{6}$/, 'Pincode must be 6 digits'),
});

const OrderItemInputSchema = z.object({
  dishId: z.string().uuid(),
  quantity: z.number().int().min(1).max(20),
  notes: z.string().max(200).optional(),
});

const InitiateBodySchema = z.object({
  items: z.array(OrderItemInputSchema).min(1),
  deliveryAddress: DeliveryAddressSchema,
});

const VerifyBodySchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
  items: z.array(OrderItemInputSchema).min(1),
  deliveryAddress: DeliveryAddressSchema,
});

function getRazorpay() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) throw new Error('Razorpay keys not configured');
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

export async function paymentRoutes(fastify: FastifyInstance) {
  // Step 1: Create Razorpay order before showing checkout (10 req/min)
  fastify.post(
    '/initiate',
    { config: { rateLimit: { max: 10, timeWindow: '1 minute' } } },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const userId = await verifyClerkAuth(request, reply);
      if (!userId) return;

      const parsed = InitiateBodySchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({ error: parsed.error.issues[0].message });
      }
      const { items, deliveryAddress } = parsed.data;

      // Calculate total
      let subtotal = 0;
      let partnerId: string | null = null;
      const orderItems: OrderItem[] = [];

      for (const item of items) {
        const dish = await db.query.dishes.findFirst({ where: eq(dishes.id, item.dishId) });
        if (!dish) return reply.status(400).send({ error: `Dish ${item.dishId} not found` });
        if (!partnerId) {
          partnerId = dish.partnerId;
        } else if (partnerId !== dish.partnerId) {
          return reply.status(400).send({ error: 'All items must be from the same restaurant' });
        }
        const price = parseFloat(dish.price);
        subtotal += price * item.quantity;
        orderItems.push({ dishId: item.dishId, name: dish.name, qty: item.quantity, price, notes: item.notes });
      }

      const deliveryFee = 40;
      const total = subtotal + deliveryFee;
      const amountInPaise = Math.round(total * 100);

      try {
        const razorpay = getRazorpay();
        const razorpayOrder = await razorpay.orders.create({
          amount: amountInPaise,
          currency: 'INR',
          receipt: `ss_${Date.now()}`,
        });

        return reply.send({
          razorpayOrderId: razorpayOrder.id,
          amount: amountInPaise,
          currency: 'INR',
          key: process.env.RAZORPAY_KEY_ID,
          subtotal,
          deliveryFee,
          total,
        });
      } catch (err) {
        fastify.log.error(err);
        return reply.status(500).send({ error: 'Failed to create payment order' });
      }
    },
  );

  // Step 2: Verify payment signature and create app order (10 req/min)
  fastify.post(
    '/verify',
    { config: { rateLimit: { max: 10, timeWindow: '1 minute' } } },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const userId = await verifyClerkAuth(request, reply);
      if (!userId) return;

      const parsed = VerifyBodySchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({ error: parsed.error.issues[0].message });
      }
      const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        items,
        deliveryAddress,
      } = parsed.data;

      // Verify HMAC signature
      const keySecret = process.env.RAZORPAY_KEY_SECRET;
      if (!keySecret) return reply.status(500).send({ error: 'Payment not configured' });

      const expectedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      if (expectedSignature !== razorpay_signature) {
        return reply.status(400).send({ error: 'Payment verification failed' });
      }

      // Build order items and calculate totals
      let subtotal = 0;
      let partnerId: string | null = null;
      const orderItems: OrderItem[] = [];

      for (const item of items) {
        const dish = await db.query.dishes.findFirst({ where: eq(dishes.id, item.dishId) });
        if (!dish) return reply.status(400).send({ error: `Dish ${item.dishId} not found` });
        if (!partnerId) {
          partnerId = dish.partnerId;
        } else if (partnerId !== dish.partnerId) {
          return reply.status(400).send({ error: 'All items must be from the same restaurant' });
        }
        const price = parseFloat(dish.price);
        subtotal += price * item.quantity;
        orderItems.push({ dishId: item.dishId, name: dish.name, qty: item.quantity, price });
      }

      const deliveryFee = 40;
      const total = subtotal + deliveryFee;

      const [order] = await db.insert(orders).values({
        userId,
        partnerId: partnerId!,
        items: orderItems,
        subtotal: subtotal.toFixed(2),
        deliveryFee: deliveryFee.toFixed(2),
        total: total.toFixed(2),
        status: 'confirmed',
        deliveryAddress,
        paymentId: razorpay_payment_id,
        razorpayOrderId: razorpay_order_id,
      }).returning();

      return reply.status(201).send({
        success: true,
        order: { id: order.id, total: order.total, status: order.status },
      });
    },
  );
}
