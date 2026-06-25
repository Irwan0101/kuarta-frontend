// src/pages/TryoutSessionPage.jsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SEO from '@/components/SEO';
import { Flag, ChevronLeft, ChevronRight, Clock, AlertTriangle, Grid } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useTryoutStore } from '@/store/tryoutStore';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { formatDuration } from '@/lib/utils';
import toast from 'react-hot-toast';

/* Mock questions */
const MOCK_QUESTIONS = Array.from({ length: 30 }, (_, i) => ({
  id: i + 1,
  number: i + 1,
  subject: i < 10 ? 'TWK' : i < 20 ? 'TIU' : 'TKP',
  text: `Soal nomor ${i + 1}: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pertanyaan ini adalah contoh soal simulasi untuk kategori ${i < 10 ? 'Tes Wawasan Kebangsaan' : i < 20 ? 'Tes Intelegensia Umum' : 'Tes Karakteristik Pribadi'}?`,
  options: [
    { id: 'A', text: 'Jawaban A — Pilihan pertama yang memiliki deskripsi lebih panjang' },
    { id: 'B', text: 'Jawaban B — Pilihan kedua yang juga cukup mendetail' },
    { id: 'C', text: 'Jawaban C — Pilihan ketiga dengan penjelasan berbeda' },
    { id: 'D', text: 'Jawaban D — Pilihan keempat sebagai opsi terakhir' },
    { id: 'E', text: 'Jawaban E — Pilihan kelima (khusus TKP)' },
  ],
  correct: 'B',
}));

const SUBJECT_COLORS = { TWK: '#FF6B00', TIU: '#3B82F6', TKP: '#22C55E' };

export default function TryoutSessionPage() {
  const { id } = useParams();
  const { T, C } = useTheme();
  const navigate = useNavigate();

  const [questions]       = useState(MOCK_QUESTIONS);
  const [answers, setAnswers] = useState({}); // { qId: optionId }
  const [flagged, setFlagged] = useState({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft]     = useState(100 * 60); // 100 minutes in seconds
  const [showGrid, setShowGrid]     = useState(false);
  const [showSubmit, setShowSubmit] = useState(false);
  const [showTimeout, setShowTimeout] = useState(false);

  const current = questions[currentIdx];
  const answered = Object.keys(answers).length;

  /* Timer */
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(interval); setShowTimeout(true); return 0; }
        if (t === 300) toast('⚠️ Waktu tersisa 5 menit!', { icon: '⏰' });
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleAnswer = (optId) => setAnswers(a => ({ ...a, [current.id]: optId }));
  const toggleFlag   = () => setFlagged(f => ({ ...f, [current.id]: !f[current.id] }));

  const handleSubmit = () => {
    navigate(`/tryout/${id}/result`, { state: { answers, questions, timeSpent: 100 * 60 - timeLeft } });
  };

  /* Keyboard navigation */
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowRight' && currentIdx < questions.length - 1) setCurrentIdx(i => i + 1);
      if (e.key === 'ArrowLeft'  && currentIdx > 0) setCurrentIdx(i => i - 1);
      if (['a','b','c','d','e'].includes(e.key.toLowerCase())) {
        const optId = e.key.toUpperCase();
        if (current.options.find(o => o.id === optId)) handleAnswer(optId);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [currentIdx, current]);

  const timerColor = timeLeft < 300 ? C.red : timeLeft < 600 ? C.yellow : C.green;

  return (
    <>
      <SEO title="Mengerjakan Tryout" url="/tryout-session" noindex />
      <div style={{ display: 'flex', height: '100vh', background: T.bg1, overflow: 'hidden' }}>

      {/* Left: Question panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{
          height: 60, background: T.bg2, borderBottom: `1px solid ${T.border}`,
          display: 'flex', alignItems: 'center', padding: '0 20px', gap: 16,
        }}>
          <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 16, color: T.text }}>
            SKD CPNS Simulasi
          </div>
          <div style={{ flex: 1 }} />
          {/* Timer */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: timerColor + '18', border: `1px solid ${timerColor}40`,
            borderRadius: 10, padding: '6px 14px',
          }}>
            <Clock size={14} color={timerColor} />
            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 17, color: timerColor }}>
              {formatDuration(timeLeft)}
            </span>
          </div>
          <button
            onClick={() => setShowGrid(s => !s)}
            style={{ background: T.bg4, border: 'none', borderRadius: 8, width: 34, height: 34, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.text3 }}
          >
            <Grid size={16} />
          </button>
          <Button variant="danger" size="sm" onClick={() => setShowSubmit(true)}>
            Kumpulkan
          </Button>
        </div>

        {/* Subject tabs */}
        <div style={{
          background: T.bg2, borderBottom: `1px solid ${T.border}`,
          display: 'flex', padding: '8px 20px', gap: 8,
        }}>
          {[['TWK', 0, 9], ['TIU', 10, 19], ['TKP', 20, 29]].map(([subj, start, end]) => {
            const subjAnswered = questions.slice(start, end + 1).filter(q => answers[q.id]).length;
            const total = end - start + 1;
            return (
              <button
                key={subj}
                onClick={() => setCurrentIdx(start)}
                style={{
                  padding: '5px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                  background: currentIdx >= start && currentIdx <= end ? SUBJECT_COLORS[subj] + '22' : T.bg4,
                  color: currentIdx >= start && currentIdx <= end ? SUBJECT_COLORS[subj] : T.text3,
                  fontWeight: 700, fontSize: 12,
                  borderBottom: currentIdx >= start && currentIdx <= end ? `2px solid ${SUBJECT_COLORS[subj]}` : '2px solid transparent',
                }}
              >
                {subj} ({subjAnswered}/{total})
              </button>
            );
          })}
        </div>

        {/* Question content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          <div style={{ maxWidth: 700, margin: '0 auto' }}>
            {/* Question header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{
                background: SUBJECT_COLORS[current.subject] + '22',
                color: SUBJECT_COLORS[current.subject],
                fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 13,
                padding: '4px 12px', borderRadius: 8,
              }}>
                {current.subject} — No. {current.number}
              </div>
              <button
                onClick={toggleFlag}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  background: flagged[current.id] ? '#F59E0B22' : T.bg4,
                  color: flagged[current.id] ? '#F59E0B' : T.text4,
                  border: `1px solid ${flagged[current.id] ? '#F59E0B' : T.border}`,
                  borderRadius: 8, padding: '4px 10px', cursor: 'pointer', fontSize: 11, fontWeight: 600,
                }}
              >
                <Flag size={12} /> {flagged[current.id] ? 'Ragu-ragu' : 'Tandai'}
              </button>
            </div>

            {/* Question text */}
            <div style={{
              background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 14,
              padding: '20px 22px', marginBottom: 20,
              fontSize: 15, color: T.text, lineHeight: 1.7,
            }}>
              {current.text}
            </div>

            {/* Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {current.options.map(opt => {
                const selected = answers[current.id] === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleAnswer(opt.id)}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: 14,
                      padding: '14px 16px', borderRadius: 12, cursor: 'pointer',
                      background: selected ? SUBJECT_COLORS[current.subject] + '18' : T.bg3,
                      border: `1.5px solid ${selected ? SUBJECT_COLORS[current.subject] : T.border}`,
                      textAlign: 'left', transition: 'all .15s',
                    }}
                    onMouseEnter={e => !selected && Object.assign(e.currentTarget.style, { borderColor: T.border2, background: T.bg4 })}
                    onMouseLeave={e => !selected && Object.assign(e.currentTarget.style, { borderColor: T.border, background: T.bg3 })}
                  >
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%', flexShrink: 0, display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      background: selected ? SUBJECT_COLORS[current.subject] : T.bg5,
                      color: selected ? '#fff' : T.text3,
                      fontWeight: 800, fontSize: 13, fontFamily: 'Syne, sans-serif',
                    }}>
                      {opt.id}
                    </div>
                    <span style={{ fontSize: 14, color: T.text, lineHeight: 1.6, paddingTop: 4 }}>
                      {opt.text}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Navigation footer */}
        <div style={{
          height: 60, background: T.bg2, borderTop: `1px solid ${T.border}`,
          display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12,
        }}>
          <Button
            variant="ghost" size="sm"
            disabled={currentIdx === 0}
            onClick={() => setCurrentIdx(i => i - 1)}
            icon={<ChevronLeft size={14} />}
          >
            Sebelumnya
          </Button>
          <div style={{ flex: 1, textAlign: 'center', fontSize: 13, color: T.text3 }}>
            <strong style={{ color: T.text }}>{answered}</strong> / {questions.length} dijawab
          </div>
          <Button
            size="sm"
            disabled={currentIdx === questions.length - 1}
            onClick={() => setCurrentIdx(i => i + 1)}
          >
            Berikutnya <ChevronRight size={14} />
          </Button>
        </div>
      </div>

      {/* Right: Question grid sidebar */}
      {showGrid && (
        <div style={{
          width: 280, background: T.bg2, borderLeft: `1px solid ${T.border}`,
          display: 'flex', flexDirection: 'column', overflowY: 'auto',
          animation: 'slideLeft .2s ease',
        }}>
          <div style={{ padding: '14px 16px', borderBottom: `1px solid ${T.border}`, fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 13 }}>
            Navigasi Soal
          </div>
          <div style={{ padding: 12 }}>
            {[['TWK', 0, 9], ['TIU', 10, 19], ['TKP', 20, 29]].map(([subj, start, end]) => (
              <div key={subj} style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: SUBJECT_COLORS[subj], marginBottom: 6, padding: '0 4px' }}>{subj}</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 5 }}>
                  {questions.slice(start, end + 1).map(q => {
                    const isAnswered = !!answers[q.id];
                    const isFlagged  = !!flagged[q.id];
                    const isCurrent  = currentIdx === questions.indexOf(q);
                    return (
                      <button
                        key={q.id}
                        onClick={() => setCurrentIdx(questions.indexOf(q))}
                        style={{
                          width: '100%', aspectRatio: '1', borderRadius: 8,
                          border: `1.5px solid ${isCurrent ? SUBJECT_COLORS[subj] : isAnswered ? SUBJECT_COLORS[subj] + '80' : T.border}`,
                          background: isCurrent ? SUBJECT_COLORS[subj] : isAnswered ? SUBJECT_COLORS[subj] + '20' : T.bg4,
                          color: isCurrent ? '#fff' : isAnswered ? SUBJECT_COLORS[subj] : T.text4,
                          fontSize: 11, fontWeight: 700, cursor: 'pointer',
                          position: 'relative',
                        }}
                      >
                        {q.number}
                        {isFlagged && (
                          <span style={{ position: 'absolute', top: 2, right: 2, width: 5, height: 5, background: '#F59E0B', borderRadius: '50%' }} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div style={{ padding: '8px 16px 16px', marginTop: 'auto' }}>
            {[['Dijawab', '#22C55E', 'filled'], ['Ragu-ragu', '#F59E0B', 'dot'], ['Belum', 'var(--text4)', 'empty']].map(([l, c]) => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: T.text4, marginBottom: 4 }}>
                <div style={{ width: 14, height: 14, borderRadius: 4, background: c + '30', border: `1.5px solid ${c}` }} />
                {l}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Submit confirm modal */}
      <Modal
        open={showSubmit}
        onClose={() => setShowSubmit(false)}
        title="Kumpulkan Jawaban?"
        icon="⚠️"
        width={400}
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowSubmit(false)}>Batal</Button>
            <Button onClick={handleSubmit}>Ya, Kumpulkan</Button>
          </>
        }
      >
        <div style={{ textAlign: 'center', padding: '8px 0' }}>
          <div style={{ fontSize: 13, color: T.text3, marginBottom: 16 }}>
            Kamu baru menjawab <strong style={{ color: C.orange }}>{answered}</strong> dari <strong>{questions.length}</strong> soal.
            {answered < questions.length && (
              <span style={{ color: T.text3 }}> Soal yang belum dijawab akan dianggap kosong.</span>
            )}
          </div>
          {Object.values(flagged).filter(Boolean).length > 0 && (
            <div style={{
              background: '#F59E0B18', border: '1px solid #F59E0B40',
              borderRadius: 10, padding: '10px 14px', fontSize: 12, color: '#F59E0B',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <Flag size={13} />
              {Object.values(flagged).filter(Boolean).length} soal masih ditandai ragu-ragu
            </div>
          )}
        </div>
      </Modal>

      {/* Timeout modal */}
      <Modal open={showTimeout} title="Waktu Habis!" icon="⏰" width={380}>
        <div style={{ textAlign: 'center', padding: '8px 0' }}>
          <div style={{ fontSize: 13, color: T.text3, marginBottom: 16 }}>
            Waktu ujian telah habis. Jawabanmu otomatis dikumpulkan.
          </div>
          <Button onClick={handleSubmit} fullWidth>Lihat Hasil Tryout</Button>
        </div>
      </Modal>
    </div>
    </>
  );
}