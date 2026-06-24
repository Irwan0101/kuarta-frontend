import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          minHeight: '100vh', background: '#0A0A0F', color: '#E8E8F0',
          fontFamily: "'Plus Jakarta Sans', sans-serif", padding: 40, textAlign: 'center',
        }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>⚠️</div>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Terjadi Kesalahan
          </h1>
          <p style={{ fontSize: 14, color: '#9999B3', maxWidth: 400, marginBottom: 24 }}>
            Maaf, terjadi kesalahan yang tidak terduga. Silakan muat ulang halaman.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: 'linear-gradient(135deg, #FF6B00, #FF8C00)', color: 'white',
              border: 'none', padding: '12px 28px', borderRadius: 12, fontWeight: 700,
              fontSize: 14, cursor: 'pointer',
            }}
          >
            Muat Ulang Halaman
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
