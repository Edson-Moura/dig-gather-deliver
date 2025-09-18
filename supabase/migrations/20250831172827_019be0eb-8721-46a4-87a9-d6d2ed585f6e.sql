-- Create a basic lesson for English greetings and introductions
INSERT INTO public.lessons (
  title, 
  description, 
  level, 
  order_index, 
  is_active
) VALUES (
  'Saudações e Apresentações',
  'Aprenda a cumprimentar pessoas e se apresentar em inglês de forma simples e prática',
  'beginner',
  1,
  true
);

-- Get the lesson ID for the sentences
WITH new_lesson AS (
  SELECT id FROM public.lessons WHERE title = 'Saudações e Apresentações'
)

-- Insert basic greeting and introduction sentences
INSERT INTO public.sentences (
  english_text,
  portuguese_text,
  level,
  category,
  difficulty_score
) VALUES 
  -- Basic greetings
  ('Hello', 'Olá', 'beginner', 'greetings', 1),
  ('Hi', 'Oi', 'beginner', 'greetings', 1),
  ('Good morning', 'Bom dia', 'beginner', 'greetings', 1),
  ('Good afternoon', 'Boa tarde', 'beginner', 'greetings', 1),
  ('Goodbye', 'Tchau', 'beginner', 'greetings', 1),
  
  -- Basic introductions
  ('My name is John', 'Meu nome é John', 'beginner', 'introductions', 2),
  ('What is your name?', 'Qual é o seu nome?', 'beginner', 'introductions', 2),
  ('Nice to meet you', 'Prazer em conhecê-lo', 'beginner', 'introductions', 2),
  ('How are you?', 'Como você está?', 'beginner', 'greetings', 2),
  ('I am fine', 'Eu estou bem', 'beginner', 'responses', 2),
  
  -- Simple phrases
  ('Thank you', 'Obrigado', 'beginner', 'politeness', 1),
  ('Please', 'Por favor', 'beginner', 'politeness', 1),
  ('Excuse me', 'Com licença', 'beginner', 'politeness', 2),
  ('See you later', 'Até mais tarde', 'beginner', 'greetings', 2),
  ('Have a good day', 'Tenha um bom dia', 'beginner', 'greetings', 3);

-- Link sentences to the lesson
WITH new_lesson AS (
  SELECT id as lesson_id FROM public.lessons WHERE title = 'Saudações e Apresentações'
),
lesson_sentences_data AS (
  SELECT 
    new_lesson.lesson_id,
    s.id as sentence_id,
    ROW_NUMBER() OVER (ORDER BY s.difficulty_score, s.english_text) as order_index
  FROM new_lesson
  CROSS JOIN public.sentences s
  WHERE s.category IN ('greetings', 'introductions', 'responses', 'politeness')
    AND s.level = 'beginner'
    AND s.created_at >= NOW() - INTERVAL '1 minute' -- Only newly created sentences
)
INSERT INTO public.lesson_sentences (lesson_id, sentence_id, order_index)
SELECT lesson_id, sentence_id, order_index
FROM lesson_sentences_data;