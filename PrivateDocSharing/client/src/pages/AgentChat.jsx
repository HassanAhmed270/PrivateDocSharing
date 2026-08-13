import { useEffect, useRef, useState } from 'react';
import { HiSparkles, HiPaperAirplane } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { sendAgentCommand } from '../services/agent.js';

function AgentChat() {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'agent',
      text: 'Hello! I am your PrivateAI Agent. Ask me to show pending requests, check a document status, find documents under discussion, send a document, or answer a question about an authorized discussion document.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSubmit(event) {
    event.preventDefault();
    const message = input.trim();
    if (!message || loading) return;

    setInput('');
    setMessages((current) => [...current, { id: `u-${Date.now()}`, sender: 'user', text: message }]);
    setLoading(true);

    try {
      const response = await sendAgentCommand(message);
      const result = response.result;

      let text = response.confirmation || 'The agent completed the requested action.';
      if (result?.answer) text += `\n\n${result.answer}`;
      if (result?.message) text += `\n\n${result.message}`;
      if (Array.isArray(result?.requests)) {
        text += result.requests.length
          ? `\n\nFound ${result.requests.length} pending request(s).`
          : '\n\nThere are no pending requests.';
      }
      if (Array.isArray(result?.documents)) {
        text += result.documents.length
          ? `\n\nFound ${result.documents.length} document(s) under discussion.`
          : '\n\nNo documents are currently under discussion.';
      }
      if (result?.request?.document) {
        text += `\n\nRequest created for "${result.request.document.name}".`;
      }

      setMessages((current) => [
        ...current,
        { id: `a-${Date.now()}`, sender: 'agent', text },
      ]);
    } catch (error) {
      const messageText = error.response?.data?.message || 'The agent could not process that command.';
      toast.error(messageText);
      setMessages((current) => [
        ...current,
        { id: `e-${Date.now()}`, sender: 'agent', text: messageText },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header className="rounded-3xl border border-white/10 bg-gradient-to-r from-cyan-900/30 via-slate-900/80 to-purple-900/20 p-6 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-cyan-500/20 p-3 text-cyan-300"><HiSparkles className="h-6 w-6" /></div>
          <div>
            <h1 className="text-2xl font-bold text-white">PrivateAI Agent Command Hub</h1>
            <p className="text-sm text-slate-400">Commands are authenticated, organization-scoped, guarded, permission-checked, and audited by the backend.</p>
          </div>
        </div>
      </header>

      <div className="flex h-[600px] flex-col rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-xl">
        <div className="flex-1 space-y-4 overflow-y-auto pr-1">
          {messages.map((message) => {
            const userMessage = message.sender === 'user';
            return (
              <div key={message.id} className={`flex ${userMessage ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] whitespace-pre-wrap rounded-3xl px-5 py-3 text-sm ${userMessage ? 'rounded-tr-none bg-brand-500 text-white' : 'rounded-tl-none border border-white/5 bg-slate-950 text-slate-200'}`}>
                  {!userMessage && (
                    <div className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                      <HiSparkles className="h-3.5 w-3.5" /> AI Agent
                    </div>
                  )}
                  {message.text}
                </div>
              </div>
            );
          })}
          {loading && (
            <div className="rounded-3xl rounded-tl-none border border-white/5 bg-slate-950 px-5 py-3 text-sm text-slate-400">
              Processing securely…
            </div>
          )}
          <div ref={endRef} />
        </div>

        <form onSubmit={handleSubmit} className="mt-4 flex gap-2 border-t border-white/5 pt-4">
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            disabled={loading}
            placeholder="e.g. Show my pending requests"
            className="flex-1 rounded-2xl border border-white/10 bg-slate-950 px-5 py-3.5 text-sm text-white placeholder-slate-500 focus:border-brand-500 focus:outline-none disabled:opacity-50"
          />
          <button disabled={loading || !input.trim()} className="rounded-2xl bg-brand-500 p-3.5 text-white hover:bg-brand-600 disabled:opacity-40">
            <HiPaperAirplane className="h-5 w-5 rotate-90" />
          </button>
        </form>
      </div>
    </div>
  );
}

export default AgentChat;
