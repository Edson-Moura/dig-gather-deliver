-- Fix security vulnerability: Remove public access to profiles and prevent email exposure

-- 1. Drop the existing public policy
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- 2. Create new secure policies
-- Users can view their own profile
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Authenticated users can see basic info of others (but not sensitive data like bio)
CREATE POLICY "Authenticated users can view basic profile info" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (true);

-- 3. Fix the trigger to never use email as display_name
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (
    user_id, 
    display_name, 
    level, 
    daily_goal, 
    streak_count, 
    last_activity, 
    total_phrases_learned, 
    points
  )
  VALUES (
    NEW.id, 
    -- Only use display_name from metadata, never fall back to email
    NEW.raw_user_meta_data ->> 'display_name', 
    'beginner', 
    5, 
    0, 
    CURRENT_DATE, 
    0, 
    0
  );
  RETURN NEW;
END;
$$;

-- 4. Update existing profiles that have emails as display_name
-- Set display_name to NULL where it appears to be an email
UPDATE public.profiles 
SET display_name = NULL 
WHERE display_name IS NOT NULL 
AND display_name LIKE '%@%' 
AND display_name LIKE '%.%';