import { CREDIT_CARD_INTENTS, OUT_OF_SCOPE_INTENT } from "./intents";
import type { Button } from "@/types";

export interface IntentResponse {
  text: string;
  button: Button | undefined;
  intentName: string;
  product: string;
}

// Normalize for case-insensitive, punctuation-tolerant matching
const normalize = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]/g, "");

// Build lookup map once at module load
const lookupMap = new Map<string, (typeof CREDIT_CARD_INTENTS)[number]>();
for (const intent of CREDIT_CARD_INTENTS) {
  lookupMap.set(normalize(intent.name), intent);
}

export function lookupIntent(
  intentName: string,
  product: string
): IntentResponse | null {
  const intent = lookupMap.get(normalize(intentName));
  if (!intent) return null;
  return {
    text: intent.templateResponse.text,
    button: intent.templateResponse.buttons[0],
    intentName: intent.name,
    product,
  };
}

export function getOutOfScopeResponse() {
  return OUT_OF_SCOPE_INTENT.templateResponse;
}
