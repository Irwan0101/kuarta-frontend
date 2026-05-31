// src/lib/api.js
// Centralized API functions — import and call from components/pages

import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

const BASE = import.meta.env.VITE_API_URL || '/api';

/* ── axios instance ────────────────────────────────────────────────── */
const http = axios.create({ baseURL: BASE });

http.interceptors.request.use(cfg => {
  const token = useAuthStore.getState().token;
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

http.interceptors.response.use(
  r => r.data,
  async err => {
    if (err.response?.status === 401) {
      const ok = await useAuthStore.getState().refreshAccessToken();
      if (ok) {
        const token = useAuthStore.getState().token;
        err.config.headers.Authorization = `Bearer ${token}`;
        return http(err.config);
      }
      useAuthStore.getState().logout();
    }
    return Promise.reject(err.response?.data || err);
  }
);
export const authApi = {
  login:           (email, password) => http.post('/auth/login', { email, password }),
  register:        (payload)         => http.post('/auth/register', payload),
  me:              ()                => http.get('/auth/me'),
  refresh:         (refreshToken)    => http.post('/auth/refresh', { refreshToken }),
  updateProfile:   (payload)         => http.put('/auth/profile', payload),
  changePassword:  (payload)         => http.put('/auth/password', payload),

  // ── Forgot Password (OTP flow) ───────────────────────────────
  forgotPassword:  (email)                    => http.post('/auth/forgot-password', { email }),
  verifyOtp:       (email, otp)               => http.post('/auth/verify-otp', { email, otp }),
  resetPassword:   (resetToken, newPassword)  => http.post('/auth/reset-password', { resetToken, newPassword }),
};


/* ── Dashboard ────────────────────────────────────────────────────── */
export const dashboardApi = {
  getStats:       ()     => http.get('/dashboard/stats'),
  getActivity:    ()     => http.get('/dashboard/activity'),
  getLeaderboard: ()     => http.get('/dashboard/leaderboard'),
  getNotifications: ()   => http.get('/notifications'),
  markAllRead:    ()     => http.put('/notifications/read-all'),
};

/* ── Programs ─────────────────────────────────────────────────────── */
export const programsApi = {
  getAll:     ()          => http.get('/programs'),
  getOne:     (id)        => http.get(`/programs/${id}`),
  getEnrolled:()          => http.get('/programs/user/enrolled'),
  enroll:     (programId) => http.post('/programs/enroll', { programId }),
};

/* ── Tryout ───────────────────────────────────────────────────────── */
export const tryoutApi = {
  getList:      (programId) => http.get(`/tryouts?program=${programId || ''}`),
  getOne:       (id)        => http.get(`/tryouts/${id}`),
  startSession: (tryoutId)  => http.post(`/tryouts/${tryoutId}/start`),
  submitAnswer: (sessionId, questionId, answerId) =>
    http.post(`/tryouts/sessions/${sessionId}/answer`, { questionId, answerId }),
  finishSession:(sessionId) => http.post(`/tryouts/sessions/${sessionId}/finish`),
  getResult:    (sessionId) => http.get(`/tryouts/sessions/${sessionId}/result`),
  getHistory:   ()          => http.get('/tryouts/history'),
};

/* ── Materi ───────────────────────────────────────────────────────── */
export const materiApi = {
  getTopics:  (programId)  => http.get(`/materi/topics?program=${programId || ''}`),
  getOne:     (topicId)    => http.get(`/materi/topics/${topicId}`),
  markDone:   (topicId)    => http.post(`/materi/topics/${topicId}/done`),
  getVideos:  (topicId)    => http.get(`/materi/topics/${topicId}/videos`),
};

/* ── Live Class ───────────────────────────────────────────────────── */
export const liveApi = {
  getSchedule: ()          => http.get('/live/schedule'),
  getOne:      (id)        => http.get(`/live/${id}`),
  register:    (classId)   => http.post(`/live/${classId}/register`),
  getRecordings:()         => http.get('/live/recordings'),
};

/* ── Payment ──────────────────────────────────────────────────────── */
export const paymentApi = {
  createOrder:     (programId, method) =>
    http.post('/payment/create', { 
        program_id: programId, 
        paymentMethod: method 
    }),
  getStatus:       (orderId)   => http.get(`/payment/status/${orderId}`),
  getTransactions: ()          => http.get('/payment/transactions'),
  getHistory:      ()          => http.get('/payment/transactions'),
  getPaymentMethods: ()        => http.get('/payment/methods'),
};

/* ── Admin ────────────────────────────────────────────────────────── */

export const adminApi = {

  /* ── Dashboard / Stats ─────────────────────────────────────────── */
  getStats:    ()                => http.get('/admin/stats'),
  getRevenue:  (period = '6m')   => http.get('/admin/revenue', { params: { period } }),

  /* ── Users ─────────────────────────────────────────────────────── */
  getUsers:    (params)          => http.get('/admin/users', { params }),
  updateUser:  (id, payload)     => http.put(`/admin/users/${id}`, payload),
  banUser:     (id)              => http.patch(`/admin/users/${id}/ban`),
  // Shorthand helpers pakai updateUser di balik layar
  setUserPlan: (id, plan, expiresAt) =>
    http.put(`/admin/users/${id}`, { plan, plan_expires_at: expiresAt }),
  setUserActive: (id, isActive)  =>
    http.put(`/admin/users/${id}`, { is_active: isActive }),

  /* ── Programs ──────────────────────────────────────────────────── */
  getPrograms:   ()              => http.get('/admin/programs'),
  createProgram: (payload)       => http.post('/admin/programs', payload),
  updateProgram: (id, payload)   => http.put(`/admin/programs/${id}`, payload),
  deleteProgram: (id)            => http.delete(`/admin/programs/${id}`),

  /* ── Tryouts ───────────────────────────────────────────────────── */
  getTryouts:    (programId)     => http.get('/admin/tryouts', { params: { program: programId } }),
  createTryout:  (payload)       => http.post('/admin/tryouts', payload),
  updateTryout:  (id, payload)   => http.put(`/admin/tryouts/${id}`, payload),
  deleteTryout:  (id)            => http.delete(`/admin/tryouts/${id}`),

  /* ── Questions ─────────────────────────────────────────────────── */
  getQuestions:  (tryoutId)      => http.get(`/admin/tryouts/${tryoutId}/questions`),
  addQuestion:   (tryoutId, payload) =>
    http.post(`/admin/tryouts/${tryoutId}/questions`, payload),
  updateQuestion:(id, payload)   => http.put(`/admin/questions/${id}`, payload),
  deleteQuestion:(id)            => http.delete(`/admin/questions/${id}`),

  /* ── Live Classes ──────────────────────────────────────────────── */
  getLiveClasses:()              => http.get('/admin/live-classes'),
  createLiveClass:(payload)      => http.post('/admin/live-classes', payload),
  updateLiveClass:(id, payload)  => http.put(`/admin/live-classes/${id}`, payload),
  deleteLiveClass:(id)           => http.delete(`/admin/live-classes/${id}`),

  /* ── Notifications ─────────────────────────────────────────────── */
  broadcast: (payload)           => http.post('/admin/notifications/broadcast', payload),
  // payload: { title, message, type, target: 'all' | 'premium' | userId[] }

  /* ── Transactions ──────────────────────────────────────────────── */
  getTransactions:(params)       => http.get('/admin/transactions', { params }),
  // params: { status, page, limit, from, to }
  getTransactionDetail:(id)      => http.get(`/admin/transactions/${id}`),
  refundTransaction:  (id)       => http.post(`/admin/transactions/${id}/refund`),

  /* ── Materi / Topics ───────────────────────────────────────────── */
  getTopics:     (programId)     => http.get('/admin/materi/topics', { params: { program: programId } }),
  createTopic:   (payload)       => http.post('/admin/materi/topics', payload),
  updateTopic:   (id, payload)   => http.put(`/admin/materi/topics/${id}`, payload),
  deleteTopic:   (id)            => http.delete(`/admin/materi/topics/${id}`),
  getVideos:     (topicId)       => http.get(`/admin/materi/topics/${topicId}/videos`),
  addVideo:      (topicId, payload) =>
    http.post(`/admin/materi/topics/${topicId}/videos`, payload),
  deleteVideo:   (id)            => http.delete(`/admin/materi/videos/${id}`),
};
export default http;