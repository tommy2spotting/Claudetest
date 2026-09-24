import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { nuovoTokenPrivato } from "@/lib/tokens";
import type { ImageMediaType } from "@/lib/tools/types";
import type { NuovoReport, Report, Store, StoredImage } from "./types";

/**
 * Archivio su file per lo sviluppo in locale (cartella .data, esclusa da git).
 * In produzione si usa Supabase: vedi supabase.ts.
 */
const DIR = path.join(process.cwd(), ".data");
const DB = path.join(DIR, "db.json");
const EXT: Record<ImageMediaType, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

let coda: Promise<unknown> = Promise.resolve();
function inCoda<T>(fn: () => Promise<T>): Promise<T> {
  const p = coda.then(fn, fn);
  coda = p.catch(() => undefined);
  return p;
}

async function leggi(): Promise<Report[]> {
  try {
    return JSON.parse(await readFile(DB, "utf8")) as Report[];
  } catch {
    return [];
  }
}

async function scrivi(reports: Report[]) {
  await mkdir(DIR, { recursive: true });
  await writeFile(DB, JSON.stringify(reports, null, 2));
}

export const localStore: Store = {
  createReport: (data: NuovoReport) =>
    inCoda(async () => {
      const ora = new Date().toISOString();
      const r: Report = {
        ...data,
        id: randomUUID(),
        token: nuovoTokenPrivato(),
        stato: "in_lavorazione",
        immagini: [],
        report: null,
        motiviRevisione: [],
        fonti: [],
        dossier: "",
        usage: null,
        costoUsd: 0,
        demo: false,
        errore: null,
        createdAt: ora,
        updatedAt: ora,
      };
      const all = await leggi();
      all.push(r);
      await scrivi(all);
      return r;
    }),

  updateReport: (id, patch) =>
    inCoda(async () => {
      const all = await leggi();
      const i = all.findIndex((r) => r.id === id);
      if (i === -1) throw new Error(`Report ${id} non trovato`);
      all[i] = { ...all[i], ...patch, updatedAt: new Date().toISOString() };
      await scrivi(all);
      return all[i];
    }),

  getReport: async (id) => (await leggi()).find((r) => r.id === id) ?? null,
  getReportByToken: async (token) => (await leggi()).find((r) => r.token === token) ?? null,
  listReports: async (limit = 100) =>
    (await leggi()).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, limit),

  async saveImages(reportId, images) {
    const dir = path.join(DIR, "uploads", reportId);
    await mkdir(dir, { recursive: true });
    return Promise.all(
      images.map(async (img, i) => {
        const rel = path.join("uploads", reportId, `${i + 1}.${EXT[img.mediaType]}`);
        await writeFile(path.join(DIR, rel), img.data);
        return rel;
      }),
    );
  },

  async loadImages(paths) {
    return Promise.all(
      paths.map(async (rel): Promise<StoredImage> => {
        const ext = path.extname(rel).slice(1);
        const mediaType = (Object.entries(EXT).find(([, e]) => e === ext)?.[0] ?? "image/jpeg") as ImageMediaType;
        return { mediaType, data: await readFile(path.join(DIR, rel)) };
      }),
    );
  },
};
