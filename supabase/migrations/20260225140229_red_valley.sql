/*
  # Create driver profiles table

  1. New Tables
    - `driver_profiles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `country` (text)
      - `city` (text)
      - `vehicle_type` (text, enum: motorbike, car, truck)
      - `account_type` (text)
      - `is_active` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `driver_profiles` table
    - Add policy for drivers to read/update their own profile
    - Add policy for admins to read all driver profiles
*/

CREATE TABLE IF NOT EXISTS driver_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  country text NOT NULL,
  city text NOT NULL,
  vehicle_type text NOT NULL DEFAULT 'motorbike' CHECK (vehicle_type IN ('motorbike', 'car', 'truck')),
  account_type text NOT NULL DEFAULT 'individual',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE driver_profiles ENABLE ROW LEVEL SECURITY;

-- Drivers can read and update their own profile
CREATE POLICY "Drivers can read own profile"
  ON driver_profiles
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Drivers can update own profile"
  ON driver_profiles
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Drivers can insert own profile"
  ON driver_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Trigger to update updated_at on driver profile changes
CREATE TRIGGER update_driver_profiles_updated_at
  BEFORE UPDATE ON driver_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();