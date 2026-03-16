import Fastify from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import jwt from '@fastify/jwt';
import rateLimit from '@fastify/rate-limit';
import { config } from 'dotenv';

// Load environment variables
config();

// Import routes
import { dishRoutes } from './routes/dishes.routes';
import { orderRoutes } from './routes/orders.routes';
import { partnerRoutes } from './routes/partners.routes';
import { paymentRoutes } from './routes/payments.routes';

const fastify = Fastify({
  logger: true,
});

// Register plugins
const registerPlugins = async () => {
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

  // Rate limiting: 100 req/min globally
  await fastify.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });
};

// Register routes
const registerRoutes = async () => {
  // Health check
  fastify.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  // API routes
  await fastify.register(dishRoutes, { prefix: '/api/dishes' });
  await fastify.register(orderRoutes, { prefix: '/api/orders' });
  await fastify.register(paymentRoutes, { prefix: '/api/payments' });
  await fastify.register(partnerRoutes, { prefix: '/api/partners' });
};

// Start server
const start = async () => {
  try {
    await registerPlugins();
    await registerRoutes();

    const port = parseInt(process.env.PORT || '4000', 10);
    await fastify.listen({ port, host: '0.0.0.0' });
    
    console.log(`
🚀 Zomagram API Server Running
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Health:     http://localhost:${port}/health
📍 Dishes:     http://localhost:${port}/api/dishes
📍 Orders:     http://localhost:${port}/api/orders
📍 Partners:   http://localhost:${port}/api/partners
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
