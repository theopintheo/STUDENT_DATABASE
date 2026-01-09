// src/components/ErrorBoundary.jsx
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', background: '#ffdddd' }}>
          <h2>Something went wrong</h2>
          <pre>{JSON.stringify(this.state.error, null, 2)}</pre>
          <button onClick={() => window.location.reload()}>
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}