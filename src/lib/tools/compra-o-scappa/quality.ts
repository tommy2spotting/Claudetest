import type { QualityResult } from "../types";
import type { CompraOScappaReport } from "./schema";

// Numeri di telefono italiani (fissi e mobili), anche con spazi o prefisso +39.
const TELEFONO = /(?:\+39[\s.-]?)?(?:3\d{2}|0\d{1,3})[\s.-]?\d{3}[\s.-]?\d{3,4}\b/;
const EMAIL = /[\w.+-]+@[\w-]+\.[\w.]+/;

export function normalizzaUrl(url: string): string {
  try {
    const u = new URL(url.trim());
    u.hash = "";
    return `${u.hostname.replace(/^www\./, "")}${u.pathname.replace(/\/$/, "")}${u.search}`;
  } catch {
    return url.trim();
  }
}

export function qualityCheck(r: CompraOScappaReport, fontiTrovate: Set<string>): QualityResult {
  const motivi: string[] = [];
  const trovate = new Set([...fontiTrovate].map(normalizzaUrl));

  if (r.motivi.length !== 3) motivi.push(`Servono 3 motivi, ce ne sono ${r.motivi.length}.`);
  if (r.affidabilita.livello === "bassa") motivi.push("L'AI dichiara affidabilità bassa.");
  if (r.domande.length < 8 || r.domande.length > 10)
    motivi.push(`Servono da 8 a 10 domande, ce ne sono ${r.domande.length}.`);
  if (r.verdetto === "tratta" && !r.trattativa) motivi.push("Verdetto 'tratta' senza prezzo obiettivo e messaggio.");
  if (r.verdetto !== "tratta" && r.trattativa) motivi.push("Trattativa presente ma il verdetto non è 'tratta'.");

  const tutteLeFonti = [
    ...r.puntiDeboli.flatMap((p) => p.fonti),
    ...r.prezzo.confronti.map((c) => c.url),
  ];
  if (tutteLeFonti.length === 0) motivi.push("Mancano le fonti.");
  const inventate = tutteLeFonti.filter((u) => !trovate.has(normalizzaUrl(u)));
  if (inventate.length > 0)
    motivi.push(`Fonti non presenti nelle ricerche fatte: ${inventate.slice(0, 3).join(", ")}`);

  if (r.puntiDeboli.length > 0 && r.puntiDeboli.every((p) => p.fonti.length === 0))
    motivi.push("Nessun punto debole ha una fonte.");
  if (r.prezzo.giudizio !== "dati_insufficienti" && r.prezzo.confronti.length === 0)
    motivi.push("Giudizio sul prezzo senza annunci di confronto.");

  const testo = JSON.stringify(r);
  if (TELEFONO.test(testo) || EMAIL.test(testo)) motivi.push("Il report sembra contenere dati personali.");

  return motivi.length === 0 ? { ok: true } : { ok: false, motivi };
}
