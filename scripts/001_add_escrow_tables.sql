-- Tabla para gestionar depósitos USDC en escrow multisig
CREATE TABLE IF NOT EXISTS escrow_deposits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_wallet TEXT NOT NULL,
  amount_usdc NUMERIC(20, 6) NOT NULL,
  escrow_address TEXT NOT NULL,
  transaction_hash TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, confirmed, refunded
  multisig_signatures JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  refunded_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Tabla para saldo WEEK interno de usuarios
CREATE TABLE IF NOT EXISTS week_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_wallet TEXT NOT NULL UNIQUE,
  balance_week NUMERIC(20, 6) NOT NULL DEFAULT 0,
  total_deposited_usdc NUMERIC(20, 6) NOT NULL DEFAULT 0,
  total_spent_week NUMERIC(20, 6) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para transacciones de saldo WEEK
CREATE TABLE IF NOT EXISTS week_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_wallet TEXT NOT NULL,
  type TEXT NOT NULL, -- deposit, spend, refund, transfer
  amount_week NUMERIC(20, 6) NOT NULL,
  amount_usdc NUMERIC(20, 6),
  reference_id UUID, -- ID de reserva, depósito, etc.
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Índices para mejor performance
CREATE INDEX IF NOT EXISTS idx_escrow_deposits_user_wallet ON escrow_deposits(user_wallet);
CREATE INDEX IF NOT EXISTS idx_escrow_deposits_status ON escrow_deposits(status);
CREATE INDEX IF NOT EXISTS idx_week_balances_user_wallet ON week_balances(user_wallet);
CREATE INDEX IF NOT EXISTS idx_week_transactions_user_wallet ON week_transactions(user_wallet);
CREATE INDEX IF NOT EXISTS idx_week_transactions_type ON week_transactions(type);

-- Comentarios para documentación
COMMENT ON TABLE escrow_deposits IS 'Depósitos USDC en escrow multisig para compra de semanas';
COMMENT ON TABLE week_balances IS 'Saldo interno WEEK de cada usuario para reservar semanas';
COMMENT ON TABLE week_transactions IS 'Historial de transacciones de saldo WEEK';
