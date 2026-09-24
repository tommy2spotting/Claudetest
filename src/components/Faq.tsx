import type { Faq as FaqItem } from "@/lib/tools/types";

export function Faq({ items }: { items: FaqItem[] }) {
  return (
    <div className="flex flex-col border-t border-line">
      {items.map((f) => (
        <details key={f.domanda} className="group border-b border-line">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-bold [&::-webkit-details-marker]:hidden">
            {f.domanda}
            <span aria-hidden className="text-xl text-muted transition group-open:rotate-45">
              +
            </span>
          </summary>
          <p className="max-w-[62ch] pb-5 text-muted">{f.risposta}</p>
        </details>
      ))}
    </div>
  );
}
