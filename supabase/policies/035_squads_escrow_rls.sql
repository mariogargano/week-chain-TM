-- Row Level Security policies for Squads escrow system
-- Clients can only read their own data; writes are service-role only

-- Series: Public read, service-role write
ALTER TABLE series ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active series"
  ON series FOR SELECT
  USING (status = 'active');

CREATE POLICY "Service role can manage series"
  ON series FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Payments: Users can view their own, service-role can write
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT
  USING (
    user_wallet = current_setting('request.jwt.claims', true)::json->>'wallet'
    OR user_email = current_setting('request.jwt.claims', true)::json->>'email'
  );

CREATE POLICY "Service role can manage payments"
  ON payments FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Refunds: Users can view their own, service-role can write
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own refunds"
  ON refunds FOR SELECT
  USING (
    user_wallet = current_setting('request.jwt.claims', true)::json->>'wallet'
  );

CREATE POLICY "Service role can manage refunds"
  ON refunds FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Contracts: Users can view their own, service-role can write
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own contracts"
  ON contracts FOR SELECT
  USING (
    user_wallet = current_setting('request.jwt.claims', true)::json->>'wallet'
    OR user_email = current_setting('request.jwt.claims', true)::json->>'email'
  );

CREATE POLICY "Service role can manage contracts"
  ON contracts FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- NOM-151 certificates: Users can view their own, service-role can write
ALTER TABLE nom151_certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own certificates"
  ON nom151_certificates FOR SELECT
  USING (
    contract_id IN (
      SELECT id FROM contracts 
      WHERE user_wallet = current_setting('request.jwt.claims', true)::json->>'wallet'
    )
  );

CREATE POLICY "Service role can manage certificates"
  ON nom151_certificates FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- NFT mints: Users can view their own, service-role can write
ALTER TABLE nft_mints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own nft mints"
  ON nft_mints FOR SELECT
  USING (
    user_wallet = current_setting('request.jwt.claims', true)::json->>'wallet'
  );

CREATE POLICY "Service role can manage nft mints"
  ON nft_mints FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Legal acceptances: Users can view their own, anyone can insert
ALTER TABLE legal_acceptances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own acceptances"
  ON legal_acceptances FOR SELECT
  USING (
    user_wallet = current_setting('request.jwt.claims', true)::json->>'wallet'
  );

CREATE POLICY "Anyone can record acceptance"
  ON legal_acceptances FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can manage acceptances"
  ON legal_acceptances FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');
