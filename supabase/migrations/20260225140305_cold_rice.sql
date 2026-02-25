/*
  # Create financial records table

  1. New Tables
    - `financial_records`
      - `id` (uuid, primary key)
      - `delivery_id` (uuid, references deliveries)
      - `type` (text, enum: revenue, cost, refund)
      - `amount` (numeric)
      - `currency` (text)
      - `description` (text)
      - `payment_method` (text)
      - `payment_status` (text, enum: pending, completed, failed, refunded)
      - `payment_reference` (text, nullable)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `financial_records` table
    - Add policies for users to view their own financial records
    - Add policies for admins to view all financial records
*/

CREATE TABLE IF NOT EXISTS financial_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_id uuid NOT NULL REFERENCES deliveries(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('revenue', 'cost', 'refund')),
  amount numeric NOT NULL CHECK (amount >= 0),
  currency text NOT NULL DEFAULT 'EUR',
  description text NOT NULL,
  payment_method text NOT NULL,
  payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_reference text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_financial_records_delivery_id ON financial_records(delivery_id);
CREATE INDEX IF NOT EXISTS idx_financial_records_type ON financial_records(type);
CREATE INDEX IF NOT EXISTS idx_financial_records_status ON financial_records(payment_status);
CREATE INDEX IF NOT EXISTS idx_financial_records_created_at ON financial_records(created_at);

ALTER TABLE financial_records ENABLE ROW LEVEL SECURITY;

-- Users can read financial records for their own deliveries
CREATE POLICY "Users can read own financial records"
  ON financial_records
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM deliveries
      WHERE id = financial_records.delivery_id 
      AND (sender_id = auth.uid() OR recipient_id = auth.uid())
    ) OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can create/update financial records
CREATE POLICY "Admins can manage financial records"
  ON financial_records
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Trigger to update updated_at on financial record changes
CREATE TRIGGER update_financial_records_updated_at
  BEFORE UPDATE ON financial_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();