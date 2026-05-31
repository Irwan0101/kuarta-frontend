// src/lib/utils.js

/* Format currency in IDR */
export function formatIDR(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR',
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(amount);
}

/* Format number with K/M suffix */
export function formatNumber(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000)     return (n / 1_000).toFixed(0) + 'K';
  return String(n);
}

/* Format relative time */
export function timeAgo(date) {
  const d = new Date(date);
  const diff = Date.now() - d.getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (mins  < 1) return 'Baru saja';
  if (mins  < 60) return `${mins} menit lalu`;
  if (hours < 24) return `${hours} jam lalu`;
  if (days  < 7)  return `${days} hari lalu`;
  return d.toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric' });
}

/* Format duration seconds → mm:ss */
export function formatDuration(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/* Format date */
export function formatDate(date, opts) {
  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric', ...opts
  });
}

/* Truncate text */
export function truncate(str, n = 60) {
  return str?.length > n ? str.slice(0, n) + '…' : str;
}

/* Get initials from name */
export function getInitials(name = '') {
  return name.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase()).join('');
}

/* Score to grade */
export function scoreGrade(score) {
  if (score >= 90) return { label: 'A', color: '#22C55E' };
  if (score >= 80) return { label: 'B', color: '#3B82F6' };
  if (score >= 70) return { label: 'C', color: '#F59E0B' };
  if (score >= 60) return { label: 'D', color: '#FF6B00' };
  return { label: 'E', color: '#EF4444' };
}

/* Clamp number between min/max */
export function clamp(n, min, max) { return Math.min(Math.max(n, min), max); }

/* Sleep */
export const sleep = ms => new Promise(r => setTimeout(r, ms));

/* cn - classnames merge */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

/* Random avatar color from name */
const AVATAR_COLORS = ['#FF6B00','#22C55E','#3B82F6','#F59E0B','#EF4444','#8B5CF6','#06B6D4'];
export function avatarColor(name = '') {
  const sum = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

/* Payment method icons/labels */
export const PAYMENT_METHODS = [
  { id: 'bank_transfer', label: 'Transfer Bank', icon: '🏦', desc: 'BCA, Mandiri, BNI, BRI' },
  { id: 'gopay',         label: 'GoPay',         icon: '💚', desc: 'Bayar dengan GoPay' },
  { id: 'ovo',           label: 'OVO',           icon: '💜', desc: 'Bayar dengan OVO' },
  { id: 'dana',          label: 'DANA',          icon: '💙', desc: 'Bayar dengan DANA' },
  { id: 'qris',          label: 'QRIS',          icon: '📱', desc: 'Scan QR code' },
  { id: 'credit_card',   label: 'Kartu Kredit',  icon: '💳', desc: 'Visa, Mastercard' },
];