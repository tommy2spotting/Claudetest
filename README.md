# Vistochiaro

Sito di "verdetti" rapidi generati con l'AI. Istruzioni di progetto e stato: [CLAUDE.md](CLAUDE.md).

## Avvio in locale

```bash
npm install
cp .env.example .env.local   # poi imposta almeno ADMIN_PASSWORD e ADMIN_SESSION_SECRET
npm run dev                  # http://localhost:3000 — pannello su /admin
```

Senza `ANTHROPIC_API_KEY` i report sono dimostrativi; senza Supabase i dati vanno nella cartella `.data`.

## Controlli

```bash
npm test          # test automatici
npm run typecheck
npm run lint
npm run build
```

## Aggiungere uno strumento

1. Crea `src/lib/tools/<slug>/` con schema, prompt, controllo qualità e definizione (vedi `compra-o-scappa`).
2. Registralo in `src/lib/tools/registry.ts`.
3. Aggiungi il template del risultato in `src/components/report/` e in `ReportView.tsx`.
4. Scrivi i test accanto al modulo.
