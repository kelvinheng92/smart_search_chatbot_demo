"use client";

import type { Message, Button } from "@/types";

interface ChatBubbleProps {
  message: Message;
  onButtonClick: (text: string) => void;
}

function renderMarkdown(text: string): React.ReactNode {
  // Simple bold rendering: **text** -> <strong>text</strong>
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}

export function TypingIndicator() {
  return (
    <div className="flex items-start gap-2 mb-3">
      <div className="w-7 h-7 rounded-full bg-ocbc-red flex items-center justify-center flex-shrink-0 mt-0.5">
        <span className="text-white text-xs font-bold">O</span>
      </div>
      <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-gray-100">
        <div className="flex items-center gap-1.5">
          <span
            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: "0ms" }}
          />
          <span
            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: "150ms" }}
          />
          <span
            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: "300ms" }}
          />
        </div>
      </div>
    </div>
  );
}

export default function ChatBubble({ message, onButtonClick }: ChatBubbleProps) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end mb-3">
        <div className="max-w-[80%] bg-ocbc-red text-white rounded-2xl rounded-tr-sm px-4 py-2.5 shadow-sm">
          <p className="text-sm leading-relaxed">{message.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2 mb-3">
      <div className="w-7 h-7 rounded-full bg-ocbc-red flex items-center justify-center flex-shrink-0 mt-0.5">
        <span className="text-white text-xs font-bold">O</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-800 leading-relaxed">
            {renderMarkdown(message.content)}
          </p>
        </div>
        {message.buttons && message.buttons.length > 0 && (() => {
          const urlButtons = message.buttons.filter((b: Button) => b.url);
          const chipButtons = message.buttons.filter((b: Button) => !b.url);
          return (
            <>
              {urlButtons.length > 0 && (
                <div className="mt-3">
                  <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mb-1.5">
                    Click to find out more
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {urlButtons.map((btn: Button, i: number) => (
                      <a
                        key={i}
                        href={btn.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs px-3 py-1.5 rounded-full border border-ocbc-red text-ocbc-red hover:bg-red-50 transition-colors font-medium whitespace-nowrap"
                      >
                        {btn.label}
                      </a>
                    ))}
                  </div>
                </div>
              )}
              {chipButtons.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {chipButtons.map((btn: Button, i: number) => (
                    <button
                      key={i}
                      onClick={() => onButtonClick(btn.label)}
                      className="text-xs px-3 py-1.5 rounded-full border border-ocbc-red text-ocbc-red hover:bg-red-50 transition-colors font-medium whitespace-nowrap"
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              )}
            </>
          );
        })()}
        {message.additionalIntents && message.additionalIntents.length > 0 && (
          <div className="mt-3">
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mb-1.5">
              Also relevant
            </p>
            <div className="flex flex-wrap gap-2">
              {message.additionalIntents.map((intent: string, i: number) => (
                <button
                  key={i}
                  onClick={() => onButtonClick(intent)}
                  className="text-xs px-3 py-1.5 rounded-full border border-gray-300 text-gray-600 hover:border-ocbc-red hover:text-ocbc-red transition-colors font-medium whitespace-nowrap"
                >
                  {intent}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
