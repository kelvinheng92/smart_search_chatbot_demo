import { NextRequest, NextResponse } from "next/server";
import { getTFIDFResponse } from "@/lib/tfidf-engine";
import type { ChatRequest, ChatResponse } from "@/types";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as ChatRequest;
  const { message } = body;
  const start = Date.now();

  try {
    const response = getTFIDFResponse(message);
    return NextResponse.json({ ...response, latency: Date.now() - start });
  } catch (err) {
    console.error("Chat error:", err);
    return NextResponse.json(
      { text: "An error occurred. Please try again.", error: true } as ChatResponse,
      { status: 500 }
    );
  }
}
