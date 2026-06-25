// src/pages/DashboardPage.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from '@/components/SEO';
import {
  Trophy, Target, BookOpen, Clock,
  Play, ArrowRight, TrendingUp, Flame,
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
// import { AppShell } from '@/components/layout/AppShell';
import { StatCard, Card } from '@/components/ui/Card';
import { ProgressBar, Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { dashboardApi } from '@/lib/api';
import { formatIDR, formatDate } from '@/lib/utils';

/* ── Mock data ────────────────────────────────────────────────────── */
const MOCK_STATS = {
  tryoutCount: 24, avgScore: 78, studyHours: 142, rank: 12,
  scoreTrend: 4.2, rankTrend: -3,
};

const MOCK_SCORE_HISTORY = [
  { label: 'TO 1',  twk: 72, tiu: 68, tkp: 80 },
  { label: 'TO 2',  twk: 74, tiu: 71, tkp: 82 },
  { label: 'TO 3',  twk: 71, tiu: 75, tkp: 78 },
  { label: 'TO 4',  twk: 78, tiu: 72, tkp: 85 },
  { label: 'TO 5',  twk: 80, tiu: 76, tkp: 83 },
  { label: 'TO 6',  twk: 82, tiu: 80, tkp: 87 },
  { label: 'TO 7',  twk: 79, tiu: 83, tkp: 88 },
];

const MOCK_LEADERBOARD = [
  { rank: 1,  name: 'Rizki Firmansyah',  score: 478, avatar: null },
  { rank: 2,  name: 'Siti Rahayu',       score: 469, avatar: null },
  { rank: 3,  name: 'Bagas Pratama',     score: 461, avatar: null },
  { rank: 4,  name: 'Dewi Lestari',      score: 455, avatar: null },
  { rank: 5,  name: 'Ahmad Fauzi',       score: 448, avatar: null },
  { rank: 12, name: 'Kamu',             score: 392, avatar: null, isMe: true },
];

const MOCK_UPCOMING = [
  { id: 1, title: 'Live Class TIU — Matematika Dasar', time: new Date(Date.now() + 3600000 * 2), type: 'live' },
  { id: 2, title: 'Tryout SKD Simulasi CPNS 2025 #8', time: new Date(Date.now() + 86400000), type: 'tryout' },
];

const MOCK_PROGRAMS = [
  { id: 1, name: 'SKD Intensif CPNS 2025', progress: 64, icon: '📚', color: '#FF6B00', enrolled: true },
  { id: 2, name: 'TIU Penalaran Numerik',  progress: 40, icon: '🔢', color: '#3B82F6', enrolled: true },
  { id: 3, name: 'TKP Integritas Nasional',progress: 22, icon: '🌟', color: '#22C55E', enrolled: false },
];

/* ── Custom Tooltip ──────────────────────────────────────────────── */
function ChartTooltip({ active, payload, label, T, C }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: T.bg2, border: `1px solid ${T.border2}`, borderRadius: 10, padding: '10px 14px', fontSize: 12 }}>
      <div style={{ fontWeight: 700, color: T.text, marginBottom: 6 }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ color: p.stroke, display: 'flex', gap: 8 }}>
          <span>{p.name.toUpperCase()}</span>
          <span style={{ fontWeight: 700 }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Component ─────────────────────────────────────────────────────── */
export default function DashboardPage() {
  const { T, C, dark }  = useTheme();
  const { user }        = useAuthStore();
  const { openPayment } = useUIStore();
  const navigate        = useNavigate();
  const [stats, setStats] = useState(MOCK_STATS);
  const [loading, setLoading] = useState(false);

  // Greet based on time
  const hour    = new Date().getHours();
  const greet   = hour < 12 ? 'Selamat Pagi' : hour < 17 ? 'Selamat Siang' : 'Selamat Malam';
  const streak  = 7;

  return (
    <>
      <SEO title="Dashboard" url="/dashboard" noindex />
      <div style={{ width: '100%' }}>
       <div style={{
          background: `linear-gradient(135deg, ${C.orange}22 0%, ${C.orange}08 60%, transparent 100%)`,
        border: `1px solid ${C.orange}30`,
        borderRadius: 20, padding: '20px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 24, gap: 16, flexWrap: 'wrap',
      }}>
        <div>
          <div style={{ fontSize: 12, color: C.orange, fontWeight: 700, marginBottom: 4, letterSpacing: '0.05em' }}>
            {greet.toUpperCase()} 👋
          </div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22, color: T.text, marginBottom: 4 }}>
            {user?.name?.split(' ')[0] || 'Pengguna'}!
          </h2>
          <p style={{ fontSize: 13, color: T.text3 }}>
            Kamu sudah belajar <strong style={{ color: C.orange }}>142 jam</strong> bulan ini. Luar biasa! 🔥
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{
            background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 14,
            padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <Flame size={20} color="#F59E0B" />
            <div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 20, color: T.text }}>{streak}</div>
              <div style={{ fontSize: 10, color: T.text4 }}>hari streak</div>
            </div>
          </div>
          <Button onClick={() => navigate('/tryout')} icon={<Play size={14} />}>
            Mulai Tryout
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        <StatCard icon="📝" label="Total Tryout"    value={stats.tryoutCount} trend={5}  color={C.orange} delay={0} />
        <StatCard icon="🎯" label="Rata-rata Nilai"  value={stats.avgScore}    trend={stats.scoreTrend} color={C.blue} delay={80} sub="Dari semua sesi tryout" />
        <StatCard icon="⏱️" label="Jam Belajar"      value={stats.studyHours}  trend={12} color={C.green} delay={160} sub="Bulan ini" />
        <StatCard icon="🏆" label="Peringkat Nasional" value={`#${stats.rank}`} trend={stats.rankTrend} color={C.yellow} delay={240} />
      </div>

      {/* Charts + Leaderboard */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, marginBottom: 24 }}>

        {/* Score trend chart */}
        <Card style={{ padding: 0 }}>
          <div style={{ padding: '18px 20px 12px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, color: T.text, marginBottom: 2 }}>
                Tren Nilai Tryout
              </h3>
              <div style={{ fontSize: 12, color: T.text4 }}>7 tryout terakhir</div>
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
          <div style={{ padding: '16px 8px', height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_SCORE_HISTORY} margin={{ top: 0, right: 16, left: -20, bottom: 0 }}>
                <defs>
                  {[['twk', C.orange], ['tiu', C.blue], ['tkp', C.green]].map(([k, c]) => (
                    <linearGradient key={k} id={`grad_${k}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={c} stopOpacity={0.25} />
                      <stop offset="95%" stopColor={c} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <XAxis dataKey="label" tick={{ fill: T.text4, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[60, 100]} tick={{ fill: T.text4, fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip T={T} C={C} />} />
                <Area type="monotone" dataKey="twk" stroke={C.orange} fill={`url(#grad_twk)`} strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="tiu" stroke={C.blue}   fill={`url(#grad_tiu)`} strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="tkp" stroke={C.green}  fill={`url(#grad_tkp)`} strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Leaderboard */}
        <Card style={{ padding: 0 }}>
          <div style={{ padding: '18px 20px 12px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, color: T.text }}>
              🏆 Leaderboard
            </h3>
            <span style={{ fontSize: 11, color: C.orange, cursor: 'pointer', fontWeight: 600 }}>Lihat semua</span>
          </div>
          <div style={{ padding: '8px 0' }}>
            {MOCK_LEADERBOARD.map((entry, i) => (
              <div
                key={entry.rank}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 16px',
                  background: entry.isMe ? C.orange + '10' : 'transparent',
                  transition: 'background .15s',
                }}
              >
                <div style={{
                  width: 24, textAlign: 'center',
                  fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 13,
                  color: entry.rank === 1 ? '#F59E0B' : entry.rank === 2 ? '#C0C0C0' : entry.rank === 3 ? '#CD7F32' : T.text4,
                }}>
                  {entry.rank <= 3 ? ['🥇','🥈','🥉'][entry.rank - 1] : `#${entry.rank}`}
                </div>
                <Avatar name={entry.name} size={28} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: entry.isMe ? 700 : 500, color: entry.isMe ? C.orange : T.text }}>
                    {entry.name}
                  </div>
                </div>
                <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 13, color: T.text }}>
                  {entry.score}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Programs + Upcoming */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>

        {/* My Programs */}
        <Card style={{ padding: 0 }}>
          <div style={{ padding: '18px 20px 14px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, color: T.text }}>
              📚 Program Saya
            </h3>
            <Button variant="ghost" size="sm" onClick={() => navigate('/materi')} icon={<ArrowRight size={12} />}>
              Lihat semua
            </Button>
          </div>
          <div style={{ padding: '10px 0' }}>
            {MOCK_PROGRAMS.map(p => (
              <div
                key={p.id}
                style={{ padding: '14px 20px', borderBottom: `1px solid ${T.border}`, cursor: 'pointer' }}
                onClick={() => navigate('/materi')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                  <div style={{
                    width: 38, height: 38, background: p.color + '18', borderRadius: 10,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
                  }}>
                    {p.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 2 }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: T.text4 }}>{p.progress}% selesai</div>
                  </div>
                  {!p.enrolled && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={e => { e.stopPropagation(); openPayment({ program: { id: p.id, name: p.name, price: 299000 } }); }}
                    >
                      Daftar
                    </Button>
                  )}
                </div>
                <ProgressBar value={p.progress} color={p.color} height={5} />
              </div>
            ))}
          </div>
        </Card>

        {/* Upcoming */}
        <Card style={{ padding: 0 }}>
          <div style={{ padding: '18px 20px 14px', borderBottom: `1px solid ${T.border}` }}>
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, color: T.text }}>
              📅 Jadwal Mendatang
            </h3>
          </div>
          <div style={{ padding: '10px 0' }}>
            {MOCK_UPCOMING.map(ev => (
              <div
                key={ev.id}
                style={{
                  padding: '14px 20px', borderBottom: `1px solid ${T.border}`,
                  display: 'flex', gap: 12, cursor: 'pointer',
                }}
                onClick={() => navigate(ev.type === 'live' ? '/live' : '/tryout')}
              >
                <div style={{
                  width: 38, height: 38, background: (ev.type === 'live' ? C.blue : C.orange) + '18',
                  borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  fontSize: 18,
                }}>
                  {ev.type === 'live' ? '🎥' : '📝'}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 4 }}>{ev.title}</div>
                  <div style={{ fontSize: 11, color: T.text4 }}>
                    {new Date(ev.time).toLocaleString('id-ID', { weekday: 'short', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            <div style={{ padding: '12px 20px' }}>
              <Button fullWidth variant="ghost" size="sm" onClick={() => navigate('/live')}>
                Lihat Semua Jadwal
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
    </>
  );
 
}