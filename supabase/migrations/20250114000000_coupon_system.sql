-- Create coupon codes table
CREATE TABLE coupon_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('trial', 'subscription')),
  duration_type TEXT NOT NULL CHECK (duration_type IN ('days', 'months', 'years', 'lifetime')),
  duration_value INTEGER, -- null for lifetime
  subscription_plan TEXT CHECK (subscription_plan IN ('weekly', 'yearly', 'lifetime')), -- for subscription type coupons
  uses_total INTEGER NOT NULL DEFAULT 1,
  uses_remaining INTEGER NOT NULL DEFAULT 1,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_duration CHECK (
    (duration_type = 'lifetime' AND duration_value IS NULL) OR
    (duration_type != 'lifetime' AND duration_value > 0)
  ),
  
  CONSTRAINT valid_subscription_coupon CHECK (
    (type = 'subscription' AND subscription_plan IS NOT NULL) OR
    (type = 'trial' AND subscription_plan IS NULL)
  )
);

-- Create coupon redemptions tracking table
CREATE TABLE coupon_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID NOT NULL REFERENCES coupon_codes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  redeemed_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ, -- when this redemption expires
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  -- Prevent duplicate redemptions by same user for same coupon
  UNIQUE(coupon_id, user_id)
);

-- Add coupon-related fields to users table
ALTER TABLE users 
ADD COLUMN coupon_subscription_plan TEXT CHECK (coupon_subscription_plan IN ('weekly', 'yearly', 'lifetime')),
ADD COLUMN coupon_expires_at TIMESTAMPTZ,
ADD COLUMN active_coupon_id UUID REFERENCES coupon_codes(id);

-- Create indexes for performance
CREATE INDEX idx_coupon_codes_code ON coupon_codes(code);
CREATE INDEX idx_coupon_codes_active ON coupon_codes(is_active, expires_at);
CREATE INDEX idx_coupon_redemptions_user ON coupon_redemptions(user_id, is_active);
CREATE INDEX idx_coupon_redemptions_expires ON coupon_redemptions(expires_at, is_active);
CREATE INDEX idx_users_coupon_active ON users(active_coupon_id, coupon_expires_at);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for coupon codes updated_at
CREATE TRIGGER update_coupon_codes_updated_at 
  BEFORE UPDATE ON coupon_codes 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE coupon_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_redemptions ENABLE ROW LEVEL SECURITY;

-- Users can view active, non-expired coupon codes (for validation)
CREATE POLICY "Users can view active coupon codes" ON coupon_codes
  FOR SELECT USING (
    is_active = true AND 
    (expires_at IS NULL OR expires_at > NOW()) AND
    uses_remaining > 0
  );

-- Users can view their own redemptions
CREATE POLICY "Users can view own redemptions" ON coupon_redemptions
  FOR SELECT USING (auth.uid() = user_id);

-- Only authenticated users can redeem coupons (insert redemptions)
CREATE POLICY "Authenticated users can redeem coupons" ON coupon_redemptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to redeem a coupon code
CREATE OR REPLACE FUNCTION redeem_coupon_code(
  coupon_code_input TEXT,
  user_id_input UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  coupon_record coupon_codes%ROWTYPE;
  redemption_id UUID;
  expiry_date TIMESTAMPTZ;
  result JSON;
BEGIN
  -- Find and validate coupon
  SELECT * INTO coupon_record
  FROM coupon_codes
  WHERE code = coupon_code_input
    AND is_active = true
    AND uses_remaining > 0
    AND (expires_at IS NULL OR expires_at > NOW());
  
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Invalid or expired coupon code',
      'error_code', 'INVALID_COUPON'
    );
  END IF;
  
  -- Check if user already redeemed this coupon
  IF EXISTS (
    SELECT 1 FROM coupon_redemptions 
    WHERE coupon_id = coupon_record.id AND user_id = user_id_input
  ) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'You have already used this coupon code',
      'error_code', 'ALREADY_REDEEMED'
    );
  END IF;
  
  -- Calculate expiry date based on coupon type
  IF coupon_record.duration_type = 'lifetime' THEN
    expiry_date := NULL;
  ELSIF coupon_record.duration_type = 'days' THEN
    expiry_date := NOW() + (coupon_record.duration_value || ' days')::INTERVAL;
  ELSIF coupon_record.duration_type = 'months' THEN
    expiry_date := NOW() + (coupon_record.duration_value || ' months')::INTERVAL;
  ELSIF coupon_record.duration_type = 'years' THEN
    expiry_date := NOW() + (coupon_record.duration_value || ' years')::INTERVAL;
  END IF;
  
  -- Start transaction
  BEGIN
    -- Create redemption record
    INSERT INTO coupon_redemptions (coupon_id, user_id, expires_at)
    VALUES (coupon_record.id, user_id_input, expiry_date)
    RETURNING id INTO redemption_id;
    
    -- Update coupon uses
    UPDATE coupon_codes
    SET uses_remaining = uses_remaining - 1,
        updated_at = NOW()
    WHERE id = coupon_record.id;
    
    -- Update user's coupon status
    IF coupon_record.type = 'subscription' THEN
      UPDATE users
      SET coupon_subscription_plan = coupon_record.subscription_plan,
          coupon_expires_at = expiry_date,
          active_coupon_id = coupon_record.id
      WHERE id = user_id_input;
    ELSE -- trial type
      UPDATE users
      SET coupon_expires_at = expiry_date,
          active_coupon_id = coupon_record.id
      WHERE id = user_id_input;
    END IF;
    
    -- Return success
    result := json_build_object(
      'success', true,
      'redemption_id', redemption_id,
      'coupon_type', coupon_record.type,
      'duration_type', coupon_record.duration_type,
      'duration_value', coupon_record.duration_value,
      'subscription_plan', coupon_record.subscription_plan,
      'expires_at', expiry_date
    );
    
    RETURN result;
    
  EXCEPTION WHEN OTHERS THEN
    -- Rollback happens automatically
    RETURN json_build_object(
      'success', false,
      'error', 'Failed to redeem coupon: ' || SQLERRM,
      'error_code', 'REDEMPTION_FAILED'
    );
  END;
END;
$$;

-- Function to check if user has active coupon
CREATE OR REPLACE FUNCTION get_user_coupon_status(user_id_input UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_record users%ROWTYPE;
  coupon_record coupon_codes%ROWTYPE;
  result JSON;
BEGIN
  -- Get user coupon info
  SELECT * INTO user_record
  FROM users
  WHERE id = user_id_input;
  
  IF NOT FOUND THEN
    RETURN json_build_object('has_active_coupon', false);
  END IF;
  
  -- Check if coupon is still active
  IF user_record.active_coupon_id IS NOT NULL AND 
     (user_record.coupon_expires_at IS NULL OR user_record.coupon_expires_at > NOW()) THEN
    
    -- Get coupon details
    SELECT * INTO coupon_record
    FROM coupon_codes
    WHERE id = user_record.active_coupon_id;
    
    result := json_build_object(
      'has_active_coupon', true,
      'coupon_type', coupon_record.type,
      'subscription_plan', user_record.coupon_subscription_plan,
      'expires_at', user_record.coupon_expires_at,
      'is_lifetime', user_record.coupon_expires_at IS NULL
    );
  ELSE
    -- Clear expired coupon
    UPDATE users
    SET coupon_subscription_plan = NULL,
        coupon_expires_at = NULL,
        active_coupon_id = NULL
    WHERE id = user_id_input;
    
    result := json_build_object('has_active_coupon', false);
  END IF;
  
  RETURN result;
END;
$$;

-- Insert some sample coupon codes for testing
INSERT INTO coupon_codes (code, type, duration_type, duration_value, uses_total, uses_remaining, subscription_plan) VALUES
('WELCOME30', 'trial', 'days', 30, 100, 100, NULL),
('PREMIUM1MONTH', 'subscription', 'months', 1, 50, 50, 'yearly'),
('PREMIUM6MONTHS', 'subscription', 'months', 6, 20, 20, 'yearly'),
('LIFETIMEACCESS', 'subscription', 'lifetime', NULL, 5, 5, 'lifetime'),
('BETA2024', 'trial', 'months', 2, 200, 200, NULL); 