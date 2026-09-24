import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { nuovoTokenPrivato } from "@/lib/tokens";
import type { ImageMediaType } from "@/lib/tools/types";
import type { NuovoReport, Report, Store, StoredImage } from "./types";

/**
 * Archivio di produzione. Usa la chiave "service role" SOLO lato server:
 * le tabelle hanno RLS attivo senza policy pubbliche, quindi dal browser non si legge nulla.
 */
const BUCKET = "screenshot";
const EXT: Record<ImageMediaType, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

type Row = {
  id: string;
  token: string;
  tool_slug: string;
  stato: Report["stato"];
  origine: Report["origine"];
  email: string | null;
  prezzo_centesimi: number;
  input: unknown;
  immagini: string[];
  report: unknown | null;
  motivi_revisione: string[];
  fonti: string[];
  dossier: string;
  usage: Report["usage"];
  costo_usd: number;
  model: string;
  demo: boolean;
  errore: string | null;
  created_at: string;
  updated_at: string;
};

const daRiga = (r: Row): Report => ({
  id: r.id,
  token: r.token,
  toolSlug: r.tool_slug,
  stato: r.stato,
  origine: r.origine,
  email: r.email,
  prezzoCentesimi: r.prezzo_centesimi,
  input: r.input,
  immagini: r.immagini,
  report: r.report,
  motiviRevisione: r.motivi_revisione,
  fonti: r.fonti,
  dossier: r.dossier,
  usage: r.usage,
  costoUsd: Number(r.costo_usd),
  model: r.model,
  demo: r.demo,
  errore: r.errore,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

function aRiga(p: Partial<Report>): Partial<Row> {
  const out: Partial<Row> = {};
  if (p.stato !== undefined) out.stato = p.stato;
  if (p.email !== undefined) out.email = p.email;
  if (p.immagini !== undefined) out.immagini = p.immagini;
  if (p.report !== undefined) out.report = p.report;
  if (p.motiviRevisione !== undefined) out.motivi_revisione = p.motiviRevisione;
  if (p.fonti !== undefined) out.fonti = p.fonti;
  if (p.dossier !== undefined) out.dossier = p.dossier;
  if (p.usage !== undefined) out.usage = p.usage;
  if (p.costoUsd !== undefined) out.costo_usd = p.costoUsd;
  if (p.model !== undefined) out.model = p.model;
  if (p.demo !== undefined) out.demo = p.demo;
  if (p.errore !== undefined) out.errore = p.errore;
  return out;
}

let client: SupabaseClient | null = null;
function db(): SupabaseClient {
  if (!client) {
    client = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { persistSession: false },
    });
  }
  return client;
}

function ok<T>(res: { data: T | null; error: { message: string } | null }): T {
  if (res.error) throw new Error(`Supabase: ${res.error.message}`);
  return res.data as T;
}

export const supabaseStore: Store = {
  async createReport(data: NuovoReport) {
    const row = ok(
      await db()
        .from("reports")
        .insert({
          token: nuovoTokenPrivato(),
          tool_slug: data.toolSlug,
          origine: data.origine,
          email: data.email,
          prezzo_centesimi: data.prezzoCentesimi,
          input: data.input,
          model: data.model,
        })
        .select()
        .single<Row>(),
    );
    return daRiga(row);
  },

  async updateReport(id, patch) {
    const row = ok(
      await db()
        .from("reports")
        .update({ ...aRiga(patch), updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single<Row>(),
    );
    return daRiga(row);
  },

  async getReport(id) {
    const row = ok(await db().from("reports").select().eq("id", id).maybeSingle<Row>());
    return row ? daRiga(row) : null;
  },

  async getReportByToken(token) {
    const row = ok(await db().from("reports").select().eq("token", token).maybeSingle<Row>());
    return row ? daRiga(row) : null;
  },

  async listReports(limit = 100) {
    const rows = ok(
      await db().from("reports").select().order("created_at", { ascending: false }).limit(limit).returns<Row[]>(),
    );
    return rows.map(daRiga);
  },

  async saveImages(reportId, images) {
    return Promise.all(
      images.map(async (img, i) => {
        const p = `${reportId}/${i + 1}.${EXT[img.mediaType]}`;
        const { error } = await db().storage.from(BUCKET).upload(p, img.data, { contentType: img.mediaType, upsert: true });
        if (error) throw new Error(`Supabase storage: ${error.message}`);
        return p;
      }),
    );
  },

  async loadImages(paths) {
    return Promise.all(
      paths.map(async (p): Promise<StoredImage> => {
        const { data, error } = await db().storage.from(BUCKET).download(p);
        if (error || !data) throw new Error(`Supabase storage: ${error?.message ?? "file mancante"}`);
        return { mediaType: data.type as ImageMediaType, data: Buffer.from(await data.arrayBuffer()) };
      }),
    );
  },
};
