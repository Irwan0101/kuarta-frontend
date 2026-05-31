// src/components/ui/Button.jsx
import { Spinner } from './Badge';

export function Button({
  children, onClick, variant = 'primary', size = 'md', loading = false,
  disabled = false, icon, style, type = 'button', fullWidth = false,
}) {
  const sizes = {
    sm:  { padding: '7px 14px', fontSize: 12 },
    md:  { padding: '10px 20px', fontSize: 14 },
    lg:  { padding: '13px 28px', fontSize: 15 },
  };

  const variants = {
    primary: { background: '#FF6B00', color: '#fff', border: 'none' },
    ghost:   { background: 'var(--bg4)', color: 'var(--text2)', border: '1px solid var(--border2)' },
    danger:  { background: '#EF444422', color: '#EF4444', border: '1px solid #EF444440' },
    success: { background: '#22C55E22', color: '#22C55E', border: '1px solid #22C55E40' },
    outline: { background: 'transparent', color: '#FF6B00', border: '1px solid #FF6B00' },
  };

  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        borderRadius: 10, fontWeight: 700, fontFamily: 'DM Sans, sans-serif',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.6 : 1,
        transition: 'opacity .15s, transform .1s, filter .15s',
        whiteSpace: 'nowrap',
        width: fullWidth ? '100%' : undefined,
        ...sizes[size],
        ...variants[variant],
        ...style,
      }}
      onMouseEnter={e => !isDisabled && (e.currentTarget.style.filter = 'brightness(1.1)')}
      onMouseLeave={e => (e.currentTarget.style.filter = '')}
      onMouseDown={e  => !isDisabled && (e.currentTarget.style.transform = 'scale(.97)')}
      onMouseUp={e    => (e.currentTarget.style.transform = '')}
    >
      {loading ? <Spinner size={14} color={variant === 'primary' ? '#fff' : '#FF6B00'} /> : icon}
      {children}
    </button>
  );
}

// src/components/ui/Input.jsx
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export function Input({
  label, placeholder, value, onChange, type = 'text', error,
  icon, hint, required, name, disabled, style, autoFocus,
}) {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';
  const inputType  = isPassword ? (show ? 'text' : 'password') : type;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, ...style }}>
      {label && (
        <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)' }}>
          {label} {required && <span style={{ color: '#EF4444' }}>*</span>}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        {icon && (
          <div style={{
            position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
            color: 'var(--text4)', pointerEvents: 'none',
          }}>
            {icon}
          </div>
        )}
        <input
          name={name}
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          autoFocus={autoFocus}
          style={{
            paddingLeft: icon ? 38 : 14,
            paddingRight: isPassword ? 38 : 14,
            ...(error ? { borderColor: '#EF4444', boxShadow: '0 0 0 3px rgba(239,68,68,.15)' } : {}),
          }}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow(s => !s)}
            style={{
              position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text4)', display: 'flex',
            }}
          >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error && <span style={{ fontSize: 12, color: '#EF4444' }}>{error}</span>}
      {hint  && !error && <span style={{ fontSize: 12, color: 'var(--text4)' }}>{hint}</span>}
    </div>
  );
}