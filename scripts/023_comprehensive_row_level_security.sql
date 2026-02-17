-- =====================================================
-- COMPREHENSIVE ROW LEVEL SECURITY (RLS) IMPLEMENTATION
-- =====================================================
-- Implementa políticas RLS para todas las tablas sensibles
-- que aún no tienen protección de seguridad a nivel de fila
-- 
-- Cumplimiento: LFPDPPP, NOM-151-SCFI-2016, GDPR
-- Fecha: 2025-01-29
-- =====================================================

-- =====================================================
-- 1. TABLAS DE ESCROW Y BALANCES
-- =====================================================

-- Escrow Deposits: Solo usuarios ven sus propios depósitos
ALTER TABLE escrow_deposits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own escrow deposits"
ON escrow_deposits FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all escrow deposits"
ON escrow_deposits FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

-- Week Balances: Solo usuarios ven sus propios balances
ALTER TABLE week_balances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own week balances"
ON week_balances FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all week balances"
ON week_balances FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

-- Week Transactions: Solo usuarios ven sus propias transacciones
ALTER TABLE week_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own week transactions"
ON week_transactions FOR SELECT
USING (
  auth.uid() = from_user_id 
  OR auth.uid() = to_user_id
);

CREATE POLICY "Service role can manage all week transactions"
ON week_transactions FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

-- =====================================================
-- 2. TABLAS DE VAFI (PRÉSTAMOS)
-- =====================================================

-- VAFI Payments: Solo usuarios ven sus propios pagos
ALTER TABLE vafi_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own vafi payments"
ON vafi_payments FOR SELECT
USING (
  loan_id IN (
    SELECT id FROM vafi_loans WHERE borrower_id = auth.uid()
  )
);

CREATE POLICY "Service role can manage all vafi payments"
ON vafi_payments FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

-- VAFI Liquidations: Solo usuarios ven sus propias liquidaciones
ALTER TABLE vafi_liquidations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own vafi liquidations"
ON vafi_liquidations FOR SELECT
USING (
  loan_id IN (
    SELECT id FROM vafi_loans WHERE borrower_id = auth.uid()
  )
);

CREATE POLICY "Service role can manage all vafi liquidations"
ON vafi_liquidations FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

-- =====================================================
-- 3. TABLAS DE RENTALS (ALQUILERES)
-- =====================================================

-- Week Rentals: Solo propietarios y rentadores ven sus rentals
ALTER TABLE week_rentals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own week rentals"
ON week_rentals FOR SELECT
USING (
  auth.uid() = owner_id 
  OR auth.uid() = renter_id
);

CREATE POLICY "Owners can create rentals for their weeks"
ON week_rentals FOR INSERT
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Service role can manage all week rentals"
ON week_rentals FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

-- Rental Income: Solo propietarios ven sus ingresos
ALTER TABLE rental_income ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own rental income"
ON rental_income FOR SELECT
USING (
  rental_id IN (
    SELECT id FROM week_rentals WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "Service role can manage all rental income"
ON rental_income FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

-- OTA Sync Logs: Solo admins y service role
ALTER TABLE ota_sync_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all OTA sync logs"
ON ota_sync_logs FOR SELECT
USING (
  (auth.jwt() ->> 'role')::text IN ('admin', 'management')
);

CREATE POLICY "Service role can manage all OTA sync logs"
ON ota_sync_logs FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

-- =====================================================
-- 4. TABLAS DE REFERIDOS Y COMISIONES
-- =====================================================

-- Referral Tree: Usuarios ven su árbol de referidos
ALTER TABLE referral_tree ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their referral tree"
ON referral_tree FOR SELECT
USING (
  auth.uid() = referrer_id 
  OR auth.uid() = referred_id
);

CREATE POLICY "Users can create referrals"
ON referral_tree FOR INSERT
WITH CHECK (auth.uid() = referrer_id);

CREATE POLICY "Service role can manage all referral tree"
ON referral_tree FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

-- Broker Commissions: Solo brokers ven sus comisiones
ALTER TABLE broker_commissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Brokers can view their own commissions"
ON broker_commissions FOR SELECT
USING (auth.uid() = broker_id);

CREATE POLICY "Service role can manage all broker commissions"
ON broker_commissions FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

-- Broker Elite Benefits: Solo brokers ven sus beneficios
ALTER TABLE broker_elite_benefits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Brokers can view their own elite benefits"
ON broker_elite_benefits FOR SELECT
USING (auth.uid() = broker_id);

CREATE POLICY "Service role can manage all broker elite benefits"
ON broker_elite_benefits FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

-- User Referral Commissions: Solo usuarios ven sus comisiones
ALTER TABLE user_referral_commissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own referral commissions"
ON user_referral_commissions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all user referral commissions"
ON user_referral_commissions FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

-- Anonymous Referrals: Solo admins y service role
ALTER TABLE anonymous_referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all anonymous referrals"
ON anonymous_referrals FOR SELECT
USING (
  (auth.jwt() ->> 'role')::text IN ('admin', 'management')
);

CREATE POLICY "Service role can manage all anonymous referrals"
ON anonymous_referrals FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

-- Anonymous Referral Conversions: Solo admins y service role
ALTER TABLE anonymous_referral_conversions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all anonymous referral conversions"
ON anonymous_referral_conversions FOR SELECT
USING (
  (auth.jwt() ->> 'role')::text IN ('admin', 'management')
);

CREATE POLICY "Service role can manage all anonymous referral conversions"
ON anonymous_referral_conversions FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

-- =====================================================
-- 5. TABLAS DE RESERVACIONES Y NOTAS
-- =====================================================

-- Reservation Notes: Solo usuarios y admins ven notas
ALTER TABLE reservation_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view notes for their reservations"
ON reservation_notes FOR SELECT
USING (
  reservation_id IN (
    SELECT id FROM reservations WHERE user_id = auth.uid()
  )
  OR (auth.jwt() ->> 'role')::text IN ('admin', 'management')
);

CREATE POLICY "Admins can create reservation notes"
ON reservation_notes FOR INSERT
WITH CHECK (
  (auth.jwt() ->> 'role')::text IN ('admin', 'management')
);

CREATE POLICY "Service role can manage all reservation notes"
ON reservation_notes FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

-- =====================================================
-- 6. TABLAS DE GESTIÓN DE NFTs
-- =====================================================

-- NFT Management: Solo propietarios ven su gestión
ALTER TABLE nft_management ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own NFT management"
ON nft_management FOR SELECT
USING (auth.uid() = owner_id);

CREATE POLICY "Users can create NFT management for their NFTs"
ON nft_management FOR INSERT
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own NFT management"
ON nft_management FOR UPDATE
USING (auth.uid() = owner_id);

CREATE POLICY "Service role can manage all NFT management"
ON nft_management FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

-- Management Services: Solo propietarios ven sus servicios
ALTER TABLE management_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own management services"
ON management_services FOR SELECT
USING (
  management_id IN (
    SELECT id FROM nft_management WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "Service role can manage all management services"
ON management_services FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

-- Management Communications: Solo propietarios ven sus comunicaciones
ALTER TABLE management_communications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own management communications"
ON management_communications FOR SELECT
USING (
  management_id IN (
    SELECT id FROM nft_management WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "Users can create management communications"
ON management_communications FOR INSERT
WITH CHECK (
  management_id IN (
    SELECT id FROM nft_management WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "Service role can manage all management communications"
ON management_communications FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

-- Management Availability: Solo propietarios ven su disponibilidad
ALTER TABLE management_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own management availability"
ON management_availability FOR SELECT
USING (
  management_id IN (
    SELECT id FROM nft_management WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "Users can manage their own availability"
ON management_availability FOR ALL
USING (
  management_id IN (
    SELECT id FROM nft_management WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "Service role can manage all management availability"
ON management_availability FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

-- =====================================================
-- 7. TABLAS DE PRICING Y TEMPORADAS
-- =====================================================

-- Seasons: Público (lectura), solo admins modifican
ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view seasons"
ON seasons FOR SELECT
USING (true);

CREATE POLICY "Admins can manage seasons"
ON seasons FOR ALL
USING (
  (auth.jwt() ->> 'role')::text IN ('admin', 'management')
);

-- Week Seasons: Público (lectura), solo admins modifican
ALTER TABLE week_seasons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view week seasons"
ON week_seasons FOR SELECT
USING (true);

CREATE POLICY "Admins can manage week seasons"
ON week_seasons FOR ALL
USING (
  (auth.jwt() ->> 'role')::text IN ('admin', 'management')
);

-- Property Pricing Config: Público (lectura), solo admins modifican
ALTER TABLE property_pricing_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view property pricing config"
ON property_pricing_config FOR SELECT
USING (true);

CREATE POLICY "Admins can manage property pricing config"
ON property_pricing_config FOR ALL
USING (
  (auth.jwt() ->> 'role')::text IN ('admin', 'management')
);

-- =====================================================
-- 8. TABLAS DE VOUCHERS Y COMPRAS
-- =====================================================

-- Purchase Vouchers: Solo usuarios ven sus vouchers
ALTER TABLE purchase_vouchers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own purchase vouchers"
ON purchase_vouchers FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own purchase vouchers"
ON purchase_vouchers FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can manage all purchase vouchers"
ON purchase_vouchers FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

-- Voucher Redemptions: Solo usuarios ven sus redenciones
ALTER TABLE voucher_redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own voucher redemptions"
ON voucher_redemptions FOR SELECT
USING (
  voucher_id IN (
    SELECT id FROM purchase_vouchers WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can create voucher redemptions"
ON voucher_redemptions FOR INSERT
WITH CHECK (
  voucher_id IN (
    SELECT id FROM purchase_vouchers WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Service role can manage all voucher redemptions"
ON voucher_redemptions FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

-- =====================================================
-- 9. TABLAS DE COMPRA COMPLETA DE PROPIEDADES
-- =====================================================

-- Full Property Purchases: Solo compradores ven sus compras
ALTER TABLE full_property_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own full property purchases"
ON full_property_purchases FOR SELECT
USING (auth.uid() = buyer_id);

CREATE POLICY "Users can create their own full property purchases"
ON full_property_purchases FOR INSERT
WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Service role can manage all full property purchases"
ON full_property_purchases FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

-- Holder Refunds: Solo holders ven sus reembolsos
ALTER TABLE holder_refunds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own holder refunds"
ON holder_refunds FOR SELECT
USING (auth.uid() = holder_id);

CREATE POLICY "Service role can manage all holder refunds"
ON holder_refunds FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

-- Full Purchase Payments: Solo compradores ven sus pagos
ALTER TABLE full_purchase_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own full purchase payments"
ON full_purchase_payments FOR SELECT
USING (
  purchase_id IN (
    SELECT id FROM full_property_purchases WHERE buyer_id = auth.uid()
  )
);

CREATE POLICY "Service role can manage all full purchase payments"
ON full_purchase_payments FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

-- =====================================================
-- 10. VERIFICACIÓN Y AUDITORÍA
-- =====================================================

-- Función para verificar que todas las tablas críticas tienen RLS
CREATE OR REPLACE FUNCTION verify_rls_enabled()
RETURNS TABLE(
  table_name text,
  rls_enabled boolean,
  policies_count bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.tablename::text,
    t.rowsecurity,
    COUNT(p.policyname)
  FROM pg_tables t
  LEFT JOIN pg_policies p ON t.tablename = p.tablename
  WHERE t.schemaname = 'public'
    AND t.tablename NOT LIKE 'pg_%'
    AND t.tablename NOT LIKE 'sql_%'
  GROUP BY t.tablename, t.rowsecurity
  ORDER BY t.rowsecurity, t.tablename;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para listar tablas sin RLS
CREATE OR REPLACE FUNCTION tables_without_rls()
RETURNS TABLE(table_name text) AS $$
BEGIN
  RETURN QUERY
  SELECT tablename::text
  FROM pg_tables
  WHERE schemaname = 'public'
    AND rowsecurity = false
    AND tablename NOT LIKE 'pg_%'
    AND tablename NOT LIKE 'sql_%'
  ORDER BY tablename;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- COMENTARIOS Y DOCUMENTACIÓN
-- =====================================================

COMMENT ON FUNCTION verify_rls_enabled() IS 
'Verifica qué tablas tienen RLS habilitado y cuántas políticas tienen';

COMMENT ON FUNCTION tables_without_rls() IS 
'Lista todas las tablas que NO tienen RLS habilitado (potencial riesgo de seguridad)';

-- =====================================================
-- NOTAS DE IMPLEMENTACIÓN
-- =====================================================
-- 
-- 1. Todas las políticas usan auth.uid() para identificar al usuario actual
-- 2. Las políticas de service_role permiten operaciones administrativas
-- 3. Los roles 'admin' y 'management' tienen acceso ampliado a datos sensibles
-- 4. Las tablas públicas (seasons, pricing) son de solo lectura para usuarios
-- 5. Las relaciones entre tablas se verifican en las políticas (subqueries)
-- 
-- TESTING:
-- SELECT * FROM verify_rls_enabled();
-- SELECT * FROM tables_without_rls();
-- 
-- MANTENIMIENTO:
-- Ejecutar verify_rls_enabled() mensualmente para auditar seguridad
-- Revisar tables_without_rls() antes de cada deploy a producción
-- 
-- =====================================================
