import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('CRITICAL UI ERROR:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-container">
          <div className="error-boundary-content">
            <div className="error-boundary-icon">😵💫</div>
            <h1 className="error-boundary-title">Gak Sengaja Rusak...</h1>
            <p className="error-boundary-message">
              Oops! Terjadi kesalahan teknis saat memuat tampilan ini. Jangan khawatir, karya-karyamu tetap aman!
            </p>
            <div className="error-boundary-actions">
              <button onClick={this.handleReload} className="btn-primary">
                Segarkan Halaman 🔄
              </button>
              <a href="/" className="btn-secondary">
                Kembali ke Beranda 🏠
              </a>
            </div>
            {process.env.NODE_ENV === 'development' && (
              <pre className="error-debug-info">
                {this.state.error?.toString()}
              </pre>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
