import { v4 as uuidv4 } from 'uuid';

// Mock Partner Data
export const MOCK_PARTNERS = generateMockPartners();

// Mock Dishes Data (25 dishes across partners)
export const MOCK_DISHES = generateMockDishes(MOCK_PARTNERS);

// Mock Users Data (10 users)
export const MOCK_USERS = generateMockUsers();

// ==================== Factory Functions ====================

export function generateMockPartners() {
  const partners = [
    {
      id: uuidv4(),
      name: 'Spice House',
      slug: 'spice-house',
      email: 'contact@spicehouse.local',
      phone: '+91-9876543210',
      passwordHash: 'hashed_password_1',
      logoUrl: 'https://via.placeholder.com/200?text=Spice+House',
      coverUrl: 'https://via.placeholder.com/800?text=Spice+House+Cover',
      address: {
        street: '123 Food Street',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560001',
        lat: 12.9716,
        lng: 77.5946,
      },
      cuisines: ['Indian', 'North Indian', 'Mughlai'],
      rating: 4.5 as any,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: uuidv4(),
      name: 'Dragon Wok',
      slug: 'dragon-wok',
      email: 'contact@dragonwok.local',
      phone: '+91-9876543211',
      passwordHash: 'hashed_password_2',
      logoUrl: 'https://via.placeholder.com/200?text=Dragon+Wok',
      coverUrl: 'https://via.placeholder.com/800?text=Dragon+Wok+Cover',
      address: {
        street: '456 Asia Avenue',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560002',
        lat: 12.9352,
        lng: 77.6245,
      },
      cuisines: ['Chinese', 'Asian', 'Thai'],
      rating: 4.3 as any,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: uuidv4(),
      name: 'Pasta Paradise',
      slug: 'pasta-paradise',
      email: 'contact@parastaparadise.local',
      phone: '+91-9876543212',
      passwordHash: 'hashed_password_3',
      logoUrl: 'https://via.placeholder.com/200?text=Pasta+Paradise',
      coverUrl: 'https://via.placeholder.com/800?text=Pasta+Paradise+Cover',
      address: {
        street: '789 Italia Road',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560003',
        lat: 12.9689,
        lng: 77.5941,
      },
      cuisines: ['Italian', 'Continental', 'Mediterranean'],
      rating: 4.4 as any,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: uuidv4(),
      name: 'Burger Bliss',
      slug: 'burger-bliss',
      email: 'contact@burgerbliss.local',
      phone: '+91-9876543213',
      passwordHash: 'hashed_password_4',
      logoUrl: 'https://via.placeholder.com/200?text=Burger+Bliss',
      coverUrl: 'https://via.placeholder.com/800?text=Burger+Bliss+Cover',
      address: {
        street: '321 Fast Track Lane',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560004',
        lat: 12.9716,
        lng: 77.5941,
      },
      cuisines: ['Fast Food', 'American', 'Burgers'],
      rating: 4.2 as any,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  return partners;
}

export function generateMockDishes(
  partners: ReturnType<typeof generateMockPartners>
) {
  const dishesConfig = [
    // Spice House (6 dishes)
    {
      name: 'Butter Chicken',
      category: 'Curries',
      price: 250,
      isVeg: false,
      description: 'Tender chicken in creamy tomato sauce with aromatic spices',
      tags: ['bestseller', 'spicy', 'creamy'],
      partnerId: partners[0].id,
    },
    {
      name: 'Dal Makhani',
      category: 'Curries',
      price: 180,
      isVeg: true,
      description: 'Creamy lentils cooked overnight with cream and butter',
      tags: ['vegetarian', 'creamy', 'comforting'],
      partnerId: partners[0].id,
    },
    {
      name: 'Biryani - Chicken',
      category: 'Rice',
      price: 300,
      isVeg: false,
      description: 'Fragrant basmati rice with tender chicken and spices',
      tags: ['bestseller', 'spicy', 'aromatic'],
      partnerId: partners[0].id,
    },
    {
      name: 'Paneer Tikka',
      category: 'Starters',
      price: 200,
      isVeg: true,
      description: 'Grilled cottage cheese marinated in spices',
      tags: ['vegetarian', 'grilled', 'protein-rich'],
      partnerId: partners[0].id,
    },
    {
      name: 'Chole Bhature',
      category: 'Breads',
      price: 120,
      isVeg: true,
      description: 'Soft fried bread served with spiced chickpea curry',
      tags: ['vegetarian', 'street-food', 'filling'],
      partnerId: partners[0].id,
    },
    {
      name: 'Tandoori Chicken',
      category: 'Grilled',
      price: 280,
      isVeg: false,
      description: 'Half chicken marinated and grilled in tandoor',
      tags: ['grilled', 'spicy', 'protein-rich'],
      partnerId: partners[0].id,
    },

    // Dragon Wok (7 dishes)
    {
      name: 'Fried Rice - Chicken',
      category: 'Rice',
      price: 220,
      isVeg: false,
      description: 'Wok-tossed rice with chicken and mixed vegetables',
      tags: ['bestseller', 'quick', 'savory'],
      partnerId: partners[1].id,
    },
    {
      name: 'Hakka Noodles',
      category: 'Noodles',
      price: 180,
      isVeg: true,
      description: 'Crispy noodles with ginger-garlic sauce and vegetables',
      tags: ['vegetarian', 'quick', 'crunchy'],
      partnerId: partners[1].id,
    },
    {
      name: 'Chilli Garlic Shrimp',
      category: 'Main Course',
      price: 320,
      isVeg: false,
      description: 'Succulent shrimp in fiery chilli-garlic sauce',
      tags: ['spicy', 'seafood', 'aromatic'],
      partnerId: partners[1].id,
    },
    {
      name: 'Veg Spring Rolls',
      category: 'Starters',
      price: 120,
      isVeg: true,
      description: 'Crispy rolls filled with vegetables',
      tags: ['vegetarian', 'starter', 'crunchy'],
      partnerId: partners[1].id,
    },
    {
      name: 'Sweet & Sour Pork',
      category: 'Main Course',
      price: 280,
      isVeg: false,
      description: 'Tender pork in sweet and sour sauce',
      tags: ['sweet-savory', 'bestseller', 'comfort'],
      partnerId: partners[1].id,
    },
    {
      name: 'Thai Green Curry',
      category: 'Curries',
      price: 250,
      isVeg: false,
      description: 'Creamy green curry with chicken and basil',
      tags: ['spicy', 'creamy', 'aromatic'],
      partnerId: partners[1].id,
    },
    {
      name: 'Egg Fried Rice',
      category: 'Rice',
      price: 150,
      isVeg: true,
      description: 'Simple yet flavorful fried rice with scrambled eggs',
      tags: ['vegetarian', 'quick', 'comfort'],
      partnerId: partners[1].id,
    },

    // Pasta Paradise (6 dishes)
    {
      name: 'Spaghetti Carbonara',
      category: 'Pasta',
      price: 240,
      isVeg: false,
      description: 'Creamy pasta with bacon and parmesan',
      tags: ['bestseller', 'creamy', 'classic'],
      partnerId: partners[2].id,
    },
    {
      name: 'Penne Arrabbiata',
      category: 'Pasta',
      price: 200,
      isVeg: true,
      description: 'Spicy tomato sauce with penne and garlic',
      tags: ['vegetarian', 'spicy', 'light'],
      partnerId: partners[2].id,
    },
    {
      name: 'Fettuccine Alfredo',
      category: 'Pasta',
      price: 220,
      isVeg: true,
      description: 'Creamy butter and parmesan sauce with fettuccine',
      tags: ['vegetarian', 'creamy', 'comfort'],
      partnerId: partners[2].id,
    },
    {
      name: 'Lasagna Bolognese',
      category: 'Pasta',
      price: 270,
      isVeg: false,
      description: 'Layered pasta with meat sauce and cheese',
      tags: ['hearty', 'classic', 'comfort'],
      partnerId: partners[2].id,
    },
    {
      name: 'Risotto Mushroom',
      category: 'Rice',
      price: 260,
      isVeg: true,
      description: 'Creamy rice with mushrooms and white wine',
      tags: ['vegetarian', 'creamy', 'gourmet'],
      partnerId: partners[2].id,
    },
    {
      name: 'Garlic Bread',
      category: 'Starters',
      price: 100,
      isVeg: true,
      description: 'Toasted bread with garlic butter',
      tags: ['vegetarian', 'starter', 'crispy'],
      partnerId: partners[2].id,
    },

    // Burger Bliss (6 dishes)
    {
      name: 'Classic Cheeseburger',
      category: 'Burgers',
      price: 180,
      isVeg: false,
      description: 'Juicy beef patty with melted cheese and fresh veggies',
      tags: ['bestseller', 'classic', 'beef'],
      partnerId: partners[3].id,
    },
    {
      name: 'Vegan Burger',
      category: 'Burgers',
      price: 160,
      isVeg: true,
      description: 'Plant-based patty with fresh toppings',
      tags: ['vegetarian', 'vegan', 'healthy'],
      partnerId: partners[3].id,
    },
    {
      name: 'Bacon Crispy Fries',
      category: 'Sides',
      price: 120,
      isVeg: false,
      description: 'Golden fries topped with crispy bacon',
      tags: ['crispy', 'bacon', 'savory'],
      partnerId: partners[3].id,
    },
    {
      name: 'Spicy Chicken Burger',
      category: 'Burgers',
      price: 170,
      isVeg: false,
      description: 'Crispy fried chicken with spicy mayo',
      tags: ['spicy', 'chicken', 'crispy'],
      partnerId: partners[3].id,
    },
    {
      name: 'Cheesy Fries',
      category: 'Sides',
      price: 110,
      isVeg: true,
      description: 'Crispy fries loaded with melted cheese',
      tags: ['vegetarian', 'cheesy', 'indulgent'],
      partnerId: partners[3].id,
    },
    {
      name: 'Mushroom Swiss Burger',
      category: 'Burgers',
      price: 200,
      isVeg: false,
      description: 'Beef burger with sautéed mushrooms and swiss cheese',
      tags: ['gourmet', 'mushroom', 'premium'],
      partnerId: partners[3].id,
    },
  ];

  return dishesConfig.map((config) => ({
    id: uuidv4(),
    partnerId: config.partnerId,
    name: config.name,
    description: config.description,
    price: config.price as any,
    videoUrl: null,
    imageUrls: [`https://via.placeholder.com/400?text=${encodeURIComponent(config.name)}`],
    thumbnailUrl: `https://via.placeholder.com/200?text=${encodeURIComponent(config.name)}`,
    tags: config.tags,
    category: config.category,
    prepTimeMins: 20 + Math.floor(Math.random() * 25),
    isVeg: config.isVeg,
    isAvailable: Math.random() > 0.1, // 90% available
    swipeCount: Math.floor(Math.random() * 100),
    likeCount: Math.floor(Math.random() * 50),
    orderCount: Math.floor(Math.random() * 30),
    createdAt: new Date(),
    updatedAt: new Date(),
  }));
}

export function generateMockUsers() {
  const firstNames = [
    'Raj',
    'Priya',
    'Arjun',
    'Neha',
    'Vikram',
    'Anjali',
    'Rohit',
    'Divya',
    'Akshay',
    'Pooja',
  ];
  const lastNames = [
    'Sharma',
    'Patel',
    'Singh',
    'Kumar',
    'Gupta',
    'Verma',
    'Reddy',
    'Nair',
    'Iyer',
    'Bhat',
  ];

  return Array.from({ length: 10 }, (_, i) => {
    const firstName = firstNames[i];
    const lastName = lastNames[i];
    return {
      id: uuidv4(),
      clerkId: `user_${i + 1}_${Date.now()}`,
      phone: `+91-${9000000000 + i}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i + 1}@test.local`,
      name: `${firstName} ${lastName}`,
      avatarUrl: `https://via.placeholder.com/200?text=${firstName}`,
      tasteProfile: {
        preferences: ['spicy', 'vegetarian'],
        allergies: [],
        cuisines: ['Indian', 'Chinese', 'Italian'],
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });
}

export function generateMockSwipes(
  users: ReturnType<typeof generateMockUsers>,
  dishes: ReturnType<typeof generateMockDishes>
): Array<{
  id: string;
  userId: string;
  dishId: string;
  action: 'like' | 'skip' | 'superlike';
  sessionId: string;
  createdAt: Date;
}> {
  const swipes: Array<{
    id: string;
    userId: string;
    dishId: string;
    action: 'like' | 'skip' | 'superlike';
    sessionId: string;
    createdAt: Date;
  }> = [];
  const actions: Array<'like' | 'skip' | 'superlike'> = ['like', 'skip', 'superlike'];

  users.forEach((user) => {
    // 5-10 swipes per user
    const swipeCount = 5 + Math.floor(Math.random() * 6);
    const swipedDishIds = new Set<string>();

    for (let i = 0; i < swipeCount; i++) {
      let dish: (typeof dishes)[0];
      // Ensure no duplicate swipes for same dish
      do {
        dish = dishes[Math.floor(Math.random() * dishes.length)];
      } while (swipedDishIds.has(dish.id));

      swipedDishIds.add(dish.id);

      swipes.push({
        id: uuidv4(),
        userId: user.id,
        dishId: dish.id,
        action: actions[Math.floor(Math.random() * actions.length)],
        sessionId: uuidv4(),
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random date in last 7 days
      });
    }
  });

  return swipes;
}

export function generateMockAddresses(
  users: ReturnType<typeof generateMockUsers>
): Array<{
  id: string;
  userId: string;
  label: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  lat: any;
  lng: any;
  isDefault: boolean;
  createdAt: Date;
}> {
  const cities = ['Bangalore', 'Pune', 'Hyderabad', 'Chennai', 'Delhi'];
  const addresses: Array<{
    id: string;
    userId: string;
    label: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    lat: any;
    lng: any;
    isDefault: boolean;
    createdAt: Date;
  }> = [];

  users.forEach((user, index) => {
    // 1-2 addresses per user
    const addressCount = Math.random() > 0.5 ? 2 : 1;

    for (let i = 0; i < addressCount; i++) {
      const city = cities[Math.floor(Math.random() * cities.length)];
      const lat =
        12.9716 + (Math.random() - 0.5) * 0.5; // Around Bangalore
      const lng =
        77.5946 + (Math.random() - 0.5) * 0.5;

      addresses.push({
        id: uuidv4(),
        userId: user.id,
        label: i === 0 ? 'Home' : 'Work',
        street: `${100 + index * 10 + i} Main Street`,
        city: city,
        state: 'Karnataka',
        pincode: `560${String(index + 1).padStart(3, '0')}`,
        lat: lat as any,
        lng: lng as any,
        isDefault: i === 0,
        createdAt: new Date(),
      });
    }
  });

  return addresses;
}
