-- Create lessons
INSERT INTO lessons (title, description, level, order_index) VALUES
('Primeiros Passos', 'Aprenda cumprimentos básicos e apresentações', 'beginner', 1),
('Família e Relacionamentos', 'Vocabulário sobre família e pessoas próximas', 'beginner', 2),
('Rotina Diária', 'Descreva suas atividades do dia a dia', 'beginner', 3),
('Comida e Bebidas', 'Vocabulário essencial sobre alimentação', 'beginner', 4),
('Cores e Objetos', 'Aprenda cores e objetos do cotidiano', 'beginner', 5),
('Clima e Tempo', 'Fale sobre o tempo e condições climáticas', 'beginner', 6),
('Trabalho e Carreira', 'Vocabulário profissional e ambiente de trabalho', 'intermediate', 1),
('Viagens e Lugares', 'Converse sobre viagens e destinos', 'intermediate', 2),
('Educação e Aprendizado', 'Discussões sobre estudos e conhecimento', 'intermediate', 3),
('Tecnologia e Redes Sociais', 'Vocabulário moderno sobre tecnologia', 'intermediate', 4),
('Saúde e Bem-estar', 'Fale sobre saúde, exercícios e estilo de vida', 'intermediate', 5),
('Filosofia e Conceitos Abstratos', 'Discussões profundas sobre vida e existência', 'advanced', 1),
('Negócios e Economia', 'Vocabulário avançado sobre business e finanças', 'advanced', 2),
('Ciência e Meio Ambiente', 'Temas científicos e ambientais complexos', 'advanced', 3),
('Cultura e Sociedade', 'Análise cultural e questões sociais', 'advanced', 4),
('Psicologia e Comportamento', 'Comportamento humano e ciências da mente', 'advanced', 5)
ON CONFLICT DO NOTHING;