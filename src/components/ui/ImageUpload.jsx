import { useState, useRef } from 'react';
import { Upload, X, Image, FileText, Video, Check, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const ORG = '#FF6B00';

export default function ImageUpload({ value, onChange, accept = 'image/*', label = 'Upload', style: containerStyle }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(value || '');
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const uploadFile = async (file) => {
    if (!file) return;
    const form = new FormData();
    form.append('file', file);
    setUploading(true);
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + (useAuthStore.getState().token || '') },
        body: form,
      });
      if (!res.ok) throw new Error('Upload gagal');
      const data = await res.json();
      setPreview(data.url);
      if (onChange) onChange(data.url);
    } catch (e) {
      alert('Gagal upload: ' + (e.message || 'Coba lagi'));
    }
    setUploading(false);
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

  const isImage = preview && /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(preview);
  const isPdf = preview && /\.pdf$/i.test(preview);
  const isVideo = preview && /\.(mp4|webm)$/i.test(preview);

  return (
    <div style={{ ...containerStyle }}>
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
            <button onClick={clear} style={{ width: 24, height: 24, borderRadius: '50%', background: '#EF4444DD', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={12} color="white" />
            </button>
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
