-- WEEK-CHAIN Intermediary System Migration
-- Single-level commission model (NO MLM)

-- Enable extensions if needed
create extension if not exists "uuid-ossp";

-- 1) Intermediary Profile
create table if not exists public.intermediary_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  role text not null check (role in ('affiliate','broker','agency','wedding_partner')),
  status text not null default 'active' check (status in ('active','suspended','banned')),
  agency_id uuid null,
  payout_method jsonb null,
  compliance_accepted_at timestamptz null,
  certification_approved_at timestamptz null,
  referral_code text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2) Agencies (optional)
create table if not exists public.partner_agencies (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  legal_entity text null,
  payout_method jsonb null,
  status text not null default 'active' check (status in ('active','suspended','banned')),
  created_at timestamptz not null default now()
);

alter table public.intermediary_profiles
  add constraint fk_agency foreign key (agency_id) references public.partner_agencies(id);

-- 3) Lead (light CRM)
create table if not exists public.leads (
  id uuid primary key default uuid_generate_v4(),
  intermediary_id uuid null references public.intermediary_profiles(id),
  name text null,
  email text not null,
  phone text null,
  country text null,
  status text not null default 'registered' check (status in ('registered','kyc','checkout','paid','refunded','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(email)
);

-- 4) Referral Attribution (30-day attribution)
create table if not exists public.referral_attributions (
  id uuid primary key default uuid_generate_v4(),
  referral_code text not null,
  intermediary_id uuid not null references public.intermediary_profiles(id),
  lead_email text null,
  lead_user_id uuid null references auth.users(id),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  constraint one_of_email_or_user check (
    (lead_email is not null and lead_user_id is null) OR
    (lead_email is null and lead_user_id is not null)
  )
);

create index if not exists idx_ref_attr_code on public.referral_attributions(referral_code);
create index if not exists idx_ref_attr_user on public.referral_attributions(lead_user_id);
create index if not exists idx_ref_attr_email on public.referral_attributions(lead_email);

-- 5) Commission Records
create table if not exists public.commission_records (
  id uuid primary key default uuid_generate_v4(),
  intermediary_id uuid not null references public.intermediary_profiles(id),
  buyer_user_id uuid not null references auth.users(id),
  order_id text not null,
  certificate_tier text not null check (certificate_tier in ('silver','gold','platinum','signature','wedding')),
  sale_amount numeric(12,2) not null check (sale_amount >= 0),
  commission_rate numeric(5,4) not null check (commission_rate >= 0 and commission_rate <= 0.20),
  commission_amount numeric(12,2) not null check (commission_amount >= 0),
  status text not null default 'pending' check (status in ('pending','approved','paid','reversed')),
  hold_until timestamptz not null,
  approved_at timestamptz null,
  paid_at timestamptz null,
  reversed_at timestamptz null,
  created_at timestamptz not null default now(),
  unique(order_id)
);

-- 6) Compliance strikes
create table if not exists public.compliance_strikes (
  id uuid primary key default uuid_generate_v4(),
  intermediary_id uuid not null references public.intermediary_profiles(id),
  reason text not null,
  evidence_url text null,
  action_taken text not null default 'warning' check (action_taken in ('warning','suspend','ban')),
  created_at timestamptz not null default now()
);

-- 7) Commission rates table (editable without code changes)
create table if not exists public.commission_rates (
  id uuid primary key default uuid_generate_v4(),
  certificate_tier text not null unique check (certificate_tier in ('silver','gold','platinum','signature','wedding')),
  default_rate numeric(5,4) not null,
  cap_rate numeric(5,4) not null default 0.1500
);

insert into public.commission_rates (certificate_tier, default_rate, cap_rate)
values
 ('silver', 0.0800, 0.1500),
 ('gold', 0.1000, 0.1500),
 ('platinum', 0.1200, 0.1500),
 ('signature', 0.1500, 0.1500),
 ('wedding', 0.1500, 0.1500)
on conflict (certificate_tier) do nothing;

-- updated_at helper
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_int_profiles_updated on public.intermediary_profiles;
create trigger trg_int_profiles_updated before update on public.intermediary_profiles
for each row execute procedure public.set_updated_at();

drop trigger if exists trg_leads_updated on public.leads;
create trigger trg_leads_updated before update on public.leads
for each row execute procedure public.set_updated_at();
