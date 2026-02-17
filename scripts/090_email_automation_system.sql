-- ============================================
-- EMAIL AUTOMATION SYSTEM - DATABASE SCHEMA
-- WEEK-CHAIN Platform
-- ============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- EMAIL TEMPLATES TABLE
-- ============================================

create table email_templates (
  id uuid primary key default uuid_generate_v4(),
  
  -- Basic info
  name text not null,
  type text not null check (type in (
    'REQUEST_RECEIVED',
    'OFFER_SENT',
    'OFFER_ACCEPTED',
    'OFFER_EXPIRED',
    'OFFER_DECLINED',
    'PRE_ARRIVAL',
    'POST_CHECKOUT',
    'PAYMENT_CONFIRMATION',
    'CERTIFICATE_ISSUED',
    'OWNER_BOOKING_NOTIFICATION',
    'OWNER_PAYOUT_NOTIFICATION',
    'OWNER_NEW_REVIEW',
    'SYSTEM_ALERT'
  )),
  
  -- Content
  subject text not null,
  body_html text not null, -- Rendered HTML
  body_json jsonb not null, -- TipTap JSON format for editor
  
  -- Variables available for this template type
  variables text[] default '{}',
  
  -- Versioning
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  version integer not null default 1,
  is_active boolean default false, -- Only one active template per type
  
  -- Metadata
  description text,
  tags text[] default '{}',
  preview_text text, -- For email clients that show preview
  
  -- Audit
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  published_at timestamptz,
  
  -- Constraints
  constraint one_active_per_type unique (type, is_active) where (is_active = true)
);

-- Indexes
create index idx_email_templates_type on email_templates(type);
create index idx_email_templates_status on email_templates(status);
create index idx_email_templates_is_active on email_templates(is_active) where is_active = true;

-- ============================================
-- EMAIL LOGS TABLE
-- ============================================

create table email_logs (
  id uuid primary key default uuid_generate_v4(),
  
  -- Template reference
  template_id uuid references email_templates(id) on delete set null,
  template_type text not null, -- Denormalized for analytics
  
  -- Recipient
  recipient_email text not null,
  recipient_name text,
  user_id uuid references auth.users(id) on delete set null,
  
  -- Email content (snapshot at time of sending)
  subject text not null,
  body_html text not null,
  
  -- Sending
  sent_at timestamptz default now(),
  provider text default 'resend', -- resend | sendgrid | ses
  provider_message_id text, -- Resend message ID
  
  -- Tracking
  opened_at timestamptz,
  first_opened_at timestamptz,
  open_count integer default 0,
  
  clicked_at timestamptz,
  first_clicked_at timestamptz,
  click_count integer default 0,
  clicked_links text[] default '{}', -- URLs clicked
  
  bounced boolean default false,
  bounced_at timestamptz,
  bounce_type text, -- hard | soft | complaint
  bounce_reason text,
  
  unsubscribed boolean default false,
  unsubscribed_at timestamptz,
  
  -- Error handling
  failed boolean default false,
  error_message text,
  retry_count integer default 0,
  
  -- Context (what triggered this email)
  metadata jsonb default '{}'::jsonb, -- booking_id, certificate_id, etc.
  
  created_at timestamptz default now()
);

-- Indexes for fast queries
create index idx_email_logs_recipient on email_logs(recipient_email);
create index idx_email_logs_user_id on email_logs(user_id);
create index idx_email_logs_template_id on email_logs(template_id);
create index idx_email_logs_template_type on email_logs(template_type);
create index idx_email_logs_sent_at on email_logs(sent_at desc);
create index idx_email_logs_opened on email_logs(opened_at) where opened_at is not null;
create index idx_email_logs_clicked on email_logs(clicked_at) where clicked_at is not null;
create index idx_email_logs_bounced on email_logs(bounced) where bounced = true;
create index idx_email_logs_metadata on email_logs using gin(metadata);

-- ============================================
-- EMAIL ANALYTICS MATERIALIZED VIEW
-- For fast dashboard queries
-- ============================================

create materialized view email_analytics as
select
  template_type,
  date_trunc('day', sent_at) as date,
  count(*) as sent_count,
  count(*) filter (where opened_at is not null) as opened_count,
  count(*) filter (where clicked_at is not null) as clicked_count,
  count(*) filter (where bounced = true) as bounced_count,
  count(*) filter (where unsubscribed = true) as unsubscribed_count,
  round(
    (count(*) filter (where opened_at is not null))::numeric / 
    nullif(count(*), 0) * 100, 
    2
  ) as open_rate_pct,
  round(
    (count(*) filter (where clicked_at is not null))::numeric / 
    nullif(count(*), 0) * 100, 
    2
  ) as click_rate_pct,
  round(
    (count(*) filter (where bounced = true))::numeric / 
    nullif(count(*), 0) * 100, 
    2
  ) as bounce_rate_pct
from email_logs
where sent_at >= now() - interval '90 days'
group by template_type, date_trunc('day', sent_at);

-- Index for materialized view
create index idx_email_analytics_type_date on email_analytics(template_type, date desc);

-- Refresh function (call this hourly via pg_cron or manually)
create or replace function refresh_email_analytics()
returns void as $$
begin
  refresh materialized view concurrently email_analytics;
end;
$$ language plpgsql security definer;

-- ============================================
-- EMAIL UNSUBSCRIBES TABLE
-- ============================================

create table email_unsubscribes (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  user_id uuid references auth.users(id) on delete set null,
  reason text,
  unsubscribed_at timestamptz default now()
);

create index idx_email_unsubscribes_email on email_unsubscribes(email);

-- ============================================
-- TRIGGERS
-- ============================================

-- Update updated_at timestamp
create or replace function update_email_template_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_email_templates_updated_at 
  before update on email_templates
  for each row execute function update_email_template_updated_at();

-- Ensure only one active template per type
create or replace function enforce_one_active_template()
returns trigger as $$
begin
  if new.is_active = true then
    -- Deactivate all other templates of this type
    update email_templates
    set is_active = false
    where type = new.type
      and id != new.id
      and is_active = true;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger enforce_one_active_template_trigger
  before insert or update on email_templates
  for each row execute function enforce_one_active_template();

-- Set published_at when status changes to published
create or replace function set_published_at()
returns trigger as $$
begin
  if new.status = 'published' and (old is null or old.status != 'published') then
    new.published_at = now();
    new.is_active = true;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger set_published_at_trigger
  before update on email_templates
  for each row execute function set_published_at();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

alter table email_templates enable row level security;
alter table email_logs enable row level security;
alter table email_unsubscribes enable row level security;

-- Only admins can manage templates
create policy "Admins can view all templates"
  on email_templates for select
  using (is_corporativo_admin());

create policy "Admins can create templates"
  on email_templates for insert
  with check (is_corporativo_admin());

create policy "Admins can update templates"
  on email_templates for update
  using (is_corporativo_admin());

create policy "Admins can delete templates"
  on email_templates for delete
  using (is_corporativo_admin());

-- Email logs: Users can view their own, admins can view all
create policy "Users can view own email logs"
  on email_logs for select
  using (user_id = auth.uid() or is_corporativo_admin());

create policy "System can insert email logs"
  on email_logs for insert
  with check (true); -- Edge functions need to insert

-- Unsubscribes: Anyone can add, only admins can view all
create policy "Anyone can unsubscribe"
  on email_unsubscribes for insert
  with check (true);

create policy "Admins can view all unsubscribes"
  on email_unsubscribes for select
  using (is_corporativo_admin());

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Get active template for a type
create or replace function get_active_template(template_type text)
returns email_templates as $$
  select *
  from email_templates
  where type = template_type
    and is_active = true
    and status = 'published'
  limit 1;
$$ language sql security definer;

-- Check if email is unsubscribed
create or replace function is_email_unsubscribed(email_address text)
returns boolean as $$
  select exists(
    select 1 from email_unsubscribes where email = email_address
  );
$$ language sql security definer;

-- Get email analytics for specific template type
create or replace function get_email_analytics_for_type(
  template_type_param text,
  days_back integer default 30
)
returns table (
  date date,
  sent_count bigint,
  open_rate_pct numeric,
  click_rate_pct numeric,
  bounce_rate_pct numeric
) as $$
begin
  return query
  select
    date_trunc('day', el.sent_at)::date as date,
    count(*) as sent_count,
    round(
      (count(*) filter (where el.opened_at is not null))::numeric / 
      nullif(count(*), 0) * 100, 
      2
    ) as open_rate_pct,
    round(
      (count(*) filter (where el.clicked_at is not null))::numeric / 
      nullif(count(*), 0) * 100, 
      2
    ) as click_rate_pct,
    round(
      (count(*) filter (where el.bounced = true))::numeric / 
      nullif(count(*), 0) * 100, 
      2
    ) as bounce_rate_pct
  from email_logs el
  where el.template_type = template_type_param
    and el.sent_at >= now() - (days_back || ' days')::interval
  group by date_trunc('day', el.sent_at)
  order by date desc;
end;
$$ language plpgsql security definer;

-- ============================================
-- COMMENTS (Documentation)
-- ============================================

comment on table email_templates is 'Stores email templates with versioning and rich content';
comment on table email_logs is 'Logs every email sent with tracking metrics (opens, clicks, bounces)';
comment on table email_unsubscribes is 'Users who have unsubscribed from emails';
comment on materialized view email_analytics is 'Pre-aggregated email metrics for fast dashboard queries. Refresh hourly.';

comment on column email_templates.body_json is 'TipTap editor JSON format - allows re-editing in visual editor';
comment on column email_templates.body_html is 'Rendered HTML ready to send - generated from body_json';
comment on column email_templates.is_active is 'Only one template per type can be active (constraint enforced)';
comment on column email_logs.metadata is 'JSONB field storing context like booking_id, certificate_id, etc.';
comment on column email_logs.provider_message_id is 'Resend message ID for tracking and debugging';

-- ============================================
-- GRANTS (Permissions)
-- ============================================

-- Grant access to authenticated users (via RLS policies)
grant usage on schema public to authenticated;
grant select on email_templates to authenticated;
grant select on email_logs to authenticated;
grant insert on email_unsubscribes to authenticated;

-- Grant access to service role (for Edge Functions)
grant all on email_templates to service_role;
grant all on email_logs to service_role;
grant all on email_unsubscribes to service_role;
