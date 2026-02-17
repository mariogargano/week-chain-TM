-- Tabla para préstamos VA-FI (usando NFTs como colateral)
CREATE TABLE IF NOT EXISTS vafi_loans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  borrower_wallet TEXT NOT NULL,
  nft_token_id UUID NOT NULL REFERENCES weeks(id),
  collateral_nft_address TEXT NOT NULL,
  loan_amount_usdc NUMERIC(20, 6) NOT NULL,
  ltv_ratio NUMERIC(5, 2) NOT NULL, -- Loan-to-Value ratio (50%, 40%, 30%)
  interest_rate NUMERIC(5, 2) NOT NULL DEFAULT 8.00,
  season TEXT NOT NULL, -- high, medium, low
  status TEXT NOT NULL DEFAULT 'active', -- active, repaid, liquidated
  liquidation_threshold NUMERIC(5, 2) NOT NULL DEFAULT 80.00,
  health_factor NUMERIC(10, 4) NOT NULL DEFAULT 1.0000,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  repaid_at TIMESTAMP WITH TIME ZONE,
  liquidated_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Tabla para pagos de préstamos VA-FI
CREATE TABLE IF NOT EXISTS vafi_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id UUID NOT NULL REFERENCES vafi_loans(id),
  amount_usdc NUMERIC(20, 6) NOT NULL,
  payment_type TEXT NOT NULL, -- principal, interest, full_repayment
  transaction_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Tabla para liquidaciones VA-FI
CREATE TABLE IF NOT EXISTS vafi_liquidations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id UUID NOT NULL REFERENCES vafi_loans(id),
  liquidator_wallet TEXT NOT NULL,
  collateral_value_usdc NUMERIC(20, 6) NOT NULL,
  debt_amount_usdc NUMERIC(20, 6) NOT NULL,
  liquidation_bonus NUMERIC(5, 2) NOT NULL DEFAULT 5.00,
  transaction_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_vafi_loans_borrower ON vafi_loans(borrower_wallet);
CREATE INDEX IF NOT EXISTS idx_vafi_loans_status ON vafi_loans(status);
CREATE INDEX IF NOT EXISTS idx_vafi_loans_nft ON vafi_loans(nft_token_id);
CREATE INDEX IF NOT EXISTS idx_vafi_payments_loan ON vafi_payments(loan_id);

-- Comentarios
COMMENT ON TABLE vafi_loans IS 'Préstamos VA-FI usando NFT-Semanas como colateral';
COMMENT ON TABLE vafi_payments IS 'Pagos realizados en préstamos VA-FI';
COMMENT ON TABLE vafi_liquidations IS 'Liquidaciones de préstamos VA-FI';
