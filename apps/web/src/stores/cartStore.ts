import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  dishId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
  partnerName: string;
  partnerId: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => { replaced: boolean };
  removeItem: (dishId: string) => void;
  updateQuantity: (dishId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
  getPartnerId: () => string | null;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (item) => {
        let replaced = false;
        set((state) => {
          // If cart has items from a different partner, clear it first
          const existingPartnerId = state.items[0]?.partnerId;
          if (existingPartnerId && existingPartnerId !== item.partnerId) {
            replaced = true;
            return { items: [{ ...item, quantity: 1 }] };
          }
          const existingItem = state.items.find(i => i.dishId === item.dishId);
          if (existingItem) {
            return {
              items: state.items.map(i =>
                i.dishId === item.dishId
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity: 1 }] };
        });
        return { replaced };
      },
      
      removeItem: (dishId) => {
        set((state) => ({
          items: state.items.filter(i => i.dishId !== dishId),
        }));
      },
      
      updateQuantity: (dishId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(dishId);
          return;
        }
        set((state) => ({
          items: state.items.map(i =>
            i.dishId === dishId ? { ...i, quantity } : i
          ),
        }));
      },
      
      clearCart: () => set({ items: [] }),

      getTotal: () => {
        return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      },

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      getPartnerId: () => {
        return get().items[0]?.partnerId ?? null;
      },
    }),
    {
      name: 'crave-cart',
    }
  )
);
