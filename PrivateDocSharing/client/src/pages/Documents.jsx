import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { HiDocumentText, HiUpload, HiSearch, HiEye, HiX, HiDownload } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import { getDocuments, getDocumentById } from '../services/documents.js';
import { isRoleAllowed, ADMIN_ROLES } from '../utils/roles.js';

function DocumentPreviewModal({ docId, onClose }) {
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDoc() {
      try {
        const data = await getDocumentById(docId);
        setDoc(data);
      } catch (err) {
        toast.error('Failed to load document details.');
      } finally {
        setLoading(false);
      }
    }
    loadDoc();
  }, [docId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-3xl rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white"
        >
          <HiX className="h-6 w-6" />
        </button>

        {loading ? (
          <div className="py-16 text-center text-slate-400">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-brand-400 border-t-transparent" />
            <p className="mt-3 text-sm">Loading document preview…</p>
          </div>
        ) : doc ? (
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-brand-500/20 p-3 text-brand-300">
                <HiDocumentText className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{doc.name}</h3>
                <p className="text-sm text-slate-400">
                  Uploaded by <span className="text-slate-200">{doc.uploadedBy || 'Unknown'}</span> on {doc.createdAt || 'Recent'}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="rounded-full bg-brand-500/20 px-3 py-1 text-xs font-semibold text-brand-300">
                    Status: {doc.status || 'ACTIVE'}
                  </span>
                </div>
              </div>
            </div>

            {/* Document Preview Box */}
            <div className="rounded-2xl border border-white/10 bg-slate-950 p-6 text-center">
              <div className="mx-auto flex max-w-md flex-col items-center justify-center space-y-3 py-8">
                <HiDocumentText className="h-16 w-16 text-brand-400/60" />
                <p className="text-sm text-slate-300">
                  Document Preview Simulator (`{doc.name}`)
                </p>
                <p className="text-xs text-slate-500">
                  Protected document viewer layer active.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-slate-300 hover:bg-white/10"
              >
                Close Preview
              </button>
            </div>
          </div>
        ) : (
          <p className="py-8 text-center text-slate-400">Document not found.</p>
        )}
      </div>
    </div>
  );
}

function Documents() {
  const { user } = useAuth();
  const canUpload = isRoleAllowed(user?.role, ADMIN_ROLES);

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDocId, setSelectedDocId] = useState(null);

  useEffect(() => {
    async function fetchDocs() {
      try {
        const data = await getDocuments();
        setDocuments(data);
      } catch (err) {
        toast.error('Failed to load documents.');
      } finally {
        setLoading(false);
      }
    }
    fetchDocs();
  }, []);

  const filteredDocs = documents.filter((doc) =>
    (doc.name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <header className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Documents</h1>
          <p className="mt-1 text-sm text-slate-400">
            Organization-wide encrypted document catalog and role-scoped access control.
          </p>
        </div>
        {canUpload ? (
          <Link
            to="/documents/upload"
            className="inline-flex items-center gap-2 rounded-2xl bg-brand-500 px-5 py-3 font-semibold text-white transition hover:bg-brand-600 shadow-lg shadow-brand-500/25"
          >
            <HiUpload className="h-5 w-5" />
            Upload Document
          </Link>
        ) : null}
      </header>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <HiSearch className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search documents by name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-slate-900/60 pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
      </div>

      {/* Document Grid / Table */}
      {loading ? (
        <div className="rounded-3xl border border-white/10 bg-slate-900/40 p-12 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-brand-400 border-t-transparent" />
          <p className="mt-4 text-sm text-slate-400">Loading document catalog…</p>
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-slate-900/40 p-12 text-center text-slate-400">
          <HiDocumentText className="mx-auto h-12 w-12 text-slate-600" />
          <p className="mt-3 font-semibold">No documents found</p>
          <p className="text-xs text-slate-500">Try adjusting your search criteria.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/60 shadow-xl backdrop-blur-md">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="border-b border-white/10 bg-slate-950/50 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-6 py-4">Document Name</th>
                <th className="px-6 py-4">Uploaded By</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredDocs.map((doc) => (
                <tr key={doc.id} className="transition hover:bg-white/[0.02]">
                  <td className="px-6 py-4 font-semibold text-white flex items-center gap-3">
                    <HiDocumentText className="h-5 w-5 text-brand-400 shrink-0" />
                    <span className="truncate max-w-xs">{doc.name}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-300">{doc.uploadedBy || 'Unknown'}</td>
                  <td className="px-6 py-4">
                    <span className="rounded-full bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-300 border border-brand-500/20">
                      {doc.status || 'ACTIVE'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-400">{doc.createdAt || 'Recent'}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setSelectedDocId(doc.id)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-brand-200 transition hover:bg-white/10 hover:text-white"
                    >
                      <HiEye className="h-4 w-4" />
                      Preview
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Preview Modal */}
      {selectedDocId ? (
        <DocumentPreviewModal docId={selectedDocId} onClose={() => setSelectedDocId(null)} />
      ) : null}
    </div>
  );
}

export default Documents;
