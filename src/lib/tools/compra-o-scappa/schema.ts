import { z } from "zod";

const numeroFacoltativo = z
  .union([z.literal(""), z.coerce.number().int().min(0).max(10_000_000)])
  .optional()
  .transform((v) => (v === "" || v === undefined ? undefined : v));

export const USI = ["citta", "misto", "extraurbano", "autostrada"] as const;

export const inputSchema = z.object({
  testo: z.string().trim().max(20_000, "Il testo è troppo lungo (max 20.000 caratteri).").default(""),
  link: z
    .union([z.literal(""), z.url("Il link non sembra valido.")])
    .optional()
    .transform((v) => v || undefined),
  budget: numeroFacoltativo,
  kmAnno: numeroFacoltativo,
  uso: z
    .union([z.literal(""), z.enum(USI)])
    .optional()
    .transform((v) => v || undefined),
  provincia: z
    .string()
    .trim()
    .max(40)
    .optional()
    .transform((v) => v || undefined),
});

export type CompraOScappaInput = z.infer<typeof inputSchema>;

const fonti = z.array(z.string()).describe("URL delle fonti trovate con la ricerca web");

export const outputSchema = z.object({
  verdetto: z.enum(["compra", "tratta", "scappa"]),
  motivi: z.array(z.string()).describe("Esattamente 3 motivi principali, frasi brevi"),
  affidabilita: z.object({
    livello: z.enum(["alta", "media", "bassa"]),
    motivo: z.string(),
  }),
  identikit: z.object({
    modello: z.string(),
    motore: z.string(),
    anno: z.string(),
    km: z.string(),
    prezzo: z.string(),
    venditore: z.enum(["privato", "concessionario", "non indicato"]),
  }),
  puntiDeboli: z.array(
    z.object({
      titolo: z.string(),
      dettaglio: z.string(),
      fonti,
    }),
  ),
  prezzo: z.object({
    giudizio: z.enum(["sotto_mercato", "in_linea", "sopra_mercato", "dati_insufficienti"]),
    spiegazione: z.string(),
    confronti: z.array(
      z.object({
        descrizione: z.string(),
        prezzo: z.string(),
        url: z.string(),
      }),
    ),
  }),
  campanelli: z.array(
    z.object({
      gravita: z.enum(["alta", "media", "bassa"]),
      titolo: z.string(),
      dettaglio: z.string(),
    }),
  ),
  domande: z.array(z.string()).describe("Da 8 a 10 domande da fare al venditore"),
  provaSuStrada: z.array(z.string()),
  trattativa: z
    .object({
      prezzoObiettivo: z.string(),
      messaggio: z.string(),
    })
    .nullable()
    .describe("Solo se il verdetto è 'tratta', altrimenti null"),
});

export type CompraOScappaReport = z.infer<typeof outputSchema>;
