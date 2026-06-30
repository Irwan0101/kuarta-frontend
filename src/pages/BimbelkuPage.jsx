import { useState, useEffect } from 'react';
import SEO from '@/components/SEO';
import { BookOpen, Play, CheckCircle, Circle, Clock, ChevronRight, Target, Flame, BarChart2, Download, PenTool, GraduationCap, ListChecks, Trophy, Zap, Star, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { programsApi, materiApi, tryoutApi } from '@/lib/api';

const ACHIEVEMENT_ICONS = { flame: Flame, target: Target, book: BookOpen, zap: Zap };

function VideoPlayer({ C, T, lesson, onPlay }) {
  if (!lesson) {
    return (
      <div style={{ borderRadius: 16, overflow: 'hidden', background: '#0d0d0d', position: 'relative', aspectRatio: '16/9' }}>
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${C.orange}20 0%, #1a0a00 50%, #000 100%)` }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', color: '#888', fontSize: 13 }}>
          Belum ada materi
        </div>
      </div>
    );
  }
  return (
    <div onClick={onPlay} style={{ borderRadius: 16, overflow: 'hidden', background: '#0d0d0d', position: 'relative', aspectRatio: '16/9', cursor: 'pointer' }}>
      <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${C.orange}20 0%, #1a0a00 50%, #000 100%)` }} />
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: C.orange, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Play size={22} color="#fff" fill="#fff" />
        </div>
        <span style={{ color: '#fff', fontSize: 12, fontWeight: 600 }}>Mulai Belajar</span>
      </div>
      <div style={{ position: 'absolute', bottom: 10, left: 12, fontSize: 11, color: 'rgba(255,255,255,.6)' }}>
        {lesson.title}
      </div>
    </div>
  );
}

function SyllabusItem({ item, C, T, onClick }) {
  return (
    <div onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', cursor: 'pointer', borderBottom: `1px solid ${T.border}` }}>
      <div style={{
        width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
        background: item.completed ? C.orange + '20' : T.bg4,
        border: item.completed ? `1.5px solid ${C.orange}` : `1.5px solid ${T.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {item.completed ? <CheckCircle size={12} color={C.orange} /> : <Circle size={12} color={T.text4} />}
      </div>
      <span style={{ flex: 1, fontSize: 13, color: item.completed ? T.text3 : T.text2 }}>{item.title}</span>
      {item.duration_mins > 0 && <span style={{ fontSize: 11, color: T.text4 }}>{item.duration_mins}m</span>}
      <ChevronRight size={13} color={T.text4} />
    </div>
  );
}

function RadarTooltip({ active, payload, T }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: T.bg2, border: `1px solid ${T.border2}`, borderRadius: 8, padding: '8px 12px', fontSize: 12 }}>
      <div style={{ fontWeight: 700, color: T.text }}>{payload[0]?.payload?.subject}</div>
      <div style={{ color: '#FF6B00' }}>{payload[0]?.value}</div>
    </div>
  );
}

export default function BimbelkuPage() {
  const { T, C } = useTheme();
  const navigate = useNavigate();

  const [programs, setPrograms] = useState([]);
  const [modules, setModules] = useState([]);
  const [activeProgramId, setActiveProgramId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [radarData, setRadarData] = useState(null);
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    Promise.all([
      programsApi.getEnrolled().catch(() => []),
      tryoutApi.getHistory().catch(() => []),
    ]).then(([enrolled, history]) => {
      const list = Array.isArray(enrolled) ? enrolled : [];
      setPrograms(list);
      if (list.length > 0) setActiveProgramId(list[0].program_id || list[0].id);

      const results = Array.isArray(history) ? history : [];
      if (results.length > 0) {
        const avgTWK = Math.round(results.reduce((a, r) => a + (r.twk_score || 0), 0) / results.length);
        const avgTIU = Math.round(results.reduce((a, r) => a + (r.tiu_score || 0), 0) / results.length);
        const avgTKP = Math.round(results.reduce((a, r) => a + (r.tkp_score || 0), 0) / results.length);
        setRadarData([
          { subject: 'TWK', score: avgTWK, fullMark: 100 },
          { subject: 'TIU', score: avgTIU, fullMark: 100 },
          { subject: 'TKP', score: avgTKP, fullMark: 100 },
        ]);
        const avgAll = (avgTWK + avgTIU + avgTKP) / 3;
        const completedAny = results.some(r => r.duration_secs > 0);
        const speedrun = results.some(r => r.duration_secs && r.duration_secs < 3600);
        setAchievements([
          { id: 1, icon: 'flame', title: 'Tryout Pertama', desc: 'Selesaikan tryout pertama', unlocked: results.length > 0 },
          { id: 2, icon: 'target', title: 'Nilai 80+', desc: 'Rata-rata tryout di atas 80', unlocked: avgAll >= 80 },
          { id: 3, icon: 'book', title: 'Rajin Belajar', desc: 'Selesaikan sesi tryout', unlocked: completedAny },
          { id: 4, icon: 'zap', title: 'Speedrunner', desc: 'Selesaikan tryout < 60 menit', unlocked: speedrun },
        ]);
      } else {
        setAchievements([
          { id: 1, icon: 'flame', title: 'Tryout Pertama', desc: 'Selesaikan tryout pertama', unlocked: false },
          { id: 2, icon: 'target', title: 'Nilai 80+', desc: 'Rata-rata tryout di atas 80', unlocked: false },
          { id: 3, icon: 'book', title: 'Rajin Belajar', desc: 'Selesaikan sesi tryout', unlocked: false },
          { id: 4, icon: 'zap', title: 'Speedrunner', desc: 'Selesaikan tryout < 60 menit', unlocked: false },
        ]);
      }
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!activeProgramId) return;
    materiApi.getModules(activeProgramId)
      .then(res => setModules(Array.isArray(res) ? res : []))
      .catch(() => setModules([]));
  }, [activeProgramId]);

  const activeProgram = programs.find(p => (p.program_id || p.id) === activeProgramId);
  const allLessons = modules.flatMap(m => m.lessons || []);
  const totalLessons = allLessons.length;
  const doneLessons = allLessons.filter(l => l.completed).length;
  const streakCount = useAuthStore.getState().user?.streak_count || 0;
  const totalWatchMins = allLessons.filter(l => l.completed).reduce((a, l) => a + (l.duration_mins || 0), 0);
  const resumeLesson = allLessons.find(l => !l.completed) || allLessons[0];

  return (
    <>
      <SEO title="Bimbelku" description="Akses video belajar, materi, dan tryout sesuai program yang kamu ikuti" url="/belajar" noindex />
      <div style={{ width: '100%' }}>

        {/* Header */}
        <div style={{ marginBottom: 24, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22, color: T.text, marginBottom: 4 }}>Bimbelku</h2>
            <p style={{ fontSize: 13, color: T.text3 }}>Lanjutkan belajar & pantau progresmu</p>
          </div>
          <Button onClick={() => navigate('/tryout')} icon={<Play size={13} fill="#fff" />}>Mulai Tryout</Button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12, marginBottom: 24 }}>
          {[
            { icon: <BookOpen size={18} color={C.orange} />, label: 'Modul Selesai', val: `${doneLessons}/${totalLessons}`, bg: C.orange },
            { icon: <Flame size={18} color="#F59E0B" />, label: 'Streak', val: `${streakCount} Hari`, bg: '#F59E0B' },
            { icon: <Target size={18} color={C.blue} />, label: 'Program', val: String(programs.length), bg: C.blue },
            { icon: <Clock size={18} color={C.green} />, label: 'Jam Belajar', val: `${Math.round(totalWatchMins / 60)}j`, bg: C.green },
          ].map(s => (
            <div key={s.label} style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: s.bg + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{s.icon}</div>
              <div>
                <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 17, color: T.text, lineHeight: 1.1 }}>{s.val}</div>
                <div style={{ fontSize: 11, color: T.text4, marginTop: 2 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign:'center', padding: 60, color: T.text3 }}>Memuat...</div>
        ) : programs.length === 0 ? (
          <div style={{ textAlign:'center', padding: 60, color: T.text3 }}>
            <p>Kamu belum terdaftar di program apapun.</p>
            <Button onClick={() => navigate('/program')} style={{ marginTop: 16 }}>Lihat Program</Button>
          </div>
        ) : (
          <>

            {/* Program tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
              {programs.map(p => {
                const pid = p.program_id || p.id;
                return (
                  <button key={pid} onClick={() => setActiveProgramId(pid)} style={{
                    padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    background: activeProgramId === pid ? C.orange : T.bg3,
                    color: activeProgramId === pid ? '#fff' : T.text3,
                    border: `1px solid ${activeProgramId === pid ? C.orange : T.border}`,
                  }}>
                    {p.icon || ''} {p.name || p.program_name}
                  </button>
                );
              })}
            </div>

            {/* Main content */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, marginBottom: 24, alignItems: 'start' }}>
              {/* Left: Video + Info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <VideoPlayer C={C} T={T} lesson={resumeLesson} onPlay={() => resumeLesson && navigate(`/belajar/${resumeLesson.id}`)} />
                <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 14, padding: '16px 20px' }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 8, fontFamily: 'Syne, sans-serif' }}>
                    {activeProgram?.name || activeProgram?.program_name || 'Program'}
                  </div>
                  <div style={{ display: 'flex', gap: 16, fontSize: 12, color: T.text3, marginBottom: 12, flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><ListChecks size={12} /> {totalLessons} pelajaran</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><BarChart2 size={12} /> {doneLessons}/{totalLessons} selesai</span>
                  </div>
                  <div style={{ height: 5, background: T.bg4, borderRadius: 99, marginBottom: 12 }}>
                    <div style={{ width: `${totalLessons > 0 ? (doneLessons / totalLessons * 100) : 0}%`, height: '100%', background: C.orange, borderRadius: 99 }} />
                  </div>
                  <p style={{ fontSize: 13, color: T.text3, lineHeight: 1.6, marginBottom: 14 }}>
                    {resumeLesson ? `Lanjutkan "${resumeLesson.title}"` : 'Pilih materi dari daftar di samping untuk mulai belajar.'}
                  </p>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <button style={{ padding: '9px 18px', background: C.orange, color: '#fff', fontWeight: 700, fontSize: 13, border: 'none', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Download size={13} /> Unduh Materi
                    </button>
                    <button style={{ padding: '9px 18px', background: T.bg4, color: T.text3, border: `1px solid ${T.border}`, fontSize: 13, borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <PenTool size={13} /> Latihan
                    </button>
                  </div>
                </div>
              </div>

              {/* Right: Syllabus */}
              <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 14, overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: 600 }}>
                <div style={{ padding: '14px 18px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                  <div>
                    <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14, color: T.text }}>Materi</div>
                    <div style={{ fontSize: 11, color: T.text4, marginTop: 2 }}>{totalLessons > 0 ? Math.round(doneLessons / totalLessons * 100) : 0}% selesai</div>
                  </div>
                  <div style={{ fontSize: 12, color: C.orange, fontWeight: 700 }}>{doneLessons}/{totalLessons}</div>
                </div>
                <div style={{ overflowY: 'auto', flex: 1 }}>
                  {modules.length === 0 && <div style={{ padding: 20, fontSize: 12, color: T.text3, textAlign: 'center' }}>Belum ada modul</div>}
                  {modules.map(m => (
                    <div key={m.id}>
                      <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '11px 18px', background: T.bg3, borderBottom: `1px solid ${T.border}`, fontSize: 12, fontWeight: 700, color: T.text2 }}>
                        <GraduationCap size={14} color={C.orange} /> {m.title}
                      </div>
                      <div style={{ padding: '0 18px 4px' }}>
                        {(m.lessons || []).map(item => (
                          <SyllabusItem key={item.id} item={item} C={C} T={T} onClick={() => navigate(`/belajar/${item.id}`)} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom: Radar + Achievements */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 14, padding: '16px 20px' }}>
                <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14, color: T.text, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <BarChart2 size={16} color={C.orange} /> Peta Kemampuan
                </div>
                <div style={{ fontSize: 12, color: T.text4, marginBottom: 12 }}>Berdasarkan hasil tryout</div>
                <div style={{ height: 200 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData || []} margin={{ top: 0, right: 20, bottom: 0, left: 20 }}>
                      <PolarGrid stroke={T.border} />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: T.text4, fontSize: 11 }} />
                      <Tooltip content={<RadarTooltip T={T} />} />
                      <Radar dataKey="score" stroke={C.orange} fill={C.orange} fillOpacity={0.2} strokeWidth={2} dot={{ r: 3, fill: C.orange }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 14, padding: '16px 20px' }}>
                <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14, color: T.text, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Trophy size={16} color={C.orange} /> Pencapaian
                </div>
                <div style={{ fontSize: 12, color: T.text4, marginBottom: 14 }}>{achievements.filter(a => a.unlocked).length} dari {achievements.length} unlocked</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {achievements.map(a => (
                    <div key={a.id} style={{
                      padding: '12px 14px', borderRadius: 10,
                      background: a.unlocked ? C.orange + '12' : T.bg3,
                      border: `1px solid ${a.unlocked ? C.orange + '40' : T.border}`,
                      opacity: a.unlocked ? 1 : 0.5,
                    }}>
                      <div style={{ marginBottom: 4, color: a.unlocked ? C.orange : T.text4 }}>
                        {(function(){ const Ic = ACHIEVEMENT_ICONS[a.icon]; return Ic ? <Ic size={20} /> : null; })()}
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: a.unlocked ? T.text : T.text3 }}>{a.title}</div>
                      <div style={{ fontSize: 11, color: T.text4, marginTop: 2 }}>{a.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
