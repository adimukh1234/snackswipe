import { pgTable, uuid, varchar, text, decimal, integer, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users (Consumers)
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  phone: varchar('phone', { length: 15 }).unique().notNull(),
  email: varchar('email', { length: 255 }).unique(),
  name: varchar('name', { length: 100 }),
  avatarUrl: text('avatar_url'),
  tasteProfile: jsonb('taste_profile').default({}),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Food Partners (Restaurants)
export const foodPartners = pgTable('food_partners', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 200 }).notNull(),
  slug: varchar('slug', { length: 200 }).unique(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  phone: varchar('phone', { length: 15 }).notNull(),
  passwordHash: text('password_hash').notNull(),
  logoUrl: text('logo_url'),
  coverUrl: text('cover_url'),
  address: jsonb('address'), // { street, city, state, pincode, lat, lng }
  cuisines: text('cuisines').array(),
  rating: decimal('rating', { precision: 2, scale: 1 }).default('0'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Dishes (Core Entity)
export const dishes = pgTable('dishes', {
  id: uuid('id').primaryKey().defaultRandom(),
  partnerId: uuid('partner_id').references(() => foodPartners.id).notNull(),
  name: varchar('name', { length: 200 }).notNull(),
  description: text('description'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  videoUrl: text('video_url'),
  imageUrls: text('image_urls').array(),
  thumbnailUrl: text('thumbnail_url'),
  tags: text('tags').array(), // ['spicy', 'vegetarian', 'bestseller']
  category: varchar('category', { length: 100 }),
  prepTimeMins: integer('prep_time_mins'),
  isVeg: boolean('is_veg').default(false),
  isAvailable: boolean('is_available').default(true),
  swipeCount: integer('swipe_count').default(0),
  likeCount: integer('like_count').default(0),
  orderCount: integer('order_count').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Swipe History (For Algorithm)
export const swipes = pgTable('swipes', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  dishId: uuid('dish_id').references(() => dishes.id).notNull(),
  action: varchar('action', { length: 10 }).notNull(), // 'like', 'skip', 'superlike'
  sessionId: uuid('session_id'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Cart Items
export const cartItems = pgTable('cart_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  dishId: uuid('dish_id').references(() => dishes.id).notNull(),
  quantity: integer('quantity').default(1),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Orders
export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  partnerId: uuid('partner_id').references(() => foodPartners.id).notNull(),
  items: jsonb('items').notNull(), // [{ dishId, name, qty, price, notes }]
  subtotal: decimal('subtotal', { precision: 10, scale: 2 }),
  deliveryFee: decimal('delivery_fee', { precision: 10, scale: 2 }),
  total: decimal('total', { precision: 10, scale: 2 }),
  status: varchar('status', { length: 50 }).default('pending'),
  deliveryAddress: jsonb('delivery_address'),
  paymentId: varchar('payment_id', { length: 100 }),
  porterOrderId: varchar('porter_order_id', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// User Addresses
export const userAddresses = pgTable('user_addresses', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  label: varchar('label', { length: 50 }), // 'Home', 'Work', etc.
  street: text('street').notNull(),
  city: varchar('city', { length: 100 }).notNull(),
  state: varchar('state', { length: 100 }),
  pincode: varchar('pincode', { length: 10 }).notNull(),
  lat: decimal('lat', { precision: 10, scale: 7 }),
  lng: decimal('lng', { precision: 10, scale: 7 }),
  isDefault: boolean('is_default').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relations for Drizzle relational queries
export const usersRelations = relations(users, ({ many }) => ({
  swipes: many(swipes),
  cartItems: many(cartItems),
  orders: many(orders),
  addresses: many(userAddresses),
}));

export const foodPartnersRelations = relations(foodPartners, ({ many }) => ({
  dishes: many(dishes),
  orders: many(orders),
}));

export const dishesRelations = relations(dishes, ({ one, many }) => ({
  partner: one(foodPartners, {
    fields: [dishes.partnerId],
    references: [foodPartners.id],
  }),
  swipes: many(swipes),
  cartItems: many(cartItems),
}));

export const swipesRelations = relations(swipes, ({ one }) => ({
  user: one(users, {
    fields: [swipes.userId],
    references: [users.id],
  }),
  dish: one(dishes, {
    fields: [swipes.dishId],
    references: [dishes.id],
  }),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  user: one(users, {
    fields: [cartItems.userId],
    references: [users.id],
  }),
  dish: one(dishes, {
    fields: [cartItems.dishId],
    references: [dishes.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  partner: one(foodPartners, {
    fields: [orders.partnerId],
    references: [foodPartners.id],
  }),
}));

export const userAddressesRelations = relations(userAddresses, ({ one }) => ({
  user: one(users, {
    fields: [userAddresses.userId],
    references: [users.id],
  }),
}));
