import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SEO from '@/components/SEO';
import { Flag, ChevronLeft, ChevronRight, Clock, Grid } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { tryoutApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { formatDuration } from '@/lib/utils';
import toast from 'react-hot-toast';

const SUBJECT_COLORS = { TWK: '#FF6B00', TIU: '#3B82F6', TKP: '#22C55E' };

export default function TryoutSessionPage() {
  const { id } = useParams();
  const { T, C } = useTheme();
  const navigate = useNavigate();

  const [tryout, setTryout] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showGrid, setShowGrid] = useState(false);
  const [showSubmit, setShowSubmit] = useState(false);
  const [showTimeout, setShowTimeout] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    tryoutApi.getQuestions(id)
      .then(res => {
        const t = res.tryout;
        setTryout(t);
        const qs = res.questions.map((q, i) => ({
          id: q.id,
          number: i + 1,
          subject: q.category,
          text: q.question_text,
          options: [
            { id: 'A', text: q.option_a },
            { id: 'B', text: q.option_b },
            { id: 'C', text: q.option_c },
            { id: 'D', text: q.option_d },
            ...(q.option_e ? [{ id: 'E', text: q.option_e }] : []),
          ],
        }));
        setQuestions(qs);
        setTimeLeft((t.duration_mins || 100) * 60);
        setLoading(false);
      })
      .catch(() => { toast.error('Gagal memuat soal'); navigate('/tryout'); });
  }, [id, navigate]);

  useEffect(() => {
    if (timeLeft <= 0 || loading) return;
    const interval = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(interval); setShowTimeout(true); return 0; }
        if (t === 300) toast('⚠️ Waktu tersisa 5 menit!', { icon: '⏰' });
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft, loading]);

  const current = questions[currentIdx];
  const answered = Object.keys(answers).length;

  const handleAnswer = (optId) => setAnswers(a => ({ ...a, [current.id]: optId }));
  const toggleFlag = () => setFlagged(f => ({ ...f, [current.id]: !f[current.id] }));

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await tryoutApi.submit(id, answers, (tryout?.duration_mins || 100) * 60 - timeLeft);
      navigate(`/tryout/${id}/result`, { state: { result: res.result, answers: res.answers, questions, timeSpent: (tryout?.duration_mins || 100) * 60 - timeLeft } });
    } catch {
      toast.error('Gagal mengumpulkan jawaban');
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowRight' && currentIdx < questions.length - 1) setCurrentIdx(i => i + 1);
      if (e.key === 'ArrowLeft' && currentIdx > 0) setCurrentIdx(i => i - 1);
      if (['a','b','c','d','e'].includes(e.key.toLowerCase())) {
        const optId = e.key.toUpperCase();
        if (current?.options.find(o => o.id === optId)) handleAnswer(optId);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [currentIdx, current]);

  if (loading) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', color: T.text3 }}>Memuat soal...</div>;

  const timerColor = timeLeft < 300 ? '#EF4444' : timeLeft < 600 ? '#F59E0B' : '#22C55E';

  return (
    <>
      <SEO title="Mengerjakan Tryout" url="/tryout-session" noindex />
      <div style={{ display: 'flex', height: '100vh', background: T.bg1, overflow: 'hidden' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ height: 60, background: T.bg2, borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', padding: '0 20px', gap: 16 }}>
            <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 16, color: T.text }}>{tryout?.title || 'Tryout'}</div>
            <div style={{ flex: 1 }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: timerColor + '18', border: `1px solid ${timerColor}40`, borderRadius: 10, padding: '6px 14px' }}>
              <Clock size={14} color={timerColor} />
              <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 17, color: timerColor }}>{formatDuration(timeLeft)}</span>
            </div>
            <button onClick={() => setShowGrid(s => !s)} style={{ background: T.bg4, border: 'none', borderRadius: 8, width: 34, height: 34, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.text3 }}>
              <Grid size={16} />
            </button>
            <Button variant="danger" size="sm" onClick={() => setShowSubmit(true)} disabled={submitting}>{submitting ? 'Mengumpulkan...' : 'Kumpulkan'}</Button>
          </div>

          <div style={{ background: T.bg2, borderBottom: `1px solid ${T.border}`, display: 'flex', padding: '8px 20px', gap: 8 }}>
            {['TWK','TIU','TKP'].filter(s => questions.some(q => q.subject === s)).map(subj => {
              const subjQs = questions.filter(q => q.subject === subj);
              const subjAnswered = subjQs.filter(q => answers[q.id]).length;
              const indices = subjQs.map(q => questions.indexOf(q));
              const start = indices[0], end = indices[indices.length - 1];
              return (
                <button key={subj} onClick={() => setCurrentIdx(start)} style={{
                  padding: '5px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                  background: currentIdx >= start && currentIdx <= end ? SUBJECT_COLORS[subj] + '22' : T.bg4,
                  color: currentIdx >= start && currentIdx <= end ? SUBJECT_COLORS[subj] : T.text3,
                  fontWeight: 700, fontSize: 12,
                }}>
                  {subj} ({subjAnswered}/{subjQs.length})
                </button>
              );
            })}
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
            <div style={{ maxWidth: 700, margin: '0 auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <div style={{ background: SUBJECT_COLORS[current.subject] + '22', color: SUBJECT_COLORS[current.subject], fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 13, padding: '4px 12px', borderRadius: 8 }}>
                  {current.subject} — No. {current.number}
                </div>
                <button onClick={toggleFlag} style={{
                  display: 'flex', alignItems: 'center', gap: 5, background: flagged[current.id] ? '#F59E0B22' : T.bg4,
                  color: flagged[current.id] ? '#F59E0B' : T.text4, border: `1px solid ${flagged[current.id] ? '#F59E0B' : T.border}`,
                  borderRadius: 8, padding: '4px 10px', cursor: 'pointer', fontSize: 11, fontWeight: 600,
                }}>
                  <Flag size={12} /> {flagged[current.id] ? 'Ragu-ragu' : 'Tandai'}
                </button>
              </div>

              <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 14, padding: '20px 22px', marginBottom: 20, fontSize: 15, color: T.text, lineHeight: 1.7 }}>
                {current.text}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {current.options.map(opt => {
                  const selected = answers[current.id] === opt.id;
                  return (
                    <button key={opt.id} onClick={() => handleAnswer(opt.id)} style={{
                      display: 'flex', alignItems: 'flex-start', gap: 14, padding: '14px 16px', borderRadius: 12, cursor: 'pointer',
                      background: selected ? SUBJECT_COLORS[current.subject] + '18' : T.bg3,
                      border: `1.5px solid ${selected ? SUBJECT_COLORS[current.subject] : T.border}`, textAlign: 'left',
                    }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: selected ? SUBJECT_COLORS[current.subject] : T.bg5, color: selected ? '#fff' : T.text3, fontWeight: 800, fontSize: 13 }}>
                        {opt.id}
                      </div>
                      <span style={{ fontSize: 14, color: T.text, lineHeight: 1.6, paddingTop: 4 }}>{opt.text}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div style={{ height: 60, background: T.bg2, borderTop: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12 }}>
            <Button variant="ghost" size="sm" disabled={currentIdx === 0} onClick={() => setCurrentIdx(i => i - 1)} icon={<ChevronLeft size={14} />}>Sebelumnya</Button>
            <div style={{ flex: 1, textAlign: 'center', fontSize: 13, color: T.text3 }}><strong style={{ color: T.text }}>{answered}</strong> / {questions.length} dijawab</div>
            <Button size="sm" disabled={currentIdx === questions.length - 1} onClick={() => setCurrentIdx(i => i + 1)}>Berikutnya <ChevronRight size={14} /></Button>
          </div>
        </div>

        {showGrid && (
          <div style={{ width: 280, background: T.bg2, borderLeft: `1px solid ${T.border}`, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
            <div style={{ padding: '14px 16px', borderBottom: `1px solid ${T.border}`, fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 13 }}>Navigasi Soal</div>
            <div style={{ padding: 12 }}>
              {['TWK','TIU','TKP'].filter(s => questions.some(q => q.subject === s)).map(subj => {
                const subjQs = questions.filter(q => q.subject === subj);
                return (
                  <div key={subj} style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: SUBJECT_COLORS[subj], marginBottom: 6 }}>{subj}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 5 }}>
                      {subjQs.map(q => {
                        const idx = questions.indexOf(q);
                        const isAnswered = !!answers[q.id];
                        const isFlagged = !!flagged[q.id];
                        const isCurrent = currentIdx === idx;
                        return (
                          <button key={q.id} onClick={() => setCurrentIdx(idx)} style={{
                            aspectRatio: '1', borderRadius: 8,
                            border: `1.5px solid ${isCurrent ? SUBJECT_COLORS[subj] : isAnswered ? SUBJECT_COLORS[subj] + '80' : T.border}`,
                            background: isCurrent ? SUBJECT_COLORS[subj] : isAnswered ? SUBJECT_COLORS[subj] + '20' : T.bg4,
                            color: isCurrent ? '#fff' : isAnswered ? SUBJECT_COLORS[subj] : T.text4,
                            fontSize: 11, fontWeight: 700, cursor: 'pointer', position: 'relative',
                          }}>
                            {q.number}
                            {isFlagged && <span style={{ position: 'absolute', top: 2, right: 2, width: 5, height: 5, background: '#F59E0B', borderRadius: '50%' }} />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <Modal open={showSubmit} onClose={() => setShowSubmit(false)} title="Kumpulkan Jawaban?" icon="⚠️" width={400}
          footer={<><Button variant="ghost" onClick={() => setShowSubmit(false)}>Batal</Button><Button onClick={handleSubmit} disabled={submitting}>Ya, Kumpulkan</Button></>}>
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <div style={{ fontSize: 13, color: T.text3, marginBottom: 16 }}>
              Kamu baru menjawab <strong style={{ color: C.orange }}>{answered}</strong> dari <strong>{questions.length}</strong> soal.
              {answered < questions.length && <span> Soal yang belum dijawab akan dianggap kosong.</span>}
            </div>
            {Object.values(flagged).filter(Boolean).length > 0 && (
              <div style={{ background: '#F59E0B18', border: '1px solid #F59E0B40', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: '#F59E0B', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Flag size={13} /> {Object.values(flagged).filter(Boolean).length} soal masih ditandai ragu-ragu
              </div>
            )}
          </div>
        </Modal>

        <Modal open={showTimeout} title="Waktu Habis!" icon="⏰" width={380}>
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <div style={{ fontSize: 13, color: T.text3, marginBottom: 16 }}>Waktu ujian telah habis. Jawabanmu otomatis dikumpulkan.</div>
            <Button onClick={handleSubmit} disabled={submitting} fullWidth>{submitting ? 'Mengumpulkan...' : 'Lihat Hasil Tryout'}</Button>
          </div>
        </Modal>
      </div>
    </>
  );
}
