-- Fix security issue: Properly restrict access to ebook leads data
-- Replace overly restrictive policy with service-role-only access for legitimate business use

-- Drop the current restrictive policy that blocks all SELECT access
DROP POLICY IF EXISTS "Users cannot read ebook leads" ON public.ebook_leads;

-- Add proper policy that only allows service roles to view ebook leads
-- This prevents competitors from harvesting email addresses while allowing legitimate admin access
CREATE POLICY "Service role can view ebook leads" 
ON public.ebook_leads 
FOR SELECT 
USING ((auth.jwt() ->> 'role') = 'service_role');

-- The existing INSERT policy remains unchanged:
-- "Anyone can register for ebook" - allows form submissions to continue working

-- Add comment for clarity
COMMENT ON TABLE public.ebook_leads IS 'Ebook lead generation data - contains sensitive customer emails, only accessible by service roles';