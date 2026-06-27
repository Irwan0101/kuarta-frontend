import { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Edit2, Trash2, Search, ChevronLeft, ChevronRight, HelpCircle, Upload, Link2, FileText, X, Loader2 } from 'lucide-react';
import { adminApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { useTheme } from '@/hooks/useTheme';
import { useConfirm } from '@/hooks/useConfirm';
import {
  PageHeader, Card, CardHead, Btn, Spinner, ErrorBox,
  Modal, FormGroup, FormRow,
  ORG, RED, GREEN, BLUE,
} from './adminUtils';

const CATS = ['TWK', 'TIU', 'TKP'];
const OPTS = ['a', 'b', 'c', 'd', 'e'];
const EMPTY = { question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', option_e: '', correct_answer: 'a', category: 'TIU', explanation: '', difficulty: 'medium', tryout_id: '' };
const PER = 20;
const CAT_COLORS = { TWK: ORG, TIU: BLUE, TKP: GREEN };
const DIFF_LABELS = { easy: 'Mudah', medium: 'Sedang', hard: 'Sulit' };

export default function AdminBankSoalPage() {
  const { T } = useTheme();
  const { confirm, modal: confirmModal } = useConfirm();

  const [programs,     setPrograms]     = useState([]);
  const [tryouts,      setTryouts]      = useState([]);
  const [selProg,      setSelProg]      = useState('');
  const [selCat,       setSelCat]       = useState('');
  const [search,       setSearch]       = useState('');
  const [questions,    setQuestions]    = useState([]);
  const [total,        setTotal]        = useState(0);
  const [page,         setPage]         = useState(1);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');
  const [modal,        setModal]        = useState(null);
  const [form,         setForm]         = useState(EMPTY);
  const [saving,       setSaving]       = useState(false);
  const [importModal,  setImportModal]  = useState(false);
  const [importText,   setImportText]   = useState('');
  const [importing,    setImporting]    = useState(false);
  const [assignModal,  setAssignModal]  = useState(false);
  const [selectedQ,    setSelectedQ]    = useState([]);
  const [allTryouts,   setAllTryouts]   = useState([]);
  const [assignTO,     setAssignTO]     = useState('');
  const [assigning,    setAssigning]    = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    adminApi.getPrograms()
      .then(p => setPrograms(Array.isArray(p) ? p : []))
      .catch(() => setPrograms([]));
  }, []);

  useEffect(() => {
    if (!selProg) { setTryouts([]); return; }
    adminApi.getTryouts(selProg)
      .then(t => setTryouts(Array.isArray(t) ? t : []))
      .catch(() => setTryouts([]));
  }, [selProg]);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const params = { page, limit: PER };
      if (selProg) params.program_id = selProg;
      if (selCat)  params.category = selCat;
      if (search)  params.search = search;
      const res = await adminApi.getAllQuestions(params);
      setQuestions(res.questions ?? []);
      setTotal(res.total ?? 0);
    } catch (e) {
      setError(e?.message || 'Gagal memuat soal.');
      setQuestions([]);
    } finally { setLoading(false); }
  }, [page, selProg, selCat, search]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.ceil(total / PER);

  const openAdd = () => { setForm({ ...EMPTY, tryout_id: tryouts[0]?.id || '' }); setModal('create'); };
  const openEdit = (q) => {
    setForm({
      question_text: q.question_text, option_a: q.option_a, option_b: q.option_b,
      option_c: q.option_c, option_d: q.option_d, option_e: q.option_e || '',
      correct_answer: q.correct_answer, category: q.category || 'TIU',
      explanation: q.explanation || '', difficulty: q.difficulty || 'medium',
    });
    setModal(q);
  };

  const handleSave = async () => {
    if (!form.question_text) return toast.error('Soal wajib diisi');
    setSaving(true);
    try {
      if (modal === 'create') {
        if (!form.tryout_id) return toast.error('Pilih tryout terlebih dahulu');
        await adminApi.addQuestion(form.tryout_id, form);
      } else await adminApi.updateQuestion(modal.id, form);
      setModal(null); load();
    } catch (e) { toast.error(e?.message || 'Gagal menyimpan.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!(await confirm('Hapus soal ini?'))) return;
    try { await adminApi.deleteQuestion(id); load(); }
    catch (e) { toast.error(e?.message || 'Gagal hapus.'); }
  };

  const handleImportJSON = async () => {
    let parsed;
    try { parsed = JSON.parse(importText); } catch { return toast.error('Format JSON tidak valid'); }
    const questions = Array.isArray(parsed) ? parsed : parsed.questions || parsed.data || [];
    if (!questions.length) return toast.error('Tidak ada soal dalam JSON');
    setImporting(true);
    try {
      const res = await adminApi.importQuestions(questions);
      toast.success(`${res.imported} soal berhasil diimport`);
      setImportModal(false); setImportText(''); load();
    } catch (e) { toast.error(e?.message || 'Gagal import'); }
    finally { setImporting(false); }
  };

  const handleImportDocx = async (file) => {
    if (!file) return;
    setImporting(true);
    try {
      const res = await adminApi.importDocx(file);
      toast.success(`${res.imported} soal berhasil diimport dari .docx`);
      setImportModal(false); load();
    } catch (e) { toast.error(e?.message || 'Gagal import file'); }
    finally { setImporting(false); }
  };

  const openAssign = async () => {
    const res = await adminApi.getPrograms().catch(() => []);
    const all = [];
    for (const p of Array.isArray(res) ? res : []) {
      const ts = await adminApi.getTryouts(p.id).catch(() => []);
      for (const t of Array.isArray(ts) ? ts : []) all.push({ ...t, program_name: p.name });
    }
    setAllTryouts(all);
    setAssignTO('');
    setAssignModal(true);
  };

  const handleAssign = async () => {
    if (!assignTO) return toast.error('Pilih tryout tujuan');
    if (!selectedQ.length) return toast.error('Pilih soal yang akan ditambahkan');
    setAssigning(true);
    try {
      const res = await adminApi.linkQuestionsToTryout(assignTO, selectedQ);
      toast.success(`${res.added} soal ditambahkan ke tryout`);
      setAssignModal(false); setSelectedQ([]);
    } catch (e) { toast.error(e?.message || 'Gagal menambahkan'); }
    finally { setAssigning(false); }
  };

  const toggleSelect = (id) => {
    setSelectedQ(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const setF = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const inp = { padding: '9px 12px', fontSize: 13, borderRadius: 9, background: T.bg3, border: `1px solid ${T.border}`, color: T.text, outline: 'none', width: '100%', boxSizing: 'border-box' };

  return (
    <div>
      <PageHeader
        title="Bank Soal"
        subtitle={`${total} soal`}
        action={
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn onClick={() => setImportModal(true)} variant="outline" color={ORG}><Upload size={14} /> Import</Btn>
            <Btn onClick={openAssign} variant="outline" color={BLUE} disabled={!questions.length}><Link2 size={14} /> Assign ke Tryout</Btn>
            <Btn onClick={openAdd} disabled={!selProg}><Plus size={14} /> Tambah Soal</Btn>
          </div>
        }
      />

      {error && <div style={{ marginBottom: 16 }}><ErrorBox msg={error} /></div>}

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <select value={selProg} onChange={e => { setSelProg(e.target.value); setPage(1); }}
          style={{ ...inp, width: 200, cursor: 'pointer' }}>
          <option value="">Semua Program</option>
          {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select value={selCat} onChange={e => { setSelCat(e.target.value); setPage(1); }}
          style={{ ...inp, width: 140, cursor: 'pointer' }}>
          <option value="">Semua Kategori</option>
          {CATS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: T.text4 }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Cari soal..." style={{ ...inp, paddingLeft: 32 }}
            onKeyDown={e => { if (e.key === 'Enter') setPage(1); }} />
        </div>
      </div>

      <Card>
        <CardHead title="Daftar Soal" />
        {loading ? <Spinner />
        : questions.length === 0
          ? <div style={{ padding: 40, textAlign: 'center', color: T.text4, fontSize: 13 }}>
              <HelpCircle size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
              {selProg ? 'Belum ada soal. Klik "Import" atau "Tambah Soal" untuk mulai.' : 'Pilih program untuk melihat soal.'}
            </div>
          : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${T.border}` }}>
                    <th style={{ padding: '10px 12px', width: 40 }}>
                      <input type="checkbox" onChange={e => setSelectedQ(e.target.checked ? questions.map(q => q.id) : [])}
                        checked={selectedQ.length === questions.length && questions.length > 0}
                        style={{ accentColor: ORG, cursor: 'pointer' }} />
                    </th>
                    {['No', 'Soal', 'Tryout', 'Kategori', 'Kesulitan', 'Jawaban', { label: 'Aksi', right: true }].map((c, i) => {
                      const isObj = typeof c === 'object';
                      return <th key={i} style={{ padding: '10px 12px', fontSize: 11, fontWeight: 700, color: T.text4, textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: isObj && c.right ? 'right' : 'left' }}>{isObj ? c.label : c}</th>;
                    })}
                  </tr>
                </thead>
                <tbody>
                  {questions.map((q, i) => (
                    <tr key={q.id} style={{ borderBottom: `1px solid ${T.border}`, background: selectedQ.includes(q.id) ? ORG + '08' : 'transparent' }}>
                      <td style={{ padding: '10px 12px' }}>
                        <input type="checkbox" checked={selectedQ.includes(q.id)} onChange={() => toggleSelect(q.id)}
                          style={{ accentColor: ORG, cursor: 'pointer' }} />
                      </td>
                      <td style={{ padding: '10px 12px', fontSize: 12, color: T.text4 }}>{(page - 1) * PER + i + 1}</td>
                      <td style={{ padding: '10px 12px', fontSize: 13, color: T.text, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={q.question_text}>
                        {q.question_text}
                      </td>
                      <td style={{ padding: '10px 12px', fontSize: 12, color: T.text3 }}>{q.tryout_title || (q.program_name || '-')}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: CAT_COLORS[q.category] || T.text3, background: (CAT_COLORS[q.category] || T.text3) + '18', padding: '2px 8px', borderRadius: 99 }}>
                          {q.category || '-'}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', fontSize: 12, color: T.text3 }}>{DIFF_LABELS[q.difficulty] || q.difficulty || '-'}</td>
                      <td style={{ padding: '10px 12px', fontSize: 12, fontWeight: 700, color: GREEN }}>{q.correct_answer?.toUpperCase() || '-'}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                          <Btn size="sm" variant="outline" color={BLUE} onClick={() => openEdit(q)}><Edit2 size={12} /></Btn>
                          <Btn size="sm" variant="outline" color={RED} onClick={() => handleDelete(q.id)}><Trash2 size={12} /></Btn>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </Card>

      {/* Bulk actions bar */}
      {selectedQ.length > 0 && (
        <div style={{ position: 'sticky', bottom: 16, marginTop: 12, background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 12, padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 4px 20px rgba(0,0,0,.3)' }}>
          <span style={{ fontSize: 13, color: T.text }}>{selectedQ.length} soal dipilih</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn size="sm" variant="outline" color={T.text3} onClick={() => setSelectedQ([])}>Batal</Btn>
            <Btn size="sm" color={BLUE} onClick={openAssign}><Link2 size={13} /> Assign ke Tryout</Btn>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 16 }}>
          <Btn variant="outline" color={T.text3} disabled={page <= 1} onClick={() => setPage(p => p - 1)}><ChevronLeft size={14} /> Prev</Btn>
          <span style={{ fontSize: 13, color: T.text3 }}>{page} / {totalPages}</span>
          <Btn variant="outline" color={T.text3} disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next <ChevronRight size={14} /></Btn>
        </div>
      )}

      {/* Add/Edit Modal */}
      {modal && (
        <Modal title={modal === 'create' ? 'Tambah Soal' : 'Edit Soal'} onClose={() => setModal(null)} width={640}>
          {modal === 'create' && (
            <FormGroup label="Tryout">
              <select style={{ ...inp, cursor: 'pointer' }} value={form.tryout_id} onChange={setF('tryout_id')}>
                {tryouts.length === 0 && <option value="">Tidak ada tryout</option>}
                {tryouts.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
              </select>
            </FormGroup>
          )}
          <FormGroup label="Soal">
            <textarea style={{ ...inp, resize: 'vertical', minHeight: 60 }} value={form.question_text} onChange={setF('question_text')} placeholder="Teks soal..." />
          </FormGroup>
          <FormRow>
            {OPTS.map(k => (
              <FormGroup key={k} label={`Opsi ${k.toUpperCase()}`}>
                <input style={inp} value={form[`option_${k}`]} onChange={setF(`option_${k}`)} placeholder={`Jawaban ${k.toUpperCase()}`} />
              </FormGroup>
            ))}
          </FormRow>
          <FormRow>
            <FormGroup label="Jawaban Benar">
              <select style={{ ...inp, cursor: 'pointer' }} value={form.correct_answer} onChange={setF('correct_answer')}>
                {OPTS.map(k => <option key={k} value={k}>{k.toUpperCase()}</option>)}
              </select>
            </FormGroup>
            <FormGroup label="Kategori">
              <select style={{ ...inp, cursor: 'pointer' }} value={form.category} onChange={setF('category')}>
                {CATS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </FormGroup>
          </FormRow>
          <FormGroup label="Pembahasan">
            <textarea style={{ ...inp, resize: 'vertical', minHeight: 50 }} value={form.explanation} onChange={setF('explanation')} placeholder="Penjelasan jawaban..." />
          </FormGroup>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
            <Btn variant="outline" color={T.text4} onClick={() => setModal(null)}>Batal</Btn>
            <Btn onClick={handleSave} disabled={saving || !form.question_text}>{saving ? 'Menyimpan...' : 'Simpan'}</Btn>
          </div>
        </Modal>
      )}

      {/* Import Modal */}
      {importModal && (
        <Modal title="Import Soal" onClose={() => { setImportModal(false); setImportText(''); }} width={600}>
          <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center' }}>
            <div style={{ flex: 1, padding: '20px', border: `2px dashed ${T.border}`, borderRadius: 12, textAlign: 'center', cursor: 'pointer' }}
              onClick={() => fileRef.current?.click()}>
              <input ref={fileRef} type="file" accept=".docx" style={{ display: 'none' }}
                onChange={e => { const f = e.target.files?.[0]; if (f) handleImportDocx(f); e.target.value = ''; }} />
              <FileText size={28} style={{ opacity: 0.4, marginBottom: 8 }} />
              <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>Upload .docx</div>
              <div style={{ fontSize: 11, color: T.text4, marginTop: 4 }}>Format: Soal 1: / A. / B. / C. / D. / Jawaban: / Kategori:</div>
            </div>
            <div style={{ color: T.text4, fontSize: 12 }}>atau</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 8 }}>Paste JSON</div>
              <textarea style={{ ...inp, resize: 'vertical', minHeight: 120, fontFamily: 'monospace', fontSize: 12 }}
                value={importText} onChange={e => setImportText(e.target.value)}
                placeholder='[{&quot;question_text&quot;:&quot;...&quot;, &quot;option_a&quot;:&quot;...&quot;, ...}]' />
            </div>
          </div>
          {importing && <div style={{ textAlign: 'center', padding: 10, color: ORG, fontSize: 13 }}><Loader2 size={16} style={{ animation: 'spin 1s linear infinite', verticalAlign: 'middle', marginRight: 6 }} /> Mengimport...</div>}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
            <Btn variant="outline" color={T.text4} onClick={() => { setImportModal(false); setImportText(''); }}>Batal</Btn>
            <Btn onClick={handleImportJSON} disabled={!importText || importing}><Upload size={14} /> Import JSON</Btn>
          </div>
        </Modal>
      )}

      {/* Assign to Tryout Modal */}
      {assignModal && (
        <Modal title="Assign Soal ke Tryout" onClose={() => { setAssignModal(false); setSelectedQ([]); }} width={480}>
          <div style={{ fontSize: 13, color: T.text3, marginBottom: 16 }}>
            {selectedQ.length || questions.length} soal akan ditambahkan ke tryout:
          </div>
          <FormGroup label="Pilih Tryout">
            <select style={{ ...inp, cursor: 'pointer', maxHeight: 200 }} value={assignTO} onChange={e => setAssignTO(e.target.value)}>
              <option value="">-- Pilih Tryout --</option>
              {allTryouts.map(t => <option key={t.id} value={t.id}>{t.program_name} — {t.title}</option>)}
            </select>
          </FormGroup>
          {assigning && <div style={{ textAlign: 'center', padding: 10, color: ORG, fontSize: 13 }}>Menambahkan...</div>}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
            <Btn variant="outline" color={T.text4} onClick={() => { setAssignModal(false); setSelectedQ([]); }}>Batal</Btn>
            <Btn onClick={handleAssign} disabled={!assignTO || assigning}><Link2 size={14} /> Assign</Btn>
          </div>
        </Modal>
      )}

      {confirmModal}
    </div>
  );
}