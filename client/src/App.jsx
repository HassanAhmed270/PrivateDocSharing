import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import PublicOnlyRoute from './components/PublicOnlyRoute.jsx';
import { useAuth } from './context/AuthContext.jsx';
import AppShell from './layouts/AppShell.jsx';
import AgentChat from './pages/AgentChat.jsx';
import Dashboard from './pages/Dashboard.jsx';
import DocumentUpload from './pages/DocumentUpload.jsx';
import Documents from './pages/Documents.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import RequestDetail from './pages/RequestDetail.jsx';
import RequestsList from './pages/RequestsList.jsx';
import Forbidden from './pages/Forbidden.jsx';
import { OWNER_REVIEWER_ROLES } from './utils/roles.js';

function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center shadow-glow">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-brand-100/30 border-t-brand-100" />
          <p className="mt-4 text-sm text-slate-300">Restoring your session…</p>
        </div>
      </main>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <Login />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicOnlyRoute>
            <Register />
          </PublicOnlyRoute>
        }
      />
      <Route path="/forbidden" element={<Forbidden />} />

      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/documents" element={<Documents />} />
        <Route element={<ProtectedRoute allowedRoles={OWNER_REVIEWER_ROLES} />}>
          <Route path="/documents/upload" element={<DocumentUpload />} />
        </Route>
        <Route path="/requests" element={<RequestsList />} />
        <Route path="/requests/:id" element={<RequestDetail />} />
        <Route path="/agent" element={<AgentChat />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
