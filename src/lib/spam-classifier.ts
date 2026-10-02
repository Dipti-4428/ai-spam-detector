// Lightweight rule-based NLP spam classifier (no paid API needed).
export type Analysis = {
  isSpam: boolean;
  confidence: number;
  reason: string;
  keywords: string[];
  recommendation: string;
};

type Rule = { label: string; pattern: RegExp; weight: number };

const RULES: Rule[] = [
  { label: "prize language", pattern: /\b(congratulations|you('ve| have)? won|winner|prize|lottery|jackpot|reward|free gift)\b/gi, weight: 3 },
  { label: "urgency", pattern: /\b(urgent|immediately|act now|claim now|limited time|expires?|hurry|last chance|today only|right now)\b/gi, weight: 2 },
  { label: "suspicious link", pattern: /(https?:\/\/\S+|www\.\S+|\bbit\.ly\S*|\b\S+\.(xyz|top|click|ru|tk)\b)/gi, weight: 2.5 },
  { label: "sensitive info request", pattern: /\b(share|send|provide|verify|confirm|enter)\b[^.]{0,40}\b(otp|password|pin|cvv|bank details|account number|card number)\b/gi, weight: 4 },
  { label: "account threat", pattern: /\b(account (will be )?(blocked|suspended)|kyc|verify your account)\b/gi, weight: 3 },
  { label: "money bait", pattern: /(₹|rs\.?|\$)\s?\d[\d,]*|\b(cash|loan approved|earn money|investment|double your)\b/gi, weight: 2 },
  { label: "promotional", pattern: /\b(offer|discount|% off|sale|buy now|subscribe|click here|unsubscribe|deal)\b/gi, weight: 1.2 },
];

export function analyzeMessage(text: string): Analysis {
  const found = new Set<string>();
  const categories = new Set<string>();
  let score = 0;

  for (const r of RULES) {
    const m = text.match(r.pattern);
    if (m) {
      score += r.weight + (m.length - 1) * r.weight * 0.3;
      categories.add(r.label);
      m.forEach((k) => found.add(k.trim().toLowerCase()));
    }
  }
  const caps = text.replace(/[^A-Z]/g, "").length / Math.max(1, text.replace(/[^a-zA-Z]/g, "").length);
  if (text.length > 15 && caps > 0.5) { score += 1.5; categories.add("excessive capitals"); }
  if ((text.match(/!/g) || []).length >= 3) { score += 1; categories.add("excessive exclamation"); }

  // Legit OTP messages: "Do not share" is a safe pattern
  if (/\b(do not|don't|never) share\b/i.test(text)) score -= 3;

  const isSpam = score >= 3;
  const confidence = Math.round(
    isSpam ? Math.min(99, 70 + score * 4) : Math.min(98, 98 - Math.max(0, score) * 8),
  );
  const cats = [...categories];
  const reason = isSpam
    ? `Contains ${cats.join(", ")}.`
    : cats.length
      ? `Minor indicators (${cats.join(", ")}) but no strong spam pattern.`
      : "Normal conversational message with no suspicious patterns.";
  return {
    isSpam,
    confidence: Math.max(51, confidence),
    reason,
    keywords: [...found].slice(0, 8),
    recommendation: isSpam
      ? "Avoid clicking unknown links or sharing personal information."
      : "This message looks safe, but always stay cautious with unknown senders.",
  };
}
