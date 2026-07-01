// src/components/layout/Sidebar.jsx
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, GraduationCap, PlayCircle,
  ClipboardCheck, Video, Trophy,
  Wallet, UserCircle, LogOut, ChevronLeft,
  ShieldCheck, BarChart2, Users, BookMarked,
  FileText, CreditCard, Zap, Calendar, MessageCircle, Settings,
} from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useConfirm } from '@/hooks/useConfirm';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import useResponsive from '@/hooks/useResponsive';
import { Avatar } from '@/components/ui/Avatar';
import { truncate } from '@/lib/utils';

/* ── Menu definitions ─────────────────────────────────────────────── */
const USER_MENU = [
  {
    section: 'Menu Utama',
    items: [
      { to: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/program',      icon: GraduationCap,   label: 'Program Bimbel' },
      { to: '/belajar',      icon: PlayCircle,      label: 'Belajarku' },
    ],
  },
  {
    section: 'Fitur Unggulan',
    items: [
      { to: '/tryout',       icon: ClipboardCheck,  label: 'Tryout SKD/UTBK' },
      { to: '/live',         icon: Video,           label: 'Kelas Live' },
      { to: '/leaderboard',  icon: Trophy,          label: 'Leaderboard' },
    ],
  },
  {
    section: 'Akun',
    items: [
      { to: '/pembayaran',   icon: Wallet,          label: 'Pembayaran' },
      { to: '/profil',       icon: UserCircle,      label: 'Profil Saya' },
    ],
  },
];

const ADMIN_MENU = [
  {
    section: 'Admin',
    items: [
      { to: '/admin',           icon: BarChart2,   label: 'Admin Dashboard' },
      { to: '/admin/users',     icon: Users,       label: 'Kelola Pengguna' },
      { to: '/admin/programs',  icon: BookMarked,  label: 'Program & Materi' },
      { to: '/admin/tryouts',   icon: FileText,    label: 'Kelola Tryout' },
      { to: '/admin/live',      icon: Video,       label: 'Live Class' },
      { to: '/admin/payments',  icon: CreditCard,  label: 'Transaksi' },
    ],
  },
];

const MENTOR_MENU = [
  {
    section: 'Mentor',
    items: [
      { to: '/mentor/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/mentor/schedule',  icon: Calendar,       label: 'Jadwal Saya' },
      { to: '/mentor/sessions',  icon: MessageCircle,   label: 'Sesi Mentoring' },
      { to: '/mentor/students',  icon: Users,           label: 'Siswa Saya' },
      { to: '/mentor/profile',   icon: Settings,        label: 'Profil Mentor' },
    ],
  },
];

/* ── Badge color helper ───────────────────────────────────────────── */
function getBadgeStyle(color, C) {
  if (color === 'green') return { background: '#22d3a5', color: '#070709' };
  if (color === 'blue')  return { background: '#6366f1', color: '#fff' };
  return { background: C.orange, color: '#070709' };
}

/* ── Component ─────────────────────────────────────────────────────── */
export default function Sidebar() {
  const { T, C }      = useTheme();
  const { user, logout } = useAuthStore();
  const { sidebarOpen, toggleSidebar, mobileSidebarOpen, setMobileSidebar } = useUIStore();
  const { confirm, modal: confirmModal } = useConfirm();
  const location      = useLocation();
  const isAdmin       = user?.role === 'admin';
  const isMentor      = user?.role === 'mentor';
  const menuGroups    = isAdmin ? ADMIN_MENU : isMentor ? MENTOR_MENU : USER_MENU;
  const resp = useResponsive();
  const collapsed     = !sidebarOpen;

  const isMobile = resp.isMobileOrTablet;

  if (isMobile && !mobileSidebarOpen) return null;

  return (
    <>
      {/* Mobile overlay */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebar(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,.6)',
            zIndex: 39,
            backdropFilter: 'blur(4px)',
          }}
        />
      )}

      <aside style={{
        width: collapsed ? 68 : 260,
        height: '100vh',
        background: T.bg2,
        borderRight: `1px solid ${T.border}`,
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        transition: 'width .25s cubic-bezier(.4,0,.2,1)',
        overflow: 'hidden',
        position: isMobile ? 'fixed' : 'sticky',
        top: 0, left: 0,
        zIndex: isMobile ? 40 : 10,
        animation: isMobile ? 'sidebarSlide .25s ease' : undefined,
      }}>

        {/* ── Logo ── */}
        <div style={{
          padding: collapsed ? '20px 0' : '28px 24px',
          display: 'flex', alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          borderBottom: `1px solid ${T.border}`,
          minHeight: 72,
        }}>
          {!collapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 38, height: 38,
                background: C.orange,
                borderRadius: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, fontWeight: 800,
                fontFamily: 'Syne, sans-serif',
                color: '#070709',
              }}>K</div>
              <div>
                <div style={{
                  fontFamily: 'Syne, sans-serif', fontWeight: 800,
                  fontSize: 18, color: T.text,
                  letterSpacing: '-0.5px',
                }}>
                  KUARTA<span style={{ color: C.orange }}>.</span>
                </div>
                <div style={{
                  fontSize: 9, color: T.text4,
                  fontWeight: 500, letterSpacing: '0.8px',
                  textTransform: 'uppercase', marginTop: 1,
                }}>
                  Platform Bimbel No.1
                </div>
              </div>
            </div>
          )}
          {collapsed && (
            <div style={{
              width: 38, height: 38,
              background: C.orange,
              borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, fontWeight: 800,
              fontFamily: 'Syne, sans-serif',
              color: '#070709',
            }}>K</div>
          )}
          {!isMobile && !collapsed && (
            <button
              onClick={toggleSidebar}
              style={{
                background: T.bg4, border: 'none', borderRadius: 8,
                width: 26, height: 26, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: T.text4, flexShrink: 0,
              }}
            >
              <ChevronLeft size={14} />
            </button>
          )}
          {!isMobile && collapsed && (
            <button
              onClick={toggleSidebar}
              style={{
                position: 'absolute', right: -14, top: 24,
                background: T.bg2,
                border: `1px solid ${T.border2}`,
                borderRadius: '50%',
                width: 26, height: 26, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: T.text4,
              }}
            >
              <ChevronLeft size={12} style={{ transform: 'rotate(180deg)' }} />
            </button>
          )}
        </div>

        {/* ── User card ── */}
        {!collapsed && (
          <NavLink
            to="/profil"
            onClick={() => isMobile && setMobileSidebar(false)}
            style={{
              margin: '20px 16px 0',
              background: T.bg3,
              border: `1px solid ${T.border}`,
              borderRadius: 14,
              padding: '14px',
              display: 'flex', alignItems: 'center', gap: 10,
              textDecoration: 'none',
              transition: 'border-color .2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = T.border2)}
            onMouseLeave={e => (e.currentTarget.style.borderColor = T.border)}
          >
            <Avatar name={user?.name} size={36} ring />
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{
                fontWeight: 600, fontSize: 13, color: T.text,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {truncate(user?.name || 'User', 18)}
              </div>
              <div style={{ fontSize: 10, color: C.orange, fontWeight: 600, marginTop: 1 }}>
                ✦ Member Premium
              </div>
            </div>
            <ChevronLeft size={11} style={{ transform: 'rotate(180deg)', color: T.text4 }} />
          </NavLink>
        )}

        {/* ── Admin badge ── */}
        {isAdmin && !collapsed && (
          <div style={{
            margin: '12px 14px 0',
            padding: '6px 10px',
            background: C.orange + '18',
            border: `1px solid ${C.orange}30`,
            borderRadius: 8,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <ShieldCheck size={12} color={C.orange} />
            <span style={{ fontSize: 11, fontWeight: 700, color: C.orange }}>MODE ADMIN</span>
          </div>
        )}

        {/* ── Nav ── */}
        <nav style={{
          flex: 1, overflowY: 'auto',
          padding: '8px 12px',
          display: 'flex', flexDirection: 'column',
        }}>
          {menuGroups.map(({ section, items }) => (
            <div key={section}>
              {/* Section label */}
              {!collapsed && (
                <div style={{
                  fontSize: 9, fontWeight: 700,
                  letterSpacing: '1.2px', textTransform: 'uppercase',
                  color: T.text4,
                  padding: '16px 8px 8px',
                }}>
                  {section}
                </div>
              )}
              {collapsed && <div style={{ marginTop: 16 }} />}

              {/* Items */}
              {items.map(({ to, icon: Icon, label, badge, badgeColor }) => {
                const active = location.pathname === to
                  || (to !== '/dashboard' && to !== '/admin' && location.pathname.startsWith(to));
                return (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={() => isMobile && setMobileSidebar(false)}
                    title={collapsed ? label : undefined}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: collapsed ? '11px 0' : '11px 14px',
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      borderRadius: 8,
                      background: active ? C.orange + '18' : 'transparent',
                      color: active ? C.orange : T.text4,
                      fontWeight: active ? 700 : 500,
                      fontSize: 13.5,
                      transition: 'background .15s, color .15s',
                      textDecoration: 'none',
                      position: 'relative',
                      marginBottom: 2,
                    }}
                    onMouseEnter={e => !active && Object.assign(e.currentTarget.style, { background: T.bg3, color: T.text2 })}
                    onMouseLeave={e => !active && Object.assign(e.currentTarget.style, { background: 'transparent', color: T.text4 })}
                  >
                    {active && (
                      <div style={{
                        position: 'absolute', left: 0, top: '20%', bottom: '20%',
                        width: 3, background: C.orange,
                        borderRadius: '0 3px 3px 0',
                      }} />
                    )}
                    <Icon size={17} strokeWidth={active ? 2.5 : 2} style={{ flexShrink: 0 }} />
                    {!collapsed && <span style={{ flex: 1 }}>{label}</span>}
                    {!collapsed && badge != null && (
                      <span style={{
                        fontSize: 9, fontWeight: 800,
                        padding: '2px 7px', borderRadius: 20,
                        minWidth: 18, textAlign: 'center',
                        ...getBadgeStyle(badgeColor, C),
                      }}>
                        {badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        {/* ── Upgrade promo (collapsed hides text) ── */}
        {!collapsed && (
          <div style={{
            margin: '0 12px 12px',
            background: C.orange + '18',
            border: `1px solid ${C.orange}25`,
            borderRadius: 14,
            padding: 14,
            textAlign: 'center',
          }}>
            <div style={{
              fontFamily: 'Syne, sans-serif',
              fontSize: 13, color: C.orange,
              fontWeight: 700, marginBottom: 4,
            }}>
              <Zap size={13} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
              Upgrade Premium
            </div>
            <div style={{
              fontSize: 11, color: T.text3,
              lineHeight: 1.5, marginBottom: 10,
            }}>
              Akses materi eksklusif, tryout tak terbatas & mentor 1-on-1.
            </div>
            <NavLink
              to="/program"
              onClick={() => isMobile && setMobileSidebar(false)}
              style={{
                display: 'block', width: '100%', padding: '9px',
                background: C.orange,
                color: '#070709',
                fontWeight: 700, fontSize: 12,
                borderRadius: 8,
                textDecoration: 'none',
                transition: 'opacity .2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '.9')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              Lihat Paket
            </NavLink>
          </div>
        )}

        {/* ── User profile bottom strip ── */}
        <div style={{ padding: '12px 10px', borderTop: `1px solid ${T.border}` }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: collapsed ? '8px 0' : '8px 10px',
            justifyContent: collapsed ? 'center' : 'flex-start',
            borderRadius: 10, background: T.bg3,
          }}>
            <Avatar name={user?.name} size={32} ring />
            {!collapsed && (
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{
                  fontSize: 13, fontWeight: 700, color: T.text,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {truncate(user?.name || 'User', 18)}
                </div>
                <div style={{
                  fontSize: 11, color: T.text4,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {truncate(user?.email || '', 22)}
                </div>
              </div>
            )}
            {!collapsed && (
              <button
                onClick={async () => { if (await confirm('Yakin ingin keluar?')) logout(); }}
                title="Keluar"
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: T.text4, display: 'flex', padding: 4,
                }}
                onMouseEnter={e => (e.currentTarget.style.color = '#EF4444')}
                onMouseLeave={e => (e.currentTarget.style.color = T.text4)}
              >
                <LogOut size={15} />
              </button>
            )}
          </div>
        </div>
      </aside>
      {confirmModal}
    </>
  );
}