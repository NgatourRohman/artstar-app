import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import ToastContainer from './components/ui/Toast';
import ErrorBoundary from './components/layout/ErrorBoundary';
import AppShell from './components/layout/AppShell';
import Dashboard from './pages/Dashboard';
import Gallery from './pages/Gallery';
import Competitions from './pages/Competitions';
import Badges from './pages/Badges';
import Timeline from './pages/Timeline';
import Profile from './pages/Profile';
import Login from './pages/Login';
import SharedView from './pages/SharedView';

function ProtectedRoute({ children }) {
  const { session, isDemoMode } = useAuth();
  if (!session && !isDemoMode) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function PublicRoute({ children }) {
  const { session, isDemoMode } = useAuth();
  if (session || isDemoMode) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/shared/:shareId" element={<SharedView />} />

      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/competitions" element={<Competitions />} />
        <Route path="/badges" element={<Badges />} />
        <Route path="/timeline" element={<Timeline />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <NotificationProvider>
          <AuthProvider>
            <AppRoutes />
            <Analytics />
            <ToastContainer />
          </AuthProvider>
        </NotificationProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
