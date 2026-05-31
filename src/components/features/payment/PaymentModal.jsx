// src/components/features/payment/PaymentModal.jsx
import { useState } from 'react';
import { CheckCircle, Loader } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/hooks/useTheme';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { paymentApi } from '@/lib/api';
import { formatIDR, PAYMENT_METHODS } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function PaymentModal() {
  const { T, C }     = useTheme();
  const data         = useUIStore(s => s.paymentData);
  const closePayment = useUIStore(s => s.closePayment);
  const openSuccess  = useUIStore(s => s.openSuccess);
  const { user }     = useAuthStore();

  const [method, setMethod]   = useState('bank_transfer');
  const [loading, setLoading] = useState(false);
  const [step, setStep]       = useState(1); // 1=method, 2=confirm

  const program = data?.program;

  const handlePay = async () => {
    if (!program) return;
    setLoading(true);
    try {
      const res = await paymentApi.createOrder(program.id, method);

      // Load Midtrans Snap
      if (res.snapToken && window.snap) {
        window.snap.pay(res.snapToken, {
          onSuccess: (result) => {
            closePayment();
            openSuccess({ program, orderId: res.orderId, pending: false });
          },
          onPending: (result) => {
            closePayment();
            openSuccess({ program, orderId: res.orderId, pending: true });
          },
          onError: () => {
            toast.error('Pembayaran gagal. Silakan coba lagi.');
          },
          onClose: () => {},
        });
      } else {
        // Fallback: open payment URL
        if (res.paymentUrl) window.open(res.paymentUrl, '_blank');
        closePayment();
        openSuccess({ program, orderId: res.orderId, pending: true });
      }
    } catch (err) {
      toast.error(err?.message || 'Gagal memproses pembayaran.');
    } finally {
      setLoading(false);
    }
  };

  const selectedMethod = PAYMENT_METHODS.find(m => m.id === method);

  return (
    <Modal
      open={!!data}
      onClose={closePayment}
      title="Pilih Metode Pembayaran"
      icon="💳"
      width={480}
    >
      {program && (
        <>
          {/* Program info */}
          <div style={{
            background: T.bg3, borderRadius: 12, padding: 16, marginBottom: 20,
            border: `1px solid ${T.border}`,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 11, color: T.text4, marginBottom: 4 }}>Program yang dipilih</div>
                <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, color: T.text }}>
                  {program.name}
                </div>
                <div style={{ fontSize: 12, color: T.text3, marginTop: 2 }}>{program.subtitle}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800, color: C.orange }}>
                  {formatIDR(program.price)}
                </div>
                {program.originalPrice && (
                  <div style={{ fontSize: 11, color: T.text4, textDecoration: 'line-through' }}>
                    {formatIDR(program.originalPrice)}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Payment methods */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
            {PAYMENT_METHODS.map(m => (
              <label
                key={m.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 14px',
                  background: method === m.id ? C.orange + '12' : T.bg3,
                  border: `1.5px solid ${method === m.id ? C.orange : T.border}`,
                  borderRadius: 12, cursor: 'pointer',
                  transition: 'all .15s',
                }}
              >
                <input
                  type="radio"
                  name="payment_method"
                  value={m.id}
                  checked={method === m.id}
                  onChange={() => setMethod(m.id)}
                  style={{ display: 'none' }}
                />
                <span style={{ fontSize: 22 }}>{m.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: method === m.id ? C.orange : T.text }}>
                    {m.label}
                  </div>
                  <div style={{ fontSize: 11, color: T.text4 }}>{m.desc}</div>
                </div>
                {method === m.id && <CheckCircle size={16} color={C.orange} />}
              </label>
            ))}
          </div>

          {/* Summary */}
          <div style={{ background: T.bg3, borderRadius: 10, padding: '12px 14px', marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: T.text3, marginBottom: 6 }}>
              <span>Harga program</span>
              <span>{formatIDR(program.price)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: T.text3, marginBottom: 8 }}>
              <span>Biaya layanan</span>
              <span>Rp 0</span>
            </div>
            <div style={{ height: 1, background: T.border, marginBottom: 8 }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 16, color: T.text }}>
              <span>Total Bayar</span>
              <span style={{ color: C.orange }}>{formatIDR(program.price)}</span>
            </div>
          </div>

          {/* CTA */}
          <Button
            onClick={handlePay}
            loading={loading}
            fullWidth
            size="lg"
            icon={!loading && <span style={{ fontSize: 16 }}>{selectedMethod?.icon}</span>}
          >
            Bayar dengan {selectedMethod?.label}
          </Button>

          <div style={{ textAlign: 'center', marginTop: 12, fontSize: 11, color: T.text4 }}>
            🔒 Pembayaran aman dengan enkripsi SSL • Powered by Midtrans
          </div>
        </>
      )}
    </Modal>
  );
}