import { useState, useEffect } from 'react';
import { Shield, Server, AlertTriangle, CheckCircle, XCircle, Ban, Activity, Lock, Users as UsersIcon, Globe, HardDrive, Cpu, Clock, RefreshCw } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { useTheme } from '@/hooks/useTheme';
import { PageHeader, Card, CardHead, Spinner, ErrorBox, ORG, GREEN, RED, BLUE } from './adminUtils';

function StatusDot({ ok }) {
  const color = ok === true ? GREEN : ok === false ? RED : '#888';
  return <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: color, marginRight: 6, flexShrink: 0 }} />;
}

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

function Badge({ label, color }) {
  return <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700, background: (color || '#888') + '20', color: color || '#888' }}>{label}</span>;
}

export default function AdminSecurityPage() {
  const { T } = useTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try { setData(await adminApi.getSecurityOverview()); }
    catch (e) { setError(e?.error || e?.message || 'Gagal memuat data keamanan'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <div><PageHeader title="Security Dashboard" subtitle="Pemantauan keamanan platform" /><Spinner /></div>;
  if (error) return <div><PageHeader title="Security Dashboard" subtitle="Pemantauan keamanan platform" action={<button onClick={load} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: T.bg3, border: `1px solid ${T.border}`, borderRadius: 9, fontSize: 12, color: T.text3, cursor: 'pointer' }}><RefreshCw size={13} /> Refresh</button>} /><ErrorBox msg={error} /></div>;

  const { server, fail2ban, ssl, firewall, login, requests, pool, integrity, ssh } = data || {};

  const sslStatus = ssl?.status === 'ok' ? GREEN : ssl?.status === 'warning' ? '#F59E0B' : ssl?.status === 'critical' ? RED : '#888';

  return (
    <div>
      <PageHeader
        title="Security Dashboard"
        subtitle="Pemantauan keamanan platform real-time"
        action={
          <button onClick={load} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: T.bg3, border: `1px solid ${T.border}`, borderRadius: 9, fontSize: 12, color: T.text3, cursor: 'pointer' }}>
            <RefreshCw size={13} /> Refresh
          </button>
        }
      />

      {/* Server Health */}
      <Card>
        <CardHead title="Server" sub={server?.hostname} icon={<Server size={14} />} />
        <div style={{ padding: '16px 20px', display: 'flex', flexWrap: 'wrap', gap: 16 }}>
          <StatBox icon={<Cpu size={18} />} label="CPU" value={server?.cpu} color={BLUE} />
          <StatBox icon={<Activity size={18} />} label="Load (1/5/15)" value={server?.load?.map(n => n.toFixed(1)).join(' / ')} color="#A855F7" />
          <StatBox icon={<Clock size={18} />} label="Uptime" value={server?.uptime} color="#F59E0B" />
          <StatBox icon={<HardDrive size={18} />} label="Disk" value={server?.disk?.available ? `${server.disk.available} (${server.disk.usedPct})` : '—'} color={GREEN} />
          <StatBox icon={<HardDrive size={18} />} label="RAM" value={server?.mem ? `${(server.mem.used / 1073741824).toFixed(1)}/${(server.mem.total / 1073741824).toFixed(1)} GB (${server.mem.pct}%)` : '—'} color={server?.mem?.pct > 80 ? RED : server?.mem?.pct > 60 ? '#F59E0B' : GREEN} />
          <StatBox icon={<UsersIcon size={18} />} label="SSH Sessions" value={ssh?.sessions} color={ssh?.sessions > 3 ? RED : GREEN} />
        </div>
      </Card>

      {/* Security Posture */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, margin: '18px 0' }}>
        <Card>
          <CardHead title={<><Lock size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />Fail2ban</>} />
          <div style={{ padding: '16px 20px' }}>
            {fail2ban?.ok ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}><StatusDot ok /> <span style={{ fontSize: 13 }}>Active ({fail2ban.jails?.length || 0} jails)</span></div>
                <div style={{ display: 'flex', gap: 16, fontSize: 12 }}>
                  <div><div style={{ fontSize: 22, fontWeight: 800, color: RED }}>{fail2ban.currentlyBanned ?? 0}</div>Banned Now</div>
                  <div><div style={{ fontSize: 22, fontWeight: 800, color: '#F59E0B' }}>{fail2ban.totalBanned ?? 0}</div>Total Banned</div>
                </div>
                {fail2ban.jails?.map(j => (
                  <div key={j.name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, padding: '4px 0', borderTop: `1px solid ${T.border}`, marginTop: 4 }}>
                    <span>{j.name}</span>
                    <span style={{ color: j.currentlyBanned > 0 ? RED : GREEN }}>{j.currentlyBanned} banned</span>
                  </div>
                ))}
              </>
            ) : <div style={{ fontSize: 12, opacity: .5 }}>{fail2ban?.msg || 'Tidak terinstall'}</div>}
          </div>
        </Card>

        <Card>
          <CardHead title={<><Globe size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />SSL Certificate</>} />
          <div style={{ padding: '16px 20px' }}>
            {ssl ? (
              <>
                <StatusDot ok={ssl.status === 'ok'} />
                <span style={{ fontSize: 13, marginLeft: 4 }}>{ssl.status === 'ok' ? 'Valid' : ssl.status === 'warning' ? 'Mendekati expired' : ssl.status === 'critical' ? 'Segera expired!' : 'Expired'}</span>
                <div style={{ fontSize: 22, fontWeight: 800, margin: '8px 0', color: sslStatus }}>
                  {ssl.daysLeft > 0 ? `${ssl.daysLeft} hari` : 'EXPIRED'}
                </div>
                <div style={{ fontSize: 11, opacity: .5 }}>Exp: {ssl.expiryDate ? new Date(ssl.expiryDate).toLocaleDateString('id-ID') : '—'}</div>
              </>
            ) : <div style={{ fontSize: 12, opacity: .5 }}>{ssl?.msg || 'Tidak terdeteksi'}</div>}
          </div>
        </Card>

        <Card>
          <CardHead title={<><Shield size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />Firewall</>} />
          <div style={{ padding: '16px 20px' }}>
            {firewall ? (
              <><StatusDot ok /> <span style={{ fontSize: 13, marginLeft: 4, textTransform: 'capitalize' }}>{firewall.type} — Active</span></>
            ) : <div style={{ fontSize: 12, opacity: .5 }}>{firewall?.msg || 'Tidak terdeteksi'}</div>}
          </div>
        </Card>
      </div>

      {/* Login & Requests */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 18 }}>
        <Card>
          <CardHead title="Login Activity (7d)" />
          <div style={{ padding: '16px 20px' }}>
            <div style={{ display: 'flex', gap: 20, marginBottom: 14 }}>
              <div><div style={{ fontSize: 24, fontWeight: 800, color: GREEN }}>{login?.success24h ?? 0}</div><div style={{ fontSize: 11, opacity: .5 }}>Sukses (24h)</div></div>
              <div><div style={{ fontSize: 24, fontWeight: 800, color: RED }}>{login?.failed7d ?? 0}</div><div style={{ fontSize: 11, opacity: .5 }}>Gagal (7 hari)</div></div>
            </div>
            {login?.lastFailed?.length > 0 && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 6, opacity: .6 }}>Gagal Terakhir:</div>
                {login.lastFailed.map((l, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, padding: '3px 0', borderTop: `1px solid ${T.border}` }}>
                    <span>{l.ip_address || '—'}</span>
                    <span style={{ opacity: .5 }}>{l.created_at ? new Date(l.created_at).toLocaleString('id-ID') : '—'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        <Card>
          <CardHead title="Bad Requests (Nginx)" />
          <div style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: RED }}>{requests?.badRequests7d ?? 0}</div>
            <div style={{ fontSize: 11, opacity: .5, marginBottom: 14 }}>Error 4xx/5xx (7 hari)</div>
            {requests?.topIps?.length > 0 && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 6, opacity: .6 }}>Top IP bermasalah:</div>
                {requests.topIps.map((r, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, padding: '3px 0', borderTop: `1px solid ${T.border}` }}>
                    <span>{r.ip}</span>
                    <Badge label={String(r.count)} color={RED} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Integrity & Pool */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <Card>
          <CardHead title="File Integrity (24h)" />
          <div style={{ padding: '16px 20px' }}>
            {integrity?.length > 0 ? integrity.map((ch, i) => (
              <div key={i} style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 600 }}>{ch.dir}</div>
                <div style={{ fontSize: 11, opacity: .5 }}>{ch.files} file berubah</div>
                {ch.sample?.length > 0 && <div style={{ fontSize: 10, opacity: .3, wordBreak: 'break-all', marginTop: 2 }}>{ch.sample.join(', ')}</div>}
              </div>
            )) : <div style={{ fontSize: 12, opacity: .5 }}>Tidak ada perubahan signifikan</div>}
          </div>
        </Card>

        <Card>
          <CardHead title="Database Pool" />
          <div style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: (pool?.activeConnections || 0) > 15 ? RED : GREEN }}>{pool?.activeConnections ?? '—'}</div>
            <div style={{ fontSize: 11, opacity: .5 }}>Koneksi aktif</div>
          </div>
        </Card>
      </div>
    </div>
  );
}
