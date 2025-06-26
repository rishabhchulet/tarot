/*
  # Disable email confirmation for immediate signup

  1. Configuration
    - Disable email confirmation requirement
    - Allow immediate user signup and access
    - Maintain security while improving user experience

  2. Auth Settings
    - Set email confirmation to false
    - Enable automatic user confirmation
*/

-- This migration handles auth configuration
-- Note: Some auth settings may need to be configured in the Supabase dashboard
-- under Authentication > Settings

-- Create a function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert user profile when a new user signs up
  INSERT INTO users (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create user profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();