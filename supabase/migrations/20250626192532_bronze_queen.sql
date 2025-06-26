/*
  # Fix User Creation Database Error

  1. Function Updates
    - Drop trigger first to avoid dependency issues
    - Recreate handle_new_user function with better error handling
    - Add proper fallbacks and validation
    - Handle unique violations gracefully

  2. Table Constraints
    - Add default values for required columns
    - Add check constraints for data validation
    - Ensure proper data integrity

  3. Security
    - Maintain RLS protection
    - Ensure proper error handling without exposing sensitive data
*/

-- Drop the trigger first to avoid dependency issues
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Now we can safely drop and recreate the function
DROP FUNCTION IF EXISTS handle_new_user();

-- Create the improved handle_new_user function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_name text;
  user_email text;
BEGIN
  -- Safely extract user data with fallbacks
  user_email := COALESCE(NEW.email, '');
  user_name := COALESCE(NEW.raw_user_meta_data->>'name', 'User');
  
  -- Ensure we have required data
  IF user_email = '' THEN
    RAISE EXCEPTION 'User email is required';
  END IF;
  
  -- Insert user profile with proper error handling
  BEGIN
    INSERT INTO users (id, email, name, focus_area, created_at, updated_at)
    VALUES (
      NEW.id,
      user_email,
      user_name,
      NULL, -- focus_area will be set during onboarding
      NOW(),
      NOW()
    );
    
    RAISE LOG 'Successfully created user profile for: %', NEW.id;
    
  EXCEPTION 
    WHEN unique_violation THEN
      -- User profile already exists, update it instead
      UPDATE users 
      SET 
        email = user_email,
        name = user_name,
        updated_at = NOW()
      WHERE id = NEW.id;
      
      RAISE LOG 'Updated existing user profile for: %', NEW.id;
      
    WHEN OTHERS THEN
      -- Log the error but don't fail the auth creation
      RAISE LOG 'Error creating user profile for %: %', NEW.id, SQLERRM;
      -- Re-raise the exception to fail the trigger
      RAISE;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Ensure the users table has proper constraints and defaults
ALTER TABLE users ALTER COLUMN name SET DEFAULT 'User';
ALTER TABLE users ALTER COLUMN created_at SET DEFAULT NOW();
ALTER TABLE users ALTER COLUMN updated_at SET DEFAULT NOW();

-- Add a check constraint to ensure email is not empty
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'users_email_not_empty'
  ) THEN
    ALTER TABLE users ADD CONSTRAINT users_email_not_empty CHECK (email != '');
  END IF;
END $$;

-- Add a check constraint to ensure name is not empty
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'users_name_not_empty'
  ) THEN
    ALTER TABLE users ADD CONSTRAINT users_name_not_empty CHECK (name != '');
  END IF;
END $$;