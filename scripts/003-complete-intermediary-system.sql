-- =====================================================
-- WEEK-CHAIN INTERMEDIARY SYSTEM - COMPLETE SCHEMA
-- Purpose: Non-MLM, single-level commission system
-- Security: RLS enforced, admin-only modifications
-- =====================================================

-- Enable extensions
create extension if not exists "uuid-ossp";

-- =====================================================
-- TABLE 1: INTERMEDIARY PROFILES
-- Purpose: Store intermediary data (affiliates, brokers, agencies, wedding partners)
-- Risk mitigation: Prevents MLM by not having parent/child relationships
-- =====================================================
create table if not exists public.intermediary_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  role text not null check (role in ('affiliate','broker','agency','wedding_partner')),
  status text not null default 'active' check (status in ('active','suspended','banned')),
  agency_id uuid null references public.partner_agencies(id),
  
  -- Payout configuration
  payout_method jsonb null, -- {type: 'bank_transfer', details: {...}}
  
  -- Compliance & certification
  compliance_accepted_at timestamptz null,
  certification_approved_at timestamptz null,
  
  -- Unique referral code
  referral_code text not null unique,
  
  -- Audit timestamps
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =====================================================
-- TABLE 2: PARTNER AGENCIES
-- Purpose: Group intermediaries under legal entities
-- Risk mitigation: Allows batch payouts to registered businesses
-- =====================================================
create table if not exists public.partner_agencies (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  legal_entity text null, -- Company registration number
  payout_method jsonb null,
  status text not null default 'active' check (status in ('active','suspended','banned')),
  created_at timestamptz not null default now()
);

-- Add foreign key after partner_agencies exists
alter table public.intermediary_profiles
  add constraint fk_agency 
  foreign key (agency_id) 
  references public.partner_agencies(id)
  on delete set null;

-- =====================================================
-- TABLE 3: LEADS (Light CRM)
-- Purpose: Track referral pipeline from registration to purchase
-- Risk mitigation: Audit trail for all referrals
-- =====================================================
create table if not exists public.leads (
  id uuid primary key default uuid_generate_v4(),
  intermediary_id uuid null references public.intermediary_profiles(id) on delete set null,
  
  -- Lead data
  name text null,
  email text not null,
  phone text null,
  country text null,
  
  -- Status progression
  status text not null default 'registered' check (
    status in ('registered','kyc','checkout','paid','refunded','cancelled')
  ),
  
  -- Audit timestamps
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  
  unique(email)
);

-- =====================================================
-- TABLE 4: REFERRAL ATTRIBUTIONS
-- Purpose: 30-day attribution window for fair commission tracking
-- Risk mitigation: Prevents double-attribution and commission disputes
-- =====================================================
create table if not exists public.referral_attributions (
  id uuid primary key default uuid_generate_v4(),
  referral_code text not null,
  intermediary_id uuid not null references public.intermediary_profiles(id) on delete cascade,
  
  -- Attribution target (email before signup, user_id after)
  lead_email text null,
  lead_user_id uuid null references auth.users(id) on delete cascade,
  
  -- 30-day attribution window
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  
  -- Ensure only one attribution method is used
  constraint one_of_email_or_user check (
    (lead_email is not null and lead_user_id is null) OR
    (lead_email is null and lead_user_id is not null)
  )
);

create index idx_ref_attr_code on public.referral_attributions(referral_code);
create index idx_ref_attr_user on public.referral_attributions(lead_user_id);
create index idx_ref_attr_email on public.referral_attributions(lead_email);
create index idx_ref_attr_expires on public.referral_attributions(expires_at);

-- =====================================================
-- TABLE 5: COMMISSION RECORDS
-- Purpose: Track all commissions with anti-fraud hold period
-- Risk mitigation: 45-day hold prevents payout before refund window closes
-- =====================================================
create table if not exists public.commission_records (
  id uuid primary key default uuid_generate_v4(),
  intermediary_id uuid not null references public.intermediary_profiles(id) on delete restrict,
  buyer_user_id uuid not null references auth.users(id) on delete restrict,
  
  -- Sale information
  order_id text not null unique, -- Links to payment system
  certificate_tier text not null check (
    certificate_tier in ('silver','gold','platinum','signature','wedding')
  ),
  sale_amount numeric(12,2) not null check (sale_amount >= 0),
  
  -- Commission calculation
  commission_rate numeric(5,4) not null check (commission_rate >= 0 and commission_rate <= 0.20),
  commission_amount numeric(12,2) not null check (commission_amount >= 0),
  
  -- Status workflow: pending → approved → paid (or reversed)
  status text not null default 'pending' check (
    status in ('pending','approved','paid','reversed')
  ),
  
  -- Anti-fraud hold (45 days from purchase)
  hold_until timestamptz not null,
  
  -- Status timestamps
  approved_at timestamptz null,
  paid_at timestamptz null,
  reversed_at timestamptz null,
  
  created_at timestamptz not null default now()
);

create index idx_commission_intermediary on public.commission_records(intermediary_id);
create index idx_commission_status on public.commission_records(status);
create index idx_commission_hold on public.commission_records(hold_until);

-- =====================================================
-- TABLE 6: COMPLIANCE STRIKES
-- Purpose: Track violations and enforce platform rules
-- Risk mitigation: Prevents bad actors, protects brand reputation
-- =====================================================
create table if not exists public.compliance_strikes (
  id uuid primary key default uuid_generate_v4(),
  intermediary_id uuid not null references public.intermediary_profiles(id) on delete cascade,
  
  -- Strike details
  reason text not null,
  evidence_url text null,
  action_taken text not null default 'warning' check (
    action_taken in ('warning','suspend','ban')
  ),
  
  created_at timestamptz not null default now()
);

create index idx_strikes_intermediary on public.compliance_strikes(intermediary_id);

-- =====================================================
-- TABLE 7: COMMISSION RATES
-- Purpose: Centralized rate configuration by certificate tier
-- Risk mitigation: Prevents hardcoded rates, allows admin adjustment
-- =====================================================
create table if not exists public.commission_rates (
  id uuid primary key default uuid_generate_v4(),
  certificate_tier text not null unique check (
    certificate_tier in ('silver','gold','platinum','signature','wedding')
  ),
  default_rate numeric(5,4) not null check (default_rate >= 0 and default_rate <= 1),
  cap_rate numeric(5,4) not null default 0.1500 check (cap_rate >= 0 and cap_rate <= 1)
);

-- Insert default rates
insert into public.commission_rates (certificate_tier, default_rate, cap_rate)
values
 ('silver', 0.0800, 0.1500),      -- 8% commission
 ('gold', 0.1000, 0.1500),        -- 10% commission
 ('platinum', 0.1200, 0.1500),    -- 12% commission
 ('signature', 0.1500, 0.1500),   -- 15% commission (max)
 ('wedding', 0.1500, 0.1500)      -- 15% commission
on conflict (certificate_tier) do nothing;

-- =====================================================
-- TABLE 8: ADMIN USERS
-- Purpose: Define platform administrators with role-based access
-- Risk mitigation: Separate admin permissions from regular users
-- =====================================================
create table if not exists public.admin_users (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  role text not null check (
    role in ('super_admin','ops','finance','compliance','support')
  ),
  permissions jsonb not null default '[]'::jsonb,
  status text not null default 'active' check (status in ('active','suspended')),
  created_at timestamptz not null default now()
);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Auto-update updated_at timestamps
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Triggers for updated_at
drop trigger if exists trg_int_profiles_updated on public.intermediary_profiles;
create trigger trg_int_profiles_updated 
  before update on public.intermediary_profiles
  for each row execute procedure public.set_updated_at();

drop trigger if exists trg_leads_updated on public.leads;
create trigger trg_leads_updated 
  before update on public.leads
  for each row execute procedure public.set_updated_at();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
alter table public.intermediary_profiles enable row level security;
alter table public.partner_agencies enable row level security;
alter table public.leads enable row level security;
alter table public.referral_attributions enable row level security;
alter table public.commission_records enable row level security;
alter table public.compliance_strikes enable row level security;
alter table public.commission_rates enable row level security;
alter table public.admin_users enable row level security;

-- Helper function: Check if user is admin
create or replace function public.is_admin(user_uuid uuid)
returns boolean as $$
  select exists(
    select 1 from public.admin_users
    where user_id = user_uuid and status = 'active'
  );
$$ language sql security definer;

-- Helper function: Get intermediary_id for current user
create or replace function public.get_intermediary_id(user_uuid uuid)
returns uuid as $$
  select id from public.intermediary_profiles
  where user_id = user_uuid and status = 'active'
  limit 1;
$$ language sql security definer;

-- =========================
-- INTERMEDIARY_PROFILES RLS
-- =========================

-- Intermediaries can read their own profile
create policy "Intermediaries can view own profile"
  on public.intermediary_profiles for select
  using (auth.uid() = user_id);

-- Intermediaries can update their own payout_method
create policy "Intermediaries can update own payout"
  on public.intermediary_profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Admins can view all profiles
create policy "Admins can view all intermediary profiles"
  on public.intermediary_profiles for select
  using (public.is_admin(auth.uid()));

-- Admins can manage all profiles
create policy "Admins can manage intermediary profiles"
  on public.intermediary_profiles for all
  using (public.is_admin(auth.uid()));

-- =========================
-- LEADS RLS
-- =========================

-- Intermediaries can view only their leads
create policy "Intermediaries can view own leads"
  on public.leads for select
  using (intermediary_id = public.get_intermediary_id(auth.uid()));

-- Admins can view all leads
create policy "Admins can view all leads"
  on public.leads for select
  using (public.is_admin(auth.uid()));

-- Admins can manage leads
create policy "Admins can manage leads"
  on public.leads for all
  using (public.is_admin(auth.uid()));

-- =========================
-- REFERRAL_ATTRIBUTIONS RLS
-- =========================

-- Intermediaries can view their own attributions
create policy "Intermediaries can view own attributions"
  on public.referral_attributions for select
  using (intermediary_id = public.get_intermediary_id(auth.uid()));

-- Admins can view all attributions
create policy "Admins can view all attributions"
  on public.referral_attributions for select
  using (public.is_admin(auth.uid()));

-- Only system (service role) can create/modify attributions
-- Intermediaries CANNOT create their own attributions

-- =========================
-- COMMISSION_RECORDS RLS
-- =========================

-- Intermediaries can view only their commissions
create policy "Intermediaries can view own commissions"
  on public.commission_records for select
  using (intermediary_id = public.get_intermediary_id(auth.uid()));

-- Admins can view all commissions
create policy "Admins can view all commissions"
  on public.commission_records for select
  using (public.is_admin(auth.uid()));

-- Only admins can modify commission status
create policy "Admins can manage commissions"
  on public.commission_records for all
  using (public.is_admin(auth.uid()));

-- =========================
-- COMPLIANCE_STRIKES RLS
-- =========================

-- Intermediaries can view their own strikes
create policy "Intermediaries can view own strikes"
  on public.compliance_strikes for select
  using (intermediary_id = public.get_intermediary_id(auth.uid()));

-- Only admins can create/view all strikes
create policy "Admins can manage strikes"
  on public.compliance_strikes for all
  using (public.is_admin(auth.uid()));

-- =========================
-- COMMISSION_RATES RLS
-- =========================

-- Everyone can read commission rates (public info)
create policy "Public can read commission rates"
  on public.commission_rates for select
  using (true);

-- Only admins can modify rates
create policy "Admins can manage commission rates"
  on public.commission_rates for all
  using (public.is_admin(auth.uid()));

-- =========================
-- ADMIN_USERS RLS
-- =========================

-- Only super_admins can view admin users
create policy "Super admins can view admin users"
  on public.admin_users for select
  using (
    exists(
      select 1 from public.admin_users
      where user_id = auth.uid() and role = 'super_admin' and status = 'active'
    )
  );

-- Only super_admins can manage admin users
create policy "Super admins can manage admin users"
  on public.admin_users for all
  using (
    exists(
      select 1 from public.admin_users
      where user_id = auth.uid() and role = 'super_admin' and status = 'active'
    )
  );

-- =====================================================
-- AUDIT LOG
-- =====================================================
comment on table public.intermediary_profiles is 'Non-MLM intermediary system - single level commissions only';
comment on table public.commission_records is 'Commission tracking with 45-day anti-fraud hold';
comment on table public.referral_attributions is '30-day attribution window for fair tracking';
comment on table public.compliance_strikes is 'Platform rule enforcement and bad actor prevention';
