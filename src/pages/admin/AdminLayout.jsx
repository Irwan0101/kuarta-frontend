// src/pages/admin/AdminLayout.jsx
import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/store/authStore';
import { useConfirm } from '@/hooks/useConfirm';
import {
  LayoutDashboard, Users, BookOpen, FileText, Video,
  LogOut, Menu, X, ChevronRight, Shield,
  GraduationCap, Layout, Tag, CreditCard, Bell, ScrollText, Library,
  Moon, Sun,
} from 'lucide-react';

const NAV = [
  { to: '/admin/dashboard',     icon: LayoutDashboard,   label: 'Dashboard'      },
  { to: '/admin/users',         icon: Users,             label: 'Users'          },
  { to: '/admin/programs',      icon: BookOpen,          label: 'Programs'       },
  { to: '/admin/tryouts',       icon: FileText,          label: 'Tryouts'        },
  { to: '/admin/live',          icon: Video,             label: 'Live Class'     },
  { to: '/admin/materi',        icon: Library,           label: 'Materi'         },
  { to: '/admin/mentors',       icon: GraduationCap,     label: 'Mentors'        },
  { to: '/admin/transactions',  icon: CreditCard,        label: 'Transaksi'      },
  { to: '/admin/coupons',       icon: Tag,               label: 'Kupon'          },
  { to: '/admin/landing',       icon: Layout,            label: 'Landing Page'   },
  { to: '/admin/notifications', icon: Bell,              label: 'Notifikasi'     },
  { to: '/admin/audit-logs',    icon: ScrollText,        label: 'Audit Log'      },
];

const ORG = '#FF6B00';

export default function AdminLayout() {
  const { T, C, dark, toggleTheme } = useTheme();
  const { user, logout } = useAuthStore();
  const { confirm, modal: confirmModal } = useConfirm();
  const navigate         = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const W = collapsed ? 64 : 220;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: T.bg }}>
      {/* Sidebar */}
      <aside style={{
        width: W, flexShrink: 0, background: T.bg2,
        borderRight: `1px solid ${T.border}`,
        display: 'flex', flexDirection: 'column',
        transition: 'width .2s', overflow: 'hidden',
        position: 'sticky', top: 0, height: '100vh',
      }}>
        {/* Logo */}
        <div style={{ padding: '18px 16px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 10, minHeight: 64 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: ORG, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Shield size={16} color="#fff" />
          </div>
          {!collapsed && (
            <div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 14, color: T.text }}>Kuarta</div>
              <div style={{ fontSize: 10, color: ORG, fontWeight: 700, letterSpacing: '0.06em' }}>ADMIN PANEL</div>
            </div>
          )}
          <button
            onClick={() => setCollapsed(c => !c)}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: T.text4, display: 'flex' }}
          >
            {collapsed ? <Menu size={16} /> : <X size={16} />}
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to} to={to}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 9, textDecoration: 'none',
                background: isActive ? ORG + '18' : 'transparent',
                color:      isActive ? ORG        : T.text3,
                fontWeight: isActive ? 700        : 400,
                fontSize: 13, transition: 'background .15s',
                whiteSpace: 'nowrap', overflow: 'hidden',
              })}
            >
              <Icon size={17} style={{ flexShrink: 0 }} />
              {!collapsed && label}
            </NavLink>
          ))}
        </nav>

        {/* User + logout */}
          <div style={{ padding: '12px 8px', borderTop: `1px solid ${T.border}`, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {!collapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: ORG + '25', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: ORG, flexShrink: 0 }}>
                {(user?.name || 'AD').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: T.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name || 'Admin'}</div>
                <div style={{ fontSize: 10, color: T.text4 }}>Administrator</div>
              </div>
            </div>
          )}
            <button
              onClick={toggleTheme}
              title={dark ? 'Mode Terang' : 'Mode Gelap'}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                padding: '9px 12px', borderRadius: 9,
                background: 'transparent', border: 'none', cursor: 'pointer',
                color: T.text3, fontSize: 13, transition: 'background .15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = T.bg3}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {dark ? <Sun size={15} /> : <Moon size={15} />}
              {!collapsed && (dark ? ' Mode Terang' : ' Mode Gelap')}
            </button>
            <button
              onClick={async () => { if (await confirm('Yakin ingin keluar?')) { logout(); navigate('/login'); } }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                padding: '9px 12px', borderRadius: 9,
                background: 'transparent', border: 'none', cursor: 'pointer',
                color: '#EF4444', fontSize: 13, transition: 'background .15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = T.bg3}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <LogOut size={15} />
              {!collapsed && ' Keluar'}
            </button>
          {confirmModal}
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, minWidth: 0, padding: '28px 32px', overflowY: 'auto' }}>
        <Outlet />
      </main>
    </div>
  );
}