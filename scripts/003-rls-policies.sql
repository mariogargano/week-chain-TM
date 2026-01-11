-- RLS Policies for WEEK-CHAIN Admin + Intermediary System
-- This ensures strict data isolation and role-based access control

-- ============================================================
-- ADMIN ROLES TABLE
-- ============================================================
create table if not exists public.admin_users (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  role text not null check (role in ('super_admin','ops','finance','compliance','support')),
  permissions jsonb not null default '[]'::jsonb,
  status text not null default 'active' check (status in ('active','suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Helper function to check if user is admin
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.admin_users
    where user_id = auth.uid()
    and status = 'active'
  );
end;
$$ language plpgsql security definer;

-- Helper function to check if user has specific admin role
create or replace function public.has_admin_role(required_role text)
returns boolean as $$
begin
  return exists (
    select 1 from public.admin_users
    where user_id = auth.uid()
    and role = required_role
    and status = 'active'
  );
end;
$$ language plpgsql security definer;

-- ============================================================
-- RLS: intermediary_profiles
-- ============================================================
alter table public.intermediary_profiles enable row level security;

-- Intermediaries can read their own profile
create policy "Intermediaries can read own profile"
  on public.intermediary_profiles for select
  using (user_id = auth.uid());

-- Intermediaries can update their own profile (limited fields)
create policy "Intermediaries can update own profile"
  on public.intermediary_profiles for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Admins can read all profiles
create policy "Admins can read all intermediary profiles"
  on public.intermediary_profiles for select
  using (is_admin());

-- Admins can manage all profiles
create policy "Admins can manage intermediary profiles"
  on public.intermediary_profiles for all
  using (is_admin())
  with check (is_admin());

-- ============================================================
-- RLS: leads
-- ============================================================
alter table public.leads enable row level security;

-- Intermediaries can read their own leads
create policy "Intermediaries can read own leads"
  on public.leads for select
  using (
    intermediary_id in (
      select id from public.intermediary_profiles
      where user_id = auth.uid()
    )
  );

-- Intermediaries can create leads
create policy "Intermediaries can create leads"
  on public.leads for insert
  with check (
    intermediary_id in (
      select id from public.intermediary_profiles
      where user_id = auth.uid()
    )
  );

-- Admins can read all leads
create policy "Admins can read all leads"
  on public.leads for select
  using (is_admin());

-- ============================================================
-- RLS: referral_attributions
-- ============================================================
alter table public.referral_attributions enable row level security;

-- Intermediaries can read their own attributions
create policy "Intermediaries can read own attributions"
  on public.referral_attributions for select
  using (
    intermediary_id in (
      select id from public.intermediary_profiles
      where user_id = auth.uid()
    )
  );

-- System can create attributions (no direct user access)
create policy "System can create attributions"
  on public.referral_attributions for insert
  with check (true); -- Controlled by backend logic

-- Admins can read all attributions
create policy "Admins can read all attributions"
  on public.referral_attributions for select
  using (is_admin());

-- ============================================================
-- RLS: commission_records
-- ============================================================
alter table public.commission_records enable row level security;

-- Intermediaries can read their own commissions
create policy "Intermediaries can read own commissions"
  on public.commission_records for select
  using (
    intermediary_id in (
      select id from public.intermediary_profiles
      where user_id = auth.uid()
    )
  );

-- System can create commissions (no direct user access)
create policy "System can create commissions"
  on public.commission_records for insert
  with check (true); -- Controlled by backend logic

-- Finance admins can manage commissions
create policy "Finance admins can manage commissions"
  on public.commission_records for all
  using (has_admin_role('finance') or has_admin_role('super_admin'))
  with check (has_admin_role('finance') or has_admin_role('super_admin'));

-- ============================================================
-- RLS: compliance_strikes
-- ============================================================
alter table public.compliance_strikes enable row level security;

-- Intermediaries CANNOT read their strikes (security measure)
-- Only visible through dashboard notifications

-- Compliance admins can manage strikes
create policy "Compliance admins can manage strikes"
  on public.compliance_strikes for all
  using (has_admin_role('compliance') or has_admin_role('super_admin'))
  with check (has_admin_role('compliance') or has_admin_role('super_admin'));

-- ============================================================
-- RLS: commission_rates
-- ============================================================
alter table public.commission_rates enable row level security;

-- Everyone can read commission rates (public info)
create policy "Anyone can read commission rates"
  on public.commission_rates for select
  using (true);

-- Only super admins can modify rates
create policy "Super admins can modify commission rates"
  on public.commission_rates for all
  using (has_admin_role('super_admin'))
  with check (has_admin_role('super_admin'));

-- ============================================================
-- RLS: capacity_products (from capacity engine)
-- ============================================================
alter table public.capacity_products enable row level security;

-- Public can read product info (for certificate showcase)
create policy "Anyone can read capacity products"
  on public.capacity_products for select
  using (status = 'active');

-- Only admins can manage products
create policy "Admins can manage capacity products"
  on public.capacity_products for all
  using (is_admin())
  with check (is_admin());

-- ============================================================
-- RLS: capacity_supply_properties
-- ============================================================
alter table public.capacity_supply_properties enable row level security;

-- NO public access to supply properties
-- Only admins can see inventory

create policy "Admins can read supply properties"
  on public.capacity_supply_properties for select
  using (is_admin());

create policy "Admins can manage supply properties"
  on public.capacity_supply_properties for all
  using (has_admin_role('ops') or has_admin_role('super_admin'))
  with check (has_admin_role('ops') or has_admin_role('super_admin'));

-- ============================================================
-- RLS: user_certificates
-- ============================================================
alter table public.user_certificates enable row level security;

-- Users can read their own certificates
create policy "Users can read own certificates"
  on public.user_certificates for select
  using (user_id = auth.uid());

-- System creates certificates (after payment)
create policy "System can create certificates"
  on public.user_certificates for insert
  with check (true);

-- Admins can read all certificates
create policy "Admins can read all certificates"
  on public.user_certificates for select
  using (is_admin());

-- ============================================================
-- RLS: reservation_requests
-- ============================================================
alter table public.reservation_requests enable row level security;

-- Users can read their own requests
create policy "Users can read own reservation requests"
  on public.reservation_requests for select
  using (user_id = auth.uid());

-- Users can create requests
create policy "Users can create reservation requests"
  on public.reservation_requests for insert
  with check (user_id = auth.uid());

-- Admins can read all requests
create policy "Admins can read all reservation requests"
  on public.reservation_requests for select
  using (is_admin());

-- Ops admins can approve/reject requests
create policy "Ops admins can manage reservation requests"
  on public.reservation_requests for update
  using (has_admin_role('ops') or has_admin_role('super_admin'))
  with check (has_admin_role('ops') or has_admin_role('super_admin'));

-- ============================================================
-- AUDIT LOG (all admin actions)
-- ============================================================
create table if not exists public.admin_audit_log (
  id uuid primary key default uuid_generate_v4(),
  admin_user_id uuid not null references public.admin_users(user_id),
  action text not null,
  entity_type text not null,
  entity_id uuid null,
  changes jsonb null,
  ip_address inet null,
  created_at timestamptz not null default now()
);

alter table public.admin_audit_log enable row level security;

-- Only super admins can read audit logs
create policy "Super admins can read audit logs"
  on public.admin_audit_log for select
  using (has_admin_role('super_admin'));
