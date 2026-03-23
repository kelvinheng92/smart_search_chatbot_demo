import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

// Exact intent + product pairs from the excel sheet, with example queries for accurate matching
const INTENT_LIST = [
  {
    intent: "Discover best overall credit card", product: "Credit card",
    examples: "best OCBC credit card, most versatile card, all-round credit card, recommend me a card, general spending card",
  },
  {
    intent: "Dining & restaurants", product: "Credit card",
    examples: "best card for dining, cashback for restaurants, cafes and bars card, eating out rewards, food spend card",
  },
  {
    intent: "Groceries & supermarkets", product: "Credit card",
    examples: "best card for groceries, supermarket savings, FairPrice NTUC cashback, online grocery card, household shopping",
  },
  {
    intent: "Transport & fuel", product: "Credit card",
    examples: "best card for petrol, bus MRT Grab card, fuel rebate, transport commuter card, ride-hailing cashback",
  },
  {
    intent: "Online shopping & marketplaces", product: "Credit card",
    examples: "best card for online shopping, Lazada Shopee card, e-commerce cashback, digital purchases, marketplace rewards",
  },
  {
    intent: "Travel (air miles)", product: "Credit card",
    examples: "best card for miles, air miles credit card, KrisFlyer miles, airport lounge access, travel rewards card, frequent flyer",
  },
  {
    intent: "Cashback focus", product: "Credit card",
    examples: "best cashback card, highest cashback rate, cash rebate credit card, monthly cashback, rebate instead of miles",
  },
  {
    intent: "No/low annual fee", product: "Credit card",
    examples: "no annual fee card, fee waiver credit card, free credit card, lowest fee card, waive annual fee",
  },
  {
    intent: "Students & first card (entry-level)", product: "Credit card",
    examples: "student credit card, first credit card, student first credit card, entry level card, fresh graduate card, minimum income for card, new to credit cards, first time cardholder",
  },
  {
    intent: "Family & kids (groceries, utilities, education)", product: "Credit card",
    examples: "best family credit card, utilities and groceries card, education fees perks, household expenses card, card for parents",
  },
  {
    intent: "Entertainment & subscriptions", product: "Credit card",
    examples: "card for Netflix Spotify, streaming subscription cashback, movie ticket perks, entertainment rewards, digital subscription card",
  },
  {
    intent: "Healthcare & insurance", product: "Credit card",
    examples: "card for insurance premiums, pharmacy cashback, medical bill rewards, healthcare card, clinic hospital spend",
  },
  {
    intent: "Overseas spend & FX", product: "Credit card",
    examples: "best card for overseas, foreign currency spend, no FX fee card, international purchases, extra miles for foreign currency",
  },
  {
    intent: "Contactless & mobile wallets", product: "Credit card",
    examples: "Apple Pay Google Pay card, contactless payment, NFC card, mobile wallet credit card, tap and go rewards",
  },
  {
    intent: "Supplementary cards & family sharing", product: "Credit card",
    examples: "supplementary card, additional card for spouse, family sharing credit card, supp card rewards, secondary cardholder",
  },
  {
    intent: "Sign-up promotions & welcome gifts", product: "Credit card",
    examples: "latest credit card promos, welcome gift new card, sign-up bonus, new card promotion, credit card offer deal",
  },
  {
    intent: "Eligibility & application requirements", product: "Credit card",
    examples: "minimum income for card, can foreigners apply, documents needed, who can apply, credit card eligibility, how to apply",
  },
  {
    intent: "Fees & charges", product: "Credit card",
    examples: "credit card fees, interest rate, late payment fee, cash advance fee, annual fee charges, card costs",
  },
  {
    intent: "Rewards currency (points/miles/cashback)", product: "Credit card",
    examples: "how do OCBC points work, rewards points miles cashback, earn miles directly, cashback credited, redeem reward points, OCBC rewards programme, points to miles conversion",
  },
  {
    intent: "Bill payments & exclusions", product: "Credit card",
    examples: "earn rewards on bills, wallet top-up eligible, excluded categories, government payment rewards, insurance bill cashback",
  },
  {
    intent: "Luxury & department stores", product: "Credit card",
    examples: "luxury shopping card, department store perks, big-ticket retail card, premium shopping rewards, high-end spending card",
  },
  {
    intent: "Installment plans (0% IPP)", product: "Credit card",
    examples: "0% installment plan, interest free payment, IPP credit card, split payment option, pay by instalments",
  },
  {
    intent: "Card design & metal/plastic", product: "Credit card",
    examples: "metal credit card, card design options, premium card design, FRANK card design, card design and metal card, plastic vs metal card, titanium card, exclusive card design",
  },
  {
    intent: "Security & controls", product: "Credit card",
    examples: "lock freeze credit card, spending limit alert, virtual card number, card security features, transaction notification",
  },
  {
    intent: "Sustainability & ESG perks", product: "Credit card",
    examples: "eco friendly credit card, sustainability ESG card, green card benefits, donations rewards, sustainable spending, environmental card perks, ESG credit card",
  },
  {
    intent: "Existing customer optimization", product: "Credit card",
    examples: "already have OCBC card, complement existing card, maximize rewards, second credit card, upgrade current card",
  },
];

const INTENT_LIST_TEXT = INTENT_LIST
  .map((i, n) => `${n + 1}. "${i.intent}" | ${i.product}\n   Examples: ${i.examples}`)
  .join("\n");

const SYSTEM_PROMPT = `You are an intent classifier for OCBC Bank's credit card Smart Search chatbot.

Given a user message, identify the most relevant intents from the list below. Each intent includes example queries to help you match user phrasing to the correct intent. Return ONLY a JSON object with a "matches" array of up to 3 intents, ordered by relevance (most relevant first). Only include intents that are genuinely relevant to the user's query — do not include weak or speculative matches. If nothing matches well, return an empty matches array.

Available intents:
${INTENT_LIST_TEXT}

Rules:
- Return at most 3 matches
- Each match must use the EXACT intent and product strings from the list above
- Use the examples to understand which intent best matches the user's phrasing
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
