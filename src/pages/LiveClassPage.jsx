// src/pages/LiveClassPage.jsx
import { useState } from 'react';
import SEO from '@/components/SEO';
import { Play, Bell, FileText, Calendar, Clock, Users, ChevronRight, Video, Mic } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

const now = Date.now();

const MOCK_LIVE = [
  {
    id: 1, status: 'live',
    title: 'Analogi Kata & Silogisme Lanjutan',
    subject: 'Tes Intelejensia Umum (TIU)',
    mentor: 'Rizal Saputra, S.Pd.', mentorRole: 'Mentor TIU & Matematika', initials: 'RS', color: '#EF4444',
    duration: '60 menit', time: '19.30 WIB', participants: 47,
    tags: ['TIU', 'Silogisme', 'Analogi'],
  },
];

const MOCK_UPCOMING = [
  {
    id: 2, status: 'upcoming',
    title: 'Pancasila & UUD 1945 Level HOTS',
    subject: 'Tes Wawasan Kebangsaan (TWK)',
    mentor: 'Dewi Lestari, M.Hum.', mentorRole: 'Mentor TWK & Sejarah', initials: 'DL', color: '#3B82F6',
    duration: '90 menit', time: 'Besok · 20.00 WIB', participants: 0,
    tags: ['TWK', 'Pancasila', 'HOTS'],
  },
  {
    id: 3, status: 'upcoming',
    title: 'Penalaran Numerik Kilat',
    subject: 'Tes Intelejensia Umum (TIU)',
    mentor: 'Budi Santoso, M.Pd.', mentorRole: 'Mentor Numerik', initials: 'BS', color: '#22C55E',
    duration: '75 menit', time: 'Sabtu · 08.00 WIB', participants: 0,
    tags: ['TIU', 'Numerik'],
  },
  {
    id: 4, status: 'upcoming',
    title: 'Strategi TKP Nilai Maksimal',
    subject: 'Tes Karakteristik Pribadi (TKP)',
    mentor: 'Sari Indah, S.Psi.', mentorRole: 'Mentor TKP & Psikologi', initials: 'SI', color: '#A855F7',
    duration: '60 menit', time: 'Minggu · 19.00 WIB', participants: 0,
    tags: ['TKP', 'Strategi'],
  },
];

const MOCK_RECORDINGS = [
  { id: 1, title: 'Berhitung Cepat & Trik Operasi', mentor: 'Rizal Saputra', date: '3 hari lalu', duration: '58m', views: 234 },
  { id: 2, title: 'NKRI & Kebhinekaan Mendalam',    mentor: 'Dewi Lestari',  date: '5 hari lalu', duration: '82m', views: 189 },
  { id: 3, title: 'Anti Radikalisme & Wawasan',     mentor: 'Ahmad Fauzi',   date: '1 minggu lalu', duration: '66m', views: 312 },
];

function LiveBadge({ C }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{
        width: 8, height: 8, borderRadius: '50%', background: '#EF4444',
        animation: 'pulse 1.5s infinite',
      }} />
      <span style={{ fontSize: 11, fontWeight: 700, color: '#EF4444', letterSpacing: '0.05em' }}>LIVE SEKARANG</span>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.3} }`}</style>
    </div>
  );
}

function ClassCard({ cls, T, C, isLive }) {
  return (
    <div style={{
      background: T.bg2,
      border: `1px solid ${isLive ? '#EF4444' : T.border}`,
      borderRadius: 14, overflow: 'hidden',
    }}>
      {/* Status bar */}
      <div style={{
        padding: '10px 18px',
        background: isLive ? '#EF444415' : T.bg3,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {isLive
          ? <><LiveBadge C={C} /><span style={{ fontSize: 11, color: T.text4 }}><Users size={11} style={{ verticalAlign: -1, marginRight: 4 }} />{cls.participants} peserta aktif</span></>
          : <span style={{ fontSize: 12, fontWeight: 600, color: T.text4 }}>📅 {cls.time}</span>}
      </div>
      <div style={{ padding: '16px 18px' }}>
        {/* Mentor */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{
            width: 42, height: 42, borderRadius: '50%',
            background: cls.color + '20', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontFamily: 'Syne, sans-serif', fontWeight: 800,
            fontSize: 13, color: cls.color, flexShrink: 0,
          }}>{cls.initials}</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{cls.mentor}</div>
            <div style={{ fontSize: 11, color: T.text4 }}>{cls.mentorRole}</div>
          </div>
        </div>
        {/* Title */}
        <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 16, color: T.text, marginBottom: 4 }}>{cls.title}</div>
        <div style={{ fontSize: 12, color: T.text3, marginBottom: 12 }}>{cls.subject} · {cls.duration}{!isLive && ` · ${cls.time}`}</div>
        {/* Tags */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
          {cls.tags.map(t => (
            <span key={t} style={{ fontSize: 10, padding: '3px 8px', borderRadius: 6, background: T.bg4, color: T.text4, fontWeight: 600 }}>{t}</span>
          ))}
        </div>
        {/* Actions */}
        <div style={{ display: 'flex', gap: 8 }}>
          {isLive ? (
            <>
              <button style={{
                flex: 1, padding: '10px', background: '#EF4444', color: '#fff',
                border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 13,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}>
                <Video size={14} /> Masuk Kelas Zoom
              </button>
              <button style={{
                padding: '10px 14px', background: T.bg4, border: `1px solid ${T.border}`,
                borderRadius: 10, fontSize: 12, color: T.text3, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 5,
              }}>
                <FileText size={13} /> PDF
              </button>
            </>
          ) : (
            <>
              <button style={{
                flex: 1, padding: '10px', background: T.bg4, border: `1px solid ${T.border}`,
                borderRadius: 10, fontWeight: 600, fontSize: 13, color: T.text2,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}>
                <Bell size={13} /> Ingatkan Saya
              </button>
              <button style={{
                padding: '10px 14px', background: T.bg4, border: `1px solid ${T.border}`,
                borderRadius: 10, fontSize: 12, color: T.text3, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 5,
              }}>
                <FileText size={13} /> PDF
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LiveClassPage() {
  const { T, C } = useTheme();
  const [tab, setTab] = useState('jadwal');

  return (
    <>
      <SEO title="Live Class" description="Sesi belajar langsung bersama mentor setiap minggu. Tanya jawab real-time." url="/live" noindex />
      <div style={{ width: '100%' }}>
        <div style={{ marginBottom: 24, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22, color: T.text, marginBottom: 4 }}>
            🎥 Kelas Live Kuarta
          </h2>
          <p style={{ fontSize: 13, color: T.text3 }}>Sesi tatap muka interaktif dengan mentor terbaik</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['jadwal', 'rekaman'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '8px 16px', borderRadius: 9, fontSize: 12, fontWeight: 600,
              cursor: 'pointer', textTransform: 'capitalize',
              background: tab === t ? C.orange : T.bg3,
              color: tab === t ? '#fff' : T.text3,
              border: `1px solid ${tab === t ? C.orange : T.border}`,
            }}>
              {t === 'jadwal' ? '📅 Jadwal' : '🎬 Rekaman'}
            </button>
          ))}
        </div>
      </div>

      {tab === 'jadwal' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Live now */}
          {MOCK_LIVE.map(cls => (
            <ClassCard key={cls.id} cls={cls} T={T} C={C} isLive={true} />
          ))}
          {/* Upcoming */}
          <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14, color: T.text, marginBottom: -8 }}>Jadwal Mendatang</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {MOCK_UPCOMING.map(cls => (
              <ClassCard key={cls.id} cls={cls} T={T} C={C} isLive={false} />
            ))}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {MOCK_RECORDINGS.map(rec => (
            <div key={rec.id} style={{
              background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 12,
              padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14,
              cursor: 'pointer',
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 10, background: C.orange + '15',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Play size={18} color={C.orange} fill={C.orange} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 3 }}>{rec.title}</div>
                <div style={{ fontSize: 11, color: T.text4 }}>{rec.mentor} · {rec.date} · {rec.duration}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 11, color: T.text4 }}>{rec.views} ditonton</div>
                <ChevronRight size={14} color={T.text4} style={{ marginTop: 4 }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
    </>
  );
}