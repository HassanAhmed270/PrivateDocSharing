import { Link, useLocation } from 'react-router-dom';
import ProtectedPagePlaceholder from '../components/ProtectedPagePlaceholder.jsx';
import { useAuth } from '../context/AuthContext.jsx';

function Dashboard() {
  const { user } = useAuth();
  const location = useLocation();
  const wasDenied = Boolean(location.state?.deniedPath);

  return (
    <ProtectedPagePlaceholder
      eyebrow="Dashboard"
      title="Role-aware dashboard placeholder"
      description="This protected landing page confirms that authenticated users can enter the app shell. Full dashboard metrics are intentionally deferred to the next phase."
    >
      {wasDenied ? (
        <div className="mb-5 rounded-2xl border border-amber-300/25 bg-amber-300/10 p-4 text-sm text-amber-100">
          Your role cannot access {location.state.deniedPath}. You were returned to the dashboard.
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-slate-900/70 p-4 ring-1 ring-white/10">
          <p className="text-sm text-slate-400">Signed in as</p>
          <p className="mt-1 font-semibold text-white">{user?.name || 'User'}</p>
        </div>
        <div className="rounded-2xl bg-slate-900/70 p-4 ring-1 ring-white/10">
          <p className="text-sm text-slate-400">Role</p>
          <p className="mt-1 font-semibold capitalize text-white">{user?.role || 'Unknown'}</p>
        </div>
        <div className="rounded-2xl bg-slate-900/70 p-4 ring-1 ring-white/10">
          <p className="text-sm text-slate-400">Organization</p>
          <p className="mt-1 truncate font-mono text-brand-100">{user?.organizationId || 'N/A'}</p>
        </div>
      </div>

      <Link
        to="/documents"
        className="mt-6 inline-flex rounded-2xl bg-brand-500 px-5 py-3 font-semibold text-white hover:bg-brand-600"
      >
        Verify protected document route
      </Link>
    </ProtectedPagePlaceholder>
  );
}

export default Dashboard;
