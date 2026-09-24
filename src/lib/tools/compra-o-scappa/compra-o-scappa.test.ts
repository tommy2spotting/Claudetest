import { describe, expect, it } from "vitest";
import { reportDemo } from "@/lib/engine/demo";
import { inputSchema, outputSchema, type CompraOScappaReport } from "./schema";
import { normalizzaUrl, qualityCheck } from "./quality";
import { buildResearchPrompt } from "./prompt";

const FONTE_A = "https://www.esempio-rivista.it/panda-difetti";
const FONTE_B = "https://annunci.esempio.it/panda-2017-72000km";

/** Report valido con fonti vere, costruito partendo dal demo. */
function reportBuono(): CompraOScappaReport {
  const r = structuredClone(reportDemo);
  r.puntiDeboli[0].fonti = [FONTE_A];
  r.prezzo.confronti[0].url = FONTE_B;
  r.prezzo.confronti = [r.prezzo.confronti[0]];
  return r;
}
const trovate = new Set([FONTE_A, FONTE_B]);

describe("schema di output", () => {
  it("accetta il report dimostrativo", () => {
    expect(outputSchema.safeParse(reportDemo).success).toBe(true);
  });
  it("rifiuta un verdetto sconosciuto", () => {
    expect(outputSchema.safeParse({ ...reportDemo, verdetto: "forse" }).success).toBe(false);
  });
});

describe("schema di input", () => {
  it("trasforma i campi vuoti in undefined e i numeri in numeri", () => {
    const r = inputSchema.parse({ testo: " ciao ", link: "", budget: "8000", kmAnno: "", uso: "", provincia: "" });
    expect(r).toEqual({ testo: "ciao", link: undefined, budget: 8000, kmAnno: undefined, uso: undefined, provincia: undefined });
  });
  it("rifiuta link non validi e usi sconosciuti", () => {
    expect(inputSchema.safeParse({ link: "non un link" }).success).toBe(false);
    expect(inputSchema.safeParse({ uso: "pista" }).success).toBe(false);
  });
});

describe("controllo qualità", () => {
  it("promuove un report completo con fonti verificate", () => {
    expect(qualityCheck(reportBuono(), trovate)).toEqual({ ok: true });
  });

  it("manda in revisione se l'affidabilità è bassa", () => {
    const r = reportBuono();
    r.affidabilita.livello = "bassa";
    expect(qualityCheck(r, trovate)).toMatchObject({ ok: false });
  });

  it("manda in revisione se mancano le fonti", () => {
    const r = reportBuono();
    r.puntiDeboli.forEach((p) => (p.fonti = []));
    r.prezzo.confronti = [];
    const q = qualityCheck(r, trovate);
    expect(q.ok).toBe(false);
    if (!q.ok) expect(q.motivi).toContain("Mancano le fonti.");
  });

  it("scopre le fonti inventate, non uscite dalle ricerche", () => {
    const r = reportBuono();
    r.puntiDeboli[0].fonti = ["https://sito-inventato.it/pagina"];
    const q = qualityCheck(r, trovate);
    expect(q.ok).toBe(false);
    if (!q.ok) expect(q.motivi.join()).toMatch(/non presenti nelle ricerche/);
  });

  it("accetta la stessa fonte scritta con www o slash finale", () => {
    const r = reportBuono();
    r.puntiDeboli[0].fonti = ["https://esempio-rivista.it/panda-difetti/"];
    expect(qualityCheck(r, trovate).ok).toBe(true);
  });

  it("richiede 3 motivi e da 8 a 10 domande", () => {
    const r = reportBuono();
    r.motivi = r.motivi.slice(0, 2);
    r.domande = r.domande.slice(0, 5);
    const q = qualityCheck(r, trovate);
    expect(q.ok).toBe(false);
    if (!q.ok) expect(q.motivi).toHaveLength(2);
  });

  it("richiede la trattativa solo con il verdetto 'tratta'", () => {
    const senza = reportBuono();
    senza.trattativa = null;
    expect(qualityCheck(senza, trovate).ok).toBe(false);
    const compra = reportBuono();
    compra.verdetto = "compra";
    expect(qualityCheck(compra, trovate).ok).toBe(false);
    compra.trattativa = null;
    expect(qualityCheck(compra, trovate).ok).toBe(true);
  });

  it("blocca telefoni ed email del venditore", () => {
    const tel = reportBuono();
    tel.campanelli[0].dettaglio = "Chiama il venditore al 347 123 4567";
    expect(qualityCheck(tel, trovate).ok).toBe(false);
    const mail = reportBuono();
    mail.campanelli[0].dettaglio = "Scrivi a mario.rossi@example.com";
    expect(qualityCheck(mail, trovate).ok).toBe(false);
  });
});

describe("normalizzaUrl", () => {
  it("ignora www, slash finale e ancora", () => {
    expect(normalizzaUrl("https://www.a.it/b/#x")).toBe(normalizzaUrl("http://a.it/b"));
  });
});

describe("prompt di ricerca", () => {
  it("include i dati del cliente e segnala l'assenza di screenshot", () => {
    const p = buildResearchPrompt(inputSchema.parse({ testo: "Panda 2017", budget: "8000", uso: "citta" }), 0);
    expect(p).toContain("Panda 2017");
    expect(p).toContain("8000 €");
    expect(p).toContain("soprattutto in città");
    expect(p).toContain("Non ci sono screenshot");
  });
});
