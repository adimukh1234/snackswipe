import { describe, it, expect } from 'vitest';
import {
  generateMockPartners,
  generateMockDishes,
  generateMockUsers,
  generateMockSwipes,
  generateMockAddresses,
  MOCK_PARTNERS,
  MOCK_DISHES,
  MOCK_USERS,
} from './mocks';

describe('Mock Data Factory', () => {
  describe('generateMockPartners', () => {
    it('generates 4 unique food partners', () => {
      const partners = generateMockPartners();
      expect(partners).toHaveLength(4);
      expect(partners[0]).toHaveProperty('name');
      expect(partners[0]).toHaveProperty('email');
      expect(partners[0]).toHaveProperty('slug');
    });

    it('ensures all partners have unique emails', () => {
      const partners = generateMockPartners();
      const emails = partners.map((p) => p.email);
      expect(new Set(emails).size).toBe(4);
    });

    it('ensures all partners have unique slugs', () => {
      const partners = generateMockPartners();
      const slugs = partners.map((p) => p.slug);
      expect(new Set(slugs).size).toBe(4);
    });
  });

  describe('generateMockDishes', () => {
    it('generates 25 unique dishes', () => {
      const partners = generateMockPartners();
      const dishes = generateMockDishes(partners);
      expect(dishes).toHaveLength(25);
    });

    it('distributes dishes across partners', () => {
      const partners = generateMockPartners();
      const dishes = generateMockDishes(partners);
      const partnerDishCounts = new Map<string, number>();
      dishes.forEach((dish) => {
        partnerDishCounts.set(
          dish.partnerId,
          (partnerDishCounts.get(dish.partnerId) || 0) + 1
        );
      });
      expect(partnerDishCounts.size).toBe(4);
      partnerDishCounts.forEach((count) => {
        expect(count).toBeGreaterThanOrEqual(5);
        expect(count).toBeLessThanOrEqual(8);
      });
    });

    it('each dish has required fields', () => {
      const partners = generateMockPartners();
      const dishes = generateMockDishes(partners);
      const dish = dishes[0];
      expect(dish).toHaveProperty('name');
      expect(dish).toHaveProperty('price');
      expect(dish).toHaveProperty('description');
      expect(dish).toHaveProperty('category');
      expect(dish).toHaveProperty('imageUrls');
      expect(dish).toHaveProperty('tags');
      expect(dish.price).toBeGreaterThan(0);
    });

    it('has realistic price range (100-500)', () => {
      const partners = generateMockPartners();
      const dishes = generateMockDishes(partners);
      dishes.forEach((dish) => {
        expect(parseFloat(dish.price.toString())).toBeGreaterThanOrEqual(100);
        expect(parseFloat(dish.price.toString())).toBeLessThanOrEqual(500);
      });
    });

    it('includes vegetarian and non-vegetarian options', () => {
      const partners = generateMockPartners();
      const dishes = generateMockDishes(partners);
      const vegCount = dishes.filter((d) => d.isVeg).length;
      const nonVegCount = dishes.filter((d) => !d.isVeg).length;
      expect(vegCount).toBeGreaterThan(0);
      expect(nonVegCount).toBeGreaterThan(0);
    });

    it('includes multiple categories', () => {
      const partners = generateMockPartners();
      const dishes = generateMockDishes(partners);
      const categories = new Set(dishes.map((d) => d.category));
      expect(categories.size).toBeGreaterThanOrEqual(5);
    });
  });

  describe('generateMockUsers', () => {
    it('generates 10 unique users', () => {
      const users = generateMockUsers();
      expect(users).toHaveLength(10);
    });

    it('each user has required fields', () => {
      const users = generateMockUsers();
      const user = users[0];
      expect(user).toHaveProperty('name');
      expect(user).toHaveProperty('email');
      expect(user).toHaveProperty('phone');
      expect(user).toHaveProperty('clerkId');
    });

    it('ensures all users have unique emails', () => {
      const users = generateMockUsers();
      const emails = users.map((u) => u.email);
      expect(new Set(emails).size).toBe(10);
    });

    it('ensures all users have unique phone numbers', () => {
      const users = generateMockUsers();
      const phones = users.map((u) => u.phone);
      expect(new Set(phones).size).toBe(10);
    });

    it('ensures all users have unique clerkIds', () => {
      const users = generateMockUsers();
      const clerkIds = users.map((u) => u.clerkId);
      expect(new Set(clerkIds).size).toBe(10);
    });
  });

  describe('generateMockSwipes', () => {
    it('generates 5-10 swipes per user', () => {
      const users = generateMockUsers();
      const partners = generateMockPartners();
      const dishes = generateMockDishes(partners);
      const swipes = generateMockSwipes(users, dishes);

      expect(swipes.length).toBeGreaterThanOrEqual(50);
      expect(swipes.length).toBeLessThanOrEqual(100);
    });

    it('swipes contain valid actions', () => {
      const users = generateMockUsers();
      const partners = generateMockPartners();
      const dishes = generateMockDishes(partners);
      const swipes = generateMockSwipes(users, dishes);

      swipes.forEach((swipe) => {
        expect(['like', 'skip', 'superlike']).toContain(swipe.action);
      });
    });

    it('swipes reference valid users and dishes', () => {
      const users = generateMockUsers();
      const partners = generateMockPartners();
      const dishes = generateMockDishes(partners);
      const swipes = generateMockSwipes(users, dishes);

      const userIds = new Set(users.map((u) => u.id));
      const dishIds = new Set(dishes.map((d) => d.id));

      swipes.forEach((swipe) => {
        expect(userIds.has(swipe.userId)).toBe(true);
        expect(dishIds.has(swipe.dishId)).toBe(true);
      });
    });
  });

  describe('generateMockAddresses', () => {
    it('generates 1-2 addresses per user', () => {
      const users = generateMockUsers();
      const addresses = generateMockAddresses(users);

      expect(addresses.length).toBeGreaterThanOrEqual(10);
      expect(addresses.length).toBeLessThanOrEqual(20);
    });

    it('each address has required fields', () => {
      const users = generateMockUsers();
      const addresses = generateMockAddresses(users);
      const address = addresses[0];

      expect(address).toHaveProperty('street');
      expect(address).toHaveProperty('city');
      expect(address).toHaveProperty('pincode');
      expect(address).toHaveProperty('lat');
      expect(address).toHaveProperty('lng');
    });

    it('addresses reference valid users', () => {
      const users = generateMockUsers();
      const addresses = generateMockAddresses(users);
      const userIds = new Set(users.map((u) => u.id));

      addresses.forEach((address) => {
        expect(userIds.has(address.userId)).toBe(true);
      });
    });
  });

  describe('Pre-generated constants', () => {
    it('exports MOCK_PARTNERS with 4 entries', () => {
      expect(MOCK_PARTNERS).toHaveLength(4);
    });

    it('exports MOCK_DISHES with 25 entries', () => {
      expect(MOCK_DISHES).toHaveLength(25);
    });

    it('exports MOCK_USERS with 10 entries', () => {
      expect(MOCK_USERS).toHaveLength(10);
    });
  });
});
