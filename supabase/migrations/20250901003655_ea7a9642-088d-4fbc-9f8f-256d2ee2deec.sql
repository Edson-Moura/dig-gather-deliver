-- Adicionar sentenças específicas para a lição "Primeiros Passos"
-- Cores (Colors)
INSERT INTO sentences (english_text, portuguese_text, level, category, difficulty_score) VALUES
('The sky is blue', 'O céu é azul', 'beginner', 'colors', 1),
('I like red apples', 'Eu gosto de maçãs vermelhas', 'beginner', 'colors', 1),
('The grass is green', 'A grama é verde', 'beginner', 'colors', 1),
('My favorite color is yellow', 'Minha cor favorita é amarelo', 'beginner', 'colors', 1),
('The car is black', 'O carro é preto', 'beginner', 'colors', 1),
('She wears a white dress', 'Ela usa um vestido branco', 'beginner', 'colors', 1),

-- Números (Numbers)
('I have one dog', 'Eu tenho um cachorro', 'beginner', 'numbers', 1),
('There are two cats', 'Há dois gatos', 'beginner', 'numbers', 1),
('I need three books', 'Eu preciso de três livros', 'beginner', 'numbers', 1),
('We have four chairs', 'Nós temos quatro cadeiras', 'beginner', 'numbers', 1),
('I see five birds', 'Eu vejo cinco pássaros', 'beginner', 'numbers', 1),
('There are ten students', 'Há dez estudantes', 'beginner', 'numbers', 1),

-- Objetos do dia a dia (Daily objects)
('I drink water from a glass', 'Eu bebo água de um copo', 'beginner', 'daily_objects', 1),
('The book is on the table', 'O livro está na mesa', 'beginner', 'daily_objects', 1),
('I use my phone every day', 'Eu uso meu telefone todos os dias', 'beginner', 'daily_objects', 1),
('The keys are in my bag', 'As chaves estão na minha bolsa', 'beginner', 'daily_objects', 1),
('I write with a pen', 'Eu escrevo com uma caneta', 'beginner', 'daily_objects', 1),
('The door is open', 'A porta está aberta', 'beginner', 'daily_objects', 1),

-- Apresentações (Introductions)
('Nice to meet you', 'Prazer em conhecê-lo', 'beginner', 'introductions', 1),
('What is your name?', 'Qual é o seu nome?', 'beginner', 'introductions', 1),
('I am from Brazil', 'Eu sou do Brasil', 'beginner', 'introductions', 1),
('How old are you?', 'Quantos anos você tem?', 'beginner', 'introductions', 1),
('I am 25 years old', 'Eu tenho 25 anos', 'beginner', 'introductions', 1),
('Where do you work?', 'Onde você trabalha?', 'beginner', 'introductions', 1),

-- Saudações (Greetings)
('Good morning', 'Bom dia', 'beginner', 'greetings', 1),
('Good afternoon', 'Boa tarde', 'beginner', 'greetings', 1),
('Good evening', 'Boa noite', 'beginner', 'greetings', 1),
('See you later', 'Até mais tarde', 'beginner', 'greetings', 1),
('Have a nice day', 'Tenha um bom dia', 'beginner', 'greetings', 1),
('Welcome', 'Bem-vindo', 'beginner', 'greetings', 1);

-- Vincular as novas sentenças à lição "Primeiros Passos"
WITH new_sentences AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as rn
  FROM sentences 
  WHERE created_at >= NOW() - INTERVAL '1 minute'
    AND level = 'beginner' 
    AND category IN ('colors', 'numbers', 'daily_objects', 'introductions', 'greetings')
),
existing_count AS (
  SELECT COUNT(*) as count_existing
  FROM lesson_sentences 
  WHERE lesson_id = '01d7e561-ff2d-4abb-a4c2-9ed34f5bbe70'
)
INSERT INTO lesson_sentences (lesson_id, sentence_id, order_index)
SELECT 
  '01d7e561-ff2d-4abb-a4c2-9ed34f5bbe70',
  new_sentences.id,
  existing_count.count_existing + new_sentences.rn
FROM new_sentences
CROSS JOIN existing_count;

-- Remover lição duplicada se existir
DELETE FROM lesson_sentences WHERE lesson_id = '9b0ecb88-5a29-4893-968d-9e6b6285ecde';
DELETE FROM lessons WHERE id = '9b0ecb88-5a29-4893-968d-9e6b6285ecde';

-- Atualizar descrição da lição para refletir o novo conteúdo
UPDATE lessons 
SET description = 'Aprenda cores, números, objetos do dia a dia, apresentações e saudações básicas'
WHERE id = '01d7e561-ff2d-4abb-a4c2-9ed34f5bbe70';