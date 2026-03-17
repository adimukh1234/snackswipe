import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { db } from '../db';
import { orders, dishes, foodPartners, cartItems } from '../db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { verifyClerkAuth } from '../lib/clerk-auth';

// Types
interface CreateOrderBody {
  items: Array<{
    dishId: string;
    quantity: number;
    notes?: string;
  }>;
  deliveryAddress: {
    street: string;
    city: string;
    state?: string;
    pincode: string;
    lat?: number;
    lng?: number;
  };
  paymentMethod?: 'cod' | 'upi' | 'card';
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
}

interface OrderItem {
  dishId: string;
  name: string;
  qty: number;
  price: number;
  notes?: string;
}

export async function orderRoutes(fastify: FastifyInstance) {
  // Create a new order
  fastify.post('/', async (request: FastifyRequest<{ Body: CreateOrderBody }>, reply: FastifyReply) => {
    const userId = await verifyClerkAuth(request, reply);
    if (!userId) return;

    const { items, deliveryAddress } = request.body;

    if (!items || items.length === 0) {
      return reply.status(400).send({ error: 'Order must have at least one item' });
    }

    if (!deliveryAddress || !deliveryAddress.street || !deliveryAddress.pincode) {
      return reply.status(400).send({ error: 'Delivery address required' });
    }

    // Fetch dish details and calculate totals
    const orderItems: OrderItem[] = [];
    let subtotal = 0;
    let partnerId: string | null = null;

    for (const item of items) {
      const dish = await db.query.dishes.findFirst({
        where: eq(dishes.id, item.dishId),
      });

      if (!dish) {
        return reply.status(400).send({ error: `Dish ${item.dishId} not found` });
      }

      // Ensure all dishes are from same partner (for MVP)
      if (!partnerId) {
        partnerId = dish.partnerId;
      } else if (partnerId !== dish.partnerId) {
        return reply.status(400).send({ 
          error: 'All items must be from the same restaurant for this order' 
        });
      }

      const price = parseFloat(dish.price);
      orderItems.push({
        dishId: item.dishId,
        name: dish.name,
        qty: item.quantity,
        price,
        notes: item.notes,
      });

      subtotal += price * item.quantity;
    }

    const deliveryFee = 40;
    const platformFee = 5;
    const total = subtotal + deliveryFee + platformFee;

    // Create order
    const [order] = await db.insert(orders).values({
      userId,
      partnerId: partnerId!,
      items: orderItems,
      subtotal: subtotal.toFixed(2),
      deliveryFee: deliveryFee.toFixed(2),
      total: total.toFixed(2),
      status: 'pending',
      deliveryAddress,
    }).returning();

    // Clear cart items for these dishes
    for (const item of items) {
      await db.delete(cartItems)
        .where(and(eq(cartItems.userId, userId), eq(cartItems.dishId, item.dishId)));
    }

    return reply.status(201).send({
      success: true,
      order: {
        id: order.id,
        total: order.total,
        status: order.status,
        items: orderItems,
      },
    });
  });

  // Get user's order history
  fastify.get('/history', async (request: FastifyRequest<{ Querystring: { limit?: number } }>, reply: FastifyReply) => {
    const userId = await verifyClerkAuth(request, reply);
    if (!userId) return;

    const { limit = 20 } = request.query;

    const userOrders = await db.select({
      id: orders.id,
      items: orders.items,
      subtotal: orders.subtotal,
      deliveryFee: orders.deliveryFee,
      total: orders.total,
      status: orders.status,
      createdAt: orders.createdAt,
      partnerName: foodPartners.name,
      partnerLogo: foodPartners.logoUrl,
    })
    .from(orders)
    .leftJoin(foodPartners, eq(orders.partnerId, foodPartners.id))
    .where(eq(orders.userId, userId))
    .orderBy(desc(orders.createdAt))
    .limit(limit);

    return reply.send({ orders: userOrders });
  });

  // Get single order details
  fastify.get('/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const userId = await verifyClerkAuth(request, reply);
    if (!userId) return;

    const { id } = request.params;

    const [order] = await db.select({
      id: orders.id,
      items: orders.items,
      subtotal: orders.subtotal,
      deliveryFee: orders.deliveryFee,
      total: orders.total,
      status: orders.status,
      deliveryAddress: orders.deliveryAddress,
      paymentId: orders.paymentId,
      createdAt: orders.createdAt,
      updatedAt: orders.updatedAt,
      partnerName: foodPartners.name,
      partnerLogo: foodPartners.logoUrl,
      partnerPhone: foodPartners.phone,
    })
    .from(orders)
    .leftJoin(foodPartners, eq(orders.partnerId, foodPartners.id))
    .where(and(eq(orders.id, id), eq(orders.userId, userId)))
    .limit(1);

    if (!order) {
      return reply.status(404).send({ error: 'Order not found' });
    }

    return reply.send(order);
  });

  // Cancel order (only if pending)
  fastify.post('/:id/cancel', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const userId = await verifyClerkAuth(request, reply);
    if (!userId) return;

    const { id } = request.params;

    const order = await db.query.orders.findFirst({
      where: and(eq(orders.id, id), eq(orders.userId, userId)),
    });

    if (!order) {
      return reply.status(404).send({ error: 'Order not found' });
    }

    if (order.status !== 'pending') {
      return reply.status(400).send({ error: 'Can only cancel pending orders' });
    }

    await db.update(orders)
      .set({ status: 'cancelled', updatedAt: new Date() })
      .where(eq(orders.id, id));

    return reply.send({ success: true, message: 'Order cancelled' });
  });

  // Reorder (create new order from existing)
  fastify.post('/:id/reorder', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const userId = await verifyClerkAuth(request, reply);
    if (!userId) return;

    const { id } = request.params;

    const existingOrder = await db.query.orders.findFirst({
      where: and(eq(orders.id, id), eq(orders.userId, userId)),
    });

    if (!existingOrder) {
      return reply.status(404).send({ error: 'Order not found' });
    }

    // Add items to cart for reordering
    const items = existingOrder.items as OrderItem[];
    for (const item of items) {
      // Check if dish still exists and is available
      const dish = await db.query.dishes.findFirst({
        where: eq(dishes.id, item.dishId),
      });

      if (dish && dish.isAvailable) {
        await db.insert(cartItems).values({
          userId,
          dishId: item.dishId,
          quantity: item.qty,
        }).onConflictDoNothing();
      }
    }

    return reply.send({ 
      success: true, 
      message: 'Items added to cart. Proceed to checkout.',
    });
  });
}
