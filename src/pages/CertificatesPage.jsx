import { useEffect, useState, useCallback } from 'react';
import SEO from '@/components/SEO';
import { Award, Download, Calendar, CheckCircle, Lock, ArrowLeft, Share2 } from 'lucide-react';
import useResponsive from '@/hooks/useResponsive';
import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/store/authStore';
import { certificatesApi } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import PageSkeleton from '@/components/PageSkeleton';

const downloadPDF = async (cert, userName) => {
  try {
    const { default: jsPDF } = await import('jspdf');
    const doc = new jsPDF({ orientation:'landscape', unit:'mm', format:'a4' });
    const pw = 297, ph = 210;

    // Border
    doc.setDrawColor('#FF6B00');
    doc.setLineWidth(2);
    doc.rect(10, 10, pw-20, ph-20);
    doc.setLineWidth(0.5);
    doc.rect(13, 13, pw-26, ph-26);

    // Title
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor('#FF6B00');
    doc.text('SERTIFIKAT KELULUSAN', pw/2, 52, { align:'center' });

    // Subtitle
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor('#666');
    doc.text('Diberikan kepada', pw/2, 68, { align:'center' });

    // Name
    doc.setFontSize(26);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor('#111');
    doc.text(userName || 'Peserta', pw/2, 88, { align:'center' });

    // Description
    doc.setFontSize(13);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor('#444');
    doc.text(`Telah menyelesaikan seluruh materi program`, pw/2, 108, { align:'center' });
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor('#FF6B00');
    doc.text(cert.program_name || 'Program Bimbel', pw/2, 124, { align:'center' });

    // Date
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor('#888');
    doc.text(`Diterbitkan: ${cert.issued_at ? new Date(cert.issued_at).toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' }) : '-'}`, pw/2, 150, { align:'center' });

    // Footer
    doc.setFontSize(9);
    doc.setTextColor('#aaa');
    doc.text('Kuarta Bimbel — kuarta.app', pw/2, 185, { align:'center' });

    doc.save(`sertifikat_${cert.program_name?.replace(/\s+/g,'_') || 'kelulusan'}.pdf`);
    toast.success('Sertifikat diunduh');
  } catch (e) {
    toast.error('Gagal mengunduh PDF');
    console.error(e);
  }
};

export default function CertificatesPage() {
  const { T, C } = useTheme();
  const resp = useResponsive();
  const { user } = useAuthStore();
  const [downloading, setDownloading] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await certificatesApi.getMyCertificates();
        setCertificates(Array.isArray(data) ? data : []);
      } catch (e) { setCertificates([]); }
      setLoading(false);
    })();
  }, []);

  return (
    <div style={{ width: '100%' }}>
      <SEO title="Sertifikat" description="Sertifikat kelulusan tryout dan program belajar" url="/sertifikat" noindex />
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: resp.isMobile ? 20 : 24, fontWeight: 800, color: T.text, marginBottom: 4 }}>
          Sertifikat Saya
        </h1>
        <p style={{ fontSize: resp.isMobile ? 12 : 13, color: T.text3 }}>
          Selesaikan semua materi untuk mendapatkan sertifikat kelulusan
        </p>
      </div>

      {loading ? (
        <PageSkeleton type="grid" rows={3} />
      ) : certificates.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', maxWidth: 400, margin: '0 auto' }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: C.orange + '18', border: `2px solid ${C.orange}30`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 36, margin: '0 auto 16px',
          }}>
            <Award size={36} color={C.orange} />
          </div>
          <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 16, color: T.text, marginBottom: 8 }}>
            Belum Ada Sertifikat
          </h3>
          <p style={{ fontSize: 13, color: T.text3, lineHeight: 1.6, marginBottom: 20 }}>
            Selesaikan semua pelajaran dalam suatu program untuk mendapatkan sertifikat kelulusan dari Kuarta.
          </p>
          <div style={{
            background: T.bg3, border: `1px solid ${T.border}`, borderRadius: 12, padding: 16,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <Lock size={14} color={C.orange} />
              <span style={{ fontSize: 12.5, fontWeight: 600, color: T.text }}>Cara mendapatkan sertifikat:</span>
            </div>
            <ol style={{ fontSize: 12, color: T.text3, lineHeight: 2, margin: 0, paddingLeft: 20 }}>
              <li>Daftar program bimbel pilihanmu</li>
              <li>Selesaikan semua modul dan pelajaran</li>
              <li>Sertifikat akan muncul otomatis di halaman ini</li>
            </ol>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {certificates.map(cert => (
            <div key={cert.id} style={{
              background: `linear-gradient(135deg, ${T.bg2}, ${T.bg3})`,
              border: `1.5px solid ${C.orange}40`,
              borderRadius: 16, overflow: 'hidden',
              position: 'relative',
            }}>
              <div style={{
                height: 6,
                background: `linear-gradient(90deg, ${C.orange}, ${C.orange}88, ${C.orange})`,
              }} />
              <div style={{ padding: 24, textAlign: 'center' }}>
                <div style={{
                  width: 64, height: 64, borderRadius: '50%',
                  background: C.orange + '18',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 14px',
                }}>
                  <Award size={32} color={C.orange} />
                </div>

                <div style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800,
                  fontSize: 13, color: C.orange, marginBottom: 4,
                  textTransform: 'uppercase', letterSpacing: '0.1em',
                }}>
                  Sertifikat Kelulusan
                </div>

                <h3 style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800,
                  fontSize: 18, color: T.text, marginBottom: 8,
                }}>
                  {cert.program_name}
                </h3>

                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: 6, fontSize: 12, color: T.text4, marginBottom: 16,
                }}>
                  <Calendar size={12} />
                  Diterbitkan: {formatDate(cert.issued_at)}
                </div>

                <div style={{
                  background: T.bg3, borderRadius: 10,
                  padding: 12, marginBottom: 16,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}>
                  <CheckCircle size={14} color={C.green} />
                  <span style={{ fontSize: 12.5, color: T.text2 }}>Telah menyelesaikan seluruh materi</span>
                </div>

                <div style={{
                  fontSize: 11, color: T.text4, marginBottom: 16,
                  fontStyle: 'italic',
                }}>
                  Diberikan kepada:<br />
                  <span style={{ fontWeight: 700, fontSize: 13, color: T.text }}>{user?.name}</span>
                </div>

                <div style={{
                  display: 'flex', gap: 8, justifyContent: 'center',
                }}>
                  <button
                    onClick={() => { setDownloading(cert.id); downloadPDF(cert, user?.name).finally(() => setDownloading(null)); }}
                    disabled={downloading === cert.id}
                    style={{
                      background: C.orange, color: '#070709', border: 'none',
                      borderRadius: 8, padding: '9px 18px', fontSize: 12.5,
                      fontWeight: 700, cursor: downloading === cert.id ? 'wait' : 'pointer',
                      display: 'flex', alignItems: 'center', gap: 6,
                      opacity: downloading === cert.id ? .7 : 1,
                    }}
                  >
                    <Download size={13} /> {downloading === cert.id ? 'Mengunduh...' : 'Unduh PDF'}
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(window.location.origin + '/certificate/' + cert.id);
                      toast.success('Link sertifikat disalin');
                    }}
                    style={{
                      background: T.bg4, color: T.text3, border: `1px solid ${T.border}`,
                      borderRadius: 8, padding: '9px 14px', fontSize: 12.5,
                      fontWeight: 600, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 6,
                    }}
                  >
                    <Share2 size={13} /> Bagikan
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
