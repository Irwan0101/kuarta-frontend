import { useState, useEffect, useCallback } from 'react';
import { Search, ChevronLeft, ChevronRight, RotateCcw, Eye, Download, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminApi } from '@/lib/api';
import { useTheme } from '@/hooks/useTheme';
import useResponsive from '@/hooks/useResponsive';
import { useConfirm } from '@/hooks/useConfirm';
import {
  PageHeader, Card, CardHead, Btn, Badge, Spinner, ErrorBox,
  Modal, TableHead, EmptyRow, ORG, RED, GREEN, BLUE,
} from './adminUtils';

const STATUS_COLORS = { paid: GREEN, pending: '#F59E0B', failed: RED, refund: '#8B5CF6' };
const STATUS_LABELS = { paid: 'Lunas', pending: 'Pending', failed: 'Gagal', refund: 'Refund' };

export default function AdminTransactionsPage() {
  const { T } = useTheme();
  const resp = useResponsive();
  const { confirm, modal: confirmModal } = useConfirm();
  const [txs, setTxs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filterStatus, setFilterStatus] = useState('');
  const [detail, setDetail] = useState(null);
  const PER = 15;

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const params = { page, limit: PER };
      if (filterStatus) params.status = filterStatus;
      const res = await adminApi.getTransactions(params);
      setTxs(res.transactions ?? []);
      setTotal(res.total ?? 0);
    } catch (e) { setError(e?.message || 'Gagal memuat transaksi.'); }
    finally { setLoading(false); }
  }, [page, filterStatus]);

  useEffect(() => { load(); }, [load]);

  const handleRefund = async (id) => {
    if (!(await confirm('Yakin refund transaksi ini?'))) return;
    try {
      await adminApi.refundTransaction(id);
      toast.success('Refund berhasil');
      load();
    } catch (e) { toast.error(e?.message || 'Gagal refund.'); }
  };

  const totalPages = Math.max(1, Math.ceil(total / PER));

  const cellPad = resp.isMobile ? '7px 10px' : '11px 16px';
  const st = (w) => ({ padding: '9px 12px', fontSize: resp.isMobile ? 12 : 13, borderRadius: 9, background: T.bg3, border: `1px solid ${T.border}`, color: T.text, outline: 'none', width: w || '100%', boxSizing: 'border-box' });

  return (
    <div>
      <PageHeader title={<><DollarSign size={22} style={{verticalAlign:'middle',marginRight:8}} /> Transaksi</>} subtitle={`${total} total transaksi`} />

      <Card>
        <CardHead title="Riwayat Transaksi" action={
          <div style={{ display: 'flex', gap: 8 }}>
            <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }} style={{ ...st(140), padding: '6px 10px', fontSize: 11 }}>
              <option value="">Semua Status</option>
              <option value="paid">Lunas</option>
              <option value="pending">Pending</option>
              <option value="failed">Gagal</option>
              <option value="refund">Refund</option>
            </select>
          </div>
        } />

        {error && <div style={{ padding: resp.isMobile ? 10 : 16 }}><ErrorBox msg={error} /></div>}

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <TableHead cols={['#', 'User', 'Program', 'Jumlah', 'Status', 'Tanggal', { label: 'Aksi', right: true }]} />
            <tbody>
              {loading ? <tr><td colSpan={7}><Spinner /></td></tr>
              : txs.length === 0 ? <EmptyRow cols={7} msg="Belum ada transaksi." />
              : txs.map((tx, i) => (
                <tr key={tx.id} style={{ borderBottom: `1px solid ${T.border}` }}>
                  <td style={{ padding: cellPad, fontSize: 12, color: T.text4 }}>{(page - 1) * PER + i + 1}</td>
                  <td style={{ padding: cellPad, fontSize: resp.isMobile ? 12 : 13, color: T.text }}>{tx.user_name || tx.user_email || '—'}</td>
                  <td style={{ padding: cellPad, fontSize: 12, color: T.text3 }}>{tx.program_name || '—'}</td>
                  <td style={{ padding: cellPad, fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: resp.isMobile ? 12 : 13, color: T.text }}>
                    Rp{(tx.amount || 0).toLocaleString('id-ID')}
                  </td>
                  <td style={{ padding: cellPad }}>
                    <Badge label={STATUS_LABELS[tx.status] || tx.status} color={STATUS_COLORS[tx.status] || '#6b7280'} />
                  </td>
                  <td style={{ padding: cellPad, fontSize: 12, color: T.text4 }}>
                    {tx.created_at ? new Date(tx.created_at).toLocaleDateString('id-ID') : '-'}
                  </td>
                  <td style={{ padding: cellPad, textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <Btn size="sm" variant="outline" color={BLUE} onClick={() => setDetail(tx)}>
                        <Eye size={12} />
                      </Btn>
                      {tx.status === 'paid' && (
                        <Btn size="sm" variant="outline" color={RED} onClick={() => handleRefund(tx.id)}>
                          <RotateCcw size={12} /> Refund
                        </Btn>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
        <Modal title="Detail Transaksi" onClose={() => setDetail(null)}>
          <div style={{ fontSize: 13, color: T.text, lineHeight: 1.8 }}>
            <div><strong>ID:</strong> {detail.id}</div>
            <div><strong>User:</strong> {detail.user_name || detail.user_email || '—'}</div>
            <div><strong>Program:</strong> {detail.program_name || '—'}</div>
            <div><strong>Jumlah:</strong> Rp{(detail.amount || 0).toLocaleString('id-ID')}</div>
            <div><strong>Diskon:</strong> Rp{(detail.discount || 0).toLocaleString('id-ID')}</div>
            <div><strong>Status:</strong> <Badge label={STATUS_LABELS[detail.status] || detail.status} color={STATUS_COLORS[detail.status] || '#6b7280'} /></div>
            <div><strong>Metode:</strong> {detail.payment_method || '—'}</div>
            <div><strong>Tanggal:</strong> {detail.created_at ? new Date(detail.created_at).toLocaleString('id-ID') : '-'}</div>
            {detail.coupon_code && <div><strong>Kupon:</strong> {detail.coupon_code}</div>}
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
            <Btn variant="outline" color={T.text4} onClick={() => setDetail(null)}>Tutup</Btn>
          </div>
        </Modal>
      )}
      {confirmModal}
    </div>
  );
}
