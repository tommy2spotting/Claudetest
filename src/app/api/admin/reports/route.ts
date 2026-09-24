import { after, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_ADMIN, sessioneValida } from "@/lib/admin-auth";
import { elaboraReport, leggiForm } from "@/lib/reports";
import { getStore } from "@/lib/store";

// La ricerca web può richiedere qualche minuto.
export const maxDuration = 300;

/** Prova manuale dal pannello: crea il report e lo elabora dopo aver risposto. */
export async function POST(request: Request) {
  const c = await cookies();
  if (!sessioneValida(c.get(COOKIE_ADMIN)?.value)) {
    return NextResponse.json({ errori: ["Accesso scaduto: rientra nel pannello."] }, { status: 401 });
  }

  const form = await request.formData();
  const esito = await leggiForm(String(form.get("slug") ?? ""), form);
  if (!esito.ok) return NextResponse.json({ errori: esito.errori }, { status: 400 });

  const store = getStore();
  const r = await store.createReport({
    toolSlug: esito.tool.slug,
    origine: "admin",
    email: null,
    prezzoCentesimi: 0,
    input: esito.input,
    model: esito.tool.ai.model,
  });
  const immagini = await store.saveImages(r.id, esito.images);
  await store.updateReport(r.id, { immagini });

  after(() => elaboraReport(r.id));
  return NextResponse.json({ url: `/admin/r/${r.id}` });
}
