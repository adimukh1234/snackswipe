import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

// Types
interface RegisterBody {
  phone: string;
  name?: string;
  email?: string;
}

interface LoginBody {
  phone: string;
  otp: string;
}

interface VerifyBody {
  phone: string;
  otp: string;
}

// In-memory OTP store (use Redis in production)
const otpStore = new Map<string, { otp: string; expiresAt: Date }>();

// Generate 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function authRoutes(fastify: FastifyInstance) {
  // Send OTP for login/register
  fastify.post('/send-otp', async (request: FastifyRequest<{ Body: { phone: string } }>, reply: FastifyReply) => {
    const { phone } = request.body;

    if (!phone || phone.length < 10) {
      return reply.status(400).send({ error: 'Valid phone number required' });
    }

    // Generate and store OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    otpStore.set(phone, { otp, expiresAt });

    // In production, send OTP via SMS (Twilio, MSG91, etc.)
    console.log(`📱 OTP for ${phone}: ${otp}`);

    return reply.send({ 
      success: true, 
      message: 'OTP sent successfully',
      // Only hide in production - show in dev/undefined NODE_ENV
      dev_otp: process.env.NODE_ENV !== 'production' ? otp : undefined
    });
  });

  // Verify OTP and login/register
  fastify.post('/verify-otp', async (request: FastifyRequest<{ Body: VerifyBody }>, reply: FastifyReply) => {
    const { phone, otp } = request.body;

    if (!phone || !otp) {
      return reply.status(400).send({ error: 'Phone and OTP required' });
    }

    // Verify OTP
    const storedOtp = otpStore.get(phone);
    if (!storedOtp) {
      return reply.status(400).send({ error: 'OTP expired or not found. Request a new one.' });
    }

    if (storedOtp.otp !== otp) {
      return reply.status(400).send({ error: 'Invalid OTP' });
    }

    if (new Date() > storedOtp.expiresAt) {
      otpStore.delete(phone);
      return reply.status(400).send({ error: 'OTP expired' });
    }

    // OTP valid - clean up
    otpStore.delete(phone);

    // Check if user exists
    let user = await db.query.users.findFirst({
      where: eq(users.phone, phone),
    });

    // Create user if doesn't exist
    if (!user) {
      const [newUser] = await db.insert(users).values({
        phone,
      }).returning();
      user = newUser;
    }

    // Generate JWT
    const token = fastify.jwt.sign({ 
      userId: user.id, 
      phone: user.phone 
    }, { expiresIn: '30d' });

    // Set cookie
    reply.setCookie('token', token, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return reply.send({
      success: true,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
      },
      token,
    });
  });

  // Get current user
  fastify.get('/me', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();
      const { userId } = request.user as { userId: string };

      const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
      });

      if (!user) {
        return reply.status(404).send({ error: 'User not found' });
      }

      return reply.send({
        id: user.id,
        phone: user.phone,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        tasteProfile: user.tasteProfile,
      });
    } catch (err) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }
  });

  // Update profile
  fastify.patch('/profile', async (request: FastifyRequest<{ Body: { name?: string; email?: string } }>, reply: FastifyReply) => {
    try {
      await request.jwtVerify();
      const { userId } = request.user as { userId: string };
      const { name, email } = request.body;

      const [updatedUser] = await db.update(users)
        .set({ 
          name, 
          email,
          updatedAt: new Date()
        })
        .where(eq(users.id, userId))
        .returning();

      return reply.send({
        success: true,
        user: {
          id: updatedUser.id,
          phone: updatedUser.phone,
          name: updatedUser.name,
          email: updatedUser.email,
        },
      });
    } catch (err) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }
  });

  // Logout
  fastify.post('/logout', async (request: FastifyRequest, reply: FastifyReply) => {
    reply.clearCookie('token', { path: '/' });
    return reply.send({ success: true, message: 'Logged out' });
  });
}
