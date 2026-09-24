import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const COOKIE_ADMIN = "vc_admin";
const DURATA_MS = 30 * 24 * 60 * 60 * 1000; // 30 giorni: comodo da telefono

function segreto(): string {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s || s.length < 32) throw new Error("ADMIN_SESSION_SECRET mancante o troppo corto (min 32 caratteri).");
  return s;
}

function firma(valore: string): string {
  return createHmac("sha256", segreto()).update(valore).digest("base64url");
}

function uguali(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

export function passwordCorretta(tentativo: string): boolean {
  const vera = process.env.ADMIN_PASSWORD;
  if (!vera) return false;
  // Confronto tra hash di lunghezza fissa: non rivela la lunghezza della password.
  return uguali(firma(`pw:${tentativo}`), firma(`pw:${vera}`));
}

export function creaSessione(): { valore: string; scadenza: Date } {
  const scadenza = new Date(Date.now() + DURATA_MS);
  const payload = `admin.${scadenza.getTime()}`;
  return { valore: `${payload}.${firma(payload)}`, scadenza };
}

export function sessioneValida(valore: string | undefined): boolean {
  if (!valore) return false;
  const i = valore.lastIndexOf(".");
  if (i < 0) return false;
  const payload = valore.slice(0, i);
  const sig = valore.slice(i + 1);
  const scadenza = Number(payload.split(".")[1]);
  return uguali(sig, firma(payload)) && Number.isFinite(scadenza) && scadenza > Date.now();
}

/** Da chiamare in cima a ogni pagina e azione del pannello. */
export async function richiediAdmin(): Promise<void> {
  const c = await cookies();
  if (!sessioneValida(c.get(COOKIE_ADMIN)?.value)) redirect("/admin/login");
}
