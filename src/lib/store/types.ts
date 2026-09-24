import type { ImageMediaType } from "@/lib/tools/types";
import type { Usage } from "@/lib/engine/pricing";

export type StatoReport = "in_lavorazione" | "pronto" | "in_revisione" | "errore" | "rimborsato";

export type Report = {
  id: string;
  /** Token segreto del link privato /r/<token>. */
  token: string;
  toolSlug: string;
  stato: StatoReport;
  /** "admin" = prova manuale dal pannello; "cliente" = ordine vero (Fase 3). */
  origine: "admin" | "cliente";
  email: string | null;
  prezzoCentesimi: number;
  input: unknown;
  immagini: string[];
  report: unknown | null;
  motiviRevisione: string[];
  fonti: string[];
  dossier: string;
  usage: Usage | null;
  costoUsd: number;
  model: string;
  demo: boolean;
  errore: string | null;
  createdAt: string;
  updatedAt: string;
};

export type NuovoReport = Pick<Report, "toolSlug" | "origine" | "email" | "prezzoCentesimi" | "input" | "model">;

export type StoredImage = { mediaType: ImageMediaType; data: Buffer };

export interface Store {
  createReport(data: NuovoReport): Promise<Report>;
  updateReport(id: string, patch: Partial<Omit<Report, "id" | "token" | "createdAt">>): Promise<Report>;
  getReport(id: string): Promise<Report | null>;
  getReportByToken(token: string): Promise<Report | null>;
  listReports(limit?: number): Promise<Report[]>;
  saveImages(reportId: string, images: StoredImage[]): Promise<string[]>;
  loadImages(paths: string[]): Promise<StoredImage[]>;
}
