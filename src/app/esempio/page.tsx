import type { Metadata } from "next";
import Link from "next/link";
import { reportDemo } from "@/lib/engine/demo";
import { CompraOScappaView } from "@/components/report/CompraOScappaView";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";

export const metadata: Metadata = {
  title: "Report di esempio: cosa ricevi con Compra o Scappa | Vistochiaro",
  description: "Guarda un report completo di Compra o Scappa: verdetto, prezzo rispetto al mercato, campanelli d'allarme e domande da fare al venditore.",
};

export default function EsempioPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 pb-16 pt-2">
        <p className="rounded-xl bg-soft px-4 py-3 text-[15px] text-muted">
          <b className="text-ink">Esempio.</b> L&apos;auto e l&apos;annuncio sono inventati per mostrarti com&apos;è fatto un report. Un
          report vero contiene i link a tutte le fonti usate.
        </p>
        <CompraOScappaView r={reportDemo} demo />
        <Link
          href="/compra-o-scappa"
          className="rounded-2xl bg-ink px-5 py-4 text-center font-display text-[19px] font-bold text-paper hover:opacity-90"
        >
          Controlla il tuo annuncio
        </Link>
      </main>
      <SiteFooter />
    </>
  );
}
