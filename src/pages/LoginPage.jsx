// src/pages/LoginPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, Eye, EyeOff, ArrowRight, Shield } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuthStore } from '@/store/authStore';
import { useTheme }     from '@/hooks/useTheme';
import { Button }       from '@/components/ui/Button';
import toast            from 'react-hot-toast';

/* ─── Inline InputField (tidak bergantung pada import yang salah) ── */
function InputField({ label, hint, error, icon, type = 'text', value, onChange, placeholder, required }) {
  const { T, C } = useTheme();
  const [show, setShow] = useState(false);
  const isPassword      = type === 'password';
  const inputType       = isPassword ? (show ? 'text' : 'password') : type;

  return (
    <div>
      {label && (
        <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: T.text3, marginBottom: 6, letterSpacing: '0.02em' }}>
          {label}{required && <span style={{ color: C.orange, marginLeft: 2 }}>*</span>}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        {/* Left icon */}
        {icon && (
          <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: error ? '#EF4444' : T.text4, display: 'flex', pointerEvents: 'none' }}>
            {icon}
          </span>
        )}
        <input
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          style={{
            width: '100%', boxSizing: 'border-box',
            padding: `10px ${isPassword ? '40px' : '14px'} 10px ${icon ? '38px' : '14px'}`,
            fontSize: 13, borderRadius: 10,
            background: T.bg3,
            border: `1px solid ${error ? '#EF4444' : T.border}`,
            color: T.text, outline: 'none',
            transition: 'border-color .15s',
          }}
          onFocus={e  => { e.target.style.borderColor = error ? '#EF4444' : C.orange; }}
          onBlur={e   => { e.target.style.borderColor = error ? '#EF4444' : T.border; }}
        />
        {/* Right: show/hide toggle */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow(s => !s)}
            style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: T.text4, display: 'flex', padding: 0 }}
          >
            {show ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
      </div>
      {error && <p style={{ margin: '5px 0 0', fontSize: 11, color: '#EF4444' }}>{error}</p>}
      {hint && !error && <p style={{ margin: '5px 0 0', fontSize: 11, color: T.text4 }}>{hint}</p>}
    </div>
  );
}

/* ─── Demo credentials helper ─────────────────────────────────── */
function DemoChip({ label, email, password, onFill, C, T }) {
  return (
    <button
      type="button"
      onClick={() => onFill(email, password)}
      style={{
        padding: '5px 10px', borderRadius: 7, fontSize: 11, fontWeight: 600,
        cursor: 'pointer', background: C.orange + '15', color: C.orange,
        border: `1px solid ${C.orange}30`, transition: 'background .15s',
      }}
    >
      {label}
    </button>
  );
}

/* ─── Page ─────────────────────────────────────────────────────── */
export default function LoginPage({ mode: initMode = 'login' }) {
  const { T, C }                           = useTheme();
  const navigate                           = useNavigate();
  const { login, register, googleLogin, loading }       = useAuthStore();
  const isAdmin                            = useAuthStore(s => s.isAdmin());

  const [mode,   setMode]   = useState(initMode);
  const [form,   setForm]   = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const fillDemo = (email, password) => {
    setForm(f => ({ ...f, email, password }));
    setErrors({});
  };

  // ── Validation ────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.email)                           e.email    = 'Email wajib diisi';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email    = 'Format email tidak valid';
    if (!form.password)                        e.password = 'Password wajib diisi';
    else if (form.password.length < 8)         e.password = 'Minimal 8 karakter';
    if (mode === 'register') {
      if (!form.name)                          e.name    = 'Nama wajib diisi';
      if (form.confirm !== form.password)      e.confirm = 'Password tidak cocok';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Submit ────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const res = mode === 'login'
      ? await login(form.email, form.password)
      : await register({ name: form.name, email: form.email, phone: form.phone, password: form.password });

    if (res?.ok) {
      toast.success(mode === 'login' ? 'Selamat datang kembali! 👋' : 'Akun berhasil dibuat! 🎉');
      // Role-aware redirect: admin → panel, user → dashboard
      const dest = res.user?.role === 'admin' ? '/admin/dashboard' : '/dashboard';
      navigate(dest, { replace: true });
    } else {
      toast.error(res?.message || 'Email atau password salah');
    }
  };

  const switchMode = (m) => { setMode(m); setErrors({}); setForm({ name: '', email: '', phone: '', password: '', confirm: '' }); };

  return (
    <div style={{
      minHeight: '100vh', background: T.bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, position: 'relative', overflow: 'hidden',
    }}>
      {/* BG glows */}
      <div style={{ position: 'absolute', top: -220, right: -220, width: 600, height: 600, background: C.orange + '0C', borderRadius: '50%', filter: 'blur(110px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -180, left: -180, width: 500, height: 500, background: C.orange + '07', borderRadius: '50%', filter: 'blur(90px)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 56, height: 56,
            background: `linear-gradient(135deg, ${C.orange}, ${C.orange}cc)`,
            borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 14px', boxShadow: `0 8px 32px ${C.orange}40`,
          }}>
            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 900, fontSize: 26, color: '#fff' }}>K</span>
          </div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 26, color: T.text, marginBottom: 6 }}>
            Kuarta Bimbel
          </h1>
          <p style={{ fontSize: 13, color: T.text3 }}>
            {mode === 'login' ? 'Masuk ke akunmu dan mulai belajar 🚀' : 'Daftar gratis dan mulai perjalananmu'}
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: T.bg2, border: `1px solid ${T.border}`,
          borderRadius: 20, padding: '28px 28px 24px',
          boxShadow: '0 20px 60px rgba(0,0,0,.35)',
        }}>
          {/* Mode tabs */}
          <div style={{ display: 'flex', background: T.bg3, borderRadius: 10, padding: 4, marginBottom: 24 }}>
            {[['login', 'Masuk'], ['register', 'Daftar']].map(([m, label]) => (
              <button
                key={m} type="button"
                onClick={() => switchMode(m)}
                style={{
                  flex: 1, padding: '8px 0', border: 'none', borderRadius: 8,
                  fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                  background: mode === m ? T.bg2 : 'transparent',
                  color:      mode === m ? T.text : T.text4,
                  boxShadow:  mode === m ? '0 2px 8px rgba(0,0,0,.15)' : 'none',
                  transition: 'all .2s',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {mode === 'register' && (
              <InputField label="Nama Lengkap" placeholder="Masukkan nama lengkap" value={form.name} onChange={set('name')} icon={<User size={15} />} error={errors.name} required />
            )}

            <InputField label="Email" type="email" placeholder="email@example.com" value={form.email} onChange={set('email')} icon={<Mail size={15} />} error={errors.email} required />

            {mode === 'register' && (
              <InputField label="No. Telepon" type="tel" placeholder="08xxxxxxxxxx" value={form.phone} onChange={set('phone')} icon={<Phone size={15} />} hint="Opsional — untuk notifikasi WhatsApp" />
            )}

            <InputField
              label="Password"
              type="password"
              placeholder={mode === 'register' ? 'Minimal 8 karakter' : 'Masukkan password'}
              value={form.password} onChange={set('password')}
              icon={<Lock size={15} />} error={errors.password} required
            />

            {mode === 'register' && (
              <InputField label="Konfirmasi Password" type="password" placeholder="Ulangi password" value={form.confirm} onChange={set('confirm')} icon={<Lock size={15} />} error={errors.confirm} required />
            )}

            {mode === 'login' && (
              <div style={{ textAlign: 'right', marginTop: -4 }}>
                <span style={{ fontSize: 12, color: C.orange, cursor: 'pointer', fontWeight: 600 }} onClick={() => navigate('/forgot-password')}>Lupa password?</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '12px', marginTop: 4,
                background: loading ? T.bg4 : `linear-gradient(135deg, ${C.orange}, ${C.orange}dd)`,
                color: loading ? T.text4 : '#fff',
                fontWeight: 800, fontSize: 14, border: 'none', borderRadius: 11,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: loading ? 'none' : `0 4px 20px ${C.orange}40`,
                transition: 'all .2s', fontFamily: 'Syne, sans-serif',
              }}
            >
              {loading
                ? <><span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin .7s linear infinite' }} /> Memproses...</>
                : <>{mode === 'login' ? 'Masuk Sekarang' : 'Buat Akun Gratis'} <ArrowRight size={16} /></>}
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </button>
          </form>

          {/* Google SSO */}
          <div style={{ marginTop: 18, marginBottom: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <div style={{ flex: 1, height: 1, background: T.border }} />
              <span style={{ fontSize: 11, color: T.text4, fontWeight: 500, whiteSpace: 'nowrap' }}>atau lanjut dengan</span>
              <div style={{ flex: 1, height: 1, background: T.border }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <GoogleLogin
                size="large"
                shape="rectangular"
                theme="outline"
                text="continue_with"
                onSuccess={async ({ credential }) => {
                  const res = await googleLogin(credential);
                  if (res.ok) {
                    toast.success('Selamat datang! 👋');
                    const dest = res.user?.role === 'admin' ? '/admin/dashboard' : '/dashboard';
                    navigate(dest, { replace: true });
                  } else {
                    toast.error(res.message);
                  }
                }}
                onError={() => toast.error('Gagal login dengan Google')}
              />
            </div>
          </div>

          {/* Demo credentials */}
          <div style={{ marginTop: 18, padding: '12px 14px', background: T.bg3, borderRadius: 10 }}>
            <div style={{ fontSize: 11, color: T.text4, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
              <Shield size={11} /> <span style={{ fontWeight: 700, color: T.text3 }}>Akun Demo</span>
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <DemoChip label="👑 Admin"       email="admin@kuarta.id" password="admin123" onFill={fillDemo} C={C} T={T} />
              <DemoChip label="👤 User Biasa"  email="user@kuarta.id"  password="user123"  onFill={fillDemo} C={C} T={T} />
            </div>
            <p style={{ marginTop: 6, fontSize: 10, color: T.text4 }}>Klik chip di atas untuk mengisi form otomatis</p>
          </div>
        </div>

        {/* Footer note */}
        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: T.text4 }}>
          Dengan masuk, kamu menyetujui{' '}
          <span style={{ color: C.orange, cursor: 'pointer' }}>Syarat & Ketentuan</span>{' '}
          dan{' '}
          <span style={{ color: C.orange, cursor: 'pointer' }}>Kebijakan Privasi</span> kami.
        </p>
      </div>
    </div>
  );
}