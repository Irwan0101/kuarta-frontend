import { useEffect, useState } from 'react';
import SEO from '@/components/SEO';
import { Calendar, Clock, Video, MapPin, Users, Star, ChevronRight, ArrowLeft, BookOpen, CheckCircle, XCircle, AlertCircle, Filter } from 'lucide-react';
import useResponsive from '@/hooks/useResponsive';
import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/store/authStore';
import { mentorApi, programsApi } from '@/lib/api';
import { Modal } from '@/components/ui/Modal';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { formatDate, timeAgo } from '@/lib/utils';
import toast from 'react-hot-toast';

const STATUS_MAP = {
  confirmed: { label: 'Dikonfirmasi', color: '#22C55E' },
  pending: { label: 'Menunggu', color: '#F59E0B' },
  completed: { label: 'Selesai', color: '#3B82F6' },
  cancelled: { label: 'Dibatalkan', color: '#EF4444' },
};

export default function MentorPage() {
  const { T, C } = useTheme();
  const resp = useResponsive();
  const { user } = useAuthStore();
  const [mentors, setMentors] = useState([]);
  const [mySessions, setMySessions] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMentor, setActiveMentor] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [showBooking, setShowBooking] = useState(false);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [bookingProgram, setBookingProgram] = useState('');
  const [bookingTopic, setBookingTopic] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [tab, setTab] = useState('mentors');

  useEffect(() => {
    (async () => {
      try {
        const [m, s, p] = await Promise.all([
          mentorApi.getList(),
          mentorApi.getMySessions().catch(() => []),
          programsApi.getAll().catch(() => []),
        ]);
        setMentors(Array.isArray(m) ? m : []);
        setMySessions(Array.isArray(s) ? s : []);
        setPrograms(Array.isArray(p) ? p : []);
      } catch (e) { console.error(e); toast.error('Gagal memuat data mentor'); }
      setLoading(false);
    })();
  }, []);

  const loadSchedule = async (mentor) => {
    setActiveMentor(mentor);
    try {
      const data = await mentorApi.getSchedule(mentor.id);
      setSchedule(Array.isArray(data) ? data : []);
    } catch (e) { setSchedule([]); }
  };

  const handleBooking = async () => {
    if (!bookingDate || !bookingTime || !bookingProgram || !bookingTopic.trim()) {
      return toast.error('Semua field harus diisi');
    }
    setSubmitting(true);
    try {
      await mentorApi.createSession(activeMentor.id, bookingProgram, bookingDate, bookingTime, bookingTopic);
      toast.success('Sesi mentoring berhasil dipesan!');
      setShowBooking(false);
      setBookingDate(''); setBookingTime(''); setBookingProgram(''); setBookingTopic('');
      const s = await mentorApi.getMySessions().catch(() => []);
      setMySessions(Array.isArray(s) ? s : []);
    } catch (e) {
      toast.error(e?.error || 'Gagal memesan sesi');
    }
    setSubmitting(false);
  };

  const updateSessionStatus = async (id, status) => {
    try {
      await mentorApi.updateSessionStatus(id, status);
      setMySessions(prev => prev.map(s => s.id === id ? { ...s, status } : s));
      toast.success(`Sesi ${status === 'completed' ? 'selesai' : 'dibatalkan'}`);
    } catch (e) {
      toast.error(e?.error || 'Gagal memperbarui');
    }
  };

  const renderMentorCard = (mentor) => (
    <div key={mentor.id}
      onClick={() => loadSchedule(mentor)}
      style={{
        background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 14,
        padding: 20, cursor: 'pointer', transition: 'all .2s',
        display: 'flex', gap: 14, alignItems: 'flex-start',
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = C.orange + '60'}
      onMouseLeave={e => e.currentTarget.style.borderColor = T.border}
    >
      {mentor.photo_url ? (
        <img src={mentor.photo_url} alt={mentor.name} style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
      ) : (
        <Avatar name={mentor.name} size={48} ringColor={C.orange} />
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: T.text, marginBottom: 2 }}>{mentor.name}</div>
        <div style={{ fontSize: 12, color: T.text4, marginBottom: 6 }}>{mentor.city || 'Indonesia'}</div>
        {(mentor.specialization || []).length > 0 && (
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 6 }}>
            {mentor.specialization.slice(0, 3).map(s => (
              <span key={s} style={{ background: C.orange + '15', color: C.orange, fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 4 }}>{s}</span>
            ))}
          </div>
        )}
        {mentor.bio && (
          <p style={{ fontSize: 12.5, color: T.text3, lineHeight: 1.5, marginBottom: 10, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {mentor.bio}
          </p>
        )}
        <div style={{ display: 'flex', gap: 12, fontSize: 11.5, color: T.text4 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Video size={12} /> {mentor.total_classes || 0} kelas</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Users size={12} /> {mentor.total_students || 0} siswa</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Star size={12} /> {mentor.rating || '—'}</span>
        </div>
      </div>
      <ChevronRight size={14} color={T.text4} style={{ flexShrink: 0, marginTop: 6 }} />
    </div>
  );

  if (activeMentor) {
    return (
      <div style={{ width: '100%' }}>
        <button onClick={() => setActiveMentor(null)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: C.orange, fontSize: 13, fontWeight: 600, marginBottom: 16 }}>
          <ArrowLeft size={14} /> Kembali
        </button>

        <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 14, padding: 24, marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 12 }}>
            {activeMentor.photo_url ? (
              <img src={activeMentor.photo_url} alt={activeMentor.name} style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
            ) : (
              <Avatar name={activeMentor.name} size={56} ringColor={C.orange} />
            )}
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 18, color: T.text, fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: 2 }}>{activeMentor.name}</div>
              <div style={{ fontSize: 13, color: T.text4, marginBottom: 6 }}>{activeMentor.city || 'Indonesia'}</div>
              {(activeMentor.specialization || []).length > 0 && (
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 6 }}>
                  {activeMentor.specialization.map(s => (
                    <span key={s} style={{ background: C.orange + '15', color: C.orange, fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 4 }}>{s}</span>
                  ))}
                </div>
              )}
              {activeMentor.bio && <p style={{ fontSize: 13, color: T.text3, lineHeight: 1.6 }}>{activeMentor.bio}</p>}
            </div>
          </div>
          <button onClick={() => { setBookingDate(''); setBookingTime(''); setBookingProgram(''); setBookingTopic(''); setShowBooking(true); }}
            style={{
              background: C.orange, color: '#070709', border: 'none', borderRadius: 10,
              padding: '11px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 8,
            }}>
            <Calendar size={15} /> Pesan Sesi Mentoring
          </button>
        </div>

        <h3 style={{ fontSize: 15, fontWeight: 700, color: T.text, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Clock size={14} color={C.orange} /> Jadwal Tersedia
        </h3>
        {schedule.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 30, color: T.text4, fontSize: 13 }}>
            Belum ada jadwal tersedia untuk mentor ini
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {schedule.map(cls => (
              <div key={cls.id} style={{
                background: T.bg3, border: `1px solid ${T.border}`, borderRadius: 10, padding: '14px 18px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: T.text }}>{cls.program_name}</div>
                  <div style={{ fontSize: 12, color: T.text4, marginTop: 3 }}>
                    {formatDate(cls.scheduled_at, { weekday: 'long', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <Badge color={new Date(cls.scheduled_at) > new Date() ? C.green : T.text4} size="sm">
                  {new Date(cls.scheduled_at) > new Date() ? 'Akan Datang' : 'Selesai'}
                </Badge>
              </div>
            ))}
          </div>
        )}

        <Modal open={showBooking} onClose={() => setShowBooking(false)} title="Pesan Sesi Mentoring" icon="📅" width={480}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: T.bg3, borderRadius: 10, padding: 12 }}>
              <Avatar name={activeMentor.name} size={36} />
              <div style={{ fontWeight: 600, fontSize: 13, color: T.text }}>Bersama: {activeMentor.name}</div>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: T.text2, display: 'block', marginBottom: 4 }}>Program</label>
              <select value={bookingProgram} onChange={e => setBookingProgram(e.target.value)}
                style={{
                  width: '100%', padding: '10px 14px', background: T.bg3, border: `1px solid ${T.border2}`,
                  borderRadius: 8, color: T.text, fontSize: 13, outline: 'none', fontFamily: 'inherit',
                  boxSizing: 'border-box',
                }}>
                <option value="">Pilih program</option>
                {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: resp.isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: T.text2, display: 'block', marginBottom: 4 }}>Tanggal</label>
                <input type="date" value={bookingDate} onChange={e => setBookingDate(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 14px', background: T.bg3, border: `1px solid ${T.border2}`,
                    borderRadius: 8, color: T.text, fontSize: 13, outline: 'none', fontFamily: 'inherit',
                    boxSizing: 'border-box',
                  }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: T.text2, display: 'block', marginBottom: 4 }}>Waktu</label>
                <input type="time" value={bookingTime} onChange={e => setBookingTime(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 14px', background: T.bg3, border: `1px solid ${T.border2}`,
                    borderRadius: 8, color: T.text, fontSize: 13, outline: 'none', fontFamily: 'inherit',
                    boxSizing: 'border-box',
                  }} />
              </div>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: T.text2, display: 'block', marginBottom: 4 }}>Topik</label>
              <textarea placeholder="Apa yang ingin kamu diskusikan?"
                value={bookingTopic} onChange={e => setBookingTopic(e.target.value)} rows={3}
                style={{
                  width: '100%', padding: 10, background: T.bg3, border: `1px solid ${T.border2}`,
                  borderRadius: 8, color: T.text, fontSize: 13, fontFamily: 'inherit',
                  resize: 'vertical', outline: 'none', boxSizing: 'border-box',
                }}
                onFocus={e => e.currentTarget.style.borderColor = C.orange}
                onBlur={e => e.currentTarget.style.borderColor = T.border2}
              />
            </div>
          </div>
          <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button onClick={() => setShowBooking(false)}
              style={{ background: T.bg4, color: T.text3, border: `1px solid ${T.border}`, borderRadius: 8, padding: '9px 18px', fontSize: 13, cursor: 'pointer' }}>
              Batal
            </button>
            <button onClick={handleBooking} disabled={!bookingDate || !bookingTime || !bookingProgram || !bookingTopic.trim() || submitting}
              style={{
                background: C.orange, color: '#070709', border: 'none', borderRadius: 8,
                padding: '9px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                opacity: (!bookingDate || !bookingTime || !bookingProgram || !bookingTopic.trim()) ? 0.5 : 1,
              }}>
              {submitting ? 'Memesan...' : 'Pesan Sesi'}
            </button>
          </div>
        </Modal>
      </div>
    );
  }

  if (loading) {
    return <PageSkeleton type="grid" rows={4} />;
  }

  return (
    <div style={{ width: '100%' }}>
      <SEO title="Mentoring" description="Jadwal dan booking sesi mentoring dengan mentor profesional" url="/live" noindex />
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: resp.isMobile ? 20 : 24, fontWeight: 800, color: T.text, marginBottom: 4 }}>
          Mentoring
        </h1>
        <p style={{ fontSize: resp.isMobile ? 12 : 13, color: T.text3 }}>Belajar 1-on-1 dengan mentor berpengalaman</p>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        <button onClick={() => setTab('mentors')}
          style={{
            padding: '8px 18px', borderRadius: 24, fontSize: 12.5, fontWeight: 600,
            background: tab === 'mentors' ? C.orange : T.bg2,
            border: `1px solid ${tab === 'mentors' ? C.orange : T.border}`,
            color: tab === 'mentors' ? '#070709' : T.text3, cursor: 'pointer',
          }}>
          👨‍🏫 Cari Mentor
        </button>
        <button onClick={() => setTab('sessions')}
          style={{
            padding: '8px 18px', borderRadius: 24, fontSize: 12.5, fontWeight: 600,
            background: tab === 'sessions' ? C.orange : T.bg2,
            border: `1px solid ${tab === 'sessions' ? C.orange : T.border}`,
            color: tab === 'sessions' ? '#070709' : T.text3, cursor: 'pointer',
          }}>
          📋 Sesi Saya ({mySessions.length})
        </button>
      </div>

      {tab === 'mentors' && (
        mentors.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: T.text4 }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>👨‍🏫</div>
            <div style={{ fontWeight: 700, fontSize: 14, color: T.text, marginBottom: 4 }}>Belum ada mentor</div>
            <div style={{ fontSize: 12 }}>Mentor akan segera tersedia</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {mentors.map(renderMentorCard)}
          </div>
        )
      )}

      {tab === 'sessions' && (
        mySessions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: T.text4 }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>📋</div>
            <div style={{ fontWeight: 700, fontSize: 14, color: T.text, marginBottom: 4 }}>Belum ada sesi</div>
            <div style={{ fontSize: 12 }}>Pesan sesi mentoring dari mentor yang tersedia</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {mySessions.map(session => {
              const st = STATUS_MAP[session.status] || STATUS_MAP.pending;
              return (
                <div key={session.id} style={{
                  background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 12, padding: '16px 20px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar name={session.mentor_name} size={36} />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13.5, color: T.text }}>{session.mentor_name}</div>
                        <div style={{ fontSize: 11.5, color: T.text4 }}>{session.program_name}</div>
                      </div>
                    </div>
                    <Badge color={st.color} size="sm">{st.label}</Badge>
                  </div>
                  <div style={{ fontSize: 12, color: T.text4, marginBottom: 4 }}>
                    <Calendar size={11} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
                    {formatDate(session.scheduled_at, { weekday: 'long', hour: '2-digit', minute: '2-digit' })}
                  </div>
                  {session.topic && (
                    <p style={{ fontSize: 12.5, color: T.text3, marginBottom: 8 }}>💡 {session.topic}</p>
                  )}
                  {session.status === 'confirmed' && (
                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                      <button onClick={() => updateSessionStatus(session.id, 'completed')}
                        style={{ background: '#22C55E22', color: '#22C55E', border: '1px solid #22C55E40', borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                        <CheckCircle size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Selesai
                      </button>
                      <button onClick={() => updateSessionStatus(session.id, 'cancelled')}
                        style={{ background: '#EF444422', color: '#EF4444', border: '1px solid #EF444440', borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                        <XCircle size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Batalkan
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}
