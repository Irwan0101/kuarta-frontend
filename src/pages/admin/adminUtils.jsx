// src/pages/admin/adminUtils.jsx
// Shared micro-components used across admin pages

import { Loader, AlertCircle } from 'lucide-react';

export const ORG   = '#FF6B00';
export const GREEN = '#22C55E';
export const RED   = '#EF4444';
export const BLUE  = '#3B82F6';

export function PageHeader({ title, subtitle, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
      <div>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22, marginBottom: 4 }}>{title}</h2>
        {subtitle && <p style={{ fontSize: 13, opacity: .6 }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatBox({ icon, label, value, sub, color }) {
  return (
    <div style={{ background: 'var(--bg2,#1e1a16)', border: '1px solid var(--bdr,#2e2921)', borderRadius: 12, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 42, height: 42, borderRadius: 10, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{icon}</div>
      <div>
        <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22, lineHeight: 1.1 }}>{value}</div>
        <div style={{ fontSize: 12, opacity: .5, marginTop: 2 }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: GREEN, marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}

export function Card({ children, style }) {
  return (
    <div style={{ background: 'var(--bg2,#1e1a16)', border: '1px solid var(--bdr,#2e2921)', borderRadius: 14, overflow: 'hidden', ...style }}>
      {children}
    </div>
  );
}

export function CardHead({ title, sub, action }) {
  return (
    <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--bdr,#2e2921)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
      <div>
        <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14 }}>{title}</div>
        {sub && <div style={{ fontSize: 11, opacity: .5, marginTop: 1 }}>{sub}</div>}
      </div>
      {action}
    </div>
  );
}

export function Btn({ children, onClick, color = ORG, variant = 'solid', size = 'md', disabled, style: sx }) {
  const pad = size === 'sm' ? '6px 12px' : '9px 18px';
  const fs  = size === 'sm' ? 12 : 13;
  const bg  = variant === 'solid'   ? color
             : variant === 'outline' ? 'transparent'
             : 'transparent';
  const bdr = variant === 'ghost' ? 'none' : `1px solid ${color}`;
  const col = variant === 'solid' ? '#fff' : color;
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: pad, background: bg, color: col, border: bdr,
      borderRadius: 9, fontSize: fs, fontWeight: 700, cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? .5 : 1, display: 'inline-flex', alignItems: 'center', gap: 6,
      transition: 'opacity .15s', ...sx,
    }}>
      {children}
    </button>
  );
}

export function Badge({ label, color }) {
  return (
    <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 6, background: color + '20', color, fontWeight: 700 }}>{label}</span>
  );
}

export function Input({ value, onChange, placeholder, type = 'text', style: sx }) {
  return (
    <input type={type} value={value} onChange={onChange} placeholder={placeholder} style={{
      padding: '9px 12px', fontSize: 13, borderRadius: 9,
      background: 'var(--bg3,#16130f)', border: '1px solid var(--bdr,#2e2921)',
      color: 'inherit', outline: 'none', width: '100%', boxSizing: 'border-box', ...sx,
    }} />
  );
}

export function Select({ value, onChange, children, style: sx }) {
  return (
    <select value={value} onChange={onChange} style={{
      padding: '9px 12px', fontSize: 13, borderRadius: 9,
      background: 'var(--bg3,#16130f)', border: '1px solid var(--bdr,#2e2921)',
      color: 'inherit', outline: 'none', ...sx,
    }}>
      {children}
    </select>
  );
}

export function Spinner({ label = 'Memuat...' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 48, opacity: .5, fontSize: 13 }}>
      <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
      {label}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

export function ErrorBox({ msg }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', borderRadius: 10, background: '#EF444415', border: '1px solid #EF444430', color: RED, fontSize: 13 }}>
      <AlertCircle size={15} /> {msg}
    </div>
  );
}

export function Modal({ title, onClose, children, width = 520 }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: 'var(--bg2,#1e1a16)', border: '1px solid var(--bdr,#2e2921)', borderRadius: 16, width: '100%', maxWidth: width, maxHeight: '90vh', overflow: 'auto' }}>
        <div style={{ padding: '16px 22px', borderBottom: '1px solid var(--bdr,#2e2921)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15 }}>{title}</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: .5, fontSize: 18 }}>✕</button>
        </div>
        <div style={{ padding: '20px 22px' }}>{children}</div>
      </div>
    </div>
  );
}

export function FormRow({ children }) {
  return <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>{children}</div>;
}

export function FormGroup({ label, children }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, opacity: .5, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 5 }}>{label}</label>
      {children}
    </div>
  );
}

export function TableHead({ cols }) {
  return (
    <thead>
      <tr style={{ background: 'var(--bg3,#16130f)' }}>
        {cols.map((c, i) => (
          <th key={i} style={{ padding: '10px 16px', fontSize: 10, fontWeight: 700, opacity: .5, textTransform: 'uppercase', letterSpacing: '.04em', textAlign: c.right ? 'right' : 'left', whiteSpace: 'nowrap' }}>
            {c.label ?? c}
          </th>
        ))}
      </tr>
    </thead>
  );
}

export function EmptyRow({ cols, msg = 'Tidak ada data.' }) {
  return (
    <tr><td colSpan={cols} style={{ padding: 32, textAlign: 'center', opacity: .4, fontSize: 13 }}>{msg}</td></tr>
  );
}

export function useAsync(fn, deps = []) {
  const [data, setData]     = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError]   = React.useState('');

  const run = React.useCallback(async () => {
    setLoading(true); setError('');
    try { setData(await fn()); }
    catch (e) { setError(e?.message || 'Terjadi kesalahan.'); }
    finally { setLoading(false); }
  }, deps);

  React.useEffect(() => { run(); }, [run]);
  return { data, loading, error, reload: run };
}

import React from 'react';