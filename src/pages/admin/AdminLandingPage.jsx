import { useEffect, useState } from 'react';
import { Plus, Trash2, Save, EyeOff, Eye, MoveUp, MoveDown, Flag, Star, MessageCircle, Rocket, Link2, Trophy, Tag, Palette, Image, BookOpen, Settings as SettingsIcon, Hash } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import useResponsive from '@/hooks/useResponsive';
import { useConfirm } from '@/hooks/useConfirm';
import { adminApi } from '@/lib/api';
import toast from 'react-hot-toast';
import ImageUpload from '@/components/ui/ImageUpload';

const ORG = '#FF6B00';
const EMPTY_HERO = { words: [], stats: [], button_text: '', button_link: '' };
const EMPTY_FEATURES = { items: [] };
const EMPTY_TESTIMONIALS = { items: [] };
const EMPTY_CTA = { button_text: '', button_link: '', guarantees: [] };
const EMPTY_FOOTER = { description: '', links: [] };

export default function AdminLandingPage() {
  const { T } = useTheme();
  const resp = useResponsive();
  const [tabs, setTabs] = useState([
    { key: 'hero', label: 'Hero', icon: Flag, count: 0 },
    { key: 'features', label: 'Fitur', icon: Star, count: 0 },
    { key: 'testimonials', label: 'Testimoni', icon: MessageCircle, count: 0 },
    { key: 'cta', label: 'CTA', icon: Rocket, count: 0 },
    { key: 'footer', label: 'Footer', icon: Link2, count: 0 },
    { key: 'ticker', label: 'Ticker', icon: Hash, count: 0 },
    { key: 'programs', label: 'Program', icon: BookOpen, count: 0 },
    { key: 'banners', label: 'Banners', icon: Trophy, count: 0 },
    { key: 'promotions', label: 'Promosi', icon: Tag, count: 0 },
    { key: 'settings', label: 'Pengaturan', icon: SettingsIcon, count: 0 },
  ]);
  const [activeTab, setActiveTab] = useState('hero');
  const [sections, setSections] = useState([]);
  const [banners, setBanners] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);

  // Form states per section
  const [form, setForm] = useState({});

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [b, p, s, st] = await Promise.all([
        adminApi.getBanners().catch(() => []),
        adminApi.getPromotions().catch(() => []),
        adminApi.getSections().catch(() => []),
        adminApi.getSettings().catch(() => ({})),
      ]);
      setBanners(Array.isArray(b) ? b : []);
      setPromotions(Array.isArray(p) ? p : []);
      setSettings(typeof st === 'object' ? st : {});
      const sectionsArr = Array.isArray(s) ? s : [];
      setSections(sectionsArr);

      // Init form states from sections
      const f = {};
      for (const sec of sectionsArr) {
        const content = typeof sec.content === 'object' && sec.content ? sec.content : {};
        f[sec.section_key] = {
          title: sec.title || '',
          subtitle: sec.subtitle || '',
          content: JSON.parse(JSON.stringify(content)),
        };
      }
      // Ensure all tabs have a form entry
      for (const t of tabs) {
        if (!f[t.key]) f[t.key] = { title: '', subtitle: '', content: {} };
      }
      setForm(f);

      // Update counts
      setTabs(prev => prev.map(t => {
        const sec = sectionsArr.find(s => s.section_key === t.key);
        let count = 0;
        if (t.key === 'hero') count = sec ? Object.keys(sec.content || {}).length : 0;
        else if (t.key === 'features') count = sec?.content?.items?.length || 0;
        else if (t.key === 'testimonials') count = sec?.content?.items?.length || 0;
        else if (t.key === 'ticker') count = sec?.content?.items?.length || 0;
        else if (t.key === 'cta') count = sec ? 1 : 0;
        else if (t.key === 'footer') count = sec?.content?.links?.length || 0;
        else if (t.key === 'programs') count = sec ? 1 : 0;
        else if (t.key === 'settings') count = Object.keys(settings).length;
        return { ...t, count };
      }));
    } catch (e) { toast.error('Gagal memuat data'); }
    setLoading(false);
  };

  const updateField = (key, field, value) => {
    setForm(prev => ({
      ...prev,
      [key]: { ...prev[key], [field]: value }
    }));
  };

  const updateContent = (key, field, value) => {
    setForm(prev => ({
      ...prev,
      [key]: { ...prev[key], content: { ...prev[key].content, [field]: value } }
    }));
  };

  const saveSection = async (key) => {
    const data = form[key];
    if (!data) return;
    try {
      await adminApi.updateSection(key, {
        title: data.title,
        subtitle: data.subtitle,
        content: data.content,
      });
      toast.success(`${key} tersimpan`);
      loadAll();
    } catch (e) {
      toast.error('Gagal menyimpan');
    }
  };

  const getContent = (key) => form[key]?.content || {};

  const inpStyle = (w = '100%') => ({
    width: w, padding: '7px 10px', background: T.bg2,
    border: `1px solid ${T.border2}`, borderRadius: 6,
    color: T.text, fontSize: 12, fontFamily: 'inherit',
    outline: 'none', boxSizing: 'border-box'
  });

  const cardStyle = {
    background: T.bg2, border: `1px solid ${T.border}`,
    borderRadius: 12, padding: resp.isMobile ? 14 : 20, marginBottom: 16,
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: T.text4 }}>Memuat...</div>;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <Palette size={24} />
          <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 22, fontWeight: 800, color: T.text, margin: 0 }}>
            Landing Page Builder
          </h1>
        </div>
        <p style={{ fontSize: 13, color: T.text3, margin: 0 }}>
          Kelola semua konten landing page secara visual
        </p>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            style={{
              padding: '8px 18px', borderRadius: 24, fontSize: 13, fontWeight: 600,
              background: activeTab === t.key ? ORG : T.bg2,
              border: `1px solid ${activeTab === t.key ? ORG : T.border}`,
              color: activeTab === t.key ? '#fff' : T.text3, cursor: 'pointer',
              transition: 'all 0.2s',
            }}>
            <><t.icon size={16} style={{marginRight:4}} /> {t.label}</>
            {t.count > 0 && (
              <span style={{ marginLeft: 6, fontSize: 10, opacity: 0.7 }}>({t.count})</span>
            )}
          </button>
        ))}
      </div>

      {/* ──────── HERO ──────── */}
      {activeTab === 'hero' && (
        <SectionCard title="Hero Section" onSubmit={() => saveSection('hero')} T={T} mobile={resp.isMobile}>
          <Row mobile={resp.isMobile}>
            <Field label="Title" value={form.hero?.title || ''} onChange={v => updateField('hero', 'title', v)} T={T} inpStyle={inpStyle} />
            <Field label="Subtitle" value={form.hero?.subtitle || ''} onChange={v => updateField('hero', 'subtitle', v)} T={T} inpStyle={inpStyle} />
          </Row>
          <div style={{ marginTop: 8, marginBottom: 12 }}>
            <Field label="Badge Text" value={getContent('hero').badge_text || ''} onChange={v => updateContent('hero', 'badge_text', v)} T={T} inpStyle={inpStyle} placeholder="Platform Belajar #1 di Indonesia" />
          </div>
          <Row mobile={resp.isMobile}>
            <Field label="Button Text" value={getContent('hero').button_text || ''} onChange={v => updateContent('hero', 'button_text', v)} T={T} inpStyle={inpStyle} placeholder="Mulai Belajar Gratis" />
            <Field label="Button Link" value={getContent('hero').button_link || ''} onChange={v => updateContent('hero', 'button_link', v)} T={T} inpStyle={inpStyle} placeholder="/register" />
          </Row>

          {/* Hero Description */}
          <div style={{ marginTop: 12 }}>
            <label style={lbl}>Description (paragraf di bawah headline)</label>
            <textarea
              value={getContent('hero').description || ''}
              onChange={e => updateContent('hero', 'description', e.target.value)}
              rows={3}
              style={{ width: '100%', ...inpStyle(), resize: 'vertical' }}
              placeholder="Platform belajar online lengkap untuk CPNS, UTBK, Olimpiade, dan bimbel sekolah..."
            />
          </div>

          {/* Animated Words */}
          <div style={{ marginTop: 12 }}>
            <label style={lbl}>Animated Words (ketik + Enter untuk tambah)</label>
            <TagInput values={getContent('hero').words || []} onChange={v => updateContent('hero', 'words', v)} T={T} inpStyle={inpStyle} placeholder="Prestasi" />
          </div>

          {/* Stats */}
          <div style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <label style={lbl}>Statistik</label>
              <button onClick={() => {
                const items = [...(getContent('hero').stats || []), { target: 0, label: '', fmt: '' }];
                updateContent('hero', 'stats', items);
              }} style={btnAdd(T)}><Plus size={13} /> Tambah</button>
            </div>
            {(getContent('hero').stats || []).map((st, i) => (
              <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 6 }}>
                <input value={st.target} onChange={e => {
                  const items = [...(getContent('hero').stats || [])];
                  items[i] = { ...items[i], target: parseInt(e.target.value) || 0 };
                  updateContent('hero', 'stats', items);
                }} type="number" placeholder="120000" style={{ width: 100, ...inpStyle() }} />
                <input value={st.label} onChange={e => {
                  const items = [...(getContent('hero').stats || [])];
                  items[i] = { ...items[i], label: e.target.value };
                  updateContent('hero', 'stats', items);
                }} placeholder="Siswa Aktif" style={{ flex: 1, ...inpStyle() }} />
                <select value={st.fmt || ''} onChange={e => {
                  const items = [...(getContent('hero').stats || [])];
                  items[i] = { ...items[i], fmt: e.target.value };
                  updateContent('hero', 'stats', items);
                }} style={{ width: 180, ...inpStyle() }}>
                  <option value="">Pilih format</option>
                  <option value="K+">120K+ (ribuan)</option>
                  <option value="★">4.9★ (rating)</option>
                  <option value="%">98% (persen)</option>
                  <option value="+">500+ (angka +)</option>
                </select>
                <button onClick={() => {
                  const items = (getContent('hero').stats || []).filter((_, j) => j !== i);
                  updateContent('hero', 'stats', items);
                }} style={{ ...btnSm(T), color: '#EF4444', flexShrink: 0 }}><Trash2 size={13} /></button>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* ──────── FEATURES ──────── */}
      {activeTab === 'features' && (
<SectionCard title="Fitur Unggulan" onSubmit={() => saveSection('features')} T={T} mobile={resp.isMobile}>
            <Row mobile={resp.isMobile}>
            <Field label="Title" value={form.features?.title || ''} onChange={v => updateField('features', 'title', v)} T={T} inpStyle={inpStyle} placeholder="Semua yang Kamu Butuhkan" />
            <Field label="Subtitle" value={form.features?.subtitle || ''} onChange={v => updateField('features', 'subtitle', v)} T={T} inpStyle={inpStyle} placeholder="Ada di Sini" />
          </Row>
          <div style={{ marginTop: 8, marginBottom: 12 }}>
            <Field label="Badge Text" value={getContent('features').badge_text || ''} onChange={v => updateContent('features', 'badge_text', v)} T={T} inpStyle={inpStyle} placeholder="MENGAPA KUARTA" />
          </div>
          <div style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <label style={{ ...lbl, margin: 0 }}>Daftar Fitur</label>
              <button onClick={() => {
                const items = [...(getContent('features').items || []), { icon: '📹', title: '', desc: '' }];
                updateContent('features', 'items', items);
              }} style={btnAdd(T)}><Plus size={13} /> Tambah</button>
            </div>
            {(getContent('features').items || []).map((item, i) => (
              <div key={i} style={{
                ...cardStyle, padding: 14, marginBottom: 8,
                borderColor: T.border2,
              }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <Row mobile={resp.isMobile}>
                      <Field label="Icon" value={item.icon} onChange={v => {
                        const items = [...(getContent('features').items || [])];
                        items[i] = { ...items[i], icon: v };
                        updateContent('features', 'items', items);
                      }} T={T} inpStyle={inpStyle} placeholder="📹" />
                      <Field label="Title" value={item.title} onChange={v => {
                        const items = [...(getContent('features').items || [])];
                        items[i] = { ...items[i], title: v };
                        updateContent('features', 'items', items);
                      }} T={T} inpStyle={inpStyle} placeholder="Video HD Interaktif" />
                    </Row>
                    <div style={{ marginTop: 6 }}>
                      <label style={lbl}>Description</label>
                      <input value={item.desc} onChange={e => {
                        const items = [...(getContent('features').items || [])];
                        items[i] = { ...items[i], desc: e.target.value };
                        updateContent('features', 'items', items);
                      }} style={inpStyle()} placeholder="Ratusan video berkualitas..." />
                    </div>
                  </div>
                  <button onClick={() => {
                    const items = (getContent('features').items || []).filter((_, j) => j !== i);
                    updateContent('features', 'items', items);
                  }} style={{ ...btnSm(T), color: '#EF4444', flexShrink: 0, marginTop: 20 }}><Trash2 size={13} /></button>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* ──────── TESTIMONIALS ──────── */}
      {activeTab === 'testimonials' && (
        <SectionCard title="Testimoni" onSubmit={() => saveSection('testimonials')} T={T} mobile={resp.isMobile}>
          <Row mobile={resp.isMobile}>
            <Field label="Title" value={form.testimonials?.title || ''} onChange={v => updateField('testimonials', 'title', v)} T={T} inpStyle={inpStyle} placeholder="Mereka Sudah Membuktikannya" />
            <Field label="Subtitle" value={form.testimonials?.subtitle || ''} onChange={v => updateField('testimonials', 'subtitle', v)} T={T} inpStyle={inpStyle} placeholder="Testimoni dari siswa yang berhasil" />
          </Row>
          <div style={{ marginTop: 8, marginBottom: 12 }}>
            <Field label="Badge Text" value={getContent('testimonials').badge_text || ''} onChange={v => updateContent('testimonials', 'badge_text', v)} T={T} inpStyle={inpStyle} placeholder="TESTIMONI" />
          </div>
          <div style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <label style={{ ...lbl, margin: 0 }}>Daftar Testimoni</label>
              <button onClick={() => {
                const items = [...(getContent('testimonials').items || []), { name: '', role: '', avatar: '', score: 0, text: '' }];
                updateContent('testimonials', 'items', items);
              }} style={btnAdd(T)}><Plus size={13} /> Tambah</button>
            </div>
            {(getContent('testimonials').items || []).map((item, i) => (
              <div key={i} style={{ ...cardStyle, padding: 14, marginBottom: 8, borderColor: T.border2 }}>
                <Row mobile={resp.isMobile}>
                  <Field label="Nama" value={item.name} onChange={v => {
                    const items = [...(getContent('testimonials').items || [])];
                    items[i] = { ...items[i], name: v, avatar: v ? v.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : '' };
                    updateContent('testimonials', 'items', items);
                  }} T={T} inpStyle={inpStyle} placeholder="Rizki Firmansyah" />
                  <Field label="Role" value={item.role} onChange={v => {
                    const items = [...(getContent('testimonials').items || [])];
                    items[i] = { ...items[i], role: v };
                    updateContent('testimonials', 'items', items);
                  }} T={T} inpStyle={inpStyle} placeholder="Lulus CPNS Kemenkeu 2024" />
                  <Field label="Score" value={item.score} onChange={v => {
                    const items = [...(getContent('testimonials').items || [])];
                    items[i] = { ...items[i], score: parseInt(v) || 0 };
                    updateContent('testimonials', 'items', items);
                  }} type="number" T={T} inpStyle={inpStyle} />
                </Row>
                <div style={{ marginTop: 6 }}>
                  <label style={lbl}>Testimonial Text</label>
                  <textarea value={item.text} onChange={e => {
                    const items = [...(getContent('testimonials').items || [])];
                    items[i] = { ...items[i], text: e.target.value };
                    updateContent('testimonials', 'items', items);
                  }} rows={2} style={{ width: '100%', ...inpStyle(), resize: 'vertical' }} placeholder="Berkat Kuarta saya lulus..." />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
                  <button onClick={() => {
                    const items = (getContent('testimonials').items || []).filter((_, j) => j !== i);
                    updateContent('testimonials', 'items', items);
                  }} style={{ ...btnSm(T), color: '#EF4444' }}><Trash2 size={13} /></button>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* ──────── CTA ──────── */}
      {activeTab === 'cta' && (
        <SectionCard title="CTA (Call to Action)" onSubmit={() => saveSection('cta')} T={T} mobile={resp.isMobile}>
          <Row mobile={resp.isMobile}>
            <Field label="Title" value={form.cta?.title || ''} onChange={v => updateField('cta', 'title', v)} T={T} inpStyle={inpStyle} placeholder="Siap Meraih Mimpimu?" />
            <Field label="Subtitle" value={form.cta?.subtitle || ''} onChange={v => updateField('cta', 'subtitle', v)} T={T} inpStyle={inpStyle} placeholder="Bergabung dengan 120.000+ siswa..." />
          </Row>
          <Row mobile={resp.isMobile}>
            <Field label="Button Text" value={getContent('cta').button_text || ''} onChange={v => updateContent('cta', 'button_text', v)} T={T} inpStyle={inpStyle} placeholder="Daftar Sekarang — Gratis" />
            <Field label="Button Link" value={getContent('cta').button_link || ''} onChange={v => updateContent('cta', 'button_link', v)} T={T} inpStyle={inpStyle} placeholder="/register" />
          </Row>
          <div style={{ marginTop: 12 }}>
            <label style={lbl}>Description (paragraf di bawah headline)</label>
            <textarea
              value={getContent('cta').description || ''}
              onChange={e => updateContent('cta', 'description', e.target.value)}
              rows={2}
              style={{ width: '100%', ...inpStyle(), resize: 'vertical' }}
              placeholder="Bergabung dengan 120.000+ siswa yang sudah membuktikan..."
            />
          </div>
          <div style={{ marginTop: 12 }}>
            <label style={lbl}>Guarantees / Badges (ketik + Enter)</label>
            <TagInput values={getContent('cta').guarantees || []} onChange={v => updateContent('cta', 'guarantees', v)} T={T} inpStyle={inpStyle} placeholder="Tanpa kartu kredit" />
          </div>
        </SectionCard>
      )}

      {/* ──────── FOOTER ──────── */}
      {activeTab === 'footer' && (
        <SectionCard title="Footer" onSubmit={() => saveSection('footer')} T={T} mobile={resp.isMobile}>
          <Field label="Copyright Text" value={form.footer?.subtitle || ''} onChange={v => updateField('footer', 'subtitle', v)} T={T} inpStyle={inpStyle} placeholder="© 2026 Kuarta. All rights reserved." />
          <div style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <label style={{ ...lbl, margin: 0 }}>Footer Links</label>
              <button onClick={() => {
                const items = [...(getContent('footer').links || []), { label: '', url: '' }];
                updateContent('footer', 'links', items);
              }} style={btnAdd(T)}><Plus size={13} /> Tambah</button>
            </div>
            {(getContent('footer').links || []).map((link, i) => (
              <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 6 }}>
                <input value={link.label} onChange={e => {
                  const items = [...(getContent('footer').links || [])];
                  items[i] = { ...items[i], label: e.target.value };
                  updateContent('footer', 'links', items);
                }} placeholder="Tentang" style={{ flex: 1, ...inpStyle() }} />
                <input value={link.url} onChange={e => {
                  const items = [...(getContent('footer').links || [])];
                  items[i] = { ...items[i], url: e.target.value };
                  updateContent('footer', 'links', items);
                }} placeholder="/tentang" style={{ flex: 1, ...inpStyle() }} />
                <button onClick={() => {
                  const items = (getContent('footer').links || []).filter((_, j) => j !== i);
                  updateContent('footer', 'links', items);
                }} style={{ ...btnSm(T), color: '#EF4444', flexShrink: 0 }}><Trash2 size={13} /></button>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* ──────── TICKER ──────── */}
      {activeTab === 'ticker' && (
        <SectionCard title="Ticker (Running Text)" onSubmit={() => saveSection('ticker')} T={T} mobile={resp.isMobile}>
          <p style={{ fontSize: 12, color: T.text3, margin: '0 0 12px' }}>
            Teks yang berjalan di antara Hero dan Program
          </p>
          <div style={{ marginTop: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <label style={{ ...lbl, margin: 0 }}>Teks Ticker</label>
              <button onClick={() => {
                const items = [...(getContent('ticker').items || []), ''];
                updateContent('ticker', 'items', items);
              }} style={btnAdd(T)}><Plus size={13} /> Tambah</button>
            </div>
            {(getContent('ticker').items || []).map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 6 }}>
                <input value={item} onChange={e => {
                  const items = [...(getContent('ticker').items || [])];
                  items[i] = e.target.value;
                  updateContent('ticker', 'items', items);
                }} placeholder="CPNS 2025" style={{ flex: 1, ...inpStyle() }} />
                <button onClick={() => {
                  const items = (getContent('ticker').items || []).filter((_, j) => j !== i);
                  updateContent('ticker', 'items', items);
                }} style={{ ...btnSm(T), color: '#EF4444', flexShrink: 0 }}><Trash2 size={13} /></button>
              </div>
            ))}
            {(getContent('ticker').items || []).length === 0 && (
              <div style={{ textAlign: 'center', padding: 20, color: T.text4, fontSize: 12 }}>
                Belum ada teks ticker
              </div>
            )}
          </div>
        </SectionCard>
      )}

      {/* ──────── SETTINGS ──────── */}
      {activeTab === 'settings' && (
        <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 12, padding: resp.isMobile ? 12 : 20, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 16, fontWeight: 700, color: T.text, margin: 0 }}>
              Pengaturan Global
            </h3>
            <button onClick={async () => {
              try {
                await adminApi.updateSetting('wa_number', settings.wa_number || {});
                toast.success('Pengaturan tersimpan');
              } catch (e) { toast.error('Gagal menyimpan'); }
            }}
              style={{ background: ORG, color: '#fff', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Save size={13} /> Simpan
            </button>
          </div>

          <div>
            <label style={lbl}>Nomor WhatsApp (aktif)</label>
            <input
              value={settings.wa_number?.number || ''}
              onChange={e => setSettings(prev => ({
                ...prev,
                wa_number: { number: e.target.value }
              }))}
              style={inpStyle()}
              placeholder="6281234567890"
            />
            <p style={{ fontSize: 11, color: T.text4, marginTop: 4 }}>
              Nomor tujuan untuk tombol WhatsApp di landing page (tanpa +, format: 628xxx)
            </p>
          </div>
        </div>
      )}

      {/* ──────── PROGRAMS ──────── */}
      {activeTab === 'programs' && (
        <SectionCard title="Program Section" onSubmit={() => saveSection('programs')} T={T} mobile={resp.isMobile}>
          <Row mobile={resp.isMobile}>
            <Field label="Title" value={form.programs?.title || ''} onChange={v => updateField('programs', 'title', v)} T={T} inpStyle={inpStyle} placeholder="Pilih Program" />
            <Field label="Subtitle" value={form.programs?.subtitle || ''} onChange={v => updateField('programs', 'subtitle', v)} T={T} inpStyle={inpStyle} placeholder="Sesuai Tujuanmu" />
          </Row>
          <div style={{ marginTop: 8 }}>
            <Field label="Badge Text" value={getContent('programs').badge_text || ''} onChange={v => updateContent('programs', 'badge_text', v)} T={T} inpStyle={inpStyle} placeholder="PROGRAM UNGGULAN" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12 }}>
            <label style={{ ...lbl, margin: 0, cursor: 'pointer' }}>Tampilkan Harga</label>
            <div onClick={() => updateContent('programs', 'show_price', getContent('programs').show_price === false ? true : false)}
              style={{
                width: 40, height: 22, borderRadius: 11,
                background: getContent('programs').show_price === false ? '#555' : '#FF6B00',
                position: 'relative', cursor: 'pointer', transition: 'background 0.2s',
              }}>
              <div style={{
                width: 18, height: 18, borderRadius: '50%', background: '#fff',
                position: 'absolute', top: 2,
                left: getContent('programs').show_price === false ? 2 : 20,
                transition: 'left 0.2s',
              }} />
            </div>
          </div>
        </SectionCard>
      )}

      {/* ──────── BANNERS ──────── */}
      {activeTab === 'banners' && (
        <BannersTab banners={banners} onRefresh={loadAll} T={T} inpStyle={inpStyle} cardStyle={cardStyle} isMobile={resp.isMobile} />
      )}

      {/* ──────── PROMOTIONS ──────── */}
      {activeTab === 'promotions' && (
        <PromotionsTab promotions={promotions} onRefresh={loadAll} T={T} inpStyle={inpStyle} cardStyle={cardStyle} isMobile={resp.isMobile} />
      )}
    </div>
  );
}

/* ── Sub-components ── */

function SectionCard({ title, children, onSubmit, T, mobile }) {
  return (
    <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 12, padding: mobile ? 12 : 20, marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 16, fontWeight: 700, color: T.text, margin: 0 }}>{title}</h3>
        <button onClick={onSubmit}
          style={{ background: ORG, color: '#fff', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
          <Save size={13} /> Simpan
        </button>
      </div>
      {children}
    </div>
  );
}

function Row({ children, mobile }) {
  return <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : '1fr 1fr', gap: 10, marginBottom: 8 }}>{children}</div>;
}

function Field({ label, value, onChange, T, inpStyle: is, placeholder, type }) {
  return (
    <div>
      <label style={lbl}>{label}</label>
      {type === 'textarea' ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} rows={3}
          style={{ width: '100%', ...is(), resize: 'vertical' }} placeholder={placeholder} />
      ) : (
        <input type={type || 'text'} value={value} onChange={e => onChange(e.target.value)}
          style={is()} placeholder={placeholder} />
      )}
    </div>
  );
}

function TagInput({ values, onChange, T, inpStyle: is, placeholder }) {
  const [input, setInput] = useState('');

  const addTag = () => {
    const v = input.trim();
    if (v && !values.includes(v)) {
      onChange([...values, v]);
      setInput('');
    }
  };

  const removeTag = (i) => {
    onChange(values.filter((_, j) => j !== i));
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
        {values.map((v, i) => (
          <span key={i} style={{
            background: ORG + '18', color: ORG, border: `1px solid ${ORG}30`,
            borderRadius: 99, padding: '3px 10px', fontSize: 11, fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            {v}
            <span onClick={() => removeTag(i)} style={{ cursor: 'pointer', opacity: 0.6, marginLeft: 2 }}>×</span>
          </span>
        ))}
      </div>
      <input value={input} onChange={e => setInput(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
        placeholder={placeholder} style={is()} />
    </div>
  );
}

/* ── Banners Tab (existing logic) ── */
function BannersTab({ banners, onRefresh, T, inpStyle, cardStyle, isMobile }) {
  const [editBanner, setEditBanner] = useState(null);
  const [editBannerData, setEditBannerData] = useState(null);
  const { confirm, modal: confirmModal } = useConfirm();

  const saveBanner = async () => {
    const d = editBannerData;
    if (!d.title) return toast.error('Judul wajib diisi');
    try {
      if (editBanner?.id) { await adminApi.updateBanner(editBanner.id, d); toast.success('Banner diperbarui'); }
      else { await adminApi.createBanner(d); toast.success('Banner ditambahkan'); }
      setEditBanner(null); onRefresh();
    } catch (e) { toast.error('Gagal menyimpan'); }
  };

  const toggleBanner = async (id, active) => { await adminApi.updateBanner(id, { is_active: !active }); onRefresh(); };
  const deleteBanner = async (id) => { if (!(await confirm('Hapus banner?'))) return; await adminApi.deleteBanner(id); onRefresh(); };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={() => { setEditBanner({}); setEditBannerData({ image_url: '', title: '', subtitle: '', cta_text: '', cta_link: '', badge_text: '', order_index: 0 }); }}
          style={{ background: ORG, color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Plus size={14} /> Tambah Banner
        </button>
      </div>

      {editBanner !== null && editBannerData && (
        <div style={{ background: T.bg3, border: `1px solid ${ORG}40`, borderRadius: 12, padding: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: T.text, marginBottom: 12 }}>
            {editBanner?.id ? 'Edit Banner' : 'Banner Baru'}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 10 }}>
            {['title', 'subtitle', 'cta_text', 'cta_link', 'badge_text'].map(k => (
              <div key={k}>
                <label style={lbl}>{k.replace(/_/g, ' ')}</label>
                <input value={editBannerData[k]} onChange={e => setEditBannerData(d => ({ ...d, [k]: e.target.value }))}
                  style={inpStyle()} placeholder={k === 'title' ? '' : 'Opsional'} />
              </div>
            ))}
            <div>
              <label style={lbl}>Order</label>
              <input type="number" value={editBannerData.order_index} onChange={e => setEditBannerData(d => ({ ...d, order_index: parseInt(e.target.value) || 0 }))} style={inpStyle()} />
            </div>
            <div>
              <label style={lbl}>Gambar Banner</label>
              <ImageUpload value={editBannerData.image_url} onChange={v => setEditBannerData(d => ({ ...d, image_url: v }))} label="Upload Banner" />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12, justifyContent: 'flex-end' }}>
            <button onClick={() => setEditBanner(null)} style={{ background: T.bg4, color: T.text3, border: `1px solid ${T.border}`, borderRadius: 8, padding: '7px 14px', fontSize: 12, cursor: 'pointer' }}>Batal</button>
            <button onClick={saveBanner} style={{ background: ORG, color: '#fff', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
              <Save size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Simpan
            </button>
          </div>
        </div>
      )}

      {banners.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: T.text4 }}>Belum ada banner. Klik "Tambah Banner" untuk mulai.</div>
      ) : banners.map(b => (
        <div key={b.id} style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 12, padding: 16, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
          <div style={{ width: 120, height: 68, background: T.bg4, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
            {b.image_url ? <img src={b.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} /> : <Image size={24} style={{opacity:.3}} />}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: T.text }}>{b.title}</div>
            {b.subtitle && <div style={{ fontSize: 12, color: T.text3, marginTop: 2 }}>{b.subtitle}</div>}
            <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
              {b.cta_text && <Badge color={ORG}>CTA: {b.cta_text}</Badge>}
              {b.badge_text && <Badge color="#22C55E">{b.badge_text}</Badge>}
              <Badge color={b.is_active ? '#22C55E' : '#EF4444'}>{b.is_active ? 'Aktif' : 'Nonaktif'}</Badge>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={() => { setEditBanner(b); setEditBannerData({ image_url: b.image_url || '', title: b.title || '', subtitle: b.subtitle || '', cta_text: b.cta_text || '', cta_link: b.cta_link || '', badge_text: b.badge_text || '', order_index: b.order_index || 0 }); }} style={btnSm(T)}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
            <button onClick={() => toggleBanner(b.id, b.is_active)} style={btnSm(T)}>{b.is_active ? <EyeOff size={13} /> : <Eye size={13} />}</button>
            <button onClick={() => deleteBanner(b.id)} style={{ ...btnSm(T), color: '#EF4444' }}><Trash2 size={13} /></button>
          </div>
        </div>
      ))}
      {confirmModal}
    </div>
  );
}

/* ── Promotions Tab (existing logic) ── */
function PromotionsTab({ promotions, onRefresh, T, inpStyle, cardStyle, isMobile }) {
  const [editPromo, setEditPromo] = useState(null);
  const [editPromoData, setEditPromoData] = useState(null);
  const { confirm, modal: confirmModal } = useConfirm();

  const savePromo = async () => {
    const d = editPromoData;
    if (!d.title) return toast.error('Judul wajib diisi');
    try {
      if (editPromo?.id) { await adminApi.updatePromotion(editPromo.id, d); toast.success('Promosi diperbarui'); }
      else { await adminApi.createPromotion(d); toast.success('Promosi ditambahkan'); }
      setEditPromo(null); onRefresh();
    } catch (e) { toast.error('Gagal menyimpan'); }
  };

  const togglePromo = async (id, active) => { await adminApi.updatePromotion(id, { is_active: !active }); onRefresh(); };
  const deletePromo = async (id) => { if (!(await confirm('Hapus promosi?'))) return; await adminApi.deletePromotion(id); onRefresh(); };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={() => { setEditPromo({}); setEditPromoData({ title: '', description: '', discount_text: '', coupon_code: '', bg_color: '#FF6B00', ends_at: '', image_url: '' }); }}
          style={{ background: ORG, color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Plus size={14} /> Tambah Promosi
        </button>
      </div>

      {editPromo !== null && editPromoData && (
        <div style={{ background: T.bg3, border: `1px solid ${ORG}40`, borderRadius: 12, padding: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: T.text, marginBottom: 12 }}>{editPromo?.id ? 'Edit Promosi' : 'Promosi Baru'}</div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 10 }}>
            <div><label style={lbl}>Title *</label><input value={editPromoData.title} onChange={e => setEditPromoData(d => ({ ...d, title: e.target.value }))} style={inpStyle()} /></div>
            <div><label style={lbl}>Discount Text</label><input value={editPromoData.discount_text} onChange={e => setEditPromoData(d => ({ ...d, discount_text: e.target.value }))} style={inpStyle()} placeholder="Diskon 50%" /></div>
            <div><label style={lbl}>Coupon Code</label><input value={editPromoData.coupon_code} onChange={e => setEditPromoData(d => ({ ...d, coupon_code: e.target.value }))} style={inpStyle()} placeholder="PROMO50" /></div>
            <div><label style={lbl}>BG Color</label>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <input type="color" value={editPromoData.bg_color} onChange={e => setEditPromoData(d => ({ ...d, bg_color: e.target.value }))} style={{ width: 36, height: 36, border: 'none', borderRadius: 6, cursor: 'pointer', background: 'none' }} />
                <input value={editPromoData.bg_color} onChange={e => setEditPromoData(d => ({ ...d, bg_color: e.target.value }))} style={{ flex: 1, ...inpStyle() }} />
              </div>
            </div>
            <div><label style={lbl}>Description</label><input value={editPromoData.description} onChange={e => setEditPromoData(d => ({ ...d, description: e.target.value }))} style={inpStyle()} /></div>
            <div><label style={lbl}>Berakhir</label><input type="datetime-local" value={editPromoData.ends_at} onChange={e => setEditPromoData(d => ({ ...d, ends_at: e.target.value }))} style={inpStyle()} /></div>
          </div>
          <div style={{ marginTop: 10 }}>
            <label style={lbl}>Gambar (opsional)</label>
            <ImageUpload value={editPromoData.image_url} onChange={v => setEditPromoData(d => ({ ...d, image_url: v }))} />
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12, justifyContent: 'flex-end' }}>
            <button onClick={() => setEditPromo(null)} style={{ background: T.bg4, color: T.text3, border: `1px solid ${T.border}`, borderRadius: 8, padding: '7px 14px', fontSize: 12, cursor: 'pointer' }}>Batal</button>
            <button onClick={savePromo} style={{ background: ORG, color: '#fff', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}><Save size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Simpan</button>
          </div>
        </div>
      )}

      {promotions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: T.text4 }}>Belum ada promosi popup</div>
      ) : promotions.map(p => (
        <div key={p.id} style={{
          background: `linear-gradient(135deg, ${p.bg_color || ORG}18, ${T.bg2})`,
          border: `1px solid ${(p.bg_color || ORG)}30`, borderRadius: 12, padding: 16,
          display: 'flex', gap: 14, alignItems: 'flex-start',
        }}>
          <Tag size={28} style={{ flexShrink: 0, opacity:0.5 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: T.text }}>{p.title}</div>
            {p.description && <div style={{ fontSize: 12, color: T.text3, marginTop: 2 }}>{p.description}</div>}
            <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
              {p.discount_text && <Badge color={ORG}>{p.discount_text}</Badge>}
              {p.coupon_code && <Badge color="#22C55E">Kode: {p.coupon_code}</Badge>}
              <Badge color={p.is_active ? '#22C55E' : '#EF4444'}>{p.is_active ? 'Aktif' : 'Nonaktif'}</Badge>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={() => { setEditPromo(p); setEditPromoData({ title: p.title || '', description: p.description || '', discount_text: p.discount_text || '', coupon_code: p.coupon_code || '', bg_color: p.bg_color || '#FF6B00', ends_at: p.ends_at ? p.ends_at.slice(0, 16) : '', image_url: p.image_url || '' }); }} style={btnSm(T)}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
            <button onClick={() => togglePromo(p.id, p.is_active)} style={btnSm(T)}>{p.is_active ? <EyeOff size={13} /> : <Eye size={13} />}</button>
            <button onClick={() => deletePromo(p.id)} style={{ ...btnSm(T), color: '#EF4444' }}><Trash2 size={13} /></button>
          </div>
        </div>
      ))}
      {confirmModal}
    </div>
  );
}

/* ── Shared helpers ── */
function btnSm(T) { return { width: 30, height: 30, background: T.bg4, border: 'none', borderRadius: 6, cursor: 'pointer', color: T.text3, display: 'flex', alignItems: 'center', justifyContent: 'center' }; }
function btnAdd(T) { return { background: 'transparent', color: ORG, border: `1px dashed ${ORG}50`, borderRadius: 8, padding: '5px 12px', fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }; }
const lbl = { fontSize: 11, fontWeight: 600, color: '#999', display: 'block', marginBottom: 3 };
function Badge({ children, color }) {
  const c = color || ORG;
  return <span style={{ fontSize: 10, fontWeight: 700, color: c, background: c + '18', border: `1px solid ${c}30`, borderRadius: 99, padding: '2px 8px', display: 'inline-flex', alignItems: 'center' }}>{children}</span>;
}
