import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { FiCpu, FiFileText, FiGrid, FiLogOut, FiPlusCircle, FiSend, FiBell } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext.jsx';
import { isRoleAllowed, ADMIN_ROLES } from '../utils/roles.js';
import { getNotifications, markNotificationRead } from '../services/notifications.js';
import toast from 'react-hot-toast';

const navigationItems = [
  { label: 'Dashboard', to: '/dashboard', icon: FiGrid },
  { label: 'Documents', to: '/documents', icon: FiFileText },
  {
    label: 'Upload',
    to: '/documents/upload',
    icon: FiPlusCircle,
    allowedRoles: ADMIN_ROLES,
  },
  { label: 'Requests', to: '/requests', icon: FiSend },
  { label: 'Agent Chat', to: '/agent', icon: FiCpu },
];

function getNavLinkClass({ isActive }) {
  return [
    'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-200',
    isActive
      ? 'bg-gradient-to-r from-sky-500 to-brand-500 text-white shadow-glow-brand'
      : 'text-slate-400 hover:bg-white/[0.06] hover:text-white hover:translate-x-1',
  ].join(' ');
}

function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const visibleNavigation = navigationItems.filter((item) =>
    isRoleAllowed(user?.role, item.allowedRoles || []),
  );

  useEffect(() => {
    async function loadNotifications() {
      try {
        const notifs = await getNotifications();
        setNotifications(notifs);
      } catch (err) {
        // Fail silently in shell header
      }
    }
    if (user) {
      loadNotifications();
    }
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  async function handleNotificationClick(notif) {
    setShowDropdown(false);
    try {
      await markNotificationRead(notif.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
      );
      if (notif.requestId) {
        navigate(`/requests/${notif.requestId}`);
      }
    } catch (err) {
      toast.error('Failed to mark notification as read.');
    }
  }

  return (
    <main className="min-h-screen bg-[#020617] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-6 sm:px-8 lg:px-10">
        <header className="flex flex-col gap-4 border-b border-white/5 pb-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.24em] bg-gradient-to-r from-sky-400 to-brand-300 bg-clip-text text-transparent">
              PrivateAI Agent
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Secured Document Authorization Workspace
            </p>
          </div>

          <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/5 bg-slate-900/40 px-4 py-2.5 md:justify-end relative backdrop-blur-md">
            {/* Notification Bell */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowDropdown(!showDropdown)}
                className="relative rounded-xl border border-white/5 p-2.5 hover:bg-white/5 transition text-slate-400 hover:text-white"
              >
                <FiBell className="h-4.5 w-4.5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-rose-500 text-[9px] font-extrabold text-white ring-2 ring-slate-950">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown overlay */}
              {showDropdown && (
                <div className="absolute right-0 mt-3 z-50 w-80 rounded-2xl border border-white/10 bg-slate-900/90 p-4 shadow-2xl backdrop-blur-xl glass-dropdown">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Notifications</span>
                    <span className="text-[10px] bg-brand-500/25 px-2 py-0.5 rounded text-brand-300 font-semibold">{unreadCount} Unread</span>
                  </div>
                  {notifications.length === 0 ? (
                    <p className="py-6 text-center text-xs text-slate-500">No notifications found.</p>
                  ) : (
                    <ul className="max-h-60 overflow-y-auto divide-y divide-white/5 space-y-1 pr-1 scrollbar-thin">
                      {notifications.map((n) => (
                        <li key={n.id} className="py-2">
                          <button
                            onClick={() => handleNotificationClick(n)}
                            className={`w-full text-left rounded-xl p-2 transition text-xs ${
                              n.read
                                ? 'text-slate-400 hover:bg-white/5'
                                : 'bg-brand-500/10 text-white font-semibold hover:bg-brand-500/15'
                            }`}
                          >
                            <p className="truncate">{n.title || 'Notification'}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">{n.message}</p>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{user?.name || 'User'}</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                {user?.role || 'role pending'}
              </p>
            </div>
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm font-semibold text-slate-300 hover:bg-white/10 transition"
            >
              <FiLogOut aria-hidden="true" />
              Logout
            </button>
          </div>
        </header>

        <div className="grid flex-1 gap-6 py-6 lg:grid-cols-[16rem_1fr]">
          <aside className="rounded-3xl border border-white/5 bg-slate-900/20 p-3 lg:self-start backdrop-blur-md">
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
