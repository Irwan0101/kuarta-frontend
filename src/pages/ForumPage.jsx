import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { MessageSquare, Plus, Send, ArrowLeft, ThumbsUp, Eye, Clock, Search, MessageCircle, Pin, ChevronRight } from 'lucide-react';
import useResponsive from '@/hooks/useResponsive';
import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/store/authStore';
import { forumApi, programsApi } from '@/lib/api';
import { Modal } from '@/components/ui/Modal';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { timeAgo, truncate } from '@/lib/utils';
import PageSkeleton from '@/components/PageSkeleton';
import toast from 'react-hot-toast';

const FORUM_ICONS = ['💬', '📌', '❓', '📝', '🔥', '💡'];

export default function ForumPage() {
  const { T, C } = useTheme();
  const resp = useResponsive();
  const { user } = useAuthStore();
  const [programs, setPrograms] = useState([]);
  const [activeProgram, setActiveProgram] = useState(null);
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showThread, setShowThread] = useState(null);
  const [replies, setReplies] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [myThreads, setMyThreads] = useState([]);
  const [tab, setTab] = useState('programs');

  useEffect(() => {
    const load = async () => {
      try {
        const [allPrograms, my] = await Promise.all([
          programsApi.getAll().catch(() => []),
          forumApi.getMyThreads().catch(() => [])
        ]);
        setPrograms(Array.isArray(allPrograms) ? allPrograms : []);
        setMyThreads(Array.isArray(my) ? my : []);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    load();
  }, []);

  useEffect(() => {
    if (!activeProgram) return;
    (async () => {
      setLoading(true);
      try {
        const data = await forumApi.getThreads(activeProgram.id);
        setThreads(Array.isArray(data) ? data : []);
      } catch (e) { setThreads([]); }
      setLoading(false);
    })();
  }, [activeProgram]);

  const openThread = async (thread) => {
    try {
      setLoading(true);
      const data = await forumApi.getThread(thread.id);
      setShowThread(data.thread);
      setReplies(Array.isArray(data.replies) ? data.replies : []);
    } catch (e) {
      toast.error('Gagal memuat diskusi');
    }
    setLoading(false);
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;
    setSubmitting(true);
    try {
      const reply = await forumApi.reply(showThread.id, replyText);
      setReplies(prev => [...prev, { ...reply, author_name: user?.name, author_role: user?.role }]);
      setReplyText('');
      toast.success('Balasan terkirim');
    } catch (e) {
      toast.error(e?.error || 'Gagal membalas');
    }
    setSubmitting(false);
  };

  const handleCreateThread = async () => {
    if (!newTitle.trim() || !newContent.trim()) return toast.error('Judul dan konten harus diisi');
    setSubmitting(true);
    try {
      const thread = await forumApi.createThread(activeProgram.id, newTitle, newContent);
      setThreads(prev => [{ ...thread, author_name: user?.name, author_role: user?.role, reply_count: 0 }, ...prev]);
      setShowCreate(false);
      setNewTitle('');
      setNewContent('');
      toast.success('Diskusi baru dibuat');
    } catch (e) {
      toast.error(e?.error || 'Gagal membuat diskusi');
    }
    setSubmitting(false);
  };

  const filteredThreads = threads.filter(t =>
    !searchQuery.trim() || t.title.toLowerCase().includes(searchQuery.toLowerCase()) || t.content?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderThreadCard = (thread) => (
    <div
      key={thread.id}
      onClick={() => openThread(thread)}
      style={{
        background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 12,
        padding: '16px 20px', cursor: 'pointer', transition: 'all .2s',
        display: 'flex', gap: 14, alignItems: 'flex-start',
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = C.orange + '60'}
      onMouseLeave={e => e.currentTarget.style.borderColor = T.border}
    >
      <Avatar name={thread.author_name} size={38} ringColor={C.orange} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          {thread.is_pinned && <Pin size={12} color={C.orange} />}
          <span style={{
            fontWeight: 700, fontSize: 14, color: T.text,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {thread.title}
          </span>
          {thread.is_pinned && <Badge color={C.orange} size="sm">Pinned</Badge>}
        </div>
        <div style={{ fontSize: 12.5, color: T.text3, lineHeight: 1.5, marginBottom: 8, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {thread.content}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 11, color: T.text4 }}>
          <span style={{ fontWeight: 600, color: C.orange }}>{thread.author_name}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Clock size={11} /> {timeAgo(thread.created_at)}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <MessageCircle size={11} /> {thread.reply_count || 0}
          </span>
        </div>
      </div>
      <ChevronRight size={14} color={T.text4} style={{ flexShrink: 0, marginTop: 4 }} />
    </div>
  );

  if (showThread) {
    return (
      <div style={{ width: '100%' }}>
        <button onClick={() => { setShowThread(null); setReplies([]); }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: C.orange, fontSize: 13, fontWeight: 600, marginBottom: 16 }}>
          <ArrowLeft size={14} /> Kembali ke forum
        </button>

        <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 14, padding: 24, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <Avatar name={showThread.author_name} size={40} ringColor={C.orange} />
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: T.text }}>{showThread.author_name}</div>
              <div style={{ fontSize: 11, color: T.text4 }}>{timeAgo(showThread.created_at)}</div>
            </div>
          </div>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: resp.isMobile ? 16 : 18, fontWeight: 800, color: T.text, marginBottom: 10 }}>
            {showThread.title}
          </h2>
          <p style={{ fontSize: 13.5, color: T.text2, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
            {showThread.content}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: T.text, display: 'flex', alignItems: 'center', gap: 6 }}>
            <MessageCircle size={14} color={C.orange} /> {replies.length} Balasan
          </h3>
        </div>

        {replies.length === 0 && (
          <div style={{ textAlign: 'center', padding: '30px', color: T.text4, fontSize: 13 }}>
            Belum ada balasan. Jadilah yang pertama!
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
          {replies.map(reply => (
            <div key={reply.id} style={{
              background: T.bg3, border: `1px solid ${T.border}`, borderRadius: 10, padding: '14px 18px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <Avatar name={reply.author_name} size={28} />
                <span style={{ fontWeight: 600, fontSize: 12.5, color: T.text }}>{reply.author_name}</span>
                {reply.author_role === 'mentor' && <Badge color={C.orange} size="sm">Mentor</Badge>}
                <span style={{ fontSize: 11, color: T.text4, marginLeft: 'auto' }}>{timeAgo(reply.created_at)}</span>
              </div>
              <p style={{ fontSize: 13, color: T.text2, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{reply.content}</p>
            </div>
          ))}
        </div>

        <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 12, padding: 16 }}>
          <textarea
            placeholder="Tulis balasan..."
            value={replyText}
            onChange={e => setReplyText(e.target.value)}
            rows={3}
            style={{
              width: '100%', padding: 12, background: T.bg3, border: `1px solid ${T.border2}`,
              borderRadius: 10, color: T.text, fontSize: 13, fontFamily: 'inherit',
              resize: 'vertical', outline: 'none', boxSizing: 'border-box',
            }}
            onFocus={e => e.currentTarget.style.borderColor = C.orange}
            onBlur={e => e.currentTarget.style.borderColor = T.border2}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
            <button
              onClick={handleReply}
              disabled={!replyText.trim() || submitting}
              style={{
                background: C.orange, color: '#070709', border: 'none',
                borderRadius: 8, padding: '9px 20px', fontSize: 13, fontWeight: 700,
                cursor: replyText.trim() ? 'pointer' : 'not-allowed',
                opacity: replyText.trim() ? 1 : 0.5,
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              {submitting ? 'Mengirim...' : <><Send size={13} /> Kirim</>}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%' }}>
      <Helmet><title>Forum Diskusi — Kuarta Bimbel</title></Helmet>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: resp.isMobile ? 20 : 24, fontWeight: 800, color: T.text, marginBottom: 4 }}>
            Forum Diskusi
          </h1>
          <p style={{ fontSize: resp.isMobile ? 12 : 13, color: T.text3 }}>Tanya, diskusi, dan berbagi dengan sesama pejuang</p>
        </div>
        {activeProgram && (
          <button
            onClick={() => setShowCreate(true)}
            style={{
              background: C.orange, color: '#070709', border: 'none',
              borderRadius: 10, padding: '10px 18px', fontSize: 13, fontWeight: 700,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <Plus size={14} /> Diskusi Baru
          </button>
        )}
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        <button onClick={() => setTab('programs')}
          style={{
            padding: '8px 18px', borderRadius: 24, fontSize: 12.5, fontWeight: 600,
            background: tab === 'programs' ? C.orange : T.bg2,
            border: `1px solid ${tab === 'programs' ? C.orange : T.border}`,
            color: tab === 'programs' ? '#070709' : T.text3, cursor: 'pointer',
            transition: 'all .2s',
          }}>
          💬 Per Program
        </button>
        <button onClick={() => setTab('my')}
          style={{
            padding: '8px 18px', borderRadius: 24, fontSize: 12.5, fontWeight: 600,
            background: tab === 'my' ? C.orange : T.bg2,
            border: `1px solid ${tab === 'my' ? C.orange : T.border}`,
            color: tab === 'my' ? '#070709' : T.text3, cursor: 'pointer',
            transition: 'all .2s',
          }}>
          📋 Diskusiku
        </button>
      </div>

      {tab === 'programs' && !activeProgram && (
        <div>
          <p style={{ fontSize: 13, color: T.text4, marginBottom: 14 }}>Pilih program untuk melihat forum diskusi:</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
            {programs.map(p => (
              <div key={p.id}
                onClick={() => setActiveProgram(p)}
                style={{
                  background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 12, padding: 16,
                  cursor: 'pointer', transition: 'all .2s', textAlign: 'center',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = C.orange + '60'}
                onMouseLeave={e => e.currentTarget.style.borderColor = T.border}
              >
                <div style={{ fontSize: 32, marginBottom: 8 }}>{p.icon || '💬'}</div>
                <div style={{ fontWeight: 700, fontSize: 13, color: T.text }}>{p.name}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'programs' && activeProgram && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <button onClick={() => setActiveProgram(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.orange, display: 'flex' }}>
              <ArrowLeft size={16} />
            </button>
            <span style={{ fontSize: 16, fontWeight: 700, color: T.text }}>
              {activeProgram.icon} {activeProgram.name}
            </span>
            <span style={{ fontSize: 11, color: T.text4 }}>({filteredThreads.length} diskusi)</span>
            <div style={{ position: 'relative', flex: 1, maxWidth: 260, marginLeft: 'auto' }}>
              <Search size={13} color={T.text4} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
              <input type="text" placeholder="Cari diskusi..." value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: '100%', padding: '7px 10px 7px 30px', background: T.bg3,
                  border: `1px solid ${T.border}`, borderRadius: 8, color: T.text,
                  fontSize: 12, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {loading ? (
            <PageSkeleton type="list" rows={5} />
          ) : filteredThreads.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: T.text4 }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>💬</div>
              <div style={{ fontWeight: 700, fontSize: 14, color: T.text, marginBottom: 4 }}>Belum ada diskusi</div>
              <div style={{ fontSize: 12, marginBottom: 16 }}>Mulai diskusi pertama tentang program ini</div>
              <button onClick={() => setShowCreate(true)}
                style={{
                  background: C.orange, color: '#070709', border: 'none', borderRadius: 8,
                  padding: '9px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                }}>
                <Plus size={13} /> Buat Diskusi
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {filteredThreads.map(renderThreadCard)}
            </div>
          )}
        </div>
      )}

      {tab === 'my' && (
        <div>
          {myThreads.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: T.text4 }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>📋</div>
              <div style={{ fontWeight: 700, fontSize: 14, color: T.text, marginBottom: 4 }}>Belum ada diskusimu</div>
              <div style={{ fontSize: 12 }}>Aktif di forum untuk melihat riwayat diskusimu</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {myThreads.map(t => (
                <div key={t.id}
                  onClick={() => { setActiveProgram({ id: t.program_id, name: t.program_name, icon: t.program_icon }); setTab('programs'); }}
                  style={{
                    background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 12, padding: '14px 18px',
                    cursor: 'pointer', transition: 'all .2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = C.orange + '60'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = T.border}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, fontSize: 13.5, color: T.text }}>{t.title}</span>
                    <Badge color={T.text4} size="sm">{t.program_name}</Badge>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 11, color: T.text4 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><MessageCircle size={11} /> {t.reply_count || 0}</span>
                    <span><Clock size={11} /> {timeAgo(t.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Buat Diskusi Baru" icon="💬">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: T.text2, display: 'block', marginBottom: 5 }}>Judul</label>
            <input type="text" placeholder="Contoh: Tips mengerjakan TIU"
              value={newTitle} onChange={e => setNewTitle(e.target.value)}
              style={{
                width: '100%', padding: '10px 14px', background: T.bg3, border: `1px solid ${T.border2}`,
                borderRadius: 8, color: T.text, fontSize: 13, fontFamily: 'inherit', outline: 'none',
                boxSizing: 'border-box',
              }}
              onFocus={e => e.currentTarget.style.borderColor = C.orange}
              onBlur={e => e.currentTarget.style.borderColor = T.border2}
            />
          </div>
          <div>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: T.text2, display: 'block', marginBottom: 5 }}>Konten</label>
            <textarea placeholder="Tulis pertanyaan atau diskusimu..."
              value={newContent} onChange={e => setNewContent(e.target.value)} rows={6}
              style={{
                width: '100%', padding: 12, background: T.bg3, border: `1px solid ${T.border2}`,
                borderRadius: 8, color: T.text, fontSize: 13, fontFamily: 'inherit',
                resize: 'vertical', outline: 'none', boxSizing: 'border-box',
              }}
              onFocus={e => e.currentTarget.style.borderColor = C.orange}
              onBlur={e => e.currentTarget.style.borderColor = T.border2}
            />
          </div>
        </div>
        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button onClick={() => setShowCreate(false)}
            style={{
              background: T.bg4, color: T.text3, border: `1px solid ${T.border}`, borderRadius: 8,
              padding: '9px 18px', fontSize: 13, cursor: 'pointer',
            }}>Batal</button>
          <button onClick={handleCreateThread} disabled={!newTitle.trim() || !newContent.trim() || submitting}
            style={{
              background: C.orange, color: '#070709', border: 'none', borderRadius: 8,
              padding: '9px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
              opacity: (!newTitle.trim() || !newContent.trim()) ? 0.5 : 1,
            }}>
            {submitting ? 'Mempublikasi...' : 'Publikasikan'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
