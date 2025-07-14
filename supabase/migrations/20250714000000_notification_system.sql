/*
  # Enhanced Notification System

  1. New Tables
    - `notification_templates` - Store dynamic notification messages
    - Updates to `users` table for notification preferences

  2. Features
    - Remote message management
    - Seasonal/special event messages
    - User customizable preferences
    - A/B testing support
*/

-- Create notification templates table
CREATE TABLE IF NOT EXISTS notification_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL CHECK (category IN ('daily', 'seasonal', 'special', 'milestone')),
  title text NOT NULL,
  body text NOT NULL,
  emoji text DEFAULT '✨',
  active boolean DEFAULT true,
  priority integer DEFAULT 1, -- Higher numbers = higher priority
  start_date date,
  end_date date,
  target_audience text DEFAULT 'all', -- 'all', 'new_users', 'active_users', etc.
  ab_test_group text, -- For A/B testing different messages
  usage_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add notification preferences to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{
  "enabled": true,
  "preferredTime": "09:00",
  "messageStyle": "mystical",
  "weekendsEnabled": true,
  "timezone": "UTC",
  "lastNotificationUpdate": null
}'::jsonb;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notification_templates_category ON notification_templates(category);
CREATE INDEX IF NOT EXISTS idx_notification_templates_active ON notification_templates(active);
CREATE INDEX IF NOT EXISTS idx_notification_templates_dates ON notification_templates(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_users_notification_prefs ON users USING gin(notification_preferences);

-- Insert default mystical notification messages
INSERT INTO notification_templates (category, title, body, emoji, priority) VALUES 
-- Daily mystical messages
('daily', 'Your cosmic guidance awaits', 'The universe has woven messages into the cards today. What wisdom will you discover?', '✨', 1),
('daily', 'Listen to your soul''s whisper', 'Your inner voice is calling through the ancient symbols. Draw your daily card now.', '🌙', 1),
('daily', 'The veil between worlds is thin', 'Spiritual guidance flows freely today. Let the cards illuminate your path forward.', '🔮', 1),
('daily', 'Your inner wisdom stirs', 'Deep within, your soul knows the answers. Connect with your daily reflection.', '💫', 1),
('daily', 'Ancient wisdom beckons', 'The cards hold secrets from ages past. Unlock today''s message for your journey.', '🏛️', 1),

-- Gentle daily messages
('daily', 'A moment for your soul', 'Take a sacred pause in your day. Your reflection awaits with gentle guidance.', '🌸', 1),
('daily', 'Breathe and receive', 'In stillness, clarity emerges. Draw your card and listen to your heart.', '🍃', 1),
('daily', 'Your daily sanctuary', 'Create a moment of peace with your inner wisdom practice.', '🕯️', 1),

-- Motivational daily messages  
('daily', 'Unlock your inner power', 'Your potential is infinite. Let today''s card reveal your hidden strengths.', '⚡', 1),
('daily', 'Transform your day', 'Every moment holds possibility. Connect with your guidance and step forward boldly.', '🚀', 1),
('daily', 'Your journey continues', 'Each day brings new opportunities for growth. What will the cards reveal?', '🌟', 1),

-- Seasonal messages (examples)
('seasonal', 'New Moon Magic', 'The dark moon invites new beginnings. Set intentions with your daily draw.', '🌑', 2),
('seasonal', 'Full Moon Illumination', 'The full moon''s light reveals hidden truths. What clarity awaits in your cards?', '🌕', 2),
('seasonal', 'Spring Awakening', 'As nature awakens, so does your inner wisdom. Welcome the season with reflection.', '🌱', 2),
('seasonal', 'Summer Solstice Power', 'The longest day brings maximum light. Harness this energy in your daily practice.', '☀️', 2),
('seasonal', 'Autumn Wisdom', 'As leaves fall, old patterns release. What wisdom will emerge from change?', '🍂', 2),
('seasonal', 'Winter Solstice Depth', 'In the darkest hour, inner light shines brightest. Seek wisdom within.', '❄️', 2),

-- Special event messages
('special', 'Mercury Retrograde Navigation', 'Communication may be cloudy, but your inner compass is clear. Trust your intuition.', '☿️', 3),
('special', 'Eclipse Portal Opening', 'Powerful transformation energy flows. What changes does your soul call for?', '🌘', 3),
('special', 'Venus Retrograde Reflection', 'Love and values are under review. What does your heart truly desire?', '♀️', 3),

-- Milestone messages
('milestone', '7-Day Streak Magic!', 'Seven days of inner connection! Your dedication is opening new pathways.', '🔥', 3),
('milestone', 'One Month of Wisdom', 'Thirty days of spiritual practice! Feel how your intuition has grown.', '🌟', 3),
('milestone', 'Three Months Strong', 'Your commitment to inner wisdom is transforming your life. Celebrate this journey!', '💎', 3),
('milestone', 'Half Year Sage', 'Six months of daily reflection has awakened the sage within you.', '👑', 3),
('milestone', 'One Year Mystic', 'A full year of inner connection! You are a beacon of wisdom and growth.', '🏆', 3);

-- Enable Row Level Security
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;

-- Create policy for reading notification templates (public read access)
CREATE POLICY "Anyone can read active notification templates"
  ON notification_templates
  FOR SELECT
  USING (active = true);

-- Create policy for admins to manage templates (you can restrict this later)
CREATE POLICY "Authenticated users can manage notification templates"
  ON notification_templates
  FOR ALL
  TO authenticated
  USING (true);

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_notification_template_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_notification_templates_updated_at
  BEFORE UPDATE ON notification_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_notification_template_updated_at(); 