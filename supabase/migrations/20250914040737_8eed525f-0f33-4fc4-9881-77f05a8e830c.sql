-- Fix security vulnerability in ebook_leads table
-- Enable RLS on ebook_leads table if not already enabled
ALTER TABLE public.ebook_leads ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Anyone can register for ebook" ON public.ebook_leads;
DROP POLICY IF EXISTS "Service role can view ebook leads" ON public.ebook_leads;

-- Allow anyone to register for ebook (INSERT only)
CREATE POLICY "Anyone can register for ebook" 
ON public.ebook_leads 
FOR INSERT 
WITH CHECK (true);

-- Only service role can view ebook leads (for backend processing)
CREATE POLICY "Service role can view ebook leads" 
ON public.ebook_leads 
FOR SELECT 
USING ((auth.jwt() ->> 'role') = 'service_role');

-- Only service role can update ebook leads (for marking as processed)
CREATE POLICY "Service role can update ebook leads" 
ON public.ebook_leads 
FOR UPDATE 
USING ((auth.jwt() ->> 'role') = 'service_role');