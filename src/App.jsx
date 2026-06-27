import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useUIStore }   from '@/store/uiStore';
import { useTheme }     from '@/hooks/useTheme';
import Sidebar          from '@/components/layout/Sidebar';
import Topbar           from '@/components/layout/Topbar';
import PaymentModal     from '@/components/features/payment/PaymentModal';
import SuccessModal     from '@/components/features/payment/SuccessModal';

// Pages — user
import LoginPage        from './pages/LoginPage';
import Dashboard        from './pages/DashboardPage';
import Program          from './pages/ProgramPage';
import Tryout           from './pages/TryoutPage';
import TryoutSession    from './pages/TryoutSessionPage';
import TryoutResult     from './pages/TryoutResultPage';
import Payment          from './pages/PaymentPage';
import PaymentCallback  from './pages/PaymentCallback';
import BimbelkuPage     from './pages/BimbelkuPage';
import LessonDetailPage from './pages/LessonDetailPage';
import LiveClassPage    from './pages/LiveClassPage';
import LeaderboardPage  from './pages/LeaderboardPage';
import ProfilPage       from './pages/ProfilPage';
import MentorPage       from './pages/MentorPage';
import ForumPage        from './pages/ForumPage';
import CertificatesPage from './pages/CertificatesPage';

// Pages — admin
import AdminLayout        from './pages/admin/AdminLayout';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUsersPage     from './pages/admin/AdminUsersPage';
import AdminProgramsPage  from './pages/admin/AdminProgramsPage';
import AdminTryoutsPage   from './pages/admin/AdminTryoutsPage';
import AdminLivePage      from './pages/admin/AdminLivePage';
import AdminMentorsPage   from './pages/admin/AdminMentorsPage';
import AdminLandingPage   from './pages/admin/AdminLandingPage';
import AdminCouponsPage   from './pages/admin/AdminCouponsPage';
import AdminAuditLogsPage from './pages/admin/AdminAuditLogsPage';
import AdminTransactionsPage from './pages/admin/AdminTransactionsPage';
import AdminNotificationsPage from './pages/admin/AdminNotificationsPage';
import AdminMateriPage    from './pages/admin/AdminMateriPage';
import LandingPage        from './pages/LandingPage';
import ForgotPassword     from './pages/ForgotPassword';
import MentorDashboard    from './pages/MentorDashboard';
// ─── GUARDS ───────────────────────────────────────────────────────

// Redirect user yang sudah login dari halaman publik
function PublicOnly({ children }) {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn());
  const isAdmin    = useAuthStore((s) => s.isAdmin());

  if (isLoggedIn && isAdmin) return <Navigate to="/admin/dashboard" replace />;
  if (isLoggedIn)            return <Navigate to="/dashboard" replace />;
  return children;
}

// Hanya untuk user yang sudah login, redirect admin ke panel admin
function UserOnly({ children }) {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn());
  const isAdmin    = useAuthStore((s) => s.isAdmin());

  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (isAdmin)     return <Navigate to="/admin/dashboard" replace />;
  return children;
}

// Hanya untuk admin
function Protected({ children, adminOnly = false }) {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn());
  const isAdmin    = useAuthStore((s) => s.isAdmin());

  if (!isLoggedIn)           return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
}

// Hanya untuk mentor
function MentorOnly({ children }) {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn());
  const isMentor   = useAuthStore((s) => s.isMentor());
  const isAdmin    = useAuthStore((s) => s.isAdmin());

  if (!isLoggedIn)             return <Navigate to="/login" replace />;
  if (!isMentor && !isAdmin)   return <Navigate to="/dashboard" replace />;
  return children;
}

// ─── USER APP SHELL ───────────────────────────────────────────────
function AppLayout({ children }) {
  const { T } = useTheme();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: T.bg1 }}>
      <Sidebar />
      <main style={{
        flex: 1, minHeight: '100vh',
        display: 'flex', flexDirection: 'column',
        transition: 'margin-left .3s ease',
      }}>
        <Topbar />
        <div style={{ flex: 1, padding: 28, overflowY: 'auto' }}>
          {children}
        </div>
      </main>
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────
export default function App() {
  const { T } = useTheme();

  return (
    <div style={{ fontFamily: 'DM Sans, sans-serif', color: T.text2 }}>
      <Routes>

        {/* ── Public (redirect jika sudah login) ── */}
        <Route path="/"         element={<PublicOnly><LandingPage /></PublicOnly>} />
        <Route path="/login"    element={<PublicOnly><LoginPage /></PublicOnly>} />
        <Route path="/register" element={<PublicOnly><LoginPage mode="register" /></PublicOnly>} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        {/* ── User routes (non-admin only) ── */}
        <Route path="/dashboard"   element={<UserOnly><AppLayout><Dashboard /></AppLayout></UserOnly>} />
        <Route path="/tryout"              element={<UserOnly><AppLayout><Tryout /></AppLayout></UserOnly>} />
        <Route path="/tryout/:id/start"   element={<UserOnly><AppLayout><TryoutSession /></AppLayout></UserOnly>} />
        <Route path="/tryout/:id/result"  element={<UserOnly><AppLayout><TryoutResult /></AppLayout></UserOnly>} />
        <Route path="/pembayaran"         element={<UserOnly><AppLayout><Payment /></AppLayout></UserOnly>} />
        <Route path="/pembayaran/callback/:orderId" element={<UserOnly><AppLayout><PaymentCallback /></AppLayout></UserOnly>} />
        <Route path="/program"     element={<UserOnly><AppLayout><Program /></AppLayout></UserOnly>} />
        <Route path="/belajar"     element={<UserOnly><AppLayout><BimbelkuPage /></AppLayout></UserOnly>} />
        <Route path="/belajar/:id" element={<UserOnly><AppLayout><LessonDetailPage /></AppLayout></UserOnly>} />
        <Route path="/live"        element={<UserOnly><AppLayout><LiveClassPage /></AppLayout></UserOnly>} />
        <Route path="/leaderboard" element={<UserOnly><AppLayout><LeaderboardPage /></AppLayout></UserOnly>} />
        <Route path="/profil"      element={<UserOnly><AppLayout><ProfilPage /></AppLayout></UserOnly>} />
        <Route path="/forum"       element={<UserOnly><AppLayout><ForumPage /></AppLayout></UserOnly>} />
        <Route path="/sertifikat"  element={<UserOnly><AppLayout><CertificatesPage /></AppLayout></UserOnly>} />
        <Route path="/mentor"      element={<UserOnly><AppLayout><MentorPage /></AppLayout></UserOnly>} />

        {/* ── Mentor routes (mentor only) ── */}
        <Route path="/mentor/dashboard" element={<MentorOnly><AppLayout><MentorDashboard /></AppLayout></MentorOnly>} />
        <Route path="/mentor/schedule"  element={<MentorOnly><AppLayout><MentorDashboard tab="schedule" /></AppLayout></MentorOnly>} />
        <Route path="/mentor/sessions"  element={<MentorOnly><AppLayout><MentorDashboard tab="sessions" /></AppLayout></MentorOnly>} />
        <Route path="/mentor/students"  element={<MentorOnly><AppLayout><MentorDashboard tab="students" /></AppLayout></MentorOnly>} />
        <Route path="/mentor/profile"   element={<MentorOnly><AppLayout><MentorDashboard tab="profile" /></AppLayout></MentorOnly>} />

        {/* ── Admin routes (admin only, own shell) ── */}
        <Route
          path="/admin"
          element={<Protected adminOnly><AdminLayout /></Protected>}
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="users"     element={<AdminUsersPage />}     />
          <Route path="programs"  element={<AdminProgramsPage />}  />
          <Route path="tryouts"   element={<AdminTryoutsPage />}   />
          <Route path="live"      element={<AdminLivePage />}      />
          <Route path="mentors"   element={<AdminMentorsPage />}   />
          <Route path="landing"   element={<AdminLandingPage />}   />
          <Route path="coupons"   element={<AdminCouponsPage />}   />
          <Route path="audit-logs" element={<AdminAuditLogsPage />} />
          <Route path="transactions" element={<AdminTransactionsPage />} />
          <Route path="notifications" element={<AdminNotificationsPage />} />
          <Route path="materi"    element={<AdminMateriPage />}     />
        </Route>

        {/* ── Fallback ── */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>

      {/* Global modals (user only) */}
      <PaymentModal />
      <SuccessModal />
    </div>
  );
}