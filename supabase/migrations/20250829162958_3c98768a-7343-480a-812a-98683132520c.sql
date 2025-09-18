-- Fix security issue: Remove overly permissive profile access policy
-- This policy currently allows any authenticated user to view all profiles
DROP POLICY IF EXISTS "Authenticated users can view basic profile info" ON public.profiles;

-- Keep the secure policy that only allows users to view their own profiles
-- This policy already exists: "Users can view their own profile" with condition (auth.uid() = user_id)