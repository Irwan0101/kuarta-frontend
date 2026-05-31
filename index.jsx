import { useTheme } from '@/hooks/useTheme';
import { initials } from '@/utils/helpers';

// ─── AVATAR ───────────────────────────────────────────────────────
export const Avatar = ({ name = '', gradient, size = 36, style }) => {
  const def = 'linear-gradient(135deg,#f97316,#ec4899)';
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: gradient || def,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 700, fontSize: size * 0.36, color: '#fff', flexShrink: 0,
      ...style,
    }}>
      {initials(name)}
    </div>
  );
};

// ─── BADGE ────────────────────────────────────────────────────────
const BADGE_STYLES = {
  popular:  { bg: '#f97316',                  color: '#0a0a0f' },
  new:      { bg: '#22d3a5',                  color: '#0a0a0f' },
  hot:      { bg: '#ec4899',                  color: '#fff'    },
  success:  { bg: 'rgba(34,211,165,0.15)',    color: '#22d3a5', border: '1px solid #22d3a544' },
  pending:  { bg: 'rgba(249,115,22,0.15)',    color: '#f97316', border: '1px solid #f9731644' },
  failed:   { bg: 'rgba(239,68,68,0.15)',     color: '#ef4444', border: '1px solid #ef444444' },
  free:     { bg: 'rgba(96,96,122,0.2)',      color: '#a0a0b0' },
  live:     { bg: 'rgba(239,68,68,0.15)',     color: '#ef4444' },
  premium:  { bg: 'rgba(249,115,22,0.15)',    color: '#f97316' },
  blue:     { bg: 'rgba(99,102,241,0.15)',    color: '#6366f1' },
};

export const Badge = ({ type = 'free', children, style }) => {
  const s = BADGE_STYLES[type] || BADGE_STYLES.free;
  return (
    <span style={{
      background: s.bg, color: s.color, border: s.border,
      fontSize: 9, fontWeight: 800, padding: '3px 10px',
      borderRadius: 20, display: 'inline-block',
      letterSpacing: 0.5, textTransform: 'uppercase', whiteSpace: 'nowrap',
      ...style,
    }}>
      {children}
    </span>
  );
};

// ─── PROGRESS BAR ─────────────────────────────────────────────────
export const ProgBar = ({ pct, color = '#f97316', height = 4, style }) => (
  <div style={{ height, background: 'rgba(255,255,255,0.08)', borderRadius: height, overflow: 'hidden', ...style }}>
    <div style={{
      width: `${Math.min(Math.max(pct || 0, 0), 100)}%`,
      height: '100%', background: color, borderRadius: height,
      transition: 'width .5s ease',
    }} />
  </div>
);

// ─── SPINNER ──────────────────────────────────────────────────────
export const Spinner = ({ size = 20, color = '#f97316', style }) => (
  <div style={{
    width: size, height: size,
    border: `2px solid ${color}33`,
    borderTopColor: color,
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
    flexShrink: 0, ...style,
  }} />
);

// ─── CARD ─────────────────────────────────────────────────────────
export const Card = ({ children, style, head, headRight, noPad }) => {
  const { T } = useTheme();
  return (
    <div style={{
      background: T.card, border: `1px solid ${T.border}`,
      borderRadius: 14, overflow: 'hidden', ...style,
    }}>
      {head && (
        <div style={{
          padding: '16px 20px', borderBottom: `1px solid ${T.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, color: T.text }}>
            {head}
          </span>
          {headRight}
        </div>
      )}
      {!noPad && <div style={{ padding: '18px 20px' }}>{children}</div>}
      {noPad && children}
    </div>
  );
};

// ─── STAT CARD ────────────────────────────────────────────────────
export const StatCard = ({ icon, iconBg, label, value, sub, subColor = '#22d3a5' }) => {
  const { T } = useTheme();
  return (
    <div
      style={{
        background: T.card, border: `1px solid ${T.border}`,
        borderRadius: 14, padding: 20, cursor: 'default',
        transition: 'transform .2s, border-color .2s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.borderColor = T.border2;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = '';
        e.currentTarget.style.borderColor = T.border;
      }}
    >
      <div style={{
        width: 40, height: 40, borderRadius: 8,
        background: iconBg, display: 'flex', alignItems: 'center',
        justifyContent: 'center', marginBottom: 14,
      }}>{icon}</div>
      <div style={{ fontSize: 10, color: T.text4, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>{label}</div>
      <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 26, fontWeight: 800, color: T.text }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: subColor, marginTop: 4, fontWeight: 600 }}>{sub}</div>}
    </div>
  );
};

// ─── EMPTY STATE ──────────────────────────────────────────────────
export const EmptyState = ({ icon = '📭', title, desc }) => {
  const { T } = useTheme();
  return (
    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 6 }}>{title}</div>
      {desc && <div style={{ fontSize: 13, color: T.text4 }}>{desc}</div>}
    </div>
  );
};

// ─── ERROR STATE ──────────────────────────────────────────────────
export const ErrorState = ({ message = 'Gagal memuat data', onRetry }) => {
  const { T, C } = useTheme();
  return (
    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
      <div style={{ fontSize: 36, marginBottom: 10 }}>⚠️</div>
      <div style={{ fontSize: 14, color: T.text3, marginBottom: 12 }}>{message}</div>
      {onRetry && (
        <button onClick={onRetry} style={{
          padding: '8px 20px', background: C.orgDim,
          color: C.org, border: `1px solid ${C.org}44`,
          borderRadius: 8, fontWeight: 600, cursor: 'pointer',
        }}>Coba Lagi</button>
      )}
    </div>
  );
};

// ─── SKELETON ─────────────────────────────────────────────────────
export const Skeleton = ({ w = '100%', h = 16, radius = 8, style }) => {
  const { T } = useTheme();
  return (
    <div style={{
      width: w, height: h, borderRadius: radius,
      background: `linear-gradient(90deg, ${T.bg4} 25%, ${T.bg5} 50%, ${T.bg4} 75%)`,
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite',
      ...style,
    }} />
  );
};

// ─── INPUT ────────────────────────────────────────────────────────
export const Input = ({ label, ...props }) => {
  const { T, C } = useTheme();
  return (
    <div>
      {label && (
        <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: T.text4, marginBottom: 7, display: 'block' }}>
          {label}
        </label>
      )}
      <input
        style={{
          width: '100%', padding: '11px 14px',
          background: T.bg4, border: `1px solid ${T.border}`,
          borderRadius: 8, color: T.text2, fontSize: 13.5,
          transition: 'border-color .2s', boxSizing: 'border-box',
        }}
        onFocus={e => (e.target.style.borderColor = C.org)}
        onBlur={e =>  (e.target.style.borderColor = T.border)}
        {...props}
      />
    </div>
  );
};

// ─── BUTTON ───────────────────────────────────────────────────────
export const Btn = ({ children, variant = 'primary', size = 'md', loading, style, ...props }) => {
  const { T, C } = useTheme();
  const sizes   = { sm: '8px 16px', md: '11px 22px', lg: '14px 28px' };
  const variants = {
    primary: { bg: C.org,       color: '#0a0a0f', border: 'none' },
    ghost:   { bg: T.bg4,       color: T.text3,   border: `1px solid ${T.border}` },
    danger:  { bg: C.redDim,    color: C.red,     border: `1px solid ${C.red}44` },
    success: { bg: C.greenDim,  color: C.green,   border: `1px solid ${C.green}44` },
    blue:    { bg: C.blue,      color: '#fff',    border: 'none' },
  };
  const v = variants[variant] || variants.primary;
  return (
    <button
      disabled={loading || props.disabled}
      style={{
        padding: sizes[size], background: v.bg, color: v.color,
        border: v.border, borderRadius: 8, fontWeight: 700,
        fontSize: size === 'lg' ? 15 : size === 'sm' ? 12 : 13,
        cursor: 'pointer', display: 'inline-flex', alignItems: 'center',
        justifyContent: 'center', gap: 6, transition: 'opacity .2s, transform .2s',
        opacity: loading || props.disabled ? 0.7 : 1,
        ...style,
      }}
      onMouseEnter={e => { if (!loading && !props.disabled) e.currentTarget.style.opacity = '0.88'; }}
      onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
      {...props}
    >
      {loading && <Spinner size={14} color={v.color} />}
      {children}
    </button>
  );
};