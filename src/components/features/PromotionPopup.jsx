import { useEffect, useState } from 'react';
import { X, Gift, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PromotionPopup({ promotions, onClose }) {
  const [idx, setIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  const promo = promotions?.[idx];

  useEffect(() => {
    if (!promotions || promotions.length < 2) return;
    const t = setInterval(() => setIdx(i => (i + 1) % promotions.length), 6000);
    return () => clearInterval(t);
  }, [promotions?.length]);

  if (!promo) return null;

  const copyCode = () => {
    if (promo.coupon_code) {
      navigator.clipboard?.writeText(promo.coupon_code);
      setCopied(true);
      toast.success('Kode promo disalin!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
        padding: 16, animation: 'fadeIn .3s ease',
      }}
    >
      <div style={{
        background: `linear-gradient(135deg, ${promo.bg_color || '#FF6B00'}88, #1a1a2e)`,
        border: `1px solid ${(promo.bg_color || '#FF6B00')}60`,
        borderRadius: 24, maxWidth: 420, width: '100%',
        overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,.7)',
        animation: 'popIn .4s cubic-bezier(0.22,1,0.36,1)',
      }}>
        {/* Header decoration */}
        <div style={{
          height: 6,
          background: `linear-gradient(90deg, ${promo.bg_color || '#FF6B00'}, ${promo.bg_color || '#FF6B00'}88)`,
        }} />

        <div style={{ padding: '28px 28px 24px', position: 'relative' }}>
          <button onClick={onClose}
            style={{
              position: 'absolute', top: 16, right: 16,
              width: 32, height: 32, borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)', border: 'none',
              cursor: 'pointer', color: '#fff', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <X size={16} />
          </button>

          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: `linear-gradient(135deg, ${promo.bg_color || '#FF6B00'}, ${promo.bg_color || '#FF6B00'}88)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', fontSize: 28,
          }}>
            <Gift size={28} color="#fff" />
          </div>

          <h3 style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800,
            fontSize: 20, color: '#fff', textAlign: 'center',
            marginBottom: 8,
          }}>
            {promo.title}
          </h3>

          {promo.description && (
            <p style={{
              fontSize: 13.5, color: 'rgba(255,255,255,0.75)',
              textAlign: 'center', lineHeight: 1.6, marginBottom: 16,
            }}>
              {promo.description}
            </p>
          )}

          {promo.discount_text && (
            <div style={{
              textAlign: 'center', marginBottom: 16,
              fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800,
              fontSize: 28, color: (promo.bg_color || '#FF6B00'),
            }}>
              {promo.discount_text}
            </div>
          )}

          {promo.coupon_code && (
            <div
              onClick={copyCode}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: `1.5px dashed ${copied ? '#22C55E' : 'rgba(255,255,255,0.3)'}`,
                borderRadius: 12, padding: '12px 16px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 10, cursor: 'pointer', marginBottom: 16,
                transition: 'all .2s',
              }}
            >
              <span style={{
                fontFamily: 'monospace', fontWeight: 800,
                fontSize: 18, color: copied ? '#22C55E' : '#fff',
                letterSpacing: '0.08em',
              }}>
                {copied ? '✓ TERSALIN!' : promo.coupon_code}
              </span>
              {!copied && <Copy size={16} color="rgba(255,255,255,0.5)" />}
              {copied && <Check size={16} color="#22C55E" />}
            </div>
          )}

          <button
            onClick={() => { window.location.href = '/register'; onClose(); }}
            style={{
              width: '100%', padding: '13px',
              background: `linear-gradient(135deg, ${promo.bg_color || '#FF6B00'}, ${(promo.bg_color || '#FF6B00')}cc)`,
              color: '#fff', border: 'none', borderRadius: 12,
              fontSize: 15, fontWeight: 700, cursor: 'pointer',
              transition: 'transform .2s',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            🚀 Klaim Promo Sekarang
          </button>

          <div style={{ textAlign: 'center', marginTop: 12 }}>
            <button onClick={onClose}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'rgba(255,255,255,0.4)', fontSize: 12,
                textDecoration: 'underline',
              }}>
              Nanti saja
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.85) translateY(20px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
