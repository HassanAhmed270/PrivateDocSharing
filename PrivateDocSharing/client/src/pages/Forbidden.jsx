import { Link } from 'react-router-dom';

function Forbidden() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
      <section className="w-full max-w-xl rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 text-center shadow-glow">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-100/80">
          Access denied
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">You cannot access this page.</h1>
        <p className="mt-4 text-slate-300">
          Your current role does not meet this route's frontend guard. Backend authorization still remains the source of truth.
        </p>
        <Link
          to="/dashboard"
          className="mt-6 inline-flex rounded-2xl bg-brand-500 px-5 py-3 font-semibold text-white hover:bg-brand-600"
        >
          Back to dashboard
        </Link>
      </section>
    </main>
  );
}

export default Forbidden;
