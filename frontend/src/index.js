// src/index.js - TEMPORARY DEBUG VERSION
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
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

const queryClient = new QueryClient();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ErrorCatcher>
        <React.Suspense fallback="Loading...">
          <App />
        </React.Suspense>
      </ErrorCatcher>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>
);