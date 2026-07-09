// src/store/authStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || '/api';

export const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            refreshToken: null,
            loading: false,
            error: null,
            isLoggedIn: () => !!get().token,
            isAdmin: () => get().user?.role === 'admin' || get().user?.isAdmin === true,
            isMentor: () => get().user?.role === 'mentor',

            /* ── Actions ─────────────────────────────────────────────────── */

            login: async (email, password) => {
                set({ loading: true, error: null });
                try {
                    const { data } = await axios.post(`${BASE}/auth/login`, { email, password });
                    set({
                        user: data.user,
                        token: data.token,
                        refreshToken: data.refreshToken,
                        loading: false,
                    });
                    return { ok: true };
                } catch (err) {
                    const msg = err.response?.data?.message || 'Login gagal. Coba lagi.';
                    set({ loading: false, error: msg });
                    return { ok: false, message: msg };
                }
            },

            register: async (payload) => {
                set({ loading: true, error: null });
                try {
                    const { data } = await axios.post(`${BASE}/auth/register`, payload);
                    set({ user: data.user, token: data.token, loading: false });
                    return { ok: true };
                } catch (err) {
                    const msg = err.response?.data?.message || 'Registrasi gagal.';
                    set({ loading: false, error: msg });
                    return { ok: false, message: msg };
                }
            },

            googleLogin: async (credential) => {
                set({ loading: true, error: null });
                try {
                    const { data } = await axios.post(`${BASE}/auth/google`, { credential });
                    set({ user: data.user, token: data.token, refreshToken: data.refreshToken, loading: false });
                    return { ok: true, user: data.user };
                } catch (err) {
                    const msg = err.response?.data?.error || 'Gagal login dengan Google.';
                    set({ loading: false, error: msg });
                    return { ok: false, message: msg };
                }
            },

            logout: () => set({ user: null, token: null, refreshToken: null }),

            updateUser: (patch) => set(s => ({ user: { ...s.user, ...patch } })),
            setUser: (userData) => set({ user: userData }),

            refreshAccessToken: async () => {
                const { refreshToken } = get();
                if (!refreshToken) return false;
                try {
                    const { data } = await axios.post(`${BASE}/auth/refresh`, { refreshToken });
                    set({ token: data.token });
                    return true;
                } catch {
                    set({ user: null, token: null, refreshToken: null });
                    return false;
                }
            },
        }),
        { name: 'kuarta-auth', partialize: s => ({ user: s.user, token: s.token, refreshToken: s.refreshToken }) }
    )
);