-- Script to implement RLS on users and properties tables
-- Version: 1.0.0
-- Description: Add Row Level Security to critical tables

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON users
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  USING (auth.uid() = id);

-- Admins can view all users
CREATE POLICY "Admins can view all users"
  ON users
  FOR SELECT
  USING (
    role IN ('admin', 'super_admin') 
    AND auth.uid() = id
  );

-- Admins can update any user
CREATE POLICY "Admins can manage all users"
  ON users
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- Service role has full access
CREATE POLICY "Service role full access to users"
  ON users
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- Enable RLS on properties table
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Anyone can view active properties
CREATE POLICY "Anyone can view active properties"
  ON properties
  FOR SELECT
  USING (status = 'active' OR status = 'presale');

-- Property owners can view their own properties
CREATE POLICY "Owners can view own properties"
  ON properties
  FOR SELECT
  USING (
    owner_id = auth.uid()
  );

-- Admins can view all properties
CREATE POLICY "Admins can view all properties"
  ON properties
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin', 'management')
    )
  );

-- Admins can manage all properties
CREATE POLICY "Admins can manage all properties"
  ON properties
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- Service role has full access
CREATE POLICY "Service role full access to properties"
  ON properties
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- Enable RLS on weeks table
ALTER TABLE weeks ENABLE ROW LEVEL SECURITY;

-- Anyone can view available weeks
CREATE POLICY "Anyone can view available weeks"
  ON weeks
  FOR SELECT
  USING (status IN ('available', 'reserved'));

-- Week owners can view their weeks
CREATE POLICY "Owners can view own weeks"
  ON weeks
  FOR SELECT
  USING (owner_wallet = auth.uid()::text);

-- Admins can manage all weeks
CREATE POLICY "Admins can manage all weeks"
  ON weeks
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- Service role has full access
CREATE POLICY "Service role full access to weeks"
  ON weeks
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- Enable RLS on reservations table
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- Users can view their own reservations
CREATE POLICY "Users can view own reservations"
  ON reservations
  FOR SELECT
  USING (user_id = auth.uid());

-- Users can create their own reservations
CREATE POLICY "Users can create own reservations"
  ON reservations
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Admins can view all reservations
CREATE POLICY "Admins can view all reservations"
  ON reservations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin', 'management')
    )
  );

-- Admins can manage all reservations
CREATE POLICY "Admins can manage all reservations"
  ON reservations
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- Service role has full access
CREATE POLICY "Service role full access to reservations"
  ON reservations
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');
