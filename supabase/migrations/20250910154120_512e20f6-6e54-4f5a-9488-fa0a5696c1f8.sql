-- Fix security issue: Remove user access to contact messages
-- Only service roles should be able to view contact messages for privacy and security

-- Drop the policy that allows users to view their own contact messages
-- This prevents potential unauthorized access to sensitive customer communications
DROP POLICY IF EXISTS "Users can view their own contact messages" ON public.contact_messages;

-- The existing policies remain:
-- 1. "Anyone can submit contact messages" (INSERT) - allows form submissions
-- 2. "Service role can manage contact messages" (ALL) - allows admin access

-- Add comment for clarity
COMMENT ON TABLE public.contact_messages IS 'Contact form submissions - only accessible by service roles for security';