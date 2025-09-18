-- Atualizar a ordem das lições para inserir "Situações Cotidianas" como segunda lição
-- Primeiro, aumentar order_index de todas as lições beginner que já existem (exceto a primeira)
UPDATE public.lessons 
SET order_index = order_index + 1, updated_at = now()
WHERE level = 'beginner' 
  AND order_index >= 1
  AND title != 'Situações Cotidianas';

-- Agora definir a lição "Situações Cotidianas" como order_index = 1 (segunda lição)
UPDATE public.lessons 
SET order_index = 1, updated_at = now()
WHERE title = 'Situações Cotidianas' AND level = 'beginner';