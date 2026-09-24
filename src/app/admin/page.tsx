import type { Metadata } from "next";
import Link from "next/link";
import { richiediAdmin } from "@/lib/admin-auth";
import { aiConfigurata } from "@/lib/engine/run";
import { getStore, supabaseConfigurato } from "@/lib/store";
import { getTool } from "@/lib/tools/registry";
import { AdminShell, StatoPill, dollari } from "./ui";

export const metadata: Metadata = { title: "Pannello" };

export default async function AdminHome({ searchParams }: PageProps<"/admin">) {
  await richiediAdmin();
  const { filtro } = await searchParams;
  const tutti = await getStore().listReports(200);
  const daRivedere = tutti.filter((r) => r.stato === "in_revisione" || r.stato === "errore");
  const elenco = filtro === "revisione" ? daRivedere : tutti;
  const costoTotale = tutti.reduce((s, r) => s + r.costoUsd, 0);
  const conCosto = tutti.filter((r) => r.costoUsd > 0);
  const costoMedio = conCosto.length ? costoTotale / conCosto.length : 0;

  return (
    <AdminShell>
      <div className="flex flex-col gap-6">
        {(!aiConfigurata() || !supabaseConfigurato()) && (
          <div className="rounded-2xl bg-wait-soft p-4 text-[15px] text-wait-ink">
            {!aiConfigurata() && (
              <p>
                <b>Modalità dimostrativa:</b> manca ANTHROPIC_API_KEY, quindi i report sono di esempio e non costano nulla.
              </p>
            )}
            {!supabaseConfigurato() && (
              <p>
                <b>Archivio locale:</b> manca Supabase, i dati stanno nella cartella .data di questo computer.
              </p>
            )}
          </div>
        )}

        <dl className="grid grid-cols-3 gap-3">
          {[
            ["Report", String(tutti.length)],
            ["Da rivedere", String(daRivedere.length)],
            ["Costo medio", dollari(costoMedio)],
          ].map(([k, v]) => (
            <div key={k} className="flex flex-col gap-1 rounded-2xl bg-card p-4">
              <dt className="text-[13px] text-muted">{k}</dt>
              <dd className="font-display text-[26px] font-bold tabular">{v}</dd>
            </div>
          ))}
        </dl>

        <div className="flex gap-2 text-[15px]">
          <Link href="/admin" className={`rounded-full px-3 py-1 ${filtro !== "revisione" ? "bg-ink text-paper" : "bg-soft"}`}>
            Tutti
          </Link>
          <Link href="/admin?filtro=revisione" className={`rounded-full px-3 py-1 ${filtro === "revisione" ? "bg-ink text-paper" : "bg-soft"}`}>
            Coda di revisione ({daRivedere.length})
          </Link>
        </div>

        {elenco.length === 0 ? (
          <p className="rounded-2xl bg-card p-6 text-muted">
            Nessun report. <Link href="/admin/prova" className="font-bold text-ink underline">Fai una prova manuale</Link>.
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-line overflow-hidden rounded-2xl bg-card">
            {elenco.map((r) => (
              <li key={r.id}>
                <Link href={`/admin/r/${r.id}`} className="flex items-center justify-between gap-3 px-4 py-3.5 hover:bg-soft">
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate font-bold">{getTool(r.toolSlug)?.nome ?? r.toolSlug}</span>
                    <span className="text-[14px] text-muted tabular">
                      {new Date(r.createdAt).toLocaleString("it-IT", { dateStyle: "short", timeStyle: "short" })} ·{" "}
                      {r.origine === "admin" ? "prova" : "cliente"} · {dollari(r.costoUsd)}
                    </span>
                  </span>
                  <StatoPill stato={r.stato} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AdminShell>
  );
}
