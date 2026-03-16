import { verifyToken } from '@clerk/backend';
import { FastifyRequest, FastifyReply } from 'fastify';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

/**
 * Optionally verifies a Clerk Bearer token.
 * Returns internal user UUID if token present and valid, null otherwise (no 401).
 */
export async function optionalClerkAuth(
  request: FastifyRequest,
): Promise<string | null> {
  const authHeader = request.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return null;

  const token = authHeader.slice(7);
  try {
    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY!,
    });
    const clerkId = payload.sub;

    const existing = await db.query.users.findFirst({
      where: eq(users.clerkId, clerkId),
    });
    if (existing) return existing.id;

    const email = (payload as Record<string, unknown>).email as string | undefined;
    const [created] = await db.insert(users).values({
      clerkId,
      email: email ?? null,
    }).returning({ id: users.id });

    return created.id;
  } catch {
    return null;
  }
}

/**
 * Verifies a Clerk Bearer token and returns the internal user UUID.
 * Creates a user record on first login.
 */
export async function verifyClerkAuth(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<string | null> {
  const authHeader = request.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    reply.status(401).send({ error: 'Unauthorized' });
    return null;
  }

  const token = authHeader.slice(7);

  try {
    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY!,
    });
    const clerkId = payload.sub;

    // Find or create user by Clerk ID
    const existing = await db.query.users.findFirst({
      where: eq(users.clerkId, clerkId),
    });
    if (existing) return existing.id;

    // First login — provision user row
    const email = (payload as Record<string, unknown>).email as string | undefined;
    const [created] = await db.insert(users).values({
      clerkId,
      email: email ?? null,
    }).returning({ id: users.id });

    return created.id;
  } catch {
    reply.status(401).send({ error: 'Unauthorized' });
    return null;
  }
}
