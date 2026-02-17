-- Services Marketplace for Vacation Economy
-- Only holders (voucher/NFT owners) can book verified services

-- Service Categories
CREATE TABLE IF NOT EXISTS service_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_es TEXT NOT NULL,
  description TEXT,
  icon TEXT, -- lucide icon name
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Service Providers (verified by WeekChain)
CREATE TABLE IF NOT EXISTS service_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  business_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  verification_status TEXT DEFAULT 'pending', -- pending, verified, rejected
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  rating DECIMAL(3,2) DEFAULT 0.00,
  total_bookings INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Services
CREATE TABLE IF NOT EXISTS vacation_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES service_providers(id) ON DELETE CASCADE,
  category_id UUID REFERENCES service_categories(id),
  property_id UUID REFERENCES properties(id), -- optional: service specific to a property
  
  -- Service Details
  name TEXT NOT NULL,
  name_es TEXT NOT NULL,
  description TEXT NOT NULL,
  description_es TEXT NOT NULL,
  
  -- Pricing
  price_usd DECIMAL(10,2) NOT NULL,
  price_mxn DECIMAL(10,2) NOT NULL,
  pricing_type TEXT DEFAULT 'fixed', -- fixed, per_person, per_hour, per_day
  
  -- Availability
  available BOOLEAN DEFAULT true,
  max_capacity INTEGER,
  duration_minutes INTEGER, -- for time-based services
  advance_booking_hours INTEGER DEFAULT 24, -- minimum hours in advance
  
  -- Media
  images JSONB DEFAULT '[]'::jsonb,
  
  -- Verification
  verified_by_weekchain BOOLEAN DEFAULT false,
  featured BOOLEAN DEFAULT false,
  
  -- Stats
  total_bookings INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0.00,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Service Bookings
CREATE TABLE IF NOT EXISTS service_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID REFERENCES vacation_services(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  voucher_id UUID REFERENCES purchase_vouchers(id), -- must have voucher to book
  
  -- Booking Details
  booking_date TIMESTAMP WITH TIME ZONE NOT NULL,
  guests INTEGER DEFAULT 1,
  special_requests TEXT,
  
  -- Pricing
  total_price_usd DECIMAL(10,2) NOT NULL,
  total_price_mxn DECIMAL(10,2) NOT NULL,
  payment_method TEXT NOT NULL, -- usdc, card, oxxo, spei
  
  -- Payment
  payment_status TEXT DEFAULT 'pending', -- pending, paid, refunded
  payment_intent_id TEXT,
  paid_at TIMESTAMP WITH TIME ZONE,
  
  -- Status
  status TEXT DEFAULT 'pending', -- pending, confirmed, completed, cancelled
  confirmed_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancellation_reason TEXT,
  
  -- Review
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Service Reviews
CREATE TABLE IF NOT EXISTS service_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID REFERENCES vacation_services(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES service_bookings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT NOT NULL,
  images JSONB DEFAULT '[]'::jsonb,
  
  provider_response TEXT,
  responded_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default categories
INSERT INTO service_categories (name, name_es, description, icon, display_order) VALUES
('Airport Transfer', 'Traslado Aeropuerto', 'Safe and comfortable airport transportation', 'Plane', 1),
('Private Chef', 'Chef Privado', 'Professional chefs for in-villa dining', 'ChefHat', 2),
('Yacht Rental', 'Renta de Yate', 'Luxury yacht experiences', 'Ship', 3),
('Tours & Activities', 'Tours y Actividades', 'Guided tours and local experiences', 'Map', 4),
('Spa & Wellness', 'Spa y Bienestar', 'Relaxation and wellness services', 'Sparkles', 5),
('Car Rental', 'Renta de Auto', 'Vehicle rentals for your stay', 'Car', 6),
('Concierge', 'Concierge', 'Personal concierge services', 'Bell', 7),
('Grocery Delivery', 'Entrega de Despensa', 'Pre-arrival grocery stocking', 'ShoppingCart', 8)
ON CONFLICT DO NOTHING;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_vacation_services_category ON vacation_services(category_id);
CREATE INDEX IF NOT EXISTS idx_vacation_services_provider ON vacation_services(provider_id);
CREATE INDEX IF NOT EXISTS idx_vacation_services_property ON vacation_services(property_id);
CREATE INDEX IF NOT EXISTS idx_vacation_services_verified ON vacation_services(verified_by_weekchain);
CREATE INDEX IF NOT EXISTS idx_service_bookings_user ON service_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_service_bookings_service ON service_bookings(service_id);
CREATE INDEX IF NOT EXISTS idx_service_bookings_voucher ON service_bookings(voucher_id);
CREATE INDEX IF NOT EXISTS idx_service_bookings_date ON service_bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_service_reviews_service ON service_reviews(service_id);

-- RLS Policies
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vacation_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_reviews ENABLE ROW LEVEL SECURITY;

-- Everyone can view categories and verified services
CREATE POLICY "Anyone can view categories" ON service_categories FOR SELECT USING (true);
CREATE POLICY "Anyone can view verified services" ON vacation_services FOR SELECT USING (verified_by_weekchain = true);

-- Providers can manage their own services
CREATE POLICY "Providers can view their services" ON vacation_services FOR SELECT USING (provider_id IN (SELECT id FROM service_providers WHERE user_id = auth.uid()));
CREATE POLICY "Providers can insert services" ON vacation_services FOR INSERT WITH CHECK (provider_id IN (SELECT id FROM service_providers WHERE user_id = auth.uid()));
CREATE POLICY "Providers can update their services" ON vacation_services FOR UPDATE USING (provider_id IN (SELECT id FROM service_providers WHERE user_id = auth.uid()));

-- Users can view their own bookings
CREATE POLICY "Users can view their bookings" ON service_bookings FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create bookings" ON service_bookings FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can view reviews
CREATE POLICY "Anyone can view reviews" ON service_reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews for their bookings" ON service_reviews FOR INSERT WITH CHECK (user_id = auth.uid());

COMMENT ON TABLE vacation_services IS 'Verified vacation services marketplace for holders';
COMMENT ON TABLE service_bookings IS 'Service bookings - only holders with vouchers can book';
