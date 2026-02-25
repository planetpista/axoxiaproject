/*
  # Create alerts table

  1. New Tables
    - `alerts`
      - `id` (uuid, primary key)
      - `type` (text, enum: delay, incident, system, payment)
      - `severity` (text, enum: low, medium, high, critical)
      - `title` (text)
      - `message` (text)
      - `delivery_id` (uuid, references deliveries, nullable)
      - `user_id` (uuid, references profiles, nullable)
      - `is_read` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `alerts` table
    - Add policies for users to view alerts related to them
    - Add policies for admins to manage all alerts
*/

CREATE TABLE IF NOT EXISTS alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('delay', 'incident', 'system', 'payment')),
  severity text NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title text NOT NULL,
  message text NOT NULL,
  delivery_id uuid REFERENCES deliveries(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_alerts_type ON alerts(type);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts(severity);
CREATE INDEX IF NOT EXISTS idx_alerts_delivery_id ON alerts(delivery_id);
CREATE INDEX IF NOT EXISTS idx_alerts_user_id ON alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_is_read ON alerts(is_read);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts(created_at);

ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- Users can read alerts related to them or their deliveries
CREATE POLICY "Users can read relevant alerts"
  ON alerts
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM deliveries
      WHERE id = alerts.delivery_id 
      AND (sender_id = auth.uid() OR recipient_id = auth.uid() OR courier_id = auth.uid())
    ) OR
    (type = 'system' AND user_id IS NULL) OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'courier')
    )
  );

-- Users can update read status of their own alerts
CREATE POLICY "Users can update own alerts"
  ON alerts
  FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM deliveries
      WHERE id = alerts.delivery_id 
      AND (sender_id = auth.uid() OR recipient_id = auth.uid() OR courier_id = auth.uid())
    ) OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'courier')
    )
  );

-- Admins and couriers can create alerts
CREATE POLICY "Admins and couriers can create alerts"
  ON alerts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'courier')
    )
  );

-- Admins can delete alerts
CREATE POLICY "Admins can delete alerts"
  ON alerts
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Trigger to update updated_at on alert changes
CREATE TRIGGER update_alerts_updated_at
  BEFORE UPDATE ON alerts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();