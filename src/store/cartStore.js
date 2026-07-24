import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { cartApi } from '@/lib/api';

const CART_NAME = 'kuarta-cart';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      addItem: (program) => {
        set(state => {
          const exists = state.items.find(i => i.id === program.id);
          if (exists) return state;
          const items = [...state.items, { ...program, quantity: 1 }];
          get().syncToServer(items);
          return { items };
        });
      },

      removeItem: (id) => {
        set(state => {
          const items = state.items.filter(i => i.id !== id);
          get().syncToServer(items);
          return { items };
        });
      },

      clearCart: () => {
        set({ items: [] });
        get().syncToServer([]);
      },

      getTotal: () => {
        const { items } = get();
        return items.reduce((sum, i) => sum + Number(i.price), 0);
      },

      getCount: () => get().items.length,

      // Load cart from server (call on login / app mount)
      loadFromServer: async () => {
        try {
          const res = await cartApi.get();
          if (res?.items && Array.isArray(res.items) && res.items.length > 0) {
            const local = get().items;
            // Merge: server items + local items not in server
            const serverIds = new Set(res.items.map(i => i.id));
            const merged = [...res.items, ...local.filter(i => !serverIds.has(i.id))];
            set({ items: merged });
            get().syncToServer(merged);
          }
        } catch (_) { /* not logged in or server error */ }
      },

      // Save cart to server
      syncToServer: async (items) => {
        try {
          const data = items || get().items;
          await cartApi.save(data);
        } catch (_) { /* silently fail */ }
      },
    }),
    { name: CART_NAME }
  )
);
