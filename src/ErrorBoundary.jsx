import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("React Error Boundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', fontFamily: 'sans-serif', backgroundColor: '#FAF5FF', color: '#202124', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ maxWidth: '600px', width: '100%', background: '#ffffff', padding: '32px', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', border: '1px solid #ECECF5' }}>
            <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#6D5EF8', marginBottom: '12px' }}>🌸 Petals Task System - Runtime Alert</h1>
            <p style={{ fontSize: '14px', color: '#dc2626', fontWeight: '600', marginBottom: '16px' }}>
              {this.state.error && this.state.error.toString()}
            </p>
            <pre style={{ backgroundColor: '#0f172a', color: '#e2e8f0', padding: '16px', borderRadius: '8px', overflowX: 'auto', fontSize: '11px', lineHeight: '1.5' }}>
              {this.state.errorInfo && this.state.errorInfo.componentStack}
            </pre>
            <button 
              onClick={() => window.location.reload()} 
              style={{ marginTop: '20px', padding: '12px 24px', background: 'linear-gradient(135deg, #6D5EF8 0%, #8B7BFF 100%)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
