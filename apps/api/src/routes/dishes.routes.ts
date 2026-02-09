import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { db } from '../db';
import { dishes, foodPartners, swipes } from '../db/schema';
import { eq, desc, and, notInArray, sql } from 'drizzle-orm';

// Types
interface DishQuery {
  limit?: number;
  offset?: number;
  category?: string;
  isVeg?: boolean;
  partnerId?: string;
}

interface SwipeBody {
  dishId: string;
  action: 'like' | 'skip' | 'superlike';
  sessionId?: string;
}

// Auth middleware helper
async function verifyAuth(request: FastifyRequest, reply: FastifyReply): Promise<string | null> {
  try {
    await request.jwtVerify();
    return (request.user as { userId: string }).userId;
  } catch (err) {
    reply.status(401).send({ error: 'Unauthorized' });
    return null;
  }
}

export async function dishRoutes(fastify: FastifyInstance) {
  // Get feed - personalized dish recommendations
  fastify.get('/feed', async (request: FastifyRequest<{ Querystring: DishQuery }>, reply: FastifyReply) => {
    const userId = await verifyAuth(request, reply);
    if (!userId) return;

    const { limit = 20, category, isVeg } = request.query;

    // Get dishes the user has already swiped on
    const swipedDishIds = await db.query.swipes.findMany({
      where: eq(swipes.userId, userId),
      columns: { dishId: true },
    });
    const swipedIds = swipedDishIds.map(s => s.dishId);

    // Build query conditions
    const conditions = [eq(dishes.isAvailable, true)];
    if (category) conditions.push(eq(dishes.category, category));
    if (isVeg !== undefined) conditions.push(eq(dishes.isVeg, isVeg));
    if (swipedIds.length > 0) {
      conditions.push(notInArray(dishes.id, swipedIds));
    }

    // Get dishes with partner info
    const feed = await db.select({
      id: dishes.id,
      name: dishes.name,
      description: dishes.description,
      price: dishes.price,
      videoUrl: dishes.videoUrl,
      imageUrls: dishes.imageUrls,
      thumbnailUrl: dishes.thumbnailUrl,
      tags: dishes.tags,
      category: dishes.category,
      prepTimeMins: dishes.prepTimeMins,
      isVeg: dishes.isVeg,
      likeCount: dishes.likeCount,
      swipeCount: dishes.swipeCount,
      partnerId: dishes.partnerId,
      partnerName: foodPartners.name,
      partnerRating: foodPartners.rating,
      partnerLogo: foodPartners.logoUrl,
    })
    .from(dishes)
    .leftJoin(foodPartners, eq(dishes.partnerId, foodPartners.id))
    .where(and(...conditions))
    .orderBy(desc(dishes.likeCount)) // Simple popularity-based ordering
    .limit(limit);

    return reply.send({
      dishes: feed,
      hasMore: feed.length === limit,
    });
  });

  // Record swipe action
  fastify.post('/swipe', async (request: FastifyRequest<{ Body: SwipeBody }>, reply: FastifyReply) => {
    const userId = await verifyAuth(request, reply);
    if (!userId) return;

    const { dishId, action, sessionId } = request.body;

    if (!dishId || !action) {
      return reply.status(400).send({ error: 'dishId and action required' });
    }

    if (!['like', 'skip', 'superlike'].includes(action)) {
      return reply.status(400).send({ error: 'Invalid action. Use: like, skip, or superlike' });
    }

    // Record the swipe
    await db.insert(swipes).values({
      userId,
      dishId,
      action,
      sessionId,
    });

    // Update dish counters
    if (action === 'like' || action === 'superlike') {
      await db.update(dishes)
        .set({ 
          likeCount: sql`${dishes.likeCount} + 1`,
          swipeCount: sql`${dishes.swipeCount} + 1`,
        })
        .where(eq(dishes.id, dishId));
    } else {
      await db.update(dishes)
        .set({ swipeCount: sql`${dishes.swipeCount} + 1` })
        .where(eq(dishes.id, dishId));
    }

    return reply.send({ success: true });
  });

  // Get single dish by ID
  fastify.get('/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const { id } = request.params;

    const dish = await db.select({
      id: dishes.id,
      name: dishes.name,
      description: dishes.description,
      price: dishes.price,
      videoUrl: dishes.videoUrl,
      imageUrls: dishes.imageUrls,
      thumbnailUrl: dishes.thumbnailUrl,
      tags: dishes.tags,
      category: dishes.category,
      prepTimeMins: dishes.prepTimeMins,
      isVeg: dishes.isVeg,
      isAvailable: dishes.isAvailable,
      likeCount: dishes.likeCount,
      orderCount: dishes.orderCount,
      partnerId: dishes.partnerId,
      partnerName: foodPartners.name,
      partnerRating: foodPartners.rating,
      partnerLogo: foodPartners.logoUrl,
      partnerAddress: foodPartners.address,
    })
    .from(dishes)
    .leftJoin(foodPartners, eq(dishes.partnerId, foodPartners.id))
    .where(eq(dishes.id, id))
    .limit(1);

    if (!dish.length) {
      return reply.status(404).send({ error: 'Dish not found' });
    }

    return reply.send(dish[0]);
  });

  // Get dishes by category
  fastify.get('/category/:category', async (request: FastifyRequest<{ Params: { category: string }; Querystring: { limit?: number } }>, reply: FastifyReply) => {
    const { category } = request.params;
    const { limit = 20 } = request.query;

    const categoryDishes = await db.select({
      id: dishes.id,
      name: dishes.name,
      price: dishes.price,
      thumbnailUrl: dishes.thumbnailUrl,
      isVeg: dishes.isVeg,
      partnerName: foodPartners.name,
    })
    .from(dishes)
    .leftJoin(foodPartners, eq(dishes.partnerId, foodPartners.id))
    .where(and(eq(dishes.category, category), eq(dishes.isAvailable, true)))
    .orderBy(desc(dishes.likeCount))
    .limit(limit);

    return reply.send({ dishes: categoryDishes });
  });

  // Get popular dishes
  fastify.get('/popular', async (request: FastifyRequest<{ Querystring: { limit?: number } }>, reply: FastifyReply) => {
    const { limit = 10 } = request.query;

    const popular = await db.select({
      id: dishes.id,
      name: dishes.name,
      price: dishes.price,
      thumbnailUrl: dishes.thumbnailUrl,
      isVeg: dishes.isVeg,
      likeCount: dishes.likeCount,
      partnerName: foodPartners.name,
      partnerRating: foodPartners.rating,
    })
    .from(dishes)
    .leftJoin(foodPartners, eq(dishes.partnerId, foodPartners.id))
    .where(eq(dishes.isAvailable, true))
    .orderBy(desc(dishes.likeCount))
    .limit(limit);

    return reply.send({ dishes: popular });
  });
}
