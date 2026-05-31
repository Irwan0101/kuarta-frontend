// src/pages/ForgotPasswordPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, ArrowRight, CheckCircle, RefreshCw, Lock, Eye, EyeOff } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { authApi } from '@/lib/api';
import toast from 'react-hot-toast';

/* ─── Step indicator ─────────────────────────────────────────── */
const STEPS = ['Email', 'Kode OTP', 'Password Baru'];

function StepBar({ current, T, C }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: 28 }}>
      {STEPS.map((label, i) => {
        const done   = i < current;
        const active = i === current;
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: done ? C.orange : active ? C.orange + '20' : T.bg3,
                border: `2px solid ${done || active ? C.orange : T.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all .3s',
                boxShadow: active ? `0 0 0 4px ${C.orange}20` : 'none',
              }}>
                {done
                  ? <CheckCircle size={14} color="#fff" />
                  : <span style={{ fontSize: 11, fontWeight: 800, color: active ? C.orange : T.text4 }}>{i + 1}</span>
                }
              </div>
              <span style={{
                fontSize: 10, fontWeight: active || done ? 700 : 500,
                color: active || done ? C.orange : T.text4,
                whiteSpace: 'nowrap',
              }}>{label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{
                width: 52, height: 2, marginBottom: 18,
                background: i < current ? C.orange : T.border,
                transition: 'background .4s',
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── InputField ─────────────────────────────────────────────── */
function InputField({ label, hint, error, icon, type = 'text', value, onChange, placeholder, required }) {
  const { T, C } = useTheme();
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';
  const inputType  = isPassword ? (show ? 'text' : 'password') : type;

  return (
    <div>
      {label && (
        <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: T.text3, marginBottom: 6, letterSpacing: '0.02em' }}>
          {label}{required && <span style={{ color: C.orange, marginLeft: 2 }}>*</span>}
        </label>
      )}
      <div style={{ position: 'relative' }}>
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
          onFocus={e => { e.target.style.borderColor = error ? '#EF4444' : C.orange; }}
          onBlur={e  => { e.target.style.borderColor = error ? '#EF4444' : T.border; }}
        />
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

/* ─── OTP Input (6 kotak terpisah) ───────────────────────────── */
function OtpInput({ value, onChange, error, T, C }) {
  const digits = (value + '      ').slice(0, 6).split('');

  const handleKey = (e, idx) => {
    const inputs = document.querySelectorAll('.otp-box');
    if (e.key === 'Backspace') {
      const next = value.slice(0, idx) + value.slice(idx + 1);
      onChange(next);
      if (idx > 0) inputs[idx - 1]?.focus();
    } else if (/^\d$/.test(e.key)) {
      const next = value.slice(0, idx) + e.key + value.slice(idx + 1);
      onChange(next.slice(0, 6));
      if (idx < 5) inputs[idx + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    onChange(pasted);
    e.preventDefault();
  };

  return (
    <div>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: T.text3, marginBottom: 10, letterSpacing: '0.02em' }}>
        Kode OTP<span style={{ color: C.orange, marginLeft: 2 }}>*</span>
      </label>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
        {digits.map((d, i) => (
          <input
            key={i}
            className="otp-box"
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={d.trim()}
            onKeyDown={(e) => handleKey(e, i)}
            onPaste={handlePaste}
            onChange={() => {}}
            style={{
              width: 44, height: 52, textAlign: 'center',
              fontSize: 20, fontWeight: 800, borderRadius: 10,
              border: `2px solid ${error ? '#EF4444' : d.trim() ? C.orange : T.border}`,
              background: d.trim() ? C.orange + '10' : T.bg3,
              color: T.text, outline: 'none',
              transition: 'all .15s',
              fontFamily: 'monospace',
              caretColor: C.orange,
            }}
            onFocus={e  => { e.target.style.borderColor = error ? '#EF4444' : C.orange; e.target.style.boxShadow = `0 0 0 3px ${C.orange}20`; }}
            onBlur={e   => { e.target.style.borderColor = error ? '#EF4444' : d.trim() ? C.orange : T.border; e.target.style.boxShadow = 'none'; }}
          />
        ))}
      </div>
      {error && <p style={{ margin: '8px 0 0', fontSize: 11, color: '#EF4444', textAlign: 'center' }}>{error}</p>}
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────── */
export default function ForgotPasswordPage() {
  const { T, C } = useTheme();
  const navigate = useNavigate();

  const [step,        setStep]       = useState(0);
  const [loading,     setLoading]    = useState(false);
  const [email,       setEmail]      = useState('');
  const [otp,         setOtp]        = useState('');
  const [resetToken,  setResetToken] = useState('');
  const [pass,        setPass]       = useState('');
  const [confirm,     setConfirm]    = useState('');
  const [errors,      setErrors]     = useState({});
  const [resent,      setResent]     = useState(false);
  const [countdown,   setCountdown]  = useState(60);
  const [counting,    setCounting]   = useState(false);

  const startCountdown = () => {
    setCountdown(60);
    setCounting(true);
    const t = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { clearInterval(t); setCounting(false); return 0; }
        return c - 1;
      });
    }, 1000);
  };

  // ── Step 0: kirim OTP ─────────────────────────────────────────
  const submitEmail = async () => {
    const e = {};
    if (!email)                            e.email = 'Email wajib diisi';
    else if (!/\S+@\S+\.\S+/.test(email))  e.email = 'Format email tidak valid';
    setErrors(e);
    if (Object.keys(e).length) return;

    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      toast.success('Kode OTP dikirim ke email kamu 📧');
      setStep(1);
      startCountdown();
    } catch (err) {
      toast.error(err.error || 'Gagal mengirim OTP');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 1: verifikasi OTP ────────────────────────────────────
  const submitOtp = async () => {
    const e = {};
    if (otp.length < 6) e.otp = 'Masukkan 6 digit kode OTP';
    setErrors(e);
    if (Object.keys(e).length) return;

    setLoading(true);
    try {
      const data = await authApi.verifyOtp(email, otp);
      setResetToken(data.resetToken);
      toast.success('OTP terverifikasi! ✅');
      setStep(2);
    } catch (err) {
      setErrors({ otp: err.error || 'Kode OTP salah atau sudah kedaluwarsa' });
      toast.error(err.error || 'OTP tidak valid');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: simpan password baru ─────────────────────────────
  const submitPassword = async () => {
    const e = {};
    if (!pass)                e.pass    = 'Password wajib diisi';
    else if (pass.length < 8) e.pass    = 'Minimal 8 karakter';
    if (confirm !== pass)     e.confirm = 'Password tidak cocok';
    setErrors(e);
    if (Object.keys(e).length) return;

    setLoading(true);
    try {
      await authApi.resetPassword(resetToken, pass);
      setStep(3);
    } catch (err) {
      toast.error(err.error || 'Gagal menyimpan password baru');
    } finally {
      setLoading(false);
    }
  };

  // ── Resend OTP ────────────────────────────────────────────────
  const resendOtp = async () => {
    if (counting) return;
    setResent(true);
    setOtp('');
    setErrors({});
    try {
      await authApi.forgotPassword(email);
      toast.success('Kode OTP baru telah dikirim 📧');
      startCountdown();
    } catch (err) {
      toast.error(err.error || 'Gagal mengirim ulang OTP');
    } finally {
      setResent(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (step === 0) submitEmail();
    else if (step === 1) submitOtp();
    else if (step === 2) submitPassword();
  };

  /* ─── Password strength ──────────────────────────────────────── */
  const strength = (() => {
    if (!pass) return 0;
    let s = 0;
    if (pass.length >= 8)           s++;
    if (/[A-Z]/.test(pass))         s++;
    if (/[0-9]/.test(pass))         s++;
    if (/[^A-Za-z0-9]/.test(pass))  s++;
    return s;
  })();
  const strengthLabel = ['', 'Lemah', 'Cukup', 'Kuat', 'Sangat Kuat'];
  const strengthColor = ['', '#EF4444', '#F59E0B', '#22C55E', '#10B981'];

  return (
    <div style={{
      minHeight: '100vh', background: T.bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, position: 'relative', overflow: 'hidden',
    }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes successPop {
          0%   { transform: scale(0.5); opacity: 0; }
          70%  { transform: scale(1.1); }
          100% { transform: scale(1);   opacity: 1; }
        }
        .fp-card { animation: fadeUp .35s cubic-bezier(.22,1,.36,1) both; }
      `}</style>

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
            {step === 0 && 'Masukkan emailmu untuk mereset password 🔐'}
            {step === 1 && `Kode OTP dikirim ke ${email}`}
            {step === 2 && 'Buat password baru yang kuat 🔒'}
            {step === 3 && 'Password berhasil diperbarui! 🎉'}
          </p>
        </div>

        {/* Card */}
        <div key={step} className="fp-card" style={{
          background: T.bg2, border: `1px solid ${T.border}`,
          borderRadius: 20, padding: '28px 28px 24px',
          boxShadow: '0 20px 60px rgba(0,0,0,.35)',
        }}>
          {step < 3 && <StepBar current={step} T={T} C={C} />}

          {/* Step 0: Email */}
          {step === 0 && (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{
                padding: '12px 14px', borderRadius: 10,
                background: C.orange + '10', border: `1px solid ${C.orange}25`,
                display: 'flex', gap: 10, alignItems: 'flex-start',
              }}>
                <Mail size={15} color={C.orange} style={{ flexShrink: 0, marginTop: 1 }} />
                <p style={{ fontSize: 12, color: T.text3, margin: 0, lineHeight: 1.6 }}>
                  Kami akan mengirimkan kode OTP 6 digit ke alamat emailmu. Pastikan email yang kamu masukkan benar.
                </p>
              </div>
              <InputField
                label="Alamat Email" type="email" placeholder="email@example.com"
                value={email} onChange={e => setEmail(e.target.value)}
                icon={<Mail size={15} />} error={errors.email} required
              />
              <SubmitButton loading={loading} label="Kirim Kode OTP" C={C} T={T} />
            </form>
          )}

          {/* Step 1: OTP */}
          {step === 1 && (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <OtpInput value={otp} onChange={setOtp} error={errors.otp} T={T} C={C} />

              <div style={{ textAlign: 'center' }}>
                {counting ? (
                  <p style={{ fontSize: 12, color: T.text4 }}>
                    Kirim ulang kode dalam{' '}
                    <span style={{ color: C.orange, fontWeight: 700 }}>{countdown}s</span>
                  </p>
                ) : (
                  <button
                    type="button" onClick={resendOtp} disabled={resent}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontSize: 12, color: C.orange, fontWeight: 700,
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      opacity: resent ? 0.5 : 1,
                    }}
                  >
                    <RefreshCw size={12} style={{ animation: resent ? 'spin .7s linear infinite' : 'none' }} />
                    Kirim ulang kode OTP
                  </button>
                )}
              </div>

              <SubmitButton loading={loading} label="Verifikasi OTP" C={C} T={T} />
            </form>
          )}

          {/* Step 2: Password baru */}
          {step === 2 && (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <InputField
                label="Password Baru" type="password" placeholder="Minimal 8 karakter"
                value={pass} onChange={e => setPass(e.target.value)}
                icon={<Lock size={15} />} error={errors.pass} required
              />

              {pass && (
                <div style={{ marginTop: -8 }}>
                  <div style={{ display: 'flex', gap: 4, marginBottom: 5 }}>
                    {[1,2,3,4].map(i => (
                      <div key={i} style={{
                        flex: 1, height: 3, borderRadius: 2,
                        background: i <= strength ? strengthColor[strength] : T.border,
                        transition: 'background .3s',
                      }} />
                    ))}
                  </div>
                  <p style={{ margin: 0, fontSize: 11, color: strengthColor[strength], fontWeight: 700 }}>
                    {strengthLabel[strength]}
                  </p>
                </div>
              )}

              <InputField
                label="Konfirmasi Password" type="password" placeholder="Ulangi password baru"
                value={confirm} onChange={e => setConfirm(e.target.value)}
                icon={<Lock size={15} />} error={errors.confirm} required
              />

              <div style={{ padding: '10px 12px', borderRadius: 9, background: T.bg3 }}>
                <p style={{ margin: '0 0 6px', fontSize: 11, fontWeight: 700, color: T.text3 }}>Syarat password:</p>
                {[
                  ['Minimal 8 karakter',         pass.length >= 8],
                  ['Huruf kapital (A-Z)',         /[A-Z]/.test(pass)],
                  ['Angka (0-9)',                 /[0-9]/.test(pass)],
                  ['Karakter spesial (!@#$…)',    /[^A-Za-z0-9]/.test(pass)],
                ].map(([rule, ok]) => (
                  <div key={rule} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                    <div style={{
                      width: 14, height: 14, borderRadius: '50%',
                      background: ok ? '#22C55E20' : T.bg,
                      border: `1.5px solid ${ok ? '#22C55E' : T.border}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      transition: 'all .2s',
                    }}>
                      {ok && <CheckCircle size={9} color="#22C55E" />}
                    </div>
                    <span style={{ fontSize: 11, color: ok ? '#22C55E' : T.text4 }}>{rule}</span>
                  </div>
                ))}
              </div>

              <SubmitButton loading={loading} label="Simpan Password Baru" C={C} T={T} />
            </form>
          )}

          {/* Step 3: Sukses */}
          {step === 3 && (
            <div style={{ textAlign: 'center', padding: '8px 0 4px' }}>
              <div style={{
                width: 72, height: 72, borderRadius: '50%',
                background: '#22C55E15', border: '2px solid #22C55E40',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px',
                animation: 'successPop .5s cubic-bezier(.22,1,.36,1) both',
              }}>
                <CheckCircle size={34} color="#22C55E" />
              </div>
              <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 20, color: T.text, marginBottom: 8 }}>
                Password Diperbarui!
              </h2>
              <p style={{ fontSize: 13, color: T.text3, lineHeight: 1.7, margin: '0 auto 24px', maxWidth: 300 }}>
                Password akunmu berhasil diperbarui. Silakan masuk dengan password baru kamu.
              </p>
              <button
                onClick={() => navigate('/login')}
                style={{
                  width: '100%', padding: '12px',
                  background: `linear-gradient(135deg, ${C.orange}, ${C.orange}dd)`,
                  color: '#fff', fontWeight: 800, fontSize: 14,
                  border: 'none', borderRadius: 11, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  boxShadow: `0 4px 20px ${C.orange}40`,
                  fontFamily: 'Syne, sans-serif',
                }}
              >
                Masuk Sekarang <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Back button */}
        {step < 3 && (
          <button
            onClick={() => step === 0 ? navigate('/login') : setStep(s => s - 1)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              margin: '20px auto 0', background: 'none', border: 'none',
              cursor: 'pointer', color: T.text4, fontSize: 13, fontWeight: 600,
              transition: 'color .15s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = C.orange}
            onMouseLeave={e => e.currentTarget.style.color = T.text4}
          >
            <ArrowLeft size={14} />
            {step === 0 ? 'Kembali ke halaman Masuk' : 'Kembali ke langkah sebelumnya'}
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── Submit button ──────────────────────────────────────────── */
function SubmitButton({ loading, label, C, T }) {
  return (
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
      {loading ? (
        <>
          <span style={{
            width: 14, height: 14,
            border: '2px solid rgba(255,255,255,.3)',
            borderTopColor: '#fff', borderRadius: '50%',
            display: 'inline-block',
            animation: 'spin .7s linear infinite',
          }} />
          Memproses...
        </>
      ) : (
        <>{label} <ArrowRight size={16} /></>
      )}
    </button>
  );
}