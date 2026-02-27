/*
  # Create Core Database Schema

  ## Overview
  This migration sets up the complete database schema for the Axoxia shipping application,
  including user profiles, deliveries, routes, financial records, and alerts.

  ## 1. New Tables

  ### profiles
  - `id` (uuid, primary key) - References auth.users
  - `first_name` (text) - User's first name
  - `last_name` (text) - User's last name
  - `role` (text) - User role: 'admin', 'driver', or 'client'
  - `phone` (text, optional) - Contact phone number
  - `address` (text, optional) - User address
  - `is_active` (boolean) - Account active status
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### driver_profiles
  - `id` (uuid, primary key) - Auto-generated
  - `user_id` (uuid, foreign key) - References profiles.id
  - `country` (text) - Driver's operating country
  - `city` (text) - Driver's operating city
  - `vehicle_type` (text) - Type of vehicle: 'motorbike', 'car', or 'truck'
  - `account_type` (text) - Account type: 'individual' or 'professional:company_name'
  - `is_available` (boolean) - Current availability status
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### deliveries
  - `id` (uuid, primary key) - Auto-generated
  - `tracking_number` (text, unique) - Unique tracking identifier
  - `sender_id` (uuid, foreign key) - References profiles.id
  - `recipient_id` (uuid, foreign key) - References profiles.id
  - `courier_id` (uuid, foreign key, nullable) - References profiles.id
  - `category` (text) - Delivery category: 'Mail', 'Parcel', or 'Container'
  - `status` (text) - Current status
  - `priority` (text) - Priority level
  - `origin` (text) - Origin address
  - `destination` (text) - Destination address
  - `weight` (numeric) - Package weight in kg
  - `dimensions` (jsonb) - Package dimensions
  - `cost` (numeric) - Delivery cost
  - `currency` (text) - Currency code
  - `insurance` (boolean) - Insurance included
  - `insurance_cost` (numeric) - Insurance cost
  - `estimated_delivery` (timestamptz) - Estimated delivery time
  - `actual_delivery` (timestamptz, nullable) - Actual delivery time
  - `notes` (text) - Additional notes
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### routes
  - `id` (uuid, primary key) - Auto-generated
  - `courier_id` (uuid, foreign key) - References profiles.id
  - `status` (text) - Route status
  - `estimated_duration` (integer) - Estimated duration in hours
  - `actual_duration` (integer, nullable) - Actual duration in hours
  - `distance` (numeric) - Total distance in km
  - `start_time` (timestamptz) - Route start time
  - `end_time` (timestamptz, nullable) - Route end time
  - `waypoints` (jsonb) - Route waypoints data
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### alerts
  - `id` (uuid, primary key) - Auto-generated
  - `type` (text) - Alert type
  - `severity` (text) - Alert severity level
  - `title` (text) - Alert title
  - `message` (text) - Alert message
  - `delivery_id` (uuid, foreign key, nullable) - Related delivery
  - `user_id` (uuid, foreign key, nullable) - Related user
  - `is_read` (boolean) - Read status
  - `created_at` (timestamptz) - Creation timestamp

  ### financial_records
  - `id` (uuid, primary key) - Auto-generated
  - `delivery_id` (uuid, foreign key) - References deliveries.id
  - `type` (text) - Record type: 'revenue', 'cost', or 'refund'
  - `amount` (numeric) - Transaction amount
  - `currency` (text) - Currency code
  - `description` (text) - Transaction description
  - `payment_method` (text) - Payment method used
  - `payment_status` (text) - Payment status
  - `created_at` (timestamptz) - Creation timestamp

  ## 2. Security
  - Enable Row Level Security (RLS) on all tables
  - Add policies for authenticated users to access their own data
  - Add policies for admin users to access all data
  - Add policies for drivers to access assigned deliveries
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name text NOT NULL DEFAULT '',
  last_name text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'client' CHECK (role IN ('admin', 'driver', 'client')),
  phone text,
  address text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create driver_profiles table
CREATE TABLE IF NOT EXISTS driver_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  country text NOT NULL,
  city text NOT NULL,
  vehicle_type text NOT NULL CHECK (vehicle_type IN ('motorbike', 'car', 'truck')),
  account_type text NOT NULL DEFAULT 'individual',
  is_available boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Create deliveries table
CREATE TABLE IF NOT EXISTS deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_number text UNIQUE NOT NULL,
  sender_id uuid NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  recipient_id uuid NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  courier_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  category text NOT NULL CHECK (category IN ('Mail', 'Parcel', 'Container')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'in_transit', 'delivered', 'failed', 'cancelled')),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  origin text NOT NULL,
  destination text NOT NULL,
  weight numeric NOT NULL DEFAULT 0 CHECK (weight >= 0),
  dimensions jsonb DEFAULT '{"length": 0, "width": 0, "height": 0}'::jsonb,
  cost numeric NOT NULL DEFAULT 0 CHECK (cost >= 0),
  currency text NOT NULL DEFAULT 'EUR',
  insurance boolean DEFAULT false,
  insurance_cost numeric DEFAULT 0 CHECK (insurance_cost >= 0),
  estimated_delivery timestamptz,
  actual_delivery timestamptz,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create routes table
CREATE TABLE IF NOT EXISTS routes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  courier_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'active', 'completed')),
  estimated_duration integer NOT NULL DEFAULT 0,
  actual_duration integer,
  distance numeric NOT NULL DEFAULT 0,
  start_time timestamptz NOT NULL,
  end_time timestamptz,
  waypoints jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create alerts table
CREATE TABLE IF NOT EXISTS alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('delay', 'incident', 'system', 'payment')),
  severity text NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title text NOT NULL,
  message text NOT NULL,
  delivery_id uuid REFERENCES deliveries(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create financial_records table
CREATE TABLE IF NOT EXISTS financial_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_id uuid NOT NULL REFERENCES deliveries(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('revenue', 'cost', 'refund')),
  amount numeric NOT NULL CHECK (amount >= 0),
  currency text NOT NULL DEFAULT 'EUR',
  description text NOT NULL,
  payment_method text NOT NULL,
  payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(id);
CREATE INDEX IF NOT EXISTS idx_driver_profiles_user_id ON driver_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_driver_profiles_country_city ON driver_profiles(country, city);
CREATE INDEX IF NOT EXISTS idx_deliveries_tracking_number ON deliveries(tracking_number);
CREATE INDEX IF NOT EXISTS idx_deliveries_sender_id ON deliveries(sender_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_recipient_id ON deliveries(recipient_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_courier_id ON deliveries(courier_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_status ON deliveries(status);
CREATE INDEX IF NOT EXISTS idx_routes_courier_id ON routes(courier_id);
CREATE INDEX IF NOT EXISTS idx_alerts_user_id ON alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_delivery_id ON alerts(delivery_id);
CREATE INDEX IF NOT EXISTS idx_financial_records_delivery_id ON financial_records(delivery_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_records ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can insert profiles"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete profiles"
  ON profiles FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Driver profiles policies
CREATE POLICY "Drivers can view own driver profile"
  ON driver_profiles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Drivers can update own driver profile"
  ON driver_profiles FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all driver profiles"
  ON driver_profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage driver profiles"
  ON driver_profiles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Deliveries policies
CREATE POLICY "Users can view own deliveries as sender"
  ON deliveries FOR SELECT
  TO authenticated
  USING (sender_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "Drivers can view assigned deliveries"
  ON deliveries FOR SELECT
  TO authenticated
  USING (courier_id = auth.uid());

CREATE POLICY "Admins can view all deliveries"
  ON deliveries FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Clients can create deliveries"
  ON deliveries FOR INSERT
  TO authenticated
  WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Admins can manage all deliveries"
  ON deliveries FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Drivers can update assigned deliveries"
  ON deliveries FOR UPDATE
  TO authenticated
  USING (courier_id = auth.uid())
  WITH CHECK (courier_id = auth.uid());

-- Routes policies
CREATE POLICY "Drivers can view own routes"
  ON routes FOR SELECT
  TO authenticated
  USING (courier_id = auth.uid());

CREATE POLICY "Admins can view all routes"
  ON routes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage all routes"
  ON routes FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Alerts policies
CREATE POLICY "Users can view own alerts"
  ON alerts FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Users can update own alerts"
  ON alerts FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all alerts"
  ON alerts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage all alerts"
  ON alerts FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Financial records policies
CREATE POLICY "Users can view own financial records"
  ON financial_records FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM deliveries
      WHERE deliveries.id = financial_records.delivery_id
      AND (deliveries.sender_id = auth.uid() OR deliveries.recipient_id = auth.uid())
    )
  );

CREATE POLICY "Admins can view all financial records"
  ON financial_records FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage all financial records"
  ON financial_records FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_driver_profiles_updated_at
  BEFORE UPDATE ON driver_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deliveries_updated_at
  BEFORE UPDATE ON deliveries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_routes_updated_at
  BEFORE UPDATE ON routes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();