/*
  # Add astrology fields to users table

  1. New Columns
    - `birth_date` (date) - User's birth date for astrological calculations
    - `birth_time` (time) - User's birth time for precise chart calculations
    - `birth_location` (text) - User's birth location description
    - `latitude` (decimal) - Latitude coordinates for birth location
    - `longitude` (decimal) - Longitude coordinates for birth location
    - `onboarding_step` (text) - Track user's onboarding progress

  2. Updates
    - Add indexes for performance
    - Ensure proper data types for astrological calculations
*/

-- Add astrology-related fields to users table
DO $$
BEGIN
  -- Add birth_date column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'birth_date'
  ) THEN
    ALTER TABLE users ADD COLUMN birth_date date;
  END IF;

  -- Add birth_time column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'birth_time'
  ) THEN
    ALTER TABLE users ADD COLUMN birth_time time;
  END IF;

  -- Add birth_location column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'birth_location'
  ) THEN
    ALTER TABLE users ADD COLUMN birth_location text;
  END IF;

  -- Add latitude column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'latitude'
  ) THEN
    ALTER TABLE users ADD COLUMN latitude decimal(10, 8);
  END IF;

  -- Add longitude column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'longitude'
  ) THEN
    ALTER TABLE users ADD COLUMN longitude decimal(11, 8);
  END IF;

  -- Add onboarding_step column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'onboarding_step'
  ) THEN
    ALTER TABLE users ADD COLUMN onboarding_step text;
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_birth_date ON users(birth_date);
CREATE INDEX IF NOT EXISTS idx_users_onboarding_step ON users(onboarding_step);
CREATE INDEX IF NOT EXISTS idx_users_location ON users(latitude, longitude);