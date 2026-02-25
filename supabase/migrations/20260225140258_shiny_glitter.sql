/*
  # Create route waypoints table

  1. New Tables
    - `route_waypoints`
      - `id` (uuid, primary key)
      - `route_id` (uuid, references routes)
      - `delivery_id` (uuid, references deliveries)
      - `address` (text)
      - `estimated_time` (timestamp)
      - `actual_time` (timestamp, nullable)
      - `status` (text, enum: pending, completed, failed)
      - `order_index` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `route_waypoints` table
    - Add policies for couriers to manage waypoints on their routes
    - Add policies for admins to view all waypoints
*/

CREATE TABLE IF NOT EXISTS route_waypoints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id uuid NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
  delivery_id uuid NOT NULL REFERENCES deliveries(id) ON DELETE CASCADE,
  address text NOT NULL,
  estimated_time timestamptz,
  actual_time timestamptz,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(route_id, delivery_id)
);

CREATE INDEX IF NOT EXISTS idx_route_waypoints_route_id ON route_waypoints(route_id);
CREATE INDEX IF NOT EXISTS idx_route_waypoints_delivery_id ON route_waypoints(delivery_id);
CREATE INDEX IF NOT EXISTS idx_route_waypoints_order ON route_waypoints(route_id, order_index);

ALTER TABLE route_waypoints ENABLE ROW LEVEL SECURITY;

-- Couriers can read and manage waypoints on their routes
CREATE POLICY "Couriers can read own route waypoints"
  ON route_waypoints
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM routes
      WHERE id = route_waypoints.route_id 
      AND (courier_id = auth.uid() OR EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'admin'
      ))
    )
  );

CREATE POLICY "Couriers can create waypoints on own routes"
  ON route_waypoints
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM routes
      WHERE id = route_waypoints.route_id 
      AND (courier_id = auth.uid() OR EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'admin'
      ))
    )
  );

CREATE POLICY "Couriers can update waypoints on own routes"
  ON route_waypoints
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM routes
      WHERE id = route_waypoints.route_id 
      AND (courier_id = auth.uid() OR EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role = 'admin'
      ))
    )
  );

-- Trigger to update updated_at on waypoint changes
CREATE TRIGGER update_route_waypoints_updated_at
  BEFORE UPDATE ON route_waypoints
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();