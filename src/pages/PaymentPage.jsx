// src/pages/PaymentPage.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from '@/components/SEO';
import { Shield } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { paymentApi, programsApi, publicApi } from '@/lib/api';
import { formatIDR, formatDate } from '@/lib/utils';
import useResponsive from '@/hooks/useResponsive';
import toast from 'react-hot-toast';

/* ── Helper fallback icon ──────────────────────────────────────── */
const getProgramIcon = (slug) => {
  if (slug?.includes('sd')) return '📗';
  if (slug?.includes('smp')) return '📘';
  if (slug?.includes('sma')) return '📙';
  if (slug?.includes('utbk')) return '🎯';
  if (slug?.includes('cpns') || slug?.includes('kedinasan')) return '🏛️';
  if (slug?.includes('karier')) return '💼';
  if (slug?.includes('english')) return '🌐';
  return '🏆';
};

/* ── Status Badge Component ────────────────────────────────────── */
function StatusBadge({ status, T, C }) {
  const statusConfig = {
    success: { bg: C.green + '18', color: C.green, text: '✓ Sukses', icon: '✓' },
    pending: { bg: C.orange + '18', color: C.orange, text: '⏳ Menunggu', icon: '⏳' },
    failed: { bg: '#EF4444' + '18', color: '#EF4444', text: '✕ Gagal', icon: '✕' },
    expire: { bg: '#94A3B8' + '18', color: '#94A3B8', text: '⏱ Expired', icon: '⏱' },
  };
  const config = statusConfig[status] || statusConfig.pending;
  return (
    <div style={{
      background: config.bg,
      color: config.color,
      fontSize: 10,
      fontWeight: 700,
      padding: '4px 10px',
      borderRadius: 20,
      display: 'inline-block',
      marginTop: 6,
    }}>
      {config.text}
    </div>
  );
}

/* ── Transaction Item ──────────────────────────────────────── */
function TransactionItem({ tx, T, C }) {
  return (
    <div style={{
      background: T.bg2,
      border: `1px solid ${T.border}`,
      borderRadius: 12,
      padding: '16px 20px',
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      transition: 'all 0.2s',
      cursor: 'pointer',
    }}
    onMouseEnter={e => e.currentTarget.style.borderColor = C.orange + '60'}
    onMouseLeave={e => e.currentTarget.style.borderColor = T.border}
    >
      {/* Icon */}
      <div style={{
        width: 44,
        height: 44,
        borderRadius: 12,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 20,
        background: T.bg3,
        flexShrink: 0,
      }}>
        {tx.icon}
      </div>

      {/* Info */}
      <div style={{ flex: 1 }}>
        <div style={{
          fontWeight: 600,
          fontSize: 13.5,
          color: T.text,
          marginBottom: 4,
        }}>
          {tx.program}
        </div>
        <div style={{
          fontSize: 11,
          color: T.text4,
          display: 'flex',
          gap: 12,
        }}>
          <span>{formatDate(tx.date)}</span>
          <span>•</span>
          <span>{tx.paymentMethod}</span>
        </div>
        <div style={{
          fontSize: 10,
          color: T.text4,
          fontFamily: 'monospace',
          marginTop: 3,
        }}>
          {tx.id}
        </div>
      </div>

      {/* Amount & Status */}
      <div style={{ textAlign: 'right' }}>
        <div style={{
          fontFamily: 'Syne, sans-serif',
          fontSize: 15,
          fontWeight: 700,
          color: T.text,
          marginBottom: 4,
        }}>
          {formatIDR(tx.amount)}
        </div>
        <StatusBadge status={tx.status} T={T} C={C} />
      </div>
    </div>
  );
}

/* ── Main Component ────────────────────────────────────────── */
export default function PaymentPage() {
  const { T, C } = useTheme();
  const clearCart = useCartStore(s => s.clearCart);
  const navigate = useNavigate();
  const resp = useResponsive();

  // 🌟 State Baru untuk menampung data program asli dari Database
  const [dbPrograms, setDbPrograms] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('bank');
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [settings, setSettings] = useState({ serviceFee: 0, paymentMethods: [], banks: [] });

  const total = selectedProgram ? (Number(selectedProgram.price) + (settings.serviceFee || 0)) : 0;

  // 🌟 Ambil data program real-time dari Database via API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setPageLoading(true);
        const [programs, history, pubSettings] = await Promise.all([
          programsApi.getAll().catch(() => []),
          paymentApi.getHistory().catch(() => null),
          publicApi.getSettings().catch(() => ({})),
        ]);
        const cfg = pubSettings.payment_config || {};
        setSettings({ serviceFee: cfg.service_fee ?? 0, paymentMethods: cfg.payment_methods || [], banks: cfg.banks || [] });

        if (programs && programs.length > 0) {
          const formatted = programs.map(prog => ({
            ...prog,
            price: Number(prog.price),
            icon: prog.icon || '📚',
          }));
          setDbPrograms(formatted);
          setSelectedProgram(formatted[0]);
        }

        if (history?.transactions) {
          const mapped = history.transactions.map(tx => ({
            id: tx.order_id || tx.id,
            program: tx.program_name || 'Program',
            amount: tx.gross_amount || 0,
            status: tx.status === 'settlement' ? 'success' : tx.status === 'deny' || tx.status === 'expire' ? 'failed' : tx.status || 'pending',
            date: new Date(tx.created_at || tx.transaction_time),
            paymentMethod: tx.payment_type || '-',
            icon: tx.program_icon || getProgramIcon(tx.program_category) || '💳',
          }));
          setTransactions(mapped);
        }
    } catch (err) {
      console.error("Gagal menarik data:", err);
      toast.error('Gagal memuat data pembayaran');
    } finally {
        setPageLoading(false);
      }
    };

    fetchData();
  }, []);

  const handlePayment = async () => {
    if (!selectedProgram) return toast.error("Silakan pilih program terlebih dahulu.");
    
    setLoading(true);
    try {
      // 🌟 Mengirim string UUID asli milik DB (e.g. 'c9a646d3-...')
      const data = await paymentApi.createOrder(selectedProgram.id, 'midtrans'); 

      const { snap_token, order_id, client_key } = data;

      // Pastikan Midtrans Snap.js dimuat
      if (!window.snap) {
        const script = document.createElement('script');
        script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
        script.setAttribute('data-client-key', client_key);
        script.onload = () => {
          window.snap.pay(snap_token, {
            onSuccess: (result) => handlePaymentSuccess(result, order_id),
            onPending: (result) => handlePaymentPending(result),
            onError: (result) => handlePaymentError(result),
            onClose: () => setLoading(false),
          });
        };
        document.body.appendChild(script);
      } else {
        window.snap.pay(snap_token, {
          onSuccess: (result) => handlePaymentSuccess(result, order_id),
          onPending: (result) => handlePaymentPending(result),
          onError: (result) => handlePaymentError(result),
          onClose: () => setLoading(false),
        });
      }
    } catch (err) {
      console.error('Payment error:', err);
      const errorMsg = err.error || err.message || 'Gagal membuat transaksi. Silakan coba lagi.';
      toast.error(errorMsg);
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (result, orderId) => {
    clearCart();
    toast.success('Pembayaran berhasil! Selamat belajar.');
    setLoading(false);

    // Sync status with backend
    try { await paymentApi.syncStatus(orderId); } catch (_) {}

    // Reload payment history
    setTimeout(() => {
      const newTx = {
        id: orderId,
        program: selectedProgram.name,
        amount: selectedProgram.price,
        status: 'success',
        date: new Date(),
        paymentMethod: 'Midtrans',
        icon: selectedProgram.icon,
      };
      setTransactions([newTx, ...transactions]);
    }, 500);
  };

  const handlePaymentPending = (result) => {
    toast.success('Pembayaran sedang diproses. Cek status transaksi secara berkala.');
    setLoading(false);
  };

  const handlePaymentError = (result) => {
    toast.error('Pembayaran gagal. Silakan coba lagi dengan metode pembayaran lain.');
    setLoading(false);
  };

  // State loading pelindung jika API belum mengembalikan data program
  if (pageLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', color: T.text }}>
        <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite', fontSize: 28, marginRight: 10 }}>⚙️</span>
        <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>Menghubungkan ke Database...</span>
        <style>{'@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }'}</style>
      </div>
    );
  }

  return (
    <>
      <SEO title="Pembayaran" description="Selesaikan pembayaran program pilihanmu dengan berbagai metode" url="/pembayaran" noindex />
      <div style={{ width: '100%' }}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{
          fontFamily: 'Syne, sans-serif',
          fontSize: 24,
          fontWeight: 800,
          color: T.text,
          marginBottom: 6,
        }}>
          Pembayaran & Transaksi
        </h1>
        <p style={{ fontSize: 13.5, color: T.text3 }}>
          Kelola transaksi dan paket bimbel Anda dengan mudah
        </p>
      </div>

      {/* Main Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: resp.isMobile ? '1fr' : resp.isTablet ? '1fr' : '1fr 380px',
        gap: 24,
      }}>

        {/* Left: History */}
        <div>
          {/* Filter Tabs */}
          <div style={{
            display: 'flex',
            gap: 10,
            marginBottom: 20,
            paddingBottom: 16,
            borderBottom: `1px solid ${T.border}`,
            flexWrap: 'wrap',
          }}>
            {['Semua', 'Sukses', 'Menunggu', 'Gagal'].map(label => (
              <button
                key={label}
                style={{
                  padding: '8px 16px',
                  background: label === 'Semua' ? C.orange : T.bg2,
                  border: `1px solid ${label === 'Semua' ? C.orange : T.border}`,
                  color: label === 'Semua' ? T.bg : T.text3,
                  borderRadius: 24,
                  fontSize: 12.5,
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                  if (label !== 'Semua') {
                    e.currentTarget.style.borderColor = T.border2;
                    e.currentTarget.style.color = T.text2;
                  }
                }}
                onMouseLeave={e => {
                  if (label !== 'Semua') {
                    e.currentTarget.style.borderColor = T.border;
                    e.currentTarget.style.color = T.text3;
                  }
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Transaction List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {transactions.length > 0 ? (
              transactions.map((tx, idx) => (
                <TransactionItem
                  key={idx}
                  tx={tx}
                  T={T}
                  C={C}
                />
              ))
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: T.text3,
              }}>
                <div style={{ fontSize: 44, marginBottom: 10 }}>💳</div>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                  Belum ada transaksi
                </div>
                <div style={{ fontSize: 12, color: T.text4 }}>
                  Mulai belajar dengan membeli program favorit Anda
                </div>
              </div>
            )}
          </div>

          {/* Load More */}
          {transactions.length >= 4 && (
            <Button
              fullWidth
              variant="ghost"
              style={{ marginTop: 16 }}
            >
              Muat Lebih Banyak
            </Button>
          )}
        </div>

        {/* Right: Order Card (Sticky) */}
        <div style={{ position: 'sticky', top: 20, height: 'fit-content' }}>
          <Card style={{ padding: 0 }}>
            {/* Header */}
            <div style={{
              padding: '20px 22px',
              borderBottom: `1px solid ${T.border}`,
              fontFamily: 'Syne, sans-serif',
              fontWeight: 700,
              fontSize: 16,
              color: T.text,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              | Beli Program Baru
            </div>

            {/* Body */}
            <div style={{ padding: '20px 22px' }}>

              {/* Program Selection */}
              <div style={{ marginBottom: 18 }}>
                <label style={{
                  display: 'block',
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: T.text4,
                  marginBottom: 10,
                }}>
                  Pilih Program
                </label>
                <select
                  value={selectedProgram?.id || ''}
                  onChange={e => {
                    const prog = dbPrograms.find(p => p.id === e.target.value);
                    setSelectedProgram(prog);
                  }}
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    background: T.bg3,
                    border: `1px solid ${T.border}`,
                    borderRadius: 8,
                    color: T.text,
                    fontSize: 13,
                    fontFamily: 'inherit',
                    cursor: 'pointer',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => e.currentTarget.style.borderColor = C.orange}
                  onBlur={e => e.currentTarget.style.borderColor = T.border}
                >
                  {dbPrograms.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.icon} {p.name} — {formatIDR(p.price)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Order Summary */}
              {selectedProgram && (
                <div style={{ marginBottom: 14 }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 13,
                    marginBottom: 12,
                  }}>
                    <span style={{ color: T.text4 }}>Harga Program</span>
                    <span style={{ color: T.text, fontWeight: 600 }}>
                      {formatIDR(selectedProgram.price)}
                    </span>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 13,
                    marginBottom: 12,
                  }}>
                    <span style={{ color: T.text4 }}>Diskon Member</span>
                    <span style={{ color: C.green, fontWeight: 600 }}>- {formatIDR(0)}</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 13,
                    marginBottom: 12,
                  }}>
                    <span style={{ color: T.text4 }}>Biaya Layanan</span>
                    <span style={{ color: T.text, fontWeight: 600 }}>
                      {formatIDR(settings.serviceFee)}
                    </span>
                  </div>
                </div>
              )}

              {/* Total */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: 12,
                marginBottom: 16,
                borderTop: `1px solid ${T.border}`,
                fontFamily: 'Syne, sans-serif',
              }}>
                <span style={{ fontWeight: 700, color: T.text }}>Total</span>
                <span style={{
                  fontSize: 20,
                  fontWeight: 800,
                  color: C.orange,
                }}>
                  {formatIDR(total)}
                </span>
              </div>

              {/* Payment Methods */}
              <div style={{ marginBottom: 20 }}>
                <div style={{
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: T.text4,
                  marginBottom: 10,
                }}>
                  Metode Pembayaran
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: resp.isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
                  gap: 8,
                }}>
                  {(settings.paymentMethods.length > 0 ? settings.paymentMethods : [
                    { id: 'bank', label: 'Transfer Bank' },
                    { id: 'other', label: 'Lainnya' },
                  ]).map(method => (
                    <button
                      key={method.id}
                      onClick={() => setSelectedPaymentMethod(method.id)}
                      style={{
                        padding: '10px 8px',
                        background: selectedPaymentMethod === method.id ? C.orange + '18' : T.bg3,
                        border: `1.5px solid ${selectedPaymentMethod === method.id ? C.orange : T.border}`,
                        borderRadius: 8,
                        fontSize: 10,
                        fontWeight: 600,
                        color: selectedPaymentMethod === method.id ? C.orange : T.text3,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 4,
                      }}
                      onMouseEnter={e => {
                        if (selectedPaymentMethod !== method.id) {
                          e.currentTarget.style.borderColor = T.border2;
                        }
                      }}
                      onMouseLeave={e => {
                        if (selectedPaymentMethod !== method.id) {
                          e.currentTarget.style.borderColor = T.border;
                        }
                      }}
                    >
                      <span style={{ fontSize: 18 }}>{method.icon}</span>
                      {method.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Button */}
              <Button
                fullWidth
                onClick={handlePayment}
                disabled={loading || !selectedProgram}
                style={{
                  background: C.orange,
                  color: T.bg,
                  fontWeight: 800,
                  fontSize: 15,
                  height: 48,
                  marginBottom: 12,
                }}
              >
                {loading ? (
                  <>
                    <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>
                      ⚙️
                    </span>
                    {' '}Memproses...
                  </>
                ) : (
                  <>
                    🔒 Bayar {formatIDR(total)}
                  </>
                )}
              </Button>

              {/* Security Info */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                fontSize: 11,
                color: T.text4,
                textAlign: 'center',
              }}>
                <Shield size={14} color={C.green} />
                Pembayaran aman diproses oleh Midtrans
              </div>
            </div>
          </Card>

          {/* Supported Methods */}
          <div style={{
            background: T.bg2,
            border: `1px solid ${T.border}`,
            borderRadius: 12,
            padding: 16,
            marginTop: 14,
          }}>
            <div style={{
              fontSize: 11,
              fontWeight: 700,
              color: T.text4,
              marginBottom: 10,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              Didukung Oleh
            </div>
            <div style={{
              display: 'flex',
              gap: 8,
              flexWrap: 'wrap',
            }}>
              {(settings.banks.length > 0 ? settings.banks : ['BCA', 'Mandiri', 'BRI']).map(bank => (
                <span
                  key={bank}
                  style={{
                    background: T.bg3,
                    border: `1px solid ${T.border}`,
                    borderRadius: 6,
                    padding: '6px 12px',
                    fontSize: 11,
                    fontWeight: 600,
                    color: T.text3,
                  }}
                >
                  {bank}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Spinner Animation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
    </>
  );
}