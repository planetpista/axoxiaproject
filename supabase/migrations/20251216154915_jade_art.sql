/*
  # Fix RLS policies to use auth.uid()

  1. Security Updates
    - Update all RLS policies to use auth.uid() instead of uid()
    - Ensure proper authentication checks for all tables
    - Maintain existing functionality with correct auth functions

  2. Tables Updated
    - profiles: User profile management
    - driver_profiles: Driver-specific information
    - delivery_requests: Delivery management
    - delivery_history: Delivery tracking
    - earnings: Driver earnings
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

DROP POLICY IF EXISTS "Drivers can view own profile" ON driver_profiles;
DROP POLICY IF EXISTS "Drivers can insert own profile" ON driver_profiles;
DROP POLICY IF EXISTS "Drivers can update own profile" ON driver_profiles;
DROP POLICY IF EXISTS "Admins can view all driver profiles" ON driver_profiles;

DROP POLICY IF EXISTS "Clients can view own deliveries" ON delivery_requests;
DROP POLICY IF EXISTS "Clients can create deliveries" ON delivery_requests;
DROP POLICY IF EXISTS "Clients can update own pending deliveries" ON delivery_requests;
DROP POLICY IF EXISTS "Drivers can view available deliveries" ON delivery_requests;
DROP POLICY IF EXISTS "Drivers can accept deliveries" ON delivery_requests;

DROP POLICY IF EXISTS "Users can view delivery history" ON delivery_history;
DROP POLICY IF EXISTS "Drivers can create delivery history" ON delivery_history;

DROP POLICY IF EXISTS "Drivers can view own earnings" ON earnings;
DROP POLICY IF EXISTS "System can create earnings" ON earnings;

-- Create updated policies for profiles
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

-- Create updated policies for driver_profiles
CREATE POLICY "Drivers can view own profile"
  ON driver_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Drivers can insert own profile"
  ON driver_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Drivers can update own profile"
  ON driver_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all driver profiles"
  ON driver_profiles
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

-- Create updated policies for delivery_requests
CREATE POLICY "Clients can view own deliveries"
  ON delivery_requests
  FOR SELECT
  TO authenticated
  USING (
    client_id = auth.uid() OR 
    driver_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Clients can create deliveries"
  ON delivery_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (client_id = auth.uid());

CREATE POLICY "Clients can update own pending deliveries"
  ON delivery_requests
  FOR UPDATE
  TO authenticated
  USING (client_id = auth.uid() AND status = 'pending')
  WITH CHECK (client_id = auth.uid());

CREATE POLICY "Drivers can view available deliveries"
  ON delivery_requests
  FOR SELECT
  TO authenticated
  USING (
    status = 'pending' OR 
    driver_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Drivers can accept deliveries"
  ON delivery_requests
  FOR UPDATE
  TO authenticated
  USING (
    (status = 'pending' AND driver_id IS NULL) OR 
    driver_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    driver_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Create updated policies for delivery_history
CREATE POLICY "Users can view delivery history"
  ON delivery_history
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM delivery_requests
    WHERE delivery_requests.id = delivery_history.delivery_id
    AND (
      delivery_requests.client_id = auth.uid() OR
      delivery_requests.driver_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
      )
    )
  ));

CREATE POLICY "Drivers can create delivery history"
  ON delivery_history
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM delivery_requests
    WHERE delivery_requests.id = delivery_history.delivery_id
    AND delivery_requests.driver_id = auth.uid()
  ));

-- Create updated policies for earnings
CREATE POLICY "Drivers can view own earnings"
  ON earnings
  FOR SELECT
  TO authenticated
  USING (
    driver_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "System can create earnings"
  ON earnings
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));