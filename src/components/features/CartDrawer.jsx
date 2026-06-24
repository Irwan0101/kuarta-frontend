import { useCartStore } from '@/store/cartStore';
import { useTheme } from '@/hooks/useTheme';
import { ShoppingCart, X, Trash2, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ORG = '#FF6B00';

export default function CartDrawer({ open, onClose }) {
  const { T } = useTheme();
  const navigate = useNavigate();
  const { items, removeItem, getTotal, getCount } = useCartStore();
  const count = getCount();
  const total = getTotal();

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)',
            zIndex: 998, transition: 'opacity .3s',
          }}
        />
      )}

      {/* Drawer */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 380,
        maxWidth: '100vw', background: T.bg2, zIndex: 999,
        borderLeft: `1px solid ${T.border}`,
        display: 'flex', flexDirection: 'column',
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform .3s cubic-bezier(0.22,1,0.36,1)',
        boxShadow: '-8px 0 40px rgba(0,0,0,.3)',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px', borderBottom: `1px solid ${T.border}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShoppingCart size={18} color={ORG} />
            <span style={{ fontWeight: 700, fontSize: 15, color: T.text }}>
              Keranjang {count > 0 && `(${count})`}
            </span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.text4, display: 'flex' }}>
            <X size={18} />
          </button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
          {count === 0 ? (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', height: '100%', opacity: .4, gap: 12,
            }}>
              <ShoppingCart size={40} />
              <span style={{ fontSize: 13 }}>Keranjang masih kosong</span>
            </div>
          ) : (
            items.map(item => (
              <div key={item.id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 14px', marginBottom: 8,
                background: T.bg3, borderRadius: 12,
                border: `1px solid ${T.border}`,
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: ORG + '18', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  fontSize: 20, flexShrink: 0,
                }}>
                  {item.icon || '📚'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.name}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: ORG, marginTop: 2 }}>
                    Rp{Number(item.price).toLocaleString('id-ID')}
                  </div>
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', display: 'flex', padding: 4 }}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {count > 0 && (
          <div style={{
            padding: '16px 20px', borderTop: `1px solid ${T.border}`,
          }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              marginBottom: 12, fontSize: 14,
            }}>
              <span style={{ color: T.text3 }}>Total</span>
              <span style={{ fontWeight: 800, fontSize: 18, color: ORG }}>
                Rp{total.toLocaleString('id-ID')}
              </span>
            </div>
            <button
              onClick={() => { onClose(); navigate('/pembayaran', { state: { fromCart: true } }); }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 8, padding: '12px', borderRadius: 10, border: 'none',
                background: ORG, color: '#fff', fontWeight: 700, fontSize: 14,
                cursor: 'pointer', transition: 'all .2s',
              }}
            >
              Lanjut ke Pembayaran <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </>
  );
}
