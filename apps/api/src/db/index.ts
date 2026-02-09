import { config } from 'dotenv';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// Load environment variables FIRST
config();

// Validate DATABASE_URL exists
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

// Use Neon serverless driver
const sql = neon(process.env.DATABASE_URL);

// Create Drizzle ORM instance with schema for relational queries
export const db = drizzle(sql, { schema });

// Export schema for use in routes
export * from './schema';
