import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, ArrowRight } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import useResponsive from '@/hooks/useResponsive';
import { paymentApi } from '@/lib/api';
import { formatIDR } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

const STATUS_MAP = {
  finish: { icon: CheckCircle, color: '#22C55E', title: 'Pembayaran Berhasil!', desc: 'Program kamu sudah aktif. Selamat belajar!' },
  pending: { icon: Clock, color: '#F59E0B', title: 'Menunggu Pembayaran', desc: 'Pembayaran sedang diproses. Cek status secara berkala.' },
  error: { icon: XCircle, color: '#EF4444', title: 'Pembayaran Gagal', desc: 'Terjadi kesalahan. Silakan coba lagi.' },
};

export default function PaymentCallback() {
  const { T, C } = useTheme();
  const resp = useResponsive();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const status = location.pathname.split('/').pop();
  const orderId = searchParams.get('order_id');
  const cfg = STATUS_MAP[status] || STATUS_MAP.pending;
  const [tx, setTx] = useState(null);

  useEffect(() => {
    if (orderId) {
      paymentApi.getStatus(orderId).then(d => setTx(d)).catch(() => {});
    }
  }, [orderId]);

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', background: T.bg, padding: 20,
    }}>
      <div style={{
        background: T.bg2, border: `1px solid ${T.border}`,
        borderRadius: 20, padding: resp.isMobile ? 32 : 48,
        maxWidth: 440, width: '100%', textAlign: 'center',
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: cfg.color + '18', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
        }}>
          <cfg.icon size={36} color={cfg.color} />
        </div>
        <h1 style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: 22, fontWeight: 800, color: T.text, marginBottom: 8,
        }}>
          {cfg.title}
        </h1>
        <p style={{ fontSize: 14, color: T.text3, marginBottom: 24 }}>{cfg.desc}</p>

        {tx && (
          <div style={{
            background: T.bg3, borderRadius: 12, padding: 16, marginBottom: 24,
            textAlign: 'left',
          }}>
            <div style={{ fontSize: 11, color: T.text4, marginBottom: 4 }}>Order ID</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: T.text, fontFamily: 'monospace', marginBottom: 12 }}>{orderId}</div>
            <div style={{ fontSize: 11, color: T.text4, marginBottom: 4 }}>Total</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: C.orange }}>{formatIDR(tx.gross_amount)}</div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, flexDirection: resp.isMobile ? 'column' : 'row' }}>
          {status !== 'finish' && (
            <Button onClick={() => navigate('/pembayaran')} variant="outline" style={{ flex: 1 }}>
              Coba Lagi
            </Button>
          )}
          <Button onClick={() => navigate(status === 'finish' ? '/belajar' : '/program')}
            style={{ flex: 1, background: C.orange, color: T.bg, fontWeight: 700 }}>
            {status === 'finish' ? 'Mulai Belajar' : 'Lihat Program'} <ArrowRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}
