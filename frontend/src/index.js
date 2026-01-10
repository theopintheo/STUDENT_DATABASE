// src/index.js - TEMPORARY DEBUG VERSION
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

// Create a wrapper to catch errors
const ErrorCatcher = ({ children }) => {
  const [error, setError] = React.useState(null);
  
  React.useEffect(() => {
    const originalConsoleError = console.error;
    console.error = (...args) => {
      setError(args.join(' '));
      originalConsoleError.apply(console, args);
    };
    
    return () => {
      console.error = originalConsoleError;
    };
  }, []);
  
  if (error) {
    return (
      <div style={{ padding: '20px', fontFamily: 'monospace' }}>
        <h1>🚨 ERROR DETECTED</h1>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Reload</button>
      </div>
    );
  }
  
  return children;
};

// Import your App
const App = React.lazy(() => import('./App'));

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ErrorCatcher>
      <React.Suspense fallback="Loading...">
        <App />
      </React.Suspense>
    </ErrorCatcher>
  </React.StrictMode>
);