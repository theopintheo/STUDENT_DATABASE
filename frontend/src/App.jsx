import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardHome from './pages/DashboardHome';
import LeadsPage from './pages/LeadsPage';
import StudentsPage from './pages/StudentsPage';
import SharePlatform from './pages/SharePlatform';
import LeadDetailPage from './pages/LeadDetailPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardHome />} />
            <Route path="leads" element={<LeadsPage />} />
            <Route path="leads/:id" element={<LeadDetailPage />} />
            <Route path="students" element={<StudentsPage />} />
            <Route path="share" element={<SharePlatform />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
