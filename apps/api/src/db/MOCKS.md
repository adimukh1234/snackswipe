# Mock Data Factory

## Overview

The mock data factory in `src/db/mocks.ts` provides realistic test data for the CRAVE API, covering all core entities: food partners, dishes, users, swipes, and addresses.

## What's Included

### Pre-Generated Constants (Ready to Use)

- **MOCK_PARTNERS**: 4 food partners
  - Spice House (Indian)
  - Dragon Wok (Chinese/Asian)
  - Pasta Paradise (Italian)
  - Burger Bliss (Fast Food/American)

- **MOCK_DISHES**: 25 dishes distributed across partners
  - Price range: ₹100-500
  - ~65% non-vegetarian, 35% vegetarian
  - Multiple categories (Curries, Rice, Pasta, Burgers, etc.)
  - Realistic tags (spicy, vegetarian, bestseller, etc.)

- **MOCK_USERS**: 10 sample users
  - Unique emails, phones, and Clerk IDs
  - Realistic names and basic taste profiles

## Usage

### In Unit/Integration Tests

```typescript
import { MOCK_PARTNERS, MOCK_DISHES, MOCK_USERS } from '@/db/mocks';

describe('Dish Feed', () => {
  it('returns dishes from all partners', () => {
    expect(MOCK_DISHES).toHaveLength(25);
    expect(MOCK_PARTNERS).toHaveLength(4);
  });
});
```

### Generate Custom Mock Data

```typescript
import {
  generateMockSwipes,
  generateMockAddresses,
  generateMockPartners,
  generateMockDishes,
  generateMockUsers,
} from '@/db/mocks';

// Create partners for a specific test
const partners = generateMockPartners();
const dishes = generateMockDishes(partners);
const users = generateMockUsers();

// Generate swipes and addresses
const swipes = generateMockSwipes(users, dishes);
const addresses = generateMockAddresses(users);
```

## Seeding Database for E2E Tests

To seed your test database, create a `seed.ts` file:

```typescript
import { db } from '@/db';
import {
  users,
  foodPartners,
  dishes,
  swipes,
  userAddresses,
} from '@/db/schema';
import {
  MOCK_USERS,
  MOCK_PARTNERS,
  MOCK_DISHES,
} from '@/db/mocks';
import { generateMockSwipes, generateMockAddresses } from '@/db/mocks';

async function seedDatabase() {
  console.log('Seeding database with mock data...');

  // Insert partners
  await db.insert(foodPartners).values(MOCK_PARTNERS).onConflictDoNothing();

  // Insert dishes
  await db.insert(dishes).values(MOCK_DISHES).onConflictDoNothing();

  // Insert users
  await db.insert(users).values(MOCK_USERS).onConflictDoNothing();

  // Insert swipes
  const swipes_data = generateMockSwipes(MOCK_USERS, MOCK_DISHES);
  if (swipes_data.length > 0) {
    await db.insert(swipes).values(swipes_data).onConflictDoNothing();
  }

  // Insert addresses
  const addresses_data = generateMockAddresses(MOCK_USERS);
  if (addresses_data.length > 0) {
    await db.insert(userAddresses).values(addresses_data).onConflictDoNothing();
  }

  console.log('✅ Database seeded successfully!');
}

seedDatabase().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
```

Run with: `tsx src/db/seed.ts`

## Test Coverage

All mock data functions are fully tested:

```bash
npm test
# ✅ 23 tests passing
```

### Coverage Includes

- ✅ Correct number of entries generated
- ✅ Unique constraints (emails, phones, slugs, clerkIds)
- ✅ Valid relationships (dishes → partners, swipes → users/dishes)
- ✅ Realistic data ranges (prices, ratings, coordinates)
- ✅ Proper distribution across entities

## Data Structure

### Dishes (25 total)
- 6 from Spice House (Indian)
- 7 from Dragon Wok (Chinese/Asian)
- 6 from Pasta Paradise (Italian)
- 6 from Burger Bliss (Fast Food)

### Prices
- Minimum: ₹100
- Maximum: ₹320
- Average: ~₹200

### Swipes
- 5-10 per user (50-100 total)
- Actions: like, skip, superlike
- Distributed across all users and dishes

### Addresses
- 1-2 per user (10-20 total)
- Labels: Home, Work
- Realistic coordinates around Bangalore

## Notes

- All timestamps use current date
- UUIDs are generated randomly
- Placeholder images use via.placeholder.com
- Phone numbers follow Indian format (+91-...)
- All data is test-safe (no real PII)
