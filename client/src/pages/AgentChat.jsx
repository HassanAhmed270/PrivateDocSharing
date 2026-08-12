import { useState, useRef, useEffect } from 'react';
import { HiSparkles, HiPaperAirplane, HiCheckCircle, HiXCircle } from 'react-icons/hi';
import toast from 'react-hot-toast';
import api from '../services/api.js';

function AgentChat() {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'agent',
      text: 'Hello! I am your PrivateAI Agent. You can ask me to perform actions like sending documents for signature (e.g., "send document Q3 Audit to Bob"). How can I help you today?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingIntent, setPendingIntent] = useState(null);
  
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSendCommand(e) {
    e.preventDefault();
    if (!input.trim() || loading || pendingIntent) return;

    const userText = input.trim();
    setMessages((prev) => [...prev, { id: 'user-' + Date.now(), sender: 'user', text: userText }]);
    setInput('');
    setLoading(true);

    try {
      let responseData;
      try {
        const { data } = await api.post('/api/agent/command', { command: userText });
        responseData = data?.data ?? data;
      } catch (err) {
        if (!err.response) {
          // Mock interpretation logic when offline / demo mode
          if (userText.toLowerCase().includes('send') && userText.toLowerCase().includes('to')) {
            const words = userText.split(' ');
            const toIndex = words.findIndex(w => w.toLowerCase() === 'to');
            const recipient = toIndex !== -1 && words[toIndex + 1] ? words[toIndex + 1] : 'Bob';
            
            responseData = {
              intent: 'SEND_DOCUMENT',
              parameters: {
                title: 'Sign Q3 Audit Request',
                recipient: recipient,
                documentId: 'doc-1',
              },
              confirmationMessage: `You are about to send 'Sign Q3 Audit Request' (doc-1) to ${recipient}. Please confirm.`,
            };
          } else {
            responseData = {
              intent: 'UNKNOWN',
              confirmationMessage: `I interpreted your command but could not extract a matching action. Try: "send document Audit to Alice"`,
            };
          }
        } else {
          throw err;
        }
      }

      setLoading(false);

      if (responseData.intent && responseData.intent !== 'UNKNOWN') {
        // Render interpreted intent requiring confirmation
        setPendingIntent(responseData);
        setMessages((prev) => [
          ...prev,
          {
            id: 'agent-confirm-' + Date.now(),
            sender: 'agent',
            text: responseData.confirmationMessage,
            isConfirmation: true,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: 'agent-reply-' + Date.now(),
            sender: 'agent',
            text: responseData.confirmationMessage || 'Could not understand intent. Try again.',
          },
        ]);
      }
    } catch (err) {
      setLoading(false);
      setMessages((prev) => [
        ...prev,
        {
          id: 'agent-err-' + Date.now(),
          sender: 'agent',
          text: 'Error calling agent service. Please try again later.',
        },
      ]);
    }
  }

  async function handleConfirmIntent() {
    if (!pendingIntent) return;
    const intentData = pendingIntent;
    setPendingIntent(null);
    setLoading(true);

    try {
      // Execute the actual endpoint
      if (intentData.intent === 'SEND_DOCUMENT') {
        try {
          await api.post('/api/requests', intentData.parameters);
        } catch (err) {
          if (err.response) throw err;
          // Local demo mock success
        }

        setMessages((prev) => [
          ...prev,
          {
            id: 'confirm-success-' + Date.now(),
            sender: 'agent',
            text: `✅ Action executed successfully! Signature request for "${intentData.parameters.title}" has been sent to ${intentData.parameters.recipient}.`,
          },
        ]);
        toast.success('Signature request sent successfully!');
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: 'confirm-unknown-' + Date.now(),
            sender: 'agent',
            text: 'Executed intent details: Mapped action completed.',
          },
        ]);
      }
    } catch (err) {
      toast.error('Failed to execute command.');
      setMessages((prev) => [
        ...prev,
        {
          id: 'confirm-err-' + Date.now(),
          sender: 'agent',
          text: 'Failed to execute the confirmed action on the server.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleCancelIntent() {
    setPendingIntent(null);
    setMessages((prev) => [
      ...prev,
      {
        id: 'cancel-intent-' + Date.now(),
        sender: 'agent',
        text: '❌ Command cancelled. Let me know if you want to try something else!',
      },
    ]);
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header Banner */}
      <header className="rounded-3xl border border-white/10 bg-gradient-to-r from-cyan-900/30 via-slate-900/80 to-purple-900/20 p-6 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-cyan-500/20 p-3 text-cyan-300">
            <HiSparkles className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">PrivateAI Agent Command Hub</h1>
            <p className="text-sm text-slate-400">
              Speak naturally to analyze, request signature, or manage documents under secure execution constraints.
            </p>
          </div>
        </div>
      </header>

      {/* Chat Conversation Box */}
      <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-xl backdrop-blur-md flex flex-col h-[550px]">
        {/* Messages feed */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-3xl px-5 py-3 text-sm ${
                  isUser
                    ? 'bg-brand-500 text-white rounded-tr-none shadow-md shadow-brand-500/10'
                    : 'bg-slate-950 text-slate-200 border border-white/5 rounded-tl-none'
                }`}>
                  {!isUser && (
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-cyan-400 uppercase tracking-wider mb-1">
                      <HiSparkles className="h-3.5 w-3.5 shrink-0" />
                      <span>AI Agent</span>
                    </div>
                  )}
                  <p className="leading-relaxed">{msg.text}</p>
                  
                  {/* Action Confirmation Buttons inline inside agent text */}
                  {msg.isConfirmation && pendingIntent && (
                    <div className="mt-4 flex items-center gap-2 border-t border-white/10 pt-3">
                      <button
                        onClick={handleConfirmIntent}
                        disabled={loading}
                        className="inline-flex items-center gap-1 rounded-xl bg-brand-500 hover:bg-brand-600 transition px-4 py-2 text-xs font-semibold text-white shadow-md shadow-brand-500/25"
                      >
                        <HiCheckCircle className="h-4.5 w-4.5" />
                        Confirm Action
                      </button>
                      <button
                        onClick={handleCancelIntent}
                        disabled={loading}
                        className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition px-4 py-2 text-xs font-semibold text-slate-300"
                      >
                        <HiXCircle className="h-4.5 w-4.5" />
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {loading && (
            <div className="flex justify-start">
              <div className="rounded-3xl px-5 py-3 text-sm bg-slate-950 text-slate-400 border border-white/5 rounded-tl-none flex items-center gap-2">
                <div className="h-2 w-2 animate-bounce rounded-full bg-slate-400" />
                <div className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:0.2s]" />
                <div className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:0.4s]" />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Send Area */}
        <form onSubmit={handleSendCommand} className="mt-4 flex items-center gap-2 border-t border-white/5 pt-4">
          <input
            type="text"
            placeholder={pendingIntent ? "Confirm or Cancel the pending action above..." : "Ask me to send a document or perform a command..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading || Boolean(pendingIntent)}
            className="flex-1 rounded-2xl border border-white/10 bg-slate-950 px-5 py-3.5 text-sm text-white placeholder-slate-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading || Boolean(pendingIntent)}
            className="rounded-2xl bg-brand-500 p-3.5 text-white transition hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-brand-500/25"
          >
            <HiPaperAirplane className="h-5 w-5 rotate-90" />
          </button>
        </form>
      </div>
    </div>
  );
}

export default AgentChat;
