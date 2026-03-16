const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Types
export interface ApiError {
  error: string;
  statusCode?: number;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

// Generic fetch wrapper with error handling
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {},
  token?: string,
): Promise<ApiResponse<T>> {
  try {
    const url = `${API_URL}${endpoint}`;
    const authHeaders: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

    const response = await fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'Something went wrong' };
    }

    return { data };
  } catch (error) {
    console.error('API Error:', error);
    return { error: 'Network error. Please try again.' };
  }
}

// Dishes API
export const dishesApi = {
  getFeed: (params?: { limit?: number; category?: string; isVeg?: boolean }) => {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.category) searchParams.set('category', params.category);
    if (params?.isVeg !== undefined) searchParams.set('isVeg', params.isVeg.toString());
    
    const query = searchParams.toString();
    return fetchApi<{ dishes: Dish[]; hasMore: boolean }>(`/api/dishes/feed${query ? `?${query}` : ''}`);
  },

  swipe: (dishId: string, action: 'like' | 'skip' | 'superlike', token?: string, sessionId?: string) =>
    fetchApi<{ success: boolean }>('/api/dishes/swipe', {
      method: 'POST',
      body: JSON.stringify({ dishId, action, sessionId }),
    }, token),

  search: (q: string, limit?: number) =>
    fetchApi<{ dishes: Dish[] }>(`/api/dishes/search?q=${encodeURIComponent(q)}${limit ? `&limit=${limit}` : ''}`),

  getById: (id: string) =>
    fetchApi<Dish>(`/api/dishes/${id}`),

  getPopular: (limit?: number) =>
    fetchApi<{ dishes: Dish[] }>(`/api/dishes/popular${limit ? `?limit=${limit}` : ''}`),

  getByCategory: (category: string, limit?: number) =>
    fetchApi<{ dishes: Dish[] }>(`/api/dishes/category/${category}${limit ? `?limit=${limit}` : ''}`),
};

// Orders API
export const ordersApi = {
  create: (items: OrderItem[], deliveryAddress: DeliveryAddress, token?: string) =>
    fetchApi<{ success: boolean; order: Order }>('/api/orders', {
      method: 'POST',
      body: JSON.stringify({ items, deliveryAddress, paymentMethod: 'cod' }),
    }, token),

  getHistory: (limit: number | undefined, token?: string) =>
    fetchApi<{ orders: Order[] }>(`/api/orders/history${limit ? `?limit=${limit}` : ''}`, {}, token),

  getById: (id: string, token?: string) =>
    fetchApi<Order>(`/api/orders/${id}`, {}, token),

  cancel: (id: string, token?: string) =>
    fetchApi<{ success: boolean }>(`/api/orders/${id}/cancel`, { method: 'POST' }, token),

  reorder: (id: string, token?: string) =>
    fetchApi<{ success: boolean }>(`/api/orders/${id}/reorder`, { method: 'POST' }, token),
};

// Payments API (Razorpay)
export const paymentsApi = {
  initiate: (items: OrderItem[], deliveryAddress: DeliveryAddress, token: string) =>
    fetchApi<{
      razorpayOrderId: string;
      amount: number;
      currency: string;
      key: string;
      subtotal: number;
      deliveryFee: number;
      total: number;
    }>('/api/payments/initiate', {
      method: 'POST',
      body: JSON.stringify({ items, deliveryAddress }),
    }, token),

  verify: (
    payload: {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
      items: OrderItem[];
      deliveryAddress: DeliveryAddress;
    },
    token: string,
  ) =>
    fetchApi<{ success: boolean; order: Order }>('/api/payments/verify', {
      method: 'POST',
      body: JSON.stringify(payload),
    }, token),
};

// Types
export interface Dish {
  id: string;
  name: string;
  description?: string;
  price: string;
  videoUrl?: string;
  imageUrls?: string[];
  thumbnailUrl?: string;
  tags?: string[];
  category?: string;
  prepTimeMins?: number;
  isVeg: boolean;
  isAvailable?: boolean;
  likeCount?: number;
  orderCount?: number;
  partnerId: string;
  partnerName?: string;
  partnerRating?: string;
  partnerLogo?: string;
}

export interface OrderItem {
  dishId: string;
  quantity: number;
  notes?: string;
}

export interface DeliveryAddress {
  street: string;
  city: string;
  state?: string;
  pincode: string;
  lat?: number;
  lng?: number;
}

export interface Order {
  id: string;
  items: Array<{
    dishId: string;
    name: string;
    qty: number;
    price: number;
    notes?: string;
  }>;
  subtotal: string;
  deliveryFee: string;
  total: string;
  status: string;
  deliveryAddress?: DeliveryAddress;
  partnerName?: string;
  partnerLogo?: string;
  createdAt: string;
}
