"use server";

import { after } from "next/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { COOKIE_ADMIN, creaSessione, passwordCorretta, richiediAdmin } from "@/lib/admin-auth";
import { elaboraReport } from "@/lib/reports";
import { getStore } from "@/lib/store";

export async function login(_: string | null, form: FormData): Promise<string | null> {
  // Piccola attesa fissa: rende inutili i tentativi a raffica.
  await new Promise((r) => setTimeout(r, 600));
  if (!process.env.ADMIN_PASSWORD || !process.env.ADMIN_SESSION_SECRET) {
    return "Il pannello non è configurato: imposta ADMIN_PASSWORD e ADMIN_SESSION_SECRET in .env.local.";
  }
  if (!passwordCorretta(String(form.get("password") ?? ""))) return "Password sbagliata.";
  const s = creaSessione();
  (await cookies()).set(COOKIE_ADMIN, s.valore, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: s.scadenza,
  });
  redirect("/admin");
}

export async function logout() {
  (await cookies()).delete(COOKIE_ADMIN);
  redirect("/admin/login");
}

export async function rigenera(id: string) {
  await richiediAdmin();
  await getStore().updateReport(id, { stato: "in_lavorazione", errore: null });
  after(() => elaboraReport(id));
  revalidatePath(`/admin/r/${id}`);
}

/** Dalla coda di revisione: il report è stato controllato a mano e può partire. */
export async function approva(id: string) {
  await richiediAdmin();
  await getStore().updateReport(id, { stato: "pronto" });
  revalidatePath(`/admin/r/${id}`);
}

/** Fase 1: segna soltanto il rimborso. Il rimborso vero su Stripe arriva in Fase 3. */
export async function segnaRimborsato(id: string) {
  await richiediAdmin();
  await getStore().updateReport(id, { stato: "rimborsato" });
  revalidatePath(`/admin/r/${id}`);
}
