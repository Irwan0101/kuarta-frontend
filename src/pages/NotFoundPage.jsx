import { Link } from 'react-router-dom';
import SEO from '@/components/SEO';

export default function NotFoundPage() {
  return (
    <>
      <SEO title="Halaman Tidak Ditemukan" url="*" noindex />
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', background: '#0A0A0F', color: '#E8E8F0',
      fontFamily: "'Plus Jakarta Sans', sans-serif", padding: 40, textAlign: 'center',
    }}>
      <div style={{ fontSize: 80, marginBottom: 16, fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, background: 'linear-gradient(135deg, #FF6B00, #FF8C00)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        404
      </div>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        Halaman Tidak Ditemukan
      </h1>
      <p style={{ fontSize: 14, color: '#9999B3', maxWidth: 400, marginBottom: 24 }}>
        Halaman yang kamu cari tidak ada atau telah dipindahkan.
      </p>
      <Link to="/"
        style={{
          background: 'linear-gradient(135deg, #FF6B00, #FF8C00)', color: 'white',
          border: 'none', padding: '12px 28px', borderRadius: 12, fontWeight: 700,
          fontSize: 14, cursor: 'pointer', textDecoration: 'none',
        }}
      >
        Kembali ke Beranda
      </Link>
    </div>
    </>
  );
}
