-- Enhanced security measures for subscribers table (final corrected version)

-- Add deletion policy to prevent unauthorized deletion
CREATE POLICY "prevent_subscriber_deletion" ON public.subscribers
FOR DELETE
USING (false); -- Nobody can delete subscriber records

-- Create a security definer function to validate authenticated access
CREATE OR REPLACE FUNCTION public.validate_subscriber_access(target_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  current_user_id UUID;
BEGIN
  -- Get the current authenticated user ID
  current_user_id := auth.uid();
  
  -- Return false if no authenticated user
  IF current_user_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Return true only if the current user matches the target user
  RETURN current_user_id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Drop existing select policy and create a more secure one
DROP POLICY IF EXISTS "secure_select_subscription" ON public.subscribers;

-- Create enhanced select policy using the security definer function
CREATE POLICY "enhanced_secure_select_subscription" ON public.subscribers
FOR SELECT
USING (public.validate_subscriber_access(user_id));

-- Ensure user_id is not nullable (check if it's already NOT NULL)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'subscribers' 
    AND column_name = 'user_id'
    AND is_nullable = 'YES'
  ) THEN
    ALTER TABLE public.subscribers ALTER COLUMN user_id SET NOT NULL;
  END IF;
END $$;

-- Create a secure view that masks sensitive data
CREATE OR REPLACE VIEW public.subscriber_safe_view AS
SELECT 
  id,
  user_id,
  subscribed,
  subscription_tier,
  subscription_end,
  created_at,
  updated_at,
  -- Mask email partially for security
  CASE 
    WHEN public.validate_subscriber_access(user_id) THEN email
    ELSE '***@***.***'
  END as email_safe,
  -- Show stripe_customer_id only to authorized users
  CASE 
    WHEN public.validate_subscriber_access(user_id) THEN stripe_customer_id
    ELSE '***MASKED***'
  END as stripe_customer_id_safe
FROM public.subscribers
WHERE public.validate_subscriber_access(user_id);

-- Grant access to the safe view for authenticated users
GRANT SELECT ON public.subscriber_safe_view TO authenticated;

-- Add a function to log security events (for monitoring)
CREATE OR REPLACE FUNCTION public.log_security_event(
  event_type TEXT,
  table_name TEXT,
  user_id UUID DEFAULT auth.uid()
)
RETURNS VOID AS $$
BEGIN
  -- Log security events for monitoring
  RAISE LOG 'SECURITY_EVENT: type=%, table=%, user_id=%, timestamp=%', 
    event_type, table_name, user_id, NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;