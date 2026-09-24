import type { ComponentType } from "react";
import { CompraOScappaView } from "./CompraOScappaView";

/** Template del risultato per ogni strumento (slug → componente). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const VIEWS: Record<string, ComponentType<{ r: any; demo?: boolean }>> = {
  "compra-o-scappa": CompraOScappaView,
};

export function ReportView({ toolSlug, report, demo }: { toolSlug: string; report: unknown; demo?: boolean }) {
  const View = VIEWS[toolSlug];
  if (!View) return <p>Nessun template per lo strumento “{toolSlug}”.</p>;
  return <View r={report} demo={demo} />;
}
