import { useState, useEffect, useCallback } from 'react';
import { Search, ChevronLeft, ChevronRight, Activity, Filter, ClipboardList } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { useTheme } from '@/hooks/useTheme';
import useResponsive from '@/hooks/useResponsive';
import {
  PageHeader, Card, CardHead, Btn, Spinner, ErrorBox,
  TableHead, TableWrapper, EmptyRow, Modal, Badge, ORG, RED, GREEN, BLUE,
} from './adminUtils';

const ACTION_COLORS = {
  create: GREEN, update: BLUE, delete: RED, change_role: '#F59E0B',
  update_mentor: BLUE, update_user: BLUE, create_program: GREEN,
  create_banner: GREEN, update_banner: BLUE,
};

export default function AdminAuditLogsPage() {
  const { T } = useTheme();
  const resp = useResponsive();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filterAction, setFilterAction] = useState('');
  const [filterEntity, setFilterEntity] = useState('');
  const [detail, setDetail] = useState(null);
  const PER = 30;

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const params = { page, limit: PER };
      if (filterAction) params.action = filterAction;
      if (filterEntity) params.entity_type = filterEntity;
      const res = await adminApi.getAuditLogs(params);
      setLogs(res.logs ?? []);
      setTotal(res.total ?? 0);
    } catch (e) { setError(e?.message || 'Gagal memuat log.'); }
    finally { setLoading(false); }
  }, [page, filterAction, filterEntity]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.max(1, Math.ceil(total / PER));
  const cellPad = resp.isMobile ? '7px 10px' : '11px 16px';

  return (
    <div>
      <PageHeader title={<><ClipboardList size={22} style={{verticalAlign:'middle',marginRight:8}} /> Audit Log</>} subtitle={`${total} aktivitas tercatat`} />

      <Card>
        <CardHead title="Aktivitas Admin" action={
          <div style={{ display: 'flex', gap: 8 }}>
            <select value={filterAction} onChange={e => { setFilterAction(e.target.value); setPage(1); }}
              style={{ padding: '6px 10px', fontSize: 11, borderRadius: 8, background: T.bg3, border: `1px solid ${T.border}`, color: T.text, outline: 'none' }}>
              <option value="">Semua Aksi</option>
              <option value="create">create</option>
              <option value="update">update</option>
              <option value="delete">delete</option>
              <option value="change_role">change_role</option>
            </select>
            <select value={filterEntity} onChange={e => { setFilterEntity(e.target.value); setPage(1); }}
              style={{ padding: '6px 10px', fontSize: 11, borderRadius: 8, background: T.bg3, border: `1px solid ${T.border}`, color: T.text, outline: 'none' }}>
              <option value="">Semua Entity</option>
              <option value="user">user</option>
              <option value="program">program</option>
              <option value="banner">banner</option>
              <option value="mentor">mentor</option>
            </select>
          </div>
        } />

        {error && <div style={{ padding: resp.isMobile ? 10 : 16 }}><ErrorBox msg={error} /></div>}

        <div style={{ overflowX: 'auto' }}>
          <TableWrapper><table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <TableHead cols={['#', 'Admin', 'Aksi', 'Entity', 'ID', 'Waktu', { label: 'Detail', right: true }]} />
            <tbody>
              {loading ? <tr><td colSpan={7}><Spinner /></td></tr>
              : logs.length === 0 ? <EmptyRow cols={7} msg="Belum ada catatan audit." />
              : logs.map((l, i) => (
                <tr key={l.id} style={{ borderBottom: `1px solid ${T.border}` }}>
                  <td style={{ padding: cellPad, fontSize: 12, color: T.text4 }}>{(page - 1) * PER + i + 1}</td>
                  <td style={{ padding: cellPad, fontSize: resp.isMobile ? 12 : 13, color: T.text }}>{l.admin_name || l.admin_id}</td>
                  <td style={{ padding: cellPad }}>
                    <Badge label={l.action} color={ACTION_COLORS[l.action.split('_')[0]] || BLUE} />
                  </td>
                  <td style={{ padding: cellPad, fontSize: 12, color: T.text3 }}>{l.entity_type}</td>
                  <td style={{ padding: cellPad, fontSize: 11, color: T.text4, fontFamily: 'monospace' }}>
                    {l.entity_id ? l.entity_id.slice(0, 8) + '…' : '—'}
                  </td>
                  <td style={{ padding: cellPad, fontSize: 12, color: T.text4 }}>
                    {l.created_at ? new Date(l.created_at).toLocaleString('id-ID') : '-'}
                  </td>
                  <td style={{ padding: cellPad, textAlign: 'right' }}>
                    <Btn size="sm" variant="outline" color={BLUE} onClick={() => setDetail(l)}>
                      <Activity size={12} />
                    </Btn>
                  </td>
                </tr>
              ))}
            </tbody>
          </table></TableWrapper>
        </div>

        <div style={{ padding: '12px 16px', borderTop: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 12, color: T.text4 }}>Hal {page} dari {totalPages} ({total} total)</span>
          <div style={{ display: 'flex', gap: 6 }}>
            <Btn size="sm" variant="outline" color={T.text4} disabled={page <= 1} onClick={() => setPage(p => p - 1)}><ChevronLeft size={13} /></Btn>
            <Btn size="sm" variant="outline" color={T.text4} disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight size={13} /></Btn>
          </div>
        </div>
      </Card>

      {detail && (
        <Modal title="Detail Audit Log" onClose={() => setDetail(null)} width={560}>
          <div style={{ fontSize: 13, color: T.text, lineHeight: 2 }}>
            <div><strong>Admin:</strong> {detail.admin_name} ({detail.admin_id})</div>
            <div><strong>Aksi:</strong> <Badge label={detail.action} color={ACTION_COLORS[detail.action.split('_')[0]] || BLUE} /></div>
            <div><strong>Entity:</strong> {detail.entity_type} / {detail.entity_id || '—'}</div>
            <div><strong>IP:</strong> {detail.ip_address || '—'}</div>
            <div><strong>Waktu:</strong> {detail.created_at ? new Date(detail.created_at).toLocaleString('id-ID') : '-'}</div>
            {detail.details && Object.keys(detail.details).length > 0 && (
              <div>
                <strong>Detail:</strong>
                <pre style={{ background: T.bg3, padding: 12, borderRadius: 8, fontSize: 11, overflowX: 'auto', marginTop: 4, color: T.text3 }}>
                  {JSON.stringify(detail.details, null, 2)}
                </pre>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
            <Btn variant="outline" color={T.text4} onClick={() => setDetail(null)}>Tutup</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
