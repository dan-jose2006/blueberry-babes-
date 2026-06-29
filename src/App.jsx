import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import AIPanel from './components/AIPanel';
import Dashboard from './pages/Dashboard';
import Deadlines from './pages/Deadlines';
import Attendance from './pages/Attendance';
import CalendarPage from './pages/CalendarPage';
import Automations from './pages/Automations';
import Settings from './pages/Settings';
import AuthPage from './pages/AuthPage';
import Onboarding from './pages/Onboarding';
import './index.css';

// ── Protected App Shell ─────────────────────────────────────────────────────
function AppShell() {
  const { activeView, setActiveView, darkMode, sidebarOpen } = useApp();

  useEffect(() => {
    document.documentElement.className = darkMode ? 'dark' : 'light';
  }, [darkMode]);

  const pages = {
    dashboard:   <Dashboard />,
    deadlines:   <Deadlines />,
    attendance:  <Attendance />,
    calendar:    <CalendarPage />,
    automations: <Automations />,
    settings:    <Settings />,
  };

  return (
    <div
      className="app-layout"
      style={{ gridTemplateColumns: sidebarOpen ? '260px 1fr' : '72px 1fr', position: 'relative' }}
    >
      <Sidebar />
      <Navbar />
      <main className="main-content">
        {pages[activeView] || <Dashboard />}
      </main>
      <AIPanel />
    </div>
  );
}

// ── Route Guard ─────────────────────────────────────────────────────────────
function RequireAuth({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  return children;
}

function RequireOnboarding({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  return children;
}

// ── Root ────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <Routes>
          {/* Public */}
          <Route path="/auth" element={<AuthPage />} />

          {/* After registration */}
          <Route
            path="/onboarding"
            element={
              <RequireAuth>
                <Onboarding />
              </RequireAuth>
            }
          />

          {/* Main App (requires auth + onboarding) */}
          <Route
            path="/app"
            element={
              <RequireOnboarding>
                <AppShell />
              </RequireOnboarding>
            }
          />

          {/* Root redirect */}
          <Route path="/" element={<Navigate to="/auth" replace />} />
          <Route path="*" element={<Navigate to="/auth" replace />} />
        </Routes>
      </AppProvider>
    </AuthProvider>
  );
}
