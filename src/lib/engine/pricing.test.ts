import { describe, expect, it } from "vitest";
import { costoUsd, sommaUsage, usageVuoto } from "./pricing";

describe("costoUsd", () => {
  it("calcola token e ricerche web per Sonnet 5", () => {
    const u = { inputTokens: 60_000, outputTokens: 8_000, cacheWriteTokens: 0, cacheReadTokens: 0, webSearches: 6 };
    // 60k × 2$/M = 0,12 · 8k × 10$/M = 0,08 · 6 × 0,01 = 0,06
    expect(costoUsd("claude-sonnet-5", u)).toBe(0.26);
  });

  it("conta cache in scrittura e in lettura", () => {
    const u = { ...usageVuoto(), cacheWriteTokens: 1_000_000, cacheReadTokens: 1_000_000 };
    expect(costoUsd("claude-sonnet-5", u)).toBe(2.7);
  });

  it("rifiuta modelli senza prezzo", () => {
    expect(() => costoUsd("modello-inesistente", usageVuoto())).toThrow(/pricing.ts/);
  });

  it("somma l'uso di più chiamate", () => {
    const a = { inputTokens: 1, outputTokens: 2, cacheWriteTokens: 3, cacheReadTokens: 4, webSearches: 5 };
    expect(sommaUsage(a, a)).toEqual({ inputTokens: 2, outputTokens: 4, cacheWriteTokens: 6, cacheReadTokens: 8, webSearches: 10 });
  });
});
