import { useState, useEffect } from 'react';
import SEO from '@/components/SEO';
import { Trophy, Target, Zap } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/store/authStore';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { tryoutApi } from '@/lib/api';
import useResponsive from '@/hooks/useResponsive';

const TIPS = [
  { icon: <Target size={14} />, color: '#FF6B00', text: 'Fokus tingkatkan TKP — nilai terbesar' },
  { icon: <Zap size={14} />,    color: '#3B82F6', text: 'Pelajari soal yang salah di TO sebelumnya' },
  { icon: <Trophy size={14} />, color: '#22C55E', text: 'Ikuti live class malam ini jam 19.30' },
];

const MEDAL = ['🥇', '🥈', '🥉'];

export default function LeaderboardPage() {
  const { T, C } = useTheme();
  const { user } = useAuthStore();
  const resp = useResponsive();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    tryoutApi.getLeaderboard()
      .then(res => setEntries(Array.isArray(res) ? res : []))
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, []);

  const me = entries.find(e => e.id === user?.id);
  const top3 = entries.slice(0, 3);

  return (
    <>
      <SEO title="Leaderboard" description="Peringkat nasional siswa Kuarta." url="/leaderboard" noindex />
      <div style={{ width: '100%' }}>
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22, color: T.text, marginBottom: 4 }}>🏆 Leaderboard Nasional</h2>
          <p style={{ fontSize: 13, color: T.text3 }}>Peringkat berdasarkan skor tryout tertinggi</p>
        </div>

        {loading ? <div style={{ textAlign:'center', padding:40, color: T.text3 }}>Memuat leaderboard...</div> : (
          <>
            {top3.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 12, marginBottom: 28 }}>
                {[top3[1], top3[0], top3[2]].filter(Boolean).map((entry, i) => {
                  const heights = [140, 170, 120];
                  const podiumColors = ['#C0C0C0', '#F59E0B', '#CD7F32'];
                  const rankOrder = [2, 1, 3];
                  return (
                    <div key={entry.id || entry.rank} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, maxWidth: 180 }}>
                      <div style={{ fontSize: 28, marginBottom: 6 }}>{MEDAL[rankOrder[i] - 1] || '🏅'}</div>
                      <Avatar name={entry.name} size={44} />
                      <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginTop: 8, textAlign: 'center' }}>{entry.name?.split(' ')[0]}</div>
                      <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 16, color: podiumColors[i], marginTop: 2 }}>{entry.best_score || entry.score}</div>
                      <div style={{ width: '100%', height: heights[i], marginTop: 10, background: podiumColors[i] + '25', border: `2px solid ${podiumColors[i]}50`, borderRadius: '10px 10px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22, color: podiumColors[i] }}>#{rankOrder[i]}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: resp.isMobile ? '1fr' : '1fr 280px', gap: 20 }}>
              <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 14, overflowX: resp.isMobile ? 'auto' : undefined, overflow: resp.isMobile ? undefined : 'hidden' }}>
                <div style={{ padding: '14px 20px', borderBottom: `1px solid ${T.border}` }}>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14, color: T.text }}>Top Pejuang Kuarta</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '52px 1fr 100px 80px', padding: '10px 20px', borderBottom: `1px solid ${T.border}`, background: T.bg3, minWidth: resp.isMobile ? 400 : undefined }}>
                  {['Rank', 'Peserta', 'Program', 'Skor'].map((h, i) => (
                    <div key={h} style={{ fontSize: 10, fontWeight: 700, color: T.text4, textTransform: 'uppercase', textAlign: i >= 2 ? 'right' : 'left' }}>{h}</div>
                  ))}
                </div>
                {entries.map((entry) => (
                  <div key={entry.id || entry.rank} style={{
                    display: 'grid', gridTemplateColumns: '52px 1fr 100px 80px', padding: '12px 20px',
                    borderBottom: `1px solid ${T.border}`, background: entry.id === user?.id ? C.orange + '08' : 'transparent',
                  }}>
                    <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 14, color: entry.rank <= 3 ? ['#F59E0B', '#C0C0C0', '#CD7F32'][entry.rank - 1] : T.text4 }}>
                      {entry.rank <= 3 ? MEDAL[entry.rank - 1] : `#${entry.rank}`}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Avatar name={entry.name} size={28} />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: entry.id === user?.id ? 700 : 500, color: entry.id === user?.id ? C.orange : T.text }}>{entry.name}</div>
                        <div style={{ fontSize: 11, color: T.text4 }}>{entry.city || '-'}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: C.orange + '15', color: C.orange, fontWeight: 600 }}>{entry.program_name || '-'}</span>
                    </div>
                    <div style={{ textAlign: 'right', fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 14, color: entry.id === user?.id ? C.orange : T.text }}>
                      {entry.best_score || entry.score}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 14, overflow: 'hidden' }}>
                  <div style={{ padding: '14px 18px', borderBottom: `1px solid ${T.border}` }}>
                    <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14, color: T.text }}>Posisi Kamu</div>
                  </div>
                  <div style={{ padding: '20px 18px', textAlign: 'center' }}>
                    <Avatar name={user?.name || 'User'} size={52} />
                    <div style={{ fontSize: 11, color: T.text4, marginTop: 12, marginBottom: 4 }}>Peringkat Nasional</div>
                    <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 48, color: C.orange, lineHeight: 1 }}>
                      #{me ? me.rank : '-'}
                    </div>
                    <div style={{ fontSize: 12, color: T.text3, marginTop: 4, marginBottom: 16 }}>
                      {me ? `${me.best_score || me.score} poin` : 'Belum ada tryout'}
                    </div>
                  </div>
                </div>

                <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 14, overflow: 'hidden' }}>
                  <div style={{ padding: '14px 18px', borderBottom: `1px solid ${T.border}` }}>
                    <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14, color: T.text }}>Tips Naik Peringkat</div>
                  </div>
                  <div style={{ padding: '12px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {TIPS.map((t, i) => (
                      <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                        <div style={{ width: 26, height: 26, borderRadius: 7, background: t.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.color, flexShrink: 0, marginTop: 1 }}>{t.icon}</div>
                        <div style={{ fontSize: 12, color: T.text3, lineHeight: 1.5 }}>{t.text}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
