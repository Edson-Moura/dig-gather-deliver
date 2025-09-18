-- Primeiro, vamos criar uma tabela separada para achievement templates (conquistas do sistema)
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

-- Ajustar a tabela achievements para ser apenas desbloqueios por usuário
-- Renomear badge_id para achievement_template_id para clareza
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'achievements' AND column_name = 'badge_id') THEN
        ALTER TABLE achievements RENAME COLUMN badge_id TO achievement_template_id;
    END IF;
END $$;

-- Adicionar foreign key para achievement_templates
ALTER TABLE achievements ADD CONSTRAINT fk_achievement_template 
  FOREIGN KEY (achievement_template_id) REFERENCES achievement_templates(id) ON DELETE CASCADE;

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
('Perfeccionista', 'Acerte 10 exercícios seguidos', '💯', 'performance', 'sentences_mastered', 10, 150);

-- Inserir sentenças se não existirem
INSERT INTO sentences (english_text, portuguese_text, level, category, difficulty_score)
SELECT * FROM (VALUES
-- Greetings and Basic Phrases (Beginner)
('Hello, how are you?', 'Olá, como você está?', 'beginner', 'Cumprimentos', 1),
('Good morning!', 'Bom dia!', 'beginner', 'Cumprimentos', 1),
('Good afternoon!', 'Boa tarde!', 'beginner', 'Cumprimentos', 1),
('Good evening!', 'Boa noite!', 'beginner', 'Cumprimentos', 1),
('My name is Maria.', 'Meu nome é Maria.', 'beginner', 'Apresentação', 1),
('What is your name?', 'Qual é o seu nome?', 'beginner', 'Apresentação', 1),
('Nice to meet you!', 'Prazer em conhecê-lo!', 'beginner', 'Apresentação', 2),
('How old are you?', 'Quantos anos você tem?', 'beginner', 'Informações Pessoais', 2),
('I am twenty years old.', 'Eu tenho vinte anos.', 'beginner', 'Informações Pessoais', 2),
('Where are you from?', 'De onde você é?', 'beginner', 'Informações Pessoais', 2),

-- Family
('I have a big family.', 'Eu tenho uma família grande.', 'beginner', 'Família', 2),
('This is my brother.', 'Este é meu irmão.', 'beginner', 'Família', 1),
('She is my sister.', 'Ela é minha irmã.', 'beginner', 'Família', 1),
('My mother is a teacher.', 'Minha mãe é professora.', 'beginner', 'Família', 2),
('My father works in an office.', 'Meu pai trabalha em um escritório.', 'beginner', 'Família', 3),

-- Daily Activities
('I wake up at seven.', 'Eu acordo às sete.', 'beginner', 'Rotina', 2),
('I eat breakfast every day.', 'Eu tomo café da manhã todos os dias.', 'beginner', 'Rotina', 2),
('I go to work by bus.', 'Eu vou trabalhar de ônibus.', 'beginner', 'Rotina', 3),
('I like to read books.', 'Eu gosto de ler livros.', 'beginner', 'Hobbies', 2),
('I watch TV in the evening.', 'Eu assisto TV à noite.', 'beginner', 'Rotina', 2),

-- Food and Drinks
('I am hungry.', 'Eu estou com fome.', 'beginner', 'Comida', 1),
('I am thirsty.', 'Eu estou com sede.', 'beginner', 'Bebidas', 1),
('I like pizza very much.', 'Eu gosto muito de pizza.', 'beginner', 'Comida', 2),
('Coffee is my favorite drink.', 'Café é minha bebida favorita.', 'beginner', 'Bebidas', 2),
('The food is delicious.', 'A comida está deliciosa.', 'beginner', 'Comida', 2),

-- Colors and Objects
('The sky is blue.', 'O céu é azul.', 'beginner', 'Cores', 1),
('I have a red car.', 'Eu tenho um carro vermelho.', 'beginner', 'Cores', 2),
('The book is on the table.', 'O livro está na mesa.', 'beginner', 'Objetos', 2),
('My phone is black.', 'Meu telefone é preto.', 'beginner', 'Objetos', 2),
('I need a pen to write.', 'Eu preciso de uma caneta para escrever.', 'beginner', 'Objetos', 3),

-- Weather
('It is sunny today.', 'Está ensolarado hoje.', 'beginner', 'Clima', 2),
('It is raining outside.', 'Está chovendo lá fora.', 'beginner', 'Clima', 2),
('The weather is nice.', 'O tempo está bom.', 'beginner', 'Clima', 2),
('It is very cold today.', 'Está muito frio hoje.', 'beginner', 'Clima', 2),
('I love sunny days.', 'Eu amo dias ensolarados.', 'beginner', 'Clima', 2)
) AS new_sentences(english_text, portuguese_text, level, category, difficulty_score)
WHERE NOT EXISTS (
    SELECT 1 FROM sentences WHERE sentences.english_text = new_sentences.english_text
);

-- Inserir lições se não existirem
INSERT INTO lessons (title, description, level, order_index)
SELECT * FROM (VALUES
-- Beginner lessons
('Primeiros Passos', 'Aprenda cumprimentos básicos e apresentações', 'beginner', 1),
('Família e Relacionamentos', 'Vocabulário sobre família e pessoas próximas', 'beginner', 2),
('Rotina Diária', 'Descreva suas atividades do dia a dia', 'beginner', 3),
('Comida e Bebidas', 'Vocabulário essencial sobre alimentação', 'beginner', 4),
('Cores e Objetos', 'Aprenda cores e objetos do cotidiano', 'beginner', 5),
('Clima e Tempo', 'Fale sobre o tempo e condições climáticas', 'beginner', 6)
) AS new_lessons(title, description, level, order_index)
WHERE NOT EXISTS (
    SELECT 1 FROM lessons WHERE lessons.title = new_lessons.title
);