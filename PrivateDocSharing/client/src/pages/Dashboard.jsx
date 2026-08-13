import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HiDocumentText, HiMail, HiBell, HiCheckCircle, HiClock, HiExclamation } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext.jsx';
import { getDocuments } from '../services/documents.js';
import { getRequests } from '../services/requests.js';
import { getNotifications } from '../services/notifications.js';

function StatCard({ icon: Icon, title, count, subtitle, colorClass }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-xl backdrop-blur-md transition hover:border-white/20">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-400">{title}</span>
        <div className={`rounded-2xl p-3 ${colorClass}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
      <p className="mt-4 text-3xl font-extrabold tracking-tight text-white">{count}</p>
      {subtitle ? <p className="mt-1 text-xs text-slate-400">{subtitle}</p> : null}
    </div>
  );
}

function Dashboard() {
  const { user } = useAuth();
  const location = useLocation();
  const wasDenied = Boolean(location.state?.deniedPath);

  const [documents, setDocuments] = useState([]);
  const [requests, setRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const role = (user?.role || 'member').toLowerCase();

  useEffect(() => {
    let isMounted = true;

    async function loadDashboardData() {
      setLoading(true);
      setError(null);

      try {
        const [docsRes, reqsRes, notifsRes] = await Promise.allSettled([
          getDocuments(),
          getRequests(),
          getNotifications(),
        ]);

        if (isMounted) {
          setDocuments(docsRes.status === 'fulfilled' ? docsRes.value : []);
          setRequests(reqsRes.status === 'fulfilled' ? reqsRes.value : []);
          setNotifications(notifsRes.status === 'fulfilled' ? notifsRes.value : []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load dashboard statistics.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  const stats = useMemo(() => {
    const totalDocs = documents.length;
    const totalReqs = requests.length;
    const unreadNotifs = notifications.filter((n) => !n.read).length;

    const pendingReqs = requests.filter(
      (r) => r.status === "pending" || r.status === "opened"
    ).length;

    const inReviewReqs = requests.filter(
      (r) =>
        r.status === "in_review" ||
        r.status === "discussion"
    ).length;

    const completedReqs = requests.filter(
      (r) =>
        r.status === "completed" ||
        r.status === "signed"
    ).length;

    return {
      totalDocs,
      totalReqs,
      unreadNotifs,
      pendingReqs,
      inReviewReqs,
      completedReqs,
    };
  }, [documents, requests, notifications]);

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <header className="rounded-3xl border border-white/10 bg-gradient-to-r from-brand-900/40 via-slate-900/80 to-purple-900/30 p-8 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-brand-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-300 ring-1 ring-brand-500/30">
                {role} View
              </span>
              <span className="text-xs text-slate-400">Org: {user?.organizationId || 'Default Org'}</span>
            </div>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Welcome back, {user?.name || 'User'}
            </h1>
            <p className="mt-1 text-sm text-slate-300">
              {role === 'owner'
                ? 'Organization-wide document metrics and request overview.'
                : role === 'reviewer'
                  ? 'Your uploaded documents and sent requests.'
                  : 'Requests and documents assigned to you.'}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {role === 'owner' || role === 'reviewer' ? (
              <Link
                to="/documents/upload"
                className="rounded-2xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-600 shadow-lg shadow-brand-500/25"
              >
                Upload Document
              </Link>
            ) : null}
            <Link
              to="/requests"
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
            >
              View Requests
            </Link>
          </div>
        </div>
      </header>

      {/* Role Denied Notice if redirected */}
      {wasDenied ? (
        <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-200 flex items-center gap-3">
          <HiExclamation className="h-5 w-5 text-amber-400 shrink-0" />
          <span>Access Restricted: Your current role ({role}) cannot access {location.state.deniedPath}.</span>
        </div>
      ) : null}

      {/* Stats Grid */}
      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={HiDocumentText}
          title={role === 'member' ? 'Available Documents' : 'Total Documents'}
          count={loading ? '…' : stats.totalDocs}
          subtitle={role === 'reviewer' ? 'Uploaded by you' : 'In organization'}
          colorClass="bg-blue-500/20"
        />
        <StatCard
          icon={HiMail}
          title="Pending Requests"
          count={loading ? '…' : stats.pendingReqs}
          subtitle="Awaiting action"
          colorClass="bg-amber-500/20"
        />
        <StatCard
          icon={HiClock}
          title="In Review / Discussion"
          count={loading ? '…' : stats.inReviewReqs}
          subtitle="Active workflows"
          colorClass="bg-purple-500/20"
        />
        <StatCard
          icon={HiCheckCircle}
          title="Completed / Signed"
          count={loading ? '…' : stats.completedReqs}
          subtitle="Finished workflows"
          colorClass="bg-emerald-500/20"
        />
      </section>

      {/* Content Section: Documents & Requests Lists */}
      {loading ? (
        <div className="rounded-3xl border border-white/10 bg-slate-900/40 p-12 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-brand-400 border-t-transparent" />
          <p className="mt-4 text-sm text-slate-400">Loading metrics and records…</p>
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-rose-500/30 bg-rose-500/10 p-6 text-center text-rose-200">
          {error}
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Documents Widget */}
          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <HiDocumentText className="h-5 w-5 text-brand-400" />
                Recent Documents
              </h2>
              <Link to="/documents" className="text-xs font-semibold text-brand-400 hover:text-brand-300">
                View all
              </Link>
            </div>
            {documents.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-400">
                No documents found.
              </div>
            ) : (
              <ul className="mt-4 divide-y divide-white/5">
                {documents.slice(0, 5).map((doc) => (
                  <li key={doc.id} className="flex items-center justify-between py-3 text-sm">
                    <div>
                      <p className="font-semibold text-slate-200">{doc.name}</p>
                      <p className="text-xs text-slate-400">By {doc.uploadedBy || 'Unknown'} • {doc.createdAt || 'Recent'}</p>
                    </div>
                    <span className="rounded-full bg-white/5 px-2.5 py-1 text-xs font-medium text-slate-300">
                      {doc.status || 'ACTIVE'}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Requests Widget */}
          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <HiMail className="h-5 w-5 text-purple-400" />
                Active Requests
              </h2>
              <Link to="/requests" className="text-xs font-semibold text-brand-400 hover:text-brand-300">
                View all
              </Link>
            </div>
            {requests.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-400">
                No active requests found.
              </div>
            ) : (
              <ul className="mt-4 divide-y divide-white/5">
                {requests.slice(0, 5).map((req) => (
                  <li key={req.id} className="flex items-center justify-between py-3 text-sm">
                    <div>
                      <Link to={`/requests/${req.id}`} className="font-semibold text-brand-200 hover:underline">
                        {req.title || `Request #${req.id}`}
                      </Link>
                      <p className="text-xs text-slate-400">Recipient: {req.recipient || 'N/A'}</p>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${req.status === 'COMPLETED' || req.status === 'SIGNED'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : req.status === 'IN_REVIEW'
                          ? 'bg-purple-500/20 text-purple-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}>
                      {req.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
