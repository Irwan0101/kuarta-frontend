// src/components/ui/Badge.jsx
export function Badge({ children, color = '#FF6B00', size = 'md' }) {
  const sizes = { sm: { fontSize: 10, padding: '2px 7px' }, md: { fontSize: 11, padding: '3px 10px' }, lg: { fontSize: 12, padding: '4px 12px' } };
  return (
    <span style={{
      background: color + '22', color, border: `1px solid ${color}44`,
      borderRadius: 99, fontWeight: 700, letterSpacing: '0.03em',
      display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap',
      ...sizes[size],
    }}>
      {children}
    </span>
  );
}

// src/components/ui/ProgressBar.jsx
export function ProgressBar({ value = 0, max = 100, color = '#FF6B00', height = 6, bg, label }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div>
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5, color: 'var(--text3)' }}>
          <span>{label}</span>
          <span style={{ color }}>{Math.round(pct)}%</span>
        </div>
      )}
      <div style={{ height, background: bg || 'var(--bg4)', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: `linear-gradient(90deg, ${color}99, ${color})`,
          borderRadius: 99,
          transition: 'width .6s cubic-bezier(.4,0,.2,1)',
        }} />
      </div>
    </div>
  );
}

// src/components/ui/Spinner.jsx
export function Spinner({ size = 20, color = '#FF6B00' }) {
  return (
    <div style={{
      width: size, height: size,
      border: `2.5px solid ${color}33`,
      borderTop: `2.5px solid ${color}`,
      borderRadius: '50%',
      animation: 'spin .7s linear infinite',
      flexShrink: 0,
    }} />
  );
}

// src/components/ui/Skeleton.jsx
export function Skeleton({ width = '100%', height = 16, radius = 8, style }) {
  return (
    <div
      className="skeleton"
      style={{ width, height, borderRadius: radius, ...style }}
    />
  );
}