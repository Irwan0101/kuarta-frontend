// src/components/features/payment/SuccessModal.jsx
import { useNavigate } from 'react-router-dom';
import { Play, ExternalLink } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/hooks/useTheme';
import { useUIStore } from '@/store/uiStore';

export default function SuccessModal() {
  const { T, C }     = useTheme();
  const navigate     = useNavigate();
  const data         = useUIStore(s => s.successData);
  const closeSuccess = useUIStore(s => s.closeSuccess);

  const handleStart = () => { closeSuccess(); navigate('/materi'); };

  return (
    <Modal open={!!data} onClose={closeSuccess} title={data?.pending ? 'Menunggu Pembayaran' : 'Pembayaran Berhasil'} width={420}>
      <div style={{ textAlign: 'center', padding: '8px 0' }}>
        <div style={{ fontSize: 64, marginBottom: 12 }}>{data?.pending ? '⏳' : '✅'}</div>
        <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800, color: data?.pending ? C.yellow : C.green, marginBottom: 8 }}>
          {data?.pending ? 'Selesaikan Pembayaran' : 'Pembayaran Berhasil!'}
        </div>
        <div style={{ fontSize: 13, color: T.text3, lineHeight: 1.6, marginBottom: 20 }}>
          {data?.pending
            ? 'Selesaikan pembayaran sesuai instruksi yang dikirim ke email kamu.'
            : `Program ${data?.program?.name || ''} sudah aktif. Mulai belajar dan raih impianmu! 🚀`
          }
        </div>

        {data?.orderId && (
          <div style={{ background: T.bg3, borderRadius: 10, padding: 14, marginBottom: 20, textAlign: 'left' }}>
            <div style={{ fontSize: 11, color: T.text4, marginBottom: 4 }}>ID Transaksi</div>
            <div style={{ fontFamily: 'monospace', fontSize: 13, color: data?.pending ? C.yellow : C.green, wordBreak: 'break-all' }}>
              {data.orderId}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          {!data?.pending && (
            <Button onClick={handleStart} icon={<Play size={14} />} size="md">
              Mulai Belajar Sekarang
            </Button>
          )}
          <Button variant="ghost" onClick={closeSuccess}>
            {data?.pending ? 'Tutup' : 'Nanti Saja'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}