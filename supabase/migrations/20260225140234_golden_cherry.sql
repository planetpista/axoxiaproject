/*
  # Create deliveries table

  1. New Tables
    - `deliveries`
      - `id` (uuid, primary key)
      - `tracking_number` (text, unique)
      - `sender_id` (uuid, references profiles)
      - `recipient_id` (uuid, references profiles)
      - `courier_id` (uuid, references profiles, nullable)
      - `category` (text, enum: Mail, Parcel, Container)
      - `status` (text, enum: pending, assigned, in_transit, delivered, failed, cancelled)
      - `priority` (text, enum: low, medium, high, urgent)
      - `origin` (text)
      - `destination` (text)
      - `weight` (numeric)
      - `dimensions` (jsonb)
      - `cost` (numeric)
      - `currency` (text)
      - `insurance` (boolean)
      - `insurance_cost` (numeric)
      - `estimated_delivery` (timestamp)
      - `actual_delivery` (timestamp, nullable)
      - `notes` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `deliveries` table
    - Add policies for users to manage their own deliveries
    - Add policies for couriers to view assigned deliveries
    - Add policies for admins to view all deliveries
*/

CREATE TABLE IF NOT EXISTS deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_number text UNIQUE NOT NULL,
  sender_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  courier_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  category text NOT NULL CHECK (category IN ('Mail', 'Parcel', 'Container')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'in_transit', 'delivered', 'failed', 'cancelled')),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  origin text NOT NULL,
  destination text NOT NULL,
  weight numeric NOT NULL DEFAULT 0 CHECK (weight >= 0),
  dimensions jsonb DEFAULT '{"length": 0, "width": 0, "height": 0}',
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

-- Create index for tracking number lookups
CREATE INDEX IF NOT EXISTS idx_deliveries_tracking_number ON deliveries(tracking_number);
CREATE INDEX IF NOT EXISTS idx_deliveries_sender_id ON deliveries(sender_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_recipient_id ON deliveries(recipient_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_courier_id ON deliveries(courier_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_status ON deliveries(status);

ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;

-- Users can read deliveries where they are sender or recipient
CREATE POLICY "Users can read own deliveries"
  ON deliveries
  FOR SELECT
  TO authenticated
  USING (
    sender_id = auth.uid() OR 
    recipient_id = auth.uid() OR
    courier_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'courier')
    )
  );

-- Users can create deliveries as sender
CREATE POLICY "Users can create deliveries"
  ON deliveries
  FOR INSERT
  TO authenticated
  WITH CHECK (sender_id = auth.uid());

-- Users can update their own deliveries (senders only for basic info)
CREATE POLICY "Senders can update own deliveries"
  ON deliveries
  FOR UPDATE
  TO authenticated
  USING (sender_id = auth.uid());

-- Couriers can update assigned deliveries
CREATE POLICY "Couriers can update assigned deliveries"
  ON deliveries
  FOR UPDATE
  TO authenticated
  USING (
    courier_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'courier')
    )
  );

-- Admins can do everything
CREATE POLICY "Admins can manage all deliveries"
  ON deliveries
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Function to generate tracking number
CREATE OR REPLACE FUNCTION generate_tracking_number()
RETURNS text AS $$
DECLARE
  tracking_num text;
  counter int := 0;
BEGIN
  LOOP
    tracking_num := 'AXX' || LPAD((EXTRACT(EPOCH FROM now())::bigint % 1000000)::text, 6, '0');
    
    -- Check if tracking number already exists
    IF NOT EXISTS (SELECT 1 FROM deliveries WHERE tracking_number = tracking_num) THEN
      RETURN tracking_num;
    END IF;
    
    counter := counter + 1;
    IF counter > 100 THEN
      -- Fallback with random component
      tracking_num := 'AXX' || LPAD((EXTRACT(EPOCH FROM now())::bigint % 1000000)::text, 6, '0') || LPAD((RANDOM() * 1000)::int::text, 3, '0');
      RETURN tracking_num;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-generate tracking number on insert
CREATE OR REPLACE FUNCTION set_tracking_number()
RETURNS trigger AS $$
BEGIN
  IF NEW.tracking_number IS NULL OR NEW.tracking_number = '' THEN
    NEW.tracking_number := generate_tracking_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate tracking number
CREATE TRIGGER set_delivery_tracking_number
  BEFORE INSERT ON deliveries
  FOR EACH ROW EXECUTE FUNCTION set_tracking_number();

-- Trigger to update updated_at on delivery changes
CREATE TRIGGER update_deliveries_updated_at
  BEFORE UPDATE ON deliveries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();