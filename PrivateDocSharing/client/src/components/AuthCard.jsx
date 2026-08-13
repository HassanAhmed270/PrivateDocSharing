import { FiLock } from 'react-icons/fi';

function AuthCard({ eyebrow, title, description, children }) {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <section className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] shadow-glow lg:grid-cols-[0.95fr_1.05fr]">
          <aside className="hidden bg-brand-500/10 p-10 ring-1 ring-inset ring-white/10 lg:block">
            <div className="flex h-full flex-col justify-between">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500 text-white">
                  <FiLock aria-hidden="true" className="h-6 w-6" />
                </div>
                <p className="mt-8 text-sm font-semibold uppercase tracking-[0.24em] text-brand-100/80">
                  PrivateAI Agent
                </p>
                <h1 className="mt-4 text-4xl font-bold tracking-tight text-white">
                  Secure organization access for document workflows.
                </h1>
                <p className="mt-5 text-base leading-7 text-slate-300">
                  Sign in with your organization account to upload documents,
                  manage requests, and use the confirm-before-execute AI agent.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 text-sm text-slate-300">
                Only your JWT token and minimal profile fields are persisted in
                this browser. Passwords are never stored locally.
              </div>
            </div>
          </aside>

          <div className="p-6 sm:p-10 lg:p-12">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-100/80">
              {eyebrow}
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {title}
            </h2>
            {description ? (
              <p className="mt-3 text-sm leading-6 text-slate-400">{description}</p>
            ) : null}

            <div className="mt-8">{children}</div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default AuthCard;
