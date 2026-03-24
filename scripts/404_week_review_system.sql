-- WEEK-REVIEW: Verified Reviews System
-- Bookings can only leave reviews after checkout
-- Hash chain for tamper detection
-- Moderation and flagging system

CREATE TYPE review_status_enum AS ENUM ('pending_moderation', 'approved', 'rejected', 'flagged', 'reported');
CREATE TYPE moderation_action_enum AS ENUM ('auto_approve', 'auto_reject', 'flag_manual_review', 'flag_abuse', 'flag_spam');

-- Main reviews table
CREATE TABLE IF NOT EXISTS week_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL UNIQUE REFERENCES confirmed_reservations(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  
  -- Review content
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  rating_overall INT NOT NULL CHECK (rating_overall >= 1 AND rating_overall <= 5),
  rating_cleanliness INT CHECK (rating_cleanliness >= 1 AND rating_cleanliness <= 5),
  rating_amenities INT CHECK (rating_amenities >= 1 AND rating_amenities <= 5),
  rating_service INT CHECK (rating_service >= 1 AND rating_service <= 5),
  rating_location INT CHECK (rating_location >= 1 AND rating_location <= 5),
  
  -- Media
  image_urls TEXT[] DEFAULT '{}',
  
  -- Verification
  verified_purchase BOOLEAN DEFAULT true,
  booking_dates_overlap BOOLEAN DEFAULT true,
  reviewer_name_visible BOOLEAN DEFAULT true,
  
  -- Status & moderation
  status review_status_enum DEFAULT 'pending_moderation',
  moderation_action moderation_action_enum,
  moderation_notes TEXT,
  moderation_score DECIMAL(3, 2),
  flagged_reason TEXT,
  abuse_report_count INT DEFAULT 0,
  
  -- Hash chain for tamper detection
  content_hash VARCHAR(64),
  previous_hash VARCHAR(64),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  published_at TIMESTAMPTZ,
  
  CONSTRAINT valid_dates CHECK (created_at <= COALESCE(published_at, now()))
);

CREATE INDEX idx_week_reviews_property ON week_reviews(property_id, status);
CREATE INDEX idx_week_reviews_reviewer ON week_reviews(reviewer_id);
CREATE INDEX idx_week_reviews_status ON week_reviews(status);

-- Review moderation rules
CREATE TABLE IF NOT EXISTS review_moderation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_name VARCHAR(100) NOT NULL UNIQUE,
  rule_type VARCHAR(50), -- keyword, length, rating_pattern, etc
  rule_value JSONB,
  action moderation_action_enum,
  severity INT DEFAULT 1, -- 1-5
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Review flags and reports
CREATE TABLE IF NOT EXISTS review_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES week_reviews(id) ON DELETE CASCADE,
  reported_by_id UUID NOT NULL REFERENCES users(id),
  flag_type VARCHAR(50), -- spam, inappropriate, fake, irrelevant, etc
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  resolved BOOLEAN DEFAULT false,
  resolved_by_id UUID REFERENCES users(id),
  resolution_notes TEXT
);

CREATE INDEX idx_review_flags_review ON review_flags(review_id);

-- Review response from property owner
CREATE TABLE IF NOT EXISTS review_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL UNIQUE REFERENCES week_reviews(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Moderation audit trail
CREATE TABLE IF NOT EXISTS review_moderation_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES week_reviews(id),
  moderator_id UUID REFERENCES users(id),
  action moderation_action_enum,
  previous_status review_status_enum,
  new_status review_status_enum,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_review_moderation_review ON review_moderation_log(review_id);

-- Enable RLS
ALTER TABLE week_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_moderation_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view approved reviews"
  ON week_reviews FOR SELECT
  USING (status = 'approved' OR auth.uid() = reviewer_id);

CREATE POLICY "Users can create reviews for their bookings"
  ON week_reviews FOR INSERT
  WITH CHECK (auth.uid() = reviewer_id AND is_admin());

CREATE POLICY "Admins can moderate reviews"
  ON week_reviews FOR UPDATE
  USING (is_admin());

CREATE POLICY "Anyone can report reviews"
  ON review_flags FOR INSERT
  WITH CHECK (true);

-- Functions for review system
CREATE OR REPLACE FUNCTION calculate_review_moderation_score(p_review_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  v_score DECIMAL := 0;
  v_content TEXT;
  v_rating INT;
BEGIN
  SELECT content, rating_overall INTO v_content, v_rating
  FROM week_reviews WHERE id = p_review_id;
  
  -- Length check (very short or very long reviews are suspicious)
  IF LENGTH(v_content) < 20 THEN v_score := v_score + 0.3; END IF;
  IF LENGTH(v_content) > 5000 THEN v_score := v_score + 0.2; END IF;
  
  -- Extreme ratings (all 5s or all 1s are suspicious)
  IF v_rating IN (1, 5) THEN v_score := v_score + 0.1; END IF;
  
  -- Check for duplicate content
  IF (SELECT COUNT(*) FROM week_reviews 
      WHERE content = v_content AND id != p_review_id) > 0 THEN
    v_score := v_score + 0.4;
  END IF;
  
  RETURN LEAST(v_score, 1.0);
END;
$$ LANGUAGE plpgsql;

-- Auto-moderation function
CREATE OR REPLACE FUNCTION auto_moderate_review()
RETURNS TRIGGER AS $$
DECLARE
  v_moderation_score DECIMAL;
  v_action moderation_action_enum;
BEGIN
  v_moderation_score := calculate_review_moderation_score(NEW.id);
  
  IF v_moderation_score > 0.7 THEN
    NEW.moderation_action := 'flag_manual_review';
    NEW.status := 'pending_moderation';
  ELSIF v_moderation_score > 0.4 THEN
    NEW.moderation_action := 'flag_manual_review';
    NEW.status := 'pending_moderation';
  ELSE
    NEW.moderation_action := 'auto_approve';
    NEW.status := 'approved';
    NEW.published_at := now();
  END IF;
  
  NEW.moderation_score := v_moderation_score;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_auto_moderate_review
  BEFORE INSERT ON week_reviews
  FOR EACH ROW
  EXECUTE FUNCTION auto_moderate_review();

-- Hash chain for tamper detection
CREATE OR REPLACE FUNCTION create_review_hash_chain()
RETURNS TRIGGER AS $$
DECLARE
  v_previous_hash VARCHAR(64);
BEGIN
  SELECT content_hash INTO v_previous_hash
  FROM week_reviews
  WHERE property_id = NEW.property_id
  ORDER BY created_at DESC
  LIMIT 1;
  
  NEW.content_hash := encode(
    digest(NEW.content || NEW.rating_overall::text || COALESCE(v_previous_hash, ''), 'sha256'),
    'hex'
  );
  NEW.previous_hash := v_previous_hash;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_review_hash_chain
  BEFORE INSERT ON week_reviews
  FOR EACH ROW
  EXECUTE FUNCTION create_review_hash_chain();

-- Prevent review deletion
CREATE OR REPLACE FUNCTION prevent_review_deletion()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Reviews cannot be deleted, only flagged or reported';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prevent_review_deletion
  BEFORE DELETE ON week_reviews
  FOR EACH ROW
  EXECUTE FUNCTION prevent_review_deletion();

-- Insert default moderation rules
INSERT INTO review_moderation_rules (rule_name, rule_type, action, severity, rule_value) VALUES
  ('Min content length', 'min_length', 'auto_reject', 1, '{"min": 20}'),
  ('Max content length', 'max_length', 'flag_manual_review', 2, '{"max": 5000}'),
  ('Extreme ratings pattern', 'rating_pattern', 'flag_manual_review', 2, '{}'),
  ('All caps content', 'text_pattern', 'flag_manual_review', 1, '{}'),
  ('Excessive punctuation', 'text_pattern', 'flag_manual_review', 1, '{}')
ON CONFLICT (rule_name) DO NOTHING;

GRANT SELECT ON week_reviews TO authenticated;
GRANT INSERT ON week_reviews TO authenticated;
GRANT SELECT ON review_flags TO authenticated;
GRANT INSERT ON review_flags TO authenticated;
GRANT SELECT ON review_responses TO authenticated;
GRANT INSERT ON review_responses TO authenticated;
