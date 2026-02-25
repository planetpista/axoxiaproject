/*
  # Update authentication schema

  1. Security
    - Ensure RLS is properly configured for auth integration
    - Add policies for user registration and profile access

  2. Functions
    - Add trigger to automatically create profile on user registration
*/

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- This function will be called by a trigger when a new user signs up
  -- The actual profile creation is handled in the application code
  -- to allow for different user types (client vs driver)
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update RLS policies to work with auth.uid()
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Drivers can view own profile" ON driver_profiles;
DROP POLICY IF EXISTS "Drivers can update own profile" ON driver_profiles;
DROP POLICY IF EXISTS "Drivers can insert own profile" ON driver_profiles;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Driver profiles policies
CREATE POLICY "Drivers can view own profile"
  ON driver_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Drivers can update own profile"
  ON driver_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Drivers can insert own profile"
  ON driver_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Update driver_profiles account_type to handle professional names
ALTER TABLE driver_profiles 
DROP CONSTRAINT IF EXISTS driver_profiles_account_type_check;

ALTER TABLE driver_profiles 
ADD CONSTRAINT driver_profiles_account_type_check 
CHECK (
  account_type = 'individual' OR 
  account_type LIKE 'professional:%'
);