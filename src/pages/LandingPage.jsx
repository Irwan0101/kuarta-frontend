import { useState, useEffect, useRef } from "react";

const PROGRAMS = [
  { icon: "🏛️", cat: "CPNS", name: "SKD CPNS – Kedinasan", price: "900.000", videos: 150, tryouts: 30, months: 3, color: "#FF6B00", rating: 4.8 },
  { icon: "🎯", cat: "UNIVERSITAS", name: "UTBK – SNBT", price: "850.000", videos: 180, tryouts: 50, months: 6, color: "#3B82F6", rating: 4.8 },
  { icon: "📗", cat: "SEKOLAH", name: "Bimbel SD", price: "350.000", videos: 80, tryouts: 0, months: 3, color: "#22C55E", rating: 5.0 },
  { icon: "📘", cat: "SEKOLAH", name: "Bimbel SMA", price: "550.000", videos: 200, tryouts: 0, months: 6, color: "#8B5CF6", rating: 4.9 },
  { icon: "🏆", cat: "OLIMPIADE", name: "Persiapan OSN", price: "600.000", videos: 160, tryouts: 0, months: 6, color: "#F59E0B", rating: 5.0 },
  { icon: "💼", cat: "KARIER", name: "Persiapan Karier", price: "300.000", videos: 90, tryouts: 0, months: 2, color: "#EC4899", rating: 4.9 },
];

const STATS = [
  { value: "120K+", label: "Siswa Aktif" },
  { value: "4.9★", label: "Rating Platform" },
  { value: "98%", label: "Tingkat Lulus" },
  { value: "500+", label: "Materi & Video" },
];

const TESTIMONIALS = [
  { name: "Rizki Firmansyah", role: "Lulus CPNS Kemenkeu 2024", avatar: "RF", score: 478, text: "Berkat Kuarta saya lulus SKD dengan skor tertinggi di batch saya. Tryout-nya sangat mirip soal asli!" },
  { name: "Siti Rahayu", role: "Mahasiswa UI – Kedokteran", avatar: "SR", score: 820, text: "UTBK-ku naik 150 poin dalam 3 bulan. Live class-nya sangat membantu, mentornya sabar dan profesional." },
  { name: "Bagas Pratama", role: "Lulus IPDN 2024", avatar: "BP", score: 461, text: "Platform terbaik untuk persiapan kedinasan. Materinya lengkap, tryout-nya akurat, harganya sangat terjangkau." },
];

const FEATURES = [
  { icon: "📹", title: "Video HD Interaktif", desc: "Ratusan video berkualitas tinggi dari pengajar berpengalaman, bisa ditonton kapan saja." },
  { icon: "📝", title: "Tryout Mirip Asli", desc: "Simulasi tryout dengan soal yang diperbarui setiap bulan, sesuai kisi-kisi terbaru." },
  { icon: "🎥", title: "Live Class Rutin", desc: "Sesi belajar langsung bersama mentor setiap minggu, bisa tanya jawab real-time." },
  { icon: "📊", title: "Analitik Performa", desc: "Pantau perkembangan nilai dan identifikasi kelemahan dengan grafik yang detail." },
  { icon: "🏆", title: "Leaderboard Nasional", desc: "Bersaing dengan ribuan siswa dari seluruh Indonesia, motivasi diri setiap hari." },
  { icon: "📱", title: "Akses Multi-Device", desc: "Belajar dari HP, tablet, atau laptop — sinkronisasi otomatis di semua perangkat." },
];

const HERO_WORDS = ["Prestasi", "Masa Depan", "Impianmu", "Karirmu", "Nilai Terbaik"];

const NAV_ITEMS = [
  { label: "Program",   id: "programs"     },
  { label: "Fitur",     id: "features"     },
  { label: "Testimoni", id: "testimonials" },
  { label: "Harga",     id: "cta"          },
];

const WA_NUMBER = "6281234567890"; // Ganti dengan nomor WA aktif

const WA_TEMPLATES = [
  {
    icon: "🏛️",
    label: "Info Program CPNS",
    message: "Halo Kuarta! 👋\n\nSaya ingin mengetahui lebih lanjut tentang *Program SKD CPNS / Kedinasan*.\n\nBisa tolong jelaskan:\n- Jadwal live class\n- Jumlah tryout yang tersedia\n- Cara daftar dan pembayaran\n\nTerima kasih! 🙏",
  },
  {
    icon: "🎯",
    label: "Info Program UTBK",
    message: "Halo Kuarta! 👋\n\nSaya tertarik dengan *Program UTBK – SNBT*.\n\nBisa info:\n- Materi apa saja yang dicover\n- Berapa tryout per bulan\n- Apakah ada garansi lulus\n\nTerima kasih! 🙏",
  },
  {
    icon: "📗",
    label: "Info Bimbel SD/SMA",
    message: "Halo Kuarta! 👋\n\nSaya ingin tanya tentang *Program Bimbel SD / SMA*.\n\nAnak saya kelas berapa cocoknya?\nApa saja keunggulan program ini dibanding bimbel lain?\n\nTerima kasih! 🙏",
  },
  {
    icon: "🏆",
    label: "Info Program OSN",
    message: "Halo Kuarta! 👋\n\nSaya ingin bergabung di *Program Persiapan OSN (Olimpiade)*.\n\nBisa dijelaskan:\n- Mata pelajaran apa yang tersedia\n- Level persiapan (kab/kota, provinsi, nasional)\n- Harga dan cara daftar\n\nTerima kasih! 🙏",
  },
  {
    icon: "💰",
    label: "Tanya Harga & Promo",
    message: "Halo Kuarta! 👋\n\nSaya ingin tanya soal *harga dan promo* yang sedang tersedia.\n\nApakah ada:\n- Diskon untuk pendaftaran baru?\n- Paket bundling beberapa program?\n- Cicilan atau beasiswa?\n\nTerima kasih! 🙏",
  },
  {
    icon: "❓",
    label: "Pertanyaan Lainnya",
    message: "Halo Kuarta! 👋\n\nSaya ingin bertanya tentang platform Kuarta.\n\n",
  },
];

export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [visibleSections, setVisibleSections] = useState(new Set());
  const [darkMode, setDarkMode] = useState(true);
  const [wordIndex, setWordIndex] = useState(0);
  const [wordVisible, setWordVisible] = useState(true);
  const [letterIndex, setLetterIndex] = useState(0);
  const [waOpen, setWaOpen] = useState(false);
  const [waHovered, setWaHovered] = useState(false);
  const [activeNav, setActiveNav] = useState("");
  const heroRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) setVisibleSections((p) => new Set([...p, e.target.id]));
      }),
      { threshold: 0.1 }
    );
    document.querySelectorAll("[data-animate]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let timeout;
    if (wordVisible) {
      if (letterIndex < HERO_WORDS[wordIndex].length) {
        timeout = setTimeout(() => setLetterIndex(l => l + 1), 80);
      } else {
        timeout = setTimeout(() => setWordVisible(false), 1800);
      }
    } else {
      if (letterIndex > 0) {
        timeout = setTimeout(() => setLetterIndex(l => l - 1), 40);
      } else {
        setWordIndex(i => (i + 1) % HERO_WORDS.length);
        setWordVisible(true);
      }
    }
    return () => clearTimeout(timeout);
  }, [letterIndex, wordVisible, wordIndex]);

  // Scroll to section
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const offset = 68;
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: "smooth" });
  };

  // Track active nav based on scroll position
  useEffect(() => {
    const sectionIds = NAV_ITEMS.map(n => n.id);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveNav(e.target.id);
        });
      },
      { threshold: 0.3, rootMargin: "-68px 0px 0px 0px" }
    );
    sectionIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  // Close WA panel when clicking outside
  useEffect(() => {
    const handleClick = (e) => {
      if (!e.target.closest("#wa-widget")) setWaOpen(false);
    };
    if (waOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [waOpen]);

  const isVisible = (id) => visibleSections.has(id);

  const openWa = (message) => {
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${WA_NUMBER}?text=${encoded}`, "_blank");
  };

  const D = darkMode ? {
    bg: "#0A0A0F",
    bgCard: "#111118",
    bgCard2: "#0D0D14",
    border: "#1E1E2E",
    borderHover: "#FF6B0060",
    text: "#E8E8F0",
    text2: "#9999B3",
    text3: "#55557A",
    text4: "#33334A",
    navBg: "rgba(10,10,15,0.95)",
    statBg: "#111118",
    tagBg: "#FF6B0010",
    metaBg: "#1A1A28",
    inputBg: "#1A1A28",
    shadowCard: "0 24px 60px #00000060",
    waBg: "#111118",
    waBorder: "#1E1E2E",
    waItemBg: "#1A1A28",
    waItemHover: "#22223A",
  } : {
    bg: "#F5F4F0",
    bgCard: "#FFFFFF",
    bgCard2: "#F0EEE8",
    border: "#E2DED6",
    borderHover: "#FF6B0080",
    text: "#1A1410",
    text2: "#6B5E52",
    text3: "#9B8E82",
    text4: "#C8BDB5",
    navBg: "rgba(245,244,240,0.95)",
    statBg: "#FFFFFF",
    tagBg: "#FF6B0015",
    metaBg: "#F0EEE8",
    inputBg: "#F0EEE8",
    shadowCard: "0 24px 60px #00000015",
    waBg: "#FFFFFF",
    waBorder: "#E2DED6",
    waItemBg: "#F5F4F0",
    waItemHover: "#ECEAE4",
  };

  return (
    <div style={{
      background: D.bg,
      color: D.text,
      fontFamily: "'Outfit', sans-serif",
      minHeight: "100vh",
      overflowX: "hidden",
      transition: "background 0.4s, color 0.4s",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Clash+Display:wght@600;700&family=Outfit:wght@400;500;600;700;800&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }

        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #FF6B00; border-radius: 3px; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(40px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-12px); }
        }
        @keyframes pulse-ring {
          0%   { box-shadow: 0 0 0 0 #FF6B0060; }
          70%  { box-shadow: 0 0 0 8px transparent; }
          100% { box-shadow: 0 0 0 0 transparent; }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes orb-drift {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%       { transform: translate(30px, -20px) scale(1.05); }
          66%       { transform: translate(-20px, 15px) scale(0.95); }
        }
        @keyframes ticker {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes cursor-blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
        @keyframes badge-glow {
          0%, 100% { box-shadow: 0 0 0 0 #FF6B0040; }
          50%       { box-shadow: 0 0 20px 4px #FF6B0030; }
        }
        @keyframes wa-panel-in {
          from { opacity: 0; transform: translateY(16px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes wa-pulse {
          0%, 100% { box-shadow: 0 0 0 0 #25D36660; }
          50%       { box-shadow: 0 0 0 12px transparent; }
        }
        @keyframes wa-dot-bounce {
          0%, 80%, 100% { transform: scale(0); opacity: 0.5; }
          40% { transform: scale(1); opacity: 1; }
        }

        .nav-link {
          color: ${D.text2};
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          transition: color 0.2s;
          cursor: pointer;
        }
        .nav-link:hover { color: ${D.text}; }

        .btn-primary {
          background: linear-gradient(135deg, #FF6B00, #FF8C00);
          color: white;
          border: none;
          padding: 14px 28px;
          border-radius: 12px;
          font-family: 'Outfit', sans-serif;
          font-weight: 700;
          font-size: 15px;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.22,1,0.36,1);
          position: relative;
          overflow: hidden;
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 40px #FF6B0050;
          filter: brightness(1.1);
        }
        .btn-primary span { position: relative; z-index: 1; }

        .btn-outline {
          background: transparent;
          color: ${D.text};
          border: 1.5px solid ${D.border};
          padding: 13px 24px;
          border-radius: 12px;
          font-family: 'Outfit', sans-serif;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-outline:hover {
          border-color: #FF6B00;
          color: #FF6B00;
        }

        .program-card {
          background: ${D.bgCard};
          border: 1px solid ${D.border};
          border-radius: 18px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.22,1,0.36,1);
        }
        .program-card:hover {
          border-color: ${D.borderHover};
          transform: translateY(-6px);
          box-shadow: ${D.shadowCard};
        }

        .feature-card {
          background: ${D.bgCard};
          border: 1px solid ${D.border};
          border-radius: 16px;
          padding: 28px;
          transition: all 0.3s;
        }
        .feature-card:hover {
          border-color: #FF6B0040;
          transform: translateY(-4px);
          box-shadow: ${D.shadowCard};
        }

        .stat-item {
          text-align: center;
          padding: 0 32px;
          border-right: 1px solid ${D.border};
        }
        .stat-item:last-child { border-right: none; }

        .ticker-wrap { overflow: hidden; white-space: nowrap; }
        .ticker-inner {
          display: inline-flex;
          animation: ticker 22s linear infinite;
        }

        .glow-text {
          background: linear-gradient(135deg, #FF6B00, #FFB300, #FF4500, #FF6B00);
          background-size: 300% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }

        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          animation: orb-drift 10s ease-in-out infinite;
          pointer-events: none;
        }

        .section-enter {
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.8s cubic-bezier(0.22,1,0.36,1);
        }
        .section-enter.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .theme-toggle {
          width: 48px;
          height: 26px;
          border-radius: 13px;
          border: none;
          cursor: pointer;
          position: relative;
          transition: background 0.3s;
          flex-shrink: 0;
        }
        .toggle-knob {
          position: absolute;
          top: 3px;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: white;
          transition: all 0.3s cubic-bezier(0.22,1,0.36,1);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
        }

        .word-cursor {
          display: inline-block;
          width: 3px;
          height: 0.85em;
          background: #FF6B00;
          border-radius: 2px;
          margin-left: 3px;
          vertical-align: middle;
          animation: cursor-blink 1s step-end infinite;
        }

        @media (max-width: 768px) {
          .hero-model { display: none !important; }
          .hero-orb { display: none !important; }
          .hero-scroll { display: none !important; }
          .nav-links { display: none !important; }
          .stat-grid { display: grid !important; grid-template-columns: repeat(2, 1fr) !important; gap: 0 !important; }
          .stat-grid .stat-item { padding: 12px 16px !important; }
          .stat-grid .stat-item:nth-child(2) { border-right: none !important; }
          .testimonial-grid { grid-template-columns: 1fr !important; }
          .footer-links { flex-direction: column !important; align-items: center !important; gap: 12px !important; }
          .hero-btn { width: 100% !important; justify-content: center !important; }
          .program-header { height: 80px !important; }
          .program-card-body { padding: 14px 16px 18px !important; }
          .program-icon { font-size: 28px !important; }
          .feature-card { padding: 20px !important; }
          .feature-icon { width: 40px !important; height: 40px !important; font-size: 18px !important; }
          .testimonial-card { padding: 20px !important; }
          .wa-btn { width: 50px !important; height: 50px !important; }
          .wa-fab { bottom: 16px !important; right: 16px !important; }
          .wa-panel { width: min(320px, calc(100vw - 24px)) !important; }
          .btn-primary { padding: 10px 20px !important; }
          .btn-outline { padding: 10px 18px !important; }
          .nav-link { font-size: 12px !important; }
        }

        @media (min-width: 769px) and (max-width: 1024px) {
          .hero-model { width: min(35%, 400px) !important; }
          .testimonial-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .stat-grid .stat-item { padding: 0 24px !important; }
        }

        .hero-headline {
          font-family: 'Clash Display', 'Outfit', sans-serif;
          font-weight: 700;
          line-height: 1.05;
          letter-spacing: -0.03em;
        }

        /* ── WA Widget ── */
        .wa-fab {
          position: fixed;
          bottom: 28px;
          right: 28px;
          z-index: 999;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 12px;
        }

        .wa-btn {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, #25D366, #128C7E);
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 32px #25D36650;
          transition: all 0.3s cubic-bezier(0.22,1,0.36,1);
          animation: wa-pulse 2.5s ease-in-out infinite;
          position: relative;
          flex-shrink: 0;
        }
        .wa-btn:hover {
          transform: scale(1.1);
          box-shadow: 0 12px 40px #25D36660;
        }
        .wa-btn svg {
          width: 28px;
          height: 28px;
          fill: white;
          transition: transform 0.3s cubic-bezier(0.22,1,0.36,1);
        }
        .wa-btn.open svg {
          transform: rotate(45deg) scale(0.85);
        }

        .wa-badge {
          position: absolute;
          top: -3px;
          right: -3px;
          width: 18px;
          height: 18px;
          background: #FF6B00;
          border-radius: 50%;
          border: 2px solid white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 9px;
          font-weight: 800;
          color: white;
        }

        .wa-label-bubble {
          background: ${D.waBg};
          border: 1px solid ${D.waBorder};
          color: ${D.text};
          padding: 8px 14px;
          border-radius: 20px 20px 4px 20px;
          font-size: 13px;
          font-weight: 600;
          white-space: nowrap;
          box-shadow: 0 4px 20px #00000020;
          pointer-events: none;
          opacity: 0;
          transform: translateX(10px);
          transition: all 0.3s ease;
        }
        .wa-label-bubble.show {
          opacity: 1;
          transform: translateX(0);
        }

        .wa-panel {
          background: ${D.waBg};
          border: 1px solid ${D.waBorder};
          border-radius: 20px;
          width: 320px;
          max-height: calc(100vh - 120px);
          display: flex;
          flex-direction: column;
          box-shadow: 0 24px 80px #00000040;
          overflow: hidden;
          animation: wa-panel-in 0.3s cubic-bezier(0.22,1,0.36,1) forwards;
        }
        .wa-panel-body {
          overflow-y: auto;
          flex: 1;
        }
        .wa-panel-body::-webkit-scrollbar { width: 4px; }
        .wa-panel-body::-webkit-scrollbar-track { background: transparent; }
        .wa-panel-body::-webkit-scrollbar-thumb { background: #25D36640; border-radius: 2px; }

        .wa-panel-header {
          background: linear-gradient(135deg, #128C7E, #25D366);
          padding: 16px 20px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .wa-avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(255,255,255,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          flex-shrink: 0;
        }

        .wa-typing-dot {
          width: 6px;
          height: 6px;
          background: white;
          border-radius: 50%;
          display: inline-block;
          margin: 0 2px;
        }
        .wa-typing-dot:nth-child(1) { animation: wa-dot-bounce 1.4s ease-in-out 0s infinite; }
        .wa-typing-dot:nth-child(2) { animation: wa-dot-bounce 1.4s ease-in-out 0.2s infinite; }
        .wa-typing-dot:nth-child(3) { animation: wa-dot-bounce 1.4s ease-in-out 0.4s infinite; }

        .wa-template-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: ${D.waItemBg};
          border: 1px solid ${D.waBorder};
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
          width: 100%;
          font-family: 'Outfit', sans-serif;
        }
        .wa-template-item:hover {
          background: ${D.waItemHover};
          border-color: #25D36660;
          transform: translateX(4px);
        }

        .wa-chat-bubble {
          background: ${D.waItemBg};
          border-radius: 16px 16px 16px 4px;
          padding: 12px 14px;
          margin: 0 16px;
          border: 1px solid ${D.waBorder};
        }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        padding: "0 5%",
        background: scrollY > 50 ? D.navBg : "transparent",
        backdropFilter: scrollY > 50 ? "blur(20px)" : "none",
        borderBottom: scrollY > 50 ? `1px solid ${D.border}` : "1px solid transparent",
        transition: "all 0.3s",
        height: 68,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "linear-gradient(135deg, #FF6B00, #FF8C00)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "Clash Display, sans-serif", fontWeight: 700,
            fontSize: 17, color: "white", letterSpacing: "-0.02em",
          }}>K</div>
          <span style={{
            fontFamily: "Clash Display, sans-serif", fontWeight: 700, fontSize: 22,
            color: D.text, letterSpacing: "-0.03em",
          }}>Kuarta</span>
        </div>

        <div className="nav-links" style={{ display: "flex", gap: 36, alignItems: "center" }}>
          {NAV_ITEMS.map(({ label, id }) => {
            const isActive = activeNav === id;
            return (
              <a
                key={id}
                className="nav-link"
                onClick={() => scrollToSection(id)}
                style={{
                  color: isActive ? "#FF6B00" : D.text2,
                  position: "relative",
                  paddingBottom: 2,
                  fontWeight: isActive ? 700 : 500,
                  transition: "color 0.2s, font-weight 0.2s",
                }}
              >
                {label}
                <span style={{
                  position: "absolute",
                  bottom: -4,
                  left: 0,
                  right: 0,
                  height: 2,
                  borderRadius: 2,
                  background: "#FF6B00",
                  transform: isActive ? "scaleX(1)" : "scaleX(0)",
                  transition: "transform 0.3s cubic-bezier(0.22,1,0.36,1)",
                  transformOrigin: "left",
                }} />
              </a>
            );
          })}
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button
            className="theme-toggle"
            style={{ background: darkMode ? "#2A2A3A" : "#E2DED6" }}
            onClick={() => setDarkMode(d => !d)}
          >
            <div className="toggle-knob" style={{ left: darkMode ? 3 : 25 }}>
              {darkMode ? "🌙" : "☀️"}
            </div>
          </button>
          <button className="btn-outline" style={{ padding: "9px 20px", fontSize: 13 }} onClick={() => window.location.href = "/login"}>Masuk</button>
          <button className="btn-primary" style={{ padding: "9px 20px", fontSize: 13 }} onClick={() => window.location.href = "/register"}>
            <span>Daftar Gratis</span>
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section ref={heroRef} style={{
        minHeight: "100vh",
        display: "flex", alignItems: "center", justifyContent: "center",
        position: "relative", overflow: "hidden",
        padding: "120px 5% 80px",
        flexDirection: "column",
        textAlign: "center",
        }}>
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "url(/bg.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.06,
          pointerEvents: "none", zIndex: 0,
        }} />
        {darkMode && <>
          <div className="orb hero-orb" style={{ width: 700, height: 700, background: "#FF6B0012", top: -150, left: -250 }} />
          <div className="orb hero-orb" style={{ width: 500, height: 500, background: "#3B82F610", top: 150, right: -150, animationDelay: "4s" }} />
          <div className="orb hero-orb" style={{ width: 350, height: 350, background: "#FF8C0008", bottom: 0, left: "45%", animationDelay: "7s" }} />
        </>}

        <div style={{
          position: "absolute", inset: 0,
          opacity: darkMode ? 0.04 : 0.06,
          backgroundImage: `radial-gradient(circle, ${darkMode ? "#fff" : "#000"} 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
          pointerEvents: "none",
        }} />

        <div className="hero-model" style={{
          position: "absolute", right: 0, bottom: 0,
          width: "min(45%, 500px)", height: "85%",
          display: "flex", alignItems: "flex-end", justifyContent: "center",
          pointerEvents: "none", zIndex: 1,
          opacity: 0,
          animation: "fadeUp 0.8s cubic-bezier(0.22,1,0.36,1) 0.15s forwards",
        }}>
          <img src="/model.png" alt="" style={{
            width: "100%", height: "auto", objectFit: "contain",
            filter: "drop-shadow(0 20px 60px rgba(255,107,0,0.15))",
          }} />
        </div>

        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: D.tagBg,
          border: `1px solid #FF6B0030`,
          padding: "8px 18px", borderRadius: 99, marginBottom: 36,
          animation: "fadeIn 0.5s ease forwards, badge-glow 3s ease-in-out infinite",
        }}>
          <div style={{
            width: 7, height: 7, borderRadius: "50%", background: "#FF6B00",
            animation: "pulse-ring 2s infinite",
          }} />
          <span style={{ fontSize: 13, color: "#FF6B00", fontWeight: 600 }}>
            Platform Belajar #1 di Indonesia
          </span>
        </div>

        <h1
          className="hero-headline"
          style={{
            fontSize: "clamp(44px, 7.5vw, 94px)",
            marginBottom: 24,
            maxWidth: 960,
            opacity: 0,
            animation: "fadeUp 0.8s cubic-bezier(0.22,1,0.36,1) 0.2s forwards",
            color: D.text,
          }}
        >
          Raih{" "}
          <span className="glow-text">
            {HERO_WORDS[wordIndex].slice(0, letterIndex)}
          </span>
          <span className="word-cursor" />
          <br />
          <span style={{ color: D.text }}>Bersama </span>
          <span style={{
            fontFamily: "Clash Display, sans-serif",
            ...(darkMode ? {
              background: "linear-gradient(135deg, #E8E8F0, #9999B3)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            } : {
              color: "#1A1410",
            }),
          }}>Kuarta</span>
        </h1>

        <p style={{
          fontSize: "clamp(15px, 2vw, 18px)",
          color: D.text2,
          lineHeight: 1.8,
          maxWidth: 560,
          marginBottom: 44,
          opacity: 0,
          animation: "fadeUp 0.8s cubic-bezier(0.22,1,0.36,1) 0.4s forwards",
        }}>
          Platform belajar online lengkap untuk CPNS, UTBK, Olimpiade, dan lebih banyak lagi.
          Video HD, tryout akurat, dan live class bersama mentor terbaik.
        </p>

        <div style={{
          display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center",
          marginBottom: 64,
          opacity: 0,
          animation: "fadeUp 0.8s cubic-bezier(0.22,1,0.36,1) 0.55s forwards",
        }}>
          <button className="btn-primary hero-btn" style={{ fontSize: 16, padding: "16px 36px" }} onClick={() => window.location.href = "/register"}>
            <span>🚀 Mulai Belajar Gratis</span>
          </button>
          <button className="btn-outline hero-btn" style={{ fontSize: 15, padding: "15px 28px" }} onClick={() => scrollToSection("programs")}>
            Lihat Program →
          </button>
        </div>

        <div className="stat-grid" style={{
          display: "flex", gap: 0,
          background: D.statBg,
          border: `1px solid ${D.border}`,
          borderRadius: 20, padding: "24px 0",
          opacity: 0,
          animation: "fadeUp 0.8s cubic-bezier(0.22,1,0.36,1) 0.7s forwards",
          boxShadow: darkMode ? "none" : "0 4px 24px #00000010",
        }}>
          {STATS.map((s, i) => (
            <div key={i} className="stat-item">
              <div style={{
                fontFamily: "Clash Display, sans-serif", fontWeight: 700,
                fontSize: 28, color: D.text, marginBottom: 4,
              }}>{s.value}</div>
              <div style={{ fontSize: 12, color: D.text3, fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div className="hero-scroll" style={{
          position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
          opacity: scrollY > 50 ? 0 : 0.4, transition: "opacity 0.3s",
        }}>
          <div style={{ fontSize: 11, color: D.text3, letterSpacing: "0.12em" }}>SCROLL</div>
          <div style={{
            width: 24, height: 40, border: `2px solid ${D.border}`,
            borderRadius: 12, display: "flex", justifyContent: "center", padding: 4,
          }}>
            <div style={{
              width: 4, height: 8, background: "#FF6B00", borderRadius: 2,
              animation: "float 1.5s ease-in-out infinite",
            }} />
          </div>
        </div>
      </section>

      {/* ── TICKER ── */}
      <div style={{ background: "#FF6B00", padding: "13px 0", overflow: "hidden" }}>
        <div className="ticker-wrap">
          <div className="ticker-inner">
            {[...Array(2)].map((_, ri) => (
              <span key={ri}>
                {["CPNS 2025", "UTBK SNBT", "Olimpiade OSN", "Bimbel SD SMP SMA", "Persiapan Karier", "Live Class Rutin", "Tryout Akurat", "Kuarta"].map((t, i) => (
                  <span key={i} style={{ fontSize: 12, fontWeight: 700, color: "white", marginRight: 44, letterSpacing: "0.08em" }}>
                    ✦ {t}
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── PROGRAMS ── */}
      <section style={{ padding: "100px 5%", background: D.bg }} id="programs" data-animate>
        <div className={`section-enter ${isVisible("programs") ? "visible" : ""}`}
          style={{ textAlign: "center", marginBottom: 60 }}>
          <div style={{
            display: "inline-block", fontSize: 11, fontWeight: 700,
            color: "#FF6B00", letterSpacing: "0.14em",
            background: D.tagBg, padding: "6px 16px", borderRadius: 99, marginBottom: 16,
          }}>PROGRAM UNGGULAN</div>
          <h2 className="hero-headline" style={{
            fontSize: "clamp(30px, 5vw, 52px)", color: D.text,
          }}>
            Pilih Program<br />
            <span className="glow-text">Sesuai Tujuanmu</span>
          </h2>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 20,
        }}>
          {PROGRAMS.map((p, i) => (
            <div key={i}
              className={`program-card section-enter ${isVisible("programs") ? "visible" : ""}`}
              style={{ transitionDelay: `${i * 0.08}s` }}
            >
              <div className="program-header" style={{
                height: 110,
                background: `linear-gradient(135deg, ${p.color}22, ${p.color}06)`,
                borderBottom: `1px solid ${p.color}20`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 42, position: "relative", overflow: "hidden",
              }}>
                <div style={{
                  position: "absolute", width: 100, height: 100,
                  background: `radial-gradient(circle, ${p.color}18, transparent)`,
                  borderRadius: "50%",
                }} />
                <span className="program-icon" style={{ position: "relative", zIndex: 1, animation: "float 3s ease-in-out infinite", animationDelay: `${i * 0.3}s` }}>
                  {p.icon}
                </span>
              </div>
              <div className="program-card-body" style={{ padding: "18px 20px 20px" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: p.color, letterSpacing: "0.1em", marginBottom: 6 }}>{p.cat}</div>
                <h3 className="hero-headline" style={{ fontSize: 16, color: D.text, marginBottom: 6, lineHeight: 1.2 }}>{p.name}</h3>
                <div style={{ display: "flex", alignItems: "center", gap: 3, marginBottom: 14 }}>
                  {"★★★★★".split("").map((s, si) => (
                    <span key={si} style={{ color: "#F59E0B", fontSize: 12 }}>{s}</span>
                  ))}
                  <span style={{ fontSize: 11, color: D.text3, marginLeft: 4 }}>{p.rating}</span>
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
                  {[
                    { icon: "🎬", val: `${p.videos} Video` },
                    { icon: "📝", val: p.tryouts ? `${p.tryouts} TO` : null },
                    { icon: "📅", val: `${p.months} Bulan` },
                  ].filter(m => m.val).map((m, mi) => (
                    <span key={mi} style={{
                      fontSize: 11, color: D.text2,
                      background: D.metaBg, padding: "4px 10px",
                      borderRadius: 6, display: "flex", alignItems: "center", gap: 4,
                    }}>
                      {m.icon} {m.val}
                    </span>
                  ))}
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <span className="hero-headline" style={{ fontSize: 20, color: "#FF6B00" }}>Rp {p.price}</span>
                    <span style={{ fontSize: 11, color: D.text3 }}>/bulan</span>
                  </div>
                  <button className="btn-primary" style={{ padding: "9px 18px", fontSize: 13 }} onClick={() => window.location.href = "/register"}>
                    <span>Pilih →</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ padding: "80px 5%", background: D.bgCard2 }} id="features" data-animate>
        <div className={`section-enter ${isVisible("features") ? "visible" : ""}`}
          style={{ textAlign: "center", marginBottom: 60 }}>
          <div style={{
            fontSize: 11, fontWeight: 700, color: "#FF6B00", letterSpacing: "0.14em",
            background: D.tagBg, display: "inline-block", padding: "6px 16px", borderRadius: 99, marginBottom: 16,
          }}>MENGAPA KUARTA</div>
          <h2 className="hero-headline" style={{ fontSize: "clamp(28px, 4vw, 48px)", color: D.text }}>
            Semua yang Kamu Butuhkan<br />
            <span className="glow-text">Ada di Sini</span>
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
          {FEATURES.map((f, i) => (
            <div key={i}
              className={`feature-card section-enter ${isVisible("features") ? "visible" : ""}`}
              style={{ transitionDelay: `${i * 0.07}s` }}
            >
              <div className="feature-icon" style={{
                width: 48, height: 48, background: D.tagBg, borderRadius: 12,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 22, marginBottom: 16,
              }}>{f.icon}</div>
              <h3 className="hero-headline" style={{ fontSize: 16, color: D.text, marginBottom: 8 }}>{f.title}</h3>
              <p style={{ fontSize: 13, color: D.text3, lineHeight: 1.7 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ padding: "100px 5%", background: D.bg }} id="testimonials" data-animate>
        <div className={`section-enter ${isVisible("testimonials") ? "visible" : ""}`}
          style={{ textAlign: "center", marginBottom: 60 }}>
          <div style={{
            fontSize: 11, fontWeight: 700, color: "#FF6B00", letterSpacing: "0.14em",
            background: D.tagBg, display: "inline-block", padding: "6px 16px", borderRadius: 99, marginBottom: 16,
          }}>TESTIMONI</div>
          <h2 className="hero-headline" style={{ fontSize: "clamp(28px, 4vw, 48px)", color: D.text }}>
            Mereka Sudah <span className="glow-text">Membuktikannya</span>
          </h2>
        </div>
        <div className="testimonial-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, maxWidth: 960, margin: "0 auto" }}>
          {TESTIMONIALS.map((t, i) => (
            <div key={i}
              className={`testimonial-card section-enter ${isVisible("testimonials") ? "visible" : ""}`}
              style={{
                background: D.bgCard,
                border: `1px solid ${activeTestimonial === i ? "#FF6B0060" : D.border}`,
                borderRadius: 20, padding: 28,
                transition: "all 0.4s cubic-bezier(0.22,1,0.36,1)",
                transitionDelay: `${i * 0.1}s`,
                transform: activeTestimonial === i ? "translateY(-6px)" : "translateY(0)",
                boxShadow: activeTestimonial === i ? "0 20px 60px #FF6B0020" : "none",
                cursor: "pointer",
              }}
              onClick={() => setActiveTestimonial(i)}
            >
              <div style={{ fontSize: 28, marginBottom: 16, color: "#FF6B00" }}>"</div>
              <p style={{ fontSize: 14, color: D.text2, lineHeight: 1.7, marginBottom: 20 }}>{t.text}</p>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 42, height: 42, borderRadius: "50%",
                  background: "linear-gradient(135deg, #FF6B00, #FF8C00)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "Clash Display, sans-serif", fontWeight: 700, fontSize: 13, color: "white",
                }}>{t.avatar}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: D.text }}>{t.name}</div>
                  <div style={{ fontSize: 11, color: D.text3 }}>{t.role}</div>
                </div>
                <div style={{ marginLeft: "auto", textAlign: "right" }}>
                  <div className="hero-headline" style={{ fontSize: 18, color: "#FF6B00" }}>{t.score}</div>
                  <div style={{ fontSize: 10, color: D.text3 }}>Skor</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 28 }}>
          {TESTIMONIALS.map((_, i) => (
            <div key={i} onClick={() => setActiveTestimonial(i)} style={{
              width: activeTestimonial === i ? 24 : 8, height: 8, borderRadius: 4,
              background: activeTestimonial === i ? "#FF6B00" : D.border,
              transition: "all 0.3s", cursor: "pointer",
            }} />
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{
        padding: "80px 5%",
        background: darkMode
          ? "linear-gradient(135deg, #FF6B0012 0%, #0A0A0F 50%, #3B82F608 100%)"
          : "linear-gradient(135deg, #FF6B0008 0%, #F5F4F0 50%, #3B82F608 100%)",
        borderTop: `1px solid ${D.border}`,
        borderBottom: `1px solid ${D.border}`,
      }} id="cta" data-animate>
        <div className={`section-enter ${isVisible("cta") ? "visible" : ""}`}
          style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
          <div style={{
            width: 80, height: 80,
            background: "linear-gradient(135deg, #FF6B00, #FF8C00)",
            borderRadius: 24, margin: "0 auto 28px",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 36, boxShadow: "0 0 60px #FF6B0040",
            animation: "float 3s ease-in-out infinite",
          }}>🚀</div>
          <h2 className="hero-headline" style={{ fontSize: "clamp(30px, 5vw, 54px)", color: D.text, lineHeight: 1.1, marginBottom: 16 }}>
            Siap Meraih<br />
            <span className="glow-text">Mimpimu?</span>
          </h2>
          <p style={{ fontSize: 16, color: D.text2, lineHeight: 1.7, maxWidth: 480, margin: "0 auto 36px" }}>
            Bergabung dengan 120.000+ siswa yang sudah membuktikan. Daftar sekarang dan mulai belajar hari ini — gratis!
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button className="btn-primary" style={{ fontSize: 16, padding: "16px 40px" }} onClick={() => window.location.href = "/register"}>
              <span>✨ Daftar Sekarang — Gratis</span>
            </button>
            <button
              className="btn-outline"
              style={{ fontSize: 15, padding: "15px 28px", borderColor: "#25D366", color: "#25D366" }}
              onClick={() => setWaOpen(true)}
            >
              💬 Tanya via WhatsApp
            </button>
          </div>
          <div style={{ display: "flex", gap: 24, justifyContent: "center", marginTop: 28, flexWrap: "wrap" }}>
            {["✓ Tanpa kartu kredit", "✓ Akses instan", "✓ Bisa dibatalkan kapan saja"].map((t, i) => (
              <span key={i} style={{ fontSize: 13, color: D.text3 }}>{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ padding: "48px 5% 32px", borderTop: `1px solid ${D.border}`, background: D.bg }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: "linear-gradient(135deg, #FF6B00, #FF8C00)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "Clash Display, sans-serif", fontWeight: 700, fontSize: 15, color: "white",
            }}>K</div>
            <span style={{ fontFamily: "Clash Display, sans-serif", fontWeight: 700, color: D.text, fontSize: 18 }}>Kuarta</span>
          </div>

          <div className="footer-links" style={{ display: "flex", gap: 28 }}>
            {["Tentang", "Program", "Blog", "Kontak", "Privasi"].map(item => (
              <a key={item} className="nav-link" style={{ fontSize: 13, color: D.text2 }}>{item}</a>
            ))}
          </div>

          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 12, color: D.text3, marginBottom: 2 }}>
              © 2026 Kuarta. All rights reserved.
            </div>
            <div style={{
              fontSize: 11, color: D.text4,
              fontFamily: "Clash Display, sans-serif", letterSpacing: "0.06em",
            }}>
              A{" "}
              <span style={{ color: "#FF6B00", fontWeight: 700 }}>ONE PROJECT</span>
              {" "}2026
            </div>
          </div>
        </div>
      </footer>

      {/* ══════════════════════════════
          ── WA FLOATING WIDGET ──
      ══════════════════════════════ */}
      <div id="wa-widget" className="wa-fab">

        {/* Panel template pertanyaan */}
        {waOpen && (
          <div className="wa-panel">
            {/* Header */}
            <div className="wa-panel-header">
              <div className="wa-avatar">🎓</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: "white", fontFamily: "Clash Display, sans-serif" }}>
                  Kuarta Support
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                  <div style={{ width: 7, height: 7, background: "#A7F3D0", borderRadius: "50%" }} />
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.85)" }}>Online · Balas dalam menit</span>
                </div>
              </div>
              <button
                onClick={() => setWaOpen(false)}
                style={{
                  background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "50%",
                  width: 28, height: 28, cursor: "pointer", color: "white",
                  fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}
              >×</button>
            </div>

            {/* Scrollable body */}
            <div className="wa-panel-body">
              {/* Chat bubble greeting */}
              <div style={{ padding: "16px 16px 12px" }}>
                <div className="wa-chat-bubble">
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                    <span style={{ fontSize: 16 }}>👋</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: D.text }}>Halo! Ada yang bisa kami bantu?</span>
                  </div>
                  <p style={{ fontSize: 12, color: D.text2, lineHeight: 1.6, margin: 0 }}>
                    Pilih topik pertanyaanmu di bawah ini, kami siap membantu kamu menemukan program yang tepat!
                  </p>
                  <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 4 }}>
                    <span className="wa-typing-dot" />
                    <span className="wa-typing-dot" />
                    <span className="wa-typing-dot" />
                    <span style={{ fontSize: 10, color: D.text3, marginLeft: 4 }}>tim kami aktif sekarang</span>
                  </div>
                </div>
              </div>

              {/* Template list */}
              <div style={{ padding: "0 16px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: D.text3, letterSpacing: "0.08em", marginBottom: 4, paddingLeft: 2 }}>
                  PILIH TOPIK PERTANYAAN
                </div>
                {WA_TEMPLATES.map((tpl, i) => (
                  <button
                    key={i}
                    className="wa-template-item"
                    onClick={() => openWa(tpl.message)}
                  >
                    <span style={{ fontSize: 20, flexShrink: 0 }}>{tpl.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: D.text }}>{tpl.label}</div>
                      <div style={{ fontSize: 11, color: D.text3, marginTop: 1 }}>Tap untuk buka WhatsApp</div>
                    </div>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#25D366" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </button>
                ))}
              </div>
            </div>

            {/* Footer panel */}
            <div style={{
              padding: "10px 16px 14px",
              borderTop: `1px solid ${D.waBorder}`,
              display: "flex", alignItems: "center", gap: 6,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#25D366">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              <span style={{ fontSize: 11, color: D.text3 }}>Pesan akan langsung terbuka di WhatsApp</span>
            </div>
          </div>
        )}

        {/* Label tooltip */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div className={`wa-label-bubble ${waHovered && !waOpen ? "show" : ""}`}>
            💬 Tanya via WhatsApp
          </div>

          {/* FAB Button */}
          <button
            className={`wa-btn ${waOpen ? "open" : ""}`}
            onClick={() => setWaOpen(o => !o)}
            onMouseEnter={() => setWaHovered(true)}
            onMouseLeave={() => setWaHovered(false)}
            title="Hubungi kami via WhatsApp"
          >
            {waOpen ? (
              /* Close icon (X) */
              <svg viewBox="0 0 24 24" style={{ width: 22, height: 22 }}>
                <path d="M18 6L6 18M6 6l12 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
              </svg>
            ) : (
              /* WhatsApp icon */
              <svg viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
            )}
            {!waOpen && <div className="wa-badge">6</div>}
          </button>
        </div>
      </div>
    </div>
  );
}