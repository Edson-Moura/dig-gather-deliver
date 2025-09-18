-- Fix security vulnerability in subscribers table RLS policies
-- Remove email-based access and use only user_id for security

-- First, make user_id NOT NULL to ensure data integrity
ALTER TABLE public.subscribers ALTER COLUMN user_id SET NOT NULL;

-- Drop existing RLS policies
DROP POLICY IF EXISTS "select_own_subscription" ON public.subscribers;
DROP POLICY IF EXISTS "secure_update_subscription" ON public.subscribers;
DROP POLICY IF EXISTS "secure_insert_subscription" ON public.subscribers;

-- Create secure RLS policies that only use user_id matching
CREATE POLICY "secure_select_subscription" ON public.subscribers
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "secure_update_subscription" ON public.subscribers
FOR UPDATE
USING (((auth.jwt() ->> 'role'::text) = 'service_role'::text) OR (auth.uid() = user_id));

CREATE POLICY "secure_insert_subscription" ON public.subscribers
FOR INSERT
WITH CHECK (((auth.jwt() ->> 'role'::text) = 'service_role'::text) OR (auth.uid() = user_id));

-- Add unique constraint on user_id for better data integrity
ALTER TABLE public.subscribers ADD CONSTRAINT unique_user_subscription UNIQUE (user_id);

-- Update existing records to ensure user_id is properly set where it might be missing
-- This is safe because we're using the service role
UPDATE public.subscribers 
SET user_id = (
  SELECT id FROM auth.users 
  WHERE auth.users.email = subscribers.email
) 
WHERE user_id IS NULL;