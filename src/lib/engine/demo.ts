import type { CompraOScappaReport } from "@/lib/tools/compra-o-scappa/schema";

/**
 * Report dimostrativo, usato solo quando manca la chiave API.
 * L'auto è inventata: serve a vedere impaginazione e flusso, non contiene dati reali
 * né link a fonti (un report vero li ha sempre).
 */
export const reportDemo: CompraOScappaReport = {
  verdetto: "tratta",
  motivi: [
    "Il prezzo è circa 700 € sopra annunci simili nella stessa zona.",
    "Mancano le fatture dei tagliandi dopo i 50.000 km.",
    "Km, età e uso dichiarato sono coerenti tra loro.",
  ],
  affidabilita: {
    livello: "media",
    motivo: "Annuncio completo e 12 annunci di confronto, ma nessuna foto del libretto dei tagliandi.",
  },
  identikit: {
    modello: "Fiat Panda 1.2 Easy (esempio)",
    motore: "1.2 benzina, 69 CV",
    anno: "2017",
    km: "68.000",
    prezzo: "7.900 €",
    venditore: "privato",
  },
  puntiDeboli: [
    {
      titolo: "Frizione e volano",
      dettaglio: "Su questo motore la frizione tende a consumarsi presto con uso cittadino. Controlla che non slitti in salita.",
      fonti: [],
    },
    {
      titolo: "Servosterzo elettrico",
      dettaglio: "Alcuni proprietari segnalano il servosterzo che si indurisce o si spegne. Prova la funzione City e sterza a fondo da fermo.",
      fonti: [],
    },
  ],
  prezzo: {
    giudizio: "sopra_mercato",
    spiegazione: "Auto simili (2016–2018, 55.000–80.000 km) si trovano tra 6.800 e 7.600 €.",
    confronti: [
      { descrizione: "Panda 1.2 Easy 2017, 72.000 km, privato", prezzo: "7.200 €", url: "" },
      { descrizione: "Panda 1.2 Lounge 2016, 64.000 km, concessionario", prezzo: "7.500 €", url: "" },
    ],
  },
  campanelli: [
    { gravita: "media", titolo: "Tagliandi non documentati", dettaglio: "L'annuncio dice 'tagliandata' ma non mostra fatture dopo i 50.000 km." },
    { gravita: "bassa", titolo: "Targa coperta nelle foto", dettaglio: "È normale, ma chiedi la targa prima di andare a vederla per controllare lo storico." },
  ],
  domande: [
    "Ha le fatture di tutti i tagliandi, anche dopo i 50.000 km?",
    "Quando è stata cambiata la frizione, se è stata cambiata?",
    "L'auto ha mai fatto incidenti? Ci sono parti riverniciate?",
    "Posso avere targa e numero di telaio per controllare lo storico?",
    "Quanti proprietari ha avuto?",
    "Quando scade la prossima revisione?",
    "Le gomme che età hanno?",
    "Perché la vende?",
    "Posso farla vedere a un mio meccanico prima di decidere?",
  ],
  provaSuStrada: [
    "Parti in salita in seconda: se il motore sale di giri ma l'auto non accelera, la frizione slitta.",
    "Sterza a fondo da fermo con e senza funzione City.",
    "Frena decisa sopra i 50 km/h: l'auto deve restare dritta.",
    "Ascolta rumori metallici dalle sospensioni sulle buche.",
  ],
  trattativa: {
    prezzoObiettivo: "7.200 €",
    messaggio:
      "Buongiorno, l'auto mi interessa. Ho visto diverse Panda simili tra 6.800 e 7.600 € e qui mancano le fatture dei tagliandi dopo i 50.000 km. Sarei pronto a chiudere a 7.200 € dopo averla vista. Mi faccia sapere, grazie.",
  },
};
