-- Schéma de départ pour Supabase (à exécuter dans SQL Editor).
-- Créez d'abord un utilisateur administrateur dans Authentication.
create table if not exists public.platforms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  promo_code text not null default '',
  signup_url text not null default '',
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create table if not exists public.site_links (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  url text not null,
  link_type text not null default 'Autre',
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create table if not exists public.site_settings (
  id integer primary key default 1 check (id = 1),
  audio_url text not null default '',
  welcome_text text not null default 'Écoutez le message vocal avant de nous contacter.',
  updated_at timestamptz not null default now()
);
insert into public.site_settings(id) values (1) on conflict (id) do nothing;

alter table public.platforms enable row level security;
alter table public.site_links enable row level security;
alter table public.site_settings enable row level security;

-- Lecture publique des plateformes/liens actifs et du message vocal.
create policy "Public reads active platforms" on public.platforms for select using (is_active = true);
create policy "Public reads active links" on public.site_links for select using (is_active = true);
create policy "Public reads site settings" on public.site_settings for select using (true);

-- Écriture réservée aux utilisateurs authentifiés. Pour une sécurité renforcée,
-- restreignez ces politiques à un rôle admin dédié avant la mise en production.
create policy "Authenticated manages platforms" on public.platforms for all to authenticated using (true) with check (true);
create policy "Authenticated manages links" on public.site_links for all to authenticated using (true) with check (true);
create policy "Authenticated manages settings" on public.site_settings for all to authenticated using (true) with check (true);
