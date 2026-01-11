-- Migration 004: Functions for broker level management
-- Funciones RPC para calcular y actualizar niveles de broker

-- 1. Función para calcular estadísticas de un broker
CREATE OR REPLACE FUNCTION get_broker_stats(p_broker_id UUID)
RETURNS TABLE (
  total_weeks_sold INT,
  years_active INT,
  num_affiliates INT,
  total_commissions NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    -- Total semanas vendidas (reservaciones confirmadas donde el broker es referidor)
    COALESCE((
      SELECT COUNT(DISTINCT r.id)::INT
      FROM reservations r
      INNER JOIN referral_tree rt ON rt.referred_user_id = r.user_wallet::uuid
      WHERE rt.broker_id = p_broker_id
        AND rt.level = 1
        AND r.status IN ('confirmed', 'completed', 'sold')
    ), 0) as total_weeks_sold,
    
    -- Años activos (desde created_at del profile)
    COALESCE((
      SELECT EXTRACT(YEAR FROM AGE(NOW(), p.created_at))::INT
      FROM profiles p
      WHERE p.id = p_broker_id
    ), 0) as years_active,
    
    -- Número de afiliados directos con rol broker
    COALESCE((
      SELECT COUNT(*)::INT
      FROM referral_tree rt
      INNER JOIN profiles p ON p.id = rt.referred_user_id
      WHERE rt.broker_id = p_broker_id
        AND rt.level = 1
        AND p.role = 'broker'
    ), 0) as num_affiliates,
    
    -- Total comisiones ganadas
    COALESCE((
      SELECT SUM(commission_amount_usdc)
      FROM broker_commissions bc
      WHERE bc.broker_id = p_broker_id
    ), 0) as total_commissions;
END;
$$ LANGUAGE plpgsql;

-- 2. Función para determinar el nivel correcto de un broker
CREATE OR REPLACE FUNCTION determine_broker_level(
  p_total_weeks_sold INT,
  p_num_affiliates INT
)
RETURNS UUID AS $$
DECLARE
  v_level_id UUID;
  v_record RECORD;
BEGIN
  -- Ordenar niveles por level descendente y encontrar el primero que cumpla requisitos
  FOR v_record IN 
    SELECT id, min_weeks_sold, min_affiliates 
    FROM broker_levels 
    ORDER BY level DESC
  LOOP
    IF p_total_weeks_sold >= v_record.min_weeks_sold 
       AND p_num_affiliates >= v_record.min_affiliates THEN
      RETURN v_record.id;
    END IF;
  END LOOP;
  
  -- Si no cumple ninguno, devolver el nivel más bajo (BROKER)
  SELECT id INTO v_level_id FROM broker_levels WHERE tag = 'BROKER';
  RETURN v_level_id;
END;
$$ LANGUAGE plpgsql;

-- 3. Función principal para actualizar el nivel de un broker
CREATE OR REPLACE FUNCTION update_broker_level(p_broker_id UUID)
RETURNS TABLE (
  broker_id UUID,
  old_level_tag TEXT,
  new_level_tag TEXT,
  total_weeks_sold INT,
  years_active INT,
  num_affiliates INT,
  direct_commission_rate NUMERIC
) AS $$
DECLARE
  v_stats RECORD;
  v_old_level_id UUID;
  v_new_level_id UUID;
  v_old_tag TEXT;
  v_new_tag TEXT;
  v_commission_rate NUMERIC;
BEGIN
  -- Obtener nivel actual
  SELECT p.broker_level_id, bl.tag INTO v_old_level_id, v_old_tag
  FROM profiles p
  LEFT JOIN broker_levels bl ON bl.id = p.broker_level_id
  WHERE p.id = p_broker_id;
  
  -- Calcular estadísticas
  SELECT * INTO v_stats FROM get_broker_stats(p_broker_id);
  
  -- Determinar nuevo nivel
  v_new_level_id := determine_broker_level(v_stats.total_weeks_sold, v_stats.num_affiliates);
  
  -- Obtener tag y comisión del nuevo nivel
  SELECT bl.tag, bl.direct_commission_rate INTO v_new_tag, v_commission_rate
  FROM broker_levels bl WHERE bl.id = v_new_level_id;
  
  -- Actualizar profile
  UPDATE profiles SET
    broker_level_id = v_new_level_id,
    total_weeks_sold = v_stats.total_weeks_sold,
    years_active = v_stats.years_active,
    is_broker_elite = (v_new_tag = 'BROKER_ELITE'),
    updated_at = NOW()
  WHERE id = p_broker_id;
  
  -- Devolver resultado
  RETURN QUERY SELECT 
    p_broker_id,
    v_old_tag,
    v_new_tag,
    v_stats.total_weeks_sold,
    v_stats.years_active,
    v_stats.num_affiliates,
    v_commission_rate;
END;
$$ LANGUAGE plpgsql;

-- 4. Función para obtener la tasa de comisión de un broker
CREATE OR REPLACE FUNCTION get_broker_commission_rate(p_broker_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  v_rate NUMERIC;
BEGIN
  SELECT bl.direct_commission_rate INTO v_rate
  FROM profiles p
  INNER JOIN broker_levels bl ON bl.id = p.broker_level_id
  WHERE p.id = p_broker_id;
  
  -- Si no tiene nivel asignado, usar tasa por defecto (4%)
  IF v_rate IS NULL THEN
    SELECT direct_commission_rate INTO v_rate 
    FROM broker_levels WHERE tag = 'BROKER';
  END IF;
  
  RETURN COALESCE(v_rate, 0.04);
END;
$$ LANGUAGE plpgsql;

-- 5. Función utilitaria para otorgar bonus de tiempo
CREATE OR REPLACE FUNCTION grant_time_bonus(
  p_broker_id UUID,
  p_level_id UUID,
  p_weeks_bonus INT DEFAULT 1
)
RETURNS UUID AS $$
DECLARE
  v_bonus_id UUID;
BEGIN
  INSERT INTO broker_time_bonuses (broker_id, level_id, weeks_bonus)
  VALUES (p_broker_id, p_level_id, p_weeks_bonus)
  RETURNING id INTO v_bonus_id;
  
  -- Incrementar contador de bonuses
  UPDATE profiles 
  SET bonuses_claimed = bonuses_claimed + 1 
  WHERE id = p_broker_id;
  
  RETURN v_bonus_id;
END;
$$ LANGUAGE plpgsql;

-- 6. Función para verificar elegibilidad de retirement bonus
CREATE OR REPLACE FUNCTION check_retirement_bonus_eligibility(p_broker_id UUID)
RETURNS TABLE (
  is_eligible BOOLEAN,
  retirement_rate NUMERIC,
  reason TEXT
) AS $$
DECLARE
  v_level_tag TEXT;
  v_retirement_rate NUMERIC;
  v_total_weeks INT;
  v_min_weeks INT;
BEGIN
  -- Obtener datos del broker
  SELECT bl.tag, bl.retirement_bonus_rate, bl.min_weeks_sold, p.total_weeks_sold
  INTO v_level_tag, v_retirement_rate, v_min_weeks, v_total_weeks
  FROM profiles p
  LEFT JOIN broker_levels bl ON bl.id = p.broker_level_id
  WHERE p.id = p_broker_id;
  
  -- Verificar elegibilidad
  IF v_retirement_rate IS NULL THEN
    RETURN QUERY SELECT FALSE, 0::NUMERIC, 'Nivel actual no tiene retirement bonus';
  ELSIF v_total_weeks < v_min_weeks THEN
    RETURN QUERY SELECT FALSE, v_retirement_rate, 
      format('Necesitas %s semanas vendidas, tienes %s', v_min_weeks, v_total_weeks);
  ELSE
    RETURN QUERY SELECT TRUE, v_retirement_rate, 'Elegible para retirement bonus';
  END IF;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_broker_stats IS 'Obtiene estadísticas de un broker: semanas vendidas, años activo, afiliados';
COMMENT ON FUNCTION determine_broker_level IS 'Determina el nivel correcto basado en semanas y afiliados';
COMMENT ON FUNCTION update_broker_level IS 'Actualiza el nivel de un broker y devuelve el resultado';
COMMENT ON FUNCTION get_broker_commission_rate IS 'Obtiene la tasa de comisión directa del broker según su nivel';
COMMENT ON FUNCTION grant_time_bonus IS 'Otorga un bonus de semanas gratis a un broker';
COMMENT ON FUNCTION check_retirement_bonus_eligibility IS 'Verifica si un broker es elegible para retirement bonus';
