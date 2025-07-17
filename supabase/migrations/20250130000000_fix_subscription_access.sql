/*
  # Fix Subscription Access Issues

  1. Ensure all existing users have subscription records
  2. Update handle_new_user to create subscription records
  3. Add helper functions for subscription management
*/

-- First, ensure all existing users have subscription records
INSERT INTO public.subscriptions (
  user_id,
  subscription_type,
  trial_start_date,
  trial_end_date,
  has_active_subscription,
  subscription_start_date,
  created_at,
  updated_at
)
SELECT 
  u.id,
  NULL, -- No paid subscription initially
  NOW(), -- Trial starts now
  NOW() + INTERVAL '7 days', -- 7 day trial
  false, -- Not yet a paid subscriber
  NULL, -- No paid subscription start date
  NOW(),
  NOW()
FROM public.users u
WHERE u.id NOT IN (SELECT user_id FROM public.subscriptions)
ON CONFLICT (user_id) DO NOTHING;

-- Create or replace the handle_new_user function to include subscription creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_email text;
  user_name text;
  trial_start_date timestamptz;
  trial_end_date timestamptz;
BEGIN
  -- Extract user data safely
  user_email := COALESCE(NEW.email, CONCAT('user_', NEW.id, '@example.com'));
  user_name := COALESCE(NEW.raw_user_meta_data->>'name', 'User');
  
  -- Calculate trial dates (7 days trial for new users)
  trial_start_date := NOW();
  trial_end_date := NOW() + INTERVAL '7 days';
  
  -- Insert user profile
  INSERT INTO public.users (id, email, name, archetype, created_at, updated_at)
  VALUES (
    NEW.id,
    user_email,
    user_name,
    NULL,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, users.name),
    updated_at = NOW();
  
  -- Create subscription record with trial
  INSERT INTO public.subscriptions (
    user_id,
    subscription_type,
    trial_start_date,
    trial_end_date,
    has_active_subscription,
    subscription_start_date,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NULL, -- No paid subscription initially
    trial_start_date,
    trial_end_date,
    false, -- Not yet a paid subscriber
    NULL, -- No paid subscription start date
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    updated_at = NOW();
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the auth process
    RAISE LOG 'Error in handle_new_user for %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add helper function to activate subscription
CREATE OR REPLACE FUNCTION public.activate_user_subscription(
  user_id_input UUID,
  subscription_type_input TEXT,
  duration_months INTEGER DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  start_date timestamptz;
  end_date timestamptz;
BEGIN
  start_date := NOW();
  
  -- Calculate end date based on subscription type
  IF subscription_type_input = 'lifetime' THEN
    end_date := NULL; -- Lifetime subscriptions never expire
  ELSIF subscription_type_input = 'yearly' THEN
    end_date := start_date + INTERVAL '1 year';
  ELSIF subscription_type_input = 'weekly' THEN
    end_date := start_date + INTERVAL '1 week';
  ELSIF duration_months IS NOT NULL THEN
    end_date := start_date + (duration_months || ' months')::INTERVAL;
  ELSE
    end_date := start_date + INTERVAL '1 year'; -- Default to yearly
  END IF;
  
  -- Update subscription record
  UPDATE public.subscriptions
  SET
    subscription_type = subscription_type_input,
    has_active_subscription = true,
    subscription_start_date = start_date,
    trial_end_date = start_date, -- End trial immediately when subscribing
    updated_at = NOW()
  WHERE user_id = user_id_input;
  
  -- Return success response
  RETURN json_build_object(
    'success', true,
    'subscription_type', subscription_type_input,
    'start_date', start_date,
    'end_date', end_date,
    'message', 'Subscription activated successfully'
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Failed to activate subscription: ' || SQLERRM
    );
END;
$$;

-- Ensure proper RLS policies are in place
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Clean up any conflicting subscription policies
DROP POLICY IF EXISTS "subscriptions_all_operations" ON public.subscriptions;

-- Create comprehensive subscription policies
CREATE POLICY "subscriptions_insert_own"
  ON public.subscriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "subscriptions_select_own"
  ON public.subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "subscriptions_update_own"
  ON public.subscriptions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_active_type ON public.subscriptions(user_id, has_active_subscription, subscription_type);

-- Log completion
DO $$
BEGIN
  RAISE LOG 'Subscription access migration completed successfully';
END $$; 