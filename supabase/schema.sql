-- Equimarge : base de données
-- À coller une seule fois dans Supabase > SQL Editor > New query, puis "Run".

-- 1. Administrateurs (vous)
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);
alter table public.admins enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

drop policy if exists "admins lisent leur ligne" on public.admins;
create policy "admins lisent leur ligne" on public.admins
  for select using (user_id = auth.uid());

-- 2. Produits et prestations de chaque client
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null default '',
  price numeric(12,2) not null default 0 check (price >= 0),
  cost numeric(12,2) not null default 0 check (cost >= 0),
  quantity numeric(12,2) not null default 0 check (quantity >= 0),
  created_at timestamptz not null default now()
);
create index if not exists products_user_idx on public.products(user_id);
alter table public.products enable row level security;

drop policy if exists "chacun gère ses produits" on public.products;
create policy "chacun gère ses produits" on public.products
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- 3. Paramètres de chaque client (charges fixes, nom d'entreprise)
create table if not exists public.settings (
  user_id uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  company text not null default '',
  fixed_costs numeric(12,2) not null default 0 check (fixed_costs >= 0),
  updated_at timestamptz not null default now()
);
alter table public.settings enable row level security;

drop policy if exists "chacun gère ses paramètres" on public.settings;
create policy "chacun gère ses paramètres" on public.settings
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- 4. Demandes de diagnostic
create table if not exists public.diagnostic_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  offer text not null check (offer in ('Flash','Essentiel','Complet','Conformité','Automatisation')),
  company text not null check (char_length(company) between 1 and 200),
  siren text check (siren is null or siren ~ '^[0-9]{9}$'),
  sector text,
  revenue_band text,
  contact_name text not null check (char_length(contact_name) between 1 and 200),
  email text not null check (email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone text,
  availability text,
  message text check (message is null or char_length(message) <= 4000),
  consent boolean not null check (consent = true),
  status text not null default 'Nouvelle' check (status in ('Nouvelle','Contactée','Devis envoyé','Gagnée','Perdue')),
  created_at timestamptz not null default now()
);
create index if not exists diag_created_idx on public.diagnostic_requests(created_at desc);

-- Demandes de devis conformité (offer = 'Conformité') ou automatisation (offer = 'Automatisation')
-- et domaines ou étages choisis.
-- Ces lignes mettent aussi à jour une base créée avec une version précédente de ce fichier.
alter table public.diagnostic_requests add column if not exists topics text[];
alter table public.diagnostic_requests drop constraint if exists diagnostic_requests_offer_check;
alter table public.diagnostic_requests add constraint diagnostic_requests_offer_check
  check (offer in ('Flash','Essentiel','Complet','Conformité','Automatisation'));
alter table public.diagnostic_requests drop constraint if exists diagnostic_requests_topics_check;
alter table public.diagnostic_requests add constraint diagnostic_requests_topics_check
  check (topics is null or (cardinality(topics) between 1 and 10 and char_length(array_to_string(topics, ',')) <= 500));
alter table public.diagnostic_requests enable row level security;

-- Tout le monde (même sans compte) peut envoyer une demande
drop policy if exists "envoyer une demande" on public.diagnostic_requests;
create policy "envoyer une demande" on public.diagnostic_requests
  for insert to anon, authenticated
  with check (
    (user_id is null or user_id = auth.uid())
    and status = 'Nouvelle'
    and coalesce(char_length(sector), 0) <= 100
    and coalesce(char_length(revenue_band), 0) <= 100
    and coalesce(char_length(phone), 0) <= 40
    and coalesce(char_length(availability), 0) <= 200
    and char_length(email) <= 320
  );

-- Un client connecté voit ses propres demandes
drop policy if exists "voir ses demandes" on public.diagnostic_requests;
create policy "voir ses demandes" on public.diagnostic_requests
  for select to authenticated using (user_id = auth.uid() or public.is_admin());

-- Seul l'administrateur change le statut
drop policy if exists "admin met à jour" on public.diagnostic_requests;
create policy "admin met à jour" on public.diagnostic_requests
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- 5. Poste de travail de l'administrateur : suivi interne et notes.
-- Tables séparées : le client qui voit sa demande ne voit jamais le montant du devis ni vos notes.
create table if not exists public.request_tracking (
  request_id uuid primary key references public.diagnostic_requests(id) on delete cascade,
  amount numeric(12,2) check (amount is null or amount >= 0),
  next_action text check (next_action is null or char_length(next_action) <= 300),
  next_action_at date,
  updated_at timestamptz not null default now()
);
alter table public.request_tracking enable row level security;
drop policy if exists "admin gère le suivi" on public.request_tracking;
create policy "admin gère le suivi" on public.request_tracking
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create table if not exists public.request_notes (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.diagnostic_requests(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 4000),
  created_at timestamptz not null default now()
);
create index if not exists notes_request_idx on public.request_notes(request_id, created_at desc);
alter table public.request_notes enable row level security;
drop policy if exists "admin gère les notes" on public.request_notes;
create policy "admin gère les notes" on public.request_notes
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- 6. Temps réel : les nouvelles demandes apparaissent dans le poste de travail sans recharger la page.
-- (Seul l'administrateur les reçoit : le temps réel respecte les règles d'accès ci-dessus.)
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (
       select 1 from pg_publication_tables
       where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'diagnostic_requests'
     ) then
    alter publication supabase_realtime add table public.diagnostic_requests;
  end if;
end $$;

-- 7. Vous déclarer administrateur (à faire APRÈS avoir créé votre compte sur le site)
-- Remplacez l'e-mail puis exécutez cette ligne seule :
-- insert into public.admins (user_id) select id from auth.users where email = 'contact@equimarge.fr';
