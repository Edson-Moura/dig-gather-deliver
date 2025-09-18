-- Seed achievement templates data
INSERT INTO achievement_templates (name, description, icon, category, requirement_type, requirement_value, points_reward) VALUES
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

-- Seed beginner sentences
INSERT INTO sentences (english_text, portuguese_text, level, category, difficulty_score) VALUES
-- Greetings and Basic Phrases
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
('I love sunny days.', 'Eu amo dias ensolarados.', 'beginner', 'Clima', 2);

-- Seed intermediate sentences
INSERT INTO sentences (english_text, portuguese_text, level, category, difficulty_score) VALUES
-- Work and Career
('I work as a software developer.', 'Eu trabalho como desenvolvedor de software.', 'intermediate', 'Trabalho', 4),
('My job is very challenging but rewarding.', 'Meu trabalho é muito desafiador mas gratificante.', 'intermediate', 'Trabalho', 5),
('I have a meeting at three o''clock.', 'Eu tenho uma reunião às três horas.', 'intermediate', 'Trabalho', 4),
('Could you please send me the report?', 'Você poderia me enviar o relatório, por favor?', 'intermediate', 'Trabalho', 5),
('I need to finish this project by Friday.', 'Eu preciso terminar este projeto até sexta-feira.', 'intermediate', 'Trabalho', 4),

-- Travel and Places
('I have been to many countries.', 'Eu já estive em muitos países.', 'intermediate', 'Viagem', 4),
('Paris is one of my favorite cities.', 'Paris é uma das minhas cidades favoritas.', 'intermediate', 'Viagem', 4),
('I would like to visit Japan someday.', 'Eu gostaria de visitar o Japão algum dia.', 'intermediate', 'Viagem', 5),
('The hotel room has a beautiful view.', 'O quarto do hotel tem uma vista linda.', 'intermediate', 'Viagem', 4),
('Traveling broadens your perspective.', 'Viajar amplia sua perspectiva.', 'intermediate', 'Viagem', 6),

-- Education and Learning
('I graduated from university last year.', 'Eu me formei na universidade no ano passado.', 'intermediate', 'Educação', 5),
('Learning a new language takes time and patience.', 'Aprender um novo idioma leva tempo e paciência.', 'intermediate', 'Educação', 6),
('She is studying to become a doctor.', 'Ela está estudando para se tornar médica.', 'intermediate', 'Educação', 5),
('Online courses are becoming very popular.', 'Cursos online estão se tornando muito populares.', 'intermediate', 'Educação', 5),
('I believe education is the key to success.', 'Eu acredito que educação é a chave para o sucesso.', 'intermediate', 'Educação', 6),

-- Technology and Social Media
('I spend too much time on social media.', 'Eu passo muito tempo nas redes sociais.', 'intermediate', 'Tecnologia', 5),
('Technology has changed our lives dramatically.', 'A tecnologia mudou nossas vidas drasticamente.', 'intermediate', 'Tecnologia', 6),
('My smartphone battery died this morning.', 'A bateria do meu smartphone acabou esta manhã.', 'intermediate', 'Tecnologia', 4),
('I prefer video calls to phone calls.', 'Eu prefiro videochamadas a chamadas telefônicas.', 'intermediate', 'Tecnologia', 5),
('Artificial intelligence is fascinating.', 'Inteligência artificial é fascinante.', 'intermediate', 'Tecnologia', 6),

-- Health and Fitness
('I try to exercise three times a week.', 'Eu tento me exercitar três vezes por semana.', 'intermediate', 'Saúde', 5),
('A balanced diet is important for good health.', 'Uma dieta equilibrada é importante para a boa saúde.', 'intermediate', 'Saúde', 6),
('I should drink more water during the day.', 'Eu deveria beber mais água durante o dia.', 'intermediate', 'Saúde', 4),
('Stress can affect your immune system.', 'O estresse pode afetar seu sistema imunológico.', 'intermediate', 'Saúde', 6),
('Getting enough sleep is crucial.', 'Dormir o suficiente é crucial.', 'intermediate', 'Saúde', 5);

-- Seed advanced sentences
INSERT INTO sentences (english_text, portuguese_text, level, category, difficulty_score) VALUES
-- Philosophy and Abstract Concepts
('The meaning of life has been debated for centuries.', 'O sentido da vida tem sido debatido há séculos.', 'advanced', 'Filosofia', 8),
('Happiness is not a destination, but a journey.', 'A felicidade não é um destino, mas uma jornada.', 'advanced', 'Filosofia', 7),
('Freedom comes with great responsibility.', 'A liberdade vem com grande responsabilidade.', 'advanced', 'Filosofia', 7),
('Time is the most valuable resource we have.', 'O tempo é o recurso mais valioso que temos.', 'advanced', 'Filosofia', 7),
('Wisdom comes from experience and reflection.', 'A sabedoria vem da experiência e reflexão.', 'advanced', 'Filosofia', 8),

-- Business and Economics
('The global economy is interconnected and complex.', 'A economia global é interconectada e complexa.', 'advanced', 'Negócios', 8),
('Sustainable business practices are essential nowadays.', 'Práticas empresariais sustentáveis são essenciais hoje em dia.', 'advanced', 'Negócios', 8),
('Market volatility affects investor confidence.', 'A volatilidade do mercado afeta a confiança dos investidores.', 'advanced', 'Negócios', 9),
('Innovation drives competitive advantage.', 'A inovação impulsiona a vantagem competitiva.', 'advanced', 'Negócios', 7),
('Corporate social responsibility is gaining importance.', 'A responsabilidade social corporativa está ganhando importância.', 'advanced', 'Negócios', 8),

-- Science and Environment
('Climate change poses significant challenges to humanity.', 'As mudanças climáticas representam desafios significativos para a humanidade.', 'advanced', 'Meio Ambiente', 9),
('Renewable energy sources are becoming more efficient.', 'As fontes de energia renovável estão se tornando mais eficientes.', 'advanced', 'Meio Ambiente', 8),
('Biodiversity loss threatens ecosystem stability.', 'A perda de biodiversidade ameaça a estabilidade dos ecossistemas.', 'advanced', 'Meio Ambiente', 9),
('Scientific research requires rigorous methodology.', 'A pesquisa científica requer metodologia rigorosa.', 'advanced', 'Ciência', 8),
('Genetic engineering raises ethical questions.', 'A engenharia genética levanta questões éticas.', 'advanced', 'Ciência', 9),

-- Culture and Society
('Cultural diversity enriches our global community.', 'A diversidade cultural enriquece nossa comunidade global.', 'advanced', 'Cultura', 8),
('Social media has transformed human communication.', 'As redes sociais transformaram a comunicação humana.', 'advanced', 'Sociedade', 8),
('Artistic expression reflects societal values.', 'A expressão artística reflete os valores da sociedade.', 'advanced', 'Cultura', 8),
('Democracy requires active citizen participation.', 'A democracia requer participação ativa dos cidadãos.', 'advanced', 'Sociedade', 8),
('Historical events shape contemporary perspectives.', 'Eventos históricos moldam perspectivas contemporâneas.', 'advanced', 'História', 9),

-- Psychology and Human Behavior
('Cognitive biases influence our decision-making process.', 'Vieses cognitivos influenciam nosso processo de tomada de decisão.', 'advanced', 'Psicologia', 9),
('Emotional intelligence is crucial for leadership.', 'A inteligência emocional é crucial para a liderança.', 'advanced', 'Psicologia', 8),
('Human behavior is influenced by numerous factors.', 'O comportamento humano é influenciado por inúmeros fatores.', 'advanced', 'Psicologia', 8),
('Mindfulness practices can reduce anxiety and stress.', 'Práticas de atenção plena podem reduzir ansiedade e estresse.', 'advanced', 'Psicologia', 8),
('Neuroplasticity allows the brain to adapt throughout life.', 'A neuroplasticidade permite que o cérebro se adapte ao longo da vida.', 'advanced', 'Psicologia', 9);

-- Create beginner lessons
INSERT INTO lessons (title, description, level, order_index) VALUES
('Primeiros Passos', 'Aprenda cumprimentos básicos e apresentações', 'beginner', 1),
('Família e Relacionamentos', 'Vocabulário sobre família e pessoas próximas', 'beginner', 2),
('Rotina Diária', 'Descreva suas atividades do dia a dia', 'beginner', 3),
('Comida e Bebidas', 'Vocabulário essencial sobre alimentação', 'beginner', 4),
('Cores e Objetos', 'Aprenda cores e objetos do cotidiano', 'beginner', 5),
('Clima e Tempo', 'Fale sobre o tempo e condições climáticas', 'beginner', 6);

-- Create intermediate lessons
INSERT INTO lessons (title, description, level, order_index) VALUES
('Trabalho e Carreira', 'Vocabulário profissional e ambiente de trabalho', 'intermediate', 1),
('Viagens e Lugares', 'Converse sobre viagens e destinos', 'intermediate', 2),
('Educação e Aprendizado', 'Discussões sobre estudos e conhecimento', 'intermediate', 3),
('Tecnologia e Redes Sociais', 'Vocabulário moderno sobre tecnologia', 'intermediate', 4),
('Saúde e Bem-estar', 'Fale sobre saúde, exercícios e estilo de vida', 'intermediate', 5);

-- Create advanced lessons
INSERT INTO lessons (title, description, level, order_index) VALUES
('Filosofia e Conceitos Abstratos', 'Discussões profundas sobre vida e existência', 'advanced', 1),
('Negócios e Economia', 'Vocabulário avançado sobre business e finanças', 'advanced', 2),
('Ciência e Meio Ambiente', 'Temas científicos e ambientais complexos', 'advanced', 3),
('Cultura e Sociedade', 'Análise cultural e questões sociais', 'advanced', 4),
('Psicologia e Comportamento', 'Comportamento humano e ciências da mente', 'advanced', 5);

-- Link sentences to lessons (beginner)
WITH beginner_lessons AS (
  SELECT id, title, ROW_NUMBER() OVER (ORDER BY order_index) as rn
  FROM lessons WHERE level = 'beginner'
),
beginner_sentences AS (
  SELECT id, category, ROW_NUMBER() OVER (ORDER BY english_text) as rn
  FROM sentences WHERE level = 'beginner'
)
INSERT INTO lesson_sentences (lesson_id, sentence_id, order_index)
SELECT 
  bl.id,
  bs.id,
  ROW_NUMBER() OVER (PARTITION BY bl.id ORDER BY bs.rn) as order_index
FROM beginner_sentences bs
JOIN beginner_lessons bl ON (
  (bl.rn = 1 AND bs.category IN ('Cumprimentos', 'Apresentação', 'Informações Pessoais')) OR
  (bl.rn = 2 AND bs.category = 'Família') OR  
  (bl.rn = 3 AND bs.category IN ('Rotina', 'Hobbies')) OR
  (bl.rn = 4 AND bs.category IN ('Comida', 'Bebidas')) OR
  (bl.rn = 5 AND bs.category IN ('Cores', 'Objetos')) OR
  (bl.rn = 6 AND bs.category = 'Clima')
);

-- Link sentences to lessons (intermediate)
WITH intermediate_lessons AS (
  SELECT id, title, ROW_NUMBER() OVER (ORDER BY order_index) as rn
  FROM lessons WHERE level = 'intermediate'
),
intermediate_sentences AS (
  SELECT id, category, ROW_NUMBER() OVER (ORDER BY english_text) as rn
  FROM sentences WHERE level = 'intermediate'
)
INSERT INTO lesson_sentences (lesson_id, sentence_id, order_index)
SELECT 
  il.id,
  ins.id,
  ROW_NUMBER() OVER (PARTITION BY il.id ORDER BY ins.rn) as order_index
FROM intermediate_sentences ins
JOIN intermediate_lessons il ON (
  (il.rn = 1 AND ins.category = 'Trabalho') OR
  (il.rn = 2 AND ins.category = 'Viagem') OR
  (il.rn = 3 AND ins.category = 'Educação') OR
  (il.rn = 4 AND ins.category = 'Tecnologia') OR
  (il.rn = 5 AND ins.category = 'Saúde')
);

-- Link sentences to lessons (advanced)
WITH advanced_lessons AS (
  SELECT id, title, ROW_NUMBER() OVER (ORDER BY order_index) as rn
  FROM lessons WHERE level = 'advanced'
),
advanced_sentences AS (
  SELECT id, category, ROW_NUMBER() OVER (ORDER BY english_text) as rn
  FROM sentences WHERE level = 'advanced'
)
INSERT INTO lesson_sentences (lesson_id, sentence_id, order_index)
SELECT 
  al.id,
  ads.id,
  ROW_NUMBER() OVER (PARTITION BY al.id ORDER BY ads.rn) as order_index
FROM advanced_sentences ads
JOIN advanced_lessons al ON (
  (al.rn = 1 AND ads.category = 'Filosofia') OR
  (al.rn = 2 AND ads.category = 'Negócios') OR
  (al.rn = 3 AND ads.category IN ('Meio Ambiente', 'Ciência')) OR
  (al.rn = 4 AND ads.category IN ('Cultura', 'Sociedade', 'História')) OR
  (al.rn = 5 AND ads.category = 'Psicologia')
);