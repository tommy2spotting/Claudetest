import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/headers", () => ({ cookies: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));

import { creaSessione, passwordCorretta, sessioneValida } from "./admin-auth";

beforeEach(() => {
  process.env.ADMIN_PASSWORD = "una-password-di-prova";
  process.env.ADMIN_SESSION_SECRET = "x".repeat(40);
});

describe("accesso al pannello", () => {
  it("riconosce solo la password giusta", () => {
    expect(passwordCorretta("una-password-di-prova")).toBe(true);
    expect(passwordCorretta("sbagliata")).toBe(false);
    expect(passwordCorretta("")).toBe(false);
  });

  it("rifiuta tutto se la password non è configurata", () => {
    delete process.env.ADMIN_PASSWORD;
    expect(passwordCorretta("")).toBe(false);
  });

  it("accetta una sessione firmata e rifiuta quelle alterate", () => {
    const { valore } = creaSessione();
    expect(sessioneValida(valore)).toBe(true);
    expect(sessioneValida(valore.slice(0, -2) + "xx")).toBe(false);
    expect(sessioneValida(valore.replace(/admin\.\d+/, `admin.${Date.now() + 1e12}`))).toBe(false);
    expect(sessioneValida(undefined)).toBe(false);
  });

  it("rifiuta una sessione firmata con un altro segreto", () => {
    const { valore } = creaSessione();
    process.env.ADMIN_SESSION_SECRET = "y".repeat(40);
    expect(sessioneValida(valore)).toBe(false);
  });
});
