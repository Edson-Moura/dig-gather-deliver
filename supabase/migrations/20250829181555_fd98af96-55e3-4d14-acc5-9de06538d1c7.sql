-- Fix security vulnerabilities in subscribers table RLS policies

-- Drop existing insecure policies
DROP POLICY IF EXISTS "insert_subscription" ON public.subscribers;
DROP POLICY IF EXISTS "update_own_subscription" ON public.subscribers;

-- Create secure INSERT policy - only allow service role or authenticated users to insert their own records
CREATE POLICY "secure_insert_subscription" 
ON public.subscribers 
FOR INSERT 
WITH CHECK (
  -- Allow service role (for automated systems like Stripe webhooks)
  auth.jwt() ->> 'role' = 'service_role' 
  OR 
  -- Allow authenticated users to insert their own subscription
  (auth.uid() IS NOT NULL AND auth.uid() = user_id)
);

-- Create secure UPDATE policy - only allow users to update their own subscription or service role
CREATE POLICY "secure_update_subscription" 
ON public.subscribers 
FOR UPDATE 
USING (
  -- Allow service role (for automated systems like Stripe webhooks)
  auth.jwt() ->> 'role' = 'service_role' 
  OR 
  -- Allow users to update their own subscription
  (auth.uid() IS NOT NULL AND auth.uid() = user_id)
);