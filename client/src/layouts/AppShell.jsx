import { NavLink, Outlet } from 'react-router-dom';
import { FiCpu, FiFileText, FiGrid, FiLogOut, FiPlusCircle, FiSend } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext.jsx';
import { isRoleAllowed, OWNER_REVIEWER_ROLES } from '../utils/roles.js';

const navigationItems = [
  { label: 'Dashboard', to: '/dashboard', icon: FiGrid },
  { label: 'Documents', to: '/documents', icon: FiFileText },
  {
    label: 'Upload',
    to: '/documents/upload',
    icon: FiPlusCircle,
    allowedRoles: OWNER_REVIEWER_ROLES,
  },
  { label: 'Requests', to: '/requests', icon: FiSend },
  { label: 'Agent Chat', to: '/agent', icon: FiCpu },
];

function getNavLinkClass({ isActive }) {
  return [
    'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition',
    isActive
      ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20'
      : 'text-slate-300 hover:bg-white/10 hover:text-white',
  ].join(' ');
}

function AppShell() {
  const { user, logout } = useAuth();
  const visibleNavigation = navigationItems.filter((item) =>
    isRoleAllowed(user?.role, item.allowedRoles || []),
  );

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-6 sm:px-8 lg:px-10">
        <header className="flex flex-col gap-4 border-b border-white/10 pb-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-100/80">
              PrivateAI Agent
            </p>
            <p className="mt-1 text-sm text-slate-400">
              Protected workspace routing shell
            </p>
          </div>

          <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 md:justify-end">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{user?.name || 'User'}</p>
              <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                {user?.role || 'role pending'}
              </p>
            </div>
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm font-semibold text-slate-100 hover:bg-white/10"
            >
              <FiLogOut aria-hidden="true" />
              Logout
            </button>
          </div>
        </header>

        <div className="grid flex-1 gap-6 py-6 lg:grid-cols-[16rem_1fr]">
          <aside className="rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-3 lg:self-start">
            <nav className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
              {visibleNavigation.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink key={item.to} to={item.to} className={getNavLinkClass} end>
                    <Icon aria-hidden="true" className="h-5 w-5 shrink-0" />
                    {item.label}
                  </NavLink>
                );
              })}
            </nav>
          </aside>

          <div className="min-w-0">
            <Outlet />
          </div>
        </div>
      </div>
    </main>
  );
}

export default AppShell;
