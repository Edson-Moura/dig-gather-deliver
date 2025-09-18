-- Primeiro, corrigir o tipo da coluna achievement_template_id
ALTER TABLE achievements ALTER COLUMN achievement_template_id TYPE UUID USING achievement_template_id::UUID;

-- Criar a tabela de templates se não existir
CREATE TABLE IF NOT EXISTS achievement_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL,
  requirement_type TEXT NOT NULL,
  requirement_value INTEGER NOT NULL,
  points_reward INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Agora podemos criar a foreign key
DO $$
BEGIN
    -- Verificar se a constraint não existe antes de criar
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_achievement_template'
    ) THEN
        ALTER TABLE achievements ADD CONSTRAINT fk_achievement_template 
        FOREIGN KEY (achievement_template_id) REFERENCES achievement_templates(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Enable RLS na nova tabela
ALTER TABLE achievement_templates ENABLE ROW LEVEL SECURITY;

-- Achievement templates são visíveis para todos
CREATE POLICY "Achievement templates are viewable by everyone" 
ON achievement_templates FOR SELECT 
USING (true);

-- Inserir templates de conquistas
INSERT INTO achievement_templates (name, description, icon, category, requirement_type, requirement_value, points_reward)
VALUES
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
('Perfeccionista', 'Acerte 10 exercícios seguidos', '💯', 'performance', 'sentences_mastered', 10, 150)
ON CONFLICT (name) DO NOTHING;