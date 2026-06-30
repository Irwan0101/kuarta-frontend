import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from '@/components/SEO';
import {
  PlayCircle, FileText, Clock, Star, Users,
  Mic, ClipboardCheck, ChevronRight, Search,
  BookOpen, Zap, ShoppingCart, GraduationCap,
  Sparkles, Filter, Loader2,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { programsApi } from '@/lib/api';
import { formatIDR } from '@/lib/utils';
import toast from 'react-hot-toast';

const CATEGORY_META = {
  sekolah:     { label: 'SD / SMP / SMA',  icon: '📚' },
  universitas: { label: 'Masuk PTN',        icon: '🎯' },
  cpns:        { label: 'CPNS / ASN',       icon: '🏛️' },
  karier:      { label: 'Karier & Skills',  icon: '💼' },
  olimpiade:   { label: 'Olimpiade',        icon: '🏆' },
  bahasa:      { label: 'Bahasa',           icon: '🌐' },
};

function ProgramBadge({ badge, type, C }) {
  if (!badge) return null;
  const colors = {
    popular: { bg: C.orange, color: '#fff' },
    new:     { bg: C.green,  color: '#fff' },
    hot:     { bg: '#EF4444', color: '#fff' },
  };
  const c = colors[type] || colors.popular;
  return (
    <div style={{
      position: 'absolute', top: 12, right: 12,
      background: c.bg, color: c.color,
      fontSize: 10, fontWeight: 800,
      padding: '4px 10px', borderRadius: 20,
      letterSpacing: '0.04em', textTransform: 'uppercase', zIndex: 2,
    }}>
      {badge}
    </div>
  );
}

function Stars({ rating, C }) {
  const r = parseFloat(rating) || 0;
  const full = Math.floor(r);
  const half = r % 1 >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return (
    <span style={{ display: 'inline-flex', gap: 1, alignItems: 'center' }}>
      {Array(full).fill(0).map((_, i) => (
        <Star key={`f${i}`} size={11} fill={C.orange} color={C.orange} />
      ))}
      {half && <Star size={11} fill="none" color={C.orange} strokeWidth={2} />}
      {Array(empty).fill(0).map((_, i) => (
        <Star key={`e${i}`} size={11} fill="none" color="#94A3B8" strokeWidth={1.5} />
      ))}
    </span>
  );
}

function ProgramCard({ prog, T, C, onSelect, onAddToCart }) {
  const [hovered, setHovered] = useState(false);
  const icon = prog.icon || CATEGORY_META[prog.category]?.icon || '📖';
  const gradient = prog.bg_gradient || 'linear-gradient(135deg, #1a1a2e, #0f0f1a)';
  const reviewK = prog.review_count >= 1000
    ? (prog.review_count / 1000).toFixed(1) + 'k'
    : prog.review_count;
  const isFree = !prog.price || prog.price === 0;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onSelect(prog)}
      style={{
        background: T.bg2,
        border: `1.5px solid ${hovered ? C.orange + '70' : T.border}`,
        borderRadius: 16, overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
        boxShadow: hovered ? `0 20px 40px ${C.orange}18` : '0 4px 12px rgba(0,0,0,0.08)',
        cursor: 'pointer',
        position: 'relative',
      }}
    >
      <div style={{
        background: gradient, height: 140,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 56, position: 'relative', flexShrink: 0,
      }}>
        <span style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}>{icon}</span>
        <ProgramBadge badge={prog.badge} type={prog.badge_type} C={C} />
        {prog.is_enrolled && (
          <div style={{
            position: 'absolute', bottom: 10, left: 12,
            background: C.green + 'CC', color: '#fff',
            fontSize: 10, fontWeight: 700,
            padding: '3px 12px', borderRadius: 20,
            backdropFilter: 'blur(4px)',
          }}>
            ✓ Sudah Dimiliki
          </div>
        )}
      </div>

      <div style={{ padding: '16px 18px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 10.5, fontWeight: 700, color: C.orange, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>
          {prog.category_label || prog.category}
        </div>

        <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 15, color: T.text, marginBottom: 6, lineHeight: 1.3 }}>
          {prog.name}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <Stars rating={prog.rating || 0} C={C} />
          <span style={{ fontSize: 11.5, fontWeight: 700, color: T.text }}>
            {prog.rating ? parseFloat(prog.rating).toFixed(1) : '—'}
          </span>
          <span style={{ fontSize: 11, color: T.text4 }}>({reviewK} ulasan)</span>
        </div>

        <div style={{
          fontSize: 12, color: T.text3, lineHeight: 1.6,
          marginBottom: 12, flex: 1,
          display: '-webkit-box', WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {prog.description}
        </div>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
          {prog.video_count > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 3, background: T.bg3, borderRadius: 6, padding: '3px 8px', fontSize: 10.5, color: T.text3 }}>
              <PlayCircle size={10} color={C.orange} /> {prog.video_count} Video
            </div>
          )}
          {prog.pdf_count > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 3, background: T.bg3, borderRadius: 6, padding: '3px 8px', fontSize: 10.5, color: T.text3 }}>
              <FileText size={10} color={C.orange} /> {prog.pdf_count} PDF
            </div>
          )}
          {prog.tryout_count > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 3, background: T.bg3, borderRadius: 6, padding: '3px 8px', fontSize: 10.5, color: T.text3 }}>
              <ClipboardCheck size={10} color={C.orange} /> {prog.tryout_count} TO
            </div>
          )}
          {prog.duration_months > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 3, background: T.bg3, borderRadius: 6, padding: '3px 8px', fontSize: 10.5, color: T.text3 }}>
              <Clock size={10} color={C.orange} /> {prog.duration_months} Bln
            </div>
          )}
        </div>

        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: 8,
          paddingTop: 12, borderTop: `1px solid ${T.border}`,
          marginTop: 'auto',
        }}>
          <div style={{ minWidth: 0 }}>
            {isFree ? (
              <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 16, color: C.green }}>Gratis</span>
            ) : (
              <>
                <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 17, color: C.orange }}>
                  {formatIDR(prog.price)}
                </span>
                <span style={{ fontSize: 10.5, color: T.text4, marginLeft: 3 }}>/bln</span>
              </>
            )}
          </div>

          {prog.is_enrolled ? (
            <div style={{
              background: C.green + '18', color: C.green,
              fontSize: 11, fontWeight: 700,
              padding: '7px 14px', borderRadius: 8,
              border: `1.5px solid ${C.green}40`,
              whiteSpace: 'nowrap',
            }}>
              ✓ Dimiliki
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
              <button
                onClick={e => { e.stopPropagation(); onAddToCart(prog); }}
                style={{
                  width: 34, height: 34,
                  background: T.bg3,
                  color: T.text4,
                  border: `1.5px solid ${T.border}`,
                  borderRadius: 8,
                  fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}
                title="Tambah ke Keranjang"
                onMouseEnter={e => { e.currentTarget.style.background = C.orange + '18'; e.currentTarget.style.borderColor = C.orange; e.currentTarget.style.color = C.orange; }}
                onMouseLeave={e => { e.currentTarget.style.background = T.bg3; e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.text4; }}
              >
                <ShoppingCart size={13} />
              </button>
              <button
                onClick={e => { e.stopPropagation(); onSelect(prog); }}
                style={{
                  padding: '7px 18px',
                  background: C.orange,
                  color: T.bg,
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 12, fontWeight: 800, cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', gap: 4,
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
              >
                Daftar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatsBar({ programs, T, C }) {
  const total = programs.length;
  const enrolled = programs.filter(p => p.is_enrolled).length;
  const avgRating = programs.length
    ? (programs.reduce((s, p) => s + (parseFloat(p.rating) || 0), 0) / programs.length).toFixed(1)
    : '—';

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 28 }}>
      {[
        { label: 'Total Program', value: total, icon: BookOpen, color: C.orange },
        { label: 'Dimiliki', value: enrolled, icon: Zap, color: C.green },
        { label: 'Rata-rata Rating', value: avgRating, icon: Star, color: C.orange },
      ].map((s, i) => (
        <div key={i} style={{
          background: T.bg2, border: `1px solid ${T.border}`,
          borderRadius: 14, padding: '16px 20px',
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: s.color + '15',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <s.icon size={18} color={s.color} />
          </div>
          <div>
            <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 20, color: T.text, lineHeight: 1 }}>
              {s.value}
            </div>
            <div style={{ fontSize: 11, color: T.text4, marginTop: 3 }}>{s.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ProgramPage() {
  const { T, C } = useTheme();
  const { user } = useAuthStore();
  const addItem = useCartStore(s => s.addItem);
  const navigate = useNavigate();

  const [programs, setPrograms] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [allPrograms, cats] = await Promise.all([
          programsApi.getAll().catch(() => []),
          programsApi.getCategories().catch(() => []),
        ]);
        setCategories(cats);
        const enrolledPrograms = await programsApi.getEnrolled().catch(() => []);
        const enrolledIds = Array.isArray(enrolledPrograms) ? enrolledPrograms.map(p => p.id) : [];

        const progs = (allPrograms || []).map(p => ({
          ...p,
          price: Number(p.price),
          icon: p.icon || CATEGORY_META[p.category]?.icon || '📖',
          bg_gradient: p.bg_gradient || '',
          category_slug: p.category || '',
          is_enrolled: enrolledIds.includes(p.id),
        }));

        setPrograms(progs);
        setFiltered(progs);
      } catch (err) {
        toast.error('Gagal memuat program');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    let result = [...programs];
    if (activeFilter !== 'all') {
      result = result.filter(p => p.category_slug === activeFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [activeFilter, searchQuery, programs]);

  const handleSelectProgram = (prog) => {
    navigate('/payment', { state: { selectedProgramId: prog.id } });
  };

  const handleAddToCart = (prog) => {
    addItem({ id: prog.id, name: prog.name, price: prog.price, icon: prog.icon });
    toast.success(`${prog.name} ditambahkan ke keranjang`);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', color: T.text }}>
        <Loader2 size={28} style={{ animation: 'spin 1s linear infinite', marginRight: 10 }} />
        <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>Memuat Program...</span>
        <style>{'@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }'}</style>
      </div>
    );
  }

  return (
    <>
      <SEO title="Program Belajar" description="Pilih program belajar sesuai kebutuhanmu" url="/program" noindex />
      <div style={{ width: '100%' }}>

        {/* Hero Header */}
        <div style={{
          background: `linear-gradient(135deg, ${C.orange}15, ${C.orange}05)`,
          border: `1px solid ${C.orange}20`,
          borderRadius: 20, padding: '32px 36px',
          marginBottom: 28,
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8,
              }}>
                <GraduationCap size={24} color={C.orange} />
                <h1 style={{
                  fontFamily: 'Syne, sans-serif', fontSize: 24, fontWeight: 800,
                  color: T.text, margin: 0,
                }}>
                  Program Bimbel
                </h1>
              </div>
              <p style={{ fontSize: 13.5, color: T.text3, maxWidth: 480, margin: 0, lineHeight: 1.6 }}>
                Pilih program belajar sesuai tujuanmu. Akses video, PDF, tryout, dan live class.
              </p>
            </div>
            {user && (
              <div style={{
                background: T.bg2, border: `1px solid ${T.border}`,
                borderRadius: 12, padding: '12px 18px',
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <Sparkles size={16} color={C.orange} />
                <div>
                  <div style={{ fontSize: 11, color: T.text4 }}>Saldo Poin</div>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 15, color: T.text }}>
                    {user.reward_points || 0}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <StatsBar programs={programs} T={T} C={C} />

        {/* Search + Filter */}
        <div style={{
          display: 'flex', gap: 12, marginBottom: 20,
          flexWrap: 'wrap', alignItems: 'center',
        }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200, maxWidth: 320 }}>
            <Search size={14} color={T.text4}
              style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text" placeholder="Cari program..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%', padding: '10px 14px 10px 34px',
                background: T.bg2, border: `1px solid ${T.border}`,
                borderRadius: 10, color: T.text,
                fontSize: 13, fontFamily: 'inherit',
                outline: 'none', boxSizing: 'border-box',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => e.currentTarget.style.borderColor = C.orange}
              onBlur={e => e.currentTarget.style.borderColor = T.border}
            />
          </div>

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            <Filter size={14} color={T.text4} style={{ marginRight: 2 }} />
            {[{ id: 'all', label: 'Semua', icon: '🏆' }, ...categories.map(c => ({ id: c, ...CATEGORY_META[c] }))].map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveFilter(cat.id)}
                style={{
                  padding: '7px 14px',
                  background: activeFilter === cat.id ? C.orange : T.bg2,
                  border: `1px solid ${activeFilter === cat.id ? C.orange : T.border}`,
                  color: activeFilter === cat.id ? T.bg : T.text3,
                  borderRadius: 20, fontSize: 12, fontWeight: 600,
                  cursor: 'pointer', transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', gap: 4,
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => {
                  if (activeFilter !== cat.id) {
                    e.currentTarget.style.borderColor = T.border2;
                    e.currentTarget.style.color = T.text2;
                  }
                }}
                onMouseLeave={e => {
                  if (activeFilter !== cat.id) {
                    e.currentTarget.style.borderColor = T.border;
                    e.currentTarget.style.color = T.text3;
                  }
                }}
              >
                <span>{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{
          fontSize: 12, color: T.text4, marginBottom: 18,
          paddingBottom: 14, borderBottom: `1px solid ${T.border}`,
        }}>
          Menampilkan <strong style={{ color: T.text }}>{filtered.length}</strong> program
          {searchQuery && ` untuk "${searchQuery}"`}
          {activeFilter !== 'all' && ` • ${CATEGORY_META[activeFilter]?.label || activeFilter}`}
        </div>

        {filtered.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
            gap: 22,
          }}>
            {filtered.map(prog => (
              <ProgramCard
                key={prog.id}
                prog={prog}
                T={T} C={C}
                onSelect={handleSelectProgram}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: 'center', padding: '80px 20px',
            color: T.text3,
          }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: T.bg2, border: `1px solid ${T.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <Search size={32} color={T.text4} />
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6, color: T.text }}>
              Program tidak ditemukan
            </div>
            <div style={{ fontSize: 13, color: T.text4, marginBottom: 20 }}>
              Coba kata kunci lain atau pilih kategori berbeda
            </div>
            <button
              onClick={() => { setSearchQuery(''); setActiveFilter('all'); }}
              style={{
                background: C.orange, color: T.bg, border: 'none',
                borderRadius: 10, padding: '10px 24px',
                fontSize: 13, fontWeight: 700, cursor: 'pointer',
              }}
            >
              Reset Filter
            </button>
          </div>
        )}

        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to   { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </>
  );
}
