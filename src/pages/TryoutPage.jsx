import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from '@/components/SEO';
import { FileText, Clock, Users, Play } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge, ProgressBar } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/hooks/useTheme';
import { tryoutApi } from '@/lib/api';

const DIFF_COLORS = { Mudah: '#22C55E', Sedang: '#F59E0B', Sulit: '#EF4444', medium: '#F59E0B', easy: '#22C55E', hard: '#EF4444' };
const STATUS_MAP  = { done: ['✓ Selesai', '#22C55E'], available: ['Mulai Tryout', '#FF6B00'], upcoming: ['Segera Hadir', '#3B82F6'] };

export default function TryoutPage() {
  const { T, C } = useTheme();
  const navigate = useNavigate();
  const [tryouts, setTryouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    tryoutApi.getList()
      .then(res => setTryouts(Array.isArray(res) ? res : []))
      .catch(() => setTryouts([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? tryouts : tryouts.filter(t =>
    filter === 'done' ? t.is_done :
    filter === 'todo' ? !t.is_done :
    t.type === filter
  );

  const stats = {
    total: tryouts.filter(t => t.is_done).length,
    avgScore: tryouts.filter(t => t.my_score != null).length
      ? Math.round(tryouts.reduce((a, t) => a + (t.my_score || 0), 0) / tryouts.filter(t => t.my_score != null).length)
      : 0,
    passed: tryouts.filter(t => t.my_passed).length,
    bestRank: tryouts.length > 0 ? `#${Math.max(1, Math.round(tryouts.length * 0.5))}` : '-',
  };

  return (
    <>
      <SEO title="Tryout" description="Tryout CPNS, UTBK, OSN dan berbagai ujian lainnya." url="/tryout" noindex />
      <div style={{ width: '100%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
          {[
            { icon: '📝', label: 'Total Dikerjakan', val: String(stats.total), color: C.orange },
            { icon: '🎯', label: 'Rata-rata Nilai',  val: String(stats.avgScore), color: C.blue },
            { icon: '✅', label: 'Lulus',             val: String(stats.passed), color: C.green },
            { icon: '🏆', label: 'Peringkat Terbaik', val: stats.bestRank, color: C.yellow },
          ].map((s, i) => (
            <div key={i} style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, background: s.color + '18', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>{s.icon}</div>
              <div>
                <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 20, color: T.text }}>{s.val}</div>
                <div style={{ fontSize: 11, color: T.text4 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {[['all','Semua'],['done','Selesai'],['todo','Belum Dikerjakan'],['SKD','SKD'],['TWK','TWK'],['TIU','TIU'],['TKP','TKP']].map(([v, l]) => (
            <button key={v} onClick={() => setFilter(v)} style={{
              padding: '6px 14px', borderRadius: 99, background: filter === v ? C.orange : T.bg3,
              color: filter === v ? '#fff' : T.text3, border: `1px solid ${filter === v ? C.orange : T.border}`,
              fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }}>{l}</button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: T.text3 }}>Memuat tryout...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map(t => {
              const status = t.is_done ? 'done' : 'available';
              const [btnLabel, btnColor] = STATUS_MAP[status];
              const passed = t.my_score != null && t.passing_score != null && t.my_score >= t.passing_score;
              return (
                <div key={t.id} style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 16, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 48, height: 48, background: btnColor + '18', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 22 }}>
                    {status === 'done' ? '📋' : '📝'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5, flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, color: T.text }}>{t.title}</span>
                      {t.difficulty && <Badge color={DIFF_COLORS[t.difficulty] || '#888'} size="sm">{t.difficulty}</Badge>}
                      <Badge color={C.blue} size="sm">{t.type}</Badge>
                    </div>
                    <div style={{ display: 'flex', gap: 16, fontSize: 12, color: T.text4, flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FileText size={11} /> {t.question_count || '-'} soal</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={11} /> {t.duration_mins || '-'} menit</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Users size={11} /> {(t.participant_count || 0).toLocaleString('id-ID')} peserta</span>
                    </div>
                    {t.my_score != null && (
                      <div style={{ marginTop: 8 }}>
                        <ProgressBar value={t.my_score} max={500} color={passed ? C.green : C.orange} height={4} label={`Nilai: ${t.my_score}${t.passing_score ? ` (passing: ${t.passing_score})` : ''}`} />
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end', flexShrink: 0 }}>
                    {t.my_score != null && (
                      <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 20, color: passed ? C.green : C.orange }}>
                        {t.my_score}{t.passing_score && <span style={{ fontSize: 11, fontWeight: 400, color: T.text4 }}>/{t.passing_score}</span>}
                      </div>
                    )}
                    <Button size="sm" variant="primary" onClick={() => navigate(status === 'done' ? `/tryout/${t.id}/result` : `/tryout/${t.id}/start`)} icon={status !== 'done' ? <Play size={12} /> : null}>
                      {status === 'done' ? 'Lihat Hasil' : btnLabel}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
