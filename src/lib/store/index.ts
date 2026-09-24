import "server-only";
import type { Store } from "./types";
import { localStore } from "./local";
import { supabaseStore } from "./supabase";

export function supabaseConfigurato(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

/** Supabase se configurato, altrimenti l'archivio su file (solo per lo sviluppo). */
export function getStore(): Store {
  if (supabaseConfigurato()) return supabaseStore;
  if (process.env.NODE_ENV === "production" && process.env.VERCEL) {
    throw new Error("In produzione servono SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.");
  }
  return localStore;
}

export type { Report, StatoReport } from "./types";
