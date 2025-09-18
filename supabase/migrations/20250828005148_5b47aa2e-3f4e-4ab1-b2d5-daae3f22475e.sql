-- Update profiles table to better support our language learning app
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS level TEXT DEFAULT 'beginner',
ADD COLUMN IF NOT EXISTS daily_goal INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS streak_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_activity DATE DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS total_phrases_learned INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0;

-- Add constraint for level
ALTER TABLE public.profiles 
ADD CONSTRAINT valid_level CHECK (level IN ('beginner', 'intermediate', 'advanced'));

-- Create trigger to automatically update profiles when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, level, daily_goal, streak_count, last_activity, total_phrases_learned, points)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'display_name', NEW.email), 'beginner', 5, 0, CURRENT_DATE, 0, 0);
  RETURN NEW;
END;
$$;

-- Create trigger for new users (if not exists)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();