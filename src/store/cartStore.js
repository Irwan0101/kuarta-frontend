import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      addItem: (program) => set(state => {
        const exists = state.items.find(i => i.id === program.id);
        if (exists) return state;
        return { items: [...state.items, { ...program, quantity: 1 }] };
      }),

      removeItem: (id) => set(state => ({
        items: state.items.filter(i => i.id !== id),
      })),

      clearCart: () => set({ items: [] }),

      getTotal: () => {
        const { items } = get();
        return items.reduce((sum, i) => sum + Number(i.price), 0);
      },

      getCount: () => get().items.length,
    }),
    { name: 'kuarta-cart' }
  )
);
