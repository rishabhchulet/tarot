/*
  # Fix Automatic Trial Assignment Issue

  1. Problem:
    - Old migration automatically gives trials to any user without subscription record
    - New users should NOT get automatic trials
    - They should see upgrade options instead

  2. Solution:
    - Update handle_new_user to create subscription records without trial dates
    - Only start trials when users actively choose a plan
    - New users get "free" plan with no trial by default
*/

-- Drop the problematic automatic trial assignment
-- This removes the code that was giving all users without subscription records an automatic trial
DELETE FROM public.subscriptions 
WHERE trial_start_date IS NOT NULL 
  AND trial_end_date IS NOT NULL 
  AND has_active_subscription = false 
  AND subscription_type IS NULL;

-- Drop existing function and trigger to recreate them
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Create new handle_new_user function that creates subscription records WITHOUT trials
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create user profile
  INSERT INTO public.users (id, email, name, focus_area, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, CONCAT('user_', NEW.id, '@example.com')),
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    NULL,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = COALESCE(EXCLUDED.email, users.email),
    name = COALESCE(EXCLUDED.name, users.name),
    updated_at = NOW();

  -- Create subscription record WITHOUT trial dates (new users should see upgrade options)
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
    NULL, -- No subscription initially
    NULL, -- NO TRIAL START DATE
    NULL, -- NO TRIAL END DATE  
    false, -- Not a paid subscriber
    NULL, -- No subscription start date
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
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create a function to start trial when user chooses a plan
CREATE OR REPLACE FUNCTION public.start_user_trial(
  user_id_input UUID,
  subscription_type_input TEXT,
  trial_days INTEGER DEFAULT 7
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  trial_start_date timestamptz;
  trial_end_date timestamptz;
BEGIN
  trial_start_date := NOW();
  trial_end_date := trial_start_date + (trial_days || ' days')::INTERVAL;
  
  -- Update subscription record to start trial
  UPDATE public.subscriptions
  SET
    subscription_type = subscription_type_input,
    trial_start_date = trial_start_date,
    trial_end_date = trial_end_date,
    has_active_subscription = false, -- Still in trial
    subscription_start_date = NULL, -- Will be set after trial
    updated_at = NOW()
  WHERE user_id = user_id_input;
  
  -- Return success response
  RETURN json_build_object(
    'success', true,
    'subscription_type', subscription_type_input,
    'trial_start_date', trial_start_date,
    'trial_end_date', trial_end_date,
    'trial_days', trial_days,
    'message', 'Trial started successfully'
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Failed to start trial: ' || SQLERRM
    );
END;
$$;

-- Update the subscriptions table to allow NULL trial dates
ALTER TABLE public.subscriptions 
  ALTER COLUMN trial_start_date DROP NOT NULL,
  ALTER COLUMN trial_end_date DROP NOT NULL;

-- Log completion
DO $$
BEGIN
  RAISE LOG 'Fixed automatic trial assignment - new users will now see upgrade options instead of automatic trials';
END $$; 