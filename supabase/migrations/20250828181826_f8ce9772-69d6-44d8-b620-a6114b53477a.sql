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
('I love sunny days.', 'Eu amo dias ensolarados.', 'beginner', 'Clima', 2)
ON CONFLICT DO NOTHING;