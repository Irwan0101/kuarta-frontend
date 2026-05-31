// src/pages/ProgramPage.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlayCircle, FileText, Clock, Star, Users,
  Mic, Medal, ClipboardCheck, ChevronRight,
  Search, SlidersHorizontal, BookOpen, Zap,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/store/authStore';
import { programsApi } from '@/lib/api';
import { formatIDR } from '@/lib/utils';

/* ── Category Filter Config ─────────────────────────────────────── */
const CATEGORIES = [
  { id: 'all',        label: 'Semua Program',   icon: '🏆' },
  { id: 'sekolah',    label: 'SD / SMP / SMA',  icon: '📚' },
  { id: 'universitas',label: 'Masuk PTN',        icon: '🎯' },
  { id: 'cpns',       label: 'CPNS / ASN',       icon: '🏛️' },
  { id: 'karier',     label: 'Karier & Skills',  icon: '💼' },
];

/* ── Helper: program icon by slug ───────────────────────────────── */
const getProgramIcon = (slug = '') => {
  if (slug.includes('sd'))                       return '📗';
  if (slug.includes('smp'))                      return '📘';
  if (slug.includes('sma'))                      return '📙';
  if (slug.includes('osn'))                      return '🏆';
  if (slug.includes('utbk') || slug.includes('snbt')) return '🎯';
  if (slug.includes('cpns') || slug.includes('kedinasan')) return '🏛️';
  if (slug.includes('karier'))                   return '💼';
  if (slug.includes('english'))                  return '🌐';
  return '📖';
};

const getProgramCategory = (slug = '') => {
  if (slug.includes('sd'))                       return 'sekolah';
  if (slug.includes('smp'))                      return 'sekolah';
  if (slug.includes('sma'))                      return 'sekolah';
  if (slug.includes('osn'))                      return 'sekolah';
  if (slug.includes('utbk') || slug.includes('snbt')) return 'universitas';
  if (slug.includes('cpns') || slug.includes('kedinasan')) return 'cpns';
  if (slug.includes('karier') || slug.includes('english')) return 'karier';
  return 'all';
};

const getProgramGradient = (slug = '') => {
  if (slug.includes('sd'))       return 'linear-gradient(135deg, #1e3a5f, #0f2027)';
  if (slug.includes('smp'))      return 'linear-gradient(135deg, #1a2a4a, #0a1628)';
  if (slug.includes('sma'))      return 'linear-gradient(135deg, #1f1535, #0e0a1f)';
  if (slug.includes('utbk'))     return 'linear-gradient(135deg, #3b1f1f, #1f0f0f)';
  if (slug.includes('cpns'))     return 'linear-gradient(135deg, #1a2a4a, #0d1a30)';
  if (slug.includes('karier'))   return 'linear-gradient(135deg, #0f2e2e, #061a1a)';
  if (slug.includes('english'))  return 'linear-gradient(135deg, #1a2a1a, #0a1a0a)';
  if (slug.includes('osn'))      return 'linear-gradient(135deg, #2a1a3a, #1a0f2a)';
  return 'linear-gradient(135deg, #1a1a2e, #0f0f1a)';
};

/* ── Mock fallback programs (shown when API fails / dev) ─────────── */
const MOCK_PROGRAMS = [
  {
    id: 'mock-1', name: 'Bimbel SD', slug: 'bimbel-sd', price: 350000,
    rating: 4.8, review_count: 1200, duration_months: 3,
    video_count: 80, pdf_count: 40, badge: 'Populer', badge_type: 'popular',
    description: 'Program belajar dasar untuk siswa SD dengan materi lengkap dan metode modern berbasis kurikulum Merdeka.',
    category_label: 'Sekolah Dasar',
  },
  {
    id: 'mock-2', name: 'Bimbel SMP', slug: 'bimbel-smp', price: 450000,
    rating: 4.9, review_count: 876, duration_months: 4,
    video_count: 120, pdf_count: 60, badge: 'Baru', badge_type: 'new',
    description: 'Persiapan ujian dan pembelajaran SMP dengan kelas interaktif dan bank soal terlengkap.',
    category_label: 'Sekolah Menengah Pertama',
  },
  {
    id: 'mock-3', name: 'Bimbel SMA', slug: 'bimbel-sma', price: 550000,
    rating: 4.9, review_count: 2100, duration_months: 6,
    video_count: 200, pdf_count: 90, badge: null,
    description: 'Materi SMA lengkap untuk semua jurusan dengan fokus nilai dan persiapan SBMPTN.',
    category_label: 'Sekolah Menengah Atas',
  },
  {
    id: 'mock-4', name: 'UTBK — SNBT', slug: 'utbk-snbt', price: 850000,
    rating: 5.0, review_count: 3400, duration_months: 6,
    video_count: 180, tryout_count: 50, badge: 'Hot', badge_type: 'hot',
    description: 'Program intensif UTBK dengan tryout CAT dan strategi masuk PTN terbaik. Garansi nilai meningkat.',
    category_label: 'Masuk Perguruan Tinggi',
  },
  {
    id: 'mock-5', name: 'SKD CPNS — Kedinasan', slug: 'skd-cpns-kedinasan', price: 900000,
    rating: 5.0, review_count: 5200, duration_months: 3,
    video_count: 150, tryout_count: 30, badge: 'Terlaris', badge_type: 'popular',
    description: 'Persiapan SKD CPNS dan kedinasan dengan materi terbaru, latihan soal resmi, dan simulasi CAT BKN.',
    category_label: 'CPNS / ASN', is_enrolled: true,
  },
  {
    id: 'mock-6', name: 'Persiapan Karier', slug: 'persiapan-karier', price: 300000,
    rating: 4.6, review_count: 654, duration_months: 2,
    video_count: 90, has_mentoring: true, badge: null,
    description: 'Program karier untuk melatih soft skill, personal branding, dan persiapan interview kerja profesional.',
    category_label: 'Pengembangan Karier',
  },
  {
    id: 'mock-7', name: 'English Master', slug: 'english-master', price: 500000,
    rating: 4.7, review_count: 890, duration_months: 4,
    video_count: 110, has_speaking: true, badge: 'Baru', badge_type: 'new',
    description: 'Kursus bahasa Inggris intensif untuk kemampuan speaking, writing, dan listening. Persiapan TOEFL/IELTS.',
    category_label: 'Bahasa', is_enrolled: true,
  },
  {
    id: 'mock-8', name: 'Persiapan OSN', slug: 'persiapan-osn', price: 600000,
    rating: 5.0, review_count: 432, duration_months: 6,
    video_count: 160, badge: 'Prestisius', badge_type: 'hot',
    description: 'Bimbel OSN untuk siswa berprestasi, lengkap dengan materi tingkat kompetisi nasional dan internasional.',
    category_label: 'Olimpiade',
  },
];

/* ── Badge Component ─────────────────────────────────────────────── */
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
      position: 'absolute',
      top: 12, right: 12,
      background: c.bg,
      color: c.color,
      fontSize: 10,
      fontWeight: 800,
      padding: '4px 10px',
      borderRadius: 20,
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
      zIndex: 2,
    }}>
      {badge}
    </div>
  );
}

/* ── Star Rating ─────────────────────────────────────────────────── */
function Stars({ rating, C }) {
  const r     = parseFloat(rating) || 0;
  const full  = Math.floor(r);
  const half  = r % 1 >= 0.5;
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

/* ── Program Card ────────────────────────────────────────────────── */
function ProgramCard({ prog, T, C, onSelect }) {
  const [hovered, setHovered] = useState(false);
  const icon     = prog.icon || getProgramIcon(prog.slug);
  const gradient = prog.gradient || getProgramGradient(prog.slug);
  const reviewK  = prog.review_count >= 1000
    ? (prog.review_count / 1000).toFixed(1) + 'k'
    : prog.review_count;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: T.bg2,
        border: `1.5px solid ${hovered ? C.orange + '70' : T.border}`,
        borderRadius: 16,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.25s',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hovered ? `0 12px 32px ${C.orange}18` : 'none',
        cursor: 'pointer',
      }}
      onClick={() => onSelect(prog)}
    >
      {/* Thumbnail */}
      <div style={{
        background: gradient,
        height: 130,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 52,
        position: 'relative',
        flexShrink: 0,
      }}>
        {icon}
        <ProgramBadge badge={prog.badge} type={prog.badge_type} C={C} />
        {prog.is_enrolled && (
          <div style={{
            position: 'absolute',
            bottom: 10, left: 12,
            background: C.green + 'CC',
            color: '#fff',
            fontSize: 10,
            fontWeight: 700,
            padding: '3px 10px',
            borderRadius: 20,
          }}>
            ✓ Sudah Dimiliki
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: '16px 18px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Category */}
        <div style={{
          fontSize: 10.5,
          fontWeight: 700,
          color: C.orange,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: 5,
        }}>
          {prog.category_label || prog.category}
        </div>

        {/* Title */}
        <div style={{
          fontFamily: 'Syne, sans-serif',
          fontWeight: 800,
          fontSize: 15,
          color: T.text,
          marginBottom: 6,
          lineHeight: 1.3,
        }}>
          {prog.name}
        </div>

        {/* Rating */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          marginBottom: 8,
        }}>
          <Stars rating={prog.rating || 0} C={C} />
          <span style={{ fontSize: 11.5, fontWeight: 700, color: T.text }}>
            {prog.rating ? parseFloat(prog.rating).toFixed(1) : '—'}
          </span>
          <span style={{ fontSize: 11, color: T.text4 }}>
            ({reviewK} ulasan)
          </span>
        </div>

        {/* Description */}
        <div style={{
          fontSize: 12,
          color: T.text3,
          lineHeight: 1.6,
          marginBottom: 12,
          flex: 1,
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {prog.description}
        </div>

        {/* Meta Pills */}
        <div style={{
          display: 'flex',
          gap: 8,
          flexWrap: 'wrap',
          marginBottom: 14,
        }}>
          {prog.video_count && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 4,
              background: T.bg3, borderRadius: 6,
              padding: '4px 8px', fontSize: 11, color: T.text3,
            }}>
              <PlayCircle size={11} color={C.orange} />
              {prog.video_count} Video
            </div>
          )}
          {prog.pdf_count && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 4,
              background: T.bg3, borderRadius: 6,
              padding: '4px 8px', fontSize: 11, color: T.text3,
            }}>
              <FileText size={11} color={C.orange} />
              {prog.pdf_count} PDF
            </div>
          )}
          {prog.tryout_count && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 4,
              background: T.bg3, borderRadius: 6,
              padding: '4px 8px', fontSize: 11, color: T.text3,
            }}>
              <ClipboardCheck size={11} color={C.orange} />
              {prog.tryout_count} TO
            </div>
          )}
          {prog.has_mentoring && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 4,
              background: T.bg3, borderRadius: 6,
              padding: '4px 8px', fontSize: 11, color: T.text3,
            }}>
              <Users size={11} color={C.orange} />
              Mentoring
            </div>
          )}
          {prog.has_speaking && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 4,
              background: T.bg3, borderRadius: 6,
              padding: '4px 8px', fontSize: 11, color: T.text3,
            }}>
              <Mic size={11} color={C.orange} />
              Speaking
            </div>
          )}
          {prog.duration_months && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 4,
              background: T.bg3, borderRadius: 6,
              padding: '4px 8px', fontSize: 11, color: T.text3,
            }}>
              <Clock size={11} color={C.orange} />
              {prog.duration_months} Bulan
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: 12,
          borderTop: `1px solid ${T.border}`,
        }}>
          <div>
            <span style={{
              fontFamily: 'Syne, sans-serif',
              fontWeight: 800,
              fontSize: 16,
              color: C.orange,
            }}>
              {formatIDR(prog.price)}
            </span>
            <span style={{ fontSize: 11, color: T.text4, marginLeft: 4 }}>/bulan</span>
          </div>

          {prog.is_enrolled ? (
            <div style={{
              background: C.green + '18',
              color: C.green,
              fontSize: 11,
              fontWeight: 700,
              padding: '7px 14px',
              borderRadius: 8,
              border: `1.5px solid ${C.green}40`,
            }}>
              ✓ Dimiliki
            </div>
          ) : (
            <button
              onClick={e => { e.stopPropagation(); onSelect(prog); }}
              style={{
                background: hovered ? C.orange : 'transparent',
                color: hovered ? T.bg : C.orange,
                border: `1.5px solid ${C.orange}`,
                borderRadius: 8,
                padding: '7px 16px',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              Pilih <ChevronRight size={13} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Stats Bar ───────────────────────────────────────────────────── */
function StatsBar({ programs, T, C }) {
  const total    = programs.length;
  const enrolled = programs.filter(p => p.is_enrolled).length;
  const avgRating = programs.length
    ? (programs.reduce((s, p) => s + (parseFloat(p.rating) || 0), 0) / programs.length).toFixed(1)
    : '—';

  const stats = [
    { label: 'Total Program',    value: total,      icon: <BookOpen size={16} color={C.orange} /> },
    { label: 'Program Dimiliki', value: enrolled,    icon: <Zap size={16} color={C.green} /> },
    { label: 'Rata-rata Rating', value: avgRating,   icon: <Star size={16} color={C.orange} fill={C.orange} /> },
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: 14,
      marginBottom: 28,
    }}>
      {stats.map((s, i) => (
        <div key={i} style={{
          background: T.bg2,
          border: `1px solid ${T.border}`,
          borderRadius: 12,
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}>
          <div style={{
            width: 36, height: 36,
            background: T.bg3,
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {s.icon}
          </div>
          <div>
            <div style={{
              fontFamily: 'Syne, sans-serif',
              fontWeight: 800,
              fontSize: 20,
              color: T.text,
              lineHeight: 1,
            }}>
              {s.value}
            </div>
            <div style={{ fontSize: 11, color: T.text4, marginTop: 3 }}>
              {s.label}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Main Component ──────────────────────────────────────────────── */
export default function ProgramPage() {
  const { T, C } = useTheme();
  const { user } = useAuthStore();
  const navigate  = useNavigate();

  const [programs,     setPrograms]     = useState([]);
  const [filtered,     setFiltered]     = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery,  setSearchQuery]  = useState('');
  const [loading,      setLoading]      = useState(true);
  const [enrolled,     setEnrolled]     = useState([]);

  /* Fetch programs from API */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const allPrograms = await programsApi.getAll().catch(() => null);

        // getEnrolled may 404 if endpoint not yet implemented — fail silently
        const enrolledPrograms = await programsApi.getEnrolled().catch(() => []);

        let progs = allPrograms?.length ? allPrograms : MOCK_PROGRAMS;

        const enrolledIds = Array.isArray(enrolledPrograms)
          ? enrolledPrograms.map(p => p.id)
          : [];

        progs = progs.map(p => ({
          ...p,
          price:        Number(p.price),
          icon:         p.icon         || getProgramIcon(p.slug),
          gradient:     p.gradient     || getProgramGradient(p.slug),
          category_slug: p.category_slug || getProgramCategory(p.slug),
          is_enrolled:  enrolledIds.includes(p.id),
        }));

        setPrograms(progs);
        setFiltered(progs);
        setEnrolled(enrolledIds);
      } catch (err) {
        console.error('Gagal memuat program:', err);
        const fallback = MOCK_PROGRAMS.map(p => ({
          ...p,
          icon:         getProgramIcon(p.slug),
          gradient:     getProgramGradient(p.slug),
          category_slug: getProgramCategory(p.slug),
        }));
        setPrograms(fallback);
        setFiltered(fallback);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  /* Filter + Search */
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

  /* Loading state */
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '60vh',
        color: T.text,
      }}>
        <span style={{
          display: 'inline-block',
          animation: 'spin 1s linear infinite',
          fontSize: 28,
          marginRight: 10,
        }}>
          ⚙️
        </span>
        <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>
          Memuat Program...
        </span>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ width: '100%' }}>
      {/* Page Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{
          fontFamily: 'Syne, sans-serif',
          fontSize: 24,
          fontWeight: 800,
          color: T.text,
          marginBottom: 6,
        }}>
          Program Bimbel Unggulan
        </h1>
        <p style={{ fontSize: 13.5, color: T.text3 }}>
          Pilih program sesuai tujuanmu. Bayar mudah via Midtrans.
        </p>
      </div>

      {/* Stats Bar */}
      <StatsBar programs={programs} T={T} C={C} />

      {/* Search + Filter Row */}
      <div style={{
        display: 'flex',
        gap: 12,
        marginBottom: 20,
        flexWrap: 'wrap',
        alignItems: 'center',
      }}>
        {/* Search */}
        <div style={{
          position: 'relative',
          flex: 1,
          minWidth: 200,
          maxWidth: 340,
        }}>
          <Search
            size={14}
            color={T.text4}
            style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            placeholder="Cari program..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px 10px 34px',
              background: T.bg2,
              border: `1px solid ${T.border}`,
              borderRadius: 10,
              color: T.text,
              fontSize: 13,
              fontFamily: 'inherit',
              outline: 'none',
              boxSizing: 'border-box',
              transition: 'border-color 0.2s',
            }}
            onFocus={e => e.currentTarget.style.borderColor = C.orange}
            onBlur={e => e.currentTarget.style.borderColor = T.border}
          />
        </div>

        {/* Category Filter Tabs */}
        <div style={{
          display: 'flex',
          gap: 8,
          flexWrap: 'wrap',
          flex: 1,
        }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveFilter(cat.id)}
              style={{
                padding: '8px 16px',
                background: activeFilter === cat.id ? C.orange : T.bg2,
                border: `1px solid ${activeFilter === cat.id ? C.orange : T.border}`,
                color: activeFilter === cat.id ? T.bg : T.text3,
                borderRadius: 24,
                fontSize: 12.5,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
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

      {/* Result Count */}
      <div style={{
        fontSize: 12,
        color: T.text4,
        marginBottom: 18,
        paddingBottom: 14,
        borderBottom: `1px solid ${T.border}`,
      }}>
        Menampilkan <strong style={{ color: T.text }}>{filtered.length}</strong> program
        {searchQuery && ` untuk "${searchQuery}"`}
        {activeFilter !== 'all' && ` • ${CATEGORIES.find(c => c.id === activeFilter)?.label}`}
      </div>

      {/* Program Grid */}
      {filtered.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 20,
        }}>
          {filtered.map(prog => (
            <ProgramCard
              key={prog.id}
              prog={prog}
              T={T}
              C={C}
              onSelect={handleSelectProgram}
            />
          ))}
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: T.text3,
        }}>
          <div style={{ fontSize: 52, marginBottom: 12 }}>🔍</div>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6, color: T.text }}>
            Program tidak ditemukan
          </div>
          <div style={{ fontSize: 13, color: T.text4, marginBottom: 18 }}>
            Coba kata kunci lain atau pilih kategori berbeda
          </div>
          <button
            onClick={() => { setSearchQuery(''); setActiveFilter('all'); }}
            style={{
              background: C.orange,
              color: T.bg,
              border: 'none',
              borderRadius: 10,
              padding: '10px 24px',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Reset Filter
          </button>
        </div>
      )}

      {/* Spinner keyframe */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}