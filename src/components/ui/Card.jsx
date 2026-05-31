// src/components/ui/Card.jsx
import { useTheme } from '@/hooks/useTheme';
import { useCountUp } from '@/hooks/useCountUp';

export function Card({ children, style, onClick, hover = true }) {
  const { T } = useTheme();
  const base = {
    background: T.bg2,
    border: `1px solid ${T.border}`,
    borderRadius: 16,
    padding: 20,
    transition: 'border-color .2s, box-shadow .2s',
    ...(onClick ? { cursor: 'pointer' } : {}),
    ...style,
  };
  return (
    <div
      style={base}
      onClick={onClick}
      onMouseEnter={e => hover && Object.assign(e.currentTarget.style, { borderColor: T.border2, boxShadow: '0 4px 24px rgba(0,0,0,.2)' })}
      onMouseLeave={e => hover && Object.assign(e.currentTarget.style, { borderColor: T.border, boxShadow: 'none' })}
    >
      {children}
    </div>
  );
}

export function StatCard({ icon, label, value, sub, color = '#FF6B00', trend, delay = 0 }) {
  const { T } = useTheme();
  const numVal = typeof value === 'number' ? value : parseInt(String(value).replace(/\D/g, '')) || 0;
  const displayed = useCountUp(numVal, 1200, delay);
  const displayStr = typeof value === 'string'
    ? value.replace(/[\d,]+/, displayed.toLocaleString('id-ID'))
    : displayed.toLocaleString('id-ID');

  return (
    <div style={{
      background: T.bg2,
      border: `1px solid ${T.border}`,
      borderRadius: 16,
      padding: 20,
      display: 'flex', flexDirection: 'column', gap: 10,
      position: 'relative', overflow: 'hidden',
      animation: 'fadeUp .4s ease backwards',
      animationDelay: `${delay}ms`,
    }}>
      {/* Glow */}
      <div style={{
        position: 'absolute', top: -20, right: -20,
        width: 80, height: 80,
        background: color + '18',
        borderRadius: '50%',
        filter: 'blur(20px)',
      }} />

      {/* Icon */}
      <div style={{
        width: 40, height: 40,
        background: color + '18',
        border: `1px solid ${color}30`,
        borderRadius: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 18,
      }}>
        {icon}
      </div>

      {/* Value */}
      <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 26, fontWeight: 800, color: T.text, lineHeight: 1 }}>
        {displayStr}
      </div>

      {/* Label + trend */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 13, color: T.text3 }}>{label}</span>
        {trend !== undefined && (
          <span style={{ fontSize: 11, fontWeight: 700, color: trend >= 0 ? '#22C55E' : '#EF4444' }}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>

      {sub && <div style={{ fontSize: 11, color: T.text4 }}>{sub}</div>}
    </div>
  );
}