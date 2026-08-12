import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { HiMail, HiSearch, HiChevronRight, HiFilter } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { getRequests } from '../services/requests.js';
import { useAuth } from '../context/AuthContext.jsx';

function RequestsList() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => {
    async function fetchRequests() {
      try {
        const data = await getRequests();
        setRequests(data);
      } catch (err) {
        toast.error('Failed to load signature requests.');
      } finally {
        setLoading(false);
      }
    }
    fetchRequests();
  }, []);

  const filteredRequests = requests.filter((req) => {
    const titleMatch = (req.title || '').toLowerCase().includes(search.toLowerCase());
    const recipientMatch = (req.recipient || '').toLowerCase().includes(search.toLowerCase());
    const senderMatch = (req.sender || '').toLowerCase().includes(search.toLowerCase());

    const statusMatch =
      filterStatus === 'ALL' ||
      (filterStatus === 'PENDING' && (req.status === 'SENT' || req.status === 'PENDING')) ||
      (filterStatus === 'IN_REVIEW' && (req.status === 'IN_REVIEW' || req.status === 'DISCUSSION')) ||
      (filterStatus === 'COMPLETED' && (req.status === 'COMPLETED' || req.status === 'SIGNED'));

    return (titleMatch || recipientMatch || senderMatch) && statusMatch;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Signature Requests</h1>
        <p className="mt-1 text-sm text-slate-400">
          Track, discuss, and sign organizational documents assigned to you or sent by you.
        </p>
      </header>

      {/* Controls Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <HiSearch className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title, sender, or recipient…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-slate-900/60 pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap gap-2">
          {['ALL', 'PENDING', 'IN_REVIEW', 'COMPLETED'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`rounded-2xl px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition ${
                filterStatus === status
                  ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20'
                  : 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Requests List */}
      {loading ? (
        <div className="rounded-3xl border border-white/10 bg-slate-900/40 p-12 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-brand-400 border-t-transparent" />
          <p className="mt-4 text-sm text-slate-400">Loading requests feed…</p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-slate-900/40 p-12 text-center text-slate-400">
          <HiMail className="mx-auto h-12 w-12 text-slate-600" />
          <p className="mt-3 font-semibold">No requests found</p>
          <p className="text-xs text-slate-500">No signature requests match your selected filters.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredRequests.map((req) => (
            <Link
              key={req.id}
              to={`/requests/${req.id}`}
              className="group flex items-center justify-between rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-lg backdrop-blur-md transition hover:border-white/20 hover:bg-slate-900/80"
            >
              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-brand-500/10 p-3 text-brand-300 group-hover:bg-brand-500/20">
                  <HiMail className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-white group-hover:text-brand-200 transition">
                    {req.title || `Request #${req.id}`}
                  </h3>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                    <span>From: <strong className="text-slate-300">{req.sender}</strong></span>
                    <span>•</span>
                    <span>To: <strong className="text-slate-300">{req.recipient}</strong></span>
                    {req.createdAt ? (
                      <>
                        <span>•</span>
                        <span>{req.createdAt}</span>
                      </>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold border ${
                  req.status === 'COMPLETED' || req.status === 'SIGNED'
                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                    : req.status === 'IN_REVIEW' || req.status === 'DISCUSSION'
                    ? 'bg-purple-500/10 text-purple-300 border-purple-500/20'
                    : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                }`}>
                  {req.status}
                </span>
                <HiChevronRight className="h-5 w-5 text-slate-500 transition group-hover:translate-x-1 group-hover:text-white" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default RequestsList;
