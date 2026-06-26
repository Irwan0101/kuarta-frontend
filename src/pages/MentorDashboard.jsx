import { useState, useEffect } from 'react';
import { useTheme } from '@/hooks/useTheme';
import useResponsive from '@/hooks/useResponsive';
import { mentorApi } from '@/lib/api';
import { Calendar, MessageCircle, Users, Settings, Clock, CheckCircle, XCircle, Star, Phone, MapPin } from 'lucide-react';

export default function MentorDashboard({ tab: initialTab }) {
  const { T, C } = useTheme();
  const resp = useResponsive();
  const [activeTab, setActiveTab] = useState(initialTab || 'dashboard');
  const [data, setData] = useState({ schedule: null, sessions: [], students: [], profile: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (initialTab) setActiveTab(initialTab); }, [initialTab]);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      mentorApi.getMySchedule().catch(() => null),
      mentorApi.getMentorSessions().catch(() => []),
      mentorApi.getStudents().catch(() => []),
      mentorApi.getProfile().catch(() => null),
    ]).then(([schedule, sessions, students, profile]) => {
      setData({ schedule, sessions, students, profile });
      setLoading(false);
    });
  }, []);

  const tabs = [
    { key: 'dashboard', icon: Calendar, label: 'Dashboard' },
    { key: 'schedule',  icon: Calendar, label: 'Jadwal' },
    { key: 'sessions',  icon: MessageCircle, label: 'Sesi' },
    { key: 'students',  icon: Users, label: 'Siswa' },
    { key: 'profile',   icon: Settings, label: 'Profil' },
  ];

  const container = { maxWidth: 1100, margin: '0 auto' };

  return (
    <div style={container}>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22, color: T.text, marginBottom: 4 }}>
        Dashboard Mentor
      </h1>
      <p style={{ fontSize: 13, color: T.text3, marginBottom: 24 }}>
        Kelola jadwal, sesi mentoring, dan siswa
      </p>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, flexWrap: 'wrap', borderBottom: `1px solid ${T.border}`, paddingBottom: 0 }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            style={{
              padding: '10px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              background: activeTab === t.key ? C.orange + '20' : 'transparent',
              color: activeTab === t.key ? C.orange : T.text3,
              border: 'none', borderBottom: activeTab === t.key ? `2px solid ${C.orange}` : '2px solid transparent',
              borderRadius: '8px 8px 0 0', display: 'flex', alignItems: 'center', gap: 6,
              transition: 'all 0.2s',
            }}>
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: T.text3 }}>Memuat...</div>
      ) : (
        <>
          {activeTab === 'dashboard' && <DashboardTab data={data} T={T} C={C} resp={resp} />}
          {activeTab === 'schedule' && <ScheduleTab schedule={data.schedule} T={T} />}
          {activeTab === 'sessions' && <SessionsTab sessions={data.sessions} onUpdate={refresh} T={T} C={C} />}
          {activeTab === 'students' && <StudentsTab students={data.students} T={T} C={C} />}
          {activeTab === 'profile' && <ProfileTab profile={data.profile} onUpdate={refresh} T={T} C={C} />}
        </>
      )}
    </div>
  );

  async function refresh() {
    const [schedule, sessions, students, profile] = await Promise.all([
      mentorApi.getMySchedule().catch(() => null),
      mentorApi.getMentorSessions().catch(() => []),
      mentorApi.getStudents().catch(() => []),
      mentorApi.getProfile().catch(() => null),
    ]);
    setData({ schedule, sessions, students, profile });
  }
}

function DashboardTab({ data, T, C, resp }) {
  const stats = [
    { icon: Calendar, label: 'Live Class', value: data.schedule?.liveClasses?.length || 0, color: '#3B82F6' },
    { icon: MessageCircle, label: 'Sesi Mentoring', value: data.sessions?.length || 0, color: '#FF6B00' },
    { icon: Users, label: 'Siswa', value: data.students?.length || 0, color: '#22C55E' },
    { icon: Clock, label: 'Sesi Hari Ini', value: data.schedule?.sessions?.filter(s => new Date(s.scheduled_at).toDateString() === new Date().toDateString()).length || 0, color: '#8B5CF6' },
  ];

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: resp.isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}>
        {stats.map((s, i) => (
          <div key={i} style={{
            background: T.bg2, borderRadius: 14, padding: '18px 16px',
            border: `1px solid ${T.border}`,
          }}>
            <div style={{ fontSize: 11, color: T.text3, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
              <s.icon size={12} color={s.color} /> {s.label}
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: T.text }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: resp.isMobile ? '1fr' : '1fr 1fr', gap: 16 }}>
        <div style={{ background: T.bg2, borderRadius: 14, padding: 20, border: `1px solid ${T.border}` }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 14 }}>Live Class Terdekat</h3>
          {data.schedule?.liveClasses?.slice(0, 3).map((lc, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: i ? `1px solid ${T.border}` : 'none' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{lc.title || lc.program_name}</div>
                <div style={{ fontSize: 11, color: T.text3 }}>{new Date(lc.scheduled_at).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
              </div>
            </div>
          )) || <div style={{ fontSize: 12, color: T.text3 }}>Tidak ada jadwal</div>}
        </div>
        <div style={{ background: T.bg2, borderRadius: 14, padding: 20, border: `1px solid ${T.border}` }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 14 }}>Sesi Mentoring Hari Ini</h3>
          {data.schedule?.sessions?.filter(s => new Date(s.scheduled_at).toDateString() === new Date().toDateString()).map((s, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: i ? `1px solid ${T.border}` : 'none' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{s.user_name}</div>
                <div style={{ fontSize: 11, color: T.text3 }}>{s.topic} — {new Date(s.scheduled_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</div>
              </div>
              <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: s.status === 'confirmed' ? '#22C55E20' : '#F59E0B20', color: s.status === 'confirmed' ? '#22C55E' : '#F59E0B' }}>{s.status}</span>
            </div>
          )) || <div style={{ fontSize: 12, color: T.text3 }}>Tidak ada sesi hari ini</div>}
        </div>
      </div>
    </div>
  );
}

function ScheduleTab({ schedule, T }) {
  const allItems = [
    ...(schedule?.liveClasses || []).map(l => ({ ...l, type: 'live' })),
    ...(schedule?.sessions || []).map(s => ({ ...s, type: 'session' })),
  ].sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at));

  return (
    <div>
      <div style={{ background: T.bg2, borderRadius: 14, padding: 20, border: `1px solid ${T.border}` }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 14 }}>Semua Jadwal</h3>
        {allItems.length === 0 && <div style={{ fontSize: 13, color: T.text3 }}>Belum ada jadwal</div>}
        {allItems.map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderTop: i ? `1px solid ${T.border}` : 'none' }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: item.type === 'live' ? '#3B82F620' : '#FF6B0020',
            }}>
              {item.type === 'live' ? <Calendar size={16} color="#3B82F6" /> : <MessageCircle size={16} color="#FF6B00" />}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{item.title || item.program_name || item.topic || 'Sesi mentoring'}</div>
              <div style={{ fontSize: 11, color: T.text3 }}>
                {new Date(item.scheduled_at).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                {item.type === 'session' && ` — ${item.user_name}`}
              </div>
            </div>
            <span style={{
              fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 99,
              background: item.type === 'live' ? '#3B82F615' : item.status === 'pending' ? '#F59E0B20' : item.status === 'confirmed' ? '#22C55E20' : '#EF444420',
              color: item.type === 'live' ? '#3B82F6' : item.status === 'pending' ? '#F59E0B' : item.status === 'confirmed' ? '#22C55E' : '#EF4444',
            }}>
              {item.type === 'live' ? 'LIVE' : item.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SessionsTab({ sessions, onUpdate, T, C }) {
  const [updating, setUpdating] = useState(null);

  const updateStatus = async (id, status) => {
    setUpdating(id);
    await mentorApi.updateStatus(id, status);
    await onUpdate();
    setUpdating(null);
  };

  const statusColor = { pending: '#F59E0B', confirmed: '#22C55E', completed: '#3B82F6', cancelled: '#EF4444' };

  return (
    <div>
      <div style={{ background: T.bg2, borderRadius: 14, overflow: 'hidden', border: `1px solid ${T.border}` }}>
        {sessions.length === 0 && <div style={{ padding: 20, fontSize: 13, color: T.text3 }}>Belum ada sesi</div>}
        {sessions.map((s, i) => (
          <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderTop: i ? `1px solid ${T.border}` : 'none' }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: C.orange + '20', color: C.orange, fontWeight: 700, fontSize: 14, flexShrink: 0,
            }}>
              {s.user_name?.charAt(0) || '?'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{s.user_name}</div>
              <div style={{ fontSize: 11, color: T.text3 }}>{s.topic || '-'}</div>
              <div style={{ fontSize: 11, color: T.text3 }}>
                {new Date(s.scheduled_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
            <span style={{
              fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 99,
              background: (statusColor[s.status] || '#888') + '20',
              color: statusColor[s.status] || '#888',
            }}>{s.status}</span>
            <div style={{ display: 'flex', gap: 4 }}>
              {s.status === 'pending' && (
                <>
                  <button onClick={() => updateStatus(s.id, 'confirmed')} disabled={updating === s.id} style={{
                    padding: '6px 12px', fontSize: 11, fontWeight: 600, border: 'none', borderRadius: 8, cursor: 'pointer',
                    background: '#22C55E20', color: '#22C55E',
                  }}><CheckCircle size={12} /> Terima</button>
                  <button onClick={() => updateStatus(s.id, 'cancelled')} disabled={updating === s.id} style={{
                    padding: '6px 12px', fontSize: 11, fontWeight: 600, border: 'none', borderRadius: 8, cursor: 'pointer',
                    background: '#EF444420', color: '#EF4444',
                  }}><XCircle size={12} /> Tolak</button>
                </>
              )}
              {s.status === 'confirmed' && (
                <button onClick={() => updateStatus(s.id, 'completed')} disabled={updating === s.id} style={{
                  padding: '6px 12px', fontSize: 11, fontWeight: 600, border: 'none', borderRadius: 8, cursor: 'pointer',
                  background: '#3B82F620', color: '#3B82F6',
                }}><CheckCircle size={12} /> Selesai</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StudentsTab({ students, T, C }) {
  return (
    <div>
      <div style={{ background: T.bg2, borderRadius: 14, overflow: 'hidden', border: `1px solid ${T.border}` }}>
        {students.length === 0 && <div style={{ padding: 20, fontSize: 13, color: T.text3 }}>Belum ada siswa</div>}
        {students.map((s, i) => (
          <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderTop: i ? `1px solid ${T.border}` : 'none' }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: C.orange + '20', color: C.orange, fontWeight: 700, fontSize: 14, flexShrink: 0,
            }}>
              {s.name?.charAt(0) || '?'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{s.name}</div>
              <div style={{ fontSize: 11, color: T.text3, display: 'flex', alignItems: 'center', gap: 8 }}>
                {s.city && <><MapPin size={10} /> {s.city}</>}
                {s.total_sessions > 0 && <><Star size={10} /> {s.total_sessions} sesi</>}
              </div>
            </div>
            <div style={{ fontSize: 11, color: T.text3, textAlign: 'right' }}>
              {s.last_session ? `Terakhir: ${new Date(s.last_session).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}` : 'Baru'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfileTab({ profile, onUpdate, T, C }) {
  const [form, setForm] = useState({ name: '', phone: '', city: '', bio: '', specialization: '', photo_url: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) setForm({
      name: profile.name || '',
      phone: profile.phone || '',
      city: profile.city || '',
      bio: profile.bio || '',
      specialization: profile.specialization?.join(', ') || '',
      photo_url: profile.photo_url || '',
    });
  }, [profile]);

  const save = async () => {
    setSaving(true);
    const spec = form.specialization ? form.specialization.split(',').map(s => s.trim()).filter(Boolean) : [];
    await mentorApi.updateProfile({ ...form, specialization: spec.length ? spec : null });
    await onUpdate();
    setSaving(false);
  };

  const inputStyle = {
    width: '100%', padding: '10px 12px', borderRadius: 10, border: `1px solid ${T.border}`,
    background: T.bg, color: T.text, fontSize: 13, outline: 'none',
  };

  return (
    <div style={{ maxWidth: 600 }}>
      <div style={{ background: T.bg2, borderRadius: 14, padding: 24, border: `1px solid ${T.border}` }}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, color: T.text3, marginBottom: 4, display: 'block' }}>Nama</label>
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={inputStyle} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, color: T.text3, marginBottom: 4, display: 'block' }}>No. HP</label>
          <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} style={inputStyle} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, color: T.text3, marginBottom: 4, display: 'block' }}>Kota</label>
          <input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} style={inputStyle} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, color: T.text3, marginBottom: 4, display: 'block' }}>Spesialisasi (pisahkan dengan koma)</label>
          <input value={form.specialization} onChange={e => setForm(f => ({ ...f, specialization: e.target.value }))} style={inputStyle} placeholder="CPNS, UTBK, Matematika" />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, color: T.text3, marginBottom: 4, display: 'block' }}>Bio</label>
          <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, color: T.text3, marginBottom: 4, display: 'block' }}>Foto URL</label>
          <input value={form.photo_url} onChange={e => setForm(f => ({ ...f, photo_url: e.target.value }))} style={inputStyle} placeholder="https://..." />
          {form.photo_url && <img src={form.photo_url} alt="" style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover', marginTop: 8 }} />}
        </div>
        <button onClick={save} disabled={saving} style={{
          padding: '10px 28px', fontSize: 13, fontWeight: 700, border: 'none', borderRadius: 10, cursor: 'pointer',
          background: C.orange, color: '#fff',
        }}>{saving ? 'Menyimpan...' : 'Simpan Profil'}</button>
      </div>
    </div>
  );
}
