import type { z } from "zod";

/**
 * Un "strumento" è un modulo autonomo: aggiungerne uno vuol dire creare una
 * cartella in src/lib/tools/<slug>, registrarlo in registry.ts e scrivere i test.
 * Pagamenti, ordini, email, costi e pannello sono condivisi.
 */

export type Faq = { domanda: string; risposta: string };

export type ToolSeo = {
  /** <title> della pagina, unico. */
  title: string;
  /** meta description, unica. */
  description: string;
};

/** Contenuto che l'utente carica, dopo la validazione del form. */
export type ToolSubmission<Input> = {
  input: Input;
  /** Immagini già compresse lato browser (JPEG/PNG/WebP). */
  images: { mediaType: ImageMediaType; data: Buffer }[];
};

export type ImageMediaType = "image/jpeg" | "image/png" | "image/webp";

/** Esito del controllo qualità: se ok=false il report va in coda di revisione. */
export type QualityResult = { ok: true } | { ok: false; motivi: string[] };

export type ToolDefinition<
  InputSchema extends z.ZodType = z.ZodType,
  OutputSchema extends z.ZodType = z.ZodType,
> = {
  slug: string;
  /** Nome mostrato all'utente. */
  nome: string;
  /** Frase breve che dice cosa fa. */
  promessa: string;
  seo: ToolSeo;
  /** Testi della pagina dello strumento. */
  landing: {
    h1: string;
    sottotitolo: string;
    cosaRicevi: string[];
  };
  /** Colore d'accento dello strumento (variabile CSS definita in globals.css). */
  accento: string;
  /** Prezzo in centesimi di euro. 0 = gratis. */
  prezzoCentesimi: number;
  /** Numero massimo di immagini accettate. 0 = nessun upload. */
  maxImmagini: number;

  inputSchema: InputSchema;
  outputSchema: OutputSchema;

  ai: {
    model: string;
    /** Ricerca web lato server sì/no, e quante ricerche al massimo. */
    webSearch: false | { maxUses: number };
    /** Prompt del passaggio di ricerca (con web search e immagini). */
    researchSystem: string;
    buildResearchPrompt: (input: z.infer<InputSchema>, imageCount: number) => string;
    /** Prompt del passaggio che trasforma la ricerca in JSON. */
    structureSystem: string;
  };

  /** Regole di qualità specifiche dello strumento, oltre a quelle comuni. */
  qualityCheck: (output: z.infer<OutputSchema>, fontiTrovate: Set<string>) => QualityResult;

  faq: Faq[];
};

// Alias comodo quando lo strumento concreto non importa.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyTool = ToolDefinition<any, any>;
