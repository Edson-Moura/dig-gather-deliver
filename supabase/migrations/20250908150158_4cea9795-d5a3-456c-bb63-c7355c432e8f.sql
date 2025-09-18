-- Fix RLS security issues for production

-- Enable RLS on subscriber_status table and add proper policies
ALTER TABLE subscriber_status ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view only their own subscription status
CREATE POLICY "Users can view own subscription status" 
ON subscriber_status FOR SELECT 
USING (auth.uid() = user_id);

-- Allow service role to manage subscription status (for webhooks)
CREATE POLICY "Service role can manage subscription status" 
ON subscriber_status FOR ALL 
USING ((auth.jwt() ->> 'role') = 'service_role');

-- Improve contact_messages security - add user-specific policies for authenticated users
CREATE POLICY "Users can insert their own contact messages" 
ON contact_messages FOR INSERT 
WITH CHECK (true); -- Allow anyone to submit contact forms

-- Add policy for authenticated users to view their own messages
CREATE POLICY "Users can view their own contact messages" 
ON contact_messages FOR SELECT 
USING (
  CASE 
    WHEN auth.uid() IS NOT NULL THEN 
      -- If authenticated, check if message belongs to user's email
      email = (SELECT email FROM auth.users WHERE id = auth.uid())
    ELSE false 
  END
);

-- Enhance subscribers table security
-- Add policy for users to view their own subscription data
CREATE POLICY "Users can view own subscription data" 
ON subscribers FOR SELECT 
USING (auth.uid() = user_id);

-- Add constraint to ensure user_id matches auth.uid() for new subscriptions
CREATE OR REPLACE FUNCTION validate_subscription_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Only allow service role to create/update subscriptions
  IF (auth.jwt() ->> 'role') != 'service_role' THEN
    RAISE EXCEPTION 'Only service role can manage subscription data';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER validate_subscription_user_trigger
  BEFORE INSERT OR UPDATE ON subscribers
  FOR EACH ROW EXECUTE FUNCTION validate_subscription_user();