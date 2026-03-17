import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { db } from '../db';
import { foodPartners, dishes, orders } from '../db/schema';
import { eq, desc, and, sql } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

// Types
interface PartnerRegisterBody {
  name: string;
  email: string;
  phone: string;
  password: string;
  address?: {
    street: string;
    city: string;
    state?: string;
    pincode: string;
    lat?: number;
    lng?: number;
  };
  cuisines?: string[];
}

interface PartnerLoginBody {
  email: string;
  password: string;
}

interface CreateDishBody {
  name: string;
  description?: string;
  price: number;
  imageUrls?: string[];
  videoUrl?: string;
  thumbnailUrl?: string;
  tags?: string[];
  category?: string;
  prepTimeMins?: number;
  isVeg?: boolean;
}

// Auth middleware for partners
async function verifyPartnerAuth(request: FastifyRequest, reply: FastifyReply): Promise<string | null> {
  try {
    await request.jwtVerify();
    const user = request.user as { partnerId?: string; userId?: string };
    if (!user.partnerId) {
      reply.status(403).send({ error: 'Partner access required' });
      return null;
    }
    return user.partnerId;
  } catch (err) {
    reply.status(401).send({ error: 'Unauthorized' });
    return null;
  }
}

export async function partnerRoutes(fastify: FastifyInstance) {
  // Partner registration
  fastify.post('/register', async (request: FastifyRequest<{ Body: PartnerRegisterBody }>, reply: FastifyReply) => {
    const { name, email, phone, password, address, cuisines } = request.body;

    if (!name || !email || !phone || !password) {
      return reply.status(400).send({ error: 'Name, email, phone, and password required' });
    }

    // Check if partner exists
    const existing = await db.query.foodPartners.findFirst({
      where: eq(foodPartners.email, email),
    });

    if (existing) {
      return reply.status(400).send({ error: 'Email already registered' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create unique slug from name (append random suffix to avoid collisions)
    const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const slug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`;

    // Create partner
    const [partner] = await db.insert(foodPartners).values({
      name,
      email,
      phone,
      passwordHash,
      slug,
      address,
      cuisines,
    }).returning();

    // Generate JWT
    const token = fastify.jwt.sign({ 
      partnerId: partner.id,
      email: partner.email,
    }, { expiresIn: '30d' });

    return reply.status(201).send({
      success: true,
      partner: {
        id: partner.id,
        name: partner.name,
        email: partner.email,
        slug: partner.slug,
      },
      token,
    });
  });

  // Partner login
  fastify.post('/login', async (request: FastifyRequest<{ Body: PartnerLoginBody }>, reply: FastifyReply) => {
    const { email, password } = request.body;

    if (!email || !password) {
      return reply.status(400).send({ error: 'Email and password required' });
    }

    const partner = await db.query.foodPartners.findFirst({
      where: eq(foodPartners.email, email),
    });

    if (!partner) {
      return reply.status(401).send({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, partner.passwordHash);
    if (!validPassword) {
      return reply.status(401).send({ error: 'Invalid credentials' });
    }

    // Generate JWT
    const token = fastify.jwt.sign({ 
      partnerId: partner.id,
      email: partner.email,
    }, { expiresIn: '30d' });

    reply.setCookie('partnerToken', token, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60,
    });

    return reply.send({
      success: true,
      partner: {
        id: partner.id,
        name: partner.name,
        email: partner.email,
        slug: partner.slug,
        rating: partner.rating,
      },
      token,
    });
  });

  // Get partner profile
  fastify.get('/me', async (request: FastifyRequest, reply: FastifyReply) => {
    const partnerId = await verifyPartnerAuth(request, reply);
    if (!partnerId) return;

    const partner = await db.query.foodPartners.findFirst({
      where: eq(foodPartners.id, partnerId),
    });

    if (!partner) {
      return reply.status(404).send({ error: 'Partner not found' });
    }

    return reply.send({
      id: partner.id,
      name: partner.name,
      email: partner.email,
      phone: partner.phone,
      slug: partner.slug,
      logoUrl: partner.logoUrl,
      coverUrl: partner.coverUrl,
      address: partner.address,
      cuisines: partner.cuisines,
      rating: partner.rating,
      isActive: partner.isActive,
    });
  });

  // Create dish
  fastify.post('/dishes', async (request: FastifyRequest<{ Body: CreateDishBody }>, reply: FastifyReply) => {
    const partnerId = await verifyPartnerAuth(request, reply);
    if (!partnerId) return;

    const { name, description, price, imageUrls, videoUrl, thumbnailUrl, tags, category, prepTimeMins, isVeg } = request.body;

    if (!name || !price) {
      return reply.status(400).send({ error: 'Name and price required' });
    }

    const [dish] = await db.insert(dishes).values({
      partnerId,
      name,
      description,
      price: price.toFixed(2),
      imageUrls,
      videoUrl,
      thumbnailUrl,
      tags,
      category,
      prepTimeMins,
      isVeg: isVeg || false,
    }).returning();

    return reply.status(201).send({
      success: true,
      dish: {
        id: dish.id,
        name: dish.name,
        price: dish.price,
        isAvailable: dish.isAvailable,
      },
    });
  });

  // Get partner's dishes
  fastify.get('/dishes', async (request: FastifyRequest<{ Querystring: { limit?: number } }>, reply: FastifyReply) => {
    const partnerId = await verifyPartnerAuth(request, reply);
    if (!partnerId) return;

    const { limit = 50 } = request.query;

    const partnerDishes = await db.select()
      .from(dishes)
      .where(eq(dishes.partnerId, partnerId))
      .orderBy(desc(dishes.createdAt))
      .limit(limit);

    return reply.send({ dishes: partnerDishes });
  });

  // Update dish
  fastify.patch('/dishes/:id', async (request: FastifyRequest<{ Params: { id: string }; Body: Partial<CreateDishBody> & { isAvailable?: boolean } }>, reply: FastifyReply) => {
    const partnerId = await verifyPartnerAuth(request, reply);
    if (!partnerId) return;

    const { id } = request.params;
    const updates = request.body;

    // Verify dish belongs to partner
    const dish = await db.query.dishes.findFirst({
      where: and(eq(dishes.id, id), eq(dishes.partnerId, partnerId)),
    });

    if (!dish) {
      return reply.status(404).send({ error: 'Dish not found' });
    }

    // Whitelist updatable fields — never allow partnerId, likeCount, swipeCount, orderCount
    const safeUpdates: Record<string, unknown> = {};
    if (updates.name !== undefined) safeUpdates.name = updates.name;
    if (updates.description !== undefined) safeUpdates.description = updates.description;
    if (updates.price !== undefined) safeUpdates.price = updates.price.toFixed(2);
    if (updates.imageUrls !== undefined) safeUpdates.imageUrls = updates.imageUrls;
    if (updates.videoUrl !== undefined) safeUpdates.videoUrl = updates.videoUrl;
    if (updates.thumbnailUrl !== undefined) safeUpdates.thumbnailUrl = updates.thumbnailUrl;
    if (updates.tags !== undefined) safeUpdates.tags = updates.tags;
    if (updates.category !== undefined) safeUpdates.category = updates.category;
    if (updates.prepTimeMins !== undefined) safeUpdates.prepTimeMins = updates.prepTimeMins;
    if (updates.isVeg !== undefined) safeUpdates.isVeg = updates.isVeg;
    if ((updates as { isAvailable?: boolean }).isAvailable !== undefined) safeUpdates.isAvailable = (updates as { isAvailable?: boolean }).isAvailable;

    const [updatedDish] = await db.update(dishes)
      .set({ ...safeUpdates, updatedAt: new Date() })
      .where(eq(dishes.id, id))
      .returning();

    return reply.send({ success: true, dish: updatedDish });
  });

  // Delete dish
  fastify.delete('/dishes/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const partnerId = await verifyPartnerAuth(request, reply);
    if (!partnerId) return;

    const { id } = request.params;

    // Verify dish belongs to partner
    const dish = await db.query.dishes.findFirst({
      where: and(eq(dishes.id, id), eq(dishes.partnerId, partnerId)),
    });

    if (!dish) {
      return reply.status(404).send({ error: 'Dish not found' });
    }

    await db.delete(dishes).where(eq(dishes.id, id));

    return reply.send({ success: true, message: 'Dish deleted' });
  });

  // Get partner's orders
  fastify.get('/orders', async (request: FastifyRequest<{ Querystring: { status?: string; limit?: number } }>, reply: FastifyReply) => {
    const partnerId = await verifyPartnerAuth(request, reply);
    if (!partnerId) return;

    const { status, limit = 50 } = request.query;

    const conditions = [eq(orders.partnerId, partnerId)];
    if (status) {
      conditions.push(eq(orders.status, status));
    }

    const partnerOrders = await db.select()
      .from(orders)
      .where(and(...conditions))
      .orderBy(desc(orders.createdAt))
      .limit(limit);

    return reply.send({ orders: partnerOrders });
  });

  // Update order status
  fastify.patch('/orders/:id/status', async (request: FastifyRequest<{ Params: { id: string }; Body: { status: string } }>, reply: FastifyReply) => {
    const partnerId = await verifyPartnerAuth(request, reply);
    if (!partnerId) return;

    const { id } = request.params;
    const { status } = request.body;

    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'picked_up', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return reply.status(400).send({ error: 'Invalid status' });
    }

    // Verify order belongs to partner
    const order = await db.query.orders.findFirst({
      where: and(eq(orders.id, id), eq(orders.partnerId, partnerId)),
    });

    if (!order) {
      return reply.status(404).send({ error: 'Order not found' });
    }

    await db.update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, id));

    return reply.send({ success: true, status });
  });

  // Get partner analytics (basic)
  fastify.get('/analytics', async (request: FastifyRequest, reply: FastifyReply) => {
    const partnerId = await verifyPartnerAuth(request, reply);
    if (!partnerId) return;

    // Get dish stats
    const dishStats = await db.select({
      totalDishes: sql<number>`count(*)`,
      totalLikes: sql<number>`sum(${dishes.likeCount})`,
      totalOrders: sql<number>`sum(${dishes.orderCount})`,
    })
    .from(dishes)
    .where(eq(dishes.partnerId, partnerId));

    // Get order stats
    const orderStats = await db.select({
      totalOrders: sql<number>`count(*)`,
      totalRevenue: sql<number>`sum(${orders.total})`,
    })
    .from(orders)
    .where(and(eq(orders.partnerId, partnerId), eq(orders.status, 'delivered')));

    return reply.send({
      dishes: dishStats[0],
      orders: orderStats[0],
    });
  });
}
