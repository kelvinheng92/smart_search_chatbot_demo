"use client";

import { useEffect, useRef } from "react";
import type { Message } from "@/types";
import ChatBubble, { TypingIndicator } from "./ChatBubble";

interface PhoneMockupProps {
  messages: Message[];
  isLoading: boolean;
  latency?: number;
  onButtonClick: (text: string) => void;
}

export default function PhoneMockup({
  messages,
  isLoading,
  latency,
  onButtonClick,
}: PhoneMockupProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  return (
    <div className="flex flex-col items-center">
      {/* Phone frame */}
      <div className="w-[280px] h-[580px] bg-black rounded-[40px] p-[3px] shadow-2xl">
        <div className="w-full h-full bg-gray-50 rounded-[38px] overflow-hidden flex flex-col relative">
          {/* Dynamic island */}
          <div className="flex-shrink-0 flex justify-center pt-3 pb-2 bg-gray-50">
            <div className="w-24 h-6 bg-black rounded-full" />
          </div>

          {/* Chat header inside phone */}
          <div className="flex-shrink-0 bg-white border-b border-gray-100 px-4 py-2.5 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-ocbc-red flex items-center justify-center">
              <span className="text-white text-xs font-bold">O</span>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-900">OCBC Smart Search</p>
              <p className="text-[10px] text-green-500 font-medium">Online</p>
            </div>
          </div>

          {/* Messages area */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-3 py-3 space-y-1 scroll-smooth"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full gap-3 py-8">
                <div className="w-12 h-12 rounded-full bg-ocbc-red flex items-center justify-center">
                  <span className="text-white text-lg font-bold">O</span>
                </div>
                <p className="text-xs text-gray-500 text-center px-4">
                  Hi! I&apos;m OCBC&apos;s Smart Search. Ask me about credit cards!
                </p>
              </div>
            )}
            {messages.map((msg) => (
              <ChatBubble key={msg.timestamp} message={msg} onButtonClick={onButtonClick} />
            ))}
            {isLoading && <TypingIndicator />}
          </div>

          {/* Home indicator */}
          <div className="flex-shrink-0 flex justify-center py-2 bg-gray-50">
            <div className="w-24 h-1 bg-gray-300 rounded-full" />
          </div>
        </div>
      </div>

      {/* Latency badge */}
      {latency !== undefined && latency > 0 && (
        <div className="mt-3 px-3 py-1 bg-gray-100 rounded-full">
          <span className="text-xs text-gray-500">
            Response in {latency}ms
          </span>
        </div>
      )}
    </div>
  );
}
