import { useState, useEffect } from 'react';
import { Crown, UserX, Edit2, CheckCircle, XCircle, Star, Plus, GraduationCap, PlusCircle, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminApi } from '@/lib/api';
import { useTheme } from '@/hooks/useTheme';
import useResponsive from '@/hooks/useResponsive';
import { useConfirm } from '@/hooks/useConfirm';
import ImageUpload from '@/components/ui/ImageUpload';
import {
  PageHeader, Card, CardHead, Btn, Badge, Spinner, ErrorBox,
  Modal, FormGroup, FormRow, TableHead, TableWrapper, EmptyRow, ORG, RED, GREEN, BLUE,
} from './adminUtils';

export default function AdminMentorsPage() {
  const { T } = useTheme();
  const resp = useResponsive();
  const { confirm, modal: confirmModal } = useConfirm();
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMentor, setEditMentor] = useState(null);
  const [addModal, setAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', email: '', password: '', plan: 'free' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true); setError('');
    try { setMentors(await adminApi.getMentors()); }
    catch (e) { setError(e?.message || 'Gagal memuat mentor.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleToggle = async (id, active) => {
    try {
      await adminApi.updateMentor(id, { is_active: !active });
      toast.success(`Mentor ${active ? 'dinonaktifkan' : 'diaktifkan'}`);
      load();
    } catch (e) { toast.error(e?.message || 'Gagal update mentor.'); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminApi.updateMentor(editMentor.id, {
        name: editMentor.name, city: editMentor.city, bio: editMentor.bio,
        specialization: editMentor.specialization || [],
        photo_url: editMentor.photo_url || '',
        schedule: editMentor.schedule || [],
      });
      setEditMentor(null); load(); toast.success('Mentor diperbarui');
    } catch (e) { toast.error(e?.message || 'Gagal.'); }
    finally { setSaving(false); }
  };

  const handleAddMentor = async () => {
    if (!addForm.name || !addForm.email || !addForm.password) return toast.error('Nama, email, dan password wajib diisi');
    setSaving(true);
    try {
      await adminApi.createUser({ ...addForm, role: 'mentor' });
      toast.success('Mentor berhasil ditambahkan');
      setAddModal(false);
      setAddForm({ name: '', email: '', password: '', plan: 'free' });
      load();
    } catch (e) { toast.error(e?.message || 'Gagal menambah mentor.'); }
    finally { setSaving(false); }
  };

  const cellPad = resp.isMobile ? '7px 10px' : '11px 16px';
  const inp = { padding: '9px 12px', fontSize: resp.isMobile ? 12 : 13, borderRadius: 9, background: T.bg3, border: `1px solid ${T.border}`, color: T.text, outline: 'none', width: '100%', boxSizing: 'border-box' };

  return (
    <div>
      <PageHeader title={<><GraduationCap size={22} style={{verticalAlign:'middle',marginRight:8}} /> Manajemen Mentor</>} subtitle="Kelola mentor dan jadwal mengajar" action={<Btn onClick={() => setAddModal(true)}><Plus size={14} /> Tambah Mentor</Btn>} />
      <Card>
        <CardHead title="Daftar Mentor" />
        {error && <div style={{ padding: 16 }}><ErrorBox msg={error} /></div>}
        <div style={{ overflowX: 'auto' }}>
          <TableWrapper><table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <TableHead cols={['#', 'Nama', 'Email', 'Kota', 'Kelas', 'Sesi', 'Status', { label: 'Aksi', right: true }]} />
            <tbody>
              {loading ? <tr><td colSpan={8}><Spinner /></td></tr>
              : mentors.length === 0 ? <EmptyRow cols={8} msg="Belum ada mentor." />
              : mentors.map((m, i) => (
                <tr key={m.id} style={{ borderBottom: `1px solid ${T.border}` }}>
                  <td style={{ padding: cellPad, fontSize: 12, color: T.text4 }}>{i + 1}</td>
                  <td style={{ padding: cellPad }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 30, height: 30, borderRadius: '50%', background: BLUE + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: BLUE }}>
                        {m.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <span style={{ fontSize: resp.isMobile ? 12 : 13, fontWeight: 600, color: T.text }}>{m.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: cellPad, fontSize: 12, color: T.text3 }}>{m.email}</td>
                  <td style={{ padding: cellPad, fontSize: 12, color: T.text4 }}>{m.city || '—'}</td>
                  <td style={{ padding: cellPad, fontSize: 12 }}><Badge label={m.total_classes || 0} color={BLUE} /></td>
                  <td style={{ padding: cellPad, fontSize: 12 }}><Badge label={m.total_sessions || 0} color={ORG} /></td>
                  <td style={{ padding: cellPad }}>
                    <Badge label={m.is_active !== false ? 'Aktif' : 'Nonaktif'} color={m.is_active !== false ? GREEN : RED} />
                  </td>
                  <td style={{ padding: cellPad, textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <Btn size="sm" variant="outline" color={BLUE} onClick={() => setEditMentor({ ...m })}>
                        <Edit2 size={12} /> Edit
                      </Btn>
                      <Btn size="sm" variant="outline" color={m.is_active !== false ? RED : GREEN} onClick={async () => { if (await confirm(`Yakin ${m.is_active !== false ? 'menonaktifkan' : 'mengaktifkan'} mentor ${m.name}?`)) handleToggle(m.id, m.is_active); }}>
                        {m.is_active !== false ? <UserX size={12} /> : <CheckCircle size={12} />} {m.is_active !== false ? 'Nonaktifkan' : 'Aktifkan'}
                      </Btn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table></TableWrapper>
        </div>
      </Card>

      {/* Add modal */}
      {addModal && (
        <Modal title={<><Plus size={16} style={{verticalAlign:'middle',marginRight:6}} /> Tambah Mentor Baru</>} onClose={() => setAddModal(false)} width={480}>
          <FormRow style={resp.isMobile ? { gridTemplateColumns: '1fr' } : {}}>
            <FormGroup label="Nama *"><input value={addForm.name} onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))} style={inp} placeholder="Rizal Saputra" /></FormGroup>
            <FormGroup label="Email *"><input value={addForm.email} onChange={e => setAddForm(f => ({ ...f, email: e.target.value }))} style={inp} placeholder="rizal@kuarta.id" /></FormGroup>
          </FormRow>
          <FormRow style={resp.isMobile ? { gridTemplateColumns: '1fr' } : {}}>
            <FormGroup label="Password *"><input type="password" value={addForm.password} onChange={e => setAddForm(f => ({ ...f, password: e.target.value }))} style={inp} placeholder="Min 6 karakter" /></FormGroup>
            <FormGroup label="Plan">
              <select value={addForm.plan} onChange={e => setAddForm(f => ({ ...f, plan: e.target.value }))} style={inp}>
                <option value="free">Free</option>
                <option value="premium">Premium</option>
                <option value="vip">VIP</option>
              </select>
            </FormGroup>
          </FormRow>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
            <Btn variant="outline" color={T.text4} onClick={() => setAddModal(false)}>Batal</Btn>
            <Btn onClick={handleAddMentor} disabled={saving}>{saving ? 'Menyimpan...' : 'Tambah'}</Btn>
          </div>
        </Modal>
      )}

      {editMentor && (
        <Modal title={`Edit Mentor: ${editMentor.name}`} onClose={() => setEditMentor(null)} width={resp.isMobile ? undefined : 600}>
          <FormRow style={resp.isMobile ? { gridTemplateColumns: '1fr' } : { gridTemplateColumns: '1fr 1fr' }}>
            <FormGroup label="Nama"><input value={editMentor.name} onChange={e => setEditMentor(m => ({ ...m, name: e.target.value }))} style={inp} /></FormGroup>
            <FormGroup label="Kota"><input value={editMentor.city || ''} onChange={e => setEditMentor(m => ({ ...m, city: e.target.value }))} style={inp} /></FormGroup>
          </FormRow>
          <FormGroup label="Bio">
            <textarea rows={2} value={editMentor.bio || ''} onChange={e => setEditMentor(m => ({ ...m, bio: e.target.value }))} style={{ ...inp, resize: 'vertical' }} />
          </FormGroup>
          <FormGroup label="Spesialisasi (tekan Enter setelah tiap kata kunci)">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '6px 8px', background: T.bg3, border: `1px solid ${T.border}`, borderRadius: 9, minHeight: 38, alignItems: 'center' }}>
              {(editMentor.specialization || []).map((s, i) => (
                <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: ORG + '18', color: ORG, fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 6 }}>
                  {s}
                  <button onClick={() => setEditMentor(m => ({ ...m, specialization: (m.specialization || []).filter((_, j) => j !== i) }))} style={{ background: 'none', border: 'none', color: ORG, cursor: 'pointer', fontSize: 13, padding: 0, lineHeight: 1 }}>&times;</button>
                </span>
              ))}
              <input placeholder="TIU, Matematika, ..." style={{ border: 'none', background: 'transparent', color: T.text, fontSize: 12, outline: 'none', flex: 1, minWidth: 80 }}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const val = e.target.value.trim();
                    if (val && !(editMentor.specialization || []).includes(val)) {
                      setEditMentor(m => ({ ...m, specialization: [...(m.specialization || []), val] }));
                    }
                    e.target.value = '';
                  }
                }} />
            </div>
          </FormGroup>
          <FormGroup label="Foto">
            <ImageUpload value={editMentor.photo_url || ''} onChange={v => setEditMentor(m => ({ ...m, photo_url: v }))} />
          </FormGroup>
          <FormGroup label="Jadwal Mengajar">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(editMentor.schedule || []).map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <select value={s.day} onChange={e => {
                    const upd = [...(editMentor.schedule || [])];
                    upd[i] = { ...upd[i], day: e.target.value };
                    setEditMentor(m => ({ ...m, schedule: upd }));
                  }} style={{ ...inp, width: 110 }}>
                    {['Senin','Selasa','Rabu','Kamis',"Jum'at",'Sabtu','Minggu'].map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <input type="time" value={s.start || '09:00'} onChange={e => {
                    const upd = [...(editMentor.schedule || [])];
                    upd[i] = { ...upd[i], start: e.target.value };
                    setEditMentor(m => ({ ...m, schedule: upd }));
                  }} style={{ ...inp, width: 90 }} />
                  <span style={{ color: T.text4, fontSize: 12 }}>—</span>
                  <input type="time" value={s.end || '15:00'} onChange={e => {
                    const upd = [...(editMentor.schedule || [])];
                    upd[i] = { ...upd[i], end: e.target.value };
                    setEditMentor(m => ({ ...m, schedule: upd }));
                  }} style={{ ...inp, width: 90 }} />
                  <button onClick={() => setEditMentor(m => ({ ...m, schedule: (m.schedule || []).filter((_, j) => j !== i) }))}
                    style={{ background: 'none', border: 'none', color: RED, cursor: 'pointer', padding: 4 }}><Trash2 size={14} /></button>
                </div>
              ))}
              <Btn size="sm" variant="outline" onClick={() => setEditMentor(m => ({ ...m, schedule: [...(m.schedule || []), { day: 'Senin', start: '09:00', end: '15:00' }] }))}>
                <PlusCircle size={12} /> Tambah Jadwal
              </Btn>
            </div>
          </FormGroup>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
            <Btn variant="outline" color={T.text4} onClick={() => setEditMentor(null)}>Batal</Btn>
            <Btn onClick={handleSave} disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan'}</Btn>
          </div>
        </Modal>
      )}
      {confirmModal}
    </div>
  );
}
