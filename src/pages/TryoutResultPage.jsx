import { useState, useEffect } from 'react';
import SEO from '@/components/SEO';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, MinusCircle, Clock, Trophy, ArrowLeft, BarChart3 } from 'lucide-react';
import useResponsive from '@/hooks/useResponsive';
import { useTheme } from '@/hooks/useTheme';
import { tryoutApi } from '@/lib/api';
import { formatDuration } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import PageSkeleton from '@/components/PageSkeleton';

const SUBJECT_COLORS = { TWK: '#FF6B00', TIU: '#3B82F6', TKP: '#22C55E' };

export default function TryoutResultPage() {
  const { id } = useParams();
  const { state: navState } = useLocation();
  const { T, C } = useTheme();
  const resp = useResponsive();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (navState?.result) {
        setData({ result: navState.result, answers: navState.answers, questions: navState.questions, timeSpent: navState.timeSpent });
        setLoading(false);
        return;
      }
      try {
        const res = await tryoutApi.getResultByTryout(id);
        const qs = await tryoutApi.getQuestions(id);
        setData({ result: res, questions: qs, answers: res.answers, timeSpent: res.duration_secs });
      } catch (e) {
        setData({ error: 'Gagal memuat hasil tryout' });
      }
      setLoading(false);
    }
    load();
  }, [id, navState]);

  if (loading) return <PageSkeleton type="dashboard" />;
  if (!data || data.error) return <div style={{ textAlign:'center', padding:60, color: T.text4 }}>{data?.error || 'Data tidak ditemukan'}</div>;

  const { result, answers, questions, timeSpent } = data;
  const answerMap = typeof answers === 'object' && answers !== null ? answers : {};
  const passed = result.passed;

  return (
    <div style={{ width:'100%', maxWidth:760, margin:'0 auto' }}>
      <SEO title="Hasil Tryout" url="/tryout-result" noindex />
      {/* Back */}
      <button onClick={() => navigate('/tryout')} style={{
        background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:6,
        color: T.text3, fontSize:13, marginBottom:16, padding:0,
      }}>
        <ArrowLeft size={14} /> Kembali ke Tryout
      </button>

      {/* Header */}
      <Card style={{ marginBottom:20 }}>
        <div style={{ textAlign:'center', padding:'24px 20px 20px' }}>
          <div style={{
            width:64, height:64, borderRadius:'50%', margin:'0 auto 12px', display:'flex',
            alignItems:'center', justifyContent:'center', fontSize:30,
            background: passed ? C.green + '22' : C.orange + '22',
          }}>
            {passed ? '🎉' : '😔'}
          </div>
          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:22, color: T.text, marginBottom:4 }}>
            {result.tryout_title || 'Hasil Tryout'}
          </div>
          <div style={{ fontSize:13, color: T.text4, marginBottom:16 }}>
            {result.program_name && <span>{result.program_name} · </span>}
            {formatDuration(timeSpent || 0)}
          </div>

          {/* Score circle */}
          <div style={{
            width:120, height:120, borderRadius:'50%', margin:'8px auto',
            background: `conic-gradient(${passed ? C.green : C.orange} ${result.total_score}deg, ${T.bg3} 0deg)`,
            display:'flex', alignItems:'center', justifyContent:'center', position:'relative',
          }}>
            <div style={{
              width:100, height:100, borderRadius:'50%', background: T.bg2,
              display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
            }}>
              <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:28, color: T.text }}>
                {result.total_score}
              </span>
              {result.passing_score && (
                <span style={{ fontSize:11, color: T.text4 }}>passing {result.passing_score}</span>
              )}
            </div>
          </div>
          <div style={{
            display:'inline-flex', alignItems:'center', gap:6, marginTop:12,
            padding:'6px 16px', borderRadius:99,
            background: passed ? C.green + '18' : C.orange + '18',
            color: passed ? C.green : C.orange,
            fontWeight:700, fontSize:13,
          }}>
            {passed ? '✅ LULUS' : '❌ TIDAK LULUS'}
          </div>
        </div>
      </Card>

      {/* Stats grid */}
      <div style={{ display:'grid', gridTemplateColumns: resp.isMobile ? '1fr' : 'repeat(3,1fr)', gap:12, marginBottom:20 }}>
        {[
          { label:'Benar', value:result.correct_count, icon:<CheckCircle size={14} />, color:C.green },
          { label:'Salah', value:result.wrong_count, icon:<XCircle size={14} />, color:C.red },
          { label:'Kosong', value:result.empty_count, icon:<MinusCircle size={14} />, color:T.text4 },
        ].map((s,i) => (
          <div key={i} style={{
            background: T.bg2, border:`1px solid ${T.border}`, borderRadius:12,
            padding:'14px', textAlign:'center',
          }}>
            <div style={{ fontSize:11, color: T.text4, marginBottom:6, display:'flex', alignItems:'center', justifyContent:'center', gap:4 }}>
              {s.icon} {s.label}
            </div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:22, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Category scores */}
      <Card style={{ marginBottom:20 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
          <BarChart3 size={16} />
          <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:14, color: T.text }}>Skor per Kategori</span>
        </div>
        {[
          { key:'TWK', label:'TWK (Tes Wawasan Kebangsaan)', score:result.twk_score, color:SUBJECT_COLORS.TWK },
          { key:'TIU', label:'TIU (Tes Intelegensi Umum)', score:result.tiu_score, color:SUBJECT_COLORS.TIU },
          { key:'TKP', label:'TKP (Tes Karakteristik Pribadi)', score:result.tkp_score, color:SUBJECT_COLORS.TKP },
        ].map(s => {
          const max = result.passing_score ? Math.round(result.passing_score * 1.5) : 200;
          const pct = Math.min((s.score / max) * 100, 100);
          return (
            <div key={s.key} style={{ marginBottom:10 }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:4 }}>
                <span style={{ color: T.text3 }}>{s.label}</span>
                <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, color: s.color }}>{s.score}</span>
              </div>
              <div style={{ height:6, background: T.bg3, borderRadius:99, overflow:'hidden' }}>
                <div style={{ width:`${pct}%`, height:'100%', background: s.color, borderRadius:99, transition:'width .8s ease' }} />
              </div>
            </div>
          );
        })}
      </Card>

      {/* Time & Reward */}
      <div style={{ display:'grid', gridTemplateColumns: resp.isMobile ? '1fr' : '1fr 1fr', gap:12, marginBottom:20 }}>
        <Card>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <Clock size={18} color={C.blue} />
            <div>
              <div style={{ fontSize:11, color: T.text4 }}>Waktu Pengerjaan</div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:16, color: T.text }}>
                {formatDuration(timeSpent || 0)}
              </div>
            </div>
          </div>
        </Card>
        <Card>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <Trophy size={18} color={C.yellow} />
            <div>
              <div style={{ fontSize:11, color: T.text4 }}>Poin Hadiah</div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:16, color: T.text }}>
                +{tryout?.reward_points || (passed ? 100 : 30)} poin
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Question review */}
      {questions && questions.length > 0 && (
        <Card>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
            <CheckCircle size={16} />
            <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:14, color: T.text }}>
              Pembahasan Soal
            </span>
          </div>
          {questions.map((q, i) => {
            const userAns = answerMap[q.id]?.answer;
            const correctAns = q.correct_answer || answerMap[q.id]?.correct;
            const isCorrect = userAns && userAns.toUpperCase() === correctAns?.toUpperCase();
            const subj = q.category || 'TWK';
            return (
              <div key={q.id} style={{
                padding:'14px 0', borderBottom: i < questions.length - 1 ? `1px solid ${T.border}` : 'none',
              }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                  <Badge2 label={`${subj} No.${i + 1}`} color={SUBJECT_COLORS[subj] || C.orange} T={T} />
                  {isCorrect ? (
                    <Badge2 label="Benar" color={C.green} T={T} />
                  ) : userAns ? (
                    <Badge2 label="Salah" color={C.red} T={T} />
                  ) : (
                    <Badge2 label="Kosong" color={T.text4} T={T} />
                  )}
                </div>
                <div style={{ fontSize:13, color: T.text, marginBottom:8, lineHeight:1.6 }}>
                  {q.question_text || q.text}
                </div>
                <div style={{ fontSize:12, color: T.text4, display:'flex', gap:16, flexWrap:'wrap' }}>
                  <span>Jawabanmu: <strong style={{ color: isCorrect ? C.green : C.red }}>{userAns || '—'}</strong></span>
                  {!isCorrect && (
                    <span>Jawaban benar: <strong style={{ color: C.green }}>{correctAns}</strong></span>
                  )}
                </div>
                {q.explanation && (
                  <div style={{ marginTop:8, padding:'10px 12px', background: T.bg3, borderRadius:8, fontSize:12, color: T.text3, lineHeight:1.5 }}>
                    {q.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </Card>
      )}

      {/* Bottom actions */}
      <div style={{ display:'flex', gap:10, marginTop:20, paddingBottom:40 }}>
        <Button variant="outline" onClick={() => navigate('/tryout')} icon={<ArrowLeft size={14} />}>
          Kembali
        </Button>
        <Button onClick={() => navigate('/leaderboard')} icon={<Trophy size={14} />}>
          Lihat Peringkat
        </Button>
      </div>
    </div>
  );
}

function Badge2({ label, color, T }) {
  return (
    <span style={{
      display:'inline-block', padding:'2px 8px', borderRadius:6, fontSize:10, fontWeight:700,
      background: color + '20', color,
    }}>
      {label}
    </span>
  );
}
