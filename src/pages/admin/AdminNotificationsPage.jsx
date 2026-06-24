import { useState } from 'react';
import { Send, Users, Crown, Bell, Megaphone } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminApi } from '@/lib/api';
import { useTheme } from '@/hooks/useTheme';
import useResponsive from '@/hooks/useResponsive';
import { PageHeader, Card, CardHead, Btn, FormGroup, FormRow, ORG, GREEN } from './adminUtils';

export default function AdminNotificationsPage() {
  const { T } = useTheme();
  const resp = useResponsive();
  const [form, setForm] = useState({ title: '', message: '', type: 'info', target: 'all' });
  const [sending, setSending] = useState(false);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSend = async () => {
    if (!form.title || !form.message) { toast.error('Judul dan pesan harus diisi'); return; }
    setSending(true);
    try {
      const res = await adminApi.broadcast(form);
      toast.success(`Notifikasi terkirim ke ${res.sent} user`);
      setForm({ title: '', message: '', type: 'info', target: 'all' });
    } catch (e) { toast.error(e?.message || 'Gagal mengirim.'); }
    finally { setSending(false); }
  };

  const inp = { padding: '9px 12px', fontSize: resp.isMobile ? 12 : 13, borderRadius: 9, background: T.bg3, border: `1px solid ${T.border}`, color: T.text, outline: 'none', width: '100%', boxSizing: 'border-box' };

  return (
    <div>
      <PageHeader title={<><Megaphone size={22} style={{verticalAlign:'middle',marginRight:8}} /> Kirim Notifikasi</>} subtitle="Broadcast ke seluruh pengguna atau segmen tertentu" />

      <div style={{ maxWidth: 600 }}>
        <Card>
          <CardHead title="Form Notifikasi" />
          <div style={{ padding: resp.isMobile ? '12px 14px' : '16px 20px' }}>
            <FormRow style={resp.isMobile ? { gridTemplateColumns: '1fr' } : {}}>
              <FormGroup label="Judul">
                <input value={form.title} onChange={set('title')} placeholder="Judul notifikasi" style={inp} />
              </FormGroup>
              <FormGroup label="Tipe">
                <select value={form.type} onChange={set('type')} style={inp}>
                  <option value="info">Info</option>
                  <option value="warning">Peringatan</option>
                  <option value="success">Sukses</option>
                  <option value="promo">Promo</option>
                </select>
              </FormGroup>
            </FormRow>
            <FormGroup label="Target">
              <div style={{ display: 'flex', gap: 10 }}>
                {[
                  { value: 'all', label: 'Semua User', icon: Users },
                  { value: 'premium', label: 'Premium', icon: Crown },
                ].map(o => {
                  const Icon = o.icon;
                  const active = form.target === o.value;
                  return (
                    <button key={o.value} onClick={() => setForm(f => ({ ...f, target: o.value }))} style={{
                      flex: 1, display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center',
                      padding: '10px 14px', borderRadius: 10, cursor: 'pointer', fontSize: 12, fontWeight: 700,
                      background: active ? ORG + '20' : T.bg3,
                      border: `1.5px solid ${active ? ORG : T.border}`,
                      color: active ? ORG : T.text3,
                    }}>
                      <Icon size={15} /> {o.label}
                    </button>
                  );
                })}
              </div>
            </FormGroup>
            <FormGroup label="Pesan">
              <textarea rows={4} value={form.message} onChange={set('message')} placeholder="Isi pesan notifikasi..." style={{ ...inp, resize: 'vertical' }} />
            </FormGroup>
            <Btn onClick={handleSend} disabled={sending} style={{ marginTop: 8 }}>
              <Send size={14} /> {sending ? 'Mengirim...' : 'Kirim Notifikasi'}
            </Btn>
          </div>
        </Card>
      </div>
    </div>
  );
}
