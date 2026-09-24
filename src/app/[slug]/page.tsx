import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTool, tools } from "@/lib/tools/registry";
import { prezzoEuro } from "@/lib/format";
import { Faq } from "@/components/Faq";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { ToolForm } from "@/components/ToolForm";

export const dynamicParams = false;

export function generateStaticParams() {
  return tools.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[slug]">): Promise<Metadata> {
  const tool = getTool((await params).slug);
  if (!tool) return {};
  return { title: tool.seo.title, description: tool.seo.description, alternates: { canonical: `/${tool.slug}` } };
}

// Fase 1: gli ordini pubblici non sono ancora aperti (pagamenti in Fase 3).
const ORDINI_APERTI = process.env.NEXT_PUBLIC_ORDINI_APERTI === "true";

export default async function ToolPage({ params }: PageProps<"/[slug]">) {
  const tool = getTool((await params).slug);
  if (!tool) notFound();
  const prezzo = prezzoEuro(tool.prezzoCentesimi);

  return (
    <>
      <SiteHeader />
      <main className="flex-1 px-4">
        <div className="mx-auto grid max-w-5xl gap-12 pb-16 pt-4 md:grid-cols-[1fr_1.1fr] md:pt-10">
          <div className="flex flex-col gap-5 md:sticky md:top-8 md:self-start">
            <span className="text-[15px] font-bold" style={{ color: tool.accento }}>
              {tool.nome}
            </span>
            <h1 className="text-[clamp(36px,8vw,56px)] font-extrabold leading-[1]">{tool.landing.h1}</h1>
            <p className="text-[19px] text-muted">{tool.landing.sottotitolo}</p>
            <ul className="hidden flex-col gap-2 md:flex">
              {tool.landing.cosaRicevi.map((c) => (
                <li key={c} className="grid grid-cols-[18px_1fr] gap-2">
                  <span className="mt-2.5 size-2 rounded-full bg-go" aria-hidden />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
            <Link href="/esempio" className="self-start font-bold underline underline-offset-4">
              Guarda un report di esempio
            </Link>
          </div>

          <div className="flex flex-col gap-4 rounded-[28px] border border-line bg-card p-5 sm:p-7">
            <ToolForm
              slug={tool.slug}
              maxImmagini={tool.maxImmagini}
              endpoint="/api/reports"
              submitLabel={`Controlla l'annuncio · ${prezzo}`}
              chiuso={
                ORDINI_APERTI
                  ? undefined
                  : "Ci siamo quasi: stiamo facendo gli ultimi controlli e il servizio apre a breve. Nessun pagamento è stato richiesto."
              }
            />
            <p className="text-center text-[14px] text-muted">
              Pagamento unico · link privato al report · generato con l&apos;AI e controllato in automatico
            </p>
          </div>
        </div>

        <section className="mx-auto flex max-w-3xl flex-col gap-6 pb-16 md:hidden">
          <h2 className="text-[30px] font-extrabold">Cosa ricevi</h2>
          <ul className="flex flex-col gap-2">
            {tool.landing.cosaRicevi.map((c) => (
              <li key={c} className="grid grid-cols-[18px_1fr] gap-2">
                <span className="mt-2.5 size-2 rounded-full bg-go" aria-hidden />
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mx-auto flex max-w-3xl flex-col gap-6 pb-16">
          <h2 className="text-[30px] font-extrabold">Domande frequenti</h2>
          <Faq items={tool.faq} />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
