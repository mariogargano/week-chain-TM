-- DeFi Loans System for NFT Collateralization
-- Allows users to use their WEEK NFTs as collateral for loans

-- Loans table
create table if not exists loans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nft_mint text not null,
  principal numeric(12,2) not null check (principal > 0),
  apr numeric(5,2) not null check (apr >= 0 and apr <= 100),
  ltv numeric(5,2) not null check (ltv >= 0 and ltv <= 100),
  due_date timestamptz not null,
  status text not null check (status in ('draft','signed','funded','repaid','default')),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  funded_at timestamptz,
  repaid_at timestamptz
);

-- Collaterals table
create table if not exists collaterals (
  id uuid primary key default gen_random_uuid(),
  loan_id uuid not null references loans(id) on delete cascade,
  vault_address text not null,
  frozen boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes for performance
create index if not exists idx_loans_user_id on loans(user_id);
create index if not exists idx_loans_status on loans(status);
create index if not exists idx_loans_due_date on loans(due_date);
create index if not exists idx_collaterals_loan_id on collaterals(loan_id);
create index if not exists idx_collaterals_vault on collaterals(vault_address);

-- RLS Policies
alter table loans enable row level security;
alter table collaterals enable row level security;

-- Users can read their own loans
create policy user_reads_own_loans on loans
  for select using (auth.uid() = user_id);

-- Users can create their own loans
create policy user_creates_own_loans on loans
  for insert with check (auth.uid() = user_id);

-- Users can update their own draft loans
create policy user_updates_own_draft_loans on loans
  for update using (auth.uid() = user_id and status = 'draft');

-- Users can read collaterals for their loans
create policy user_reads_own_collaterals on collaterals
  for select using (
    exists (
      select 1 from loans 
      where loans.id = collaterals.loan_id 
      and loans.user_id = auth.uid()
    )
  );

-- Only service role can manage collaterals (backend only)
create policy service_manages_collaterals on collaterals
  for all using (auth.jwt()->>'role' = 'service_role');

-- Function to calculate loan interest
create or replace function calculate_loan_interest(
  p_principal numeric,
  p_apr numeric,
  p_days integer
) returns numeric language sql as $$
  select round(p_principal * (p_apr / 100) * (p_days / 365.0), 2);
$$;

-- Function to check if loan is overdue
create or replace function is_loan_overdue(p_loan_id uuid)
returns boolean language sql as $$
  select due_date < now() and status not in ('repaid', 'default')
  from loans where id = p_loan_id;
$$;

-- Trigger to update updated_at timestamp
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_loans_updated_at
  before update on loans
  for each row execute function update_updated_at();

create trigger trg_collaterals_updated_at
  before update on collaterals
  for each row execute function update_updated_at();

-- Trigger to set funded_at when status changes to funded
create or replace function set_funded_at()
returns trigger language plpgsql as $$
begin
  if new.status = 'funded' and old.status != 'funded' then
    new.funded_at = now();
  end if;
  if new.status = 'repaid' and old.status != 'repaid' then
    new.repaid_at = now();
  end if;
  return new;
end;
$$;

create trigger trg_loans_set_timestamps
  before update on loans
  for each row execute function set_funded_at();

-- Trigger to prevent unfreezing collateral while loan is active
create or replace function prevent_unfreeze_active_loan()
returns trigger language plpgsql as $$
begin
  if new.frozen = false and old.frozen = true then
    if exists (
      select 1 from loans 
      where id = new.loan_id 
      and status in ('signed', 'funded')
    ) then
      raise exception 'Cannot unfreeze collateral while loan is active';
    end if;
  end if;
  return new;
end;
$$;

create trigger trg_prevent_unfreeze_active_loan
  before update on collaterals
  for each row execute function prevent_unfreeze_active_loan();

-- Comments
comment on table loans is 'DeFi loans using WEEK NFTs as collateral';
comment on table collaterals is 'NFT collateral locked in vaults for loans';
comment on column loans.principal is 'Loan amount in USD';
comment on column loans.apr is 'Annual Percentage Rate';
comment on column loans.ltv is 'Loan-to-Value ratio percentage';
comment on column collaterals.frozen is 'Whether the NFT is frozen in the vault';
