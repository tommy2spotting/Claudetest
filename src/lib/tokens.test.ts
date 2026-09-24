import { describe, expect, it } from "vitest";
import { nuovoTokenPrivato, tokenValido } from "./tokens";

describe("token del link privato", () => {
  it("è lungo, valido e sempre diverso", () => {
    const tokens = new Set(Array.from({ length: 1000 }, nuovoTokenPrivato));
    expect(tokens.size).toBe(1000);
    for (const t of tokens) expect(tokenValido(t)).toBe(true);
  });
  it("rifiuta token malformati", () => {
    expect(tokenValido("abc")).toBe(false);
    expect(tokenValido("../../etc/passwd".padEnd(32, "a"))).toBe(false);
  });
});
