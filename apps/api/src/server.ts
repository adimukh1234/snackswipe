import Fastify from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import jwt from '@fastify/jwt';
import { config } from 'dotenv';

config();

const fastify = Fastify({
  logger: true,
});

// Plugins
await fastify.register(cors, {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
});

await fastify.register(cookie);

await fastify.register(jwt, {
  secret: process.env.JWT_SECRET || 'super-secret-key-change-in-production',
  cookie: {
    cookieName: 'token',
    signed: false,
  },
});

// Health check
fastify.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// Routes will be registered here
// await fastify.register(authRoutes, { prefix: '/api/auth' });
// await fastify.register(dishRoutes, { prefix: '/api/dishes' });
// await fastify.register(orderRoutes, { prefix: '/api/orders' });
// await fastify.register(partnerRoutes, { prefix: '/api/partners' });

// Start server
const start = async () => {
  try {
    const port = parseInt(process.env.PORT || '4000', 10);
    await fastify.listen({ port, host: '0.0.0.0' });
    console.log(`🚀 API server running at http://localhost:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
