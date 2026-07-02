import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SEO from '@/components/SEO';
import {
  ArrowLeft, CheckCircle, Circle, Clock, Check, Loader2, ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { materiApi } from '@/lib/api';
import toast from 'react-hot-toast';

const ORG = '#FF6B00';

/* ── YouTube ID extractor ── */
function getYouTubeId(url) {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

/* ── Video renderer ── */
function VideoRenderer({ lesson, onComplete, durationMins }) {
  const [watched, setWatched] = useState(0);
  const vidId = getYouTubeId(lesson.video_url);
  const threshold = durationMins ? durationMins * 60 * 0.8 : 300;

  useEffect(() => {
    if (!vidId) return;
    const id = setInterval(() => {
      setWatched(w => {
        const nw = w + 5;
        if (nw >= threshold) { clearInterval(id); return threshold; }
        return nw;
      });
    }, 5000);
    return () => clearInterval(id);
  }, [vidId]);

  useEffect(() => {
    if (vidId && watched >= threshold) onComplete();
  }, [watched]);

  if (!vidId) {
    return (
      <div style={{ borderRadius: 16, overflow: 'hidden', background: '#0d0d0d', aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#888' }}>
        Video tidak tersedia
      </div>
    );
  }

  return (
    <div style={{ borderRadius: 16, overflow: 'hidden', background: '#000', aspectRatio: '16/9' }}>
      <iframe
        src={`https://www.youtube.com/embed/${vidId}?autoplay=1`}
        title={lesson.title}
        style={{ width: '100%', height: '100%', border: 'none' }}
        allow="autoplay; encrypted-media"
        allowFullScreen
      />
    </div>
  );
}

/* ── PDF renderer ── */
function PdfRenderer({ lesson }) {
  const fileUrl = lesson.pdf_url;
  if (!fileUrl) return null;
  return (
    <div style={{ borderRadius: 16, overflow: 'hidden', background: '#fff', minHeight: 500 }}>
      <iframe src={fileUrl} style={{ width: '100%', height: 600, border: 'none' }} title={lesson.title} />
    </div>
  );
}

/* ── Text / Article renderer ── */
function TextRenderer({ lesson }) {
  return (
    <div style={{ lineHeight: 1.8, fontSize: 14, color: 'inherit' }}>
      <div dangerouslySetInnerHTML={{ __html: lesson.content || lesson.description || '' }} />
    </div>
  );
}

/* ── Quiz renderer ── */
function QuizRenderer({ lesson, onComplete }) {
  const { T, C } = useTheme();
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const questions = lesson.questions || [];
  const allAnswered = questions.every((q, i) => answers[i]);

  const handleSubmit = () => {
    if (!allAnswered) return toast.error('Jawab semua soal terlebih dahulu');
    setSubmitted(true);
    const correct = questions.filter((q, i) => answers[i] === q.correct).length;
    toast.success(`Skor: ${correct}/${questions.length}`);
    if (correct === questions.length) onComplete();
  };

  if (questions.length === 0) {
    return <div style={{ padding: 40, textAlign: 'center', color: T.text4 }}>Belum ada soal</div>;
  }

  return (
    <div>
      {questions.map((q, i) => (
        <div key={i} style={{ marginBottom: 20, padding: 16, background: T.bg2, borderRadius: 12, border: `1px solid ${T.border}` }}>
          <div style={{ fontSize: 11, color: C.orange, fontWeight: 700, marginBottom: 6 }}>Soal {i + 1}</div>
          <div style={{ fontSize: 13, color: T.text, marginBottom: 12 }}>{q.question}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {['a', 'b', 'c', 'd', 'e'].filter(k => q['option_' + k]).map(k => {
              const val = k;
              const isSelected = answers[i] === val;
              const isCorrect = submitted && val === q.correct;
              const isWrong = submitted && isSelected && val !== q.correct;
              return (
                <button
                  key={k}
                  onClick={() => !submitted && setAnswers(a => ({ ...a, [i]: val }))}
                  style={{
                    textAlign: 'left', padding: '10px 14px', borderRadius: 8, cursor: submitted ? 'default' : 'pointer',
                    background: isCorrect ? C.green + '20' : isWrong ? '#EF444420' : isSelected ? C.orange + '18' : T.bg3,
                    border: `1.5px solid ${isCorrect ? C.green : isWrong ? '#EF4444' : isSelected ? C.orange : T.border}`,
                    color: isCorrect ? C.green : isWrong ? '#EF4444' : isSelected ? C.orange : T.text3,
                    fontSize: 13, fontWeight: isSelected ? 600 : 400,
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}
                >
                  <span style={{
                    width: 20, height: 20, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: isCorrect ? C.green : isWrong ? '#EF4444' : isSelected ? C.orange : T.bg4,
                    color: '#fff', fontSize: 11, fontWeight: 700, flexShrink: 0,
                  }}>
                    {isCorrect ? '✓' : isWrong ? '✕' : k.toUpperCase()}
                  </span>
                  {q['option_' + k]}
                </button>
              );
            })}
          </div>
          {submitted && q.explanation && (
            <div style={{ marginTop: 8, padding: '8px 12px', background: T.bg3, borderRadius: 8, fontSize: 12, color: T.text3 }}>
              {q.explanation}
            </div>
          )}
        </div>
      ))}
      {!submitted && (
        <Button fullWidth onClick={handleSubmit} disabled={!allAnswered}>
          Kumpulkan Jawaban
        </Button>
      )}
      {submitted && (
        <div style={{ marginTop: 12, textAlign: 'center' }}>
          <Button variant="outline" onClick={onComplete}>Tandai Selesai</Button>
        </div>
      )}
    </div>
  );
}

/* ── Main ── */
export default function LessonDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { T, C } = useTheme();

  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [allLessons, setAllLessons] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(-1);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setCompleted(false);
    materiApi.getLesson(id).then(async (data) => {
      if (cancelled) return;
      setLesson(data);
      setCompleted(data.completed || false);
      try {
        const modules = await materiApi.getModules(data.program_id || data.topic_id);
        if (cancelled) return;
        const flat = modules.flatMap(m => m.lessons || []);
        setAllLessons(flat);
        setCurrentIdx(flat.findIndex(l => String(l.id) === String(id)));
      } catch (_) {}
    }).catch(() => {
      if (cancelled) return;
      toast.error('Gagal memuat materi');
      navigate('/belajar');
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [id]);

  const handleComplete = async () => {
    try {
      await materiApi.updateProgress(id, true, 60);
      setCompleted(true);
      toast.success('Ditandai selesai!');
    } catch (_) {
      toast.error('Gagal menyimpan progres');
    }
  };

  const goTo = (dir) => {
    const next = currentIdx + dir;
    if (next >= 0 && next < allLessons.length) {
      navigate(`/belajar/${allLessons[next].id}`);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', color: T.text }}>
        <Loader2 size={28} style={{ animation: 'spin 1s linear infinite', marginRight: 10 }} />
        <span>Memuat materi...</span>
      </div>
    );
  }

  if (!lesson) return null;

  const renderContent = () => {
    const sections = [];
    if (lesson.type === 'video' && lesson.video_url) sections.push(<VideoRenderer key="video" lesson={lesson} onComplete={handleComplete} durationMins={lesson.duration_mins} />);
    if (lesson.questions?.length > 0) sections.push(<QuizRenderer key="quiz" lesson={lesson} onComplete={handleComplete} />);
    if (lesson.description) sections.push(
      <div key="text" style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 16, padding: 24, lineHeight: 1.8, fontSize: 14 }}>
        <div dangerouslySetInnerHTML={{ __html: lesson.description }} />
      </div>
    );
    if (lesson.pdf_url) sections.push(<PdfRenderer lesson={lesson} />);
    if (sections.length === 0) sections.push(<div key="empty" style={{ padding: 40, textAlign: 'center', color: T.text4 }}>Belum ada konten untuk pelajaran ini</div>);

    return <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>{sections}</div>;
  };

  return (
    <div style={{ width: '100%', maxWidth: 840, margin: '0 auto' }}>
      <SEO title={lesson.title} url={`/belajar/${id}`} noindex />

      <button onClick={() => navigate('/belajar')} style={{
        background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
        color: T.text3, fontSize: 13, marginBottom: 16, padding: 0,
      }}>
        <ArrowLeft size={14} /> Kembali ke Bimbelku
      </button>

      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          {completed ? <CheckCircle size={18} color={C.green} /> : <Circle size={18} color={T.text4} />}
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 20, color: T.text, margin: 0 }}>
            {lesson.title}
          </h1>
        </div>
        <div style={{ display: 'flex', gap: 12, fontSize: 12, color: T.text4 }}>
          {lesson.duration_mins && <span><Clock size={12} /> {lesson.duration_mins} menit</span>}
          {lesson.type && <span>• {lesson.type.toUpperCase()}</span>}
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        {renderContent()}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, paddingBottom: 40 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="outline" onClick={() => goTo(-1)} disabled={currentIdx <= 0}>
            <ArrowLeft size={13} /> Sebelumnya
          </Button>
          <Button variant="outline" onClick={() => goTo(1)} disabled={currentIdx < 0 || currentIdx >= allLessons.length - 1}>
            Selanjutnya <ChevronRight size={13} />
          </Button>
        </div>
        {!completed && (
          <Button onClick={handleComplete} style={{ background: C.green, color: '#fff' }}>
            <Check size={14} /> Tandai Selesai
          </Button>
        )}
        {completed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: C.green, fontWeight: 700, fontSize: 13 }}>
            <CheckCircle size={16} /> Selesai
          </div>
        )}
      </div>

      <style>{'@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }'}</style>
    </div>
  );
}
