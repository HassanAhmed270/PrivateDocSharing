import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { HiMail, HiSearch, HiChevronRight, HiPlus } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { getRequests } from '../services/requests.js';

function statusGroup(status) {
  if (status === 'completed' || status === 'signed') return 'COMPLETED';
  if (status === 'in_review' || status === 'discussion' || status === 'accepted') return 'IN_REVIEW';
  return 'PENDING';
}

function RequestsList() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => {
    getRequests()
      .then(setRequests)
      .catch((err) => toast.error(err.response?.data?.message || 'Failed to load requests.'))
      .finally(() => setLoading(false));
  }, []);

  const filteredRequests = requests.filter((request) => {
    const query = search.toLowerCase();
    const matchesSearch =
      request.title.toLowerCase().includes(query) ||
      request.sender.toLowerCase().includes(query) ||
      request.recipient.toLowerCase().includes(query);

    return matchesSearch && (filterStatus === 'ALL' || statusGroup(request.status) === filterStatus);
  });

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Document Requests</h1>
          <p className="mt-1 text-sm text-slate-400">Review, discuss, sign, complete, or cancel secure document workflows.</p>
        </div>
        <Link to="/requests/new" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-600">
          <HiPlus className="h-5 w-5" />
          New Request
        </Link>
      </header>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <HiSearch className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
          <input
            type="search"
            placeholder="Search by document, sender, or recipient…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-slate-900/60 py-3 pl-11 pr-4 text-sm text-white placeholder-slate-500 focus:border-brand-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {['ALL', 'PENDING', 'IN_REVIEW', 'COMPLETED'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`rounded-2xl px-4 py-2.5 text-xs font-semibold uppercase ${filterStatus === status ? 'bg-brand-500 text-white' : 'border border-white/10 bg-white/5 text-slate-300'}`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-white/10 bg-slate-900/40 p-12 text-center text-sm text-slate-400">Loading requests…</div>
      ) : filteredRequests.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-slate-900/40 p-12 text-center text-slate-400">
          <HiMail className="mx-auto h-12 w-12 text-slate-600" />
          <p className="mt-3 font-semibold">No requests found</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredRequests.map((request) => (
            <Link
              key={request.id}
              to={`/requests/${request.id}`}
              className="group flex items-center justify-between rounded-3xl border border-white/10 bg-slate-900/60 p-6 transition hover:border-white/20 hover:bg-slate-900/80"
            >
              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-brand-500/10 p-3 text-brand-300"><HiMail className="h-6 w-6" /></div>
                <div>
                  <h3 className="font-bold text-white group-hover:text-brand-200">{request.title}</h3>
                  <div className="mt-1 flex flex-wrap gap-x-3 text-xs text-slate-400">
                    <span>From: <strong className="text-slate-300">{request.sender}</strong></span>
                    <span>To: <strong className="text-slate-300">{request.recipient}</strong></span>
                    <span>{request.status}</span>
                  </div>
                </div>
              </div>
              <HiChevronRight className="h-5 w-5 text-slate-500 group-hover:text-white" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default RequestsList;
