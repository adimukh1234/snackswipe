import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { dishesApi, Dish } from '@/lib/api';

// Query keys
export const dishKeys = {
  all: ['dishes'] as const,
  feed: (params?: { category?: string; isVeg?: boolean }) => [...dishKeys.all, 'feed', params] as const,
  popular: (limit?: number) => [...dishKeys.all, 'popular', limit] as const,
  category: (category: string, limit?: number) => [...dishKeys.all, 'category', category, limit] as const,
  detail: (id: string) => [...dishKeys.all, 'detail', id] as const,
};

// Get feed dishes
export function useFeed(params?: { limit?: number; category?: string; isVeg?: boolean }) {
  return useQuery({
    queryKey: dishKeys.feed(params),
    queryFn: async () => {
      const { data, error } = await dishesApi.getFeed(params);
      if (error) throw new Error(error);
      return data;
    },
  });
}

// Get popular dishes
export function usePopularDishes(limit?: number) {
  return useQuery({
    queryKey: dishKeys.popular(limit),
    queryFn: async () => {
      const { data, error } = await dishesApi.getPopular(limit);
      if (error) throw new Error(error);
      return data;
    },
  });
}

// Get dishes by category
export function useCategoryDishes(category: string, limit?: number) {
  return useQuery({
    queryKey: dishKeys.category(category, limit),
    queryFn: async () => {
      const { data, error } = await dishesApi.getByCategory(category, limit);
      if (error) throw new Error(error);
      return data;
    },
    enabled: !!category,
  });
}

// Get single dish
export function useDish(id: string) {
  return useQuery({
    queryKey: dishKeys.detail(id),
    queryFn: async () => {
      const { data, error } = await dishesApi.getById(id);
      if (error) throw new Error(error);
      return data;
    },
    enabled: !!id,
  });
}

// Swipe mutation
export function useSwipe() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async ({
      dishId,
      action,
      sessionId,
    }: {
      dishId: string;
      action: 'like' | 'skip' | 'superlike';
      sessionId?: string;
    }) => {
      const token = await getToken();
      const { data, error } = await dishesApi.swipe(dishId, action, token ?? undefined, sessionId);
      if (error) throw new Error(error);
      return data;
    },
    onSuccess: () => {
      // Invalidate feed to refresh after swipe
      queryClient.invalidateQueries({ queryKey: dishKeys.all });
    },
    onError: (error) => {
      // Log error but don't block UX - cart still works
      console.error('Swipe tracking failed:', error.message);
    },
  });
}
