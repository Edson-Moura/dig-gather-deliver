-- Corrigir funções com search_path para segurança
CREATE OR REPLACE FUNCTION public.initialize_lesson_progress_for_user(target_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Inserir progresso para todas as lições de iniciante
  INSERT INTO public.lesson_progress (user_id, lesson_id, status)
  SELECT 
    target_user_id,
    l.id,
    CASE 
      WHEN l.order_index = 1 THEN 'unlocked'  -- Primeira lição desbloqueada
      ELSE 'locked'                           -- Outras lições bloqueadas
    END
  FROM public.lessons l
  WHERE l.level = 'beginner' 
    AND l.is_active = true
  ON CONFLICT (user_id, lesson_id) DO NOTHING;
END;
$$;

CREATE OR REPLACE FUNCTION public.unlock_next_lesson()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_lesson lessons%ROWTYPE;
  next_lesson_id UUID;
BEGIN
  -- Só processa se a lição foi marcada como completada
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Buscar informações da lição atual
    SELECT * INTO current_lesson
    FROM lessons
    WHERE id = NEW.lesson_id;
    
    -- Buscar próxima lição no mesmo nível
    SELECT id INTO next_lesson_id
    FROM lessons
    WHERE level = current_lesson.level
      AND order_index = current_lesson.order_index + 1
      AND is_active = true
    LIMIT 1;
    
    -- Se encontrou próxima lição, desbloqueá-la
    IF next_lesson_id IS NOT NULL THEN
      INSERT INTO lesson_progress (user_id, lesson_id, status)
      VALUES (NEW.user_id, next_lesson_id, 'unlocked')
      ON CONFLICT (user_id, lesson_id) 
      DO UPDATE SET 
        status = 'unlocked',
        updated_at = now()
      WHERE lesson_progress.status = 'locked';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;