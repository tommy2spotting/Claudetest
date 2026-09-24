import type { Metadata } from "next";
import Link from "next/link";
import { compraOScappa } from "@/lib/tools/compra-o-scappa";
import { prezzoEuro } from "@/lib/format";
import { Faq } from "@/components/Faq";
import { Semaforo } from "@/components/Semaforo";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { VerdictStack } from "@/components/VerdictStack";

export const metadata: Metadata = {
  title: "Vistochiaro — auto usata: la compri o scappi? Il verdetto in pochi minuti",
  description: compraOScappa.seo.description,
};

const CAMPANELLI = [
  ["Prezzo troppo basso", "Il trucco più vecchio per attirare chi cerca l'affare."],
  ["Acconto prima di vederla", "Nessun venditore serio chiede soldi prima della visita."],
  ["Venditore all'estero", "L'auto “è in Germania” e te la spediscono. Di solito non arriva."],
  ["Km che non tornano", "Pochi km per l'età, o non coerenti con l'uso dichiarato."],
  ["Foto che non tornano", "Auto diverse tra una foto e l'altra, dettagli incoerenti."],
  ["Targa o telaio assenti", "Senza, non puoi controllare lo storico dell'auto."],
];

const PASSI = [
  ["Carica l'annuncio", "Fai gli screenshot dell'annuncio o incolla il testo. Bastano 30 secondi."],
  ["Noi lo analizziamo", "Leggiamo foto e descrizione, confrontiamo il prezzo con annunci simili e cerchiamo i difetti noti."],
  ["Ricevi il verdetto", "In 2–3 minuti hai il report sul telefono, con un link privato che puoi riaprire quando vuoi."],
];

export default function Home() {
  const prezzo = prezzoEuro(compraOScappa.prezzoCentesimi);
  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 flex-col">
        {/* Hero */}
        <section className="px-4">
          <div className="mx-auto grid max-w-5xl items-center gap-12 pb-16 pt-6 md:grid-cols-[1.35fr_1fr] md:pt-12">
            <div className="flex flex-col gap-6">
              <h1 className="text-[clamp(40px,8.5vw,64px)] font-extrabold leading-[0.98]">
                Quell&apos;auto usata: la compri o{" "}
                <span className="relative whitespace-nowrap text-stop-ink">scappi?</span>
              </h1>
              <p className="max-w-[46ch] text-[19px] text-muted">
                Carica l&apos;annuncio. In pochi minuti ricevi un verdetto chiaro, con il prezzo giusto, i difetti noti del
                modello e le domande da fare al venditore.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/compra-o-scappa"
                  className="rounded-2xl bg-ink px-6 py-4 text-center font-display text-[19px] font-bold text-paper shadow-[0_14px_30px_-14px_rgba(0,0,0,0.55)] transition hover:-translate-y-0.5 hover:opacity-95"
                >
                  Controlla l&apos;annuncio
                </Link>
                <Link href="/esempio" className="px-2 py-3 text-center font-bold underline underline-offset-4 hover:text-muted">
                  Guarda un report di esempio
                </Link>
              </div>
              <ul className="flex flex-wrap gap-x-5 gap-y-2 text-[15px] text-muted">
                <li>
                  <b className="text-ink">{prezzo}</b> · pagamento unico
                </li>
                <li>Pronto in 2–3 minuti</li>
                <li>Ogni dato con la sua fonte</li>
              </ul>
            </div>
            <VerdictStack />
          </div>
        </section>

        {/* Campanelli d'allarme: il motivo per cui la gente controlla */}
        <section className="bg-card px-4">
          <div className="mx-auto flex max-w-5xl flex-col gap-8 py-16">
            <div className="flex max-w-[40ch] flex-col gap-3">
              <h2 className="text-[clamp(30px,6vw,42px)] font-extrabold">I segnali che l&apos;annuncio non ti dice</h2>
              <p className="text-muted">Il report li cerca uno per uno e ti dice quanto sono gravi.</p>
            </div>
            <ul className="grid gap-x-10 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
              {CAMPANELLI.map(([t, d]) => (
                <li key={t} className="grid grid-cols-[14px_1fr] gap-3">
                  <span className="mt-2 size-3 rounded-full bg-stop" aria-hidden />
                  <span>
                    <b className="block text-[18px]">{t}</b>
                    <span className="text-muted">{d}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Come funziona */}
        <section className="px-4">
          <div className="mx-auto flex max-w-5xl flex-col gap-8 py-16">
            <h2 className="text-[clamp(30px,6vw,42px)] font-extrabold">Come funziona</h2>
            <ol className="grid gap-8 md:grid-cols-3">
              {PASSI.map(([t, d], i) => (
                <li key={t} className="flex flex-col gap-2">
                  <span className="grid size-10 place-items-center rounded-full border-2 border-ink font-display text-[18px] font-extrabold">
                    {i + 1}
                  </span>
                  <b className="font-display text-[22px]">{t}</b>
                  <p className="text-muted">{d}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Cosa ricevi + prezzo */}
        <section className="px-4">
          <div className="mx-auto grid max-w-5xl gap-10 rounded-[28px] bg-ink px-6 py-10 text-paper md:grid-cols-[1.3fr_1fr] md:px-10 md:py-14">
            <div className="flex flex-col gap-5">
              <h2 className="text-[clamp(28px,5vw,40px)] font-extrabold">Tutto quello che ti serve prima di chiamare il venditore</h2>
              <ul className="flex flex-col gap-2.5">
                {compraOScappa.landing.cosaRicevi.map((c) => (
                  <li key={c} className="grid grid-cols-[22px_1fr] gap-2">
                    <span className="mt-2 size-2.5 rounded-full bg-go" aria-hidden />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col justify-center gap-4 rounded-3xl bg-paper p-6 text-ink">
              <Semaforo acceso="go" size={16} />
              <p className="font-display text-[56px] font-extrabold leading-none tabular">{prezzo}</p>
              <p className="text-muted">Un solo pagamento, nessun abbonamento. Meno di un pieno di benzina, per non sbagliare un acquisto da migliaia di euro.</p>
              <Link
                href="/compra-o-scappa"
                className="rounded-2xl bg-ink px-6 py-4 text-center font-display text-[19px] font-bold text-paper hover:opacity-90"
              >
                Controlla l&apos;annuncio
              </Link>
            </div>
          </div>
        </section>

        {/* Domande frequenti */}
        <section className="px-4">
          <div className="mx-auto flex max-w-3xl flex-col gap-6 py-16">
            <h2 className="text-[clamp(30px,6vw,42px)] font-extrabold">Domande frequenti</h2>
            <Faq items={compraOScappa.faq} />
          </div>
        </section>

        {/* Prossimo strumento */}
        <section className="px-4 pb-16">
          <div className="mx-auto flex max-w-5xl flex-col gap-2 rounded-3xl border border-line p-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-display text-[22px] font-bold">
                Hai preso una multa? <span className="text-acc-multa">Multa Check</span>
              </p>
              <p className="text-muted">Calcola gratis le scadenze esatte e capisci il verbale in parole semplici.</p>
            </div>
            <span className="self-start rounded-full bg-soft px-3 py-1 text-[14px] font-bold text-muted md:self-center">In arrivo</span>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
