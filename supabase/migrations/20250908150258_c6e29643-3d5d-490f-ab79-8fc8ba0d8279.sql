-- Fix RLS security issues for production (corrected)

-- Fix contact_messages security - add user-specific policies
CREATE POLICY "Anyone can submit contact messages" 
ON contact_messages FOR INSERT 
WITH CHECK (true);

-- Add policy for authenticated users to view their own contact messages
CREATE POLICY "Users can view their own contact messages" 
ON contact_messages FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND 
  email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- Fix subscribers table - add user access policy  
CREATE POLICY "Users can view own subscription data" 
ON subscribers FOR SELECT 
USING (auth.uid() = user_id);

-- Create function to validate subscription updates (security)
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

-- Add trigger to validate subscription operations
CREATE TRIGGER validate_subscription_user_trigger
  BEFORE INSERT OR UPDATE ON subscribers
  FOR EACH ROW EXECUTE FUNCTION validate_subscription_user();