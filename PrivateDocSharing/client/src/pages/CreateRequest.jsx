import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { HiArrowLeft, HiPaperAirplane } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { getDocuments } from '../services/documents.js';
import { createRequest } from '../services/requests.js';
import { getOrganizationMembers } from '../services/organizations.js';

function CreateRequest() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [documents, setDocuments] = useState([]);
  const [members, setMembers] = useState([]);
  const [form, setForm] = useState({
    documentId: searchParams.get('documentId') || '',
    recipientId: '',
    message: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([getDocuments(), getOrganizationMembers()])
      .then(([docs, users]) => {
        setDocuments(docs);
        setMembers(users);
        setForm((current) => ({
          ...current,
          documentId: current.documentId || docs[0]?.id || docs[0]?._id || '',
        }));
      })
      .catch((error) => {
        toast.error(error.response?.data?.message || 'Unable to load request form.');
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.documentId || !form.recipientId) {
      toast.error('Select a document and recipient.');
      return;
    }

    setSaving(true);
    try {
      await createRequest({
        documentId: form.documentId,
        recipientType: 'internal',
        recipientId: form.recipientId,
        message: form.message.trim(),
      });
      toast.success('Document request created.');
      navigate('/requests', { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to create request.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link to="/requests" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white">
        <HiArrowLeft className="h-4 w-4" />
        Back to requests
      </Link>

      <section className="rounded-3xl border border-white/10 bg-slate-900/60 p-8 shadow-2xl backdrop-blur-xl">
        <h1 className="text-2xl font-bold text-white">New Document Request</h1>
        <p className="mt-1 text-sm text-slate-400">
          Send one of your active documents to an organization member for review and signature.
        </p>

        {loading ? (
          <div className="py-12 text-center text-sm text-slate-400">Loading workspace data…</div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-300">Document</span>
              <select
                value={form.documentId}
                onChange={(e) => setForm((v) => ({ ...v, documentId: e.target.value }))}
                className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white focus:border-brand-500 focus:outline-none"
              >
                <option value="">Select a document</option>
                {documents.map((doc) => (
                  <option key={doc.id ?? doc._id} value={doc.id ?? doc._id}>
                    {doc.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-300">Recipient</span>
              <select
                value={form.recipientId}
                onChange={(e) => setForm((v) => ({ ...v, recipientId: e.target.value }))}
                className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white focus:border-brand-500 focus:outline-none"
              >
                <option value="">Select an organization member</option>
                {members.map((member) => (
                  <option key={member._id ?? member.id} value={member._id ?? member.id}>
                    {member.name} — {member.email}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-300">Message</span>
              <textarea
                rows={4}
                value={form.message}
                onChange={(e) => setForm((v) => ({ ...v, message: e.target.value }))}
                placeholder="Add instructions for the reviewer…"
                className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-brand-500 focus:outline-none"
              />
            </label>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-500 px-5 py-3.5 font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
            >
              <HiPaperAirplane className="h-5 w-5" />
              {saving ? 'Sending…' : 'Send Request'}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}

export default CreateRequest;
