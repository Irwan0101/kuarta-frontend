import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SEO from '@/components/SEO';
import { Flag, ChevronLeft, ChevronRight, Clock, AlertTriangle, User, FileText } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import useResponsive from '@/hooks/useResponsive';
import { tryoutApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { formatDuration } from '@/lib/utils';
import toast from 'react-hot-toast';

const SUBJ_COLORS = { TWK: '#FF6B00', TIU: '#3B82F6', TKP: '#22C55E' };
const SUBJ_NAMES = { TWK: 'Tes Wawasan Kebangsaan', TIU: 'Tes Intelegensi Umum', TKP: 'Tes Karakteristik Pribadi' };

function QuestionPalette({ questions, answers, flagged, currentIdx, setCurrentIdx, subject }) {
  const { T } = useTheme();
  const subjQs = questions.filter(q => q.subject === subject);
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: SUBJ_COLORS[subject], marginBottom: 5, letterSpacing: '0.04em' }}>{subject}</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 4 }}>
        {subjQs.map(q => {
          const idx = questions.indexOf(q);
          const isAnswered = !!answers[q.id];
          const isFlagged = !!flagged[q.id];
          const isCurrent = currentIdx === idx;
          let bg = T.bg4, border = T.border, fg = T.text4;
          if (isCurrent) { bg = SUBJ_COLORS[subject]; border = SUBJ_COLORS[subject]; fg = '#fff'; }
          else if (isAnswered) { bg = SUBJ_COLORS[subject] + '20'; border = SUBJ_COLORS[subject] + '60'; fg = SUBJ_COLORS[subject]; }
          return (
            <button key={q.id} onClick={() => setCurrentIdx(idx)} style={{
              aspectRatio: '1', borderRadius: 6, border: `1.5px solid ${border}`,
              background: bg, color: fg, fontSize: 11, fontWeight: 700, cursor: 'pointer',
              position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {q.number}
              {isFlagged && <span style={{ position: 'absolute', top: 1, right: 1, width: 6, height: 6, background: '#F59E0B', borderRadius: '50%', border: '1px solid ' + T.bg2 }} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SubmitModal({ open, onClose, onSubmit, answered, total, flagged, submitting }) {
  const { T, C } = useTheme();
  const flaggedCount = Object.values(flagged).filter(Boolean).length;
  return (
    <Modal open={open} onClose={onClose} title="Konfirmasi" width={420}>
      <div style={{ textAlign: 'center', padding: '8px 0' }}>
        <div style={{ fontSize: 14, color: T.text, fontWeight: 600, marginBottom: 8 }}>Yakin ingin mengumpulkan jawaban?</div>
        <div style={{ fontSize: 12, color: T.text3, marginBottom: 16 }}>
          Kamu menjawab <strong style={{ color: C.orange }}>{answered}</strong> dari <strong>{total}</strong> soal.
          {answered < total && <span> Soal yang belum dijawab akan dianggap kosong.</span>}
        </div>
        {flaggedCount > 0 && (
          <div style={{ background: '#F59E0B18', border: '1px solid #F59E0B40', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: '#F59E0B', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Flag size={13} /> {flaggedCount} soal masih ditandai ragu-ragu
          </div>
        )}
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="ghost" onClick={onClose} style={{ flex: 1 }}>Tinjau Ulang</Button>
          <Button onClick={onSubmit} disabled={submitting} style={{ flex: 1 }}>{submitting ? 'Mengumpulkan...' : 'Ya, Kumpulkan'}</Button>
        </div>
      </div>
    </Modal>
  );
}

export default function TryoutSessionPage() {
  const { id } = useParams();
  const { T, C } = useTheme();
  const resp = useResponsive();
  const navigate = useNavigate();

  const [tryout, setTryout] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
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
          id: q.id, number: i + 1, subject: q.category,
          text: q.question_text, groupStimulus: q.group_stimulus,
          timeLimitSecs: q.time_limit_secs,
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

  if (loading) return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100vh', gap: 16, background: T.bg1, color: T.text3 }}>
      <div style={{ width: 40, height: 40, border: `3px solid ${T.border}`, borderTopColor: C.orange, borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      <span style={{ fontSize: 14 }}>Memuat soal...</span>
    </div>
  );

  const subjects = ['TWK','TIU','TKP'].filter(s => questions.some(q => q.subject === s));
  const timerColor = timeLeft < 300 ? '#EF4444' : timeLeft < 600 ? '#F59E0B' : '#22C55E';
  const showPalette = !resp.isMobile;
  const paletteWidth = 240;

  return (
    <>
      <SEO title={tryout?.title || 'Tryout'} url={`/tryout/${id}/start`} noindex />
      <div style={{ display: 'flex', height: '100vh', background: T.bg1, flexDirection: resp.isMobile ? 'column' : 'row' }}>

        {/* ─── Main Area ─── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

          {/* Header */}
          <div style={{
            background: T.bg2, borderBottom: `1px solid ${T.border}`,
            padding: resp.isMobile ? '10px 12px' : '10px 20px',
            display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0,
            flexWrap: resp.isMobile ? 'wrap' : 'nowrap',
          }}>
            {resp.isMobile && (
              <button onClick={() => navigate('/tryout')} style={{ background: 'none', border: 'none', color: T.text3, cursor: 'pointer', padding: 4 }}>
                <ChevronLeft size={18} />
              </button>
            )}
            <FileText size={16} color={C.orange} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tryout?.title || 'Tryout'}</div>
              <div style={{ fontSize: 10, color: T.text4 }}>Sistem CAT — {tryout?.type || 'CPNS'}</div>
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
              background: timerColor + '18', border: `1px solid ${timerColor}40`,
              borderRadius: 8, padding: resp.isMobile ? '4px 10px' : '6px 14px',
            }}>
              <Clock size={resp.isMobile ? 12 : 14} color={timerColor} />
              <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: resp.isMobile ? 14 : 17, color: timerColor }}>{formatDuration(timeLeft)}</span>
            </div>
            {!resp.isMobile && (
              <Button variant="danger" size="sm" onClick={() => setShowSubmit(true)} disabled={submitting}>
                {submitting ? 'Mengumpulkan...' : 'Kumpulkan'}
              </Button>
            )}
          </div>

          {/* Subject tabs */}
          <div style={{
            background: T.bg2, borderBottom: `1px solid ${T.border}`,
            display: 'flex', padding: resp.isMobile ? '6px 12px' : '8px 20px', gap: 6,
            overflowX: 'auto', flexShrink: 0,
          }}>
            {subjects.map(subj => {
              const subjQs = questions.filter(q => q.subject === subj);
              const subjAnswered = subjQs.filter(q => answers[q.id]).length;
              return (
                <button key={subj} onClick={() => setCurrentIdx(questions.indexOf(subjQs[0]))} style={{
                  padding: resp.isMobile ? '4px 10px' : '5px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
                  background: T.bg4, color: T.text3, fontWeight: 600, fontSize: resp.isMobile ? 11 : 12,
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: SUBJ_COLORS[subj], flexShrink: 0 }} />
                  {!resp.isMobile && <span>{SUBJ_NAMES[subj].split(' ')[0]} </span>}{subj}
                  <span style={{ fontSize: 10, opacity: 0.6 }}>({subjAnswered}/{subjQs.length})</span>
                </button>
              );
            })}
            <div style={{ flex: 1 }} />
            {resp.isMobile && (
              <Button variant="danger" size="sm" onClick={() => setShowSubmit(true)} disabled={submitting}>
                {submitting ? '...' : 'Kumpulkan'}
              </Button>
            )}
          </div>

          {/* Question area */}
          <div style={{ flex: 1, overflowY: 'auto', padding: resp.isMobile ? 12 : 24 }}>
            <div style={{ maxWidth: 720, margin: '0 auto' }}>

              {/* Question header */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: resp.isMobile ? 6 : 10,
                marginBottom: resp.isMobile ? 12 : 16, flexWrap: 'wrap',
              }}>
                <div style={{
                  background: SUBJ_COLORS[current.subject] + '18', color: SUBJ_COLORS[current.subject],
                  fontWeight: 700, fontSize: resp.isMobile ? 11 : 12,
                  padding: resp.isMobile ? '3px 10px' : '4px 14px', borderRadius: 6,
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: SUBJ_COLORS[current.subject] }} />
                  {SUBJ_NAMES[current.subject]} — No. {current.number}
                </div>
                <div style={{ flex: 1 }} />
                <button onClick={toggleFlag} style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  background: flagged[current.id] ? '#F59E0B22' : T.bg3,
                  color: flagged[current.id] ? '#F59E0B' : T.text4,
                  border: `1px solid ${flagged[current.id] ? '#F59E0B' : T.border}`,
                  borderRadius: 6, padding: resp.isMobile ? '3px 8px' : '4px 10px',
                  cursor: 'pointer', fontSize: 11, fontWeight: 600,
                }}>
                  <Flag size={11} /> {flagged[current.id] ? 'Ragu-ragu' : 'Tandai'}
                </button>
              </div>

              {/* Group stimulus */}
              {current.groupStimulus && (
                <div style={{
                  background: T.bg2, border: `1px solid ${C.orange}25`, borderRadius: 12,
                  padding: resp.isMobile ? '12px 14px' : '16px 20px', marginBottom: resp.isMobile ? 12 : 16,
                }}>
                  <div style={{
                    fontSize: 10, fontWeight: 700, color: C.orange,
                    textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8,
                  }}>Teks Soal</div>
                  <div style={{ fontSize: 13, color: T.text2, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{current.groupStimulus}</div>
                </div>
              )}

              {/* Question text */}
              <div style={{
                background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 12,
                padding: resp.isMobile ? '14px 16px' : '20px 22px',
                marginBottom: resp.isMobile ? 14 : 20,
                fontSize: 14, color: T.text, lineHeight: 1.7,
              }}>
                {current.text}
              </div>

              {/* Options */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: resp.isMobile ? 8 : 10 }}>
                {current.options.map(opt => {
                  const selected = answers[current.id] === opt.id;
                  return (
                    <button key={opt.id} onClick={() => handleAnswer(opt.id)} style={{
                      display: 'flex', alignItems: 'center', gap: resp.isMobile ? 10 : 14,
                      padding: resp.isMobile ? '10px 12px' : '12px 16px', borderRadius: 10, cursor: 'pointer',
                      background: selected ? '#1a3a5c' : T.bg3,
                      border: `1.5px solid ${selected ? '#3B82F6' : T.border}`,
                      textAlign: 'left', transition: 'all 0.15s',
                    }}>
                      <div style={{
                        width: resp.isMobile ? 26 : 30, height: resp.isMobile ? 26 : 30, borderRadius: '50%',
                        flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: selected ? '#3B82F6' : T.bg5,
                        color: selected ? '#fff' : T.text3, fontWeight: 800, fontSize: resp.isMobile ? 12 : 13,
                      }}>
                        {opt.id}
                      </div>
                      <span style={{ fontSize: resp.isMobile ? 13 : 14, color: T.text, lineHeight: 1.5, flex: 1 }}>{opt.text}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom nav */}
          <div style={{
            background: T.bg2, borderTop: `1px solid ${T.border}`,
            display: 'flex', alignItems: 'center',
            padding: resp.isMobile ? '8px 12px' : '10px 24px', gap: 12, flexShrink: 0,
          }}>
            <Button variant="ghost" size="sm" disabled={currentIdx === 0} onClick={() => setCurrentIdx(i => i - 1)}>
              <ChevronLeft size={14} /> Sebelumnya
            </Button>
            <div style={{ flex: 1, textAlign: 'center', fontSize: 12, color: T.text3 }}>
              <strong style={{ color: T.text }}>{answered}</strong> / {questions.length} dijawab
            </div>
            <Button size="sm" disabled={currentIdx === questions.length - 1} onClick={() => setCurrentIdx(i => i + 1)}>
              Selanjutnya <ChevronRight size={14} />
            </Button>
          </div>
        </div>

        {/* ─── Question Palette (desktop) ─── */}
        {showPalette && (
          <div style={{
            width: paletteWidth, background: T.bg2, borderLeft: `1px solid ${T.border}`,
            display: 'flex', flexDirection: 'column', flexShrink: 0,
          }}>
            <div style={{
              padding: '14px 16px', borderBottom: `1px solid ${T.border}`,
              fontWeight: 700, fontSize: 13, color: T.text,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <FileText size={14} color={C.orange} /> Navigasi Soal
            </div>
            <div style={{ overflowY: 'auto', flex: 1, padding: 12 }}>
              {/* Legend */}
              <div style={{ display: 'flex', gap: 10, marginBottom: 14, fontSize: 10, color: T.text4, flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: SUBJ_COLORS['TWK'] + '20', border: `1px solid ${SUBJ_COLORS['TWK']}60`, display: 'inline-block' }} /> Terjawab</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: T.bg4, border: `1px solid ${T.border}`, display: 'inline-block' }} /> Kosong</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: SUBJ_COLORS['TWK'], display: 'inline-block' }} /> Aktif</span>
              </div>
              {subjects.map(subj => (
                <QuestionPalette key={subj} questions={questions} answers={answers} flagged={flagged} currentIdx={currentIdx} setCurrentIdx={setCurrentIdx} subject={subj} />
              ))}
            </div>
          </div>
        )}

        {/* ─── Mobile: question palette modal ─── */}
        {resp.isMobile && (
          <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: T.bg2, borderTop: `1px solid ${T.border}`, zIndex: 50, padding: '6px 12px' }}>
            <button onClick={() => setShowSubmit(true)} style={{
              width: '100%', padding: '10px', borderRadius: 8, border: 'none',
              background: C.orange, color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
              <FileText size={14} /> Kumpulkan Jawaban ({answered}/{questions.length})
            </button>
          </div>
        )}

      </div>

      <SubmitModal
        open={showSubmit} onClose={() => setShowSubmit(false)} onSubmit={handleSubmit}
        answered={answered} total={questions.length} flagged={flagged} submitting={submitting}
      />

      <Modal open={showTimeout} title="Waktu Habis!" icon="⏰" width={380}>
        <div style={{ textAlign: 'center', padding: '8px 0' }}>
          <div style={{ fontSize: 13, color: T.text3, marginBottom: 16 }}>Waktu ujian telah habis. Jawabanmu otomatis dikumpulkan.</div>
          <Button onClick={handleSubmit} disabled={submitting} fullWidth>{submitting ? 'Mengumpulkan...' : 'Lihat Hasil Tryout'}</Button>
        </div>
      </Modal>
    </>
  );
}