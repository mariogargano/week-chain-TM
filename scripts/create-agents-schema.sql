-- WEEK-CHAIN Virtual Office - Agent System Schema
-- Este schema almacena conversaciones, logs y metricas de los agentes de IA

-- Tabla de conversaciones de agentes
CREATE TABLE IF NOT EXISTS agent_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_type TEXT NOT NULL CHECK (agent_type IN ('support', 'sales', 'legal', 'marketing', 'finance')),
  channel TEXT NOT NULL CHECK (channel IN ('admin_panel', 'whatsapp', 'email')),
  user_id UUID REFERENCES profiles(id),
  external_contact TEXT, -- Para WhatsApp/Email de externos
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'escalated', 'pending_review')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  subject TEXT,
  summary TEXT,
  requires_human_review BOOLEAN DEFAULT FALSE,
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mensajes de las conversaciones
CREATE TABLE IF NOT EXISTS agent_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES agent_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system', 'tool')),
  content TEXT NOT NULL,
  tool_calls JSONB,
  tool_results JSONB,
  tokens_used INTEGER,
  model_used TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Acciones pendientes de aprobacion
CREATE TABLE IF NOT EXISTS agent_pending_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES agent_conversations(id) ON DELETE CASCADE,
  agent_type TEXT NOT NULL,
  action_type TEXT NOT NULL, -- 'send_email', 'process_refund', 'update_record', etc.
  action_data JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
  created_by_agent TEXT NOT NULL,
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Metricas y KPIs de agentes
CREATE TABLE IF NOT EXISTS agent_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_type TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  conversations_total INTEGER DEFAULT 0,
  conversations_resolved INTEGER DEFAULT 0,
  conversations_escalated INTEGER DEFAULT 0,
  avg_response_time_seconds INTEGER,
  avg_resolution_time_seconds INTEGER,
  total_tokens_used INTEGER DEFAULT 0,
  satisfaction_score DECIMAL(3,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(agent_type, date)
);

-- Notificaciones del sistema de agentes
CREATE TABLE IF NOT EXISTS agent_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID REFERENCES profiles(id),
  type TEXT NOT NULL CHECK (type IN ('escalation', 'pending_action', 'daily_report', 'alert')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  agent_type TEXT,
  conversation_id UUID REFERENCES agent_conversations(id),
  action_id UUID REFERENCES agent_pending_actions(id),
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Templates de respuestas por agente
CREATE TABLE IF NOT EXISTS agent_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_type TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT,
  content TEXT NOT NULL,
  variables JSONB DEFAULT '[]', -- Variables que se pueden reemplazar
  is_active BOOLEAN DEFAULT TRUE,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indices para performance
CREATE INDEX IF NOT EXISTS idx_agent_conversations_type ON agent_conversations(agent_type);
CREATE INDEX IF NOT EXISTS idx_agent_conversations_status ON agent_conversations(status);
CREATE INDEX IF NOT EXISTS idx_agent_conversations_channel ON agent_conversations(channel);
CREATE INDEX IF NOT EXISTS idx_agent_conversations_created ON agent_conversations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_messages_conversation ON agent_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_agent_pending_actions_status ON agent_pending_actions(status);
CREATE INDEX IF NOT EXISTS idx_agent_notifications_recipient ON agent_notifications(recipient_id, is_read);
CREATE INDEX IF NOT EXISTS idx_agent_metrics_date ON agent_metrics(date DESC);

-- RLS Policies
ALTER TABLE agent_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_pending_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_templates ENABLE ROW LEVEL SECURITY;

-- Admins pueden ver todo
CREATE POLICY "Admins full access to conversations" ON agent_conversations
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins full access to messages" ON agent_messages
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins full access to pending actions" ON agent_pending_actions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can see their notifications" ON agent_notifications
  FOR SELECT USING (recipient_id = auth.uid());

CREATE POLICY "Admins full access to notifications" ON agent_notifications
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can view metrics" ON agent_metrics
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can manage templates" ON agent_templates
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
