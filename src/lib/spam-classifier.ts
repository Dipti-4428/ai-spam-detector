// Lightweight rule-based NLP spam classifier (no paid API needed).
// Modular: replace `analyzeMessage` with an ML model / API call later — keep the `Analysis` shape.
export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";

export type Analysis = {
  isSpam: boolean;
  confidence: number;
  safetyScore: number;
  riskLevel: RiskLevel;
  reasons: string[];
  reason: string;
  keywords: string[];
  urls: string[];
  suspiciousUrl: boolean;
  recommendation: string;
};

type Rule = { label: string; pattern: RegExp; weight: number };

const RULES: Rule[] = [
  { label: "Prize/lottery language", pattern: /\b(congratulations|you('ve| have)? won|winner|prize|lottery|jackpot|reward|free gift)\b/gi, weight: 3 },
  { label: "Urgent language", pattern: /\b(urgent(ly)?|immediately|act now|claim now|limited time|expires?|hurry|last chance|today only|right now)\b/gi, weight: 2 },
  { label: "Request for OTP or personal information", pattern: /\b(share|send|provide|verify|confirm|enter|update)\b[^.]{0,40}\b(otp|password|pin|cvv|bank details|account number|card number|aadhaar|pan)\b/gi, weight: 4 },
  { label: "Account threat / phishing", pattern: /\b(account (will be |has been )?(blocked|suspended|locked)|kyc|verify (your )?account)\b/gi, weight: 3.5 },
  { label: "Financial request", pattern: /\b(send money|transfer (money|funds)|pay now|processing fee|loan approved|earn money|double your money|investment)\b/gi, weight: 3 },
  { label: "Money bait", pattern: /(₹|rs\.?|\$)\s?\d[\d,]*/gi, weight: 1.5 },
  { label: "Promotional language", pattern: /\b(offer|discount|% off|sale|buy now|subscribe|click here|unsubscribe|deal)\b/gi, weight: 1.2 },
  { label: "Mentions link", pattern: /\b(this link|click (the )?link|tap here)\b/gi, weight: 1.5 },
];

const URL_RE = /(https?:\/\/[^\s]+|www\.[^\s]+|\b[a-z0-9-]+\.(com|in|net|org|xyz|top|click|ru|tk|ly|info)(\/[^\s]*)?)/gi;
const BAD_URL = /(bit\.ly|tinyurl|\.xyz|\.top|\.click|\.ru|\.tk|\.info|\d+\.\d+\.\d+\.\d+|-login|verify|claim|free|prize)/i;

export function analyzeMessage(text: string): Analysis {
  const keywords = new Set<string>();
  const reasons = new Set<string>();
  let score = 0;

  for (const r of RULES) {
    const m = text.match(r.pattern);
    if (m) {
      score += r.weight + (m.length - 1) * r.weight * 0.3;
      reasons.add(r.label);
      m.forEach((k) => keywords.add(k.trim().toLowerCase()));
    }
  }
  // standalone sensitive words
  (text.match(/\b(otp|password|bank details|cvv|pin)\b/gi) || []).forEach((k) => keywords.add(k.toLowerCase()));

  const urls = [...new Set(text.match(URL_RE) || [])];
  const suspiciousUrl = urls.some((u) => BAD_URL.test(u) || !/^https:\/\//i.test(u));
  if (urls.length) {
    score += suspiciousUrl ? 3 : 1.5;
    reasons.add(suspiciousUrl ? "Suspicious URL" : "Contains a link");
  }

  const letters = text.replace(/[^a-zA-Z]/g, "").length;
  if (letters > 12 && text.replace(/[^A-Z]/g, "").length / letters > 0.5) { score += 1.5; reasons.add("Excessive capital letters"); }
  if ((text.match(/!/g) || []).length >= 3) { score += 1; reasons.add("Excessive exclamation marks"); }

  // Context: legitimate OTP notices say "do not share"
  if (/\b(do not|don't|never) share\b/i.test(text)) score -= 3;
  score = Math.max(0, score);

  const isSpam = score >= 3;
  const riskLevel: RiskLevel = score >= 5 ? "HIGH" : score >= 2 ? "MEDIUM" : "LOW";
  const safetyScore = Math.max(2, Math.min(98, Math.round(98 - score * 11)));
  const confidence = Math.max(55, Math.round(isSpam ? Math.min(99, 70 + score * 4) : Math.min(98, 98 - score * 9)));
  const list = [...reasons];

  return {
    isSpam,
    confidence,
    safetyScore,
    riskLevel,
    reasons: list,
    reason: isSpam
      ? `Message shows ${list.length} spam indicator${list.length > 1 ? "s" : ""}.`
      : list.length ? "Minor indicators found, but no strong spam pattern." : "No major suspicious patterns detected.",
    keywords: [...keywords].slice(0, 10),
    urls,
    suspiciousUrl,
    recommendation: suspiciousUrl || isSpam
      ? "Do not enter passwords, OTPs, bank details or personal information on unknown websites."
      : riskLevel === "MEDIUM"
        ? "Looks mostly safe, but verify the sender before acting on it."
        : "This message looks safe. Stay cautious with unknown senders.",
  };
}
