# Verdetto — istruzioni per Claude Code

Leggi tutto questo file prima di iniziare. Lavoriamo una fase alla volta e alla fine di ogni fase aggiorni la sezione "Stato" in fondo.

## Il progetto

Un sito indipendente, non collegato a profili social o persone, che vende "verdetti" rapidi generati con l'AI nei momenti in cui qualcuno deve decidere subito. Si parte con due strumenti:

1. **Compra o Scappa** (a pagamento): chi sta per comprare un'auto usata carica l'annuncio e riceve un verdetto 🟢 Compra / 🟡 Tratta / 🔴 Scappa, con i motivi.
2. **Multa Check** (gratuito): chi riceve una multa scopre le sue scadenze esatte e capisce il verbale in parole semplici. Porta traffico dalle ricerche su Google.

I clienti arrivano da Google: ricerche organiche (SEO) e Google Ads. In futuro si aggiungeranno altri strumenti, anche fuori dal mondo auto: l'architettura deve renderlo facile.

Nome scelto: **Vistochiaro** (al 24/09/2026 vistochiaro.it e vistochiaro.com risultavano liberi). Prima di acquistare il dominio: conferma sul registrar, ricerca marchi su TMview (EUIPO + UIBM) e il mio ok esplicito.

## Come lavorare con me

- Spiegami ogni passaggio in italiano semplice.
- Prima di scrivere il codice di ogni fase, mostrami un piano breve (e per la grafica una proposta di colori, font e layout).
- Chiedimi conferma prima di creare account, spendere soldi, attivare pagamenti reali, avviare campagne o pubblicare qualcosa online.
- Chiavi e segreti solo in `.env.local`, mai nel codice né su GitHub. Tieni aggiornato un `.env.example`.
- Alla fine di ogni fase: mostrami il risultato, fai un commit, aggiorna "Stato".
- Prima di scrivere codice che chiama Claude, controlla nella documentazione ufficiale (https://docs.claude.com/en/api/overview) l'ID del modello più recente (dovrebbe essere `claude-sonnet-5`), come si attiva la ricerca web lato server e i prezzi attuali.

## Architettura: un motore di strumenti

- Ogni strumento è un modulo con la sua configurazione: slug e URL, testi e meta SEO, schema del form (zod), prompt, schema dell'output, prezzo (0 = gratis), ricerca web sì/no, modello, template del risultato, domande frequenti.
- Pagamenti, ordini, email, rimborsi, anti-abuso, costi AI e statistiche sono condivisi da tutti gli strumenti.
- Aggiungere uno strumento deve voler dire: nuovo modulo, test e pagina, senza toccare il resto.
- Calcoli deterministici (date, importi, scadenze) sempre in codice testato, mai affidati all'AI.
- Esempi per il futuro, da non costruire ora: "Il preventivo del meccanico è giusto?", "Annuncio perfetto per vendere la tua auto", "Confronta 3 annunci". Per temi regolamentati (legale, salute, finanza) vale la regola di Multa Check: solo informazione, mai consulenza personalizzata.

## Stack consigliato

Next.js (App Router) con TypeScript e Tailwind, Supabase (database, file, login admin), Stripe (pagamenti), SDK TypeScript di Anthropic, Resend (email), deploy su Vercel. Se esiste un'alternativa più semplice da gestire per me, proponila prima di cominciare.

## Fase 1 — Fondamenta, motore e Compra o Scappa (non ancora pubblico)

- Scelta del nome e del dominio (vedi sopra).
- Motore di strumenti e primo modulo: Compra o Scappa.
- Pannello `/admin` protetto da login, comodo anche da telefono: ordini, prova manuale di ogni strumento (carico screenshot e vedo il risultato), costo per report, "Rigenera", rimborso.
- Input: fino a 8 screenshot dell'annuncio, testo incollato, link solo come riferimento (niente scraping dei portali) e, facoltativi, budget, km all'anno, uso prevalente, provincia.
- Output in JSON validato con zod; pagina del risultato con link privato non indovinabile, pensata per il telefono.
- Controllo qualità automatico: se il JSON non è valido, mancano le fonti o l'AI dichiara affidabilità bassa, il report va in una coda di revisione invece di partire.
- Per ogni report salva token, ricerche fatte e costo stimato.
- Sicurezza: chiamate a Claude e Stripe solo lato server; su Supabase attiva le regole di accesso (RLS).
- Collaudo prima del lancio: almeno 20 annunci veri, confrontando i verdetti con il mio giudizio.

### Prompt del report "Compra o Scappa"

Ruolo: esperto di auto usate che aiuta un acquirente italiano a decidere. Tono diretto e semplice, niente gergo inutile.

Struttura:
1. Verdetto 🟢/🟡/🔴 con i 3 motivi principali e un livello di affidabilità (alta/media/bassa) motivato.
2. Identikit: modello, motore, anno, km, prezzo, privato o concessionario, come risultano dall'annuncio.
3. Punti deboli noti di quel modello/motore/anno, con fonti linkate.
4. Prezzo rispetto ad annunci simili trovati con la ricerca web (con link). Se i dati non bastano, dillo.
5. Campanelli d'allarme nell'annuncio: prezzo troppo basso, acconto chiesto prima di vedere l'auto, venditore all'estero, km incoerenti con età e uso, foto che non tornano, targa o telaio mancanti.
6. Da 8 a 10 domande da fare al venditore.
7. Cosa controllare alla prova su strada per quel modello.
8. Solo se 🟡: prezzo obiettivo e un messaggio pronto per trattare.
9. Prossimi passi: storico del telaio (link affiliato carVertical, dichiarato come affiliato) e ispezione di un meccanico di fiducia.

Regole:
- Mai inventare. Ogni dato tecnico o di prezzo ha una fonte, altrimenti va scritto "non verificabile".
- Non riportare dati personali del venditore (nome, telefono).
- Scrivere chiaramente che il report è generato con l'AI e non sostituisce vedere l'auto dal vivo né un'ispezione.

## Fase 2 — Multa Check e primo lancio pubblico

Va online per primo, così Google inizia a conoscere il dominio mentre il resto è in lavorazione.

Deve restare informativo: niente ricorsi scritti su misura e niente "consulenza". In Italia l'assistenza legale svolta in modo continuativo e organizzato da chi non è avvocato può configurare esercizio abusivo della professione. Il sito non deve mai presentarsi come servizio legale.

Form senza dati personali: data dell'infrazione, data di spedizione del verbale (sulla busta o sull'avviso), data di ricezione oppure contestazione immediata, tipo di infrazione (autovelox, ZTL, sosta, semaforo, altro), importo, se è prevista la sospensione della patente.

Le scadenze si calcolano con codice, mai con l'AI, e con test automatici. Ogni regola va verificata sul testo aggiornato del Codice della Strada prima di implementarla:
- sconto del 30% pagando entro 5 giorni dalla notifica o contestazione (escluso se sono previste sospensione della patente o confisca);
- pagamento in misura ridotta entro 60 giorni;
- ricorso al Giudice di Pace entro 30 giorni (con contributo unificato) o al Prefetto entro 60 (gratuito, ma se respinto l'importo può raddoppiare);
- notifica entro 90 giorni dall'accertamento (360 per chi risiede all'estero): se i giorni risultano di più, segnalalo come "da verificare", senza trarre conclusioni;
- conteggio: il giorno iniziale non si conta; se la scadenza cade in un festivo slitta al primo giorno non festivo (includi le festività nazionali);
- verifica su fonti ufficiali e implementa anche: notifiche via PEC e SEND, sospensione feriale di agosto per il ricorso al Giudice di Pace, casi particolari (auto aziendali, a noleggio).

In evidenza: pagare la multa chiude la strada del ricorso, quindi va deciso prima.

Opzionale: foto del verbale, con invito a coprire i dati personali. L'AI spiega cosa c'è scritto e le strade possibili (pagare, Prefetto, Giudice di Pace) con pro e contro, senza mai dire "fai ricorso" o "vincerai". La foto va cancellata subito dopo l'analisi.

In fondo alla pagina: promemoria email facoltativo prima della scadenza dello sconto (con consenso esplicito), link a fonti ufficiali, invito a sentire un avvocato o un'associazione di consumatori per valutare un ricorso, rimando a Compra o Scappa.

Anti-abuso: limite di richieste per IP, captcha (es. Cloudflare Turnstile), tetto giornaliero alle chiamate AI.

Obbligatorio prima di andare online: privacy policy, banner cookie con Consent Mode v2 di Google, termini d'uso, pagina "Chi siamo" con contatti, avviso chiaro che i risultati sono generati con l'AI (obblighi di trasparenza dell'AI Act applicabili da agosto 2026). Bozze da far controllare a un legale.

## Fase 3 — Vendita automatica di Compra o Scappa

- Flusso: form pubblico → Stripe Checkout (prima in modalità test) → report generato → controllo qualità → email con il link. Pagamenti reali solo dopo che ho sentito il commercialista.
- Invio automatico di default. I report che non superano il controllo qualità vanno in coda e il cliente riceve un'email "pronto entro poche ore".
- Prezzo configurabile, partenza 19,99 €. Si provano prezzi diversi in periodi diversi, mai prezzi diversi a persone diverse nello stesso momento.
- Prima del pagamento: casella per il consenso all'esecuzione immediata e la presa d'atto della perdita del diritto di recesso (servizio digitale). Testo da far verificare al legale.
- Rimborso automatico se il report fallisce; garanzia "soddisfatti o rimborsati" attivabile dal pannello.
- Fiducia senza un volto dietro: un report di esempio completo e gratuito, una pagina "Come funziona" che spiega il metodo, solo recensioni reali di clienti (mai inventate).
- Extra configurabili: "Confronta 3 annunci", "Messaggio per trattare".
- Piè di pagina con i dati dell'attività (P.IVA quando ci sarà).

## Fase 4 — SEO

- Pagine veloci renderizzate lato server, sitemap.xml, robots.txt, URL puliti, title e description unici, dati strutturati pertinenti, link interni tra guide e strumenti.
- Guide per le ricerche del momento del bisogno, ognuna con lo strumento dentro la pagina. Esempi: come capire se un'auto usata ha i km scalati; truffe negli annunci di auto usate; cosa controllare prima di comprare un'auto usata; come si contano i 5 giorni per lo sconto sulla multa; ricorso al Prefetto o al Giudice di Pace; multa arrivata dopo 90 giorni.
- Pagine per modello ("[modello] usata: problemi noti e cosa controllare"), partendo dai modelli più scambiati in Italia (Fiat Panda, Fiat 500, Lancia Ypsilon, Fiat Grande Punto, Volkswagen Golf). All'inizio massimo 10–20, ognuna con contenuto verificato e fonti, riletta da me prima di pubblicarla. Niente pagine in serie povere di contenuto: Google le penalizza.
- Collega Google Search Console e invia la sitemap.

## Fase 5 — Google Ads

- Tracciamento delle conversioni (acquisto con valore) con Google Ads e GA4, rispettando il consenso (Consent Mode v2). Verifica i requisiti attuali di Google e le norme pubblicitarie prima di creare campagne.
- Landing page dedicate per gruppo di parole chiave, con parametri UTM.
- Dashboard: spesa, clic, conversioni, costo per cliente e margine per strumento (all'inizio va bene importare la spesa a mano).
- Partenza con budget piccolo su parole ad alta intenzione (es. controllo auto usata prima dell'acquisto, verifica annuncio auto usata). Le parole che convertono diventano priorità per la SEO.
- Regola: si aumenta il budget solo se il costo per cliente resta sotto il margine per cliente.

## Fase 6 — Espansione

- Nuovi strumenti tramite il motore, scegliendo quelli con ricerche e conversioni migliori nei dati di Search Console e Google Ads.

## Design

- Mobile-first: quasi tutto il traffico arriva da ricerche fatte dal telefono.
- L'identità del marchio ruota attorno al verdetto a semaforo (verde, giallo, rosso), non alle auto, così funziona anche per gli strumenti futuri. Ogni strumento può avere un proprio accento; il resto sobrio.
- Tipografia scelta con intenzione e molto leggibile. Niente look da template (card tutte uguali, gradienti decorativi, etichette in maiuscolo sopra ogni titolo).
- Testi in italiano semplice e verbi attivi: ogni pulsante dice cosa succede ("Controlla l'annuncio", "Calcola le scadenze").
- Velocità: le prestazioni della pagina contano sia per la SEO sia per il costo degli annunci.

## Decisioni prese

- Nome: Vistochiaro. Grafica: semaforo con una luce accesa; titoli Bricolage Grotesque, testo Lexend; colori in `src/app/globals.css`.
- AI: `claude-sonnet-5` (2 $/M token in ingresso, 10 $/M in uscita, 10 $ ogni 1.000 ricerche web; verificato il 24/09/2026). Due passaggi: ricerca con `web_search_20260318`, poi JSON strutturato con zod. Le citazioni della ricerca non sono compatibili con l'output strutturato, per questo si separano; il controllo qualità accetta solo URL usciti davvero dalle ricerche.
- Login admin: password (`ADMIN_PASSWORD`) e cookie firmato, più semplice da gestire di Supabase Auth per un solo amministratore.
- Senza `ANTHROPIC_API_KEY` il sito genera report dimostrativi; senza Supabase usa la cartella `.data` (solo in locale).

## Stato

- [ ] Fase 1 — fondamenta, motore e Compra o Scappa
  - [x] Progetto Next.js 16 + TypeScript + Tailwind, test (Vitest), `.env.example`
  - [x] Motore strumenti (`src/lib/tools`) e modulo Compra o Scappa (form, prompt, schema, controllo qualità)
  - [x] Chiamata a Claude lato server con ricerca web, costo per report salvato
  - [x] Pagina risultato con link privato (`/r/<token>`), home, pagina strumento, report di esempio
  - [x] Pannello `/admin`: elenco e coda di revisione, prova manuale, costo, Rigenera, Approva, rimborso (segnato; Stripe in Fase 3)
  - [x] Schema Supabase con RLS (`supabase/migrations/0001_reports.sql`)
  - [ ] Creare progetto Supabase (UE) e chiave API Anthropic con limite di spesa — serve l'ok dell'utente
  - [ ] Prime prove con annunci veri e taratura del prompt
  - [ ] Collaudo su almeno 20 annunci veri confrontati con il giudizio dell'utente
- [ ] Fase 2 — Multa Check e primo lancio pubblico
- [ ] Fase 3 — vendita automatica
- [ ] Fase 4 — SEO
- [ ] Fase 5 — Google Ads
- [ ] Fase 6 — espansione

## Note tecniche

Next.js 16 ha cambiato varie API: prima di scrivere codice leggi AGENTS.md e le guide in `node_modules/next/dist/docs/`.

@AGENTS.md
