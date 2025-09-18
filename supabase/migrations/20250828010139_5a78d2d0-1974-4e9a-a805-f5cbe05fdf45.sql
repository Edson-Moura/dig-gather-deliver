-- Create sentences/phrases table
CREATE TABLE public.sentences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  english_text TEXT NOT NULL,
  portuguese_text TEXT NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  category TEXT,
  difficulty_score INTEGER DEFAULT 1 CHECK (difficulty_score >= 1 AND difficulty_score <= 5),
  audio_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user progress tracking table
CREATE TABLE public.user_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  sentence_id UUID NOT NULL REFERENCES public.sentences(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'learning', 'mastered', 'review_needed')),
  attempts INTEGER DEFAULT 0,
  correct_attempts INTEGER DEFAULT 0,
  last_practiced TIMESTAMP WITH TIME ZONE,
  mastered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, sentence_id)
);

-- Create daily activities tracking table
CREATE TABLE public.daily_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
  sentences_practiced INTEGER DEFAULT 0,
  sentences_mastered INTEGER DEFAULT 0,
  time_spent_minutes INTEGER DEFAULT 0,
  points_earned INTEGER DEFAULT 0,
  streak_maintained BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, activity_date)
);

-- Create lessons table for structured learning
CREATE TABLE public.lessons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  level TEXT NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  order_index INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lesson_sentences junction table
CREATE TABLE public.lesson_sentences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  sentence_id UUID NOT NULL REFERENCES public.sentences(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(lesson_id, sentence_id),
  UNIQUE(lesson_id, order_index)
);

-- Enable Row Level Security
ALTER TABLE public.sentences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_sentences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sentences (public read access)
CREATE POLICY "Sentences are viewable by everyone" 
ON public.sentences 
FOR SELECT 
USING (true);

-- RLS Policies for user_progress (user-specific)
CREATE POLICY "Users can view their own progress" 
ON public.user_progress 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress" 
ON public.user_progress 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" 
ON public.user_progress 
FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for daily_activities (user-specific)
CREATE POLICY "Users can view their own daily activities" 
ON public.daily_activities 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily activities" 
ON public.daily_activities 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily activities" 
ON public.daily_activities 
FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for lessons (public read access)
CREATE POLICY "Lessons are viewable by everyone" 
ON public.lessons 
FOR SELECT 
USING (is_active = true);

-- RLS Policies for lesson_sentences (public read access)
CREATE POLICY "Lesson sentences are viewable by everyone" 
ON public.lesson_sentences 
FOR SELECT 
USING (true);

-- Create triggers for updated_at columns
CREATE TRIGGER update_sentences_updated_at
BEFORE UPDATE ON public.sentences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at
BEFORE UPDATE ON public.user_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_daily_activities_updated_at
BEFORE UPDATE ON public.daily_activities
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lessons_updated_at
BEFORE UPDATE ON public.lessons
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_sentences_level ON public.sentences(level);
CREATE INDEX idx_sentences_category ON public.sentences(category);
CREATE INDEX idx_user_progress_user_id ON public.user_progress(user_id);
CREATE INDEX idx_user_progress_status ON public.user_progress(status);
CREATE INDEX idx_daily_activities_user_date ON public.daily_activities(user_id, activity_date);
CREATE INDEX idx_lessons_level_order ON public.lessons(level, order_index);

-- Insert sample sentences for testing
INSERT INTO public.sentences (english_text, portuguese_text, level, category, difficulty_score) VALUES
('Hello, how are you?', 'Olá, como você está?', 'beginner', 'greetings', 1),
('My name is John.', 'Meu nome é João.', 'beginner', 'introductions', 1),
('What time is it?', 'Que horas são?', 'beginner', 'time', 2),
('I like to read books.', 'Eu gosto de ler livros.', 'beginner', 'hobbies', 2),
('Where is the bathroom?', 'Onde fica o banheiro?', 'beginner', 'directions', 2),
('Can you help me, please?', 'Você pode me ajudar, por favor?', 'intermediate', 'requests', 3),
('I would like to order a coffee.', 'Eu gostaria de pedir um café.', 'intermediate', 'restaurant', 3),
('The weather is beautiful today.', 'O tempo está lindo hoje.', 'intermediate', 'weather', 3),
('I have been learning English for two years.', 'Eu tenho estudado inglês por dois anos.', 'advanced', 'experience', 4),
('If I had more time, I would travel around the world.', 'Se eu tivesse mais tempo, viajaria pelo mundo.', 'advanced', 'hypothetical', 5);

-- Insert sample lessons
INSERT INTO public.lessons (title, description, level, order_index) VALUES
('Primeiros Passos', 'Aprenda cumprimentos básicos e apresentações', 'beginner', 1),
('Informações Pessoais', 'Como falar sobre você mesmo', 'beginner', 2),
('No Restaurante', 'Vocabulário e frases para restaurantes', 'intermediate', 1),
('Conversas do Dia a Dia', 'Situações cotidianas em inglês', 'intermediate', 2),
('Expressões Avançadas', 'Estruturas mais complexas da língua', 'advanced', 1);

-- Link sentences to lessons
INSERT INTO public.lesson_sentences (lesson_id, sentence_id, order_index)
SELECT 
  l.id,
  s.id,
  ROW_NUMBER() OVER (PARTITION BY l.id ORDER BY s.difficulty_score)
FROM public.lessons l
JOIN public.sentences s ON s.level = l.level
WHERE l.title = 'Primeiros Passos' AND s.category IN ('greetings', 'introductions')
UNION ALL
SELECT 
  l.id,
  s.id,
  ROW_NUMBER() OVER (PARTITION BY l.id ORDER BY s.difficulty_score)
FROM public.lessons l
JOIN public.sentences s ON s.level = l.level
WHERE l.title = 'Informações Pessoais' AND s.category IN ('time', 'hobbies', 'directions')
UNION ALL
SELECT 
  l.id,
  s.id,
  ROW_NUMBER() OVER (PARTITION BY l.id ORDER BY s.difficulty_score)
FROM public.lessons l
JOIN public.sentences s ON s.level = l.level
WHERE l.title = 'No Restaurante' AND s.category IN ('restaurant', 'requests')
UNION ALL
SELECT 
  l.id,
  s.id,
  ROW_NUMBER() OVER (PARTITION BY l.id ORDER BY s.difficulty_score)
FROM public.lessons l
JOIN public.sentences s ON s.level = l.level
WHERE l.title = 'Conversas do Dia a Dia' AND s.category IN ('weather')
UNION ALL
SELECT 
  l.id,
  s.id,
  ROW_NUMBER() OVER (PARTITION BY l.id ORDER BY s.difficulty_score)
FROM public.lessons l
JOIN public.sentences s ON s.level = l.level
WHERE l.title = 'Expressões Avançadas' AND s.category IN ('experience', 'hypothetical');