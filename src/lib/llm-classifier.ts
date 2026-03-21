import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

// Exact intent + product pairs from the excel sheet
const INTENT_LIST = [
  { intent: "Discover best overall credit card", product: "Credit card" },
  { intent: "Dining & restaurants", product: "Credit card" },
  { intent: "Groceries & supermarkets", product: "Credit card" },
  { intent: "Transport & fuel", product: "Credit card" },
  { intent: "Online shopping & marketplaces", product: "Credit card" },
  { intent: "Travel (air miles)", product: "Credit card" },
  { intent: "Cashback focus", product: "Credit card" },
  { intent: "No/low annual fee", product: "Credit card" },
  { intent: "Students & first card (entry-level)", product: "Credit card" },
  { intent: "Family & kids (groceries, utilities, education)", product: "Credit card" },
  { intent: "Entertainment & subscriptions", product: "Credit card" },
  { intent: "Healthcare & insurance", product: "Credit card" },
  { intent: "Overseas spend & FX", product: "Credit card" },
  { intent: "Contactless & mobile wallets", product: "Credit card" },
  { intent: "Supplementary cards & family sharing", product: "Credit card" },
  { intent: "Sign-up promotions & welcome gifts", product: "Credit card" },
  { intent: "Eligibility & application requirements", product: "Credit card" },
  { intent: "Fees & charges", product: "Credit card" },
  { intent: "Rewards currency (points/miles/cashback)", product: "Credit card" },
  { intent: "Bill payments & exclusions", product: "Credit card" },
  { intent: "Luxury & department stores", product: "Credit card" },
  { intent: "Installment plans (0% IPP)", product: "Credit card" },
  { intent: "Card design & metal/plastic", product: "Credit card" },
  { intent: "Security & controls", product: "Credit card" },
  { intent: "Sustainability & ESG perks", product: "Credit card" },
  { intent: "Existing customer optimization", product: "Credit card" },
];

const INTENT_LIST_TEXT = INTENT_LIST
  .map((i, n) => `${n + 1}. "${i.intent}" | ${i.product}`)
  .join("\n");

const SYSTEM_PROMPT = `You are an intent classifier for OCBC Bank's credit card Smart Search chatbot.

Given a user message, identify the most relevant intents from the list below. Return ONLY a JSON object with a "matches" array of up to 3 intents, ordered by relevance (most relevant first). Only include intents that are genuinely relevant to the user's query — do not include weak or speculative matches. If nothing matches well, return an empty matches array.

Available intents:
${INTENT_LIST_TEXT}

Rules:
- Return at most 3 matches
- Each match must use the EXACT intent and product strings from the list above
- Only include matches with clear relevance to the user's query
- If the query is unrelated to OCBC credit cards, return empty matches

Respond with ONLY valid JSON, no explanation:
{"matches": [{"intent": "<exact intent name>", "product": "<exact product name>"}]}`;

export interface IntentMatch {
  intent: string;
  product: string;
}

export async function classifyIntentWithLLM(
  message: string
): Promise<{ matches: IntentMatch[] }> {
  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 300,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: message }],
  });

  const raw =
    response.content[0].type === "text" ? response.content[0].text.trim() : "{}";

  try {
    // Extract JSON even if the model wraps it in markdown fences
    const jsonStr = raw.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
    const parsed = JSON.parse(jsonStr);
    const matches: IntentMatch[] = Array.isArray(parsed.matches)
      ? parsed.matches.slice(0, 3).filter(
          (m: IntentMatch) =>
            typeof m.intent === "string" && typeof m.product === "string"
        )
      : [];
    return { matches };
  } catch {
    return { matches: [] };
  }
}
