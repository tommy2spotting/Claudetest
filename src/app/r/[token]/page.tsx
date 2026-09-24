import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getStore } from "@/lib/store";
import { tokenValido } from "@/lib/tokens";
import { AutoRefresh } from "@/components/AutoRefresh";
import { Semaforo } from "@/components/Semaforo";
import { ReportView } from "@/components/report/ReportView";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";

export const metadata: Metadata = {
  title: "Il tuo report — Vistochiaro",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

function Attesa({ titolo, testo, aggiorna }: { titolo: string; testo: string; aggiorna?: boolean }) {
  return (
    <section className="flex flex-col items-start gap-5 rounded-3xl border border-line bg-card p-8">
      {aggiorna && <AutoRefresh ogniSecondi={6} />}
      <Semaforo acceso="wait" size={24} intro />
      <h1 className="text-[34px] font-extrabold">{titolo}</h1>
      <p className="max-w-[55ch] text-[18px]">{testo}</p>
    </section>
  );
}

export default async function RisultatoPage({ params }: PageProps<"/r/[token]">) {
  const { token } = await params;
  if (!tokenValido(token)) notFound();
  const r = await getStore().getReportByToken(token);
  if (!r) notFound();

  let contenuto;
  if (r.stato === "pronto" && r.report !== null) {
    contenuto = <ReportView toolSlug={r.toolSlug} report={r.report} demo={r.demo} />;
  } else if (r.stato === "in_lavorazione") {
    contenuto = (
      <Attesa
        titolo="Stiamo analizzando l'annuncio"
        testo="Leggiamo gli screenshot e cerchiamo annunci simili e difetti noti. Di solito servono 2–3 minuti: questa pagina si aggiorna da sola."
        aggiorna
      />
    );
  } else if (r.stato === "rimborsato") {
    contenuto = <Attesa titolo="Report rimborsato" testo="Questo report è stato rimborsato. Per qualsiasi dubbio rispondi all'email che hai ricevuto." />;
  } else {
    contenuto = (
      <Attesa
        titolo="Il tuo report è quasi pronto"
        testo="Lo stiamo ricontrollando per essere sicuri che sia preciso. Sarà pronto entro poche ore: ti scriviamo appena è disponibile."
      />
    );
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-16 pt-2">{contenuto}</main>
      <SiteFooter />
    </>
  );
}
