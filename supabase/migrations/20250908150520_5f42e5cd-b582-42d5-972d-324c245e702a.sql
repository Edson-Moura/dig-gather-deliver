-- Fix function search path issue
CREATE OR REPLACE FUNCTION validate_subscription_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Only allow service role to create/update subscriptions
  IF (auth.jwt() ->> 'role') != 'service_role' THEN
    RAISE EXCEPTION 'Only service role can manage subscription data';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;