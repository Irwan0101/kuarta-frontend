import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, Search, ChevronLeft, ChevronRight, HelpCircle } from 'lucide-react';
import { adminApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { useTheme } from '@/hooks/useTheme';
import { useConfirm } from '@/hooks/useConfirm';
import {
  PageHeader, Card, CardHead, Btn, Badge, Spinner, ErrorBox,
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

  const setF = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const inp = { padding: '9px 12px', fontSize: 13, borderRadius: 9, background: T.bg3, border: `1px solid ${T.border}`, color: T.text, outline: 'none', width: '100%', boxSizing: 'border-box' };

  return (
    <div>
      <PageHeader
        title="Bank Soal"
        subtitle={`${total} soal`}
        action={<Btn onClick={openAdd} disabled={!selProg}><Plus size={14} /> Tambah Soal</Btn>}
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
              {selProg ? 'Belum ada soal untuk program ini.' : 'Pilih program untuk melihat soal.'}
            </div>
          : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${T.border}` }}>
                    {['No', 'Soal', 'Tryout', 'Kategori', 'Kesulitan', 'Jawaban', { label: 'Aksi', right: true }].map((c, i) => {
                      const isObj = typeof c === 'object';
                      return <th key={i} style={{ padding: '10px 12px', fontSize: 11, fontWeight: 700, color: T.text4, textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: isObj && c.right ? 'right' : 'left' }}>{isObj ? c.label : c}</th>;
                    })}
                  </tr>
                </thead>
                <tbody>
                  {questions.map((q, i) => (
                    <tr key={q.id} style={{ borderBottom: `1px solid ${T.border}` }}>
                      <td style={{ padding: '10px 12px', fontSize: 12, color: T.text4 }}>{(page - 1) * PER + i + 1}</td>
                      <td style={{ padding: '10px 12px', fontSize: 13, color: T.text, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={q.question_text}>
                        {q.question_text}
                      </td>
                      <td style={{ padding: '10px 12px', fontSize: 12, color: T.text3 }}>{q.tryout_title || '-'}</td>
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 16 }}>
          <Btn variant="outline" color={T.text3} disabled={page <= 1} onClick={() => setPage(p => p - 1)}><ChevronLeft size={14} /> Prev</Btn>
          <span style={{ fontSize: 13, color: T.text3 }}>{page} / {totalPages}</span>
          <Btn variant="outline" color={T.text3} disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next <ChevronRight size={14} /></Btn>
        </div>
      )}

      {/* Modal */}
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

      {confirmModal}
    </div>
  );
}