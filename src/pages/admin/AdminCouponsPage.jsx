import { useEffect, useState } from 'react';
import { useTheme } from '@/hooks/useTheme';
import useResponsive from '@/hooks/useResponsive';
import { useConfirm } from '@/hooks/useConfirm';
import { adminApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { Plus, Trash2, Tag } from 'lucide-react';

function CouponForm({ onSave, onCancel, C, T, programs, isMobile }) {
  const [code, setCode] = useState('');
  const [type, setType] = useState('percent');
  const [value, setValue] = useState(10);
  const [minPurchase, setMinPurchase] = useState(0);
  const [maxUses, setMaxUses] = useState(0);
  const [programId, setProgramId] = useState('');
  const [expiry, setExpiry] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim()) return toast.error('Kode kupon wajib diisi');
    try {
      await adminApi.createCoupon({
        code: code.toUpperCase(),
        type,
        value: Number(value),
        min_purchase: Number(minPurchase),
        max_uses: Number(maxUses),
        program_id: programId || null,
        expires_at: expiry || null,
      });
      toast.success('Kupon berhasil dibuat');
      onSave();
    } catch (err) {
      toast.error(err?.error || 'Gagal membuat kupon');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{
      background: T.bg3, borderRadius: 12, padding: isMobile ? 14 : 20, marginBottom: 20,
      border: `1px solid ${T.border}`,
    }}>
      <div style={{ fontWeight: 700, fontSize: 14, color: T.text, marginBottom: 16 }}>Buat Kupon Baru</div>
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
        <div>
          <label style={{ fontSize: 11, fontWeight: 700, color: T.text4, display: 'block', marginBottom: 4 }}>Kode Kupon</label>
          <input value={code} onChange={e => setCode(e.target.value)} placeholder="contoh: HEMAT50" style={{ textTransform: 'uppercase' }} />
        </div>
        <div>
          <label style={{ fontSize: 11, fontWeight: 700, color: T.text4, display: 'block', marginBottom: 4 }}>Tipe</label>
          <select value={type} onChange={e => setType(e.target.value)}>
            <option value="percent">Persen (%)</option>
            <option value="fixed">Nominal (Rp)</option>
          </select>
        </div>
        <div>
          <label style={{ fontSize: 11, fontWeight: 700, color: T.text4, display: 'block', marginBottom: 4 }}>Nilai</label>
          <input type="number" value={value} onChange={e => setValue(e.target.value)} />
        </div>
        <div>
          <label style={{ fontSize: 11, fontWeight: 700, color: T.text4, display: 'block', marginBottom: 4 }}>Min. Pembelian (Rp)</label>
          <input type="number" value={minPurchase} onChange={e => setMinPurchase(e.target.value)} placeholder="0 = tanpa minimal" />
        </div>
        <div>
          <label style={{ fontSize: 11, fontWeight: 700, color: T.text4, display: 'block', marginBottom: 4 }}>Maks. Pemakaian</label>
          <input type="number" value={maxUses} onChange={e => setMaxUses(e.target.value)} placeholder="0 = tidak terbatas" />
        </div>
        <div>
          <label style={{ fontSize: 11, fontWeight: 700, color: T.text4, display: 'block', marginBottom: 4 }}>Berlaku Sampai</label>
          <input type="datetime-local" value={expiry} onChange={e => setExpiry(e.target.value)} />
        </div>
        <div>
          <label style={{ fontSize: 11, fontWeight: 700, color: T.text4, display: 'block', marginBottom: 4 }}>Program (opsional)</label>
          <select value={programId} onChange={e => setProgramId(e.target.value)}>
            <option value="">Semua Program</option>
            {(programs || []).map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <button type="submit" style={{
          padding: '9px 20px', background: C.orange, color: '#fff', fontWeight: 700,
          fontSize: 13, border: 'none', borderRadius: 8, cursor: 'pointer',
        }}>
          Simpan Kupon
        </button>
        <button type="button" onClick={onCancel} style={{
          padding: '9px 20px', background: T.bg4, color: T.text3, fontWeight: 600,
          fontSize: 13, border: `1px solid ${T.border}`, borderRadius: 8, cursor: 'pointer',
        }}>
          Batal
        </button>
      </div>
    </form>
  );
}

export default function AdminCouponsPage() {
  const { T, C } = useTheme();
  const resp = useResponsive();
  const [coupons, setCoupons] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [c, p] = await Promise.all([
        adminApi.getCoupons().catch(() => []),
        adminApi.getPrograms().catch(() => []),
      ]);
      setCoupons(Array.isArray(c) ? c : []);
      setPrograms(Array.isArray(p) ? p : []);
    } catch (e) { setCoupons([]); }
    setLoading(false);
  };

  const { confirm, modal: confirmModal } = useConfirm();

  useEffect(() => { load(); }, []);

  const deleteCoupon = async (id) => {
    if (!(await confirm('Hapus kupon ini?'))) return;
    try {
      await adminApi.deleteCoupon(id);
      toast.success('Kupon dihapus');
      load();
    } catch (e) { toast.error('Gagal menghapus'); }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 22, color: T.text, marginBottom: 4 }}>
            Kupon Diskon
          </h1>
          <p style={{ fontSize: 13, color: T.text3 }}>Kelola kode promo & diskon</p>
        </div>
        <button onClick={() => setShowForm(s => !s)} style={{
          padding: '10px 20px', background: C.orange, color: '#fff', fontWeight: 700,
          fontSize: 13, border: 'none', borderRadius: 10, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <Plus size={16} /> {showForm ? 'Tutup' : 'Buat Kupon'}
        </button>
      </div>

      {showForm && <CouponForm C={C} T={T} programs={programs} onSave={() => { setShowForm(false); load(); }} onCancel={() => setShowForm(false)} isMobile={resp.isMobile} />}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: T.text4 }}>Memuat...</div>
      ) : coupons.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: T.text4 }}>
          <Tag size={40} style={{ marginBottom: 12, opacity: 0.5 }} />
          <div style={{ fontSize: 15, fontWeight: 700, color: T.text3, marginBottom: 4 }}>Belum ada kupon</div>
          <div style={{ fontSize: 13 }}>Buat kupon diskon untuk promosi</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {coupons.map(c => (
            <div key={c.id} style={{
              display: 'flex', alignItems: 'center', gap: resp.isMobile ? 10 : 14,
              background: T.bg2, border: `1px solid ${T.border}`,
              borderRadius: 10, padding: resp.isMobile ? '10px 12px' : '14px 18px',
              opacity: c.is_active ? 1 : 0.5,
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: c.is_active ? C.orange + '20' : T.bg4,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, flexShrink: 0,
              }}>
                {c.type === 'percent' ? '%' : 'Rp'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: T.text, fontFamily: 'monospace', letterSpacing: '0.05em' }}>
                  {c.code}
                </div>
                <div style={{ fontSize: 12, color: T.text4, marginTop: 2 }}>
                  {c.type === 'percent' ? `${c.value ?? 0}%` : `Rp ${(c.value ?? 0).toLocaleString('id-ID')}`}
                  {c.min_purchase > 0 && ` • Min. Rp ${(c.min_purchase ?? 0).toLocaleString('id-ID')}`}
                  {c.max_uses > 0 && ` • ${c.use_count}/${c.max_uses} terpakai`}
                  {c.expires_at && ` • ${new Date(c.expires_at).toLocaleDateString('id-ID')}`}
                  {!c.is_active && ' • Nonaktif'}
                </div>
              </div>
              <button onClick={() => deleteCoupon(c.id)} style={{
                background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: 6,
                opacity: 0.6,
              }}>
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}
      {confirmModal}
    </div>
  );
}