// src/pages/ProfilPage.jsx
import { useState, useEffect, useRef } from 'react';
import SEO from '@/components/SEO';
import { Camera, Save, Lock, Crown, LogOut, Shield, Bell, CreditCard, Eye, EyeOff, CheckCircle, AlertCircle, Loader, Loader2 } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useConfirm } from '@/hooks/useConfirm';
import { useAuthStore } from '@/store/authStore';
import { authApi, paymentApi, programsApi } from '@/lib/api';
import useResponsive from '@/hooks/useResponsive';
import toast from 'react-hot-toast';

const NAV_ITEMS = [
  { id: 'info',      icon: Shield,      label: 'Informasi Pribadi' },
  { id: 'password',  icon: Lock,        label: 'Ubah Password'     },
  { id: 'notif',     icon: Bell,        label: 'Notifikasi'        },
  { id: 'langganan', icon: CreditCard,  label: 'Langganan'         },
];

/* ─── Tiny helpers ───────────────────────────────────────────────── */
function getInitials(name = '') {
  return name.trim().split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || '??';
}

function inputStyle(T) {
  return {
    width: '100%', padding: '10px 14px', fontSize: 13,
    background: T.bg3, border: `1px solid ${T.border}`,
    borderRadius: 9, color: T.text, outline: 'none',
    boxSizing: 'border-box', transition: 'border-color .15s',
  };
}

function FormGroup({ label, children, T }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: T.text4, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function Toast({ msg, type, T, C }) {
  if (!msg) return null;
  const isOk = type === 'success';
  const bg   = isOk ? C.green + '18' : '#EF444418';
  const bdr  = isOk ? C.green + '40' : '#EF444440';
  const col  = isOk ? C.green : '#EF4444';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 10, background: bg, border: `1px solid ${bdr}`, marginBottom: 16 }}>
      {isOk ? <CheckCircle size={15} color={col} /> : <AlertCircle size={15} color={col} />}
      <span style={{ fontSize: 13, color: col, fontWeight: 600 }}>{msg}</span>
    </div>
  );
}

/* ─── Info tab ───────────────────────────────────────────────────── */
function InfoTab({ profile, onUpdate, T, C }) {
  const [form, setForm]     = useState({ name: '', phone: '', city: '', target: '', bio: '' });
  const [categories, setCategories] = useState([]);
  const [status, setStatus] = useState({ loading: false, msg: '', type: '' });

  useEffect(() => { programsApi.getCategories().then(r => setCategories(Array.isArray(r) ? r : [])).catch(() => {}); }, []);

  useEffect(() => {
    if (profile) setForm({
      name:   profile.name   || '',
      phone:  profile.phone  || '',
      city:   profile.city   || '',
      target: profile.target_exam || '',
      bio:    profile.bio    || '',
    });
  }, [profile]);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSave = async () => {
    setStatus({ loading: true, msg: '', type: '' });
    try {
      const updated = await authApi.updateProfile({ ...form, target_exam: form.target });
      onUpdate(updated);
      setStatus({ loading: false, msg: 'Profil berhasil disimpan!', type: 'success' });
    } catch (err) {
      setStatus({ loading: false, msg: err?.message || 'Gagal menyimpan profil.', type: 'error' });
    }
    setTimeout(() => setStatus(s => ({ ...s, msg: '' })), 3500);
  };

  const is = inputStyle(T);

  return (
    <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 14, overflow: 'hidden' }}>
      <div style={{ padding: '16px 22px', borderBottom: `1px solid ${T.border}` }}>
        <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, color: T.text }}>Informasi Pribadi</div>
      </div>
      <div style={{ padding: '20px 22px' }}>
        <Toast msg={status.msg} type={status.type} T={T} C={C} />
        <div style={{ display: 'grid', gridTemplateColumns: resp.isMobile ? '1fr' : '1fr 1fr', gap: 16 }}>
          <FormGroup label="Nama Lengkap" T={T}>
            <input style={is} value={form.name} onChange={set('name')} />
          </FormGroup>
          <FormGroup label="Nomor WhatsApp" T={T}>
            <input style={is} value={form.phone} onChange={set('phone')} />
          </FormGroup>
          <FormGroup label="Email" T={T}>
            <input style={{ ...is, opacity: .6, cursor: 'not-allowed' }} value={profile?.email || ''} readOnly />
          </FormGroup>
          <FormGroup label="Kota Asal" T={T}>
            <input style={is} value={form.city} onChange={set('city')} />
          </FormGroup>
        </div>
        <FormGroup label="Target Ujian" T={T}>
          <select style={{ ...is }} value={form.target} onChange={set('target')}>
            <option value="">Pilih target ujian</option>
            {categories.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </FormGroup>
        <FormGroup label="Bio Singkat" T={T}>
          <textarea style={{ ...is, resize: 'vertical' }} rows={3} value={form.bio} onChange={set('bio')} />
        </FormGroup>
        <button
          onClick={handleSave}
          disabled={status.loading}
          style={{
            padding: '11px 24px', background: C.orange, color: '#fff',
            fontWeight: 700, fontSize: 13, border: 'none', borderRadius: 10,
            cursor: status.loading ? 'not-allowed' : 'pointer', opacity: status.loading ? .7 : 1,
            display: 'flex', alignItems: 'center', gap: 7, transition: 'opacity .2s',
          }}
        >
          {status.loading
            ? <><Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> Menyimpan...</>
            : <><Save size={14} /> Simpan Perubahan</>}
        </button>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );
}

/* ─── Password tab ───────────────────────────────────────────────── */
function PasswordTab({ T, C }) {
  const [form, setForm]     = useState({ oldPassword: '', newPassword: '', confirm: '' });
  const [show, setShow]     = useState({ old: false, new: false, confirm: false });
  const [status, setStatus] = useState({ loading: false, msg: '', type: '' });

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const tog = (k) => () => setShow(s => ({ ...s, [k]: !s[k] }));

  const handleSubmit = async () => {
    if (form.newPassword !== form.confirm) {
      setStatus({ loading: false, msg: 'Password baru tidak cocok.', type: 'error' });
      return;
    }
    if (form.newPassword.length < 8) {
      setStatus({ loading: false, msg: 'Password minimal 8 karakter.', type: 'error' });
      return;
    }
    setStatus({ loading: true, msg: '', type: '' });
    try {
      await authApi.changePassword({ oldPassword: form.oldPassword, newPassword: form.newPassword });
      setForm({ oldPassword: '', newPassword: '', confirm: '' });
      setStatus({ loading: false, msg: 'Password berhasil diubah!', type: 'success' });
    } catch (err) {
      setStatus({ loading: false, msg: err?.message || 'Password lama salah atau gagal mengubah.', type: 'error' });
    }
    setTimeout(() => setStatus(s => ({ ...s, msg: '' })), 3500);
  };

  const is = inputStyle(T);

  const PasswordField = ({ label, field, showKey }) => (
    <FormGroup label={label} T={T}>
      <div style={{ position: 'relative' }}>
        <input style={{ ...is, paddingRight: 40 }} type={show[showKey] ? 'text' : 'password'} value={form[field]} onChange={set(field)} placeholder="••••••••" />
        <button onClick={tog(showKey)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: T.text4, display: 'flex' }}>
          {show[showKey] ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
    </FormGroup>
  );

  return (
    <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 14, overflow: 'hidden' }}>
      <div style={{ padding: '16px 22px', borderBottom: `1px solid ${T.border}` }}>
        <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, color: T.text }}>Ubah Password</div>
      </div>
      <div style={{ padding: '20px 22px' }}>
        <Toast msg={status.msg} type={status.type} T={T} C={C} />
        <div style={{ display: 'grid', gridTemplateColumns: resp.isMobile ? '1fr' : '1fr 1fr', gap: 16 }}>
          <PasswordField label="Password Lama"  field="oldPassword"  showKey="old"     />
          <PasswordField label="Password Baru"  field="newPassword"  showKey="new"     />
        </div>
        <PasswordField label="Konfirmasi Password Baru" field="confirm" showKey="confirm" />
        <button
          onClick={handleSubmit}
          disabled={status.loading}
          style={{
            padding: '11px 24px', background: C.orange, color: '#fff',
            fontWeight: 700, fontSize: 13, border: 'none', borderRadius: 10,
            cursor: status.loading ? 'not-allowed' : 'pointer', opacity: status.loading ? .7 : 1,
            display: 'flex', alignItems: 'center', gap: 7,
          }}
        >
          {status.loading
            ? <><Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> Mengubah...</>
            : <><Lock size={14} /> Ubah Password</>}
        </button>
      </div>
    </div>
  );
}

/* ─── Notif tab ──────────────────────────────────────────────────── */
const NOTIF_ITEMS = [
  { key: 'live',   label: 'Pengingat Jadwal Live Class' },
  { key: 'tryout', label: 'Hasil Tryout Tersedia'       },
  { key: 'streak', label: 'Streak Harian'               },
  { key: 'promo',  label: 'Promosi & Diskon'            },
  { key: 'materi', label: 'Update Materi Baru'          },
];

function NotifTab({ T, C }) {
  const [notifs, setNotifs] = useState(NOTIF_ITEMS.map(n => ({ ...n, on: true })));
  const toggle = (key) => setNotifs(n => n.map(x => x.key === key ? { ...x, on: !x.on } : x));

  return (
    <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 14, overflow: 'hidden' }}>
      <div style={{ padding: '16px 22px', borderBottom: `1px solid ${T.border}` }}>
        <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, color: T.text }}>Preferensi Notifikasi</div>
      </div>
      <div>
        {notifs.map((n, i) => (
          <div key={n.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 22px', borderBottom: i < notifs.length - 1 ? `1px solid ${T.border}` : 'none' }}>
            <span style={{ fontSize: 13, color: T.text }}>{n.label}</span>
            <div
              onClick={() => toggle(n.key)}
              style={{
                width: 42, height: 24, borderRadius: 99, cursor: 'pointer',
                background: n.on ? C.orange : T.bg4,
                border: `1px solid ${n.on ? C.orange : T.border}`,
                position: 'relative', transition: 'background .2s',
                flexShrink: 0,
              }}
            >
              <div style={{
                position: 'absolute', top: 3, left: n.on ? 20 : 3,
                width: 16, height: 16, borderRadius: '50%',
                background: '#fff', transition: 'left .2s',
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Langganan tab ──────────────────────────────────────────────── */
function LanggananTab({ profile, transactions, loadingTx, T, C }) {
  const expiresAt = profile?.plan_expires_at ? new Date(profile.plan_expires_at) : null;
  const isActive = expiresAt && expiresAt > new Date();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Active plan */}
      <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ padding: '16px 22px', borderBottom: `1px solid ${T.border}` }}>
          <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, color: T.text }}>Langganan Aktif</div>
        </div>
        <div style={{ padding: '20px 22px' }}>
          <div style={{ background: '#F59E0B12', border: '1px solid #F59E0B30', borderRadius: 12, padding: '18px 20px', marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Crown size={20} color="#F59E0B" />
                <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 16, color: T.text }}>
                  {profile?.plan === 'premium' || profile?.plan === 'vip' ? 'Paket Premium' : 'Paket Free'}
                </div>
              </div>
              {isActive && (
                <span style={{ fontSize: 11, padding: '4px 10px', borderRadius: 20, background: '#22C55E20', color: '#22C55E', fontWeight: 700 }}>Aktif</span>
              )}
            </div>
            {expiresAt ? (
              <div style={{ fontSize: 13, color: T.text3, marginBottom: 4 }}>
                {isActive ? 'Aktif hingga ' : 'Berakhir pada '}
                <strong style={{ color: T.text }}>
                  {expiresAt.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </strong>
              </div>
            ) : (
              <div style={{ fontSize: 13, color: T.text3, marginBottom: 4 }}>Tidak ada langganan aktif</div>
            )}
            <div style={{ fontSize: 12, color: T.text4 }}>Akses penuh: semua materi, tryout, live class & rekaman</div>
          </div>
          <button style={{ padding: '11px 24px', background: '#F59E0B', color: '#fff', fontWeight: 700, fontSize: 13, border: 'none', borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7 }}>
            <Crown size={14} /> Perpanjang Langganan
          </button>
        </div>
      </div>

      {/* Transaction history */}
      <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ padding: '16px 22px', borderBottom: `1px solid ${T.border}` }}>
          <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, color: T.text }}>Riwayat Transaksi</div>
        </div>
        <div style={{ padding: '8px 0' }}>
          {loadingTx ? (
            <div style={{ padding: '24px', textAlign: 'center', color: T.text4, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <Loader size={15} style={{ animation: 'spin 1s linear infinite' }} /> Memuat transaksi...
            </div>
          ) : transactions.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: T.text4, fontSize: 13 }}>Belum ada riwayat transaksi.</div>
          ) : (
            transactions.map((tx, i) => (
              <div key={tx.id || i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 22px', borderBottom: i < transactions.length - 1 ? `1px solid ${T.border}` : 'none' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{tx.program_name || tx.description || 'Pembelian Program'}</div>
                  <div style={{ fontSize: 11, color: T.text4, marginTop: 2 }}>{tx.created_at ? new Date(tx.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>
                    {tx.amount ? `Rp${Number(tx.amount).toLocaleString('id-ID')}` : '-'}
                  </div>
                  <span style={{
                    fontSize: 10, padding: '2px 8px', borderRadius: 6, fontWeight: 700,
                    background: tx.status === 'paid' ? '#22C55E20' : tx.status === 'pending' ? '#F59E0B20' : '#EF444420',
                    color:      tx.status === 'paid' ? '#22C55E'   : tx.status === 'pending' ? '#F59E0B'   : '#EF4444',
                  }}>
                    {tx.status === 'paid' ? 'Lunas' : tx.status === 'pending' ? 'Pending' : tx.status || '-'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Main ───────────────────────────────────────────────────────── */
export default function ProfilPage() {
  const { T, C }          = useTheme();
  const { user, setUser, logout } = useAuthStore();
  const { confirm, modal: confirmModal } = useConfirm();
  const resp = useResponsive();

  const [activeNav, setActiveNav]   = useState('info');
  const [profile, setProfile]       = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [transactions, setTransactions]     = useState([]);
  const [loadingTx, setLoadingTx]           = useState(false);
  const [profileError, setProfileError]     = useState('');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarProgress, setAvatarProgress] = useState(0);
  const avatarInputRef = useRef(null);

  // Fetch profile on mount
  useEffect(() => {
    (async () => {
      try {
        const data = await authApi.me();
        setProfile(data);
        setUser?.(data);
      } catch (err) {
        setProfileError('Gagal memuat profil. Coba refresh halaman.');
      } finally {
        setLoadingProfile(false);
      }
    })();
  }, []);

  // Fetch transactions when langganan tab active
  useEffect(() => {
    if (activeNav !== 'langganan') return;
    setLoadingTx(true);
    paymentApi.getHistory()
      .then(setTransactions)
      .catch(() => setTransactions([]))
      .finally(() => setLoadingTx(false));
  }, [activeNav]);

  const handleUpdate = (updated) => {
    setProfile(updated);
    setUser?.(updated);
  };

  const initials = getInitials(profile?.name || user?.name || '');
  const avatarUrl = profile?.avatar_url || user?.avatar_url || '';

  const handleAvatarUpload = (file) => {
    if (!file) return;
    const form = new FormData();
    form.append('file', file);
    setAvatarUploading(true);
    setAvatarProgress(0);
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/upload');
    xhr.setRequestHeader('Authorization', 'Bearer ' + (useAuthStore.getState().token || ''));
    xhr.upload.onprogress = (e) => { if (e.lengthComputable) setAvatarProgress(Math.round((e.loaded / e.total) * 100)); };
    xhr.onload = () => {
      setAvatarUploading(false);
      if (xhr.status < 200 || xhr.status >= 300) return toast.error('Gagal upload avatar');
      const data = JSON.parse(xhr.responseText);
      authApi.updateProfile({ avatar_url: data.url }).then((updated) => {
        setProfile(updated);
        setUser?.(updated);
      }).catch(() => toast.error('Gagal menyimpan avatar'));
    };
    xhr.onerror = () => { setAvatarUploading(false); toast.error('Gagal upload avatar'); };
    xhr.send(form);
  };

  const handleAvatarFile = (e) => {
    const file = e.target.files?.[0];
    if (file) handleAvatarUpload(file);
    e.target.value = '';
  };

  // Stats derived from profile / store
  const stats = [
    { label: 'Skor Tertinggi', value: profile?.highest_score ?? user?.highest_score ?? '—', color: '#FF6B00' },
    { label: 'Rank Nasional',  value: profile?.rank          ? `#${profile.rank}`          : '—', color: '#F59E0B' },
    { label: 'Day Streak',     value: profile?.streak        ? `${profile.streak}🔥`        : '—', color: '#EF4444' },
    { label: 'Poin Reward',    value: profile?.points        != null ? Number(profile.points).toLocaleString('id-ID') : '—', color: '#22C55E' },
  ];

  if (loadingProfile) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 260, gap: 10, color: T.text4, fontSize: 13 }}>
      <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      Memuat profil...
    </div>
  );

  if (profileError) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, gap: 8, color: '#EF4444', fontSize: 13 }}>
      <AlertCircle size={16} /> {profileError}
    </div>
  );

  return (
    <>
      <SEO title="Profil Saya" url="/profil" noindex />
      <div style={{ width: '100%' }}>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22, color: T.text, marginBottom: 4 }}>Profil Saya</h2>
        <p style={{ fontSize: 13, color: T.text3 }}>Kelola informasi akun dan preferensi belajar</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: resp.isMobile ? '1fr' : resp.isTablet ? '1fr' : '260px 1fr', gap: 20 }}>
        {/* ── Left sidebar ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Profile card */}
          <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 14, padding: '24px 20px', textAlign: 'center' }}>
            <div style={{ position: 'relative', width: 80, height: 80, margin: '0 auto 12px' }}>
              {avatarUrl ? (
                <img src={avatarUrl} alt="" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: `3px solid ${C.orange}` }} />
              ) : (
                <div style={{
                  width: 80, height: 80, borderRadius: '50%',
                  background: C.orange + '25', border: `3px solid ${C.orange}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 24, color: C.orange,
                }}>{initials}</div>
              )}
              <button
                onClick={() => avatarInputRef.current?.click()}
                disabled={avatarUploading}
                style={{
                  position: 'absolute', bottom: 0, right: 0,
                  width: 26, height: 26, borderRadius: '50%',
                  background: C.orange, border: '2px solid ' + T.bg2,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                }}
              >
                {avatarUploading ? <Loader2 size={10} color="#fff" style={{ animation: 'spin 1s linear infinite' }} /> : <Camera size={12} color="#fff" />}
              </button>
              {avatarUploading && (
                <div style={{ position: 'absolute', bottom: -16, left: '50%', transform: 'translateX(-50%)', width: 60, height: 3, borderRadius: 2, background: T.bg4, overflow: 'hidden' }}>
                  <div style={{ width: `${avatarProgress}%`, height: '100%', borderRadius: 2, background: C.orange, transition: 'width 0.3s' }} />
                </div>
              )}
            </div>
            <input ref={avatarInputRef} type="file" accept="image/*" onChange={handleAvatarFile} style={{ display: 'none' }} />
            <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 16, color: T.text, marginBottom: 2 }}>
              {profile?.name || user?.name || '—'}
            </div>
            <div style={{ fontSize: 12, color: T.text4, marginBottom: 10 }}>
              {profile?.email || user?.email || '—'}
            </div>
            {/* Plan badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '5px 12px', borderRadius: 20,
              background: '#F59E0B20', border: '1px solid #F59E0B40',
              fontSize: 11, fontWeight: 700, color: '#F59E0B', marginBottom: 4,
            }}>
              <Crown size={11} /> {profile?.plan || 'Member'}
            </div>
            {profile?.plan_expiry && (
              <div style={{ fontSize: 11, color: T.text4, marginBottom: 16 }}>
                Aktif hingga {new Date(profile.plan_expiry).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
            )}
            {/* Stats grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
              {stats.map(s => (
                <div key={s.label} style={{ background: T.bg3, borderRadius: 9, padding: '10px 8px', textAlign: 'center' }}>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 16, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 10, color: T.text4, marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Nav menu */}
          <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 14, overflow: 'hidden' }}>
            {NAV_ITEMS.map((item, i) => {
              const Icon = item.icon;
              const active = activeNav === item.id;
              return (
                <button key={item.id} onClick={() => setActiveNav(item.id)} style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '12px 18px',
                  background: active ? C.orange + '12' : 'transparent',
                  border: 'none',
                  borderBottom: i < NAV_ITEMS.length - 1 ? `1px solid ${T.border}` : 'none',
                  cursor: 'pointer', color: active ? C.orange : T.text3,
                  fontSize: 13, fontWeight: active ? 700 : 400, textAlign: 'left',
                }}>
                  <Icon size={16} color="inherit" /> {item.label}
                </button>
              );
            })}
            <button onClick={async () => { if (await confirm('Yakin ingin keluar?')) logout(); }} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10,
              padding: '12px 18px', background: 'transparent',
              border: 'none', borderTop: `1px solid ${T.border}`,
              cursor: 'pointer', color: '#EF4444', fontSize: 13, textAlign: 'left',
            }}>
              <LogOut size={16} /> Keluar Akun
            </button>
          </div>
        </div>

        {/* ── Right content ── */}
        <div>
          {activeNav === 'info'      && <InfoTab       profile={profile} onUpdate={handleUpdate} T={T} C={C} />}
          {activeNav === 'password'  && <PasswordTab   T={T} C={C} />}
          {activeNav === 'notif'     && <NotifTab      T={T} C={C} />}
          {activeNav === 'langganan' && <LanggananTab profile={profile} transactions={transactions} loadingTx={loadingTx} T={T} C={C} />}
        </div>
      </div>
      </div>
      {confirmModal}
    </>
  );
}