import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import type { AnyTool, ToolSubmission } from "@/lib/tools/types";
import { costoUsd, sommaUsage, usageVuoto, type Usage } from "./pricing";
import { reportDemo } from "./demo";

export type RunResult = {
  stato: "pronto" | "in_revisione";
  report: unknown | null;
  motiviRevisione: string[];
  fonti: string[];
  dossier: string;
  usage: Usage;
  costoUsd: number;
  model: string;
  demo: boolean;
};

const MAX_RIPRESE = 4;

export function aiConfigurata(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

function usageDa(msg: Anthropic.Message): Usage {
  return {
    inputTokens: msg.usage.input_tokens,
    outputTokens: msg.usage.output_tokens,
    cacheWriteTokens: msg.usage.cache_creation_input_tokens ?? 0,
    cacheReadTokens: msg.usage.cache_read_input_tokens ?? 0,
    webSearches: msg.usage.server_tool_use?.web_search_requests ?? 0,
  };
}

const URL_RE = /https?:\/\/[^\s"'<>)\]]+/g;

/** Raccoglie gli URL che arrivano davvero dalle ricerche (risultati e citazioni). */
function raccogliFonti(content: Anthropic.ContentBlock[], fonti: Set<string>) {
  for (const block of content) {
    if (block.type === "web_search_tool_result" && Array.isArray(block.content)) {
      for (const r of block.content) fonti.add(r.url);
    } else if (block.type === "text") {
      for (const c of block.citations ?? []) {
        if (c.type === "web_search_result_location") fonti.add(c.url);
      }
    } else if (block.type === "bash_code_execution_tool_result") {
      // Con il filtro dinamico i risultati passano dal codice: gli URL stanno nello stdout.
      const out = block.content;
      if (out.type === "bash_code_execution_result") {
        for (const u of out.stdout.match(URL_RE) ?? []) fonti.add(u);
      }
    }
  }
}

function testoDi(content: Anthropic.ContentBlock[]): string {
  return content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");
}

export async function runTool(tool: AnyTool, sub: ToolSubmission<unknown>): Promise<RunResult> {
  if (!aiConfigurata()) return risultatoDemo(tool);

  const client = new Anthropic();
  const { model } = tool.ai;
  let usage = usageVuoto();
  const fonti = new Set<string>();

  // 1) Ricerca: immagini + testo, con ricerca web lato server.
  const userContent: Anthropic.ContentBlockParam[] = [
    ...sub.images.map(
      (img): Anthropic.ImageBlockParam => ({
        type: "image",
        source: { type: "base64", media_type: img.mediaType, data: img.data.toString("base64") },
      }),
    ),
    { type: "text", text: tool.ai.buildResearchPrompt(sub.input, sub.images.length) },
  ];
  const messages: Anthropic.MessageParam[] = [{ role: "user", content: userContent }];
  const tools: Anthropic.ToolUnion[] = tool.ai.webSearch
    ? [
        {
          type: "web_search_20260318",
          name: "web_search",
          max_uses: tool.ai.webSearch.maxUses,
          user_location: { type: "approximate", country: "IT", timezone: "Europe/Rome" },
        },
      ]
    : [];

  let dossier = "";
  let ultimo: Anthropic.Message | undefined;
  for (let i = 0; i <= MAX_RIPRESE; i++) {
    ultimo = await client.messages
      .stream({
        model,
        max_tokens: 32000,
        system: tool.ai.researchSystem,
        output_config: { effort: "high" },
        tools,
        messages,
      })
      .finalMessage();
    usage = sommaUsage(usage, usageDa(ultimo));
    raccogliFonti(ultimo.content, fonti);
    dossier += testoDi(ultimo.content);
    if (ultimo.stop_reason !== "pause_turn") break;
    messages.push({ role: "assistant", content: ultimo.content });
  }

  const motiviRevisione: string[] = [];
  if (!ultimo || ultimo.stop_reason === "refusal") motiviRevisione.push("L'AI ha rifiutato la richiesta.");
  if (ultimo?.stop_reason === "max_tokens") motiviRevisione.push("Ricerca interrotta: testo troppo lungo.");
  if (ultimo?.stop_reason === "pause_turn") motiviRevisione.push("Ricerca non conclusa dopo varie riprese.");

  // 2) Struttura: dal dossier al JSON validato con zod.
  const elencoFonti = [...fonti].map((u) => `- ${u}`).join("\n") || "(nessuna)";
  let report: unknown | null = null;
  try {
    const parsed = await client.messages.parse({
      model,
      max_tokens: 16000,
      system: tool.ai.structureSystem,
      output_config: { effort: "medium", format: zodOutputFormat(tool.outputSchema) },
      messages: [
        {
          role: "user",
          content: `Dossier:\n"""\n${dossier}\n"""\n\nFonti verificate:\n${elencoFonti}`,
        },
      ],
    });
    usage = sommaUsage(usage, usageDa(parsed));
    report = parsed.parsed_output ?? null;
    if (parsed.stop_reason === "refusal") motiviRevisione.push("L'AI ha rifiutato di impaginare il report.");
  } catch (err) {
    if (err instanceof Anthropic.APIError) throw err; // errori di rete o di account: li gestisce chi chiama
    motiviRevisione.push("Il JSON del report non è valido.");
  }

  if (report === null) {
    if (!motiviRevisione.includes("Il JSON del report non è valido.")) motiviRevisione.push("Il JSON del report non è valido.");
  } else {
    const q = tool.qualityCheck(report, fonti);
    if (!q.ok) motiviRevisione.push(...q.motivi);
  }

  return {
    stato: motiviRevisione.length === 0 ? "pronto" : "in_revisione",
    report,
    motiviRevisione,
    fonti: [...fonti],
    dossier,
    usage,
    costoUsd: costoUsd(model, usage),
    model,
    demo: false,
  };
}

function risultatoDemo(tool: AnyTool): RunResult {
  return {
    stato: "pronto",
    report: reportDemo,
    motiviRevisione: [],
    fonti: [],
    dossier: "Modalità dimostrativa: nessuna chiave ANTHROPIC_API_KEY configurata, report di esempio.",
    usage: usageVuoto(),
    costoUsd: 0,
    model: tool.ai.model,
    demo: true,
  };
}
