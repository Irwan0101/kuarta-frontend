import { useEffect, useState } from 'react';
import { Bell, CheckCheck, X, FileText, CreditCard, Video, Info } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useUIStore } from '@/store/uiStore';
import { notifApi } from '@/lib/api';
import { timeAgo } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

const ICON_MAP = { tryout: FileText, payment: CreditCard, live: Video, info: Info };

export default function NotifPanel() {
  const { T, C } = useTheme();
  const { closeNotif, setUnreadCount } = useUIStore();
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    notifApi.getAll()
      .then(res => {
        const list = Array.isArray(res) ? res : res?.notifications || [];
        setNotifs(list);
        setUnreadCount(list.filter(n => !n.is_read).length);
      })
      .catch(() => setNotifs([]))
      .finally(() => setLoading(false));
  }, []);

  const unread = notifs.filter(n => !n.is_read).length;

  const markAll = async () => {
    await notifApi.markAll().catch(() => {});
    setNotifs(n => n.map(x => ({ ...x, is_read: true })));
    setUnreadCount(0);
  };

  const dismiss = async (id) => {
    await notifApi.markRead(id).catch(() => {});
    setNotifs(n => n.filter(x => x.id !== id));
    setUnreadCount(Math.max(0, unread - 1));
  };

  useEffect(() => {
    const handler = (e) => {
      if (!e.target.closest('[data-notif-panel]')) closeNotif();
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [closeNotif]);

  // Debug: log rendering
  console.log('[NotifPanel] rendering', { loading, notifsLength: notifs.length });

  return (
    <div data-notif-panel style={{
      position: 'absolute', top: '100%', right: 0, marginTop: 8,
      width: 360, maxHeight: 480, overflowY: 'auto',
      background: T.bg2, borderRadius: 16, border: `1px solid ${T.border}`,
      boxShadow: '0 20px 60px rgba(0,0,0,.5)', zIndex: 999,
    }}>
      <div style={{
        position: 'sticky', top: 0, zIndex: 1,
        background: T.bg2, backdropFilter: 'blur(12px)',
        padding: '14px 16px', borderBottom: `1px solid ${T.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Bell size={14} color={C.orange} />
          <span style={{ fontWeight: 700, fontSize: 13, color: T.text }}>Notifikasi</span>
          {unread > 0 && <span style={{ background: C.orange, color: '#fff', borderRadius: 99, padding: '2px 7px', fontSize: 10, fontWeight: 700 }}>{unread}</span>}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {unread > 0 && (
            <button onClick={markAll} style={{ background: 'none', border: 'none', color: C.orange, fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
              <CheckCheck size={13} /> Baca Semua
            </button>
          )}
          <button onClick={closeNotif} style={{ background: 'none', border: 'none', color: T.text4, cursor: 'pointer' }}>
            <X size={14} />
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: 16, textAlign: 'center', color: T.text4, fontSize: 12 }}>
          <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
        </div>
      ) : notifs.length === 0 ? (
        <div style={{ padding: '40px 16px', textAlign: 'center', color: T.text4, fontSize: 13 }}>
          Tidak ada notifikasi
        </div>
      ) : (
        notifs.map(n => (
          <div key={n.id || n._id} style={{
            padding: '12px 16px', borderBottom: `1px solid ${T.border}`,
            background: !n.is_read ? C.orange + '08' : 'transparent',
            display: 'flex', gap: 10, cursor: 'default',
            transition: 'background .15s',
          }}>
            <div style={{ flexShrink: 0, marginTop: 2 }}>
              {(() => {
                const Icon = ICON_MAP[n.type] || Info;
                return <Icon size={16} color={C.orange} />;
              })()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 2 }}>{n.title}</div>
              <div style={{ fontSize: 11, color: T.text3, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{n.body || n.message}</div>
              <div style={{ fontSize: 10, color: T.text4, marginTop: 4 }}>
                {timeAgo(new Date(n.created_at || n.time))}
              </div>
            </div>
            <button onClick={() => dismiss(n.id || n._id)} style={{ background: 'none', border: 'none', color: T.text4, cursor: 'pointer', padding: 2, flexShrink: 0, opacity: .5 }}>
              <X size={12} />
            </button>
          </div>
        ))
      )}
    </div>
  );
}
