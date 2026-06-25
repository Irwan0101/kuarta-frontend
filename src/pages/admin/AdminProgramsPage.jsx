// src/pages/admin/AdminProgramsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { useTheme } from '@/hooks/useTheme';
import ImageUpload from '@/components/ui/ImageUpload';
import {
  PageHeader, Card, CardHead, Btn, Spinner, ErrorBox,
  Modal, FormGroup, FormRow, TableHead, EmptyRow, ORG, RED, GREEN, BLUE,
} from './adminUtils';

const EMPTY = { name: '', description: '', price: '', icon: '📚', color: ORG, thumbnail_url: '' };

export default function AdminProgramsPage() {
  const { T } = useTheme();
  const [programs, setPrograms] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [modal,    setModal]    = useState(null); // null | 'create' | program-obj
  const [form,     setForm]     = useState(EMPTY);
  const [saving,   setSaving]   = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { setPrograms(await adminApi.getPrograms()); }
    catch (e) { setError(e?.message || 'Gagal memuat programs.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setForm(EMPTY); setModal('create'); };
  const openEdit   = (p)  => { setForm({ name: p.name, description: p.description ?? '', price: p.price ?? '', icon: p.icon ?? '📚', color: p.color ?? ORG, thumbnail_url: p.thumbnail_url ?? '' }); setModal(p); };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (modal === 'create') await adminApi.createProgram(form);
      else await adminApi.updateProgram(modal.id, form);
      setModal(null); load();
    } catch (e) { alert(e?.message || 'Gagal menyimpan.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Hapus program ini?')) return;
    try { await adminApi.deleteProgram(id); load(); }
    catch (e) { alert(e?.message || 'Gagal hapus.'); }
  };

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const inp = { padding: '9px 12px', fontSize: 13, borderRadius: 9, background: T.bg3, border: `1px solid ${T.border}`, color: T.text, outline: 'none', width: '100%', boxSizing: 'border-box' };

  return (
    <div>
      <PageHeader
        title="📚 Manajemen Programs"
        subtitle={`${programs.length} program tersedia`}
        action={<Btn onClick={openCreate}><Plus size={14} /> Tambah Program</Btn>}
      />

      <Card>
        <CardHead title="Daftar Program" />
        {error && <div style={{ padding: 16 }}><ErrorBox msg={error} /></div>}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <TableHead cols={['Program', 'Deskripsi', 'Harga', { label: 'Aksi', right: true }]} />
            <tbody>
              {loading
                ? <tr><td colSpan={4}><Spinner /></td></tr>
                : programs.length === 0
                  ? <EmptyRow cols={4} />
                  : programs.map(p => (
                    <tr key={p.id} style={{ borderBottom: `1px solid ${T.border}` }}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 36, height: 36, borderRadius: 9, background: (p.color ?? ORG) + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                            {p.icon ?? '📚'}
                          </div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{p.name}</div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 12, color: T.text3, maxWidth: 280 }}>
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.description ?? '-'}</div>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, color: GREEN }}>
                        {p.price ? `Rp${Number(p.price).toLocaleString('id-ID')}` : 'Gratis'}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                          <Btn size="sm" variant="outline" color={BLUE} onClick={() => openEdit(p)}>
                            <Edit2 size={12} /> Edit
                          </Btn>
                          <Btn size="sm" variant="outline" color={RED} onClick={() => handleDelete(p.id)}>
                            <Trash2 size={12} /> Hapus
                          </Btn>
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </Card>

      {modal && (
        <Modal title={modal === 'create' ? 'Tambah Program' : 'Edit Program'} onClose={() => setModal(null)}>
          <FormRow>
            <FormGroup label="Nama Program">
              <input style={inp} value={form.name} onChange={set('name')} placeholder="SKD CPNS 2026" />
            </FormGroup>
            <FormGroup label="Harga (Rp)">
              <input style={inp} type="number" value={form.price} onChange={set('price')} placeholder="299000" />
            </FormGroup>
          </FormRow>
          <FormRow>
            <FormGroup label="Icon (emoji)">
              <input style={inp} value={form.icon} onChange={set('icon')} placeholder="📚" />
            </FormGroup>
            <FormGroup label="Warna (hex)">
              <input style={inp} value={form.color} onChange={set('color')} placeholder="#FF6B00" />
            </FormGroup>
          </FormRow>
          <FormGroup label="Deskripsi">
            <textarea style={{ ...inp, resize: 'vertical' }} rows={3} value={form.description} onChange={set('description')} placeholder="Deskripsi singkat program..." />
          </FormGroup>
          <FormGroup label="Thumbnail">
            <ImageUpload value={form.thumbnail_url} onChange={v => setForm(f => ({ ...f, thumbnail_url: v }))} />
          </FormGroup>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
            <Btn variant="outline" color={T.text4} onClick={() => setModal(null)}>Batal</Btn>
            <Btn onClick={handleSave} disabled={saving || !form.name}>{saving ? 'Menyimpan...' : 'Simpan'}</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}