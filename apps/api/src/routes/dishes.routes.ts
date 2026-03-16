import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { SQL } from 'drizzle-orm';
import { db } from '../db';
import { dishes, foodPartners, swipes } from '../db/schema';
import { eq, desc, and, notInArray, inArray, sql, ilike, or } from 'drizzle-orm';
import { verifyClerkAuth, optionalClerkAuth } from '../lib/clerk-auth';

type Condition = SQL<unknown> | undefined;

// Zod schemas
const FeedQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  category: z.string().optional(),
  isVeg: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
});

const SwipeBodySchema = z.object({
  dishId: z.string().uuid('dishId must be a valid UUID'),
  action: z.enum(['like', 'skip', 'superlike']),
  sessionId: z.string().optional(),
});

const SearchQuerySchema = z.object({
  q: z.string().min(1).max(100),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

// Select fields reused across feed + search
const DISH_SELECT = {
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
};

async function getCollaborativeFeed(
  userId: string,
  limit: number,
  extraConditions: Condition[],
) {
  // Get user's swiped dish IDs and liked dish IDs
  const userSwipes = await db.query.swipes.findMany({
    where: eq(swipes.userId, userId),
    columns: { dishId: true, action: true },
  });

  const swipedIds = userSwipes.map(s => s.dishId);
  const likedIds = userSwipes
    .filter(s => s.action === 'like' || s.action === 'superlike')
    .map(s => s.dishId);

  // Cold start: < 5 swipes → popularity fallback
  if (userSwipes.length < 5 || likedIds.length === 0) {
    return getPopularityFeed(swipedIds, limit, extraConditions);
  }

  // Find similar users (those who liked ≥2 dishes in common)
  const similarUsersResult = await db
    .select({
      userId: swipes.userId,
      overlap: sql<number>`COUNT(*)::int`,
    })
    .from(swipes)
    .where(
      and(
        inArray(swipes.dishId, likedIds),
        sql`${swipes.action} IN ('like', 'superlike')`,
        sql`${swipes.userId} != ${userId}`,
      ),
    )
    .groupBy(swipes.userId)
    .orderBy(desc(sql`COUNT(*)`))
    .limit(20);

  if (similarUsersResult.length === 0) {
    return getPopularityFeed(swipedIds, limit, extraConditions);
  }

  const similarUserIds = similarUsersResult.map(r => r.userId);
  const overlapMap = new Map(similarUsersResult.map(r => [r.userId, r.overlap]));

  // Get dishes similar users liked that current user hasn't seen
  const recommendedSwipes = await db
    .select({ dishId: swipes.dishId, userId: swipes.userId })
    .from(swipes)
    .where(
      and(
        inArray(swipes.userId, similarUserIds),
        sql`${swipes.action} IN ('like', 'superlike')`,
        swipedIds.length > 0 ? notInArray(swipes.dishId, swipedIds) : undefined,
      ),
    );

  if (recommendedSwipes.length === 0) {
    return getPopularityFeed(swipedIds, limit, extraConditions);
  }

  // Score dishes by sum of neighbor overlaps
  const scoreMap = new Map<string, number>();
  for (const s of recommendedSwipes) {
    const prev = scoreMap.get(s.dishId) ?? 0;
    scoreMap.set(s.dishId, prev + (overlapMap.get(s.userId) ?? 1));
  }

  const rankedDishIds = [...scoreMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => id);

  const conditions: Condition[] = [
    eq(dishes.isAvailable, true),
    inArray(dishes.id, rankedDishIds),
    ...extraConditions,
  ];

  const feed = await db
    .select(DISH_SELECT)
    .from(dishes)
    .leftJoin(foodPartners, eq(dishes.partnerId, foodPartners.id))
    .where(and(...conditions));

  // Preserve collaborative ranking order
  const dishMap = new Map(feed.map(d => [d.id, d]));
  const ordered = rankedDishIds.map(id => dishMap.get(id)).filter(Boolean) as typeof feed;

  // Fallback padding with popular dishes if not enough results
  if (ordered.length < limit) {
    const seenIds = [...swipedIds, ...ordered.map(d => d.id)];
    const popular = await getPopularityFeed(seenIds, limit - ordered.length, extraConditions);
    return [...ordered, ...popular];
  }

  return ordered;
}

async function getPopularityFeed(
  excludeIds: string[],
  limit: number,
  extraConditions: Condition[],
) {
  const conditions: Condition[] = [
    eq(dishes.isAvailable, true),
    excludeIds.length > 0 ? notInArray(dishes.id, excludeIds) : undefined,
    ...extraConditions,
  ];

  return db
    .select(DISH_SELECT)
    .from(dishes)
    .leftJoin(foodPartners, eq(dishes.partnerId, foodPartners.id))
    .where(and(...conditions))
    .orderBy(desc(dishes.likeCount))
    .limit(limit);
}

export async function dishRoutes(fastify: FastifyInstance) {
  // GET /feed — personalized feed (optional Clerk auth)
  fastify.get('/feed', async (request: FastifyRequest, reply: FastifyReply) => {
    const parsed = FeedQuerySchema.safeParse(request.query);
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.issues[0].message });
    }
    const { limit, category, isVeg } = parsed.data;

    const extraConditions: Condition[] = [];
    if (category) extraConditions.push(eq(dishes.category, category));
    if (isVeg !== undefined) extraConditions.push(eq(dishes.isVeg, isVeg));

    const userId = await optionalClerkAuth(request);

    let feed: Awaited<ReturnType<typeof getPopularityFeed>>;
    if (userId) {
      feed = await getCollaborativeFeed(userId, limit, extraConditions);
    } else {
      feed = await getPopularityFeed([], limit, extraConditions);
    }

    return reply.send({ dishes: feed, hasMore: feed.length === limit });
  });

  // POST /swipe — requires Clerk auth
  fastify.post('/swipe', async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = await verifyClerkAuth(request, reply);
    if (!userId) return;

    const parsed = SwipeBodySchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.issues[0].message });
    }
    const { dishId, action, sessionId } = parsed.data;

    await db.insert(swipes).values({ userId, dishId, action, sessionId });

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

  // GET /search?q= — full-text search
  fastify.get('/search', async (request: FastifyRequest, reply: FastifyReply) => {
    const parsed = SearchQuerySchema.safeParse(request.query);
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.issues[0].message });
    }
    const { q, limit } = parsed.data;

    const results = await db
      .select(DISH_SELECT)
      .from(dishes)
      .leftJoin(foodPartners, eq(dishes.partnerId, foodPartners.id))
      .where(
        and(
          eq(dishes.isAvailable, true),
          or(
            ilike(dishes.name, `%${q}%`),
            ilike(dishes.description, `%${q}%`),
            sql`${q} = ANY(${dishes.tags})`,
          ),
        ),
      )
      .orderBy(
        sql`CASE WHEN ${dishes.name} ILIKE ${q + '%'} THEN 0 ELSE 1 END`,
        desc(dishes.likeCount),
      )
      .limit(limit);

    return reply.send({ dishes: results });
  });

  // GET /popular
  fastify.get('/popular', async (request: FastifyRequest, reply: FastifyReply) => {
    const { limit = 10 } = request.query as { limit?: number };

    const popular = await db
      .select({
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
      .limit(Number(limit));

    return reply.send({ dishes: popular });
  });

  // GET /category/:category
  fastify.get('/category/:category', async (request: FastifyRequest<{ Params: { category: string }; Querystring: { limit?: number } }>, reply: FastifyReply) => {
    const { category } = request.params;
    const { limit = 20 } = request.query;

    const categoryDishes = await db
      .select({
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
      .limit(Number(limit));

    return reply.send({ dishes: categoryDishes });
  });

  // GET /:id — single dish
  fastify.get('/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const { id } = request.params;

    const dish = await db
      .select({
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
}
