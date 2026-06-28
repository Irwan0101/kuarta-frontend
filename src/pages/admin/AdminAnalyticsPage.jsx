import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Eye, Users, Globe, Smartphone, Monitor, Clock, TrendingUp, BarChart3, RefreshCw } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { useTheme } from '@/hooks/useTheme';
import { PageHeader, Card, CardHead, Spinner, ErrorBox, ORG, GREEN, BLUE, RED } from './adminUtils';

const PERIODS = [
  { key: '24h', label: '24 Jam' },
  { key: '7d',  label: '7 Hari' },
  { key: '30d', label: '30 Hari' },
];

const COLORS = ['#FF6B00', '#3B82F6', '#22C55E', '#EF4444', '#A855F7', '#F59E0B', '#EC4899', '#14B8A6'];

function StatBox({ icon, label, value, color }) {
  return (
    <div style={{ background: 'var(--bg2,#1e1a16)', border: '1px solid var(--bdr,#2e2921)', borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: (color || ORG) + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{icon}</div>
      <div>
        <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 20, lineHeight: 1.1 }}>{value ?? '—'}</div>
        <div style={{ fontSize: 11, opacity: .5, marginTop: 1 }}>{label}</div>
      </div>
    </div>
  );
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: 9, padding: '9px 13px', fontSize: 12 }}>
      <div style={{ fontWeight: 700, color: '#fff', marginBottom: 5 }}>{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ color: p.stroke || p.fill, display: 'flex', justifyContent: 'space-between', gap: 16 }}>
          <span>{p.name}</span>
          <span style={{ fontWeight: 700 }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const { T } = useTheme();
  const [data, setData] = useState(null);
  const [period, setPeriod] = useState('7d');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try { setData(await adminApi.getAnalyticsOverview(period)); }
    catch (e) { setError(e?.error || e?.message || 'Gagal memuat analytics'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [period]);

  if (loading) return <div><PageHeader title="Analytics" subtitle="Statistik pengunjung website" /><Spinner /></div>;
  if (error) return <div><PageHeader title="Analytics" action={<button onClick={load} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: T.bg3, border: `1px solid ${T.border}`, borderRadius: 9, fontSize: 12, color: T.text3, cursor: 'pointer' }}><RefreshCw size={13} /> Refresh</button>} /><ErrorBox msg={error} /></div>;

  const { total, unique, totalAllTime, daily, pages, referrers, devices, hourly } = data || {};

  return (
    <div>
      <PageHeader
        title={<><TrendingUp size={22} style={{ verticalAlign: 'middle', marginRight: 8 }} />Analytics Pengunjung</>}
        subtitle="Pantau traffic website secara real-time"
        action={
          <div style={{ display: 'flex', gap: 6 }}>
            {PERIODS.map(p => (
              <button key={p.key} onClick={() => setPeriod(p.key)} style={{
                padding: '5px 12px', borderRadius: 7, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                background: period === p.key ? ORG : T.bg4,
                color: period === p.key ? '#fff' : T.text4,
                border: `1px solid ${period === p.key ? ORG : T.border}`,
              }}>{p.label}</button>
            ))}
            <button onClick={load} style={{ padding: '5px 12px', borderRadius: 7, background: T.bg4, border: `1px solid ${T.border}`, cursor: 'pointer', color: T.text4, display: 'flex', alignItems: 'center' }}>
              <RefreshCw size={13} />
            </button>
          </div>
        }
      />

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14, marginBottom: 20 }}>
        <StatBox icon={<Eye size={20} />} label={`Kunjungan (${PERIODS.find(p => p.key === period)?.label})`} value={total?.toLocaleString()} color={ORG} />
        <StatBox icon={<Users size={20} />} label="Pengunjung Unik" value={unique?.toLocaleString()} color={BLUE} />
        <StatBox icon={<Globe size={20} />} label="Total All Time" value={totalAllTime?.toLocaleString()} color={GREEN} />
        <StatBox icon={<BarChart3 size={20} />} label="Rata-rata/Hari" value={daily?.length ? Math.round(total / daily.length).toLocaleString() : '0'} color="#A855F7" />
      </div>

      {/* Daily Chart */}
      <Card>
        <CardHead title="Kunjungan Harian" sub={PERIODS.find(p => p.key === period)?.label} />
        <div style={{ padding: '12px 8px', height: 240 }}>
          {daily?.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={daily}>
                <CartesianGrid stroke={T.border} vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={d => new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} tick={{ fill: T.text4, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: T.text4, fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Line type="monotone" dataKey="visits" name="Kunjungan" stroke={ORG} strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="visitors" name="Pengunjung" stroke={BLUE} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : <div style={{ textAlign: 'center', padding: 40, opacity: .4 }}>Belum ada data kunjungan</div>}
        </div>
      </Card>

      {/* Bottom Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginTop: 18 }}>

        {/* Top Pages */}
        <Card>
          <CardHead title="Halaman Terpopuler" />
          <div style={{ padding: '12px 16px', maxHeight: 280, overflow: 'auto' }}>
            {pages?.map((p, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: i < pages.length - 1 ? `1px solid ${T.border}` : 'none', fontSize: 12 }}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{p.page || '/'}</span>
                <div style={{ display: 'flex', gap: 12, flexShrink: 0 }}>
                  <span style={{ fontWeight: 700, color: ORG }}>{p.visits}</span>
                  <span style={{ opacity: .4 }}>{p.visitors}</span>
                </div>
              </div>
            ))}
            {(!pages || !pages.length) && <div style={{ opacity: .4, fontSize: 12 }}>Belum ada data</div>}
          </div>
        </Card>

        {/* Referrers */}
        <Card>
          <CardHead title="Sumber Traffic" />
          <div style={{ padding: '12px 16px' }}>
            {referrers?.length ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={referrers} dataKey="visits" nameKey="source" cx="50%" cy="50%" outerRadius={75} label={({ source, percent }) => `${source} (${(percent * 100).toFixed(0)}%)`} labelLine={false}>
                    {referrers.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : <div style={{ opacity: .4, fontSize: 12, textAlign: 'center', padding: 20 }}>Belum ada data</div>}
          </div>
        </Card>

        {/* Hourly + Devices */}
        <Card>
          <CardHead title="Jam Aktif & Perangkat" />
          <div style={{ padding: '12px 16px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 6, opacity: .6 }}>Perangkat:</div>
            <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
              {devices?.map(d => (
                <div key={d.device_type} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: d.device_type === 'mobile' ? ORG : d.device_type === 'tablet' ? BLUE : GREEN }}>{d.visits}</div>
                  <div style={{ fontSize: 10, opacity: .5, textTransform: 'capitalize' }}>{d.device_type === 'desktop' ? <><Monitor size={12} style={{ verticalAlign: 'middle' }} /> Desktop</> : <><Smartphone size={12} style={{ verticalAlign: 'middle' }} /> Mobile</>}</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 6, opacity: .6 }}>Jam Sibuk:</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 60 }}>
              {hourly?.map(h => (
                <div key={h.hour} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: '100%', background: ORG, borderRadius: '2px 2px 0 0', height: `${Math.min(100, (h.visits / Math.max(...hourly.map(x => x.visits))) * 100)}%`, minHeight: 2, opacity: .7 }} />
                  <span style={{ fontSize: 8, opacity: .4, marginTop: 2 }}>{String(h.hour).padStart(2, '0')}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

      </div>
    </div>
  );
}
