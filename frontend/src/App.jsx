import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import './App.css';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { PermissionProvider } from './context/PermissionContext';

// Layout Components
import Layout from './components/layout/Layout';
import AuthLayout from './components/auth/AuthLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Loading Component
const LoadingSpinner = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f8f9fa'
  }}>
    <div style={{
      width: '40px',
      height: '40px',
      border: '3px solid rgba(102, 126, 234, 0.3)',
      borderTop: '3px solid #667eea',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }}></div>
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);
const queryClient = new QueryClient();


// Lazy load pages for better performance
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const LeadsPage = lazy(() => import('./pages/LeadsPage'));
const StudentsPage = lazy(() => import('./pages/StudentsPage'));
const CoursesPage = lazy(() => import('./pages/CoursesPage'));
const EnrollmentsPage = lazy(() => import('./pages/EnrollmentsPage'));
const PaymentsPage = lazy(() => import('./pages/PaymentsPage'));
const AttendancePage = lazy(() => import('./pages/AttendancePage'));
const ContentPage = lazy(() => import('./pages/ContentPage'));
const UsersPage = lazy(() => import('./pages/UsersPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));

// Error Boundary for individual routes
class RouteErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Route Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '2rem',
          textAlign: 'center',
          backgroundColor: '#fee',
          borderRadius: '8px',
          margin: '2rem'
        }}>
          <h3 style={{ color: '#dc3545' }}>Error loading this page</h3>
          <p>Please try refreshing or contact support if the problem persists.</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
    <Router>
      <AuthProvider>
        <PermissionProvider>
          {/* Toast Notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
          
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              {/* Public Routes - Authentication */}
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<LoginPage />} />
              </Route>

              {/* Protected Routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={
                  <RouteErrorBoundary>
                    <DashboardPage />
                  </RouteErrorBoundary>
                } />
                <Route path="leads" element={
                  <RouteErrorBoundary>
                    <LeadsPage />
                  </RouteErrorBoundary>
                } />
                <Route path="students" element={
                  <RouteErrorBoundary>
                    <StudentsPage />
                  </RouteErrorBoundary>
                } />
                <Route path="courses" element={
                  <RouteErrorBoundary>
                    <CoursesPage />
                  </RouteErrorBoundary>
                } />
                <Route path="enrollments" element={
                  <RouteErrorBoundary>
                    <EnrollmentsPage />
                  </RouteErrorBoundary>
                } />
                <Route path="payments" element={
                  <RouteErrorBoundary>
                    <PaymentsPage />
                  </RouteErrorBoundary>
                } />
                <Route path="attendance" element={
                  <RouteErrorBoundary>
                    <AttendancePage />
                  </RouteErrorBoundary>
                } />
                <Route path="content" element={
                  <RouteErrorBoundary>
                    <ContentPage />
                  </RouteErrorBoundary>
                } />
                <Route path="users" element={
                  <RouteErrorBoundary>
                    <UsersPage />
                  </RouteErrorBoundary>
                } />
                <Route path="profile" element={
                  <RouteErrorBoundary>
                    <ProfilePage />
                  </RouteErrorBoundary>
                } />
              </Route>

              {/* 404 Route */}
              <Route path="*" element={
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '100vh',
                  flexDirection: 'column'
                }}>
                  <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>404</h1>
                  <p style={{ marginBottom: '2rem' }}>Page not found</p>
                  <a
                    href="/"
                    style={{
                      padding: '0.75rem 1.5rem',
                      backgroundColor: '#667eea',
                      color: 'white',
                      borderRadius: '4px',
                      textDecoration: 'none'
                    }}
                  >
                    Go to Dashboard
                  </a>
                </div>
              } />
            </Routes>
          </Suspense>
        </PermissionProvider>
      </AuthProvider>
    </Router>
    </QueryClientProvider>
  );
}

// Export the App component
export default App;