-- =====================================================
-- WEEK-CHAIN™ - Sistema de Eventos de Webhooks
-- =====================================================
-- Descripción: Sistema completo para registrar, auditar y gestionar
--              eventos de webhooks de servicios externos
-- Fecha: Enero 2025
-- =====================================================

-- Tabla principal de eventos de webhooks
create table if not exists webhook_events (
  id uuid primary key default gen_random_uuid(),
  source text not null check (source in ('stripe', 'conekta', 'mifiel', 'solana', 'other')),
  event_id text not null,
  event_type text not null,
  payload jsonb not null,
  status text not null default 'pending' check (status in ('pending', 'processing', 'processed', 'failed', 'ignored')),
  error_message text,
  retry_count integer default 0,
  processed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  
  -- Metadata adicional
  ip_address inet,
  user_agent text,
  signature_valid boolean,
  
  -- Constraint para evitar duplicados
  constraint unique_webhook_event unique (source, event_id)
);

-- Índices para búsqueda rápida
create index if not exists idx_webhook_source on webhook_events(source);
create index if not exists idx_webhook_event_type on webhook_events(event_type);
create index if not exists idx_webhook_status on webhook_events(status);
create index if not exists idx_webhook_created_at on webhook_events(created_at desc);
create index if not exists idx_webhook_event_id on webhook_events(event_id);

-- Índice compuesto para consultas comunes
create index if not exists idx_webhook_source_status on webhook_events(source, status);

-- Trigger para actualizar updated_at
create or replace function update_webhook_events_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger webhook_events_updated_at
  before update on webhook_events
  for each row
  execute function update_webhook_events_updated_at();

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

alter table webhook_events enable row level security;

-- Solo admins pueden ver webhooks
create policy "Admins can view all webhook events"
  on webhook_events for select
  using (
    exists (
      select 1 from auth.users
      where auth.users.id = auth.uid()
      and auth.users.raw_user_meta_data->>'role' in ('admin', 'super_admin')
    )
  );

-- Sistema puede insertar webhooks
create policy "System can insert webhook events"
  on webhook_events for insert
  with check (true);

-- Sistema puede actualizar webhooks
create policy "System can update webhook events"
  on webhook_events for update
  using (true);

-- =====================================================
-- FUNCIONES HELPER
-- =====================================================

-- Función para registrar un webhook
create or replace function log_webhook_event(
  p_source text,
  p_event_id text,
  p_event_type text,
  p_payload jsonb,
  p_ip_address inet default null,
  p_user_agent text default null,
  p_signature_valid boolean default true
)
returns uuid as $$
declare
  v_webhook_id uuid;
begin
  insert into webhook_events (
    source,
    event_id,
    event_type,
    payload,
    ip_address,
    user_agent,
    signature_valid,
    status
  ) values (
    p_source,
    p_event_id,
    p_event_type,
    p_payload,
    p_ip_address,
    p_user_agent,
    p_signature_valid,
    'pending'
  )
  on conflict (source, event_id) do update
  set
    retry_count = webhook_events.retry_count + 1,
    updated_at = now()
  returning id into v_webhook_id;
  
  return v_webhook_id;
end;
$$ language plpgsql security definer;

-- Función para marcar webhook como procesado
create or replace function mark_webhook_processed(
  p_webhook_id uuid,
  p_success boolean default true,
  p_error_message text default null
)
returns void as $$
begin
  update webhook_events
  set
    status = case when p_success then 'processed' else 'failed' end,
    error_message = p_error_message,
    processed_at = now()
  where id = p_webhook_id;
end;
$$ language plpgsql security definer;

-- Función para obtener webhooks pendientes
create or replace function get_pending_webhooks(
  p_source text default null,
  p_limit integer default 100
)
returns table (
  id uuid,
  source text,
  event_id text,
  event_type text,
  payload jsonb,
  retry_count integer,
  created_at timestamptz
) as $$
begin
  return query
  select
    w.id,
    w.source,
    w.event_id,
    w.event_type,
    w.payload,
    w.retry_count,
    w.created_at
  from webhook_events w
  where
    w.status = 'pending'
    and (p_source is null or w.source = p_source)
    and w.retry_count < 5
  order by w.created_at asc
  limit p_limit;
end;
$$ language plpgsql security definer;

-- Función para limpiar webhooks antiguos
create or replace function cleanup_old_webhooks(
  p_days_old integer default 90
)
returns integer as $$
declare
  v_deleted_count integer;
begin
  delete from webhook_events
  where
    created_at < now() - (p_days_old || ' days')::interval
    and status in ('processed', 'ignored')
  returning count(*) into v_deleted_count;
  
  return v_deleted_count;
end;
$$ language plpgsql security definer;

-- =====================================================
-- VISTAS ÚTILES
-- =====================================================

-- Vista de estadísticas de webhooks
create or replace view webhook_stats as
select
  source,
  event_type,
  status,
  count(*) as total_events,
  avg(retry_count) as avg_retries,
  max(created_at) as last_event_at
from webhook_events
group by source, event_type, status;

-- Vista de webhooks fallidos recientes
create or replace view failed_webhooks_recent as
select
  id,
  source,
  event_id,
  event_type,
  error_message,
  retry_count,
  created_at
from webhook_events
where
  status = 'failed'
  and created_at > now() - interval '7 days'
order by created_at desc;

-- =====================================================
-- COMENTARIOS
-- =====================================================

comment on table webhook_events is 'Registro de todos los eventos de webhooks recibidos de servicios externos';
comment on column webhook_events.source is 'Origen del webhook: stripe, conekta, mifiel, solana, other';
comment on column webhook_events.event_id is 'ID único del evento proporcionado por el servicio externo';
comment on column webhook_events.event_type is 'Tipo de evento (ej: payment_intent.succeeded, charge.created)';
comment on column webhook_events.payload is 'Payload completo del webhook en formato JSON';
comment on column webhook_events.status is 'Estado del procesamiento: pending, processing, processed, failed, ignored';
comment on column webhook_events.signature_valid is 'Indica si la firma del webhook fue validada correctamente';
comment on column webhook_events.retry_count is 'Número de intentos de procesamiento';

comment on function log_webhook_event is 'Registra un nuevo evento de webhook en el sistema';
comment on function mark_webhook_processed is 'Marca un webhook como procesado o fallido';
comment on function get_pending_webhooks is 'Obtiene webhooks pendientes de procesar';
comment on function cleanup_old_webhooks is 'Limpia webhooks antiguos ya procesados';
