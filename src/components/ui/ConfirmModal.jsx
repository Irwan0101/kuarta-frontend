import { AlertTriangle, X } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

const RED = '#EF4444';

export default function ConfirmModal({ open, onClose, onConfirm, title, message, confirmLabel, confirmColor, icon }) {
  const { T, C } = useTheme();
  if (!open) return null;

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose?.()}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, backdropFilter: 'blur(6px)', padding: 16,
      }}
    >
      <div style={{
        background: T.bg2, border: `1px solid ${T.border2}`,
        borderRadius: 20, width: '100%', maxWidth: 380,
        boxShadow: '0 24px 80px rgba(0,0,0,.6)',
        animation: 'modalIn .25s ease',
        overflow: 'hidden',
      }}>
        <div style={{ padding: '28px 24px 20px', textAlign: 'center' }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            background: (confirmColor || RED) + '18',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 14px',
          }}>
            {icon || <AlertTriangle size={22} color={confirmColor || RED} />}
          </div>
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, margin: '0 0 6px', color: T.text }}>
            {title || 'Konfirmasi'}
          </h3>
          <p style={{ fontSize: 13, lineHeight: 1.5, margin: '0 0 22px', color: T.text3 }}>
            {message || 'Yakin melanjutkan?'}
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button onClick={onClose} style={{
              padding: '10px 20px', borderRadius: 10, border: `1px solid ${T.border}`,
              background: T.bg3, color: T.text3, fontWeight: 600, fontSize: 13,
              cursor: 'pointer', fontFamily: 'inherit',
            }}>Batal</button>
            <button
              onClick={() => { onConfirm?.(); onClose?.(); }}
              style={{
                padding: '10px 22px', borderRadius: 10, border: 'none',
                background: confirmColor || RED, color: '#fff', fontWeight: 700, fontSize: 13,
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              {confirmLabel || 'Ya, Hapus'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
