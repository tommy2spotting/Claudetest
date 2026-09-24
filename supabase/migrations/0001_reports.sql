-- Vistochiaro: tabella dei report/ordini e spazio privato per gli screenshot.
-- Da eseguire nel SQL Editor di Supabase (o con `supabase db push`).

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  token text not null unique,
  tool_slug text not null,
  stato text not null default 'in_lavorazione'
    check (stato in ('in_lavorazione', 'pronto', 'in_revisione', 'errore', 'rimborsato')),
  origine text not null check (origine in ('admin', 'cliente')),
  email text,
  prezzo_centesimi integer not null default 0,
  input jsonb not null default '{}'::jsonb,
  immagini text[] not null default '{}',
  report jsonb,
  motivi_revisione text[] not null default '{}',
  fonti text[] not null default '{}',
  dossier text not null default '',
  usage jsonb,
  costo_usd numeric(10, 4) not null default 0,
  model text not null,
  demo boolean not null default false,
  errore text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists reports_created_at_idx on public.reports (created_at desc);
create index if not exists reports_stato_idx on public.reports (stato);

-- RLS attivo e NESSUNA policy: né il pubblico (anon) né gli utenti loggati leggono o scrivono.
-- Il sito accede solo dal server con la chiave service_role, che scavalca RLS.
alter table public.reports enable row level security;

-- Spazio file privato per gli screenshot (max 5 MB a file, solo immagini).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('screenshot', 'screenshot', false, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;
-- Nessuna policy su storage.objects per questo bucket: accesso solo dal server.
