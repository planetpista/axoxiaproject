/*
  # Create delivery status history table

  1. New Tables
    - `delivery_status_history`
      - `id` (uuid, primary key)
      - `delivery_id` (uuid, references deliveries)
      - `status` (text)
      - `notes` (text, nullable)
      - `changed_by` (uuid, references profiles)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `delivery_status_history` table
    - Add policies for users to view history of their deliveries
    - Add policies for admins to view all history
*/

CREATE TABLE IF NOT EXISTS delivery_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_id uuid NOT NULL REFERENCES deliveries(id) ON DELETE CASCADE,
  status text NOT NULL,
  notes text,
  changed_by uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_delivery_status_history_delivery_id ON delivery_status_history(delivery_id);
CREATE INDEX IF NOT EXISTS idx_delivery_status_history_created_at ON delivery_status_history(created_at);

ALTER TABLE delivery_status_history ENABLE ROW LEVEL SECURITY;

-- Users can read status history for their deliveries
CREATE POLICY "Users can read own delivery status history"
  ON delivery_status_history
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM deliveries
      WHERE id = delivery_status_history.delivery_id 
      AND (sender_id = auth.uid() OR recipient_id = auth.uid() OR courier_id = auth.uid())
    ) OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Couriers and admins can create status history entries
CREATE POLICY "Couriers and admins can create status history"
  ON delivery_status_history
  FOR INSERT
  TO authenticated
  WITH CHECK (
    changed_by = auth.uid() AND
    (EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'courier')
    ) OR
    EXISTS (
      SELECT 1 FROM deliveries
      WHERE id = delivery_status_history.delivery_id 
      AND (sender_id = auth.uid() OR courier_id = auth.uid())
    ))
  );

-- Function to automatically log status changes
CREATE OR REPLACE FUNCTION log_delivery_status_change()
RETURNS trigger AS $$
BEGIN
  -- Only log if status actually changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO delivery_status_history (delivery_id, status, notes, changed_by)
    VALUES (NEW.id, NEW.status, 'Status changed from ' || COALESCE(OLD.status, 'null') || ' to ' || NEW.status, auth.uid());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically log status changes
CREATE TRIGGER log_delivery_status_changes
  AFTER UPDATE ON deliveries
  FOR EACH ROW EXECUTE FUNCTION log_delivery_status_change();