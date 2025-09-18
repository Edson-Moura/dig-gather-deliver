-- Adicionar conteúdo de exemplo para testar o aplicativo

-- Inserir frases de exemplo para diferentes níveis
INSERT INTO sentences (english_text, portuguese_text, level, category, difficulty_score) VALUES
-- Beginner level
('Hello, how are you?', 'Olá, como você está?', 'beginner', 'greetings', 1),
('My name is John', 'Meu nome é John', 'beginner', 'introduction', 1),
('I am from Brazil', 'Eu sou do Brasil', 'beginner', 'introduction', 1),
('What time is it?', 'Que horas são?', 'beginner', 'time', 2),
('I like coffee', 'Eu gosto de café', 'beginner', 'preferences', 1),
('Where is the bathroom?', 'Onde fica o banheiro?', 'beginner', 'directions', 2),
('I am hungry', 'Eu estou com fome', 'beginner', 'feelings', 1),
('Thank you very much', 'Muito obrigado', 'beginner', 'politeness', 1),
('See you later', 'Até mais tarde', 'beginner', 'farewells', 1),
('I don''t understand', 'Eu não entendo', 'beginner', 'communication', 2),

-- Intermediate level
('I would like to make a reservation', 'Eu gostaria de fazer uma reserva', 'intermediate', 'restaurant', 3),
('Could you help me with this problem?', 'Você poderia me ajudar com este problema?', 'intermediate', 'requests', 3),
('I have been studying English for two years', 'Eu tenho estudado inglês por dois anos', 'intermediate', 'time_expressions', 4),
('If I were you, I would take that job', 'Se eu fosse você, eu aceitaria aquele emprego', 'intermediate', 'conditionals', 4),
('The weather is getting colder these days', 'O tempo está ficando mais frio estes dias', 'intermediate', 'weather', 3),
('I''m looking forward to our meeting', 'Estou ansioso para nossa reunião', 'intermediate', 'business', 4),
('She has already finished her homework', 'Ela já terminou a lição de casa', 'intermediate', 'education', 3),
('We should arrive at the airport early', 'Deveríamos chegar ao aeroporto cedo', 'intermediate', 'travel', 3),
('I''m sorry, but I can''t attend the party', 'Desculpe, mas não posso comparecer à festa', 'intermediate', 'apologies', 3),
('The movie was more interesting than I expected', 'O filme foi mais interessante do que eu esperava', 'intermediate', 'entertainment', 4),

-- Advanced level
('Despite the challenging circumstances, we managed to complete the project on time', 'Apesar das circunstâncias desafiadoras, conseguimos terminar o projeto no prazo', 'advanced', 'business', 5),
('The implications of this decision will be far-reaching', 'As implicações desta decisão serão de longo alcance', 'advanced', 'analysis', 5),
('I would have called you if I had known about the meeting', 'Eu teria te ligado se soubesse sobre a reunião', 'advanced', 'conditionals', 5),
('The research findings contradict our initial hypothesis', 'Os resultados da pesquisa contradizem nossa hipótese inicial', 'advanced', 'academic', 5),
('She''s been advocating for environmental protection for decades', 'Ela tem defendido a proteção ambiental há décadas', 'advanced', 'environment', 5),
('The novel explores themes of identity and belonging', 'O romance explora temas de identidade e pertencimento', 'advanced', 'literature', 5),
('Economic fluctuations can significantly impact global markets', 'Flutuações econômicas podem impactar significativamente os mercados globais', 'advanced', 'economics', 5),
('The defendant''s testimony was deemed inadmissible by the judge', 'O depoimento do réu foi considerado inadmissível pelo juiz', 'advanced', 'legal', 5),
('Technological advancement has revolutionized communication', 'O avanço tecnológico revolucionou a comunicação', 'advanced', 'technology', 5),
('The conference will facilitate networking among professionals', 'A conferência facilitará o networking entre profissionais', 'advanced', 'professional', 5);

-- Criar lições de exemplo
INSERT INTO lessons (title, description, level, order_index) VALUES
('Primeiros Passos', 'Aprenda cumprimentos e apresentações básicas', 'beginner', 1),
('Conversas do Dia a Dia', 'Frases úteis para situações cotidianas', 'beginner', 2),
('Expressões Intermediárias', 'Amplie seu vocabulário com expressões mais complexas', 'intermediate', 3),
('Conversação Avançada', 'Domine expressões sofisticadas e complexas', 'advanced', 4);

-- Associar frases às lições
WITH lesson_data AS (
  SELECT l.id as lesson_id, l.level, l.order_index
  FROM lessons l
)
INSERT INTO lesson_sentences (lesson_id, sentence_id, order_index)
SELECT 
  ld.lesson_id,
  s.id,
  ROW_NUMBER() OVER (PARTITION BY ld.lesson_id ORDER BY s.difficulty_score, s.id) as order_index
FROM lesson_data ld
JOIN sentences s ON s.level = ld.level
WHERE 
  (ld.order_index = 1 AND s.id IN (SELECT id FROM sentences WHERE level = 'beginner' LIMIT 5)) OR
  (ld.order_index = 2 AND s.id IN (SELECT id FROM sentences WHERE level = 'beginner' OFFSET 5 LIMIT 5)) OR
  (ld.order_index = 3 AND s.id IN (SELECT id FROM sentences WHERE level = 'intermediate' LIMIT 10)) OR
  (ld.order_index = 4 AND s.id IN (SELECT id FROM sentences WHERE level = 'advanced' LIMIT 10));

-- Inserir conquistas de exemplo
INSERT INTO achievement_templates (name, description, icon, requirement_type, requirement_value, points_reward, category) VALUES
('Primeiro Passo', 'Complete sua primeira lição', '🎯', 'lessons_completed', 1, 50, 'milestone'),
('Estudioso', 'Complete 5 lições', '📚', 'lessons_completed', 5, 150, 'milestone'),
('Dedicado', 'Mantenha uma sequência de 7 dias', '🔥', 'streak_days', 7, 200, 'consistency'),
('Poliglota', 'Domine 50 frases', '🌟', 'phrases_mastered', 50, 300, 'mastery'),
('Iniciante Completo', 'Complete todas as lições de nível iniciante', '🥉', 'beginner_lessons', 1, 250, 'level'),
('Intermediário', 'Complete todas as lições de nível intermediário', '🥈', 'intermediate_lessons', 1, 400, 'level'),
('Avançado', 'Complete todas as lições de nível avançado', '🥇', 'advanced_lessons', 1, 600, 'level'),
('Conversador', 'Use o chat IA 10 vezes', '💬', 'chat_sessions', 10, 100, 'engagement'),
('Quiz Master', 'Complete 20 quizzes', '🏆', 'quizzes_completed', 20, 350, 'engagement'),
('Perfeccionista', 'Acerte 100% em 10 exercícios seguidos', '⭐', 'perfect_streak', 10, 500, 'mastery');