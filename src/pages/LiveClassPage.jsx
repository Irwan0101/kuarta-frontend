import { useState, useEffect } from 'react';
import SEO from '@/components/SEO';
import { Play, Bell, FileText, Users, ChevronRight, Video } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import useResponsive from '@/hooks/useResponsive';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { liveApi } from '@/lib/api';

const now = new Date();

function LiveBadge({ C }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#EF4444', animation: 'pulse 1.5s infinite' }} />
      <span style={{ fontSize: 11, fontWeight: 700, color: '#EF4444', letterSpacing: '0.05em' }}>LIVE SEKARANG</span>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.3} }`}</style>
    </div>
  );
}

function ClassCard({ cls, T, C, isLive }) {
  return (
    <div style={{ background: T.bg2, border: `1px solid ${isLive ? '#EF4444' : T.border}`, borderRadius: 14, overflow: 'hidden' }}>
      <div style={{ padding: '10px 18px', background: isLive ? '#EF444415' : T.bg3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {isLive
          ? <><LiveBadge C={C} /><span style={{ fontSize: 11, color: T.text4 }}><Users size={11} style={{ verticalAlign: -1, marginRight: 4 }} />{cls.participants || 0} peserta</span></>
          : <span style={{ fontSize: 12, fontWeight: 600, color: T.text4 }}>📅 {new Date(cls.scheduled_at).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>}
      </div>
      <div style={{ padding: '16px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: '50%', background: C.orange + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 13, color: C.orange, flexShrink: 0 }}>
            {cls.mentor_name?.charAt(0) || 'M'}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{cls.mentor_name || 'Mentor'}</div>
            <div style={{ fontSize: 11, color: T.text4 }}>{cls.program_name || 'Program'}</div>
          </div>
        </div>
        <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 16, color: T.text, marginBottom: 4 }}>{cls.title}</div>
        <div style={{ fontSize: 12, color: T.text3, marginBottom: 12 }}>{cls.program_name} · {cls.duration_mins || '-'} menit</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {isLive ? (
            <>
              <button style={{ flex: 1, padding: '10px', background: '#EF4444', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <Video size={14} /> Masuk Kelas
              </button>
              {cls.resource_url && (
                <button style={{ padding: '10px 14px', background: T.bg4, border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 12, color: T.text3, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <FileText size={13} /> PDF
                </button>
              )}
            </>
          ) : (
            <>
              <button style={{ flex: 1, padding: '10px', background: T.bg4, border: `1px solid ${T.border}`, borderRadius: 10, fontWeight: 600, fontSize: 13, color: T.text2, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <Bell size={13} /> Ingatkan Saya
              </button>
              {cls.resource_url && (
                <button style={{ padding: '10px 14px', background: T.bg4, border: `1px solid ${T.border}`, borderRadius: 10, fontSize: 12, color: T.text3, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <FileText size={13} /> PDF
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LiveClassPage() {
  const { T, C } = useTheme();
  const resp = useResponsive();
  const [tab, setTab] = useState('jadwal');
  const [liveClasses, setLiveClasses] = useState([]);
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      liveApi.getSchedule().catch(() => []),
      liveApi.getRecordings().catch(() => []),
    ]).then(([sched, recs]) => {
      setLiveClasses(Array.isArray(sched) ? sched : []);
      setRecordings(Array.isArray(recs) ? recs : []);
      setLoading(false);
    });
  }, []);

  const liveNow = liveClasses.filter(lc => new Date(lc.scheduled_at) <= now && (!lc.end_at || new Date(lc.end_at) > now));
  const upcoming = liveClasses.filter(lc => new Date(lc.scheduled_at) > now);

  return (
    <>
      <SEO title="Live Class" description="Sesi belajar langsung bersama mentor setiap minggu." url="/live" noindex />
      <div style={{ width: '100%' }}>
        <div style={{ marginBottom: 24, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: resp.isMobile ? 18 : 22, color: T.text, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}><Video size={22} /> Kelas Live Kuarta</h2>
            <p style={{ fontSize: 13, color: T.text3 }}>Sesi tatap muka interaktif dengan mentor terbaik</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {['jadwal', 'rekaman'].map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                padding: '8px 16px', borderRadius: 9, fontSize: 12, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize',
                background: tab === t ? C.orange : T.bg3, color: tab === t ? '#fff' : T.text3,
                border: `1px solid ${tab === t ? C.orange : T.border}`,
              }}>
                {t === 'jadwal' ? 'Jadwal' : 'Rekaman'}
              </button>
            ))}
          </div>
        </div>

        {loading ? <div style={{ textAlign:'center', padding:40, color: T.text3 }}>Memuat...</div> : (
          tab === 'jadwal' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {liveNow.map(cls => <ClassCard key={cls.id} cls={cls} T={T} C={C} isLive={true} />)}
              {liveNow.length === 0 && upcoming.length === 0 && (
                <div style={{ textAlign:'center', padding:40, color: T.text3 }}>Belum ada jadwal live class</div>
              )}
              {upcoming.length > 0 && (
                <>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14, color: T.text, marginBottom: -8 }}>Jadwal Mendatang</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                    {upcoming.map(cls => <ClassCard key={cls.id} cls={cls} T={T} C={C} isLive={false} />)}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {recordings.length === 0 && <div style={{ textAlign:'center', padding:40, color: T.text3 }}>Belum ada rekaman</div>}
              {recordings.map(rec => (
                <div key={rec.id} style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: C.orange + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Play size={18} color={C.orange} fill={C.orange} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 3 }}>{rec.title}</div>
                    <div style={{ fontSize: 11, color: T.text4 }}>{rec.mentor_name || 'Mentor'} · {new Date(rec.scheduled_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 11, color: T.text4 }}>{rec.recording_url ? 'Tersedia' : '-'}</div>
                    <ChevronRight size={14} color={T.text4} style={{ marginTop: 4 }} />
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </>
  );
}
