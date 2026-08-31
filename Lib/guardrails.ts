/**
 * Multi-layer security guardrail system defending against Prompt Injections, Data Floods, and Malformed Inputs.
 */

const INJECTION_PATTERNS = [
  /ignore (all )?previous instructions/i,
  /disregard system prompt/i,
  /you are now DAN/i,
  /bypass security/i,
  /system override/i,
  /show me your secret key/i,
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi
];

export function sanitizeAndGuard(input: string): { allowed: boolean; reason?: string; cleanText: string } {
  if (!input || input.trim().length === 0) {
    return { allowed: false, reason: "Query is empty.", cleanText: "" };
  }

  if (input.length > 2000) {
    return { allowed: false, reason: "Input exceeds maximum character safety limit (2000 chars).", cleanText: "" };
  }

  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(input)) {
      return {
        allowed: false,
        reason: "🛡️ Guardrail Alert: Adversarial prompt injection or prohibited token detected.",
        cleanText: ""
      };
    }
  }

  return { allowed: true, cleanText: input.trim() };
}