import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

const BASE = import.meta.env.VITE_API_URL || '/api';

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
  forgotPassword:  (email)                    => http.post('/auth/forgot-password', { email }),
  verifyOtp:       (email, otp)               => http.post('/auth/verify-otp', { email, otp }),
  resetPassword:   (resetToken, newPassword)  => http.post('/auth/reset-password', { resetToken, newPassword }),
};

export const programsApi = {
  getAll:     ()          => http.get('/programs'),
  getOne:     (slug)      => http.get(`/programs/${slug}`),
  getEnrolled:()          => http.get('/programs/user/enrolled'),
  getCategories:()        => http.get('/programs/categories'),
};

export const tryoutApi = {
  getList:      (programId) => http.get('/tryout', { params: { program_id: programId } }),
  getQuestions: (id)        => http.get(`/tryout/${id}/questions`),
  submit:       (id, answers, duration_secs) => http.post(`/tryout/${id}/submit`, { answers, duration_secs }),
  getResultByTryout: (tryoutId) => http.get(`/tryout/results/by-tryout/${tryoutId}`),
  getHistory:   ()           => http.get('/tryout/results/history'),
  getLeaderboard: ()         => http.get('/tryout/leaderboard/global'),
};

export const materiApi = {
  getModules:    (programId)     => http.get(`/materi/programs/${programId}/modules`),
  getLesson:     (id)            => http.get(`/materi/lessons/${id}`),
  updateProgress:(lessonId, completed, watch_seconds) =>
    http.post(`/materi/lessons/${lessonId}/progress`, { completed, watch_seconds }),
};

export const liveApi = {
  getSchedule:    ()  => http.get('/live'),
  getRecordings:  ()  => http.get('/live/recordings'),
};

export const notifApi = {
  getAll:   ()            => http.get('/notifications'),
  markRead: (id)          => http.put(`/notifications/${id}/read`),
  markAll:  ()            => http.put('/notifications/read-all/bulk'),
};

export const paymentApi = {
  createOrder:    (programId, items) => http.post('/payment/create', items ? { items } : { program_id: programId }),
  getStatus:      (orderId) => http.get(`/payment/status/${orderId}`),
  syncStatus:     (orderId) => http.post(`/payment/sync/${orderId}`),
  syncAll:        ()        => http.post('/payment/sync-all'),
  getHistory:     ()        => http.get('/payment/history'),
  validateCoupon: (code)    => http.post('/payment/validate-coupon', { code }),
};

export const cartApi = {
  get:  ()      => http.get('/cart'),
  save: (items) => http.put('/cart', { items }),
};

export const mentorApi = {
  getAll:      ()             => http.get('/mentor'),
  getList:     ()             => http.get('/mentor'),
  getSchedule: (mentorId)     => http.get(`/mentor/${mentorId}/schedule`),
  bookSession: (payload)      => http.post('/mentor/sessions', payload),
  createSession: (mentorId, programId, date, time, topic) =>
    http.post('/mentor/sessions', { mentorId, programId, date, time, topic }),
  mySessions:  ()             => http.get('/mentor/my-sessions'),
  getMySessions: ()           => http.get('/mentor/my-sessions'),
  updateStatus:(id, status)   => http.put(`/mentor/sessions/${id}/status`, { status }),
  updateSessionStatus:(id, status) => http.put(`/mentor/sessions/${id}/status`, { status }),
  getMySchedule:  ()          => http.get('/mentor/my-schedule'),
  getStudents:    ()          => http.get('/mentor/students'),
  getMentorSessions: ()       => http.get('/mentor/sessions'),
  getProfile:     ()          => http.get('/mentor/profile'),
  updateProfile:  (payload)   => http.put('/mentor/profile', payload),
};

export const forumApi = {
  getThreads:    (programId)   => http.get(`/forum/programs/${programId}/threads`),
  getThread:     (id)          => http.get(`/forum/threads/${id}`),
  createThread:  (programId, title, content) => http.post(`/forum/programs/${programId}/threads`, { title, content }),
  replyThread:   (id, content) => http.post(`/forum/threads/${id}/reply`, { content }),
  reply:         (id, content) => http.post(`/forum/threads/${id}/reply`, { content }),
  myThreads:     ()            => http.get('/forum/my-threads'),
  getMyThreads:  ()            => http.get('/forum/my-threads'),
};

export const certificatesApi = {
  getMyCertificates: ()    => http.get('/certificates/my'),
};

export const adminApi = {
  getStats:    ()                => http.get('/admin/stats'),
  getRevenue:  (period = '6m')   => http.get('/admin/revenue', { params: { period } }),
  getUsers:    (params)          => http.get('/admin/users', { params }),
  updateUser:  (id, payload)     => http.put(`/admin/users/${id}`, payload),
  banUser:     (id)              => http.patch(`/admin/users/${id}/ban`),
  setUserPlan: (id, plan, expiresAt) =>
    http.put(`/admin/users/${id}`, { plan, plan_expires_at: expiresAt }),
  setUserActive: (id, isActive)  =>
    http.put(`/admin/users/${id}`, { is_active: isActive }),
  getPrograms:   ()              => http.get('/admin/programs'),
  createProgram: (payload)       => http.post('/admin/programs', payload),
  updateProgram: (id, payload)   => http.put(`/admin/programs/${id}`, payload),
  deleteProgram: (id)            => http.delete(`/admin/programs/${id}`),
  getTryouts:    (programId)     => http.get('/admin/tryouts', { params: { program: programId } }),
  createTryout:  (payload)       => http.post('/admin/tryouts', payload),
  updateTryout:  (id, payload)   => http.put(`/admin/tryouts/${id}`, payload),
  deleteTryout:  (id)            => http.delete(`/admin/tryouts/${id}`),
  getQuestions:  (tryoutId)      => http.get(`/admin/tryouts/${tryoutId}/questions`),
  addQuestion:   (tryoutId, payload) =>
    http.post(`/admin/tryouts/${tryoutId}/questions`, payload),
  updateQuestion:(id, payload)   => http.put(`/admin/questions/${id}`, payload),
  deleteQuestion:(id)            => http.delete(`/admin/questions/${id}`),
  getAllQuestions:(params)       => http.get('/admin/questions', { params }),
  importQuestions:(questions)    => http.post('/admin/questions/import', { questions }),
  importDocx:(file)              => { const fd = new FormData(); fd.append('file', file); return http.post('/admin/questions/import/docx', fd); },
  getQuestionGroups:()            => http.get('/admin/question-groups'),
  createQuestionGroup:(payload)   => http.post('/admin/question-groups', payload),
  updateQuestionGroup:(id, payload) => http.put(`/admin/question-groups/${id}`, payload),
  deleteQuestionGroup:(id)        => http.delete(`/admin/question-groups/${id}`),
  getTryoutQuestionLinks:(id)    => http.get(`/admin/tryouts/${id}/question-links`),
  linkQuestionsToTryout:(id, question_ids) =>
    http.post(`/admin/tryouts/${id}/questions/link`, { question_ids }),
  unlinkQuestionsFromTryout:(id, question_ids) =>
    http.delete(`/admin/tryouts/${id}/questions/link`, { data: { question_ids } }),
  getLiveClasses:()              => http.get('/admin/live-classes'),
  createLiveClass:(payload)      => http.post('/admin/live-classes', payload),
  updateLiveClass:(id, payload)  => http.put(`/admin/live-classes/${id}`, payload),
  deleteLiveClass:(id)           => http.delete(`/admin/live-classes/${id}`),
  broadcast: (payload)           => http.post('/admin/notifications/broadcast', payload),
  getTransactions:(params)       => http.get('/admin/transactions', { params }),
  getTransactionDetail:(id)      => http.get(`/admin/transactions/${id}`),
  refundTransaction:  (id)       => http.post(`/admin/transactions/${id}/refund`),
  getTopics:     (programId)     => http.get('/admin/materi/topics', { params: { program: programId } }),
  createTopic:   (payload)       => http.post('/admin/materi/topics', payload),
  updateTopic:   (id, payload)   => http.put(`/admin/materi/topics/${id}`, payload),
  deleteTopic:   (id)            => http.delete(`/admin/materi/topics/${id}`),
  getVideos:     (topicId)       => http.get(`/admin/materi/topics/${topicId}/videos`),
  addVideo:      (topicId, payload) =>
    http.post(`/admin/materi/topics/${topicId}/videos`, payload),
  updateVideo:   (id, payload) => http.put(`/admin/materi/videos/${id}`, payload),
  deleteVideo:   (id)            => http.delete(`/admin/materi/videos/${id}`),
  getMentors:    ()              => http.get('/admin/mentors'),
  updateMentor:  (id, payload)   => http.put(`/admin/mentors/${id}`, payload),
  createUser:    (payload)       => http.post('/admin/users', payload),
  getBanners:    ()              => http.get('/admin/landing/banners'),
  createBanner:  (payload)       => http.post('/admin/landing/banners', payload),
  updateBanner:  (id, payload)   => http.put(`/admin/landing/banners/${id}`, payload),
  deleteBanner:  (id)            => http.delete(`/admin/landing/banners/${id}`),
  getPromotions: ()              => http.get('/admin/landing/promotions'),
  createPromotion:(payload)      => http.post('/admin/landing/promotions', payload),
  updatePromotion:(id, payload)  => http.put(`/admin/landing/promotions/${id}`, payload),
  deletePromotion:(id)           => http.delete(`/admin/landing/promotions/${id}`),
  getSections:   ()              => http.get('/admin/landing/sections'),
  updateSection: (key, payload)  => http.put(`/admin/landing/sections/${key}`, payload),
  getSettings:   ()              => http.get('/admin/landing/settings'),
  updateSetting: (key, payload)  => http.put(`/admin/landing/settings/${key}`, payload),
  getCoupons:    ()              => http.get('/admin/coupons'),
  createCoupon:  (payload)       => http.post('/admin/coupons', payload),
  deleteCoupon:  (id)            => http.delete(`/admin/coupons/${id}`),
  getAuditLogs:  (params)        => http.get('/admin/audit-logs', { params }),
  getSecurityOverview:()          => http.get('/admin/overview'),
  getAnalyticsOverview:(period)   => http.get('/analytics/overview', { params: { period } }),
  backupDatabase:() => {
    const token = useAuthStore.getState().token;
    return axios.get(`${BASE}/admin/backup`, {
      responseType: 'blob',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }).then(r => r.data);
  },
  downloadDocxTemplate:() => {
    const token = useAuthStore.getState().token;
    return axios.get(`${BASE}/admin/questions/template/docx`, {
      responseType: 'blob',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }).then(r => r.data);
  },
};
export const publicApi = {
  getSettings:   ()          => http.get('/settings/public'),
  getCategories: ()          => http.get('/programs/categories'),
};
export default http;
