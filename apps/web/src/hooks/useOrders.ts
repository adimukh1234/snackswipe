import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi, Order } from '@/lib/api';

// Query keys
export const orderKeys = {
  all: ['orders'] as const,
  history: (limit?: number) => [...orderKeys.all, 'history', limit] as const,
  detail: (id: string) => [...orderKeys.all, 'detail', id] as const,
};

// Get order history
export function useOrderHistory(limit?: number) {
  return useQuery({
    queryKey: orderKeys.history(limit),
    queryFn: async () => {
      const { data, error } = await ordersApi.getHistory(limit);
      if (error) throw new Error(error);
      return data;
    },
  });
}

// Get single order
export function useOrder(id: string) {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: async () => {
      const { data, error } = await ordersApi.getById(id);
      if (error) throw new Error(error);
      return data;
    },
    enabled: !!id,
  });
}

// Cancel order mutation
export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: string) => {
      const { data, error } = await ordersApi.cancel(orderId);
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

  return useMutation({
    mutationFn: async (orderId: string) => {
      const { data, error } = await ordersApi.reorder(orderId);
      if (error) throw new Error(error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
    },
  });
}
