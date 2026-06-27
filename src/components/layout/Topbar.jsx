// src/components/layout/Topbar.jsx
import { useState, useEffect } from 'react';
import { Bell, Search, Sun, Moon, Menu, X, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/hooks/useTheme';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { notifApi } from '@/lib/api';
import { Avatar } from '@/components/ui/Avatar';
import NotifPanel from './NotifPanel';
import CartDrawer from '@/components/features/CartDrawer';

export default function Topbar({ title, breadcrumb }) {
    const { T, C, dark, toggleTheme } = useTheme();
    const { toggleNotif, notifOpen, unreadCount, setMobileSidebar } = useUIStore();
    const { user } = useAuthStore();
    const { getCount } = useCartStore();
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [searchOpen, setSearchOpen] = useState(false);
    const [cartOpen, setCartOpen] = useState(false);
    const cartCount = getCount();

    useEffect(() => {
        notifApi.getAll().then(res => {
            const list = Array.isArray(res) ? res : res?.notifications || [];
            setUnreadCount(list.filter(n => !n.is_read).length);
        }).catch(() => {});
    }, []);

    return (
        <header style={{
            height: 62,
            background: T.bg2,
            borderBottom: `1px solid ${T.border}`,
            display: 'flex', alignItems: 'center',
            padding: '36px 20px', gap: 12,
            position: 'sticky', top: 0, zIndex: 20,
            flexShrink: 0,
        }}>
            {/* Mobile hamburger */}
            <button
                onClick={() => setMobileSidebar(true)}
                className="mobile-menu-btn"
                style={{
                    display: 'none', // overridden by media query via class
                    background: T.bg4, border: 'none', borderRadius: 8,
                    width: 34, height: 34, cursor: 'pointer',
                    alignItems: 'center', justifyContent: 'center',
                    color: T.text3,
                }}
            >
                <Menu size={18} />
            </button>

            {/* Title / breadcrumb */}
            <div style={{ flex: 1 }}>
                {breadcrumb ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: T.text4 }}>
                        {breadcrumb.map((b, i) => (
                            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                {i > 0 && <span>/</span>}
                                <span
                                    style={{ cursor: b.to ? 'pointer' : 'default', color: b.to ? T.text3 : T.text, fontWeight: b.to ? 400 : 700 }}
                                    onClick={() => b.to && navigate(b.to)}
                                >{b.label}</span>
                            </span>
                        ))}
                    </div>
                ) : (
                    <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, color: T.text }}>
                        {title}
                    </span>
                )}
            </div>

            {/* Search bar */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: T.bg3, border: `1px solid ${T.border}`,
                borderRadius: 10, padding: '7px 12px',
                width: searchOpen ? 220 : 160,
                transition: 'border-color .2s, width .25s ease' // Combined into one line

            }}
                onFocus={() => setSearchOpen(true)}
                onBlur={() => setSearchOpen(false)}
            >
                <Search size={14} color={T.text4} />
                <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Cari..."
                    style={{
                        background: 'none', border: 'none', outline: 'none',
                        color: T.text, fontSize: 13, flex: 1, padding: 0,
                    }}
                />
                {search && (
                    <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.text4, display: 'flex' }}>
                        <X size={12} />
                    </button>
                )}
            </div>

            {/* Cart */}
            <div style={{ position: 'relative' }}>
                <button
                    onClick={() => setCartOpen(o => !o)}
                    style={{
                        width: 34, height: 34, background: cartOpen ? C.orange + '18' : T.bg4,
                        border: `1px solid ${cartOpen ? C.orange + '40' : T.border}`,
                        borderRadius: 8, cursor: 'pointer', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        color: cartOpen ? C.orange : T.text3, flexShrink: 0,
                    }}
                >
                    <ShoppingCart size={16} />
                    {cartCount > 0 && <span style={{
                        position: 'absolute', top: -4, right: -4,
                        minWidth: 16, height: 16, borderRadius: 8,
                        background: C.orange, color: '#fff', fontSize: 9,
                        fontWeight: 700, display: 'flex', alignItems: 'center',
                        justifyContent: 'center', padding: '0 4px',
                        border: `1.5px solid ${T.bg2}`,
                    }}>{cartCount}</span>}
                </button>
            </div>

            {/* Theme toggle */}
            <button
                onClick={toggleTheme}
                title={dark ? 'Light mode' : 'Dark mode'}
                style={{
                    width: 34, height: 34, background: T.bg4, border: 'none',
                    borderRadius: 8, cursor: 'pointer', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    color: T.text3, transition: 'background .2s',
                    flexShrink: 0,
                }}
                onMouseEnter={e => (e.currentTarget.style.background = T.bg5)}
                onMouseLeave={e => (e.currentTarget.style.background = T.bg4)}
            >
                {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* Notifications */}
            <div style={{ position: 'relative' }}>
                <button
                    onClick={toggleNotif}
                    style={{
                        width: 34, height: 34, background: notifOpen ? C.orange + '18' : T.bg4,
                        border: `1px solid ${notifOpen ? C.orange + '40' : T.border}`,
                        borderRadius: 8, cursor: 'pointer', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        color: notifOpen ? C.orange : T.text3, transition: 'background .2s',
                        position: 'relative', flexShrink: 0,
                    }}
                >
                    <Bell size={16} />
                    {unreadCount > 0 && <span style={{
                        position: 'absolute', top: -2, right: -2,
                        minWidth: 16, height: 16, borderRadius: 8,
                        background: '#EF4444', color: '#fff', fontSize: 9,
                        fontWeight: 700, display: 'flex', alignItems: 'center',
                        justifyContent: 'center', padding: '0 4px',
                        border: `1.5px solid ${T.bg2}`,
                    }}>{unreadCount > 99 ? '99+' : unreadCount}</span>}
                </button>
                {notifOpen && <NotifPanel />}
            </div>

            {/* Avatar */}
            <Avatar name={user?.name} size={34} ring />

            {/* Cart Drawer */}
            <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
        </header>
    );
}