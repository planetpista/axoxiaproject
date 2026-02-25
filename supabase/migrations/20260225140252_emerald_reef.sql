/*
  # Create routes table

  1. New Tables
    - `routes`
      - `id` (uuid, primary key)
      - `courier_id` (uuid, references profiles)
      - `status` (text, enum: planned, active, completed)
      - `estimated_duration` (integer, in hours)
      - `actual_duration` (integer, in hours, nullable)
      - `distance` (numeric, in km)
      - `start_time` (timestamp)
      - `end_time` (timestamp, nullable)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `routes` table
    - Add policies for couriers to manage their own routes
    - Add policies for admins to view all routes
*/

CREATE TABLE IF NOT EXISTS routes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  courier_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'active', 'completed')),
  estimated_duration integer DEFAULT 0 CHECK (estimated_duration >= 0),
  actual_duration integer CHECK (actual_duration >= 0),
  distance numeric DEFAULT 0 CHECK (distance >= 0),
  start_time timestamptz,
  end_time timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_routes_courier_id ON routes(courier_id);
CREATE INDEX IF NOT EXISTS idx_routes_status ON routes(status);

ALTER TABLE routes ENABLE ROW LEVEL SECURITY;

-- Couriers can read and manage their own routes
CREATE POLICY "Couriers can read own routes"
  ON routes
  FOR SELECT
  TO authenticated
  USING (
    courier_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Couriers can create own routes"
  ON routes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    courier_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Couriers can update own routes"
  ON routes
  FOR UPDATE
  TO authenticated
  USING (
    courier_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Trigger to update updated_at on route changes
CREATE TRIGGER update_routes_updated_at
  BEFORE UPDATE ON routes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();