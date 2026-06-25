// src/pages/LeaderboardPage.jsx
import { useState } from 'react';
import SEO from '@/components/SEO';
import { TrendingUp, TrendingDown, Minus, Trophy, Target, Zap } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/store/authStore';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';

const MOCK_LEADERBOARD = [
  { rank: 1,  name: 'Rizki Firmansyah',  city: 'Jakarta',         score: 489, twk: 85, tiu: 82, tkp: 90, program: 'SKD CPNS', trend: 0  },
  { rank: 2,  name: 'Siti Rahayu',       city: 'Surabaya',        score: 476, twk: 82, tiu: 79, tkp: 88, program: 'SKD CPNS', trend: 2  },
  { rank: 3,  name: 'Bagas Pratama',     city: 'Bandung',         score: 468, twk: 80, tiu: 78, tkp: 86, program: 'Kedinasan', trend: -1 },
  { rank: 4,  name: 'Dewi Lestari',      city: 'Yogyakarta',      score: 461, twk: 79, tiu: 75, tkp: 87, program: 'SKD CPNS', trend: 3  },
  { rank: 5,  name: 'Ahmad Fauzi',       city: 'Medan',           score: 455, twk: 78, tiu: 76, tkp: 85, program: 'Kedinasan', trend: -2 },
  { rank: 6,  name: 'Ratna Dewi',        city: 'Makassar',        score: 448, twk: 77, tiu: 74, tkp: 84, program: 'SKD CPNS', trend: 1  },
  { rank: 7,  name: 'Budi Santoso',      city: 'Semarang',        score: 441, twk: 76, tiu: 73, tkp: 83, program: 'SKD CPNS', trend: 0  },
  { rank: 8,  name: 'Lina Marlina',      city: 'Palembang',       score: 435, twk: 75, tiu: 72, tkp: 82, program: 'Kedinasan', trend: 4  },
  { rank: 9,  name: 'Doni Prasetyo',     city: 'Balikpapan',      score: 428, twk: 74, tiu: 71, tkp: 81, program: 'SKD CPNS', trend: -1 },
  { rank: 10, name: 'Wulan Sari',        city: 'Pekanbaru',       score: 421, twk: 73, tiu: 70, tkp: 80, program: 'Kedinasan', trend: 2  },
  { rank: 11, name: 'Hendra Gunawan',    city: 'Denpasar',        score: 415, twk: 72, tiu: 69, tkp: 79, program: 'SKD CPNS', trend: 0  },
  { rank: 12, name: 'Kamu',             city: 'Palembang',       score: 452, twk: 80, tiu: 74, tkp: 84, program: 'SKD CPNS', trend: 3, isMe: true },
];

const TIPS = [
  { icon: <Target size={14} />, color: '#FF6B00', text: 'Fokus tingkatkan TKP — nilai terbesar' },
  { icon: <Zap size={14} />,    color: '#3B82F6', text: 'Pelajari soal yang salah di TO sebelumnya' },
  { icon: <Trophy size={14} />, color: '#22C55E', text: 'Ikuti live class malam ini jam 19.30' },
];

const MEDAL = ['🥇', '🥈', '🥉'];

const FILTERS = ['Semua Program', 'SKD CPNS', 'Kedinasan'];

export default function LeaderboardPage() {
  const { T, C } = useTheme();
  const { user } = useAuthStore();
  const [filter, setFilter] = useState('Semua Program');

  const filtered = filter === 'Semua Program'
    ? MOCK_LEADERBOARD
    : MOCK_LEADERBOARD.filter(e => e.program === filter);

  const me = MOCK_LEADERBOARD.find(e => e.isMe);

  return (
    <>
      <SEO title="Leaderboard" description="Peringkat nasional siswa Kuarta. Bersaing dengan ribuan siswa dari seluruh Indonesia." url="/leaderboard" noindex />
      <div style={{ width: '100%' }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22, color: T.text, marginBottom: 4 }}>
          🏆 Leaderboard Nasional
        </h2>
        <p style={{ fontSize: 13, color: T.text3 }}>Peringkat berdasarkan skor tryout tertinggi bulan ini</p>
      </div>

      {/* Top 3 podium */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 12, marginBottom: 28 }}>
        {[MOCK_LEADERBOARD[1], MOCK_LEADERBOARD[0], MOCK_LEADERBOARD[2]].map((entry, i) => {
          const heights = [140, 170, 120];
          const podiumColors = ['#C0C0C0', '#F59E0B', '#CD7F32'];
          const order = [2, 1, 3];
          return (
            <div key={entry.rank} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, maxWidth: 180 }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>{MEDAL[entry.rank - 1]}</div>
              <Avatar name={entry.name} size={44} />
              <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginTop: 8, textAlign: 'center' }}>{entry.name.split(' ')[0]}</div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 16, color: podiumColors[i], marginTop: 2 }}>{entry.score}</div>
              <div style={{
                width: '100%', height: heights[i], marginTop: 10,
                background: podiumColors[i] + '25',
                border: `2px solid ${podiumColors[i]}50`,
                borderRadius: '10px 10px 0 0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22, color: podiumColors[i] }}>#{entry.rank}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20 }}>
        {/* Table */}
        <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 14, overflow: 'hidden' }}>
          {/* Filter tabs */}
          <div style={{ padding: '14px 20px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14, color: T.text }}>Top 100 Pejuang Kuarta</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {FILTERS.map(f => (
                <button key={f} onClick={() => setFilter(f)} style={{
                  padding: '5px 12px', borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                  background: filter === f ? C.orange : T.bg4,
                  color: filter === f ? '#fff' : T.text4,
                  border: `1px solid ${filter === f ? C.orange : T.border}`,
                }}>
                  {f}
                </button>
              ))}
            </div>
          </div>
          {/* Table header */}
          <div style={{ display: 'grid', gridTemplateColumns: '52px 1fr 100px 80px 80px', padding: '10px 20px', borderBottom: `1px solid ${T.border}`, background: T.bg3 }}>
            {['Rank', 'Peserta', 'Program', 'Skor', 'Tren'].map((h, i) => (
              <div key={h} style={{ fontSize: 10, fontWeight: 700, color: T.text4, textTransform: 'uppercase', letterSpacing: '0.04em', textAlign: i >= 3 ? 'right' : 'left' }}>{h}</div>
            ))}
          </div>
          {filtered.map((entry) => (
            <div key={entry.rank} style={{
              display: 'grid', gridTemplateColumns: '52px 1fr 100px 80px 80px',
              padding: '12px 20px', borderBottom: `1px solid ${T.border}`,
              background: entry.isMe ? C.orange + '08' : 'transparent',
              transition: 'background .15s',
            }}>
              <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 14, color: entry.rank <= 3 ? ['#F59E0B', '#C0C0C0', '#CD7F32'][entry.rank - 1] : T.text4 }}>
                {entry.rank <= 3 ? MEDAL[entry.rank - 1] : `#${entry.rank}`}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Avatar name={entry.name} size={28} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: entry.isMe ? 700 : 500, color: entry.isMe ? C.orange : T.text }}>{entry.name}</div>
                  <div style={{ fontSize: 11, color: T.text4 }}>{entry.city}</div>
                </div>
              </div>
              <div>
                <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: C.orange + '15', color: C.orange, fontWeight: 600 }}>
                  {entry.program}
                </span>
              </div>
              <div style={{ textAlign: 'right', fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 14, color: entry.isMe ? C.orange : T.text }}>{entry.score}</div>
              <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 3 }}>
                {entry.trend > 0
                  ? <><TrendingUp size={13} color={C.green} /><span style={{ fontSize: 11, color: C.green, fontWeight: 700 }}>+{entry.trend}</span></>
                  : entry.trend < 0
                    ? <><TrendingDown size={13} color="#EF4444" /><span style={{ fontSize: 11, color: '#EF4444', fontWeight: 700 }}>{entry.trend}</span></>
                    : <Minus size={13} color={T.text4} />}
              </div>
            </div>
          ))}
        </div>

        {/* Right sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* My position */}
          <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: `1px solid ${T.border}` }}>
              <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14, color: T.text }}>Posisi Kamu</div>
            </div>
            <div style={{ padding: '20px 18px', textAlign: 'center' }}>
              <Avatar name={user?.name || 'Andi Saputra'} size={52} />
              <div style={{ fontSize: 11, color: T.text4, marginTop: 12, marginBottom: 4 }}>Peringkat Nasional</div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 48, color: C.orange, lineHeight: 1 }}>#12</div>
              <div style={{ fontSize: 12, color: C.green, marginTop: 4, marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                <TrendingUp size={13} /> Naik 3 peringkat bulan ini
              </div>
              <div style={{ background: T.bg3, borderRadius: 10, padding: '12px 16px' }}>
                <div style={{ fontSize: 11, color: T.text4 }}>Skor Kamu</div>
                <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 28, color: T.text }}>452</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                  {[['TWK', 80, C.orange], ['TIU', 74, C.blue], ['TKP', 84, C.green]].map(([k, v, c]) => (
                    <div key={k} style={{ textAlign: 'center' }}>
                      <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, color: c }}>{v}</div>
                      <div style={{ fontSize: 10, color: T.text4 }}>{k}</div>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 11, color: T.text4, marginTop: 10 }}>Selisih dari #1: <span style={{ color: '#EF4444', fontWeight: 700 }}>37 poin</span></div>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: `1px solid ${T.border}` }}>
              <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14, color: T.text }}>Tips Naik Peringkat</div>
            </div>
            <div style={{ padding: '12px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {TIPS.map((t, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <div style={{ width: 26, height: 26, borderRadius: 7, background: t.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.color, flexShrink: 0, marginTop: 1 }}>
                    {t.icon}
                  </div>
                  <div style={{ fontSize: 12, color: T.text3, lineHeight: 1.5 }}>{t.text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}