/**
 * Prezzi Claude API in dollari (fonte: https://platform.claude.com/docs/en/about-claude/pricing,
 * verificati il 24/09/2026). Aggiornali qui se cambiano.
 */
type ModelPrice = { input: number; output: number; cacheWrite5m: number; cacheRead: number };

export const PREZZI_PER_MILIONE: Record<string, ModelPrice> = {
  "claude-sonnet-5": { input: 2, output: 10, cacheWrite5m: 2.5, cacheRead: 0.2 },
  "claude-haiku-4-5": { input: 1, output: 5, cacheWrite5m: 1.25, cacheRead: 0.1 },
};

export const PREZZO_RICERCA_WEB = 10 / 1000;

export type Usage = {
  inputTokens: number;
  outputTokens: number;
  cacheWriteTokens: number;
  cacheReadTokens: number;
  webSearches: number;
};

export const usageVuoto = (): Usage => ({
  inputTokens: 0,
  outputTokens: 0,
  cacheWriteTokens: 0,
  cacheReadTokens: 0,
  webSearches: 0,
});

export function sommaUsage(a: Usage, b: Usage): Usage {
  return {
    inputTokens: a.inputTokens + b.inputTokens,
    outputTokens: a.outputTokens + b.outputTokens,
    cacheWriteTokens: a.cacheWriteTokens + b.cacheWriteTokens,
    cacheReadTokens: a.cacheReadTokens + b.cacheReadTokens,
    webSearches: a.webSearches + b.webSearches,
  };
}

/** Costo stimato in dollari, arrotondato a 4 decimali. */
export function costoUsd(model: string, u: Usage): number {
  const p = PREZZI_PER_MILIONE[model];
  if (!p) throw new Error(`Prezzo sconosciuto per il modello ${model}: aggiungilo in pricing.ts`);
  const token =
    (u.inputTokens * p.input +
      u.outputTokens * p.output +
      u.cacheWriteTokens * p.cacheWrite5m +
      u.cacheReadTokens * p.cacheRead) /
    1_000_000;
  const totale = token + u.webSearches * PREZZO_RICERCA_WEB;
  return Math.round(totale * 10_000) / 10_000;
}
