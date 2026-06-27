// src/pages/admin/AdminLivePage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, Video, Clock, Users } from 'lucide-react';
import { adminApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { useTheme } from '@/hooks/useTheme';
import { useConfirm } from '@/hooks/useConfirm';
import {
  PageHeader, Card, CardHead, Btn, Badge, Spinner, ErrorBox,
  Modal, FormGroup, FormRow, TableHead, EmptyRow,
  ORG, RED, GREEN, BLUE,
} from './adminUtils';

const EMPTY = {
  title:        '',
  mentor_id:    '',
  category_tag: '',
  scheduled_at: '',
  duration_mins: 60,
  zoom_url:     '',
};

const SUBJECTS = [
  'Tes Wawasan Kebangsaan (TWK)',
  'Tes Intelejensia Umum (TIU)',
  'Tes Karakteristik Pribadi (TKP)',
];

function statusOf(scheduled_at) {
  if (!scheduled_at) return 'draft';
  const diff = new Date(scheduled_at) - Date.now();
  if (diff < 0 && diff > -7200000) return 'live';
  if (diff < 0) return 'selesai';
  return 'mendatang';
}

const STATUS_COLOR = { live: RED, mendatang: GREEN, selesai: '#6b7280', draft: '#F59E0B' };

export default function AdminLivePage() {
  const { T } = useTheme();
  const { confirm, modal: confirmModal } = useConfirm();
  const [classes,  setClasses]  = useState([]);
  const [mentors,  setMentors]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [modal,    setModal]    = useState(null);
  const [form,     setForm]     = useState(EMPTY);
  const [saving,   setSaving]   = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      // FIX: pakai getLiveClasses, bukan getSchedule
      const [classRes, userRes] = await Promise.all([
        adminApi.getLiveClasses(),
        adminApi.getUsers({ role: 'mentor', limit: 100 }),
      ]);
      setClasses(classRes ?? []);
      setMentors(userRes?.users ?? []);
    } catch (e) { setError(e?.message || 'Gagal memuat jadwal.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setForm(EMPTY); setModal('create'); };
  const openEdit   = (c) => {
    setForm({
      title:         c.title ?? '',
      mentor_id:     c.mentor_id ?? '',
      category_tag:  c.category_tag ?? '',
      scheduled_at:  c.scheduled_at ? c.scheduled_at.slice(0, 16) : '',
      duration_mins: c.duration_mins ?? 60,
      zoom_url:      c.zoom_url ?? '',
    });
    setModal(c);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        title:         form.title,
        mentor_id:     form.mentor_id || null,
        category_tag:  form.category_tag || null,
        scheduled_at:  form.scheduled_at,
        duration_mins: Number(form.duration_mins),
        zoom_url:      form.zoom_url || null,
      };
      // FIX: pakai createLiveClass / updateLiveClass
      if (modal === 'create') await adminApi.createLiveClass(payload);
      else await adminApi.updateLiveClass(modal.id, payload);
      setModal(null); load();
    } catch (e) { toast.error(e?.message || 'Gagal menyimpan.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!(await confirm('Hapus sesi live ini?'))) return;
    try { await adminApi.deleteLiveClass(id); load(); }
    catch (e) { toast.error(e?.message || 'Gagal menghapus.'); }
  };

  const setF = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const inp  = {
    padding: '9px 12px', fontSize: 13, borderRadius: 9,
    background: T.bg3, border: `1px solid ${T.border}`,
    color: T.text, outline: 'none', width: '100%', boxSizing: 'border-box',
  };

  return (
    <div>
      <PageHeader
        title="🎥 Manajemen Live Class"
        subtitle={`${classes.length} sesi terdaftar`}
        action={<Btn onClick={openCreate}><Plus size={14} /> Tambah Sesi</Btn>}
      />

      {error && <div style={{ marginBottom: 16 }}><ErrorBox msg={error} /></div>}

      <Card>
        <CardHead title="Jadwal Live Class" />
        {loading
          ? <Spinner />
          : classes.length === 0
            ? <div style={{ padding: 32, textAlign: 'center', opacity: .4, fontSize: 13 }}>Belum ada sesi live class.</div>
            : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <TableHead cols={['Judul', 'Mentor', 'Mata Uji', 'Waktu', 'Durasi', 'Status', { label: 'Aksi', right: true }]} />
                  <tbody>
                    {classes.map(c => {
                      const st = statusOf(c.scheduled_at);
                      return (
                        <tr key={c.id} style={{ borderBottom: `1px solid ${T.border}` }}>
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                              <div style={{
                                width: 34, height: 34, borderRadius: 8,
                                background: (st === 'live' ? RED : BLUE) + '15',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                              }}>
                                <Video size={15} color={st === 'live' ? RED : BLUE} />
                              </div>
                              <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{c.title}</div>
                            </div>
                          </td>
                          {/* FIX: pakai mentor_name (dari JOIN di backend) */}
                          <td style={{ padding: '12px 16px', fontSize: 12, color: T.text3 }}>{c.mentor_name ?? '-'}</td>
                          <td style={{ padding: '12px 16px', fontSize: 12, color: T.text3, maxWidth: 180 }}>
                            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {c.category_tag ?? '-'}
                            </div>
                          </td>
                          <td style={{ padding: '12px 16px', fontSize: 12, color: T.text3, whiteSpace: 'nowrap' }}>
                            {c.scheduled_at
                              ? new Date(c.scheduled_at).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
                              : '-'}
                          </td>
                          {/* FIX: pakai duration_mins, bukan duration */}
                          <td style={{ padding: '12px 16px', fontSize: 12, color: T.text4 }}>{c.duration_mins ?? '-'} mnt</td>
                          <td style={{ padding: '12px 16px' }}>
                            {st === 'live'
                              ? <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: RED, display: 'inline-block', animation: 'pulse 1.5s infinite' }} />
                                  <Badge label="LIVE" color={RED} />
                                  <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}`}</style>
                                </span>
                              : <Badge label={st} color={STATUS_COLOR[st]} />}
                          </td>
                          <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                              <Btn size="sm" variant="outline" color={BLUE} onClick={() => openEdit(c)}>
                                <Edit2 size={12} /> Edit
                              </Btn>
                              <Btn size="sm" variant="outline" color={RED} onClick={() => handleDelete(c.id)}>
                                <Trash2 size={12} /> Hapus
                              </Btn>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
      </Card>

      {modal && (
        <Modal
          title={modal === 'create' ? 'Tambah Sesi Live' : 'Edit Sesi Live'}
          onClose={() => setModal(null)}
          width={580}
        >
          <FormRow>
            <FormGroup label="Judul Sesi">
              <input style={inp} value={form.title} onChange={setF('title')} placeholder="Analogi Kata & Silogisme" />
            </FormGroup>
            {/* FIX: mentor pakai dropdown dari daftar user mentor */}
            <FormGroup label="Mentor">
              <select style={inp} value={form.mentor_id} onChange={setF('mentor_id')}>
                <option value="">-- Pilih Mentor --</option>
                {mentors.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </FormGroup>
          </FormRow>
          {/* FIX: field category_tag, bukan subject */}
          <FormGroup label="Mata Uji">
            <select style={inp} value={form.category_tag} onChange={setF('category_tag')}>
              <option value="">-- Pilih --</option>
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </FormGroup>
          <FormRow>
            <FormGroup label="Waktu Mulai">
              <input style={inp} type="datetime-local" value={form.scheduled_at} onChange={setF('scheduled_at')} />
            </FormGroup>
            {/* FIX: field duration_mins, bukan duration */}
            <FormGroup label="Durasi (menit)">
              <input style={inp} type="number" value={form.duration_mins} onChange={setF('duration_mins')} placeholder="60" />
            </FormGroup>
          </FormRow>
          {/* FIX: field zoom_url, bukan zoom_link */}
          <FormGroup label="Link Zoom">
            <input style={inp} value={form.zoom_url} onChange={setF('zoom_url')} placeholder="https://zoom.us/j/..." />
          </FormGroup>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
            <Btn variant="outline" color={T.text4} onClick={() => setModal(null)}>Batal</Btn>
            <Btn onClick={handleSave} disabled={saving || !form.title || !form.scheduled_at}>
              {saving ? 'Menyimpan...' : 'Simpan'}
            </Btn>
          </div>
        </Modal>
      )}
      {confirmModal}
    </div>
  );
}