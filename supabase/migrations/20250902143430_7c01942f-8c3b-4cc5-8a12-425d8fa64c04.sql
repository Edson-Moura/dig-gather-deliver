-- Criar uma nova lição sobre o verbo "to be" para iniciantes
INSERT INTO lessons (title, description, level, order_index, is_active) 
VALUES ('Verbo To Be', 'Aprenda o verbo mais importante do inglês: to be (ser/estar)', 'beginner', 0, true);

-- Criar frases essenciais do verbo "to be"
WITH lesson_to_be AS (
  SELECT id FROM lessons WHERE title = 'Verbo To Be' AND level = 'beginner' LIMIT 1
),
new_sentences AS (
  INSERT INTO sentences (english_text, portuguese_text, level, category, difficulty_score) VALUES
  ('I am a student.', 'Eu sou um/uma estudante.', 'beginner', 'verb_to_be', 1),
  ('You are my friend.', 'Você é meu/minha amigo(a).', 'beginner', 'verb_to_be', 1),
  ('He is a teacher.', 'Ele é um professor.', 'beginner', 'verb_to_be', 1),
  ('She is a doctor.', 'Ela é uma médica.', 'beginner', 'verb_to_be', 1),
  ('It is a book.', 'É um livro.', 'beginner', 'verb_to_be', 1),
  ('We are friends.', 'Nós somos amigos.', 'beginner', 'verb_to_be', 1),
  ('You are students.', 'Vocês são estudantes.', 'beginner', 'verb_to_be', 1),
  ('They are happy.', 'Eles/Elas estão felizes.', 'beginner', 'verb_to_be', 1),
  ('I am happy.', 'Eu estou feliz.', 'beginner', 'verb_to_be', 2),
  ('You are tall.', 'Você é alto(a).', 'beginner', 'verb_to_be', 2),
  ('He is young.', 'Ele é jovem.', 'beginner', 'verb_to_be', 2),
  ('She is beautiful.', 'Ela é bonita.', 'beginner', 'verb_to_be', 2),
  ('It is cold.', 'Está frio.', 'beginner', 'verb_to_be', 2),
  ('We are tired.', 'Nós estamos cansados.', 'beginner', 'verb_to_be', 2),
  ('They are hungry.', 'Eles/Elas estão com fome.', 'beginner', 'verb_to_be', 2),
  ('I am not sad.', 'Eu não estou triste.', 'beginner', 'verb_to_be', 3),
  ('You are not late.', 'Você não está atrasado(a).', 'beginner', 'verb_to_be', 3),
  ('He is not busy.', 'Ele não está ocupado.', 'beginner', 'verb_to_be', 3),
  ('She is not angry.', 'Ela não está brava.', 'beginner', 'verb_to_be', 3),
  ('We are not ready.', 'Nós não estamos prontos.', 'beginner', 'verb_to_be', 3)
  RETURNING id, english_text
)
-- Associar as frases à lição do verbo "to be"
INSERT INTO lesson_sentences (lesson_id, sentence_id, order_index)
SELECT 
  (SELECT id FROM lesson_to_be),
  ns.id,
  row_number() OVER (ORDER BY ns.id)
FROM new_sentences ns;