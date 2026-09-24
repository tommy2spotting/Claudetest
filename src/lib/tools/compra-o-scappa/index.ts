import type { ToolDefinition } from "../types";
import { inputSchema, outputSchema } from "./schema";
import { buildResearchPrompt, researchSystem, structureSystem } from "./prompt";
import { qualityCheck } from "./quality";

export const compraOScappa: ToolDefinition<typeof inputSchema, typeof outputSchema> = {
  slug: "compra-o-scappa",
  nome: "Compra o Scappa",
  promessa: "Carica l'annuncio dell'auto usata e ricevi il verdetto: compra, tratta o scappa.",
  seo: {
    title: "Controllo annuncio auto usata: compra, tratta o scappa? | Vistochiaro",
    description:
      "Carica gli screenshot dell'annuncio e scopri in pochi minuti se l'auto usata conviene: prezzo rispetto al mercato, difetti noti, truffe e domande da fare al venditore.",
  },
  landing: {
    h1: "Controlla l'annuncio prima di comprare",
    sottotitolo:
      "Carica gli screenshot dell'annuncio. In pochi minuti sai se l'auto conviene, quanto offrire e cosa chiedere al venditore.",
    cosaRicevi: [
      "Il verdetto: compra, tratta o scappa, con i 3 motivi",
      "Il prezzo confrontato con annunci simili in Italia",
      "I difetti noti di quel modello, motore e anno",
      "I segnali di truffa trovati nell'annuncio",
      "Da 8 a 10 domande da fare al venditore",
      "Cosa controllare alla prova su strada",
      "Se conviene trattare: prezzo obiettivo e messaggio pronto",
    ],
  },
  accento: "var(--acc-cos)",
  prezzoCentesimi: 1999,
  maxImmagini: 8,
  inputSchema,
  outputSchema,
  ai: {
    model: "claude-sonnet-5",
    webSearch: { maxUses: 8 },
    researchSystem,
    buildResearchPrompt,
    structureSystem,
  },
  qualityCheck,
  faq: [
    {
      domanda: "Cosa devo caricare?",
      risposta:
        "Fino a 8 screenshot dell'annuncio (foto dell'auto, descrizione, prezzo, dati tecnici) oppure il testo copiato. Più informazioni ci sono, più il verdetto è preciso.",
    },
    {
      domanda: "Da dove prendete i prezzi e i difetti?",
      risposta:
        "Da ricerche web fatte al momento: annunci simili in Italia, riviste di settore e forum di proprietari. Ogni dato ha il suo link. Se un dato non si trova, lo scriviamo.",
    },
    {
      domanda: "Il report sostituisce un meccanico?",
      risposta:
        "No. Ti dice se vale la pena andare a vedere l'auto e cosa chiedere. Prima di pagare, vedi l'auto dal vivo e falla controllare da un meccanico di fiducia.",
    },
    {
      domanda: "Chi vede il mio report?",
      risposta:
        "Solo chi ha il link privato che ti mandiamo. Non chiediamo nome né telefono del venditore e non li riportiamo nel report.",
    },
    {
      domanda: "Il report è scritto da una persona?",
      risposta:
        "No, è generato con l'intelligenza artificiale e passa un controllo automatico di qualità. Se qualcosa non torna, lo rivediamo prima di mandartelo.",
    },
  ],
};
