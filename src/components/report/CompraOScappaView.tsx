import type { ReactNode } from "react";
import type { CompraOScappaReport } from "@/lib/tools/compra-o-scappa/schema";
import { Semaforo, type Luce } from "@/components/Semaforo";
import { CopyButton } from "@/components/CopyButton";

const VERDETTO: Record<CompraOScappaReport["verdetto"], { luce: Luce; parola: string; frase: string; ink: string }> = {
  compra: { luce: "go", parola: "Compra", frase: "Sembra un buon affare. Vai a vederla con le domande giuste.", ink: "text-go-ink" },
  tratta: { luce: "wait", parola: "Tratta", frase: "Può andare, ma non a questo prezzo o non senza chiarimenti.", ink: "text-wait-ink" },
  scappa: { luce: "stop", parola: "Scappa", frase: "Troppi segnali che non tornano. Meglio cercare altro.", ink: "text-stop-ink" },
};

const PREZZO: Record<CompraOScappaReport["prezzo"]["giudizio"], string> = {
  sotto_mercato: "Sotto il mercato",
  in_linea: "In linea con il mercato",
  sopra_mercato: "Sopra il mercato",
  dati_insufficienti: "Dati insufficienti",
};

const GRAVITA = {
  alta: { bar: "bg-stop", pill: "bg-stop-soft text-stop-ink", label: "Grave" },
  media: { bar: "bg-wait", pill: "bg-wait-soft text-wait-ink", label: "Attenzione" },
  bassa: { bar: "bg-off", pill: "bg-soft text-muted", label: "Da sapere" },
} as const;

const AFFIDABILITA = {
  alta: "bg-go-soft text-go-ink",
  media: "bg-wait-soft text-wait-ink",
  bassa: "bg-stop-soft text-stop-ink",
} as const;

const CARVERTICAL_URL = process.env.NEXT_PUBLIC_CARVERTICAL_URL ?? "https://www.carvertical.com/it";

function dominio(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function Fonti({ urls }: { urls: string[] }) {
  if (urls.length === 0) return <p className="text-[14px] text-muted">Fonte: non verificabile.</p>;
  return (
    <p className="flex flex-wrap gap-x-3 gap-y-1 text-[14px] text-muted">
      <span>Fonti:</span>
      {urls.map((u) => (
        <a key={u} href={u} target="_blank" rel="noopener noreferrer nofollow" className="underline underline-offset-2 hover:text-ink">
          {dominio(u)}
        </a>
      ))}
    </p>
  );
}

function Sezione({ titolo, sotto, aperta = false, children }: { titolo: string; sotto?: string; aperta?: boolean; children: ReactNode }) {
  return (
    <details open={aperta} className="group border-b border-line">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 [&::-webkit-details-marker]:hidden">
        <span>
          <span className="block font-display text-[21px] font-bold">{titolo}</span>
          {sotto && <span className="block text-[15px] text-muted">{sotto}</span>}
        </span>
        <span aria-hidden className="grid size-8 shrink-0 place-items-center rounded-full border border-line text-lg transition group-open:rotate-45">
          +
        </span>
      </summary>
      <div className="flex flex-col gap-4 pb-6">{children}</div>
    </details>
  );
}

export function CompraOScappaView({ r, demo = false }: { r: CompraOScappaReport; demo?: boolean }) {
  const v = VERDETTO[r.verdetto];
  const id = r.identikit;
  return (
    <article className="flex flex-col">
      {/* Verdetto: la prima cosa che si vede, anche davanti all'auto. */}
      <section className="flex flex-col gap-5 rounded-3xl border border-line bg-card p-6 shadow-[0_18px_40px_-28px_rgba(0,0,0,0.45)] sm:p-8">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[14px] font-bold text-acc-cos">Compra o Scappa{demo ? " · esempio" : ""}</span>
          <span className={`rounded-full px-3 py-0.5 text-[14px] font-bold ${AFFIDABILITA[r.affidabilita.livello]}`}>
            Affidabilità {r.affidabilita.livello}
          </span>
        </div>
        <Semaforo acceso={v.luce} size={30} intro label={`Verdetto: ${v.parola}`} />
        <div className="flex flex-col gap-2">
          <h1 className={`font-display text-[clamp(52px,14vw,76px)] font-extrabold leading-[0.95] ${v.ink}`}>{v.parola}</h1>
          <p className="text-[19px]">{v.frase}</p>
        </div>
        <p className="text-[15px] text-muted tabular">
          {[id.modello, id.anno, id.km !== "non indicato" ? `${id.km} km` : null, id.prezzo, id.venditore]
            .filter(Boolean)
            .join(" · ")}
        </p>
        <ol className="flex flex-col gap-3">
          {r.motivi.map((m, i) => (
            <li key={i} className="grid grid-cols-[28px_1fr] items-start gap-3 text-[17px]">
              <span className="grid size-7 place-items-center rounded-full bg-soft font-display text-[14px] font-bold">{i + 1}</span>
              <span className="pt-0.5">{m}</span>
            </li>
          ))}
        </ol>
        <p className="text-[15px] text-muted">
          <b className="text-ink">Perché affidabilità {r.affidabilita.livello}:</b> {r.affidabilita.motivo}
        </p>
        {r.trattativa && (
          <div className="flex flex-col gap-3 rounded-2xl bg-wait-soft p-4">
            <p className="text-[15px]">
              Prezzo obiettivo: <b className="font-display text-[22px] tabular">{r.trattativa.prezzoObiettivo}</b>
            </p>
            <CopyButton
              testo={r.trattativa.messaggio}
              label="Copia il messaggio per trattare"
              className="rounded-xl bg-ink px-4 py-3.5 text-[16px] font-bold text-paper transition hover:opacity-90"
            />
          </div>
        )}
      </section>

      <div className="mt-4 flex flex-col">
        <Sezione titolo="Campanelli d'allarme" sotto={`${r.campanelli.length} segnalazioni nell'annuncio`} aperta>
          {r.campanelli.length === 0 && <p>Non abbiamo trovato segnali sospetti nell&apos;annuncio.</p>}
          <ul className="flex flex-col gap-3">
            {r.campanelli.map((c, i) => (
              <li key={i} className="grid grid-cols-[4px_1fr] gap-3 rounded-xl bg-card p-4">
                <span className={`rounded-full ${GRAVITA[c.gravita].bar}`} />
                <span className="flex flex-col gap-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <b>{c.titolo}</b>
                    <span className={`rounded-full px-2 py-px text-[13px] font-bold ${GRAVITA[c.gravita].pill}`}>{GRAVITA[c.gravita].label}</span>
                  </span>
                  <span className="text-[16px] text-muted">{c.dettaglio}</span>
                </span>
              </li>
            ))}
          </ul>
        </Sezione>

        <Sezione titolo="Domande da fare al venditore" sotto="Copiale e usale al telefono" aperta>
          <ol className="flex list-decimal flex-col gap-2 pl-6 marker:font-bold marker:text-muted">
            {r.domande.map((d, i) => (
              <li key={i}>{d}</li>
            ))}
          </ol>
          <CopyButton
            testo={r.domande.map((d, i) => `${i + 1}. ${d}`).join("\n")}
            label="Copia le domande"
            className="self-start rounded-xl border border-line px-4 py-2.5 text-[15px] font-bold hover:bg-soft"
          />
        </Sezione>

        <Sezione titolo="Il prezzo" sotto={PREZZO[r.prezzo.giudizio]}>
          <p>{r.prezzo.spiegazione}</p>
          {r.prezzo.confronti.length > 0 && (
            <ul className="flex flex-col divide-y divide-line rounded-xl border border-line bg-card">
              {r.prezzo.confronti.map((c, i) => (
                <li key={i} className="flex items-baseline justify-between gap-4 px-4 py-3">
                  <span className="flex flex-col">
                    <span className="text-[16px]">{c.descrizione}</span>
                    {c.url && (
                      <a href={c.url} target="_blank" rel="noopener noreferrer nofollow" className="text-[14px] text-muted underline underline-offset-2">
                        {dominio(c.url)}
                      </a>
                    )}
                  </span>
                  <b className="whitespace-nowrap tabular">{c.prezzo}</b>
                </li>
              ))}
            </ul>
          )}
        </Sezione>

        <Sezione titolo="Punti deboli noti" sotto={`Di questo modello, motore e anno`}>
          {r.puntiDeboli.map((p, i) => (
            <div key={i} className="flex flex-col gap-1">
              <h3 className="text-[18px] font-bold">{p.titolo}</h3>
              <p>{p.dettaglio}</p>
              <Fonti urls={p.fonti} />
            </div>
          ))}
        </Sezione>

        <Sezione titolo="Alla prova su strada" sotto="Cosa controllare per questo modello">
          <ul className="flex flex-col gap-2">
            {r.provaSuStrada.map((p, i) => (
              <li key={i} className="grid grid-cols-[22px_1fr] gap-2">
                <span aria-hidden className="mt-1.5 size-4 rounded border-2 border-line" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </Sezione>

        <Sezione titolo="Identikit dall'annuncio" sotto="Come risulta da foto e testo">
          <dl className="grid grid-cols-[max-content_1fr] gap-x-6 gap-y-2">
            {(
              [
                ["Modello", id.modello],
                ["Motore", id.motore],
                ["Anno", id.anno],
                ["Km", id.km],
                ["Prezzo", id.prezzo],
                ["Venditore", id.venditore],
              ] as const
            ).map(([k, val]) => (
              <div key={k} className="contents">
                <dt className="text-muted">{k}</dt>
                <dd className="tabular">{val}</dd>
              </div>
            ))}
          </dl>
        </Sezione>

        <Sezione titolo="Prossimi passi" aperta>
          <ol className="flex flex-col gap-4">
            <li>
              <b>Controlla lo storico del telaio.</b> Scopri km registrati, incidenti e passaggi di proprietà.{" "}
              <a href={CARVERTICAL_URL} target="_blank" rel="noopener sponsored" className="font-bold underline underline-offset-2">
                Verifica con carVertical
              </a>{" "}
              <span className="text-[14px] text-muted">(link affiliato: se acquisti, riceviamo una commissione)</span>
            </li>
            <li>
              <b>Falla vedere a un meccanico di fiducia</b> prima di lasciare qualsiasi acconto.
            </li>
          </ol>
        </Sezione>
      </div>

      <p className="mt-6 rounded-xl bg-soft p-4 text-[14px] text-muted">
        Questo report è generato con l&apos;intelligenza artificiale a partire dall&apos;annuncio e da ricerche sul web. Non
        sostituisce vedere l&apos;auto dal vivo né l&apos;ispezione di un meccanico.
      </p>
    </article>
  );
}
