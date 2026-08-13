import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import SignatureCanvas from '../components/SignatureCanvas.jsx';
import DiscussionPanel from '../components/DiscussionPanel.jsx';
import {
  HiArrowLeft,
  HiDocumentText,
  HiCheckCircle,
  HiLockClosed,
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';

import {
  acceptRequest,
  cancelRequest,
  completeRequest,
  discussRequest,
  getRequestById,
  getRequestHistory,
  rejectRequest,
  reviewRequest,
  signRequest,
} from '../services/requests.js';

import {
  getDocumentById,
  downloadDocument,
} from '../services/documents.js';


function RequestDetail() {
  const { id } = useParams();
  const { user } = useAuth();

  const [request, setRequest] = useState(null);
  const [document, setDocument] = useState(null);
  const [history, setHistory] = useState([]);
  const [comment, setComment] = useState('');

  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState('');
  const [initialDiscussion, setInitialDiscussion] = useState(null);

  // Controls the signature canvas modal
  const [showSignatureCanvas, setShowSignatureCanvas] = useState(false);

  async function load() {
    try {
      const data = await getRequestById(id);

      setRequest(data);

      if (data.documentId) {
        setDocument(
          await getDocumentById(data.documentId)
        );
      }

      try {
        setHistory(await getRequestHistory(id));
      } catch {
        setHistory([]);
      }
    } catch (err) {
      setError(
        err.response?.status === 403
          ? 'ACCESS_DENIED'
          : err.response?.data?.message ||
              'Failed to load request.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [id]);

async function runAction(action, successMessage) {
  setWorking(true);

  try {
    const result = await action();

    const updated = result?.request ?? result;

    setRequest(updated);
    setComment('');

    if (result?.discussion) {
      setInitialDiscussion(result.discussion);
    }

    try {
      setHistory(await getRequestHistory(id));
    } catch {}

    toast.success(successMessage);
  } catch (err) {
    toast.error(
      err.response?.data?.message ||
        'Action could not be completed.'
    );
  } finally {
    setWorking(false);
  }
}
  /*
   * Called after the reviewer draws a signature
   * and clicks "Sign Document" inside the canvas.
   */
  async function handleSignatureSave(signatureImage) {
    if (!signatureImage) {
      toast.error('Please provide a signature.');
      return;
    }

    setShowSignatureCanvas(false);

    await runAction(
      () => signRequest(id, signatureImage),
      'Document signed successfully.'
    );
  }

  const status = request?.status;

  const isRecipient =
    request?.recipient?.toLowerCase() ===
    user?.name?.toLowerCase();

  const isSender =
    request?.sender?.toLowerCase() ===
    user?.name?.toLowerCase();

  const canAdmin = user?.role === 'admin';

  if (loading) {
    return (
      <div className="rounded-3xl border border-white/10 bg-slate-900/40 p-12 text-center text-slate-400">
        Loading request…
      </div>
    );
  }

  if (error === 'ACCESS_DENIED') {
    return (
      <div className="mx-auto max-w-xl py-12 text-center">
        <HiLockClosed className="mx-auto h-12 w-12 text-rose-400" />

        <h1 className="mt-4 text-2xl font-bold text-white">
          Access Denied
        </h1>

        <p className="mt-2 text-sm text-slate-400">
          You do not have access to this request.
        </p>

        <Link
          to="/requests"
          className="mt-6 inline-flex rounded-2xl bg-brand-500 px-5 py-3 font-semibold text-white"
        >
          Back to requests
        </Link>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="rounded-3xl border border-rose-500/20 bg-rose-500/10 p-8 text-rose-200">
        {error || 'Request not found.'}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <header className="flex items-center justify-between border-b border-white/10 pb-4">
          <Link
            to="/requests"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white"
          >
            <HiArrowLeft className="h-4 w-4" />
            Back to requests
          </Link>

          <span className="rounded-full bg-brand-500/15 px-3 py-1 text-xs font-semibold uppercase text-brand-200">
            {status}
          </span>
        </header>

        <div className="grid gap-6 lg:grid-cols-3">
          <section className="lg:col-span-2 rounded-3xl border border-white/10 bg-slate-900/60 p-7">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-5">
              <div>
                <div className="flex items-center gap-2 text-brand-300">
                  <HiDocumentText className="h-5 w-5" />

                  <span className="text-xs font-semibold uppercase tracking-wider">
                    Secure document request
                  </span>
                </div>

                <h1 className="mt-2 text-2xl font-bold text-white">
                  {document?.name || request.title}
                </h1>

                <p className="mt-2 text-sm text-slate-400">
                  {request.message ||
                    'No request message was provided.'}
                </p>
              </div>
 
              {document && (
                <button
                  onClick={() =>
                    downloadDocument(
                      document.id ?? document._id,
                      document.fileName
                    )
                  }
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-white/10"
                >
                  Download
                </button>
              )}
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Info
                label="Sender"
                value={request.sender}
              />

              <Info
                label="Recipient"
                value={request.recipient}
              />

              <Info
                label="Created"
                value={
                  request.createdAt
                    ? new Date(
                        request.createdAt
                      ).toLocaleString()
                    : '—'
                }
              />

              <Info
                label="Updated"
                value={
                  request.updatedAt
                    ? new Date(
                        request.updatedAt
                      ).toLocaleString()
                    : '—'
                }
              />
            </div>

            <div className="mt-8">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                Workflow actions
              </h2>

              <div className="mt-4 flex flex-wrap gap-3">
                {isRecipient && status === 'pending' && (
                  <ActionButton
                    disabled={working}
                    onClick={() =>
                      runAction(
                        () => reviewRequest(id),
                        'Request moved to review.'
                      )
                    }
                  >
                    Start Review
                  </ActionButton>
                )}

                {isRecipient &&
                  (status === 'pending' ||
                    status === 'in_review') && (
                    <ActionButton
                      disabled={
                        working || !comment.trim()
                      }
                      onClick={() =>
                        runAction(
                          () =>
                            discussRequest(
                              id,
                              comment.trim()
                            ),
                          'Request moved to discussion.'
                        )
                      }
                    >
                      Start Discussion
                    </ActionButton>
                  )}

                {isRecipient &&
                  [
                    'pending',
                    'in_review',
                    'discussion',
                  ].includes(status) && (
                    <ActionButton
                      disabled={working}
                      onClick={() =>
                        runAction(
                          () => acceptRequest(id),
                          'Request accepted.'
                        )
                      }
                    >
                      Accept
                    </ActionButton>
                  )}

                {isRecipient &&
                  [
                    'pending',
                    'in_review',
                    'discussion',
                  ].includes(status) && (
                    <ActionButton
                      variant="danger"
                      disabled={working}
                      onClick={() =>
                        runAction(
                          () =>
                            rejectRequest(
                              id,
                              comment.trim()
                            ),
                          'Request rejected.'
                        )
                      }
                    >
                      Reject
                    </ActionButton>
                  )}

                {/* REAL SIGNING FLOW */}
                {isRecipient && status === 'accepted' && (
                  <ActionButton
                    disabled={working}
                    onClick={() =>
                      setShowSignatureCanvas(true)
                    }
                  >
                    Sign Document
                  </ActionButton>
                )}

                {(isSender || canAdmin) &&
                  status === 'signed' && (
                    <ActionButton
                      disabled={working}
                      onClick={() =>
                        runAction(
                          () => completeRequest(id),
                          'Request completed.'
                        )
                      }
                    >
                      Complete
                    </ActionButton>
                  )}

                {(isSender || canAdmin) &&
                  [
                    'pending',
                    'in_review',
                    'discussion',
                  ].includes(status) && (
                    <ActionButton
                      variant="danger"
                      disabled={working}
                      onClick={() =>
                        runAction(
                          () => cancelRequest(id),
                          'Request cancelled.'
                        )
                      }
                    >
                      Cancel
                    </ActionButton>
                  )}
              </div>

              {['pending', 'in_review'].includes(
                status
              ) &&
                isRecipient && (
                  <textarea
                    rows={4}
                    value={comment}
                    onChange={(e) =>
                      setComment(e.target.value)
                    }
                    placeholder="Add a review/discussion comment…"
                    className="mt-4 w-full rounded-2xl border border-white/10 bg-slate-950 p-4 text-sm text-white placeholder-slate-500 focus:border-brand-500 focus:outline-none"
                  />
                )}
            </div>
          </section>

          <aside className="rounded-3xl border border-white/10 bg-slate-900/60 p-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              Audit history
            </h2>

            <div className="mt-4 space-y-4">
              {history.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No history available.
                </p>
              ) : (
                history.map((entry) => (
                  <div
                    key={entry._id ?? entry.id}
                    className="border-l border-brand-500/30 pl-4"
                  >
                    <p className="text-sm font-semibold text-white">
                      {entry.action}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {entry.createdAt
                        ? new Date(
                            entry.createdAt
                          ).toLocaleString()
                        : ''}
                    </p>
                  </div>
                ))
              )}
            </div>

            {status === 'completed' && (
              <div className="mt-6 flex items-center gap-2 rounded-2xl bg-emerald-500/10 p-4 text-sm text-emerald-300">
                <HiCheckCircle />
                Completed
              </div>
            )}
          </aside>
        </div>
      </div>

      {status === 'discussion' && (
        <DiscussionPanel
          request={request}
          initialDiscussion={initialDiscussion}
          onRequestUpdated={(updatedRequest) => {
            setRequest(updatedRequest);
          }}
        />
      )}

      {showSignatureCanvas && (
        <SignatureCanvas
          onCancel={() =>
            setShowSignatureCanvas(false)
          }
          onSave={handleSignatureSave}
        />
      )}
    </>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-slate-950/60 p-4">
      <p className="text-xs uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-slate-200">
        {value}
      </p>
    </div>
  );
}

function ActionButton({
  children,
  onClick,
  disabled,
  variant = 'primary',
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-2xl px-4 py-2.5 text-sm font-semibold transition disabled:opacity-50 ${
        variant === 'danger'
          ? 'border border-rose-500/30 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20'
          : 'bg-brand-500 text-white hover:bg-brand-600'
      }`}
    >
      {children}
    </button>
  );
}

export default RequestDetail;