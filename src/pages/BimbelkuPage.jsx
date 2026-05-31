// src/pages/BimbelkuPage.jsx
import { useState } from 'react';
import {
  BookOpen, Play, CheckCircle, Circle, Clock, ChevronRight,
  Award, TrendingUp, Target, Star, Lock, Flame, BarChart2,
  Download, PenTool, Video, FileText, Radio,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/store/authStore';
import { Card } from '@/components/ui/Card';
import { ProgressBar, Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';

/* ── Mock Data ─────────────────────────────────────────────────────── */
const MOCK_ENROLLED_PROGRAMS = [
  {
    id: 1,
    name: 'SKD CPNS — Kedinasan',
    icon: '📋',
    color: '#FF6B00',
    progress: 78,
    totalModules: 18,
    doneModules: 14,
    lastStudied: '2 jam lalu',
    chapters: [
      {
        id: 'twk', title: 'Bab 1 — Tes Wawasan Kebangsaan (TWK)', icon: 'flag',
        items: [
          { id: '1.1', title: 'Pancasila & Sejarah', dur: '42m', done: true },
          { id: '1.2', title: 'UUD 1945 HOTS',        dur: '38m', done: true },
          { id: '1.3', title: 'NKRI & Bhineka',       dur: '30m', done: true },
        ],
      },
      {
        id: 'tiu', title: 'Bab 2 — Tes Intelejensia Umum (TIU)', icon: 'brain',
        items: [
          { id: '2.1', title: 'Berhitung Cepat',       dur: '45m', done: true },
          { id: '2.2', title: 'Silogisme Lanjutan',    dur: '36m', done: false, active: true },
          { id: '2.3', title: 'Analogi Kata',          dur: '28m', done: false },
          { id: '2.4', title: 'Deret Angka & Huruf',   dur: '32m', done: false },
        ],
      },
      {
        id: 'tkp', title: 'Bab 3 — Tes Karakteristik Pribadi (TKP)', icon: 'heart',
        items: [
          { id: '3.1', title: 'Anti Radikalisme',      dur: '40m', done: false },
          { id: '3.2', title: 'Pelayanan Publik',      dur: '35m', done: false },
        ],
      },
    ],
  },
  {
    id: 2,
    name: 'TIU Penalaran Numerik',
    icon: '🔢',
    color: '#3B82F6',
    progress: 40,
    totalModules: 10,
    doneModules: 4,
    lastStudied: 'Kemarin',
    chapters: [
      {
        id: 'dasar', title: 'Bab 1 — Dasar Numerik', icon: 'calculator',
        items: [
          { id: '1.1', title: 'Operasi Bilangan Bulat', dur: '30m', done: true },
          { id: '1.2', title: 'Pecahan & Persen',       dur: '25m', done: true },
          { id: '1.3', title: 'Rasio & Proporsi',       dur: '28m', done: true },
          { id: '1.4', title: 'Eksponen & Logaritma',   dur: '32m', done: true },
        ],
      },
      {
        id: 'lanjut', title: 'Bab 2 — Penalaran Lanjut', icon: 'cpu',
        items: [
          { id: '2.1', title: 'Deret Kompleks',         dur: '35m', done: false, active: true },
          { id: '2.2', title: 'Logika Kuantitatif',     dur: '40m', done: false },
        ],
      },
    ],
  },
];

const MOCK_RADAR = [
  { subject: 'TWK', score: 82, fullMark: 100 },
  { subject: 'TIU', score: 75, fullMark: 100 },
  { subject: 'TKP', score: 88, fullMark: 100 },
  { subject: 'Verbal', score: 70, fullMark: 100 },
  { subject: 'Numerik', score: 68, fullMark: 100 },
  { subject: 'Figural', score: 79, fullMark: 100 },
];

const MOCK_ACHIEVEMENTS = [
  { id: 1, icon: '🔥', title: 'Streak 7 Hari',     desc: 'Belajar 7 hari berturut-turut', unlocked: true },
  { id: 2, icon: '🎯', title: 'Nilai 80+',          desc: 'Rata-rata tryout di atas 80',  unlocked: true },
  { id: 3, icon: '📚', title: 'Kutu Buku',          desc: 'Selesaikan 10 modul materi',  unlocked: false },
  { id: 4, icon: '⚡', title: 'Speedrunner',        desc: 'Selesaikan tryout < 60 menit', unlocked: false },
];

const CURRENT_VIDEO = {
  title: 'Silogisme & Penalaran Logis — Tingkat Lanjut',
  mentor: 'Mentor Rizal Saputra',
  duration: '36 Menit',
  level: 'Intermediate',
  progress: 35,
  currentTime: '12:34',
  totalTime: '36:20',
  module: 'Modul 3.4 — Silogisme & Penalaran Logis',
  desc: 'Pelajari cara menarik kesimpulan dari premis secara akurat. Materi ini mencakup silogisme kategoris, hipotetis, dan disjunktif yang sering muncul di soal TIU SKD.',
};

/* ── Sub-components ─────────────────────────────────────────────────── */
function VideoPlayer({ C, T, playing, onToggle }) {
  const v = CURRENT_VIDEO;
  return (
    <div style={{ borderRadius: 16, overflow: 'hidden', background: '#0d0d0d', position: 'relative', aspectRatio: '16/9' }}>
      {/* Fake gradient backdrop */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(135deg, ${C.orange}20 0%, #1a0a00 50%, #000 100%)`,
      }} />
      {/* Module label */}
      <div style={{
        position: 'absolute', top: 14, left: 14,
        background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(6px)',
        padding: '4px 10px', borderRadius: 6, fontSize: 11,
        color: 'rgba(255,255,255,.7)', fontWeight: 600, letterSpacing: '0.04em',
      }}>
        {v.module}
      </div>
      {/* Play button */}
      <button
        onClick={onToggle}
        style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 56, height: 56, borderRadius: '50%',
          background: playing ? 'rgba(255,255,255,.2)' : C.orange,
          border: playing ? '2px solid rgba(255,255,255,.5)' : 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', transition: 'all .2s',
        }}
      >
        {playing
          ? <span style={{ color: '#fff', fontSize: 20, fontWeight: 700 }}>⏸</span>
          : <Play size={22} color="#fff" fill="#fff" />}
      </button>
      {/* Bottom bar */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '32px 14px 14px', background: 'linear-gradient(to top, rgba(0,0,0,.9), transparent)' }}>
        <div style={{ height: 4, background: 'rgba(255,255,255,.15)', borderRadius: 99, marginBottom: 6 }}>
          <div style={{ width: `${v.progress}%`, height: '100%', background: C.orange, borderRadius: 99 }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(255,255,255,.6)' }}>
          <span>{v.currentTime}</span><span>{v.totalTime}</span>
        </div>
      </div>
    </div>
  );
}

function SyllabusItem({ item, C, T, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '9px 0', cursor: 'pointer',
        borderBottom: `1px solid ${T.border}`,
        opacity: item.locked ? 0.4 : 1,
        transition: 'background .15s',
      }}
    >
      <div style={{
        width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
        background: item.done ? C.orange + '20' : item.active ? C.orange + '15' : T.bg4,
        border: item.done ? `1.5px solid ${C.orange}` : item.active ? `1.5px solid ${C.orange}80` : `1.5px solid ${T.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {item.done
          ? <CheckCircle size={12} color={C.orange} />
          : item.active
            ? <div style={{ width: 7, height: 7, borderRadius: '50%', background: C.orange }} />
            : <Circle size={12} color={T.text4} />}
      </div>
      <span style={{
        flex: 1, fontSize: 13, fontWeight: item.active ? 600 : 400,
        color: item.active ? T.text : item.done ? T.text3 : T.text2,
      }}>
        {item.id} {item.title}
      </span>
      {item.locked
        ? <Lock size={12} color={T.text4} />
        : <span style={{ fontSize: 11, color: T.text4 }}>{item.dur}</span>}
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

/* ── Main Page ──────────────────────────────────────────────────────── */
export default function BimbelkuPage() {
  const { T, C } = useTheme();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [activeProgramId, setActiveProgramId] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [openChapters, setOpenChapters] = useState({ twk: true, tiu: true, tkp: false, dasar: true, lanjut: false });

  const activeProgram = MOCK_ENROLLED_PROGRAMS.find(p => p.id === activeProgramId);

  const toggleChapter = (id) => setOpenChapters(prev => ({ ...prev, [id]: !prev[id] }));

  const totalDone = MOCK_ENROLLED_PROGRAMS.reduce((a, p) => a + p.doneModules, 0);
  const totalModules = MOCK_ENROLLED_PROGRAMS.reduce((a, p) => a + p.totalModules, 0);

  return (
    <div style={{ width: '100%' }}>

      {/* ── Header ── */}
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22, color: T.text, marginBottom: 4 }}>
            Bimbelku
          </h2>
          <p style={{ fontSize: 13, color: T.text3 }}>
            Lanjutkan belajar & pantau progresmu
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => navigate('/tryout')}
            style={{
              padding: '9px 18px', background: C.orange, color: '#fff',
              fontWeight: 700, fontSize: 13, border: 'none',
              borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <Play size={13} fill="#fff" /> Mulai Tryout
          </button>
        </div>
      </div>

      {/* ── Quick Stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12, marginBottom: 24 }}>
        {[
          { icon: <BookOpen size={18} color={C.orange} />, label: 'Modul Selesai', val: `${totalDone}/${totalModules}`, bg: C.orange },
          { icon: <Flame size={18} color="#F59E0B" />, label: 'Streak Belajar', val: '7 Hari', bg: '#F59E0B' },
          { icon: <Target size={18} color={C.blue} />, label: 'Rata Nilai', val: '78', bg: C.blue },
          { icon: <Clock size={18} color={C.green} />, label: 'Jam Belajar', val: '142 Jam', bg: C.green },
        ].map(s => (
          <div
            key={s.label}
            style={{
              background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 12,
              padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10,
            }}
          >
            <div style={{ width: 36, height: 36, borderRadius: 9, background: s.bg + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {s.icon}
            </div>
            <div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 17, color: T.text, lineHeight: 1.1 }}>{s.val}</div>
              <div style={{ fontSize: 11, color: T.text4, marginTop: 2 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Program Tabs ── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {MOCK_ENROLLED_PROGRAMS.map(p => (
          <button
            key={p.id}
            onClick={() => setActiveProgramId(p.id)}
            style={{
              padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600,
              cursor: 'pointer', transition: 'all .15s',
              background: activeProgramId === p.id ? p.color : T.bg3,
              color: activeProgramId === p.id ? '#fff' : T.text3,
              border: activeProgramId === p.id ? `1px solid ${p.color}` : `1px solid ${T.border}`,
            }}
          >
            {p.icon} {p.name}
          </button>
        ))}
      </div>

      {/* ── Main Content Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, marginBottom: 24 }}>

        {/* Left: Video + Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <VideoPlayer C={C} T={T} playing={playing} onToggle={() => setPlaying(p => !p)} />

          {/* Video meta */}
          <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 14, padding: '16px 20px' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 8, fontFamily: 'Syne, sans-serif' }}>
              {CURRENT_VIDEO.title}
            </div>
            <div style={{ display: 'flex', gap: 16, fontSize: 12, color: T.text3, marginBottom: 12, flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Avatar name={CURRENT_VIDEO.mentor} size={18} /> {CURRENT_VIDEO.mentor}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={12} /> {CURRENT_VIDEO.duration}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><BarChart2 size={12} /> {CURRENT_VIDEO.level}</span>
            </div>
            <p style={{ fontSize: 13, color: T.text3, lineHeight: 1.6, marginBottom: 14 }}>{CURRENT_VIDEO.desc}</p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button style={{
                padding: '9px 18px', background: C.orange, color: '#fff', fontWeight: 700,
                fontSize: 13, border: 'none', borderRadius: 8, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <Download size={13} /> Unduh Materi
              </button>
              <button style={{
                padding: '9px 18px', background: T.bg4, color: T.text3,
                border: `1px solid ${T.border}`, fontSize: 13, borderRadius: 8,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <PenTool size={13} /> Kerjakan Latihan
              </button>
            </div>
          </div>
        </div>

        {/* Right: Syllabus */}
        <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 14, overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: 600 }}>
          {/* Header */}
          <div style={{ padding: '14px 18px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14, color: T.text }}>{activeProgram.name}</div>
              <div style={{ fontSize: 11, color: T.text4, marginTop: 2 }}>{activeProgram.progress}% selesai</div>
            </div>
            <div style={{ fontSize: 12, color: C.orange, fontWeight: 700 }}>{activeProgram.doneModules}/{activeProgram.totalModules}</div>
          </div>
          {/* Progress bar */}
          <div style={{ padding: '10px 18px', borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
            <div style={{ height: 5, background: T.bg4, borderRadius: 99 }}>
              <div style={{ width: `${activeProgram.progress}%`, height: '100%', background: activeProgram.color, borderRadius: 99, transition: 'width .4s' }} />
            </div>
          </div>
          {/* Chapters */}
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {activeProgram.chapters.map(ch => (
              <div key={ch.id}>
                <button
                  onClick={() => toggleChapter(ch.id)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                    padding: '11px 18px', background: 'transparent',
                    border: 'none', borderBottom: `1px solid ${T.border}`,
                    cursor: 'pointer', textAlign: 'left',
                  }}
                >
                  <span style={{ fontSize: 12, fontWeight: 700, color: T.text2, flex: 1 }}>{ch.title}</span>
                  <ChevronRight
                    size={14} color={T.text4}
                    style={{ transform: openChapters[ch.id] ? 'rotate(90deg)' : 'none', transition: 'transform .2s' }}
                  />
                </button>
                {openChapters[ch.id] && (
                  <div style={{ padding: '0 18px 4px' }}>
                    {ch.items.map(item => (
                      <SyllabusItem key={item.id} item={item} C={C} T={T} onClick={() => {}} />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom Row: Radar + Achievements ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* Radar chart */}
        <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 14, padding: '16px 20px' }}>
          <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14, color: T.text, marginBottom: 4 }}>
            📊 Peta Kemampuan
          </div>
          <div style={{ fontSize: 12, color: T.text4, marginBottom: 12 }}>Berdasarkan hasil tryout terakhir</div>
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={MOCK_RADAR} margin={{ top: 0, right: 20, bottom: 0, left: 20 }}>
                <PolarGrid stroke={T.border} />
                <PolarAngleAxis dataKey="subject" tick={{ fill: T.text4, fontSize: 11 }} />
                <Tooltip content={<RadarTooltip T={T} />} />
                <Radar dataKey="score" stroke={C.orange} fill={C.orange} fillOpacity={0.2} strokeWidth={2} dot={{ r: 3, fill: C.orange }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Achievements */}
        <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 14, padding: '16px 20px' }}>
          <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14, color: T.text, marginBottom: 4 }}>
            🏅 Pencapaian
          </div>
          <div style={{ fontSize: 12, color: T.text4, marginBottom: 14 }}>2 dari 4 unlocked</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {MOCK_ACHIEVEMENTS.map(a => (
              <div
                key={a.id}
                style={{
                  padding: '12px 14px', borderRadius: 10,
                  background: a.unlocked ? C.orange + '12' : T.bg3,
                  border: `1px solid ${a.unlocked ? C.orange + '40' : T.border}`,
                  opacity: a.unlocked ? 1 : 0.5,
                }}
              >
                <div style={{ fontSize: 22, marginBottom: 4 }}>{a.icon}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: a.unlocked ? T.text : T.text3 }}>{a.title}</div>
                <div style={{ fontSize: 11, color: T.text4, marginTop: 2 }}>{a.desc}</div>
                {a.unlocked && (
                  <div style={{ fontSize: 10, color: C.orange, fontWeight: 700, marginTop: 6 }}>✓ Terbuka</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}