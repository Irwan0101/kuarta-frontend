// src/pages/TryoutPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from '@/components/SEO';
import { FileText, Clock, Users, Trophy, Play, ChevronRight, Filter } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/Card';
import { Badge, ProgressBar } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/hooks/useTheme';
import { formatDate } from '@/lib/utils';

const TRYOUTS = [
  { id: 1, title: 'SKD CPNS Simulasi #1',  type: 'SKD', questions: 110, duration: 100, participants: 1842, myScore: 385, passingGrade: 311, difficulty: 'Sedang', status: 'done',      date: '2025-01-10' },
  { id: 2, title: 'SKD CPNS Simulasi #2',  type: 'SKD', questions: 110, duration: 100, participants: 2103, myScore: 401, passingGrade: 311, difficulty: 'Sedang', status: 'done',      date: '2025-01-18' },
  { id: 3, title: 'TWK Spesial Wawasan',   type: 'TWK', questions: 30,  duration: 25,  participants: 986,  myScore: null, passingGrade: null, difficulty: 'Mudah', status: 'available', date: '2025-02-01' },
  { id: 4, title: 'TIU Penalaran Angka',   type: 'TIU', questions: 35,  duration: 35,  participants: 1204, myScore: null, passingGrade: null, difficulty: 'Sulit', status: 'available', date: '2025-02-05' },
  { id: 5, title: 'SKD CPNS Simulasi #3',  type: 'SKD', questions: 110, duration: 100, participants: 0,    myScore: null, passingGrade: 311,  difficulty: 'Sulit', status: 'upcoming',  date: '2025-02-15' },
  { id: 6, title: 'TKP Pelayanan Publik',  type: 'TKP', questions: 45,  duration: 40,  participants: 763,  myScore: 192, passingGrade: 166,  difficulty: 'Sedang', status: 'done',     date: '2025-01-25' },
];

const DIFF_COLORS = { Mudah: '#22C55E', Sedang: '#F59E0B', Sulit: '#EF4444' };
const STATUS_MAP  = { done: ['✓ Selesai', '#22C55E'], available: ['Mulai Tryout', '#FF6B00'], upcoming: ['Segera Hadir', '#3B82F6'] };

export default function TryoutPage() {
  const { T, C } = useTheme();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? TRYOUTS : TRYOUTS.filter(t =>
    filter === 'done' ? t.status === 'done' :
    filter === 'todo' ? t.status === 'available' :
    t.type === filter
  );

  return (
    <>
      <SEO title="Tryout" description="Tryout CPNS, UTBK, OSN dan berbagai ujian lainnya. Simulasi mirip asli dengan skor dan pembahasan." url="/tryout" noindex />
      <div style={{ width: '100%' }}>

        {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { icon: '📝', label: 'Total Dikerjakan', val: '6', color: C.orange },
          { icon: '🎯', label: 'Rata-rata Nilai',  val: '393', color: C.blue },
          { icon: '✅', label: 'Lulus SKD',        val: '2',   color: C.green },
          { icon: '🏆', label: 'Peringkat Terbaik',val: '#12', color: C.yellow },
        ].map((s, i) => (
          <div key={i} style={{
            background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 14,
            padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <div style={{ width: 36, height: 36, background: s.color + '18', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>{s.icon}</div>
            <div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 20, color: T.text }}>{s.val}</div>
              <div style={{ fontSize: 11, color: T.text4 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter chips */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {[['all','Semua'],['done','Selesai'],['todo','Belum Dikerjakan'],['SKD','SKD'],['TWK','TWK'],['TIU','TIU'],['TKP','TKP']].map(([v, l]) => (
          <button
            key={v}
            onClick={() => setFilter(v)}
            style={{
              padding: '6px 14px', borderRadius: 99,
              background: filter === v ? C.orange : T.bg3,
              color: filter === v ? '#fff' : T.text3,
              border: `1px solid ${filter === v ? C.orange : T.border}`,
              fontSize: 12, fontWeight: 600, cursor: 'pointer',
              transition: 'all .15s',
            }}
          >{l}</button>
        ))}
      </div>

      {/* Tryout list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.map(t => {
          const [btnLabel, btnColor] = STATUS_MAP[t.status];
          const passed = t.myScore && t.passingGrade && t.myScore >= t.passingGrade;
          return (
            <div
              key={t.id}
              style={{
                background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 16,
                padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16,
                transition: 'border-color .2s, box-shadow .2s',
              }}
              onMouseEnter={e => Object.assign(e.currentTarget.style, { borderColor: T.border2, boxShadow: '0 4px 20px rgba(0,0,0,.15)' })}
              onMouseLeave={e => Object.assign(e.currentTarget.style, { borderColor: T.border, boxShadow: 'none' })}
            >
              {/* Icon */}
              <div style={{
                width: 48, height: 48, background: btnColor + '18', borderRadius: 12,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 22,
              }}>
                {t.status === 'done' ? '📋' : t.status === 'upcoming' ? '🔒' : '📝'}
              </div>

              {/* Info */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5, flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, color: T.text }}>{t.title}</span>
                  <Badge color={DIFF_COLORS[t.difficulty]} size="sm">{t.difficulty}</Badge>
                  <Badge color={C.blue} size="sm">{t.type}</Badge>
                </div>
                <div style={{ display: 'flex', gap: 16, fontSize: 12, color: T.text4, flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FileText size={11} /> {t.questions} soal</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={11} /> {t.duration} menit</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Users size={11} /> {t.participants.toLocaleString('id-ID')} peserta</span>
                </div>
                {t.myScore != null && (
                  <div style={{ marginTop: 8 }}>
                    <ProgressBar
                      value={t.myScore}
                      max={500}
                      color={passed ? C.green : C.orange}
                      height={4}
                      label={`Nilai: ${t.myScore} ${t.passingGrade ? `(passing: ${t.passingGrade})` : ''}`}
                    />
                  </div>
                )}
              </div>

              {/* CTA */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end', flexShrink: 0 }}>
                {t.myScore != null && (
                  <div style={{
                    fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 20,
                    color: passed ? C.green : C.orange,
                  }}>
                    {t.myScore}
                    {t.passingGrade && <span style={{ fontSize: 11, fontWeight: 400, color: T.text4 }}>/{t.passingGrade}</span>}
                  </div>
                )}
                <Button
                  size="sm"
                  variant={t.status === 'upcoming' ? 'ghost' : 'primary'}
                  disabled={t.status === 'upcoming'}
                  onClick={() => t.status === 'available' && navigate(`/tryout/${t.id}`)}
                  icon={t.status === 'available' ? <Play size={12} /> : null}
                >
                  {btnLabel}
                </Button>
                {t.status === 'done' && (
                  <button
                    onClick={() => navigate(`/tryout/${t.id}/result`)}
                    style={{ fontSize: 11, color: C.orange, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                  >
                    Lihat Pembahasan →
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
    </>
  );
}