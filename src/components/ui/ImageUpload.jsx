import { useState, useRef } from 'react';
import { X, FileText, Video, Trash2, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const ORG = '#FF6B00';

export default function ImageUpload({ value, onChange, accept = 'image/*', label = 'Upload', style: containerStyle }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState(value || '');
  const [dragOver, setDragOver] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const inputRef = useRef(null);

  const uploadFile = (file) => {
    if (!file) return;
    const form = new FormData();
    form.append('file', file);
    setUploading(true);
    setProgress(0);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/upload');
    xhr.setRequestHeader('Authorization', 'Bearer ' + (useAuthStore.getState().token || ''));

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
    };

    xhr.onload = () => {
      setUploading(false);
      if (xhr.status < 200 || xhr.status >= 300) {
        try {
          const err = JSON.parse(xhr.responseText);
          alert('Gagal upload: ' + (err.error || 'Coba lagi'));
        } catch {
          alert('Gagal upload: Server error');
        }
        return;
      }
      const data = JSON.parse(xhr.responseText);
      setPreview(data.url);
      if (onChange) onChange(data.url);
    };

    xhr.onerror = () => { setUploading(false); alert('Gagal upload: Network error'); };
    xhr.send(form);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    e.target.value = '';
  };

  const clear = () => {
    setPreview('');
    if (onChange) onChange('');
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!preview || !confirm('Hapus file ini dari server?')) return;
    setDeleting(true);
    try {
      const res = await fetch('/api/upload', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + (useAuthStore.getState().token || ''),
        },
        body: JSON.stringify({ url: preview }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert('Gagal hapus: ' + (err.error || 'Coba lagi'));
        return;
      }
      clear();
    } catch (e) {
      alert('Gagal hapus: ' + (e.message || 'Network error'));
    }
    setDeleting(false);
  };

  const isImage = preview && /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(preview);
  const isPdf = preview && /\.pdf$/i.test(preview);
  const isVideo = preview && /\.(mp4|webm)$/i.test(preview);

  return (
    <div style={{ ...containerStyle }}>
      {uploading && (
        <div style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Loader2 size={14} color={ORG} style={{ animation: 'spin 1s linear infinite' }} />
            <span style={{ fontSize: 11, color: '#888' }}>Uploading {progress}%</span>
          </div>
          <div style={{ width: '100%', height: 4, borderRadius: 2, background: '#222', overflow: 'hidden' }}>
            <div style={{ width: `${progress}%`, height: '100%', borderRadius: 2, background: ORG, transition: 'width 0.3s' }} />
          </div>
        </div>
      )}
      {preview ? (
        <div style={{
          position: 'relative', borderRadius: 8, overflow: 'hidden',
          border: `1px solid #333`, background: '#111', maxWidth: 280,
        }}>
          {isImage && <img src={preview} alt="" style={{ width: '100%', height: 120, objectFit: 'cover', display: 'block' }} />}
          {isPdf && <div style={{ height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#1a1a2e', color: '#999' }}><FileText size={24} /> PDF</div>}
          {isVideo && <div style={{ height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#1a1a2e', color: '#999' }}><Video size={24} /> Video</div>}
          {!isImage && !isPdf && !isVideo && preview && (
            <div style={{ height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#999', padding: 8, wordBreak: 'break-all' }}>{preview}</div>
          )}
          <div style={{ position: 'absolute', top: 4, right: 4, display: 'flex', gap: 4 }}>
            {deleting ? (
              <Loader2 size={14} color="white" style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
              <button onClick={handleDelete} title="Hapus dari server" style={{ width: 24, height: 24, borderRadius: '50%', background: '#EF4444DD', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Trash2 size={12} color="white" />
              </button>
            )}
          </div>
          <div style={{ padding: '4px 8px', fontSize: 10, color: '#888', background: '#00000060', textAlign: 'center' }}>
            {preview.split('/').pop()}
          </div>
        </div>
      ) : (
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          style={{
            width: 200, height: 100, borderRadius: 8,
            border: `2px dashed ${dragOver ? ORG : '#333'}`,
            background: dragOver ? ORG + '10' : 'transparent',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
            cursor: 'pointer', transition: 'all 0.2s',
          }}
        >
          {uploading ? (
            <Loader2 size={20} color={ORG} style={{ animation: 'spin 1s linear infinite' }} />
          ) : (
            <>
              <Upload size={18} color={ORG} />
              <span style={{ fontSize: 11, color: '#888' }}>{label}</span>
            </>
          )}
        </div>
      )}
      <input ref={inputRef} type="file" accept={accept} onChange={handleFile} style={{ display: 'none' }} />
    </div>
  );
}

const Upload = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);
