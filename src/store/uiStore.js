// src/store/uiStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useUIStore = create(
  persist(
    (set) => ({
      /* Theme */
      dark: true,
      toggleTheme: () => set(s => ({ dark: !s.dark })),

      /* Sidebar */
      sidebarOpen: true,
      toggleSidebar: () => set(s => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebarOpen: (v) => set({ sidebarOpen: v }),

      /* Mobile sidebar */
      mobileSidebarOpen: false,
      setMobileSidebar: (v) => set({ mobileSidebarOpen: v }),

      /* Payment modal */
      paymentData: null,
      openPayment:  (data) => set({ paymentData: data }),
      closePayment: ()     => set({ paymentData: null }),

      /* Success modal */
      successData: null,
      openSuccess:  (data) => set({ successData: data }),
      closeSuccess: ()     => set({ successData: null }),

      /* Notifications panel */
      notifOpen: false,
      unreadCount: 0,
      toggleNotif: () => set(s => ({ notifOpen: !s.notifOpen })),
      closeNotif: () => set({ notifOpen: false }),
      setUnreadCount: (v) => set({ unreadCount: v }),

      /* Global loading overlay */
      globalLoading: false,
      setGlobalLoading: (v) => set({ globalLoading: v }),
    }),
    { name: 'kuarta-ui', partialize: s => ({ dark: s.dark, sidebarOpen: s.sidebarOpen }) }
  )
);