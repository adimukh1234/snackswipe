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
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const url = `${API_URL}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      credentials: 'include', // Send cookies for auth
      headers: {
        'Content-Type': 'application/json',
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

// Auth API
export const authApi = {
  sendOtp: (phone: string) =>
    fetchApi<{ success: boolean; dev_otp?: string }>('/api/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    }),

  verifyOtp: (phone: string, otp: string) =>
    fetchApi<{ success: boolean; user: User; token: string }>('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, otp }),
    }),

  getMe: () =>
    fetchApi<User>('/api/auth/me'),

  updateProfile: (data: { name?: string; email?: string }) =>
    fetchApi<{ success: boolean; user: User }>('/api/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  logout: () =>
    fetchApi<{ success: boolean }>('/api/auth/logout', {
      method: 'POST',
    }),
};

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

  swipe: (dishId: string, action: 'like' | 'skip' | 'superlike', sessionId?: string) =>
    fetchApi<{ success: boolean }>('/api/dishes/swipe', {
      method: 'POST',
      body: JSON.stringify({ dishId, action, sessionId }),
    }),

  getById: (id: string) =>
    fetchApi<Dish>(`/api/dishes/${id}`),

  getPopular: (limit?: number) =>
    fetchApi<{ dishes: Dish[] }>(`/api/dishes/popular${limit ? `?limit=${limit}` : ''}`),

  getByCategory: (category: string, limit?: number) =>
    fetchApi<{ dishes: Dish[] }>(`/api/dishes/category/${category}${limit ? `?limit=${limit}` : ''}`),
};

// Orders API
export const ordersApi = {
  create: (items: OrderItem[], deliveryAddress: DeliveryAddress) =>
    fetchApi<{ success: boolean; order: Order }>('/api/orders', {
      method: 'POST',
      body: JSON.stringify({ items, deliveryAddress }),
    }),

  getHistory: (limit?: number) =>
    fetchApi<{ orders: Order[] }>(`/api/orders/history${limit ? `?limit=${limit}` : ''}`),

  getById: (id: string) =>
    fetchApi<Order>(`/api/orders/${id}`),

  cancel: (id: string) =>
    fetchApi<{ success: boolean }>(`/api/orders/${id}/cancel`, {
      method: 'POST',
    }),

  reorder: (id: string) =>
    fetchApi<{ success: boolean }>(`/api/orders/${id}/reorder`, {
      method: 'POST',
    }),
};

// Types
export interface User {
  id: string;
  phone: string;
  name?: string;
  email?: string;
  avatarUrl?: string;
  tasteProfile?: Record<string, unknown>;
}

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
