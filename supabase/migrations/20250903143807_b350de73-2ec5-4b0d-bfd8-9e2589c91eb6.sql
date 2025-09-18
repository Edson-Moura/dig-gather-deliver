-- Criar nova lição "Situações Cotidianas" para iniciantes
INSERT INTO public.lessons (title, description, level, order_index, is_active) 
VALUES (
  'Situações Cotidianas',
  'Aprenda inglês através de imagens de situações do dia a dia',
  'beginner',
  1,
  true
);

-- Inserir sentenças com contexto visual para situações cotidianas
INSERT INTO public.sentences (english_text, portuguese_text, level, category, difficulty_score) VALUES
('I am drinking coffee in the morning', 'Eu estou bebendo café de manhã', 'beginner', 'daily_situations', 1),
('She is cooking dinner in the kitchen', 'Ela está cozinhando o jantar na cozinha', 'beginner', 'daily_situations', 2),
('He is reading a book on the sofa', 'Ele está lendo um livro no sofá', 'beginner', 'daily_situations', 1),
('They are walking in the park', 'Eles estão caminhando no parque', 'beginner', 'daily_situations', 2),
('I am brushing my teeth', 'Eu estou escovando os dentes', 'beginner', 'daily_situations', 1),
('The family is eating breakfast', 'A família está tomando café da manhã', 'beginner', 'daily_situations', 2),
('She is shopping at the supermarket', 'Ela está fazendo compras no supermercado', 'beginner', 'daily_situations', 3),
('He is driving to work', 'Ele está dirigindo para o trabalho', 'beginner', 'daily_situations', 2),
('I am taking a shower', 'Eu estou tomando banho', 'beginner', 'daily_situations', 1),
('We are watching TV together', 'Nós estamos assistindo TV juntos', 'beginner', 'daily_situations', 2);

-- Conectar as sentenças à nova lição
WITH new_lesson AS (
  SELECT id FROM public.lessons WHERE title = 'Situações Cotidianas' AND level = 'beginner'
),
situation_sentences AS (
  SELECT id FROM public.sentences WHERE category = 'daily_situations' ORDER BY difficulty_score, created_at
)
INSERT INTO public.lesson_sentences (lesson_id, sentence_id, order_index)
SELECT 
  new_lesson.id,
  situation_sentences.id,
  ROW_NUMBER() OVER (ORDER BY situation_sentences.id) - 1
FROM new_lesson, situation_sentences;