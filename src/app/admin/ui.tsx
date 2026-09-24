import Link from "next/link";
import type { ReactNode } from "react";
import type { StatoReport } from "@/lib/store";
import { Semaforo } from "@/components/Semaforo";
import { logout } from "./actions";

export const STATO: Record<StatoReport, { label: string; cls: string }> = {
  in_lavorazione: { label: "In lavorazione", cls: "bg-soft text-muted" },
  pronto: { label: "Pronto", cls: "bg-go-soft text-go-ink" },
  in_revisione: { label: "Da rivedere", cls: "bg-wait-soft text-wait-ink" },
  errore: { label: "Errore", cls: "bg-stop-soft text-stop-ink" },
  rimborsato: { label: "Rimborsato", cls: "bg-soft text-muted line-through" },
};

export function StatoPill({ stato }: { stato: StatoReport }) {
  const s = STATO[stato];
  return <span className={`whitespace-nowrap rounded-full px-2.5 py-0.5 text-[13px] font-bold ${s.cls}`}>{s.label}</span>;
}

export const dollari = (usd: number) =>
  `${usd.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 3 })} $`;

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-col px-4">
      <header className="mx-auto flex w-full max-w-4xl items-center justify-between gap-3 py-4">
        <Link href="/admin" className="inline-flex items-center gap-2 font-display text-[19px] font-bold">
          <Semaforo acceso="wait" size={9} /> Pannello
        </Link>
        <nav className="flex items-center gap-4 text-[15px]">
          <Link href="/admin/prova" className="rounded-xl bg-ink px-3.5 py-2 font-bold text-paper">
            Prova manuale
          </Link>
          <form action={logout}>
            <button className="text-muted hover:text-ink">Esci</button>
          </form>
        </nav>
      </header>
      <main className="mx-auto w-full max-w-4xl pb-16">{children}</main>
    </div>
  );
}
