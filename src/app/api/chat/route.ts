import { NextRequest, NextResponse } from "next/server";
import { classifyIntentWithLLM } from "@/lib/llm-classifier";
import { lookupIntent, getOutOfScopeResponse } from "@/lib/intent-lookup";
import type { ChatRequest, ChatResponse } from "@/types";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as ChatRequest;
  const { message } = body;
  const start = Date.now();

  try {
    const { matches } = await classifyIntentWithLLM(message);

    if (matches.length === 0) {
      const oos = getOutOfScopeResponse();
      return NextResponse.json({
        text: oos.text,
        buttons: oos.buttons,
        outOfScope: true,
        latency: Date.now() - start,
      } as ChatResponse);
    }

    const [primary, ...additional] = matches;
    const primaryResponse = lookupIntent(primary.intent, primary.product);

    if (!primaryResponse) {
      const oos = getOutOfScopeResponse();
      return NextResponse.json({
        text: oos.text,
        buttons: oos.buttons,
        outOfScope: true,
        latency: Date.now() - start,
      } as ChatResponse);
    }

    // Collect additional intent names (only those that resolve successfully)
    const additionalIntents = additional
      .map((m) => lookupIntent(m.intent, m.product))
      .filter(Boolean)
      .map((r) => r!.intentName);

    return NextResponse.json({
      text: primaryResponse.text,
      intent: primary.intent,
      product: primary.product,
      buttons: primaryResponse.button ? [primaryResponse.button] : [],
      additionalIntents: additionalIntents.length > 0 ? additionalIntents : undefined,
      outOfScope: false,
      latency: Date.now() - start,
    } as ChatResponse);
  } catch (err) {
    console.error("Chat error:", err);
    return NextResponse.json(
      { text: "An error occurred. Please try again.", error: true } as ChatResponse,
      { status: 500 }
    );
  }
}
