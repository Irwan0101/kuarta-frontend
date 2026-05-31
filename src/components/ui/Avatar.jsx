// src/components/ui/Avatar.jsx
import { getInitials, avatarColor } from '@/lib/utils';

export function Avatar({ name = '', src, size = 36, ring = false, ringColor = '#FF6B00' }) {
  const initials = getInitials(name);
  const bg = avatarColor(name);

  const style = {
    width: size, height: size,
    borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: size * 0.36,
    fontWeight: 700,
    fontFamily: 'Syne, sans-serif',
    flexShrink: 0,
    overflow: 'hidden',
    ...(ring ? { outline: `2.5px solid ${ringColor}`, outlineOffset: 2 } : {}),
    ...(src ? {} : { background: bg + '22', color: bg, border: `1.5px solid ${bg}40` }),
  };

  if (src) {
    return (
      <div style={{ ...style, background: 'transparent' }}>
        <img src={src} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
    );
  }

  return <div style={style}>{initials || '?'}</div>;
}