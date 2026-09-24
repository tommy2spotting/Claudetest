import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { richiediAdmin } from "@/lib/admin-auth";
import { getStore } from "@/lib/store";
import { getTool } from "@/lib/tools/registry";
import { AutoRefresh } from "@/components/AutoRefresh";
import { CopyButton } from "@/components/CopyButton";
import { ReportView } from "@/components/report/ReportView";
import { approva, rigenera, segnaRimborsato } from "../../actions";
import { AdminShell, StatoPill, dollari } from "../../ui";

export const metadata: Metadata = { title: "Dettaglio report" };

export default async function AdminReportPage({ params }: PageProps<"/admin/r/[id]">) {
  await richiediAdmin();
  const { id } = await params;
  const r = await getStore().getReport(id);
  if (!r) notFound();
  const tool = getTool(r.toolSlug);
  const linkPrivato = `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/r/${r.token}`;
  const btn = "rounded-xl px-4 py-2.5 text-[15px] font-bold";

  return (
    <AdminShell>
      {r.stato === "in_lavorazione" && <AutoRefresh ogniSecondi={4} />}
      <div className="flex flex-col gap-6">
        <Link href="/admin" className="text-[15px] text-muted hover:text-ink">
          ← Tutti i report
        </Link>

        <section className="flex flex-col gap-4 rounded-2xl bg-card p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-[26px] font-extrabold">{tool?.nome ?? r.toolSlug}</h1>
            <StatoPill stato={r.stato} />
          </div>

          {r.stato === "in_lavorazione" && (
            <p className="text-muted">Ricerca in corso: di solito servono 1–3 minuti. La pagina si aggiorna da sola.</p>
          )}
          {r.errore && <p className="rounded-xl bg-stop-soft p-3 text-stop-ink">Errore: {r.errore}</p>}
          {r.motiviRevisione.length > 0 && (
            <div className="rounded-xl bg-wait-soft p-3 text-wait-ink">
              <b>Perché è in revisione:</b>
              <ul className="list-disc pl-5">
                {r.motiviRevisione.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            </div>
          )}

          <dl className="grid grid-cols-2 gap-3 text-[15px] sm:grid-cols-4">
            <div>
              <dt className="text-muted">Costo AI</dt>
              <dd className="font-bold tabular">{dollari(r.costoUsd)}</dd>
            </div>
            <div>
              <dt className="text-muted">Token letti / scritti</dt>
              <dd className="tabular">
                {r.usage ? `${r.usage.inputTokens.toLocaleString("it-IT")} / ${r.usage.outputTokens.toLocaleString("it-IT")}` : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-muted">Ricerche web</dt>
              <dd className="tabular">{r.usage?.webSearches ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-muted">Modello</dt>
              <dd>{r.demo ? "demo (nessuna AI)" : r.model}</dd>
            </div>
          </dl>

          <div className="flex flex-wrap gap-2">
            <form action={rigenera.bind(null, r.id)}>
              <button className={`${btn} bg-ink text-paper`} disabled={r.stato === "in_lavorazione"}>
                Rigenera
              </button>
            </form>
            {r.stato === "in_revisione" && r.report !== null && (
              <form action={approva.bind(null, r.id)}>
                <button className={`${btn} bg-go text-white`}>Approva e rendi visibile</button>
              </form>
            )}
            {r.stato !== "rimborsato" && r.origine === "cliente" && (
              <form action={segnaRimborsato.bind(null, r.id)}>
                <button className={`${btn} border border-line`}>Segna come rimborsato</button>
              </form>
            )}
            <CopyButton testo={linkPrivato} label="Copia il link privato" className={`${btn} border border-line`} />
            <a href={`/r/${r.token}`} target="_blank" className={`${btn} border border-line`}>
              Apri come cliente
            </a>
          </div>
        </section>

        {r.report !== null && <ReportView toolSlug={r.toolSlug} report={r.report} demo={r.demo} />}

        <details className="rounded-2xl bg-card p-5">
          <summary className="cursor-pointer font-bold">Fonti trovate ({r.fonti.length}) e dossier di ricerca</summary>
          <ul className="mt-3 flex flex-col gap-1 text-[14px]">
            {r.fonti.map((f) => (
              <li key={f} className="break-all">
                <a href={f} target="_blank" rel="noopener noreferrer" className="underline">
                  {f}
                </a>
              </li>
            ))}
          </ul>
          <pre className="mt-4 overflow-x-auto whitespace-pre-wrap text-[14px] text-muted">{r.dossier || "—"}</pre>
        </details>

        <details className="rounded-2xl bg-card p-5">
          <summary className="cursor-pointer font-bold">Dati inseriti</summary>
          <pre className="mt-3 overflow-x-auto text-[14px]">{JSON.stringify(r.input, null, 2)}</pre>
          <p className="mt-2 text-[14px] text-muted">{r.immagini.length} screenshot salvati.</p>
        </details>
      </div>
    </AdminShell>
  );
}
