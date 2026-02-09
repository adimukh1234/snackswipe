import { config } from 'dotenv';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './db/schema';

// Load environment variables
config();

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

// Sample data
const partners = [
  {
    name: 'Punjab Grill',
    email: 'punjab@example.com',
    phone: '9876543210',
    passwordHash: '$2a$10$xVqYLT3RfB8x8Z1Q2Q3Q4OxqYxHx8xB8xVqYLT3RfB8x8Z1Q2Q3Q4O', // hashed "password"
    slug: 'punjab-grill',
    cuisines: ['North Indian', 'Punjabi'],
    rating: '4.5',
    address: { street: '123 Food Street', city: 'Delhi', pincode: '110001' },
  },
  {
    name: 'Pizza Palace',
    email: 'pizza@example.com',
    phone: '9876543211',
    passwordHash: '$2a$10$xVqYLT3RfB8x8Z1Q2Q3Q4OxqYxHx8xB8xVqYLT3RfB8x8Z1Q2Q3Q4O',
    slug: 'pizza-palace',
    cuisines: ['Italian', 'Pizza'],
    rating: '4.3',
    address: { street: '456 Pizza Lane', city: 'Delhi', pincode: '110002' },
  },
  {
    name: 'Tokyo Bites',
    email: 'tokyo@example.com',
    phone: '9876543212',
    passwordHash: '$2a$10$xVqYLT3RfB8x8Z1Q2Q3Q4OxqYxHx8xB8xVqYLT3RfB8x8Z1Q2Q3Q4O',
    slug: 'tokyo-bites',
    cuisines: ['Japanese', 'Sushi'],
    rating: '4.7',
    address: { street: '789 Sushi Road', city: 'Delhi', pincode: '110003' },
  },
  {
    name: 'Burger Barn',
    email: 'burger@example.com',
    phone: '9876543213',
    passwordHash: '$2a$10$xVqYLT3RfB8x8Z1Q2Q3Q4OxqYxHx8xB8xVqYLT3RfB8x8Z1Q2Q3Q4O',
    slug: 'burger-barn',
    cuisines: ['American', 'Burgers'],
    rating: '4.2',
    address: { street: '101 Burger Blvd', city: 'Delhi', pincode: '110004' },
  },
  {
    name: 'Thai Orchid',
    email: 'thai@example.com',
    phone: '9876543214',
    passwordHash: '$2a$10$xVqYLT3RfB8x8Z1Q2Q3Q4OxqYxHx8xB8xVqYLT3RfB8x8Z1Q2Q3Q4O',
    slug: 'thai-orchid',
    cuisines: ['Thai', 'Asian'],
    rating: '4.6',
    address: { street: '202 Thai Terrace', city: 'Delhi', pincode: '110005' },
  },
  {
    name: 'Spice Garden',
    email: 'spice@example.com',
    phone: '9876543215',
    passwordHash: '$2a$10$xVqYLT3RfB8x8Z1Q2Q3Q4OxqYxHx8xB8xVqYLT3RfB8x8Z1Q2Q3Q4O',
    slug: 'spice-garden',
    cuisines: ['Indian', 'Vegetarian'],
    rating: '4.4',
    address: { street: '303 Spice Street', city: 'Delhi', pincode: '110006' },
  },
];

const dishesData = [
  // Punjab Grill dishes
  {
    name: 'Butter Chicken',
    description: 'Creamy tomato-based curry with tender chicken pieces, served with garlic naan and fragrant basmati rice.',
    price: '350.00',
    imageUrls: ['https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800&q=80'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&q=80',
    tags: ['spicy', 'bestseller', 'non-veg'],
    category: 'Main Course',
    prepTimeMins: 25,
    isVeg: false,
    partnerIndex: 0,
  },
  {
    name: 'Dal Makhani',
    description: 'Rich and creamy black lentils slow-cooked overnight with butter and cream.',
    price: '280.00',
    imageUrls: ['https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&q=80',
    tags: ['vegetarian', 'creamy'],
    category: 'Main Course',
    prepTimeMins: 20,
    isVeg: true,
    partnerIndex: 0,
  },
  // Pizza Palace dishes
  {
    name: 'Margherita Pizza',
    description: 'Classic Italian pizza with fresh mozzarella, San Marzano tomatoes, and aromatic fresh basil.',
    price: '299.00',
    imageUrls: ['https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&q=80',
    tags: ['italian', 'vegetarian', 'classic'],
    category: 'Pizza',
    prepTimeMins: 20,
    isVeg: true,
    partnerIndex: 1,
  },
  {
    name: 'Pepperoni Pizza',
    description: 'Loaded with spicy pepperoni slices under a blanket of melted mozzarella.',
    price: '399.00',
    imageUrls: ['https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800&q=80'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&q=80',
    tags: ['spicy', 'non-veg', 'bestseller'],
    category: 'Pizza',
    prepTimeMins: 22,
    isVeg: false,
    partnerIndex: 1,
  },
  // Tokyo Bites dishes
  {
    name: 'Sushi Platter',
    description: "Chef's selection of fresh nigiri and maki rolls with premium wasabi and pickled ginger.",
    price: '599.00',
    imageUrls: ['https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&q=80'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&q=80',
    tags: ['japanese', 'fresh', 'premium'],
    category: 'Sushi',
    prepTimeMins: 15,
    isVeg: false,
    partnerIndex: 2,
  },
  {
    name: 'Ramen Bowl',
    description: 'Rich tonkotsu broth with chashu pork, soft-boiled egg, and fresh noodles.',
    price: '450.00',
    imageUrls: ['https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&q=80'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&q=80',
    tags: ['japanese', 'soup', 'hearty'],
    category: 'Noodles',
    prepTimeMins: 18,
    isVeg: false,
    partnerIndex: 2,
  },
  // Burger Barn dishes
  {
    name: 'Loaded Burger',
    description: 'Juicy Angus beef patty with aged cheddar, caramelized onions, and our signature sauce.',
    price: '249.00',
    imageUrls: ['https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80',
    tags: ['american', 'popular', 'non-veg'],
    category: 'Burgers',
    prepTimeMins: 18,
    isVeg: false,
    partnerIndex: 3,
  },
  {
    name: 'Veggie Supreme Burger',
    description: 'Crispy veggie patty with fresh lettuce, tomato, and special mayo.',
    price: '199.00',
    imageUrls: ['https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&q=80'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&q=80',
    tags: ['vegetarian', 'healthy'],
    category: 'Burgers',
    prepTimeMins: 15,
    isVeg: true,
    partnerIndex: 3,
  },
  // Thai Orchid dishes
  {
    name: 'Pad Thai',
    description: 'Authentic stir-fried rice noodles with tiger prawns, crushed peanuts, and tamarind.',
    price: '320.00',
    imageUrls: ['https://images.unsplash.com/photo-1559314809-0d155014e29e?w=800&q=80'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=400&q=80',
    tags: ['thai', 'noodles', 'popular'],
    category: 'Noodles',
    prepTimeMins: 22,
    isVeg: false,
    partnerIndex: 4,
  },
  {
    name: 'Green Curry',
    description: 'Fragrant Thai green curry with vegetables in creamy coconut milk.',
    price: '290.00',
    imageUrls: ['https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=800&q=80'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=400&q=80',
    tags: ['thai', 'spicy', 'vegetarian'],
    category: 'Curry',
    prepTimeMins: 20,
    isVeg: true,
    partnerIndex: 4,
  },
  // Spice Garden dishes
  {
    name: 'Paneer Tikka',
    description: 'Smoky grilled cottage cheese cubes marinated in spiced yogurt with mint chutney.',
    price: '280.00',
    imageUrls: ['https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=800&q=80'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400&q=80',
    tags: ['indian', 'vegetarian', 'grilled'],
    category: 'Starters',
    prepTimeMins: 20,
    isVeg: true,
    partnerIndex: 5,
  },
  {
    name: 'Palak Paneer',
    description: 'Cottage cheese cubes in a rich spinach gravy with aromatic spices.',
    price: '260.00',
    imageUrls: ['https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&q=80'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&q=80',
    tags: ['indian', 'vegetarian', 'healthy'],
    category: 'Main Course',
    prepTimeMins: 18,
    isVeg: true,
    partnerIndex: 5,
  },
];

async function seed() {
  console.log('🌱 Seeding database...\n');

  try {
    // Insert partners
    console.log('📦 Creating food partners...');
    const insertedPartners = await db.insert(schema.foodPartners).values(partners).returning();
    console.log(`   ✓ Created ${insertedPartners.length} partners\n`);

    // Insert dishes with partner references
    console.log('🍽️  Creating dishes...');
    const dishesToInsert = dishesData.map(dish => ({
      partnerId: insertedPartners[dish.partnerIndex].id,
      name: dish.name,
      description: dish.description,
      price: dish.price,
      imageUrls: dish.imageUrls,
      thumbnailUrl: dish.thumbnailUrl,
      tags: dish.tags,
      category: dish.category,
      prepTimeMins: dish.prepTimeMins,
      isVeg: dish.isVeg,
      isAvailable: true,
      likeCount: Math.floor(Math.random() * 100) + 10,
      swipeCount: Math.floor(Math.random() * 200) + 50,
    }));

    const insertedDishes = await db.insert(schema.dishes).values(dishesToInsert).returning();
    console.log(`   ✓ Created ${insertedDishes.length} dishes\n`);

    console.log('✅ Seeding complete!\n');
    console.log('Partners:');
    insertedPartners.forEach(p => console.log(`   - ${p.name} (${p.slug})`));
    console.log('\nDishes:');
    insertedDishes.forEach(d => console.log(`   - ${d.name} - ₹${d.price}`));
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }

  process.exit(0);
}

seed();
