-- Further harden subscribers table RLS policies
-- Remove ability for users to INSERT or UPDATE subscription data directly
-- Only service role should be able to modify subscription data

-- Drop the existing policies that allow user updates
DROP POLICY IF EXISTS "secure_update_subscription" ON public.subscribers;
DROP POLICY IF EXISTS "secure_insert_subscription" ON public.subscribers;

-- Create more restrictive policies - only service role can modify data
CREATE POLICY "service_role_only_insert" ON public.subscribers
FOR INSERT
WITH CHECK ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

CREATE POLICY "service_role_only_update" ON public.subscribers
FOR UPDATE
USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text);