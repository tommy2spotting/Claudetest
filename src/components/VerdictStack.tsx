import { Semaforo, type Luce } from "./Semaforo";

const CARTE: { luce: Luce; parola: string; auto: string; motivo: string; ink: string; tilt: string }[] = [
  {
    luce: "go",
    parola: "Compra",
    auto: "Toyota Yaris Hybrid · 2019 · 54.000 km",
    motivo: "Prezzo in linea, tagliandi documentati.",
    ink: "text-go-ink",
    tilt: "-rotate-3 translate-x-3",
  },
  {
    luce: "stop",
    parola: "Scappa",
    auto: "Golf 2.0 TDI · 2016 · 39.000 km",
    motivo: "Acconto chiesto prima di vederla, venditore all'estero.",
    ink: "text-stop-ink",
    tilt: "rotate-2 -translate-x-2",
  },
  {
    luce: "wait",
    parola: "Tratta",
    auto: "Fiat Panda 1.2 · 2017 · 68.000 km",
    motivo: "Circa 700 € sopra annunci simili.",
    ink: "text-wait-ink",
    tilt: "",
  },
];

/** Tre verdetti di esempio impilati: fanno capire il prodotto in un colpo d'occhio. */
export function VerdictStack() {
  return (
    <div className="relative mx-auto grid w-full max-w-[360px] [grid-template-areas:'stack']" aria-label="Esempi di verdetto">
      {CARTE.map((c, i) => (
        <div
          key={c.parola}
          className={`flex flex-col gap-3 rounded-3xl border border-line bg-card p-5 shadow-[0_20px_40px_-26px_rgba(0,0,0,0.5)] [grid-area:stack] ${c.tilt}`}
          style={{ marginTop: i * 58, zIndex: i }}
        >
          <div className="flex items-center justify-between">
            <Semaforo acceso={c.luce} size={16} intro={i === CARTE.length - 1} />
            <span className="text-[13px] text-muted">esempio</span>
          </div>
          <p className={`font-display text-[40px] font-extrabold leading-none ${c.ink}`}>{c.parola}</p>
          <p className="text-[14px] text-muted">{c.auto}</p>
          <p className="text-[16px]">{c.motivo}</p>
        </div>
      ))}
    </div>
  );
}
