import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from '@/components/SEO';
import { Play, ArrowRight, Flame, ClipboardCheck, Target, Clock, BookOpen } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { StatCard, Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { formatIDR, formatDate } from '@/lib/utils';
import { tryoutApi, programsApi, liveApi } from '@/lib/api';

function useMedia() {
  const [mq, setMq] = useState({ sm: false, md: false, lg: true });
  useEffect(() => {
    const fn = () => setMq({ sm: window.innerWidth < 640, md: window.innerWidth >= 640 && window.innerWidth < 1024, lg: window.innerWidth >= 1024 });
    fn(); window.addEventListener('resize', fn); return () => window.removeEventListener('resize', fn);
  }, []);
  return mq;
}

function ChartTooltip({ active, payload, label, T, C }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: T.bg2, border: `1px solid ${T.border2}`, borderRadius: 10, padding: '10px 14px', fontSize: 12 }}>
      <div style={{ fontWeight: 700, color: T.text, marginBottom: 6 }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ color: p.stroke, display: 'flex', gap: 8 }}>
          <span>{p.name.toUpperCase()}</span><span style={{ fontWeight: 700 }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const { T, C } = useTheme();
  const { user } = useAuthStore();
  const { openPayment } = useUIStore();
  const navigate = useNavigate();
  const mq = useMedia();

  const [tryouts, setTryouts] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [history, setHistory] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      tryoutApi.getList().catch(() => []),
      programsApi.getEnrolled().catch(() => []),
      tryoutApi.getHistory().catch(() => []),
      tryoutApi.getLeaderboard().catch(() => []),
      liveApi.getSchedule().catch(() => []),
    ]).then(([t, p, h, l, s]) => {
      setTryouts(Array.isArray(t) ? t : []);
      setPrograms(Array.isArray(p) ? p : []);
      setHistory(Array.isArray(h) ? h : []);
      setLeaderboard(Array.isArray(l) ? l : []);
      setSchedule(Array.isArray(s) ? s : []);
      setLoading(false);
    });
  }, []);

  const doneTryouts = tryouts.filter(t => t.is_done);
  const avgScore = doneTryouts.length > 0
    ? Math.round(doneTryouts.reduce((a, t) => a + (t.my_score || 0), 0) / doneTryouts.length)
    : 0;

  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Selamat Pagi' : hour < 17 ? 'Selamat Siang' : 'Selamat Malam';
  const streak = user?.streak_count || 0;
  const totalStudyHours = programs.reduce((a, p) => a + (p.total_hours || 0), 0) || 0;

  const scoreHistory = history.slice(0, 7).reverse().map(t => ({
    label: t.created_at ? new Date(t.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : (t.title || '').substring(0, 8),
    twk: t.twk_score || 0,
    tiu: t.tiu_score || 0,
    tkp: t.tkp_score || 0,
  }));

  const leaderboardData = Array.isArray(leaderboard) ? leaderboard.slice(0, 5) : [];

  const now = new Date();
  const upcomingSchedule = schedule
    .filter(s => new Date(s.scheduled_at) > now)
    .slice(0, 3)
    .map(s => ({ id: s.id, title: s.title || s.topic || 'Live Class', time: new Date(s.scheduled_at), type: 'live' }));
  if (upcomingSchedule.length === 0) {
    upcomingSchedule.push({ id: 'default', title: 'Belum ada jadwal', time: null, type: 'none' });
  }

  const programList = programs.map(p => ({
    id: p.program_id || p.id || Math.random(),
    name: p.name || p.program_name || 'Program',
    progress: p.total_lessons > 0 ? Math.round((p.completed_lessons || 0) / p.total_lessons * 100) : 0,
    icon: p.icon || '📚',
    color: C.orange,
  }));

  const cardGrid = mq.sm ? '1fr' : mq.md ? '1fr 1fr' : '1fr 320px';

  return (
    <>
      <SEO title="Dashboard" url="/dashboard" noindex />
      <div style={{ width: '100%' }}>
        <div style={{ background: `linear-gradient(135deg, ${C.orange}22 0%, ${C.orange}08 60%, transparent 100%)`, border: `1px solid ${C.orange}30`, borderRadius: 20, padding: mq.sm ? '16px' : '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 12, color: C.orange, fontWeight: 700, marginBottom: 4, letterSpacing: '0.05em' }}>{greet.toUpperCase()} 👋</div>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: mq.sm ? 18 : 22, color: T.text, marginBottom: 4 }}>{user?.name?.split(' ')[0] || 'Pengguna'}!</h2>
            <p style={{ fontSize: 13, color: T.text3 }}>Kamu sudah belajar <strong style={{ color: C.orange }}>{totalStudyHours} jam</strong> bulan ini. Luar biasa! 🔥</p>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 14, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Flame size={20} color="#F59E0B" />
              <div>
                <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 20, color: T.text }}>{streak}</div>
                <div style={{ fontSize: 10, color: T.text4 }}>hari streak</div>
              </div>
            </div>
            <Button onClick={() => navigate('/tryout')} icon={<Play size={14} />}>Mulai Tryout</Button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${mq.sm ? '140px' : '200px'}, 1fr))`, gap: 16, marginBottom: 24 }}>
          <StatCard icon={<ClipboardCheck size={20} />} label="Total Tryout" value={doneTryouts.length} color={C.orange} delay={0} />
          <StatCard icon={<Target size={20} />} label="Rata-rata Nilai" value={avgScore} color={C.blue} delay={80} sub="Dari semua sesi tryout" />
          <StatCard icon={<Clock size={20} />} label="Jam Belajar" value={totalStudyHours} color={C.green} delay={160} sub="Bulan ini" />
          <StatCard icon={<BookOpen size={20} />} label="Program Aktif" value={programList.length} color={C.yellow} delay={240} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: cardGrid, gap: 20, marginBottom: 24 }}>
          <Card style={{ padding: 0 }}>
            <div style={{ padding: mq.sm ? '14px 16px 12px' : '18px 20px 14px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, color: T.text }}>📚 Program Saya</h3>
              <Button variant="ghost" size="sm" onClick={() => navigate('/belajar')} icon={<ArrowRight size={12} />}>Lihat semua</Button>
            </div>
            <div style={{ padding: '10px 0' }}>
              {programList.length > 0 ? programList.map(p => (
                <div key={p.id} style={{ padding: mq.sm ? '12px 16px' : '14px 20px', borderBottom: `1px solid ${T.border}`, cursor: 'pointer' }} onClick={() => navigate('/belajar')}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                    <div style={{ width: 38, height: 38, background: p.color + '18', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{p.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 2 }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: T.text4 }}>{p.progress}% selesai</div>
                    </div>
                  </div>
                  <ProgressBar value={p.progress} color={p.color} height={5} />
                </div>
              )) : (
                <div style={{ padding: 20, textAlign:'center', color: T.text3, fontSize: 12 }}>
                  Belum ada program. <span style={{ color: C.orange, cursor: 'pointer' }} onClick={() => navigate('/program')}>Lihat program</span>
                </div>
              )}
            </div>
          </Card>

          <Card style={{ padding: 0 }}>
            <div style={{ padding: mq.sm ? '14px 16px 12px' : '18px 20px 14px', borderBottom: `1px solid ${T.border}` }}>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, color: T.text }}>📅 Jadwal Mendatang</h3>
            </div>
            <div style={{ padding: '10px 0' }}>
              {upcomingSchedule.filter(ev => ev.type !== 'none').map(ev => (
                <div key={ev.id} style={{ padding: mq.sm ? '12px 16px' : '14px 20px', borderBottom: `1px solid ${T.border}`, display: 'flex', gap: 12, cursor: 'pointer' }} onClick={() => navigate(ev.type === 'live' ? '/live' : '/tryout')}>
                  <div style={{ width: 38, height: 38, background: (ev.type === 'live' ? C.blue : C.orange) + '18', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 18 }}>
                    {ev.type === 'live' ? '🎥' : '📝'}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 4 }}>{ev.title}</div>
                    <div style={{ fontSize: 11, color: T.text4 }}>{ev.time ? new Date(ev.time).toLocaleString('id-ID', { weekday: 'short', hour: '2-digit', minute: '2-digit' }) : '-'}</div>
                  </div>
                </div>
              ))}
              {upcomingSchedule.filter(ev => ev.type === 'none').length > 0 && (
                <div style={{ padding: '14px 20px', fontSize: 12, color: T.text4 }}>Belum ada jadwal</div>
              )}
              <div style={{ padding: '12px 20px' }}>
                <Button fullWidth variant="ghost" size="sm" onClick={() => navigate('/live')}>Lihat Semua Jadwal</Button>
              </div>
            </div>
          </Card>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: cardGrid, gap: 20 }}>
          <Card style={{ padding: 0 }}>
            <div style={{ padding: mq.sm ? '14px 16px 12px' : '18px 20px 12px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, color: T.text, marginBottom: 2 }}>Tren Nilai Tryout</h3>
                <div style={{ fontSize: 12, color: T.text4 }}>{doneTryouts.length > 0 ? `${doneTryouts.length} tryout terakhir` : 'Belum ada data'}</div>
              </div>
              <div style={{ display: 'flex', gap: 12, fontSize: 11 }}>
                {[['TWK', C.orange], ['TIU', C.blue], ['TKP', C.green]].map(([k, c]) => (
                  <span key={k} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 10, height: 3, background: c, borderRadius: 99, display: 'inline-block' }} />
                    <span style={{ color: T.text3 }}>{k}</span>
                  </span>
                ))}
              </div>
            </div>
            <div style={{ padding: '16px 8px', height: mq.sm ? 180 : 220 }}>
              {scoreHistory.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={scoreHistory} margin={{ top: 0, right: 16, left: -20, bottom: 0 }}>
                    <defs>
                      {[['twk', C.orange], ['tiu', C.blue], ['tkp', C.green]].map(([k, c]) => (
                        <linearGradient key={k} id={`grad_${k}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={c} stopOpacity={0.25} />
                          <stop offset="95%" stopColor={c} stopOpacity={0} />
                        </linearGradient>
                      ))}
                    </defs>
                    <XAxis dataKey="label" tick={{ fill: T.text4, fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[60, 100]} tick={{ fill: T.text4, fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTooltip T={T} C={C} />} />
                    <Area type="monotone" dataKey="twk" stroke={C.orange} fill={`url(#grad_twk)`} strokeWidth={2} dot={false} />
                    <Area type="monotone" dataKey="tiu" stroke={C.blue} fill={`url(#grad_tiu)`} strokeWidth={2} dot={false} />
                    <Area type="monotone" dataKey="tkp" stroke={C.green} fill={`url(#grad_tkp)`} strokeWidth={2} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', color: T.text3, fontSize: 13 }}>Kerjakan tryout untuk melihat tren</div>
              )}
            </div>
          </Card>

          <Card style={{ padding: 0 }}>
            <div style={{ padding: mq.sm ? '14px 16px 12px' : '18px 20px 12px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, color: T.text }}>🏆 Riwayat Tryout</h3>
              <span style={{ fontSize: 11, color: C.orange, cursor: 'pointer', fontWeight: 600 }} onClick={() => navigate('/leaderboard')}>Lihat semua</span>
            </div>
            <div style={{ padding: '8px 0' }}>
              {leaderboardData.length > 0 ? leaderboardData.map((entry, i) => (
                <div key={entry.user_id || i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', background: (entry.user_id === user?.id) ? C.orange + '10' : 'transparent' }}>
                  <div style={{ width: 24, textAlign: 'center', fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 13, color: i === 0 ? '#F59E0B' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : T.text4 }}>
                    {i <= 2 ? ['🥇','🥈','🥉'][i] : `#${i + 1}`}
                  </div>
                  <Avatar name={entry.name || entry.user_name} size={28} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: (entry.user_id === user?.id) ? 700 : 500, color: (entry.user_id === user?.id) ? C.orange : T.text }}>{entry.name || entry.user_name}</div>
                  </div>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 13, color: T.text }}>{entry.score || entry.total_score}</div>
                </div>
              )) : (
                <div style={{ padding: 20, textAlign:'center', color: T.text3, fontSize: 12 }}>Belum ada data tryout</div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
