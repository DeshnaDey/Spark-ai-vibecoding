"use client";

import { useState, useRef, useEffect } from "react";
import { ChatMessage, AIModel, getAIColor } from "@/lib/storage";
import AIBadge from "./AIBadge";

interface ChatInterfaceProps {
  projectId: string;
  systemPrompt: string;
  ai: AIModel;
  initialHistory: ChatMessage[];
  onHistoryUpdate: (messages: ChatMessage[]) => void;
}

export default function ChatInterface({
  projectId,
  systemPrompt,
  ai,
  initialHistory,
  onHistoryUpdate,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialHistory);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const color = getAIColor(ai);

  // Sync with parent-provided history on mount
  useEffect(() => {
    setMessages(initialHistory);
  }, [projectId]);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Auto-resize textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 160) + "px";
  };

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMsg: ChatMessage = {
      role: "user",
      content: trimmed,
      timestamp: new Date().toISOString(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    onHistoryUpdate(newMessages);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    setIsLoading(true);

    try {
      // Only send user/assistant messages to API
      const apiMessages = newMessages
        .filter((m) => m.role === "user" || m.role === "assistant")
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: apiMessages,
          systemPrompt: `You are an AI assistant helping with the following project:\n\n${systemPrompt}\n\nBe concise, helpful, and focused on this project context.`,
          ai,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to get response");
      }

      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: data.content,
        timestamp: new Date().toISOString(),
      };

      const updated = [...newMessages, assistantMsg];
      setMessages(updated);
      onHistoryUpdate(updated);
    } catch (err) {
      const errorMsg: ChatMessage = {
        role: "error",
        content: err instanceof Error ? err.message : "Something went wrong. Check your API key.",
        timestamp: new Date().toISOString(),
      };
      const updated = [...newMessages, errorMsg];
      setMessages(updated);
      onHistoryUpdate(updated);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto space-y-4 px-2 py-4" style={{ minHeight: 0 }}>
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-4 opacity-40">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-2xl border"
              style={{
                borderColor: `${color}50`,
                background: `${color}10`,
                color,
              }}
            >
              ◈
            </div>
            <div className="font-mono text-sm text-center">
              <div style={{ color }} className="font-semibold mb-1">
                {ai} is ready.
              </div>
              <div className="text-[var(--text-dim)]">Send a message to start.</div>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} ai={ai} />
        ))}

        {isLoading && <TypingIndicator ai={ai} color={color} />}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div
        className="border-t pt-4 pb-2 px-2 flex-shrink-0"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <div
          className="flex gap-3 rounded-xl p-3 border"
          style={{
            background: "var(--bg-input)",
            borderColor: `${color}30`,
            boxShadow: `0 0 15px ${color}08`,
          }}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${ai}... (Enter to send, Shift+Enter for newline)`}
            className="flex-1 bg-transparent outline-none resize-none font-mono text-sm placeholder:text-[var(--text-dim)] text-[var(--text-primary)] leading-relaxed"
            rows={1}
            style={{ maxHeight: "160px" }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="self-end px-4 py-2 rounded-lg font-mono text-sm font-semibold transition-all duration-200 flex-shrink-0"
            style={{
              background: input.trim() && !isLoading ? color : "rgba(255,255,255,0.05)",
              color: input.trim() && !isLoading ? "#0d0d0f" : "var(--text-dim)",
              cursor: input.trim() && !isLoading ? "pointer" : "not-allowed",
              boxShadow: input.trim() && !isLoading ? `0 0 15px ${color}50` : "none",
            }}
          >
            SEND
          </button>
        </div>
        <div className="flex items-center justify-between mt-2 px-1">
          <AIBadge ai={ai} size="sm" />
          <span className="font-mono text-[10px] text-[var(--text-dim)]">
            ↵ Send · ⇧↵ Newline
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Friendly error display ───────────────────────────────────
const ERROR_MESSAGES: Record<string, { title: string; detail: string; link?: { label: string; href: string } }> = {
  OUT_OF_CREDITS: {
    title: "Out of credits",
    detail: "Your API account has run out of credits. Top up to keep chatting.",
    link: { label: "Add credits →", href: "https://console.anthropic.com/settings/billing" },
  },
  INVALID_KEY: {
    title: "Invalid API key",
    detail: "Check that your API key in .env.local is correct and active.",
  },
  RATE_LIMITED: {
    title: "Rate limited",
    detail: "Too many requests. Wait a moment and try again.",
  },
  COMING_SOON: {
    title: "Coming soon",
    detail: "Gemini support is not yet available. Switch to Claude or GPT.",
  },
  OPENAI_API_KEY_not_set: {
    title: "OpenAI key missing",
    detail: "Add OPENAI_API_KEY to your .env.local file to use GPT.",
  },
};

function ErrorContent({ code, ai }: { code: string; ai: AIModel }) {
  // Check if it matches a known code, otherwise show a generic message
  const known = ERROR_MESSAGES[code];
  const isKeyMissing = code.includes("OPENAI_API_KEY not set");
  const openAIKeyMsg = ERROR_MESSAGES["OPENAI_API_KEY_not_set"];

  const info = known
    ? known
    : isKeyMissing
    ? openAIKeyMsg
    : { title: "Something went wrong", detail: code };

  return (
    <div className="text-sm space-y-1">
      <div className="font-semibold">⚠ {info.title}</div>
      <div className="opacity-80 text-xs leading-relaxed">{info.detail}</div>
      {info.link && (
        <a
          href={info.link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-1 text-xs underline opacity-80 hover:opacity-100"
        >
          {info.link.label}
        </a>
      )}
    </div>
  );
}

function MessageBubble({ message, ai }: { message: ChatMessage; ai: AIModel }) {
  const isUser = message.role === "user";
  const isError = message.role === "error";
  const color = getAIColor(ai);

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar */}
      <div
        className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-mono font-bold border mt-0.5"
        style={
          isError
            ? { borderColor: "#ff2d7850", background: "#ff2d7810", color: "#ff2d78" }
            : isUser
            ? { borderColor: "#9b5de550", background: "#9b5de510", color: "#9b5de5" }
            : { borderColor: `${color}50`, background: `${color}10`, color }
        }
      >
        {isError ? "!" : isUser ? "U" : ai[0]}
      </div>

      {/* Bubble */}
      <div
        className={`chat-message max-w-[80%] ${
          isError
            ? "chat-message-error"
            : isUser
            ? "chat-message-user"
            : "chat-message-assistant"
        }`}
      >
        {isError ? (
          <ErrorContent code={message.content} ai={ai} />
        ) : (
          <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>
        )}
        <div className="mt-2 text-[10px] opacity-40 font-mono">
          {new Date(message.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}

function TypingIndicator({ ai, color }: { ai: AIModel; color: string }) {
  return (
    <div className="flex gap-3 flex-row">
      <div
        className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-mono font-bold border mt-0.5"
        style={{ borderColor: `${color}50`, background: `${color}10`, color }}
      >
        {ai[0]}
      </div>
      <div
        className="chat-message flex items-center gap-2 h-10"
        style={{
          background: `${color}06`,
          borderColor: `${color}15`,
        }}
      >
        <span className="font-mono text-xs opacity-50">thinking</span>
        <div className="flex gap-1.5">
          <div className="typing-dot" />
          <div className="typing-dot" />
          <div className="typing-dot" />
        </div>
      </div>
    </div>
  );
}
