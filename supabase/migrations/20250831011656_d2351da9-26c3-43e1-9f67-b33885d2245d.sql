-- Enhanced security for subscribers table (simplified and corrected)

-- Add deletion policy to prevent unauthorized deletion
CREATE POLICY "prevent_subscriber_deletion" ON public.subscribers
FOR DELETE
USING (false);

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
  -- Mask email for security - show only partial info
  CASE 
    WHEN public.validate_subscriber_access(user_id) THEN email
    ELSE CONCAT(LEFT(email, 2), '***@***.***')
  END as email_display,
  -- Completely mask stripe_customer_id unless authorized
  CASE 
    WHEN public.validate_subscriber_access(user_id) THEN stripe_customer_id
    ELSE 'PROTECTED'
  END as stripe_display
FROM public.subscribers
WHERE public.validate_subscriber_access(user_id);

-- Grant access to the safe view
GRANT SELECT ON public.subscriber_safe_view TO authenticated;

-- Add security logging function
CREATE OR REPLACE FUNCTION public.log_subscriber_access_attempt(
  operation_type TEXT,
  user_id_accessed UUID DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  RAISE LOG 'SUBSCRIBER_ACCESS: user=%, operation=%, target_user=%, timestamp=%', 
    auth.uid(), operation_type, user_id_accessed, NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;