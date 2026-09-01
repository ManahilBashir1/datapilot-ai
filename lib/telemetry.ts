export interface RunTelemetry {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  latencyMs: number;
  costUSD: number;
}

export function computeTelemetry(promptText: string, completionText: string, latencyMs: number): RunTelemetry {
  const promptTokens = Math.max(1, Math.ceil(promptText.length / 4));
  const completionTokens = Math.max(1, Math.ceil(completionText.length / 4));
  const totalTokens = promptTokens + completionTokens;

  // Blended API pricing
  const cost = ((promptTokens / 1_000_000) * 0.30) + ((completionTokens / 1_000_000) * 1.00);

  return {
    promptTokens,
    completionTokens,
    totalTokens,
    latencyMs,
    costUSD: Number(cost.toFixed(6))
  };
}