-- Script para actualizar las tasas de comisión al sistema correcto
-- Sistema: 6% total distribuido según quién vende
-- Venta directa: 6% para el vendedor
-- Referido vende: 4% para broker original, 2% para vendedor
-- Red nivel 3 vende: 3% nivel 1, 2% nivel 2, 1% vendedor

-- Actualizar función de cálculo de comisiones
CREATE OR REPLACE FUNCTION get_broker_commission_rate(
  p_referral_level INTEGER,
  p_is_direct_seller BOOLEAN DEFAULT FALSE
)
RETURNS DECIMAL(4,2) AS $$
BEGIN
  -- Si es venta directa (el broker mismo vende)
  IF p_is_direct_seller THEN
    RETURN 0.06; -- 6%
  END IF;
  
  -- Si hay intermediarios
  CASE p_referral_level
    WHEN 1 THEN 
      -- Broker original cuando su referido directo vende
      RETURN 0.04; -- 4%
    WHEN 2 THEN 
      -- Broker intermediario o vendedor en cadena de 2
      RETURN 0.02; -- 2%
    WHEN 3 THEN 
      -- Vendedor final en cadena de 3
      RETURN 0.01; -- 1%
    ELSE
      RETURN 0.00;
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- Función para procesar comisiones multinivel correctamente
CREATE OR REPLACE FUNCTION process_broker_commissions_v2(
  p_reservation_id UUID,
  p_sale_amount DECIMAL,
  p_buyer_id UUID
)
RETURNS VOID AS $$
DECLARE
  v_level1_id UUID; -- Referidor del comprador
  v_level2_id UUID; -- Referidor del nivel 1
  v_level3_id UUID; -- Referidor del nivel 2
  v_commission DECIMAL;
  v_chain_length INTEGER := 0;
BEGIN
  -- Buscar cadena de referidos
  SELECT referred_by INTO v_level1_id FROM profiles WHERE id = p_buyer_id;
  
  IF v_level1_id IS NOT NULL THEN
    v_chain_length := 1;
    SELECT referred_by INTO v_level2_id FROM profiles WHERE id = v_level1_id;
    
    IF v_level2_id IS NOT NULL THEN
      v_chain_length := 2;
      SELECT referred_by INTO v_level3_id FROM profiles WHERE id = v_level2_id;
      
      IF v_level3_id IS NOT NULL THEN
        v_chain_length := 3;
      END IF;
    END IF;
  END IF;
  
  -- Distribuir comisiones según la longitud de la cadena
  IF v_chain_length = 1 THEN
    -- Solo hay un nivel: referidor recibe 4%, vendedor 2%
    -- Nivel 1 (referidor original)
    v_commission := p_sale_amount * 0.04;
    INSERT INTO broker_commissions (broker_id, reservation_id, sale_amount_usdc, commission_rate, commission_amount_usdc, referral_level, status)
    VALUES (v_level1_id, p_reservation_id, p_sale_amount, 0.04, v_commission, 1, 'pending');
    
    -- El comprador/vendedor (si es broker) recibe 2%
    v_commission := p_sale_amount * 0.02;
    INSERT INTO broker_commissions (broker_id, reservation_id, sale_amount_usdc, commission_rate, commission_amount_usdc, referral_level, status)
    VALUES (p_buyer_id, p_reservation_id, p_sale_amount, 0.02, v_commission, 2, 'pending');
    
  ELSIF v_chain_length >= 2 THEN
    -- Cadena de 3 niveles: 3%-2%-1%
    -- Nivel 1 (referidor original más antiguo)
    v_commission := p_sale_amount * 0.03;
    INSERT INTO broker_commissions (broker_id, reservation_id, sale_amount_usdc, commission_rate, commission_amount_usdc, referral_level, status)
    VALUES (COALESCE(v_level3_id, v_level2_id), p_reservation_id, p_sale_amount, 0.03, v_commission, 1, 'pending');
    
    -- Nivel 2 (intermediario)
    v_commission := p_sale_amount * 0.02;
    INSERT INTO broker_commissions (broker_id, reservation_id, sale_amount_usdc, commission_rate, commission_amount_usdc, referral_level, status)
    VALUES (COALESCE(v_level2_id, v_level1_id), p_reservation_id, p_sale_amount, 0.02, v_commission, 2, 'pending');
    
    -- Nivel 3 (vendedor)
    v_commission := p_sale_amount * 0.01;
    INSERT INTO broker_commissions (broker_id, reservation_id, sale_amount_usdc, commission_rate, commission_amount_usdc, referral_level, status)
    VALUES (v_level1_id, p_reservation_id, p_sale_amount, 0.01, v_commission, 3, 'pending');
  END IF;
  
END;
$$ LANGUAGE plpgsql;

-- Comentarios actualizados
COMMENT ON FUNCTION get_broker_commission_rate IS 'Comisiones: 6% directo, 4%+2% si referido vende, 3%+2%+1% en red de 3 niveles';
COMMENT ON FUNCTION process_broker_commissions_v2 IS 'Procesa comisiones multinivel con sistema 6% total (6 directo, 4+2, 3+2+1)';
