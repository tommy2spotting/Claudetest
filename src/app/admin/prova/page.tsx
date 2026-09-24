import type { Metadata } from "next";
import { richiediAdmin } from "@/lib/admin-auth";
import { tools } from "@/lib/tools/registry";
import { ToolForm } from "@/components/ToolForm";
import { AdminShell } from "../ui";

export const metadata: Metadata = { title: "Prova manuale" };

export default async function ProvaPage() {
  await richiediAdmin();
  return (
    <AdminShell>
      <div className="flex flex-col gap-10">
        {tools.map((t) => (
          <section key={t.slug} className="flex flex-col gap-4">
            <h1 className="text-[30px] font-extrabold">Prova: {t.nome}</h1>
            <p className="text-muted">Carica un annuncio vero: il report viene generato come per un cliente, ma non si paga.</p>
            <ToolForm slug={t.slug} maxImmagini={t.maxImmagini} endpoint="/api/admin/reports" submitLabel="Genera il report" />
          </section>
        ))}
      </div>
    </AdminShell>
  );
}
