// src/components/layout/NotifPanel.jsx
import { useEffect, useState } from 'react';
import { Bell, CheckCheck, X } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useUIStore } from '@/store/uiStore';
import { dashboardApi } from '@/lib/api';
import { timeAgo } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Badge';

const MOCK_NOTIFS = [
  { id: 1, type: 'tryout', title: 'Hasil Tryout TWK Tersedia', body: 'Nilai kamu: 85/100. Peringkat #12 dari 340 peserta.', time: new Date(Date.now() - 1800000), read: false },
  { id: 2, type: 'payment', title: 'Pembayaran Berhasil', body: 'Program SKD Intensif aktif hingga 31 Des 2025.', time: new Date(Date.now() - 3600000 * 3), read: false },
  { id: 3, type: 'live', title: 'Live Class Dimulai', body: 'Kelas TIU Matematika dasar dimulai dalam 30 menit.', time: new Date(Date.now() - 3600000 * 8), read: true },
  { id: 4, type: 'info', title: 'Materi Baru Ditambahkan', body: 'Modul TKP Integritas Nasional kini tersedia.', time: new Date(Date.now() - 86400000), read: true },
];

const ICONS = { tryout: '📝', payment: '💳', live: '🎥', info: 'ℹ️' };

export default function NotifPanel() {
  const { T, C } = useTheme();
  const { closeNotif } = useUIStore();
  const [notifs, setNotifs] = useState(MOCK_NOTIFS);
  const unread = notifs.filter(n => !n.read).length;

  const markAll = () => setNotifs(n => n.map(x => ({ ...x, read: true })));
  const dismiss = (id) => setNotifs(n => n.filter(x => x.id !== id));

  useEffect(() => {
    const handler = (e) => {
      if (!e.target.closest('[data-notif-panel]')) closeNotif();
    };
    setTimeout(() => document.addEventListener('click', handler), 100);
    return () => document.removeEventListener('click', handler);
  }, [closeNotif]);

  return (
    <div
      data-notif-panel
      style={{
        position: 'absolute', top: 'calc(100% + 8px)', right: 0,
        width: 340, maxHeight: 460,
        background: T.bg2, border: `1px solid ${T.border2}`,
        borderRadius: 16, boxShadow: '0 16px 60px rgba(0,0,0,.5)',
        animation: 'fadeDown .2s ease',
        display: 'flex', flexDirection: 'column',
        zIndex: 100,
      }}
    >
      {/* Header */}
      <div style={{ padding: '14px 16px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Bell size={15} color={C.orange} />
        <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14, color: T.text, flex: 1 }}>
          Notifikasi
        </span>
        {unread > 0 && (
          <span style={{ background: C.orange, color: '#fff', fontSize: 10, fontWeight: 800, borderRadius: 99, padding: '2px 7px' }}>
            {unread} baru
          </span>
        )}
        <button onClick={markAll} title="Tandai semua dibaca" style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.text4, display: 'flex' }}>
          <CheckCheck size={14} />
        </button>
      </div>

      {/* List */}
      <div style={{ overflowY: 'auto', flex: 1 }}>
        {notifs.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', color: T.text4, fontSize: 13 }}>
            <Bell size={28} style={{ margin: '0 auto 8px', opacity: .4 }} />
            Tidak ada notifikasi
          </div>
        ) : notifs.map(n => (
          <div
            key={n.id}
            style={{
              padding: '12px 16px', display: 'flex', gap: 10,
              borderBottom: `1px solid ${T.border}`,
              background: n.read ? 'transparent' : C.orange + '08',
              transition: 'background .15s',
            }}
          >
            <div style={{
              width: 34, height: 34, background: T.bg3, borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, flexShrink: 0,
            }}>
              {ICONS[n.type] || '🔔'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: n.read ? 500 : 700, color: T.text, marginBottom: 2 }}>
                {n.title}
              </div>
              <div style={{ fontSize: 11, color: T.text3, lineHeight: 1.5, marginBottom: 4 }}>{n.body}</div>
              <div style={{ fontSize: 10, color: T.text4 }}>{timeAgo(n.time)}</div>
            </div>
            <button
              onClick={() => dismiss(n.id)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.text4, flexShrink: 0, alignSelf: 'flex-start', padding: 2 }}
            >
              <X size={12} />
            </button>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ padding: '10px 16px', borderTop: `1px solid ${T.border}`, textAlign: 'center' }}>
        <span style={{ fontSize: 12, color: C.orange, cursor: 'pointer', fontWeight: 600 }}>
          Lihat semua notifikasi
        </span>
      </div>
    </div>
  );
}