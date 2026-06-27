// src/pages/admin/AdminDashboardPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { RefreshCw, Users, BookOpen, FileText, DollarSign, Zap } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { useTheme } from '@/hooks/useTheme';
import {
  PageHeader, Card, CardHead, Spinner, ErrorBox, Badge,
  ORG, GREEN, BLUE, RED,
} from './adminUtils';

/* ─── helpers ────────────────────────────────────────────────────── */

// Backend /admin/users returns { users: [...], total: N }
// Backend /admin/revenue returns [...] langsung (array)
function unwrapArray(res) {
  if (Array.isArray(res))              return { items: res,        total: res.length };
  if (res && Array.isArray(res.users)) return { items: res.users,  total: res.total ?? res.users.length };
  if (res && Array.isArray(res.data))  return { items: res.data,   total: res.total ?? res.data.length };
  return { items: [], total: 0 };
}

// Ambil nilai dari stats flat object (backend return snake_case langsung)
function statVal(stats, snakeKey, fmtFn) {
  if (!stats) return null;
  const camelKey = snakeKey.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
  const v = stats[snakeKey] ?? stats[camelKey];
  return v != null ? fmtFn(v) : '—';
}

function timeAgo(isoStr) {
  if (!isoStr) return '-';
  const diff = Date.now() - new Date(isoStr);
  const min  = Math.floor(diff / 60000);
  if (min < 1)  return 'baru saja';
  if (min < 60) return `${min} menit lalu`;
  const hr = Math.floor(min / 60);
  if (hr  < 24) return `${hr} jam lalu`;
  return `${Math.floor(hr / 24)} hari lalu`;
}

/* ─── config ─────────────────────────────────────────────────────── */

const PERIOD_OPTS = [
  { key: '7d',  label: '7 Hari'  },
  { key: '30d', label: '30 Hari' },
  { key: '90d', label: '3 Bulan' },
];

// snake key harus match persis dengan flat object yang dikembalikan /admin/stats
const STATS_CFG = [
  {
    snake: 'total_users',
    icon: <Users size={20} />, label: 'Total Users', color: BLUE,
    fmt: v => Number(v).toLocaleString('id-ID'),
    subSnake: 'new_users_today',
    subFmt: v => `+${v} hari ini`,
  },
  {
    snake: 'total_programs',
    icon: <BookOpen size={20} />, label: 'Total Programs', color: ORG,
    fmt: v => String(v),
    subSnake: 'active_programs',
    subFmt: v => `${v} aktif`,
  },
  {
    snake: 'total_tryouts',
    icon: <FileText size={20} />, label: 'Total Tryouts', color: '#A855F7',
    fmt: v => String(v),
  },
  {
    snake: 'active_sessions',
    icon: <Zap size={20} />, label: 'Sesi Aktif', color: '#F59E0B',
    fmt: v => String(v),
    subFmt: () => 'sedang berlangsung',
  },
  {
    snake: 'total_revenue',
    icon: <DollarSign size={20} />, label: 'Total Revenue', color: GREEN,
    fmt: v => `Rp${Number(v).toLocaleString('id-ID')}`,
    subSnake: 'monthly_revenue',
    subFmt: v => `Rp${Number(v).toLocaleString('id-ID')} bulan ini`,
  },
];

/* ─── sub-components ─────────────────────────────────────────────── */

function StatCard({ cfg, stats, loading, T }) {
  const value  = loading ? null : statVal(stats, cfg.snake, cfg.fmt);
  const subVal = (!loading && cfg.subSnake)
    ? statVal(stats, cfg.subSnake, cfg.subFmt ?? (v => v))
    : (!loading && cfg.subFmt && !cfg.subSnake)
      ? cfg.subFmt()
      : null;

  return (
    <div style={{
      background: T.bg2, border: `1px solid ${T.border}`,
      borderRadius: 12, padding: '16px 18px',
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 11,
        background: cfg.color + '18',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 20, flexShrink: 0,
      }}>
        {cfg.icon}
      </div>
      <div style={{ minWidth: 0 }}>
        {loading
          ? <div style={{ height: 22, width: 72, background: T.bg4, borderRadius: 6, marginBottom: 4 }} />
          : <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 21, color: T.text, lineHeight: 1.1 }}>
              {value}
            </div>
        }
        <div style={{ fontSize: 12, color: T.text4, marginTop: 2 }}>{cfg.label}</div>
        {subVal && (
          <div style={{ fontSize: 11, color: GREEN, marginTop: 2 }}>{subVal}</div>
        )}
      </div>
    </div>
  );
}

function ChartTooltip({ active, payload, label, T }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: T.bg3, border: `1px solid ${T.border}`,
      borderRadius: 9, padding: '9px 13px', fontSize: 12,
    }}>
      <div style={{ fontWeight: 700, color: T.text, marginBottom: 5 }}>{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} style={{
          color: p.stroke ?? p.fill,
          display: 'flex', justifyContent: 'space-between', gap: 16,
        }}>
          <span>{p.name}</span>
          <span style={{ fontWeight: 700 }}>
            {p.dataKey === 'amount'
              ? `Rp${Number(p.value).toLocaleString('id-ID')}`
              : Number(p.value).toLocaleString('id-ID')}
          </span>
        </div>
      ))}
    </div>
  );
}

function UserRow({ u, last, T }) {
  const initials  = (u.name ?? '').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '??';
  const roleColor = u.role === 'admin' ? RED : (u.plan === 'premium' || u.plan === 'vip') ? '#F59E0B' : T.text4;
  const badge     = u.plan && u.plan !== 'free' ? u.plan : u.role ?? 'free';

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '11px 16px',
      borderBottom: last ? 'none' : `1px solid ${T.border}`,
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: '50%',
        background: ORG + '20',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 11, fontWeight: 700, color: ORG, flexShrink: 0,
      }}>
        {initials}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: T.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {u.name}
        </div>
        <div style={{ fontSize: 11, color: T.text4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {u.email}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3, flexShrink: 0 }}>
        <Badge label={badge} color={roleColor} />
        <span style={{ fontSize: 10, color: T.text4 }}>{timeAgo(u.created_at)}</span>
      </div>
    </div>
  );
}

/* ─── page ───────────────────────────────────────────────────────── */

export default function AdminDashboardPage() {
  const { T } = useTheme();

  const [stats,   setStats]   = useState(null);
  const [revenue, setRevenue] = useState([]);
  const [users,   setUsers]   = useState([]);
  const [period,  setPeriod]  = useState('7d');

  const [stLoading, setStLoading] = useState(true);
  const [rvLoading, setRvLoading] = useState(true);
  const [usLoading, setUsLoading] = useState(true);

  const [stErr, setStErr] = useState('');
  const [rvErr, setRvErr] = useState('');
  const [usErr, setUsErr] = useState('');

  // /admin/stats → flat object: { total_users, new_users_today, total_programs, ... }
  const fetchStats = useCallback(async () => {
    setStLoading(true); setStErr('');
    try   { setStats(await adminApi.getStats()); }
    catch (e) { setStErr(e?.message || 'Gagal memuat statistik.'); }
    finally   { setStLoading(false); }
  }, []);

  // /admin/revenue?period=7d → array [{ date, label, amount, user_count }]
  const fetchRevenue = useCallback(async () => {
    setRvLoading(true); setRvErr('');
    try {
      const res = await adminApi.getRevenue(period);
      // Backend return array langsung — tidak perlu unwrap
      setRevenue(Array.isArray(res) ? res : (res?.data ?? []));
    }
    catch (e) { setRvErr(e?.message || 'Gagal memuat data pendapatan.'); }
    finally   { setRvLoading(false); }
  }, [period]);

  // /admin/users → { users: [...], total: N }
  const fetchUsers = useCallback(async () => {
    setUsLoading(true); setUsErr('');
    try {
      const res = await adminApi.getUsers({ page: 1, limit: 8 });
      setUsers(unwrapArray(res).items);
    }
    catch (e) { setUsErr(e?.message || 'Gagal memuat pengguna.'); }
    finally   { setUsLoading(false); }
  }, []);

  useEffect(() => { fetchStats(); fetchUsers(); }, [fetchStats, fetchUsers]);
  useEffect(() => { fetchRevenue(); }, [fetchRevenue]);

  // x-axis key: backend return 'label' (friendly) dan 'date' (ISO)
  // pakai 'label' untuk display, fallback ke 'date'
  const xKey = revenue.length > 0 && revenue[0].label != null ? 'label' : 'date';

  const fmtXLabel = (v) => {
    if (!v) return '';
    // kalau sudah label friendly (dari backend), langsung pakai
    if (!/^\d{4}-\d{2}/.test(v)) return v;
    // fallback parse ISO date
    return new Date(v).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  };

  // Bar chart: tampilkan user_count kalau ada dan > 0, fallback ke amount
  const barKey   = revenue.length > 0 && revenue[0].user_count > 0 ? 'user_count' : 'amount';
  const barName  = barKey === 'user_count' ? 'Transaksi' : 'Pendapatan';
  const barColor = barKey === 'user_count' ? BLUE : ORG;

  return (
    <div>
      <PageHeader
        title="📊 Dashboard Admin"
        subtitle="Ringkasan performa platform hari ini"
        action={
          <button
            onClick={() => { fetchStats(); fetchRevenue(); fetchUsers(); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 14px', background: T.bg3,
              border: `1px solid ${T.border}`, borderRadius: 9,
              fontSize: 12, color: T.text3, cursor: 'pointer',
            }}
          >
            <RefreshCw size={13} /> Refresh
          </button>
        }
      />

      {/* Stats */}
      {stErr && <div style={{ marginBottom: 16 }}><ErrorBox msg={stErr} /></div>}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(185px, 1fr))',
        gap: 14, marginBottom: 24,
      }}>
        {STATS_CFG.map(cfg => (
          <StatCard key={cfg.snake} cfg={cfg} stats={stats} loading={stLoading} T={T} />
        ))}
      </div>

      {/* Revenue chart + Recent users */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 18, marginBottom: 18 }}>

        {/* Revenue area chart */}
        <Card>
          <CardHead
            title="Tren Pendapatan"
            sub={PERIOD_OPTS.find(p => p.key === period)?.label}
            action={
              <div style={{ display: 'flex', gap: 6 }}>
                {PERIOD_OPTS.map(p => (
                  <button key={p.key} onClick={() => setPeriod(p.key)} style={{
                    padding: '4px 10px', borderRadius: 7, fontSize: 11, fontWeight: 600,
                    cursor: 'pointer',
                    background: period === p.key ? ORG   : T.bg4,
                    color:      period === p.key ? '#fff' : T.text4,
                    border: `1px solid ${period === p.key ? ORG : T.border}`,
                    transition: 'all .15s',
                  }}>{p.label}</button>
                ))}
              </div>
            }
          />
          <div style={{ padding: '12px 8px', height: 230 }}>
            {rvLoading
              ? <Spinner />
              : rvErr
                ? <ErrorBox msg={rvErr} />
                : revenue.length === 0
                  ? <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: .4, fontSize: 13 }}>Tidak ada data.</div>
                  : (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={revenue} margin={{ top: 4, right: 16, left: -8, bottom: 0 }}>
                        <defs>
                          <linearGradient id="rev_g" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor={ORG} stopOpacity={0.28} />
                            <stop offset="95%" stopColor={ORG} stopOpacity={0}    />
                          </linearGradient>
                        </defs>
                        <CartesianGrid stroke={T.border} vertical={false} strokeDasharray="3 3" />
                        <XAxis
                          dataKey={xKey}
                          tickFormatter={fmtXLabel}
                          tick={{ fill: T.text4, fontSize: 11 }}
                          axisLine={false} tickLine={false}
                          interval="preserveStartEnd"
                        />
                        <YAxis
                          tickFormatter={v => v >= 1000000
                            ? `${(v / 1000000).toFixed(1)}jt`
                            : v >= 1000 ? `${(v / 1000).toFixed(0)}rb` : String(v)}
                          tick={{ fill: T.text4, fontSize: 10 }}
                          axisLine={false} tickLine={false}
                        />
                        <Tooltip content={<ChartTooltip T={T} />} />
                        <Area
                          type="monotone" dataKey="amount" name="Pendapatan"
                          stroke={ORG} fill="url(#rev_g)" strokeWidth={2}
                          dot={false} activeDot={{ r: 4, fill: ORG }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )
            }
          </div>
        </Card>

        {/* Recent users */}
        <Card>
          <CardHead
            title="Pengguna Terbaru"
            action={
              <button onClick={fetchUsers} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.text4, display: 'flex' }}>
                <RefreshCw size={13} />
              </button>
            }
          />
          {usLoading
            ? <Spinner />
            : usErr
              ? <div style={{ padding: 12 }}><ErrorBox msg={usErr} /></div>
              : users.length === 0
                ? <div style={{ padding: 24, textAlign: 'center', opacity: .4, fontSize: 13 }}>Belum ada pengguna.</div>
                : users.map((u, i) => (
                  <UserRow key={u.id ?? i} u={u} last={i === users.length - 1} T={T} />
                ))
          }
        </Card>
      </div>

      {/* Bar chart distribusi */}
      <Card>
        <CardHead
          title="Distribusi Transaksi"
          sub={PERIOD_OPTS.find(p => p.key === period)?.label}
        />
        <div style={{ padding: '12px 8px', height: 190 }}>
          {rvLoading
            ? <Spinner />
            : revenue.length === 0
              ? <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: .4, fontSize: 13 }}>Tidak ada data.</div>
              : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenue} margin={{ top: 4, right: 16, left: -8, bottom: 0 }} barSize={16}>
                    <CartesianGrid stroke={T.border} vertical={false} strokeDasharray="3 3" />
                    <XAxis
                      dataKey={xKey}
                      tickFormatter={fmtXLabel}
                      tick={{ fill: T.text4, fontSize: 11 }}
                      axisLine={false} tickLine={false}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      tickFormatter={v => v >= 1000000
                        ? `${(v / 1000000).toFixed(1)}jt`
                        : v >= 1000 ? `${(v / 1000).toFixed(0)}rb` : String(v)}
                      tick={{ fill: T.text4, fontSize: 10 }}
                      axisLine={false} tickLine={false}
                    />
                    <Tooltip content={<ChartTooltip T={T} />} />
                    <Bar
                      dataKey={barKey}
                      name={barName}
                      fill={barColor}
                      radius={[4, 4, 0, 0]}
                      fillOpacity={0.85}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )
          }
        </div>
      </Card>
    </div>
  );
}