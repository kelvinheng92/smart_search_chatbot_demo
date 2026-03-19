"use client";

import { useState, useRef, useCallback } from "react";
import type { Message, ChatState, ChatResponse } from "@/types";
import PhoneMockup from "@/components/PhoneMockup";

const TOPIC_CHIPS = {
  Spending: [
    "Best Card for Me",
    "Dining Cards",
    "Grocery Cards",
    "Transport Cards",
    "Online Shopping",
    "Travel Miles",
  ],
  Features: [
    "Cashback Cards",
    "No Annual Fee",
    "Sign-up Promos",
    "Rewards Programme",
  ],
  Info: [
    "Fees & Charges",
    "Eligibility",
    "Supplementary Cards",
    "Card Security",
  ],
};

const WELCOME_MESSAGE: Message = {
  role: "assistant",
  content:
    "Welcome to OCBC Smart Search! I can help you find the perfect credit card. What are you looking for today?",
  buttons: ["Best Card for Me", "Cashback Cards", "Miles Cards", "No Annual Fee Cards"],
  timestamp: Date.now(),
};

export default function HomePage() {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [WELCOME_MESSAGE],
    isLoading: false,
  });
  const [input, setInput] = useState("");
  const [latency, setLatency] = useState<number | undefined>(undefined);
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
        const errMsg: Message = {
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
          timestamp: Date.now(),
        };
        setChatState((prev) => ({
          messages: [...prev.messages, errMsg],
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
    setChatState({
      messages: [WELCOME_MESSAGE],
      isLoading: false,
    });
    setLatency(undefined);
    setInput("");
    inputRef.current?.focus();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          {/* OCBC Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-ocbc-red rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">O</span>
            </div>
            <span className="font-bold text-ocbc-dark text-base tracking-wide">OCBC</span>
          </div>
          <div className="w-px h-5 bg-gray-300" />
          <span className="text-gray-600 text-sm font-medium">Smart Search</span>
        </div>
        <button
          onClick={handleReset}
          className="text-xs text-gray-500 hover:text-ocbc-red border border-gray-200 hover:border-ocbc-red px-3 py-1.5 rounded-full transition-colors font-medium"
        >
          Reset
        </button>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center py-6 px-4 gap-6">
        <PhoneMockup
          messages={chatState.messages}
          isLoading={chatState.isLoading}
          latency={latency}
          onButtonClick={sendMessage}
        />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 px-4 py-4">
        {/* Topic chips */}
        <div className="max-w-2xl mx-auto mb-4 space-y-2">
          {Object.entries(TOPIC_CHIPS).map(([category, chips]) => (
            <div key={category} className="flex items-start gap-2">
              <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider pt-1.5 w-16 flex-shrink-0">
                {category}
              </span>
              <div className="flex gap-1.5 flex-wrap">
                {chips.map((chip) => (
                  <button
                    key={chip}
                    onClick={() => sendMessage(chip)}
                    disabled={chatState.isLoading}
                    className="text-xs px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap font-medium"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Input bar */}
        <form
          onSubmit={handleSubmit}
          className="max-w-2xl mx-auto flex gap-2"
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about credit cards..."
            disabled={chatState.isLoading}
            className="flex-1 px-4 py-2.5 rounded-full border border-gray-300 focus:outline-none focus:border-ocbc-red text-sm bg-white disabled:opacity-60 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={!input.trim() || chatState.isLoading}
            className="px-5 py-2.5 bg-ocbc-red text-white rounded-full text-sm font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </form>
      </footer>
    </div>
  );
}
