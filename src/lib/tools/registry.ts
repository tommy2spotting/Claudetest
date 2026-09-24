import type { AnyTool } from "./types";
import { compraOScappa } from "./compra-o-scappa";

/** Tutti gli strumenti attivi. Per aggiungerne uno: importalo e mettilo qui. */
export const tools: AnyTool[] = [compraOScappa];

export function getTool(slug: string): AnyTool | undefined {
  return tools.find((t) => t.slug === slug);
}
