import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { HiMail, HiDocumentText, HiPaperAirplane, HiArrowLeft, HiLockClosed, HiClock, HiCheckCircle } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import { getRequestById, getRequestMessages, sendRequestMessage, updateRequestStatus } from '../services/requests.js';
import { getDocumentById } from '../services/documents.js';
import SignatureCanvas from '../components/SignatureCanvas.jsx';

function RequestDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  
  const [request, setRequest] = useState(null);
  const [document, setDocument] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sendingMsg, setSendingMsg] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showSignCanvas, setShowSignCanvas] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    async function loadRequestData() {
      try {
        const reqData = await getRequestById(id);
        if (!isMounted) return;
        setRequest(reqData);

        // Fetch referenced document metadata
        if (reqData.documentId) {
          const docData = await getDocumentById(reqData.documentId);
          if (isMounted) setDocument(docData);
        }

        // Fetch thread messages
        const msgsData = await getRequestMessages(id);
        if (isMounted) {
          setMessages(msgsData);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.status === 403 ? 'ACCESS_DENIED' : err.message || 'Failed to load request.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadRequestData();

    return () => {
      isMounted = false;
    };
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSendMessage(e) {
    e.preventDefault();
    if (!newMessage.trim() || sendingMsg) return;

    setSendingMsg(true);
    try {
      const addedMsg = await sendRequestMessage(id, { content: newMessage.trim(), text: newMessage.trim() });
      setMessages((prev) => [...prev, addedMsg]);
      setNewMessage('');
    } catch (err) {
      toast.error('Failed to send message.');
    } finally {
      setSendingMsg(false);
    }
  }

  async function handleStatusChange(newStatus, signatureImage = null) {
    setUpdatingStatus(true);
    try {
      await updateRequestStatus(id, { status: newStatus, signature: signatureImage });
      setRequest((prev) => ({ ...prev, status: newStatus, signature: signatureImage }));
      toast.success(newStatus === 'SIGNED' ? 'Document signed successfully!' : `Status updated to ${newStatus}`);
      setShowSignCanvas(false);
    } catch (err) {
      toast.error('Failed to update status.');
    } finally {
      setUpdatingStatus(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-3xl border border-white/10 bg-slate-900/40 p-12 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-brand-400 border-t-transparent" />
        <p className="mt-4 text-sm text-slate-400">Loading signature request...</p>
      </div>
    );
  }

  if (error === 'ACCESS_DENIED') {
    return (
      <div className="mx-auto max-w-xl text-center space-y-6 py-12">
        <div className="inline-flex rounded-full bg-rose-500/10 p-4 text-rose-400 border border-rose-500/20">
          <HiLockClosed className="h-12 w-12" />
        </div>
        <h1 className="text-2xl font-bold text-white">Access Denied</h1>
        <p className="text-slate-400 text-sm">
          You are not authorized to view this request. You must be the sender, recipient, or an administrator to view this page.
        </p>
        <Link
          to="/requests"
          className="inline-flex rounded-2xl bg-brand-500 px-6 py-3 font-semibold text-white hover:bg-brand-600"
        >
          Back to requests
        </Link>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="mx-auto max-w-xl text-center space-y-6 py-12">
        <h1 className="text-2xl font-bold text-white">Error Loading Request</h1>
        <p className="text-slate-400 text-sm">{error || 'Request details are unavailable.'}</p>
        <Link
          to="/requests"
          className="inline-flex rounded-2xl bg-brand-500 px-6 py-3 font-semibold text-white hover:bg-brand-600"
        >
          Back to requests
        </Link>
      </div>
    );
  }

  const isSender = user && user.name === request.sender;
  const isRecipient = user && (user.name === request.recipient || user.role === 'member');

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <header className="flex items-center justify-between border-b border-white/10 pb-4">
        <Link
          to="/requests"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white"
        >
          <HiArrowLeft className="h-4 w-4" />
          Back to requests
        </Link>
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${
            request.status === 'COMPLETED' || request.status === 'SIGNED'
              ? 'bg-emerald-500/20 text-emerald-300'
              : 'bg-amber-500/20 text-amber-300'
          }`}>
            {request.status}
          </span>
        </div>
      </header>

      {/* Main Grid: Document Preview (Left) & Messages Chat (Right) */}
      <main className="grid gap-6 lg:grid-cols-12">
        {/* Document Panel (Left - 7 cols) */}
        <section className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-xl backdrop-blur-md lg:col-span-7 flex flex-col space-y-5">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <HiDocumentText className="h-5 w-5 text-brand-400" />
              Document Viewer
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Secure Viewer layer powered by PrivateAI agent node keys.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-950 p-6 flex flex-col items-center justify-center text-center space-y-3 py-16 flex-1">
            <HiDocumentText className="h-16 w-16 text-slate-600" />
            <div>
              <p className="font-semibold text-white">{document?.name || 'Document File'}</p>
              <p className="text-xs text-slate-400">Uploaded by {document?.uploadedBy || 'Reviewer'}</p>
            </div>
            <div className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-mono text-slate-500 ring-1 ring-white/5">
              ID: {document?.id || request.documentId}
            </div>
          </div>
        </section>

        {/* Discussion Panel & Actions (Right - 5 cols) */}
        <section className="lg:col-span-5 flex flex-col space-y-6">
          {/* Status Action Cards */}
          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-xl backdrop-blur-md space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Request Actions</h3>
            
            <div className="space-y-4">
              {request.status === 'SENT' && isRecipient && (
                <button
                  onClick={() => handleStatusChange('IN_REVIEW')}
                  disabled={updatingStatus}
                  className="w-full rounded-2xl bg-brand-500 py-3 text-sm font-semibold text-white hover:bg-brand-600 transition disabled:opacity-50"
                >
                  Move to In Review
                </button>
              )}

              {request.status === 'IN_REVIEW' && (
                <button
                  onClick={() => handleStatusChange('DISCUSSION')}
                  disabled={updatingStatus}
                  className="w-full rounded-2xl bg-purple-600 py-3 text-sm font-semibold text-white hover:bg-purple-700 transition disabled:opacity-50"
                >
                  Start Discussion
                </button>
              )}

              {request.status === 'DISCUSSION' && isRecipient && !showSignCanvas && (
                <button
                  onClick={() => setShowSignCanvas(true)}
                  disabled={updatingStatus}
                  className="w-full rounded-2xl bg-brand-500 py-3 text-sm font-semibold text-white hover:bg-brand-600 transition disabled:opacity-50 shadow-lg shadow-brand-500/25"
                >
                  Sign Document
                </button>
              )}

              {showSignCanvas && isRecipient && (
                <div className="space-y-3 rounded-2xl bg-slate-950 p-4 border border-white/5">
                  <p className="text-xs font-semibold text-slate-400">Draw Signature</p>
                  <SignatureCanvas
                    onSave={(img) => handleStatusChange('SIGNED', img)}
                    onCancel={() => setShowSignCanvas(false)}
                  />
                </div>
              )}

              {(request.status === 'COMPLETED' || request.status === 'SIGNED') && (
                <div className="space-y-4">
                  <div className="rounded-2xl bg-emerald-500/10 p-4 border border-emerald-500/20 text-center text-xs text-emerald-300 flex items-center justify-center gap-2">
                    <HiCheckCircle className="h-5 w-5 shrink-0" />
                    <span>Document signed & workflow completed.</span>
                  </div>
                  {request.signature && (
                    <div className="rounded-2xl border border-white/10 bg-slate-950 p-4 text-center">
                      <p className="text-xs text-slate-400 mb-2 font-semibold">Captured Signature</p>
                      <img
                        src={request.signature}
                        alt="Signature"
                        className="mx-auto max-h-16 object-contain rounded-lg border border-white/5 p-1 bg-white/5"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Discussion Chat Box */}
          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-xl backdrop-blur-md flex flex-col h-[400px]">
            <div className="border-b border-white/10 pb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Discussion Thread</h3>
              <span className="text-xs text-slate-500">{messages.length} messages</span>
            </div>

            {/* Message Feed */}
            <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1 scrollbar-thin">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-center text-slate-500 text-xs py-8">
                  No messages yet. Start the conversation below.
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isMyMessage = msg.sender === 'You' || msg.sender === user?.name;
                  return (
                    <div key={msg.id || index} className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                        isMyMessage
                          ? 'bg-brand-500 text-white rounded-tr-none shadow-md shadow-brand-500/10'
                          : 'bg-slate-950 text-slate-200 border border-white/5 rounded-tl-none'
                      }`}>
                        {!isMyMessage && <p className="text-[10px] font-semibold text-brand-300 uppercase tracking-wider mb-0.5">{msg.sender}</p>}
                        <p className="leading-relaxed">{msg.text || msg.content}</p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Send Area */}
            <form onSubmit={handleSendMessage} className="mt-3 flex items-center gap-2 border-t border-white/5 pt-3">
              <input
                type="text"
                placeholder="Write a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                disabled={sendingMsg}
                className="flex-1 rounded-xl border border-white/10 bg-slate-950 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || sendingMsg}
                className="rounded-xl bg-brand-500 p-2.5 text-white transition hover:bg-brand-600 disabled:opacity-50"
              >
                <HiPaperAirplane className="h-5 w-5 rotate-90" />
              </button>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}

export default RequestDetail;
