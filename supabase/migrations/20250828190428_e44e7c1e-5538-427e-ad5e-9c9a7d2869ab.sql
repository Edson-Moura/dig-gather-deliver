-- Fix achievements data (the seed file uses achievement_templates but schema uses achievements table)
INSERT INTO achievements (name, description, icon, category, requirement_type, requirement_value, points_reward) VALUES
-- Streak achievements
('Primeiro Passo', 'Complete sua primeira frase', '🎯', 'progress', 'sentences_mastered', 1, 10),
('Iniciante Dedicado', 'Mantenha uma sequência de 3 dias', '🔥', 'streak', 'streak', 3, 25),
('Em Chamas', 'Mantenha uma sequência de 7 dias', '🔥', 'streak', 'streak', 7, 50),
('Sequência de Ferro', 'Mantenha uma sequência de 14 dias', '🔥', 'streak', 'streak', 14, 100),
('Lenda da Sequência', 'Mantenha uma sequência de 30 dias', '🔥', 'streak', 'streak', 30, 250),

-- Progress achievements
('Primeiras Palavras', 'Domine 5 frases', '📚', 'progress', 'sentences_mastered', 5, 25),
('Construindo Vocabulário', 'Domine 25 frases', '📚', 'progress', 'sentences_mastered', 25, 75),
('Fluência Crescente', 'Domine 50 frases', '📚', 'progress', 'sentences_mastered', 50, 150),
('Mestre das Palavras', 'Domine 100 frases', '📚', 'progress', 'sentences_mastered', 100, 300),
('Especialista em Inglês', 'Domine 250 frases', '📚', 'progress', 'sentences_mastered', 250, 500),

-- Points achievements  
('Colecionador de Pontos', 'Ganhe 100 pontos', '⭐', 'points', 'points', 100, 50),
('Caçador de XP', 'Ganhe 500 pontos', '⭐', 'points', 'points', 500, 100),
('Mestre dos Pontos', 'Ganhe 1000 pontos', '⭐', 'points', 'points', 1000, 200),
('Lenda dos Pontos', 'Ganhe 2500 pontos', '⭐', 'points', 'points', 2500, 500),

-- Daily goal achievements
('Meta Cumprida', 'Complete sua meta diária pela primeira vez', '🎯', 'daily', 'daily_goal', 1, 15),
('Consistência', 'Complete sua meta diária 7 vezes', '🎯', 'daily', 'daily_goal', 7, 75),
('Disciplina Total', 'Complete sua meta diária 30 vezes', '🎯', 'daily', 'daily_goal', 30, 200),

-- Special achievements
('Explorador', 'Complete uma lição de cada nível', '🗺️', 'exploration', 'lessons_completed', 3, 100),
('Conversador', 'Use o chat IA pela primeira vez', '💬', 'social', 'lessons_completed', 0, 25),
('Perfeccionista', 'Acerte 10 exercícios seguidos', '💯', 'performance', 'sentences_mastered', 10, 150);