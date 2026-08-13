import { useEffect, useState } from "react";
import { HiPaperAirplane } from "react-icons/hi";
import { discussRequest } from "../services/requests.js";

export default function DiscussionPanel({
  request,
  initialDiscussion = null,
  onRequestUpdated,
}) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const initialMessages = [];

    if (request?.recipientComment) {
      initialMessages.push({
        role: "user",
        content: request.recipientComment,
      });
    }

    if (initialDiscussion?.agentResponse) {
      initialMessages.push({
        role: "agent",
        content: initialDiscussion.agentResponse,
      });
    }

    setMessages(initialMessages);
  }, [
    request?.id,
    request?.recipientComment,
    initialDiscussion,
  ]);

  async function handleSubmit(event) {
    event.preventDefault();

    const cleanMessage = message.trim();

    if (!cleanMessage || loading || !request?.id) {
      return;
    }

    setLoading(true);
    setError("");

    const userMessage = {
      role: "user",
      content: cleanMessage,
    };

    setMessages((current) => [
      ...current,
      userMessage,
    ]);

    setMessage("");

    try {
      const result = await discussRequest(
        request.id,
        cleanMessage
      );

      /*
       * discussRequest() normally returns:
       *
       * {
       *   request,
       *   discussion
       * }
       *
       * But also support the raw backend response:
       *
       * {
       *   success: true,
       *   data: {
       *     request,
       *     discussion
       *   }
       * }
       */

      const responseData =
        result?.data ?? result;

      const discussion =
        responseData?.discussion ??
        responseData?.data?.discussion ??
        null;

      const updatedRequest =
        responseData?.request ??
        responseData?.data?.request ??
        null;

      const agentResponse =
        discussion?.agentResponse ??
        discussion?.response ??
        discussion?.message ??
        null;

      if (agentResponse) {
        setMessages((current) => [
          ...current,
          {
            role: "agent",
            content: agentResponse,
          },
        ]);
      } else {
        setError(
          "The discussion request succeeded, but no AI response was returned."
        );
      }

      if (onRequestUpdated && updatedRequest) {
        onRequestUpdated(updatedRequest);
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to continue the document discussion."
      );

      setMessages((current) => {
        const updated = [...current];

        if (
          updated.length > 0 &&
          updated[updated.length - 1].role === "user" &&
          updated[updated.length - 1].content === cleanMessage
        ) {
          updated.pop();
        }

        return updated;
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-xl">
      <div className="mb-5">
        <h2 className="text-lg font-bold text-white">
          Document Review Discussion
        </h2>

        <p className="mt-1 text-sm text-slate-400">
          Ask questions and discuss only the document being reviewed.
        </p>
      </div>

      <div className="mb-5 max-h-[420px] space-y-4 overflow-y-auto pr-2">
        {messages.length === 0 ? (
          <div className="rounded-2xl bg-white/5 p-4 text-sm text-slate-500">
            Start the discussion by asking a question about this
            document.
          </div>
        ) : (
          messages.map((item, index) => (
            <div
              key={`${item.role}-${index}`}
              className={`flex ${
                item.role === "user"
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  item.role === "user"
                    ? "bg-brand-500 text-white"
                    : "border border-brand-500/20 bg-brand-500/10 text-slate-200"
                }`}
              >
                <p className="mb-1 text-xs font-semibold opacity-70">
                  {item.role === "user"
                    ? "You"
                    : "AI Reviewer"}
                </p>

                <p className="whitespace-pre-wrap text-sm">
                  {item.content}
                </p>
              </div>
            </div>
          ))
        )}

        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-400">
              Reviewing the document…
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="flex gap-3"
      >
        <textarea
          value={message}
          onChange={(event) =>
            setMessage(event.target.value)
          }
          placeholder="Ask a question about this document..."
          rows={3}
          disabled={loading}
          className="flex-1 resize-none rounded-2xl border border-white/10 bg-slate-950/70 p-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-brand-500"
        />

        <button
          type="submit"
          disabled={loading || !message.trim()}
          className="self-end rounded-2xl bg-brand-500 px-5 py-3 text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <HiPaperAirplane className="h-5 w-5" />
        </button>
      </form>
    </section>
  );
}