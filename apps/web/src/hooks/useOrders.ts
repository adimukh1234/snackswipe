import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { ordersApi } from '@/lib/api';

// Query keys
export const orderKeys = {
  all: ['orders'] as const,
  history: (limit?: number) => [...orderKeys.all, 'history', limit] as const,
  detail: (id: string) => [...orderKeys.all, 'detail', id] as const,
};

// Get order history
export function useOrderHistory(limit?: number) {
  const { getToken, isSignedIn } = useAuth();
  return useQuery({
    queryKey: orderKeys.history(limit),
    queryFn: async () => {
      const token = await getToken();
      const { data, error } = await ordersApi.getHistory(limit, token ?? undefined);
      if (error) throw new Error(error);
      return data;
    },
    enabled: !!isSignedIn,
  });
}

// Get single order
export function useOrder(id: string) {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: async () => {
      const token = await getToken();
      const { data, error } = await ordersApi.getById(id, token ?? undefined);
      if (error) throw new Error(error);
      return data;
    },
    enabled: !!id,
  });
}

// Cancel order mutation
export function useCancelOrder() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (orderId: string) => {
      const token = await getToken();
      const { data, error } = await ordersApi.cancel(orderId, token ?? undefined);
      if (error) throw new Error(error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
    },
  });
}

// Reorder mutation
export function useReorder() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (orderId: string) => {
      const token = await getToken();
      const { data, error } = await ordersApi.reorder(orderId, token ?? undefined);
      if (error) throw new Error(error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
    },
  });
}
