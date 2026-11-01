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

-- 9. Dossiers clients : un dossier par entreprise, partagé entre l'administrateur, qui réalise la mission,
-- et le client, qui répond à l'auto-diagnostic et aux demandes d'informations et dépose ses documents.
-- Le client accède à son dossier avec son compte : client_id, ou rattachement automatique par son e-mail
-- confirmé quand l'administrateur a ouvert le dossier avant la création du compte.
-- Les clés de domaine et de question correspondent à lib/conformite.mjs.

create table if not exists public.dossiers (
  id uuid primary key default gen_random_uuid(),
  company text not null default '' check (char_length(company) <= 200),
  contact_name text not null default '' check (char_length(contact_name) <= 200),
  email text not null default '' check (char_length(email) <= 320),
  client_id uuid unique references auth.users(id) on delete set null,
  offer text not null default '' check (char_length(offer) <= 120),
  status text not null default 'Auto-diagnostic' check (status in ('Auto-diagnostic','En cours','Terminé','Suspendu')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists dossiers_email_idx on public.dossiers(lower(email));
alter table public.dossiers enable row level security;
drop policy if exists "admin gère les dossiers" on public.dossiers;
create policy "admin gère les dossiers" on public.dossiers
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "client voit son dossier" on public.dossiers;
create policy "client voit son dossier" on public.dossiers
  for select to authenticated using (client_id = auth.uid());

create or replace function public.touch_dossier()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;
drop trigger if exists dossiers_touch on public.dossiers;
create trigger dossiers_touch before update on public.dossiers
  for each row execute function public.touch_dossier();

-- Demande d'origine du dossier (bouton « Ouvrir le dossier » du poste de travail)
alter table public.diagnostic_requests add column if not exists dossier_id uuid references public.dossiers(id) on delete set null;

create or replace function public.can_access_dossier(d uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select public.is_admin() or exists (select 1 from public.dossiers where id = d and client_id = auth.uid());
$$;

-- Nombre maximal de lignes, compté par la colonne passée en 2e argument (dossier ou utilisateur)
create or replace function public.limit_rows()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  n integer;
  max_rows integer := tg_argv[0]::integer;
  col text := coalesce(tg_argv[1], 'user_id');
begin
  execute format('select count(*) from public.%I where %I = $1', tg_table_name, col)
    into n using (to_jsonb(new) ->> col)::uuid;
  if n >= max_rows then
    raise exception 'limite_de_lignes' using hint = format('%s lignes au maximum', max_rows);
  end if;
  return new;
end;
$$;

-- Réponses à l'auto-diagnostic : le client et l'administrateur peuvent répondre
create table if not exists public.dossier_answers (
  dossier_id uuid not null references public.dossiers(id) on delete cascade,
  question text not null check (char_length(question) <= 60),
  answer text not null check (answer in ('oui','partiel','non','na')),
  updated_at timestamptz not null default now(),
  primary key (dossier_id, question)
);
alter table public.dossier_answers enable row level security;
drop policy if exists "dossier : réponses" on public.dossier_answers;
create policy "dossier : réponses" on public.dossier_answers
  for all to authenticated using (public.can_access_dossier(dossier_id)) with check (public.can_access_dossier(dossier_id));
drop trigger if exists dossier_answers_limit on public.dossier_answers;
create trigger dossier_answers_limit before insert on public.dossier_answers
  for each row execute function public.limit_rows('200', 'dossier_id');

-- Plan d'action, registre et risques : rédigés par l'administrateur, consultables par le client
create table if not exists public.dossier_actions (
  id uuid primary key default gen_random_uuid(),
  dossier_id uuid not null references public.dossiers(id) on delete cascade,
  domain text not null check (char_length(domain) <= 30),
  title text not null default '' check (char_length(title) <= 300),
  owner text not null default '' check (char_length(owner) <= 120),
  due_date date,
  priority text not null default 'Moyenne' check (priority in ('Haute','Moyenne','Basse')),
  status text not null default 'À faire' check (status in ('À faire','En cours','Terminé')),
  source text check (source is null or char_length(source) <= 60),
  created_at timestamptz not null default now()
);
create index if not exists dossier_actions_idx on public.dossier_actions(dossier_id, created_at);

create table if not exists public.dossier_records (
  id uuid primary key default gen_random_uuid(),
  dossier_id uuid not null references public.dossiers(id) on delete cascade,
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
create index if not exists dossier_records_idx on public.dossier_records(dossier_id, created_at);

create table if not exists public.dossier_risks (
  id uuid primary key default gen_random_uuid(),
  dossier_id uuid not null references public.dossiers(id) on delete cascade,
  domain text not null check (char_length(domain) <= 30),
  title text not null default '' check (char_length(title) <= 300),
  probability smallint not null default 3 check (probability between 1 and 5),
  impact smallint not null default 3 check (impact between 1 and 5),
  measure text not null default '' check (char_length(measure) <= 1000),
  status text not null default 'Ouvert' check (status in ('Ouvert','Maîtrisé')),
  created_at timestamptz not null default now()
);
create index if not exists dossier_risks_idx on public.dossier_risks(dossier_id, created_at);

-- Demandes d'informations envoyées au client ; il y répond avec answer_info_request()
create table if not exists public.dossier_info_requests (
  id uuid primary key default gen_random_uuid(),
  dossier_id uuid not null references public.dossiers(id) on delete cascade,
  title text not null default '' check (char_length(title) <= 300),
  details text not null default '' check (char_length(details) <= 2000),
  due_date date,
  status text not null default 'À fournir' check (status in ('À fournir','Fourni','Validé')),
  response text not null default '' check (char_length(response) <= 4000),
  answered_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists dossier_info_requests_idx on public.dossier_info_requests(dossier_id, created_at);

-- Documents du dossier : déposés par le client (« Client ») ou livrés par Equimarge (« Livrable »).
-- Les fichiers sont dans l'espace de stockage privé « dossiers », sous <id du dossier>/<fichier>.
create table if not exists public.dossier_documents (
  id uuid primary key default gen_random_uuid(),
  dossier_id uuid not null references public.dossiers(id) on delete cascade,
  info_request_id uuid references public.dossier_info_requests(id) on delete set null,
  kind text not null default 'Client' check (kind in ('Client','Livrable')),
  name text not null check (char_length(name) between 1 and 200),
  path text not null unique check (char_length(path) <= 500),
  size bigint not null default 0 check (size between 0 and 10485760),
  uploaded_by uuid default auth.uid() references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists dossier_documents_idx on public.dossier_documents(dossier_id, created_at);

do $$
declare
  t text;
begin
  foreach t in array array['dossier_actions','dossier_records','dossier_risks','dossier_info_requests','dossier_documents'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "dossier : lecture" on public.%I', t);
    execute format('create policy "dossier : lecture" on public.%I for select to authenticated using (public.can_access_dossier(dossier_id))', t);
    execute format('drop policy if exists "dossier : admin écrit" on public.%I', t);
    execute format('create policy "dossier : admin écrit" on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())', t);
    execute format('drop trigger if exists %I on public.%I', t || '_limit', t);
    execute format('create trigger %I before insert on public.%I for each row execute function public.limit_rows(%L, %L)',
      t || '_limit', t, case when t = 'dossier_actions' then '500' else '300' end, 'dossier_id');
  end loop;
end $$;

-- Le client dépose ses propres documents dans son dossier
drop policy if exists "client dépose ses documents" on public.dossier_documents;
create policy "client dépose ses documents" on public.dossier_documents
  for insert to authenticated
  with check (
    public.can_access_dossier(dossier_id) and kind = 'Client' and uploaded_by = auth.uid()
    and split_part(path, '/', 1) = dossier_id::text
  );

-- Dossier du client connecté : le sien, sinon celui ouvert à son e-mail confirmé, sinon un nouveau
create or replace function public.my_dossier()
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  d uuid;
  mail text;
  confirmed boolean;
begin
  if uid is null then
    return null;
  end if;
  select id into d from public.dossiers where client_id = uid;
  if d is not null then
    return d;
  end if;
  select email, email_confirmed_at is not null into mail, confirmed from auth.users where id = uid;
  if confirmed then
    update public.dossiers set client_id = uid
      where id = (select id from public.dossiers where client_id is null and lower(email) = lower(mail) order by created_at limit 1)
      returning id into d;
    if d is not null then
      return d;
    end if;
  end if;
  insert into public.dossiers (client_id, email, company)
    values (uid, coalesce(mail, ''), coalesce((select company from public.settings where user_id = uid), ''))
    returning id into d;
  return d;
end;
$$;

-- Ouvre (ou retrouve) le dossier d'une demande : même compte, sinon même e-mail, sinon nouveau dossier
create or replace function public.open_dossier_from_request(r uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  req public.diagnostic_requests;
  d uuid;
begin
  if not public.is_admin() then
    raise exception 'reserve_administrateur';
  end if;
  select * into req from public.diagnostic_requests where id = r;
  if not found then
    raise exception 'demande_introuvable';
  end if;
  d := req.dossier_id;
  if d is null and req.user_id is not null then
    select id into d from public.dossiers where client_id = req.user_id;
  end if;
  if d is null then
    select id into d from public.dossiers where lower(email) = lower(req.email) order by created_at limit 1;
  end if;
  if d is null then
    insert into public.dossiers (company, contact_name, email, client_id, offer, status)
      values (req.company, req.contact_name, req.email, req.user_id, req.offer, 'En cours')
      returning id into d;
  else
    update public.dossiers set
      status = case when status = 'Auto-diagnostic' then 'En cours' else status end,
      company = case when company = '' then req.company else company end,
      contact_name = case when contact_name = '' then req.contact_name else contact_name end,
      offer = case when offer = '' then req.offer else offer end
      where id = d;
  end if;
  update public.diagnostic_requests set dossier_id = d where id = r;
  return d;
end;
$$;

-- Réponse du client à une demande d'informations (il ne peut modifier que sa réponse)
create or replace function public.answer_info_request(i uuid, reply text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.dossier_info_requests
    set response = left(coalesce(reply, ''), 4000), status = 'Fourni', answered_at = now()
    where id = i and status <> 'Validé' and public.can_access_dossier(dossier_id);
  if not found then
    raise exception 'demande_non_modifiable';
  end if;
end;
$$;

revoke all on function public.my_dossier() from public, anon;
revoke all on function public.open_dossier_from_request(uuid) from public, anon;
revoke all on function public.answer_info_request(uuid, text) from public, anon;
grant execute on function public.my_dossier() to authenticated;
grant execute on function public.open_dossier_from_request(uuid) to authenticated;
grant execute on function public.answer_info_request(uuid, text) to authenticated;

-- Vue d'ensemble des dossiers pour le poste de travail (administrateur seulement : liste vide sinon)
create or replace function public.dossier_overview()
returns table (
  id uuid, company text, contact_name text, email text, client_id uuid, offer text, status text,
  created_at timestamptz, updated_at timestamptz, answers jsonb, open_actions integer, late_actions integer,
  infos_pending integer, infos_answered integer, client_documents integer, deliverables integer
)
language sql
security definer
set search_path = public
stable
as $$
  select d.id, d.company, d.contact_name, d.email, d.client_id, d.offer, d.status, d.created_at, d.updated_at,
    coalesce((select jsonb_object_agg(a.question, a.answer) from public.dossier_answers a where a.dossier_id = d.id), '{}'::jsonb),
    (select count(*)::integer from public.dossier_actions x where x.dossier_id = d.id and x.status <> 'Terminé'),
    (select count(*)::integer from public.dossier_actions x where x.dossier_id = d.id and x.status <> 'Terminé' and x.due_date < current_date),
    (select count(*)::integer from public.dossier_info_requests x where x.dossier_id = d.id and x.status = 'À fournir'),
    (select count(*)::integer from public.dossier_info_requests x where x.dossier_id = d.id and x.status = 'Fourni'),
    (select count(*)::integer from public.dossier_documents x where x.dossier_id = d.id and x.kind = 'Client'),
    (select count(*)::integer from public.dossier_documents x where x.dossier_id = d.id and x.kind = 'Livrable')
  from public.dossiers d
  where public.is_admin()
  order by d.updated_at desc;
$$;
revoke all on function public.dossier_overview() from public, anon;
grant execute on function public.dossier_overview() to authenticated;

-- Reprise des données de la version précédente (outils de conformité rattachés au compte, sans dossier)
do $$
begin
  if to_regclass('public.compliance_answers') is not null and to_regclass('public.compliance_actions') is not null
     and to_regclass('public.rgpd_records') is not null and to_regclass('public.compliance_risks') is not null then
    insert into public.dossiers (client_id, email, company)
      select u.id, coalesce(u.email, ''), coalesce(s.company, '')
      from auth.users u left join public.settings s on s.user_id = u.id
      where u.id in (select user_id from public.compliance_answers union select user_id from public.compliance_actions
                     union select user_id from public.rgpd_records union select user_id from public.compliance_risks)
        and not exists (select 1 from public.dossiers d where d.client_id = u.id);
    insert into public.dossier_answers (dossier_id, question, answer, updated_at)
      select d.id, a.question, a.answer, a.updated_at from public.compliance_answers a join public.dossiers d on d.client_id = a.user_id
      on conflict do nothing;
    insert into public.dossier_actions (id, dossier_id, domain, title, owner, due_date, priority, status, source, created_at)
      select a.id, d.id, a.domain, a.title, a.owner, a.due_date, a.priority, a.status, a.source, a.created_at
      from public.compliance_actions a join public.dossiers d on d.client_id = a.user_id
      on conflict do nothing;
    insert into public.dossier_records (id, dossier_id, name, purpose, legal_basis, data_subjects, data_categories, sensitive, recipients, transfers, retention, security, created_at)
      select r.id, d.id, r.name, r.purpose, r.legal_basis, r.data_subjects, r.data_categories, r.sensitive, r.recipients, r.transfers, r.retention, r.security, r.created_at
      from public.rgpd_records r join public.dossiers d on d.client_id = r.user_id
      on conflict do nothing;
    insert into public.dossier_risks (id, dossier_id, domain, title, probability, impact, measure, status, created_at)
      select k.id, d.id, k.domain, k.title, k.probability, k.impact, k.measure, k.status, k.created_at
      from public.compliance_risks k join public.dossiers d on d.client_id = k.user_id
      on conflict do nothing;
    drop table public.compliance_answers, public.compliance_actions, public.rgpd_records, public.compliance_risks;
  end if;
end $$;

-- Espace de stockage privé des documents (10 Mo par fichier) et règles d'accès aux fichiers.
-- Lecture et dépôt : administrateur ou client du dossier. Suppression : administrateur.
create or replace function public.can_access_dossier_path(p text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (select 1 from public.dossiers d where d.id::text = split_part(p, '/', 1) and public.can_access_dossier(d.id));
$$;

do $$
begin
  insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  values ('dossiers', 'dossiers', false, 10485760, array[
    'application/pdf', 'image/png', 'image/jpeg', 'text/plain', 'text/csv',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.oasis.opendocument.text', 'application/vnd.oasis.opendocument.spreadsheet'
  ])
  on conflict (id) do nothing;
  drop policy if exists "dossiers : lecture" on storage.objects;
  create policy "dossiers : lecture" on storage.objects
    for select to authenticated using (bucket_id = 'dossiers' and public.can_access_dossier_path(name));
  drop policy if exists "dossiers : dépôt" on storage.objects;
  create policy "dossiers : dépôt" on storage.objects
    for insert to authenticated with check (bucket_id = 'dossiers' and public.can_access_dossier_path(name));
  drop policy if exists "dossiers : suppression" on storage.objects;
  create policy "dossiers : suppression" on storage.objects
    for delete to authenticated using (bucket_id = 'dossiers' and public.is_admin());
exception when others then
  raise warning 'Espace de stockage des documents non configuré (%). Relancez ce fichier dans Supabase.', sqlerrm;
end $$;

-- Dossiers d'auto-diagnostic dont le compte a été supprimé : effacés avec la purge de chaque nuit
create or replace function public.purge_old_requests()
returns integer
language sql
security definer
set search_path = public
as $$
  with d as (
    delete from public.diagnostic_requests where last_contact_at < now() - interval '3 years' returning 1
  ), o as (
    delete from public.dossiers x where x.status = 'Auto-diagnostic' and x.client_id is null
      and not exists (select 1 from public.dossier_documents doc where doc.dossier_id = x.id) returning 1
  )
  select ((select count(*) from d) + (select count(*) from o))::integer;
$$;
revoke all on function public.purge_old_requests() from public, anon, authenticated;

-- 10. Vous déclarer administrateur (à faire APRÈS avoir créé votre compte sur le site)
-- Remplacez l'e-mail puis exécutez cette ligne seule :
-- insert into public.admins (user_id) select id from auth.users where email = 'contact@equimarge.fr';
