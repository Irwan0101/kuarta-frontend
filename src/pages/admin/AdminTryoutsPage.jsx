// src/pages/admin/AdminTryoutsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, ChevronRight, ChevronDown, HelpCircle } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { useTheme } from '@/hooks/useTheme';
import {
  PageHeader, Card, CardHead, Btn, Badge, Spinner, ErrorBox,
  Modal, FormGroup, FormRow, TableHead, EmptyRow, Select,
  ORG, RED, GREEN, BLUE,
} from './adminUtils';

const EMPTY_TO = { title: '', duration: 90, program_id: '' };
const EMPTY_Q  = { question: '', option_a: '', option_b: '', option_c: '', option_d: '', option_e: '', correct: 'a', category: 'TIU', explanation: '' };
const CATS     = ['TWK', 'TIU', 'TKP'];
const OPTS     = ['a', 'b', 'c', 'd', 'e'];

export default function AdminTryoutsPage() {
  const { T } = useTheme();
  const [programs,  setPrograms]  = useState([]);
  const [selProg,   setSelProg]   = useState('');
  const [tryouts,   setTryouts]   = useState([]);
  const [loadTO,    setLoadTO]    = useState(false);
  const [questions, setQuestions] = useState({});   // { [tryoutId]: [] }
  const [expanded,  setExpanded]  = useState({});   // { [tryoutId]: bool }
  const [loadQ,     setLoadQ]     = useState({});
  const [error,     setError]     = useState('');

  // Modals
  const [toModal,  setToModal]  = useState(null);   // null | 'create' | tryout-obj
  const [toForm,   setToForm]   = useState(EMPTY_TO);
  const [qModal,   setQModal]   = useState(null);   // null | { tryoutId, q? }
  const [qForm,    setQForm]    = useState(EMPTY_Q);
  const [saving,   setSaving]   = useState(false);

  // Load programs
  useEffect(() => {
    adminApi.getPrograms()
      .then(p => { setPrograms(p); if (p.length) setSelProg(String(p[0].id)); })
      .catch(() => {});
  }, []);

  // Load tryouts when program changes
  const loadTryouts = useCallback(async () => {
    if (!selProg) return;
    setLoadTO(true); setError('');
    try { setTryouts(await adminApi.getTryouts(selProg)); }
    catch (e) { setError(e?.message || 'Gagal memuat tryouts.'); }
    finally { setLoadTO(false); }
  }, [selProg]);

  useEffect(() => { loadTryouts(); }, [loadTryouts]);

  // Toggle expand & load questions
  const toggleExpand = async (id) => {
    setExpanded(e => ({ ...e, [id]: !e[id] }));
    if (!questions[id]) {
      setLoadQ(l => ({ ...l, [id]: true }));
      try { setQuestions(q => ({ ...q, [id]: [] })); // optimistic empty
        const data = await adminApi.getQuestions(id);
        setQuestions(q => ({ ...q, [id]: data }));
      } catch {}
      finally { setLoadQ(l => ({ ...l, [id]: false })); }
    }
  };

  // Tryout CRUD
  const openCreateTO = () => { setToForm({ ...EMPTY_TO, program_id: selProg }); setToModal('create'); };
  const openEditTO   = (t) => { setToForm({ title: t.title, duration: t.duration, program_id: t.program_id }); setToModal(t); };

  const saveTryout = async () => {
    setSaving(true);
    try {
      if (toModal === 'create') await adminApi.createTryout(toForm);
      else await adminApi.updateTryout(toModal.id, toForm);
      setToModal(null); loadTryouts();
    } catch (e) { alert(e?.message || 'Gagal.'); }
    finally { setSaving(false); }
  };

  // Question CRUD
  const openAddQ  = (tryoutId) => { setQForm(EMPTY_Q); setQModal({ tryoutId }); };
  const openEditQ = (tryoutId, q) => {
    setQForm({ question: q.question, option_a: q.option_a, option_b: q.option_b, option_c: q.option_c, option_d: q.option_d, option_e: q.option_e ?? '', correct: q.correct, category: q.category ?? 'TIU', explanation: q.explanation ?? '' });
    setQModal({ tryoutId, q });
  };

  const saveQuestion = async () => {
    setSaving(true);
    try {
      if (!qModal.q) await adminApi.addQuestion(qModal.tryoutId, qForm);
      else await adminApi.updateQuestion(qModal.q.id, qForm);
      // refresh questions for this tryout
      const data = await adminApi.getQuestions(qModal.tryoutId);
      setQuestions(q => ({ ...q, [qModal.tryoutId]: data }));
      setQModal(null);
    } catch (e) { alert(e?.message || 'Gagal.'); }
    finally { setSaving(false); }
  };

  const deleteQuestion = async (tryoutId, qId) => {
    if (!confirm('Hapus soal ini?')) return;
    try {
      await adminApi.deleteQuestion(qId);
      setQuestions(q => ({ ...q, [tryoutId]: q[tryoutId].filter(x => x.id !== qId) }));
    } catch (e) { alert(e?.message || 'Gagal hapus soal.'); }
  };

  const setF  = k => e => setToForm(f => ({ ...f, [k]: e.target.value }));
  const setQF = k => e => setQForm(f  => ({ ...f, [k]: e.target.value }));
  const inp   = { padding: '9px 12px', fontSize: 13, borderRadius: 9, background: T.bg3, border: `1px solid ${T.border}`, color: T.text, outline: 'none', width: '100%', boxSizing: 'border-box' };

  return (
    <div>
      <PageHeader
        title="📝 Manajemen Tryouts"
        subtitle="Kelola paket tryout dan soal-soalnya"
        action={
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <select value={selProg} onChange={e => setSelProg(e.target.value)}
              style={{ padding: '8px 12px', fontSize: 12, borderRadius: 9, background: T.bg3, border: `1px solid ${T.border}`, color: T.text, outline: 'none' }}>
              {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <Btn onClick={openCreateTO}><Plus size={14} /> Tambah Tryout</Btn>
          </div>
        }
      />

      {error && <div style={{ marginBottom: 16 }}><ErrorBox msg={error} /></div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {loadTO
          ? <Card><Spinner /></Card>
          : tryouts.length === 0
            ? <Card><div style={{ padding: 32, textAlign: 'center', opacity: .4, fontSize: 13 }}>Belum ada tryout untuk program ini.</div></Card>
            : tryouts.map(t => (
              <Card key={t.id}>
                {/* Tryout row */}
                <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => toggleExpand(t.id)}>
                  {expanded[t.id] ? <ChevronDown size={16} color={ORG} /> : <ChevronRight size={16} style={{ opacity: .4 }} />}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{t.title}</div>
                    <div style={{ fontSize: 11, color: T.text4, marginTop: 2 }}>{t.duration} menit · {questions[t.id]?.length ?? '—'} soal</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
                    <Btn size="sm" variant="outline" color={BLUE} onClick={() => openEditTO(t)}><Edit2 size={12} /> Edit</Btn>
                    <Btn size="sm" variant="outline" color={GREEN} onClick={() => { toggleExpand(t.id); setTimeout(() => openAddQ(t.id), 100); }}>
                      <Plus size={12} /> Soal
                    </Btn>
                  </div>
                </div>

                {/* Questions accordion */}
                {expanded[t.id] && (
                  <div style={{ borderTop: `1px solid ${T.border}` }}>
                    <div style={{ padding: '10px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: T.bg3 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: T.text4 }}>Daftar Soal</span>
                      <Btn size="sm" onClick={() => openAddQ(t.id)}><Plus size={12} /> Tambah Soal</Btn>
                    </div>
                    {loadQ[t.id]
                      ? <Spinner label="Memuat soal..." />
                      : (questions[t.id] ?? []).length === 0
                        ? <div style={{ padding: 20, textAlign: 'center', opacity: .4, fontSize: 13 }}>Belum ada soal.</div>
                        : (questions[t.id] ?? []).map((q, i) => (
                          <div key={q.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '11px 18px', borderBottom: `1px solid ${T.border}` }}>
                            <span style={{ fontSize: 12, color: T.text4, minWidth: 24, paddingTop: 1 }}>{i + 1}.</span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 13, color: T.text, marginBottom: 4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                {q.question}
                              </div>
                              <Badge label={q.category ?? 'TIU'} color={q.category === 'TWK' ? ORG : q.category === 'TKP' ? GREEN : BLUE} />
                            </div>
                            <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
                              <Btn size="sm" variant="outline" color={BLUE} onClick={() => openEditQ(t.id, q)}><Edit2 size={11} /></Btn>
                              <Btn size="sm" variant="outline" color={RED}  onClick={() => deleteQuestion(t.id, q.id)}><Trash2 size={11} /></Btn>
                            </div>
                          </div>
                        ))}
                  </div>
                )}
              </Card>
            ))}
      </div>

      {/* Tryout modal */}
      {toModal && (
        <Modal title={toModal === 'create' ? 'Tambah Tryout' : 'Edit Tryout'} onClose={() => setToModal(null)}>
          <FormRow>
            <FormGroup label="Judul Tryout">
              <input style={inp} value={toForm.title} onChange={setF('title')} placeholder="Simulasi SKD #1" />
            </FormGroup>
            <FormGroup label="Durasi (menit)">
              <input style={inp} type="number" value={toForm.duration} onChange={setF('duration')} placeholder="90" />
            </FormGroup>
          </FormRow>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
            <Btn variant="outline" color={T.text4} onClick={() => setToModal(null)}>Batal</Btn>
            <Btn onClick={saveTryout} disabled={saving || !toForm.title}>{saving ? 'Menyimpan...' : 'Simpan'}</Btn>
          </div>
        </Modal>
      )}

      {/* Question modal */}
      {qModal && (
        <Modal title={qModal.q ? 'Edit Soal' : 'Tambah Soal'} onClose={() => setQModal(null)} width={620}>
          <FormRow>
            <FormGroup label="Kategori">
              <select style={inp} value={qForm.category} onChange={setQF('category')}>
                {CATS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </FormGroup>
            <FormGroup label="Kunci Jawaban">
              <select style={inp} value={qForm.correct} onChange={setQF('correct')}>
                {OPTS.map(o => <option key={o} value={o}>Opsi {o.toUpperCase()}</option>)}
              </select>
            </FormGroup>
          </FormRow>
          <FormGroup label="Pertanyaan">
            <textarea style={{ ...inp, resize: 'vertical' }} rows={3} value={qForm.question} onChange={setQF('question')} placeholder="Tuliskan pertanyaan di sini..." />
          </FormGroup>
          <FormRow>
            {['a', 'b', 'c', 'd'].map(o => (
              <FormGroup key={o} label={`Opsi ${o.toUpperCase()}`}>
                <input style={{ ...inp, borderColor: qForm.correct === o ? ORG : T.border }} value={qForm[`option_${o}`]} onChange={setQF(`option_${o}`)} placeholder={`Pilihan ${o.toUpperCase()}`} />
              </FormGroup>
            ))}
          </FormRow>
          <FormGroup label="Opsi E (opsional)">
            <input style={{ ...inp, borderColor: qForm.correct === 'e' ? ORG : T.border }} value={qForm.option_e} onChange={setQF('option_e')} placeholder="Pilihan E" />
          </FormGroup>
          <FormGroup label="Pembahasan">
            <textarea style={{ ...inp, resize: 'vertical' }} rows={2} value={qForm.explanation} onChange={setQF('explanation')} placeholder="Penjelasan jawaban yang benar..." />
          </FormGroup>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
            <Btn variant="outline" color={T.text4} onClick={() => setQModal(null)}>Batal</Btn>
            <Btn onClick={saveQuestion} disabled={saving || !qForm.question}>{saving ? 'Menyimpan...' : 'Simpan Soal'}</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}