/*
  # Create shipping addresses table

  1. New Tables
    - `shipping_addresses`
      - `id` (uuid, primary key)
      - `delivery_id` (uuid, references deliveries)
      - `type` (text, enum: sender, recipient)
      - `first_name` (text)
      - `last_name` (text)
      - `address` (text)
      - `city` (text)
      - `country` (text)
      - `contact` (text)
      - `email` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `shipping_addresses` table
    - Add policies for users to manage addresses on their deliveries
    - Add policies for admins to view all addresses
*/

CREATE TABLE IF NOT EXISTS shipping_addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_id uuid NOT NULL REFERENCES deliveries(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('sender', 'recipient')),
  first_name text NOT NULL,
  last_name text NOT NULL,
  address text NOT NULL,
  city text NOT NULL,
  country text NOT NULL,
  contact text NOT NULL,
  email text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(delivery_id, type)
);

CREATE INDEX IF NOT EXISTS idx_shipping_addresses_delivery_id ON shipping_addresses(delivery_id);
CREATE INDEX IF NOT EXISTS idx_shipping_addresses_type ON shipping_addresses(type);

ALTER TABLE shipping_addresses ENABLE ROW LEVEL SECURITY;

-- Users can read addresses for deliveries they're involved in
CREATE POLICY "Users can read relevant shipping addresses"
  ON shipping_addresses
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM deliveries
      WHERE id = shipping_addresses.delivery_id 
      AND (sender_id = auth.uid() OR recipient_id = auth.uid() OR courier_id = auth.uid())
    ) OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Users can create addresses for their own deliveries
CREATE POLICY "Users can create addresses for own deliveries"
  ON shipping_addresses
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM deliveries
      WHERE id = shipping_addresses.delivery_id 
      AND sender_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Users can update addresses for their own deliveries
CREATE POLICY "Users can update addresses for own deliveries"
  ON shipping_addresses
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM deliveries
      WHERE id = shipping_addresses.delivery_id 
      AND sender_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Trigger to update updated_at on address changes
CREATE TRIGGER update_shipping_addresses_updated_at
  BEFORE UPDATE ON shipping_addresses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();