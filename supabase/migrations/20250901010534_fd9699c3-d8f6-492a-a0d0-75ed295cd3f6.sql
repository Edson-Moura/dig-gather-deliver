-- Criar tabela para rastrear progresso das lições
CREATE TABLE IF NOT EXISTS public.lesson_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  lesson_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'locked' CHECK (status IN ('locked', 'unlocked', 'completed')),
  completed_at TIMESTAMP WITH TIME ZONE NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

-- Habilitar RLS
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view their own lesson progress" 
ON public.lesson_progress 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own lesson progress" 
ON public.lesson_progress 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lesson progress" 
ON public.lesson_progress 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_lesson_progress_updated_at
BEFORE UPDATE ON public.lesson_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Função para inicializar progresso das lições para novos usuários
CREATE OR REPLACE FUNCTION public.initialize_lesson_progress_for_user(target_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Função para desbloquear próxima lição quando uma for completada
CREATE OR REPLACE FUNCTION public.unlock_next_lesson()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Trigger para desbloquear próxima lição
CREATE TRIGGER unlock_next_lesson_trigger
AFTER UPDATE ON public.lesson_progress
FOR EACH ROW
EXECUTE FUNCTION public.unlock_next_lesson();