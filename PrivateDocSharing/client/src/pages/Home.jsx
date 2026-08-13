import { Link } from 'react-router-dom';
import { FiLock, FiMessageSquare, FiUploadCloud } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext.jsx';
import { getRuntimeConfig } from '../utils/env.js';

const roadmapItems = [
  'Authenticated organization workspace',
  'Document upload and request workflows',
  'Confirm-before-execute AI agent chat',
];

function Home() {
  const { apiBaseUrl, socketUrl, organizationEmailDomain } = getRuntimeConfig();
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-8 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between border-b border-white/10 pb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-500/15 text-brand-100 ring-1 ring-brand-500/30">
              <FiLock aria-hidden="true" className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-100/80">
                PrivateAI Agent
              </p>
              <p className="text-xs text-slate-400">Auth foundation</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <span className="hidden text-sm text-slate-300 sm:inline">
                  Signed in as {user?.name || 'user'}
                </span>
                <Link
                  className="rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
                  to="/dashboard"
                >
                  Dashboard
                </Link>
                <button
                  className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-slate-100 hover:bg-white/10"
                  type="button"
                  onClick={logout}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-slate-100 hover:bg-white/10"
                  to="/login"
                >
                  Login
                </Link>
                <Link
                  className="rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
                  to="/register"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </header>

        <div className="grid flex-1 items-center gap-10 py-14 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-sm font-medium text-brand-100">
              Vite + React + Tailwind CSS
            </p>
            <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-6xl">
              Sign in to start secure document workflows.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              Register and login are now connected to the backend auth routes.
              Sessions are rehydrated through <span className="font-mono">GET /api/auth/me</span>{' '}
              and invalid tokens are cleared automatically.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {roadmapItems.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-slate-200"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <aside className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 shadow-glow backdrop-blur">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500 text-white">
                <FiMessageSquare aria-hidden="true" />
              </div>
              <div>
                <h2 className="font-semibold text-white">Session check</h2>
                <p className="text-sm text-slate-400">Auth pages and context are active</p>
              </div>
            </div>

            <dl className="space-y-4 text-sm">
              <div className="rounded-2xl bg-slate-900/70 p-4 ring-1 ring-white/10">
                <dt className="text-slate-400">API base URL</dt>
                <dd className="mt-1 break-all font-mono text-brand-100">{apiBaseUrl}</dd>
              </div>
              <div className="rounded-2xl bg-slate-900/70 p-4 ring-1 ring-white/10">
                <dt className="text-slate-400">Socket URL</dt>
                <dd className="mt-1 break-all font-mono text-brand-100">{socketUrl}</dd>
              </div>
              <div className="rounded-2xl bg-slate-900/70 p-4 ring-1 ring-white/10">
                <dt className="text-slate-400">Accepted email domain</dt>
                <dd className="mt-1 break-all font-mono text-brand-100">
                  {organizationEmailDomain}
                </dd>
              </div>
            </dl>

            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4 text-sm text-amber-100">
              <FiUploadCloud aria-hidden="true" className="mt-0.5 shrink-0" />
              <p>
                Protected routing is active for dashboard, documents, requests,
                and agent placeholders. Full feature content is deferred.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

export default Home;
