-- Enhanced security measures for subscribers table
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

-- Add additional constraint to ensure user_id is never null
ALTER TABLE public.subscribers 
ALTER COLUMN user_id SET NOT NULL;

-- Create a view that masks sensitive data for additional security layer
CREATE OR REPLACE VIEW public.subscriber_safe_view AS
SELECT 
  id,
  user_id,
  subscribed,
  subscription_tier,
  subscription_end,
  created_at,
  updated_at,
  -- Mask email to show only first 3 chars
  CASE 
    WHEN public.validate_subscriber_access(user_id) THEN email
    ELSE CONCAT(LEFT(email, 3), '***@***.***')
  END as email,
  -- Mask stripe_customer_id completely for additional security
  CASE 
    WHEN public.validate_subscriber_access(user_id) THEN stripe_customer_id
    ELSE '***MASKED***'
  END as stripe_customer_id
FROM public.subscribers
WHERE public.validate_subscriber_access(user_id);

-- Grant access to the safe view
GRANT SELECT ON public.subscriber_safe_view TO authenticated;

-- Add logging function for security events
CREATE OR REPLACE FUNCTION public.log_subscriber_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Log access attempts for monitoring
  RAISE LOG 'Subscriber data accessed by user: %, table: %, operation: %', 
    auth.uid(), TG_TABLE_NAME, TG_OP;
  
  -- For SELECT operations, return the selected row
  IF TG_OP = 'SELECT' THEN
    RETURN NEW;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for logging access
DROP TRIGGER IF EXISTS subscriber_access_log ON public.subscribers;
CREATE TRIGGER subscriber_access_log
  AFTER SELECT ON public.subscribers
  FOR EACH ROW EXECUTE FUNCTION public.log_subscriber_access();