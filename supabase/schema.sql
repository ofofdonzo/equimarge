-- Equimarge : base de données
-- À coller dans Supabase > SQL Editor > New query, puis "Run".
-- Le fichier est relançable sans perte de données : relancez-le après chaque mise à jour.

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

alter table public.products drop constraint if exists products_name_length;
alter table public.products add constraint products_name_length check (char_length(name) <= 200);

-- 500 lignes au plus par client
create or replace function public.limit_products()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (select count(*) from public.products where user_id = new.user_id) >= 500 then
    raise exception 'limite_de_lignes' using hint = '500 lignes au maximum par compte';
  end if;
  return new;
end;
$$;
drop trigger if exists products_limit on public.products;
create trigger products_limit before insert on public.products
  for each row execute function public.limit_products();

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

alter table public.settings drop constraint if exists settings_company_length;
alter table public.settings add constraint settings_company_length check (char_length(company) <= 200);

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

-- Date du dernier échange : point de départ de la durée de conservation (3 ans, voir la politique de confidentialité)
alter table public.diagnostic_requests add column if not exists last_contact_at timestamptz not null default now();
create index if not exists diag_email_idx on public.diagnostic_requests(lower(email), created_at desc);
create index if not exists diag_last_contact_idx on public.diagnostic_requests(last_contact_at);

-- Anti-spam : au plus 3 demandes par heure pour un même e-mail et 30 par heure au total.
-- Les dates sont imposées par la base, pour qu'un envoi ne puisse pas se dater dans le passé.
create or replace function public.check_request_rate()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.created_at := now();
  new.last_contact_at := now();
  if (select count(*) from public.diagnostic_requests
        where lower(email) = lower(new.email) and created_at > now() - interval '1 hour') >= 3
     or (select count(*) from public.diagnostic_requests
        where created_at > now() - interval '1 hour') >= 30 then
    raise exception 'trop_de_demandes' using hint = 'Réessayez dans une heure';
  end if;
  return new;
end;
$$;
drop trigger if exists diag_rate_limit on public.diagnostic_requests;
create trigger diag_rate_limit before insert on public.diagnostic_requests
  for each row execute function public.check_request_rate();

-- Chaque changement de statut par l'administrateur compte comme un échange
create or replace function public.touch_last_contact()
returns trigger
language plpgsql
as $$
begin
  if new.status is distinct from old.status then
    new.last_contact_at := now();
  end if;
  return new;
end;
$$;
drop trigger if exists diag_touch on public.diagnostic_requests;
create trigger diag_touch before update on public.diagnostic_requests
  for each row execute function public.touch_last_contact();

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

-- Seul l'administrateur supprime une demande (droit à l'effacement)
drop policy if exists "admin supprime" on public.diagnostic_requests;
create policy "admin supprime" on public.diagnostic_requests
  for delete to authenticated using (public.is_admin());

-- Purge automatique des demandes sans échange depuis 3 ans
create or replace function public.purge_old_requests()
returns integer
language sql
security definer
set search_path = public
as $$
  with d as (
    delete from public.diagnostic_requests where last_contact_at < now() - interval '3 years' returning 1
  )
  select count(*)::integer from d;
$$;
revoke all on function public.purge_old_requests() from public, anon, authenticated;

-- Lancement chaque nuit à 3 h (UTC) grâce à l'extension pg_cron de Supabase.
-- Si l'extension ne peut pas être activée, un avertissement s'affiche : activez « pg_cron » dans
-- Supabase > Database > Extensions, puis relancez ce fichier.
do $$
begin
  create extension if not exists pg_cron;
  perform cron.schedule('purge-demandes', '0 3 * * *', 'select public.purge_old_requests()');
exception when others then
  raise warning 'Purge automatique non programmée (%). Activez pg_cron puis relancez ce fichier.', sqlerrm;
end;
$$;

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

-- 7. Notifications sur téléphone et ordinateur (appareils abonnés aux alertes du poste de travail).
-- Réservé à l'administrateur ; le serveur les lit avec la clé « service_role » pour envoyer les alertes.
create table if not exists public.push_subscriptions (
  endpoint text primary key check (char_length(endpoint) <= 1000),
  p256dh text not null check (char_length(p256dh) <= 200),
  auth text not null check (char_length(auth) <= 100),
  device text check (device is null or char_length(device) <= 300),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.push_subscriptions enable row level security;
drop policy if exists "admin gère ses appareils" on public.push_subscriptions;
create policy "admin gère ses appareils" on public.push_subscriptions
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- 8. Alerte immédiate à chaque nouvelle demande : la base appelle /api/alerte-demande du site,
-- qui envoie la notification (et l'e-mail si Resend est configuré).
-- Le secret partagé est rangé dans le coffre-fort de Supabase (Vault), jamais dans ce fichier :
--   select vault.create_secret('LA-MÊME-PHRASE-QUE-WEBHOOK_SECRET-DANS-NETLIFY', 'equimarge_webhook_secret');
-- Sans ce secret, le déclencheur ne fait rien (la demande est toujours enregistrée).
-- N'utilisez pas en plus un « Database Webhook » du tableau de bord : vous recevriez chaque alerte deux fois.
create extension if not exists pg_net;

create or replace function public.alerte_nouvelle_demande()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  secret text;
begin
  select decrypted_secret into secret from vault.decrypted_secrets where name = 'equimarge_webhook_secret' limit 1;
  if secret is not null then
    perform net.http_post(
      url := 'https://equimarge.netlify.app/api/alerte-demande',
      body := jsonb_build_object('type', 'INSERT', 'table', 'diagnostic_requests', 'record', to_jsonb(new)),
      headers := jsonb_build_object('Content-Type', 'application/json', 'x-webhook-secret', secret),
      timeout_milliseconds := 5000
    );
  end if;
  return new;
exception when others then
  -- Une alerte en panne ne doit jamais empêcher un client d'envoyer sa demande.
  return new;
end;
$$;
revoke all on function public.alerte_nouvelle_demande() from public, anon, authenticated;

drop trigger if exists alerte_nouvelle_demande on public.diagnostic_requests;
create trigger alerte_nouvelle_demande
  after insert on public.diagnostic_requests
  for each row execute function public.alerte_nouvelle_demande();

-- 9. Espace conformité de chaque client : auto-diagnostic, plan d'action, registre RGPD, risques.
-- Chacun ne voit et ne modifie que ses propres lignes. Les clés de domaine et de question
-- correspondent à lib/conformite.mjs.

-- Nombre maximal de lignes par compte, passé en argument du déclencheur
create or replace function public.limit_rows()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  n integer;
  max_rows integer := tg_argv[0]::integer;
begin
  execute format('select count(*) from public.%I where user_id = $1', tg_table_name) into n using new.user_id;
  if n >= max_rows then
    raise exception 'limite_de_lignes' using hint = format('%s lignes au maximum par compte', max_rows);
  end if;
  return new;
end;
$$;

create table if not exists public.compliance_answers (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  question text not null check (char_length(question) <= 60),
  answer text not null check (answer in ('oui','partiel','non','na')),
  updated_at timestamptz not null default now(),
  primary key (user_id, question)
);
alter table public.compliance_answers enable row level security;
drop policy if exists "chacun gère ses réponses" on public.compliance_answers;
create policy "chacun gère ses réponses" on public.compliance_answers
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop trigger if exists compliance_answers_limit on public.compliance_answers;
create trigger compliance_answers_limit before insert on public.compliance_answers
  for each row execute function public.limit_rows('200');

create table if not exists public.compliance_actions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  domain text not null check (char_length(domain) <= 30),
  title text not null default '' check (char_length(title) <= 300),
  owner text not null default '' check (char_length(owner) <= 120),
  due_date date,
  priority text not null default 'Moyenne' check (priority in ('Haute','Moyenne','Basse')),
  status text not null default 'À faire' check (status in ('À faire','En cours','Terminé')),
  source text check (source is null or char_length(source) <= 60),
  created_at timestamptz not null default now()
);
create index if not exists compliance_actions_user_idx on public.compliance_actions(user_id, created_at);
alter table public.compliance_actions enable row level security;
drop policy if exists "chacun gère son plan d'action" on public.compliance_actions;
create policy "chacun gère son plan d'action" on public.compliance_actions
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop trigger if exists compliance_actions_limit on public.compliance_actions;
create trigger compliance_actions_limit before insert on public.compliance_actions
  for each row execute function public.limit_rows('500');

-- Registre des activités de traitement (article 30 du RGPD)
create table if not exists public.rgpd_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null default '' check (char_length(name) <= 200),
  purpose text not null default '' check (char_length(purpose) <= 1000),
  legal_basis text not null default 'Contrat' check (legal_basis in
    ('Consentement','Contrat','Obligation légale','Sauvegarde des intérêts vitaux','Mission d’intérêt public','Intérêt légitime')),
  data_subjects text not null default '' check (char_length(data_subjects) <= 500),
  data_categories text not null default '' check (char_length(data_categories) <= 1000),
  sensitive boolean not null default false,
  recipients text not null default '' check (char_length(recipients) <= 1000),
  transfers text not null default '' check (char_length(transfers) <= 500),
  retention text not null default '' check (char_length(retention) <= 500),
  security text not null default '' check (char_length(security) <= 1000),
  created_at timestamptz not null default now()
);
create index if not exists rgpd_records_user_idx on public.rgpd_records(user_id, created_at);
alter table public.rgpd_records enable row level security;
drop policy if exists "chacun gère son registre" on public.rgpd_records;
create policy "chacun gère son registre" on public.rgpd_records
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop trigger if exists rgpd_records_limit on public.rgpd_records;
create trigger rgpd_records_limit before insert on public.rgpd_records
  for each row execute function public.limit_rows('300');

-- Cartographie des risques (probabilité × impact, de 1 à 5)
create table if not exists public.compliance_risks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  domain text not null check (char_length(domain) <= 30),
  title text not null default '' check (char_length(title) <= 300),
  probability smallint not null default 3 check (probability between 1 and 5),
  impact smallint not null default 3 check (impact between 1 and 5),
  measure text not null default '' check (char_length(measure) <= 1000),
  status text not null default 'Ouvert' check (status in ('Ouvert','Maîtrisé')),
  created_at timestamptz not null default now()
);
create index if not exists compliance_risks_user_idx on public.compliance_risks(user_id, created_at);
alter table public.compliance_risks enable row level security;
drop policy if exists "chacun gère ses risques" on public.compliance_risks;
create policy "chacun gère ses risques" on public.compliance_risks
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop trigger if exists compliance_risks_limit on public.compliance_risks;
create trigger compliance_risks_limit before insert on public.compliance_risks
  for each row execute function public.limit_rows('300');

-- 10. Vous déclarer administrateur (à faire APRÈS avoir créé votre compte sur le site)
-- Remplacez l'e-mail puis exécutez cette ligne seule :
-- insert into public.admins (user_id) select id from auth.users where email = 'contact@equimarge.fr';
