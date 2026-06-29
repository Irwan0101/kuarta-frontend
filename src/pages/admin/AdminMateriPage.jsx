import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, ChevronDown, ChevronRight, FileText, Video, File, Link, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminApi } from '@/lib/api';
import { useTheme } from '@/hooks/useTheme';
import useResponsive from '@/hooks/useResponsive';
import { useConfirm } from '@/hooks/useConfirm';
import ImageUpload from '@/components/ui/ImageUpload';
import {
  PageHeader, Card, CardHead, Btn, Badge, Spinner, ErrorBox,
  Modal, FormGroup, FormRow, ORG, RED, GREEN, BLUE,
} from './adminUtils';

const EMPTY_TOPIC = { program_id: '', title: '', icon: '📖', order_num: '' };
const EMPTY_LESSON = { title: '', description: '', video_url: '', pdf_url: '', duration_mins: '', is_free: false, order_num: '' };

export default function AdminMateriPage() {
  const { T } = useTheme();
  const resp = useResponsive();
  const { confirm, modal: confirmModal } = useConfirm();
  const [programs, setPrograms] = useState([]);
  const [selected, setSelected] = useState('');
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [topicModal, setTopicModal] = useState(null);
  const [topicForm, setTopicForm] = useState(EMPTY_TOPIC);
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState({});
  const [lessons, setLessons] = useState({});
  const [lessonModal, setLessonModal] = useState(null);
  const [lessonForm, setLessonForm] = useState(EMPTY_LESSON);
  const [lessonTopicId, setLessonTopicId] = useState(null);

  const loadPrograms = useCallback(async () => {
    try { setPrograms(await adminApi.getPrograms()); } catch {}
  }, []);

  const loadTopics = useCallback(async (programId) => {
    if (!programId) { setTopics([]); return; }
    setLoading(true); setError('');
    try { setTopics(await adminApi.getTopics(programId)); }
    catch (e) { setError(e?.message || 'Gagal memuat materi.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadPrograms(); }, [loadPrograms]);
  useEffect(() => { loadTopics(selected); }, [selected, loadTopics]);

  const loadLessons = async (topicId) => {
    try {
      const data = await adminApi.getVideos(topicId);
      setLessons(prev => ({ ...prev, [topicId]: data }));
    } catch (e) {
      setLessons(prev => ({ ...prev, [topicId]: [] }));
    }
  };

  const toggleExpand = (topicId) => {
    const next = { ...expanded, [topicId]: !expanded[topicId] };
    setExpanded(next);
    if (next[topicId] && !lessons[topicId]) loadLessons(topicId);
  };

  const openTopicCreate = () => { setTopicForm({ ...EMPTY_TOPIC, program_id: selected }); setTopicModal('create'); };
  const openTopicEdit = (t) => { setTopicForm({ program_id: t.program_id, title: t.title, icon: t.icon || '📖', order_num: t.order_num ?? '' }); setTopicModal(t); };
  const handleTopicSave = async () => {
    setSaving(true);
    try {
      const payload = { ...topicForm, order_num: Number(topicForm.order_num) || 0 };
      if (topicModal === 'create') await adminApi.createTopic(payload);
      else await adminApi.updateTopic(topicModal.id, payload);
      setTopicModal(null); loadTopics(selected); toast.success('Topik tersimpan');
    } catch (e) { toast.error(e?.message || 'Gagal menyimpan.'); }
    finally { setSaving(false); }
  };
  const handleTopicDelete = async (id) => {
    if (!(await confirm('Hapus topik ini? Semua pelajaran di dalamnya akan ikut terhapus.'))) return;
    try { await adminApi.deleteTopic(id); toast.success('Topik dihapus'); loadTopics(selected); }
    catch (e) { toast.error(e?.message || 'Gagal hapus.'); }
  };

  const openLessonCreate = (topicId) => { setLessonForm(EMPTY_LESSON); setLessonTopicId(topicId); setLessonModal('create'); };
  const openLessonEdit = (lesson) => {
    setLessonForm({
      title: lesson.title, description: lesson.description ?? '', video_url: lesson.video_url ?? '', pdf_url: lesson.pdf_url ?? '',
      duration_mins: lesson.duration_mins ?? '',
      is_free: lesson.is_free ?? false, order_num: lesson.order_num ?? '',
    });
    setLessonTopicId(lesson.topic_id);
    setLessonModal(lesson);
  };
  const handleLessonSave = async () => {
    setSaving(true);
    try {
      const payload = { ...lessonForm, duration_mins: Number(lessonForm.duration_mins) || 0, order_num: Number(lessonForm.order_num) || 0 };
      if (lessonModal === 'create') await adminApi.addVideo(lessonTopicId, payload);
      else await adminApi.updateVideo(lessonModal.id, payload);
      setLessonModal(null); loadLessons(lessonTopicId); toast.success('Pelajaran tersimpan');
    } catch (e) { toast.error(e?.message || 'Gagal menyimpan.'); }
    finally { setSaving(false); }
  };
  const handleLessonDelete = async (id, topicId) => {
    if (!(await confirm('Hapus pelajaran ini?'))) return;
    try { await adminApi.deleteVideo(id); toast.success('Pelajaran dihapus'); loadLessons(topicId); }
    catch (e) { toast.error(e?.message || 'Gagal hapus.'); }
  };

  const inp = { padding: '9px 12px', fontSize: 13, borderRadius: 9, background: T.bg3, border: `1px solid ${T.border}`, color: T.text, outline: 'none', width: '100%', boxSizing: 'border-box' };
  const sel = { ...inp, cursor: 'pointer' };
  const chk = { width: 16, height: 16, cursor: 'pointer', accentColor: ORG };

  const typeIcon = (type) => {
    if (type === 'video') return <Video size={14} />;
    if (type === 'pdf') return <File size={14} />;
    if (type === 'quiz') return <FileText size={14} />;
    return <Link size={14} />;
  };

  return (
    <div>
      <PageHeader title={<><BookOpen size={22} style={{verticalAlign:'middle',marginRight:8}} /> Manajemen Materi</>} subtitle={`${topics.length} topik`} />
      <Card>
        <CardHead title="Pilih Program" />
        <div style={{ padding: '12px 16px 16px' }}>
          <select style={{ ...sel, maxWidth: resp.isMobile ? '100%' : 400 }}
            value={selected} onChange={e => { setSelected(e.target.value); setExpanded({}); }}>
            <option value="">— Pilih Program —</option>
            {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      </Card>

      {selected && (
        <Card>
          <CardHead title="Topik / Module" action={<Btn onClick={openTopicCreate}><Plus size={14} /> Tambah Topik</Btn>} />
          {error && <div style={{ padding: 16 }}><ErrorBox msg={error} /></div>}
          {loading ? <Spinner />
          : topics.length === 0
            ? <div style={{ padding: '32px 16px', textAlign: 'center', color: T.text3, fontSize: 13 }}>Belum ada topik.</div>
            : <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {topics.map(topic => (
                  <div key={topic.id} style={{ borderBottom: `1px solid ${T.border}` }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: resp.isMobile ? 6 : 10,
                      padding: resp.isMobile ? '10px 12px' : '12px 16px', cursor: 'pointer',
                      background: expanded[topic.id] ? T.bg3 : 'transparent',
                      flexWrap: resp.isMobile ? 'wrap' : 'nowrap',
                    }} onClick={() => toggleExpand(topic.id)}>
                      <span style={{ color: T.text3, display: 'flex' }}>
                        {expanded[topic.id] ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                      </span>
                      <span style={{ fontSize: 18 }}>{topic.icon || <BookOpen size={18} style={{verticalAlign:'middle'}} />}</span>
                      <span style={{ flex: 1, fontWeight: 600, fontSize: 13, color: T.text }}>{topic.title}</span>
                      <Badge color={BLUE}>{topic.video_count || 0} pelajaran</Badge>
                      {!resp.isMobile && <span style={{ fontSize: 11, color: T.text4 }}>#{topic.order_num ?? 0}</span>}
                      <div style={{ display: 'flex', gap: 4 }} onClick={e => e.stopPropagation()}>
                        <Btn size="sm" variant="outline" onClick={() => openLessonCreate(topic.id)}>
                          <Plus size={12} />
                          {!resp.isMobile && ' Video'}
                        </Btn>
                        <Btn size="sm" variant="outline" color={BLUE} onClick={() => openTopicEdit(topic)}><Edit2 size={12} /></Btn>
                        <Btn size="sm" variant="outline" color={RED} onClick={() => handleTopicDelete(topic.id)}><Trash2 size={12} /></Btn>
                      </div>
                    </div>
                    {expanded[topic.id] && (
                      <div style={{ background: T.bg2, padding: resp.isMobile ? '4px 12px 12px 12px' : '4px 16px 12px 52px' }}>
                        {(lessons[topic.id]?.length ?? 0) === 0
                          ? <div style={{ fontSize: 12, color: T.text4, padding: '8px 0' }}>Belum ada pelajaran</div>
                          : (lessons[topic.id] || []).map(lesson => (
                              <div key={lesson.id} style={{
                                display: 'flex', alignItems: 'center', gap: resp.isMobile ? 4 : 8,
                                padding: resp.isMobile ? '6px 8px' : '8px 10px', borderRadius: 8, marginBottom: 2,
                                background: T.bg3, flexWrap: resp.isMobile ? 'wrap' : 'nowrap',
                              }}>
                                <span style={{ color: lesson.type === 'video' ? BLUE : lesson.type === 'pdf' ? RED : GREEN, display: 'flex', flexShrink: 0 }}>
                                  {typeIcon(lesson.type)}
                                </span>
                                <span style={{ flex: 1, fontSize: 12, color: T.text, fontWeight: 500, wordBreak: 'break-word' }}>{lesson.title}</span>
                                {lesson.is_free && <Badge color={GREEN}>Gratis</Badge>}
                                <span style={{ fontSize: 11, color: T.text4, whiteSpace: 'nowrap' }}>{lesson.duration_mins}m</span>
                                {!resp.isMobile && <span style={{ fontSize: 11, color: T.text4 }}>#{lesson.order_num ?? 0}</span>}
                                <div style={{ display: 'flex', gap: 4 }}>
                                  <Btn size="sm" variant="outline" color={BLUE} onClick={() => openLessonEdit(lesson)}><Edit2 size={11} /></Btn>
                                  <Btn size="sm" variant="outline" color={RED} onClick={() => handleLessonDelete(lesson.id, topic.id)}><Trash2 size={11} /></Btn>
                                </div>
                              </div>
                            ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
          }
        </Card>
      )}

      {topicModal && (
        <Modal title={topicModal === 'create' ? 'Tambah Topik' : 'Edit Topik'} onClose={() => setTopicModal(null)}>
          <FormGroup label="Judul Topik">
            <input style={inp} value={topicForm.title} onChange={e => setTopicForm(f => ({ ...f, title: e.target.value }))} placeholder="TWK, TIU, TKP..." />
          </FormGroup>
          <FormRow>
            <FormGroup label="Icon (emoji)">
              <input style={inp} value={topicForm.icon} onChange={e => setTopicForm(f => ({ ...f, icon: e.target.value }))} placeholder="📖" />
            </FormGroup>
            <FormGroup label="Urutan">
              <input style={inp} type="number" value={topicForm.order_num} onChange={e => setTopicForm(f => ({ ...f, order_num: e.target.value }))} placeholder="1" />
            </FormGroup>
          </FormRow>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
            <Btn variant="outline" onClick={() => setTopicModal(null)}>Batal</Btn>
            <Btn onClick={handleTopicSave} disabled={saving || !topicForm.title}>{saving ? 'Menyimpan...' : 'Simpan'}</Btn>
          </div>
        </Modal>
      )}

      {lessonModal && (
        <Modal title={lessonModal === 'create' ? 'Tambah Pelajaran' : 'Edit Pelajaran'} onClose={() => setLessonModal(null)}>
          <FormRow>
            <FormGroup label="Judul">
              <input style={inp} value={lessonForm.title} onChange={e => setLessonForm(f => ({ ...f, title: e.target.value }))} placeholder="Pengantar TWK" />
            </FormGroup>
          </FormRow>
          <FormGroup label="Konten Teks Bacaan">
            <textarea value={lessonForm.description} onChange={e => setLessonForm(f => ({ ...f, description: e.target.value }))}
              rows={6} style={{ width: '100%', ...inp, resize: 'vertical', fontFamily: 'monospace', fontSize: 12 }} placeholder="Tulis materi teks di sini... Bisa pakai HTML." />
          </FormGroup>
          <FormRow>
            <FormGroup label="Video YouTube (URL)">
              <input style={inp} value={lessonForm.video_url} onChange={e => setLessonForm(f => ({ ...f, video_url: e.target.value }))} placeholder="https://www.youtube.com/watch?v=..." />
              <div style={{ fontSize: 11, color: T.text4, marginTop: 4 }}>Kosongkan jika tidak ada video</div>
            </FormGroup>
            <FormGroup label="Upload PDF">
              <ImageUpload value={lessonForm.pdf_url} onChange={v => setLessonForm(f => ({ ...f, pdf_url: v }))} accept=".pdf,image/*" label="Upload PDF" />
            </FormGroup>
          </FormRow>
          <FormRow>
            <FormGroup label="Durasi (menit)">
              <input style={inp} type="number" value={lessonForm.duration_mins} onChange={e => setLessonForm(f => ({ ...f, duration_mins: e.target.value }))} placeholder="15" />
            </FormGroup>
            <FormGroup label="Urutan">
              <input style={inp} type="number" value={lessonForm.order_num} onChange={e => setLessonForm(f => ({ ...f, order_num: e.target.value }))} placeholder="1" />
            </FormGroup>
          </FormRow>
          <FormGroup label="">
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: T.text3 }}>
              <input type="checkbox" checked={lessonForm.is_free} onChange={e => setLessonForm(f => ({ ...f, is_free: e.target.checked }))} style={chk} />
              Konten Gratis (bisa diakses tanpa berlangganan)
            </label>
          </FormGroup>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
            <Btn variant="outline" onClick={() => setLessonModal(null)}>Batal</Btn>
            <Btn onClick={handleLessonSave} disabled={saving || !lessonForm.title}>{saving ? 'Menyimpan...' : 'Simpan'}</Btn>
          </div>
        </Modal>
      )}
      {confirmModal}
    </div>
  );
}
