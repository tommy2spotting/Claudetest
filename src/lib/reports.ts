import "server-only";
import { runTool } from "@/lib/engine/run";
import { getStore } from "@/lib/store";
import type { Report } from "@/lib/store/types";
import { getTool } from "@/lib/tools/registry";
import type { AnyTool, ImageMediaType } from "@/lib/tools/types";

export const MAX_BYTE_IMMAGINE = 5 * 1024 * 1024;
const TIPI_OK: ImageMediaType[] = ["image/jpeg", "image/png", "image/webp"];

export type EsitoForm =
  | { ok: true; tool: AnyTool; input: unknown; images: { mediaType: ImageMediaType; data: Buffer }[] }
  | { ok: false; errori: string[] };

/** Legge e valida il form di uno strumento (campi + immagini). */
export async function leggiForm(slug: string, form: FormData): Promise<EsitoForm> {
  const tool = getTool(slug);
  if (!tool) return { ok: false, errori: ["Strumento sconosciuto."] };

  const campi: Record<string, string> = {};
  for (const [k, v] of form.entries()) if (typeof v === "string") campi[k] = v;
  const parsed = tool.inputSchema.safeParse(campi);
  const errori: string[] = parsed.success ? [] : parsed.error.issues.map((i: { message: string }) => i.message);

  const files = form.getAll("immagini").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length > tool.maxImmagini) errori.push(`Puoi caricare al massimo ${tool.maxImmagini} immagini.`);
  const images: { mediaType: ImageMediaType; data: Buffer }[] = [];
  for (const f of files.slice(0, tool.maxImmagini)) {
    if (!TIPI_OK.includes(f.type as ImageMediaType)) errori.push(`"${f.name}" non è un'immagine JPG, PNG o WebP.`);
    else if (f.size > MAX_BYTE_IMMAGINE) errori.push(`"${f.name}" supera i 5 MB.`);
    else images.push({ mediaType: f.type as ImageMediaType, data: Buffer.from(await f.arrayBuffer()) });
  }

  if (parsed.success && images.length === 0 && !(parsed.data as { testo?: string }).testo) {
    errori.push("Carica almeno uno screenshot o incolla il testo dell'annuncio.");
  }
  if (errori.length > 0 || !parsed.success) return { ok: false, errori };
  return { ok: true, tool, input: parsed.data, images };
}

/** Esegue (o riesegue) lo strumento su un report già salvato e aggiorna lo stato. */
export async function elaboraReport(id: string): Promise<Report> {
  const store = getStore();
  const r = await store.getReport(id);
  if (!r) throw new Error(`Report ${id} non trovato`);
  const tool = getTool(r.toolSlug);
  if (!tool) throw new Error(`Strumento ${r.toolSlug} non trovato`);

  await store.updateReport(id, { stato: "in_lavorazione", errore: null });
  try {
    const images = await store.loadImages(r.immagini);
    const res = await runTool(tool, { input: r.input, images });
    return await store.updateReport(id, {
      stato: res.stato,
      report: res.report,
      motiviRevisione: res.motiviRevisione,
      fonti: res.fonti,
      dossier: res.dossier,
      // Somma i costi delle rigenerazioni precedenti: è quanto ci è costato il report.
      usage: res.usage,
      costoUsd: Math.round((r.costoUsd + res.costoUsd) * 10_000) / 10_000,
      model: res.model,
      demo: res.demo,
    });
  } catch (err) {
    console.error("Errore elaborazione report", id, err);
    return store.updateReport(id, {
      stato: "errore",
      errore: err instanceof Error ? err.message : String(err),
    });
  }
}
