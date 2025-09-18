-- Função para inicializar o progresso das lições para um usuário
-- Esta função garante que apenas a primeira lição de iniciante esteja desbloqueada inicialmente
CREATE OR REPLACE FUNCTION initialize_lesson_progress_for_user(target_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Inserir progresso para todas as lições ativas
  INSERT INTO lesson_progress (user_id, lesson_id, status)
  SELECT 
    target_user_id,
    l.id,
    CASE 
      -- Primeira lição de iniciante fica desbloqueada
      WHEN l.level = 'beginner' AND l.order_index = 1 THEN 'unlocked'
      -- Todas as outras ficam bloqueadas
      ELSE 'locked'
    END as status
  FROM lessons l
  WHERE l.is_active = true
  ON CONFLICT (user_id, lesson_id) DO NOTHING;
END;
$$;

-- Função para desbloquear próxima lição quando uma é completada
CREATE OR REPLACE FUNCTION unlock_next_lesson()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  completed_lesson_level TEXT;
  completed_lesson_order INTEGER;
  next_lesson_id UUID;
  beginner_completed_count INTEGER;
  intermediate_completed_count INTEGER;
BEGIN
  -- Só processa se a lição foi marcada como completada
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    
    -- Buscar informações da lição completada
    SELECT level, order_index 
    INTO completed_lesson_level, completed_lesson_order
    FROM lessons 
    WHERE id = NEW.lesson_id;
    
    -- 1. Desbloquear próxima lição do mesmo nível
    SELECT id INTO next_lesson_id
    FROM lessons 
    WHERE level = completed_lesson_level 
      AND order_index = completed_lesson_order + 1
      AND is_active = true
    LIMIT 1;
    
    IF next_lesson_id IS NOT NULL THEN
      INSERT INTO lesson_progress (user_id, lesson_id, status)
      VALUES (NEW.user_id, next_lesson_id, 'unlocked')
      ON CONFLICT (user_id, lesson_id) 
      DO UPDATE SET status = 'unlocked' WHERE lesson_progress.status = 'locked';
    END IF;
    
    -- 2. Verificar se deve desbloquear o próximo nível
    
    -- Se completou uma lição de iniciante, verificar se deve desbloquear intermediário
    IF completed_lesson_level = 'beginner' THEN
      SELECT COUNT(*) INTO beginner_completed_count
      FROM lesson_progress lp
      JOIN lessons l ON l.id = lp.lesson_id
      WHERE lp.user_id = NEW.user_id 
        AND l.level = 'beginner' 
        AND lp.status = 'completed';
      
      -- Se completou pelo menos 3 lições de iniciante, desbloquear primeira do intermediário
      IF beginner_completed_count >= 3 THEN
        SELECT id INTO next_lesson_id
        FROM lessons 
        WHERE level = 'intermediate' 
          AND order_index = 1
          AND is_active = true
        LIMIT 1;
        
        IF next_lesson_id IS NOT NULL THEN
          INSERT INTO lesson_progress (user_id, lesson_id, status)
          VALUES (NEW.user_id, next_lesson_id, 'unlocked')
          ON CONFLICT (user_id, lesson_id) 
          DO UPDATE SET status = 'unlocked' WHERE lesson_progress.status = 'locked';
        END IF;
      END IF;
    END IF;
    
    -- Se completou uma lição de intermediário, verificar se deve desbloquear avançado
    IF completed_lesson_level = 'intermediate' THEN
      SELECT COUNT(*) INTO intermediate_completed_count
      FROM lesson_progress lp
      JOIN lessons l ON l.id = lp.lesson_id
      WHERE lp.user_id = NEW.user_id 
        AND l.level = 'intermediate' 
        AND lp.status = 'completed';
      
      -- Se completou pelo menos 3 lições de intermediário, desbloquear primeira do avançado
      IF intermediate_completed_count >= 3 THEN
        SELECT id INTO next_lesson_id
        FROM lessons 
        WHERE level = 'advanced' 
          AND order_index = 1
          AND is_active = true
        LIMIT 1;
        
        IF next_lesson_id IS NOT NULL THEN
          INSERT INTO lesson_progress (user_id, lesson_id, status)
          VALUES (NEW.user_id, next_lesson_id, 'unlocked')
          ON CONFLICT (user_id, lesson_id) 
          DO UPDATE SET status = 'unlocked' WHERE lesson_progress.status = 'locked';
        END IF;
      END IF;
    END IF;
    
  END IF;
  
  RETURN NEW;
END;
$$;

-- Criar trigger para execução automática
DROP TRIGGER IF EXISTS trigger_unlock_next_lesson ON lesson_progress;
CREATE TRIGGER trigger_unlock_next_lesson
  AFTER INSERT OR UPDATE ON lesson_progress
  FOR EACH ROW
  EXECUTE FUNCTION unlock_next_lesson();

-- Adicionar constraint única para evitar duplicatas
ALTER TABLE lesson_progress 
ADD CONSTRAINT unique_user_lesson 
UNIQUE (user_id, lesson_id);

-- Resetar progresso existente para garantir lógica correta
-- (opcional, apenas se quiser resetar dados de teste)
UPDATE lesson_progress SET status = 'locked' 
WHERE status != 'completed';

-- Reativar apenas primeiras lições de iniciante para usuários existentes
UPDATE lesson_progress 
SET status = 'unlocked' 
WHERE lesson_id IN (
  SELECT id FROM lessons 
  WHERE level = 'beginner' 
    AND order_index = 1 
    AND is_active = true
) AND status = 'locked';