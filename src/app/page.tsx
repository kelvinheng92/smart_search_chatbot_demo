"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import OcbcLogo from "@/components/OcbcLogo";
import type { Message, ChatState, ChatResponse } from "@/types";
import PhoneMockup from "@/components/PhoneMockup";

const TOPIC_CHIPS = {
  Cards: [
    "Apply for a card",
    "View my cards",
    "Card rewards",
    "Block my card",
    "Supplementary card",
  ],
  Payments: [
    "Pay bills",
    "Transfer money",
    "PayNow",
    "Card fees",
    "Instalment plan",
  ],
  Help: [
    "Card eligibility",
    "Cashback cards",
    "Miles cards",
    "No annual fee",
    "Card promotions",
  ],
};

const WELCOME_MESSAGE: Message = {
  role: "assistant",
  content:
    "Hi! I'm OCBC Smart Search. Tell me what you're looking for and I'll guide you to the right place in the OCBC app.",
  buttons: ["Apply for a card", "Pay bills", "Transfer money", "Card rewards"],
  timestamp: Date.now(),
};

export default function HomePage() {
  const router = useRouter();
  const [chatState, setChatState] = useState<ChatState>({
    messages: [WELCOME_MESSAGE],
    isLoading: false,
  });
  const [input, setInput] = useState("");
  const [latency, setLatency] = useState<number | undefined>(undefined);
  const [loggingOut, setLoggingOut] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || chatState.isLoading) return;

      const userMsg: Message = {
        role: "user",
        content: trimmed,
        timestamp: Date.now(),
      };

      setChatState((prev) => ({
        messages: [...prev.messages, userMsg],
        isLoading: true,
      }));
      setInput("");

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: trimmed }),
        });

        const data: ChatResponse = await res.json();

        const assistantMsg: Message = {
          role: "assistant",
          content: data.text,
          buttons: data.buttons,
          intent: data.intent,
          confidence: data.confidence,
          outOfScope: data.outOfScope,
          timestamp: Date.now(),
        };

        setLatency(data.latency);
        setChatState((prev) => ({
          messages: [...prev.messages, assistantMsg],
          isLoading: false,
        }));
      } catch {
        setChatState((prev) => ({
          messages: [
            ...prev.messages,
            {
              role: "assistant",
              content: "Sorry, something went wrong. Please try again.",
              timestamp: Date.now(),
            },
          ],
          isLoading: false,
        }));
      }
    },
    [chatState.isLoading]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleReset = () => {
    setChatState({ messages: [WELCOME_MESSAGE], isLoading: false });
    setLatency(undefined);
    setInput("");
    inputRef.current?.focus();
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    await fetch("/api/auth", { method: "DELETE" });
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <OcbcLogo variant="inline" />
            <div className="w-px h-5 bg-gray-200" />
            <span className="text-gray-700 text-sm font-semibold tracking-wide">
              Smart Search
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="text-xs text-gray-500 hover:text-gray-800 border border-gray-200 hover:border-gray-300 px-3 py-1.5 rounded-full transition-colors font-medium"
            >
              Reset chat
            </button>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="text-xs text-ocbc-red hover:text-red-700 border border-ocbc-red hover:border-red-700 px-3 py-1.5 rounded-full transition-colors font-medium disabled:opacity-50 flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {loggingOut ? "Signing out…" : "Sign out"}
            </button>
          </div>
        </div>
      </header>

      {/* Hero banner */}
      <div className="bg-ocbc-red text-white py-5 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold tracking-wide">OCBC Smart Search</h1>
            <p className="text-red-100 text-xs mt-0.5">Navigate the OCBC app with ease</p>
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
            <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse" />
            <span className="text-xs text-white font-medium">Live</span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center py-6 px-4">
        <PhoneMockup
          messages={chatState.messages}
          isLoading={chatState.isLoading}
          latency={latency}
          onButtonClick={sendMessage}
        />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 px-4 py-4">
        {/* Topic chips */}
        <div className="max-w-2xl mx-auto mb-4 space-y-2">
          {Object.entries(TOPIC_CHIPS).map(([category, chips]) => (
            <div key={category} className="flex items-start gap-3">
              <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest pt-1.5 w-14 flex-shrink-0">
                {category}
              </span>
              <div className="flex gap-1.5 flex-wrap">
                {chips.map((chip) => (
                  <button
                    key={chip}
                    onClick={() => sendMessage(chip)}
                    disabled={chatState.isLoading}
                    className="text-xs px-3 py-1.5 rounded-full border border-gray-200 bg-white text-gray-600 hover:border-ocbc-red hover:text-ocbc-red transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap font-medium"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Input bar */}
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="What are you looking for in the OCBC app?"
            disabled={chatState.isLoading}
            className="flex-1 px-4 py-2.5 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-ocbc-red focus:border-transparent text-sm bg-white disabled:opacity-60 shadow-sm"
          />
          <button
            type="submit"
            disabled={!input.trim() || chatState.isLoading}
            className="px-5 py-2.5 bg-ocbc-red text-white rounded-full text-sm font-semibold hover:bg-red-700 active:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            Send
          </button>
        </form>

        <p className="text-center text-[10px] text-gray-300 mt-3">
          © 2025 OCBC Bank. Internal demo only. Not for customer use.
        </p>
      </footer>
    </div>
  );
}
