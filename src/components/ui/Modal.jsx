import { X } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

export const Modal = ({ open, onClose, title, icon, children, width = 480 }) => {
  const { T } = useTheme();
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
        borderRadius: 20, width: '100%', maxWidth: width,
        maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 24px 80px rgba(0,0,0,.6)',
        animation: 'modalIn .25s ease',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px', borderBottom: `1px solid ${T.border}`,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          {icon && <span style={{ fontSize: 26 }}>{icon}</span>}
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 17, color: T.text, flex: 1 }}>
            {title}
          </span>
          <button
            onClick={onClose}
            style={{
              width: 30, height: 30, background: T.bg4, border: 'none',
              borderRadius: 8, cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center', color: T.text4,
              transition: 'background .2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.15)')}
            onMouseLeave={e => (e.currentTarget.style.background = T.bg4)}
          >
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 24px' }}>{children}</div>
      </div>
    </div>
  );
};