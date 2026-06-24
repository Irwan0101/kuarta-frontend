import { Loader } from 'lucide-react';

export default function LoadingFallback({ message = 'Memuat halaman...' }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', gap: 16, color: '#8888A0', fontSize: 13,
    }}>
      <Loader size={28} style={{ animation: 'spin 1s linear infinite', color: '#FF6B00' }} />
      <span>{message}</span>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
