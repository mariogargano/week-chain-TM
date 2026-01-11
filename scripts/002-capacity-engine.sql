-- WEEK-CHAIN Capacity Engine Migration
-- Smart Vacational Certificates + Supply Pool

-- Enable extensions
create extension if not exists "uuid-ossp";

-- 1) Certificate Products (the ONLY products sold)
create table if not exists public.certificate_products (
  id uuid primary key default uuid_generate_v4(),
  tier text not null unique check (tier in ('silver','gold','platinum','signature','wedding')),
  display_name text not null,
  included_weeks_per_year integer not null,
  request_window_days integer not null,
  expected_usage_rate numeric(3,2) not null,
  price_usd numeric(10,2) not null,
  validity_years integer not null default 15,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Insert default certificate products
insert into public.certificate_products (tier, display_name, included_weeks_per_year, request_window_days, expected_usage_rate, price_usd)
values
  ('silver', 'WEEK Silver™', 1, 90, 0.55, 3500.00),
  ('gold', 'WEEK Gold™', 1, 180, 0.70, 6000.00),
  ('platinum', 'WEEK Platinum™', 2, 365, 0.80, 11500.00),
  ('signature', 'WEEK Signature™', 4, 365, 0.85, 21000.00),
  ('wedding', 'WEEK Wedding Card™', 1, 180, 0.70, 6000.00)
on conflict (tier) do nothing;

-- 2) User Certificates (what users own)
create table if not exists public.user_certificates (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  certificate_tier text not null references public.certificate_products(tier),
  order_id text null,
  start_date date not null default current_date,
  end_date date not null,
  status text not null default 'active' check (status in ('active','paused','expired','cancelled')),
  weeks_used_this_year integer not null default 0,
  year_start_date date not null default date_trunc('year', current_date)::date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_user_certs_user on public.user_certificates(user_id);
create index if not exists idx_user_certs_status on public.user_certificates(status);

-- 3) Supply Properties (internal supply pool, NOT products)
create table if not exists public.supply_properties (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  country text not null,
  city text not null,
  category text not null check (category in ('A','B','C')),
  max_occupancy integer not null default 6,
  weekly_cost_to_owner numeric(10,2) null,
  status text not null default 'active' check (status in ('active','offline','removed')),
  supply_weeks_per_year integer not null default 48,
  blackout_weeks integer not null default 4,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4) Reservation Requests (user initiates request)
create table if not exists public.reservation_requests (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id),
  certificate_id uuid not null references public.user_certificates(id),
  desired_start_date date not null,
  desired_end_date date not null,
  flexibility_days integer not null default 7,
  party_size integer not null default 2,
  destination_preference text null,
  status text not null default 'requested' check (status in ('requested','offered','confirmed','completed','cancelled','expired')),
  offered_property_id uuid null references public.supply_properties(id),
  offered_dates_start date null,
  offered_dates_end date null,
  offer_expires_at timestamptz null,
  confirmed_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_res_req_user on public.reservation_requests(user_id);
create index if not exists idx_res_req_status on public.reservation_requests(status);

-- 5) Confirmed Reservations (after user accepts offer)
create table if not exists public.confirmed_reservations (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id),
  certificate_id uuid not null references public.user_certificates(id),
  request_id uuid not null references public.reservation_requests(id),
  property_id uuid not null references public.supply_properties(id),
  check_in date not null,
  check_out date not null,
  party_size integer not null,
  status text not null default 'confirmed' check (status in ('confirmed','checked_in','completed','cancelled','reaccommodated')),
  confirmation_code text not null unique,
  check_in_instructions text null,
  special_requests text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_conf_res_user on public.confirmed_reservations(user_id);
create index if not exists idx_conf_res_property on public.confirmed_reservations(property_id);
create index if not exists idx_conf_res_dates on public.confirmed_reservations(check_in, check_out);

-- 6) Capacity Snapshots (for tracking and admin dashboard)
create table if not exists public.capacity_snapshots (
  id uuid primary key default uuid_generate_v4(),
  snapshot_date date not null default current_date,
  total_supply_weeks integer not null,
  safe_capacity integer not null,
  projected_demand numeric(10,2) not null,
  utilization_percentage numeric(5,2) not null,
  status text not null check (status in ('green','yellow','orange','red')),
  stop_sale_tiers text[] null,
  created_at timestamptz not null default now()
);

create index if not exists idx_cap_snap_date on public.capacity_snapshots(snapshot_date);

-- 7) Property Blackout Dates (maintenance periods)
create table if not exists public.property_blackouts (
  id uuid primary key default uuid_generate_v4(),
  property_id uuid not null references public.supply_properties(id),
  start_date date not null,
  end_date date not null,
  reason text null,
  created_at timestamptz not null default now()
);

-- Triggers for updated_at
drop trigger if exists trg_cert_products_updated on public.certificate_products;
create trigger trg_cert_products_updated before update on public.certificate_products
for each row execute procedure public.set_updated_at();

drop trigger if exists trg_user_certs_updated on public.user_certificates;
create trigger trg_user_certs_updated before update on public.user_certificates
for each row execute procedure public.set_updated_at();

drop trigger if exists trg_supply_props_updated on public.supply_properties;
create trigger trg_supply_props_updated before update on public.supply_properties
for each row execute procedure public.set_updated_at();

drop trigger if exists trg_res_req_updated on public.reservation_requests;
create trigger trg_res_req_updated before update on public.reservation_requests
for each row execute procedure public.set_updated_at();

drop trigger if exists trg_conf_res_updated on public.confirmed_reservations;
create trigger trg_conf_res_updated before update on public.confirmed_reservations
for each row execute procedure public.set_updated_at();
