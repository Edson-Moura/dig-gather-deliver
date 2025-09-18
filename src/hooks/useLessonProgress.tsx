import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

interface LessonProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  status: 'locked' | 'unlocked' | 'completed';
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export const useLessonProgress = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [lessonProgress, setLessonProgress] = useState<LessonProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchLessonProgress();
      initializeLessonProgress();
    }
  }, [user]);

  const fetchLessonProgress = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('lesson_progress')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching lesson progress:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar o progresso das lições",
          variant: "destructive",
        });
      } else {
        setLessonProgress((data || []) as LessonProgress[]);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const initializeLessonProgress = async () => {
    if (!user) return;

    try {
      await supabase.rpc('initialize_lesson_progress_for_user', {
        target_user_id: user.id
      });
      
      // Refresh progress after initialization
      await fetchLessonProgress();
    } catch (error) {
      console.error('Error initializing lesson progress:', error);
    }
  };

  const getLessonStatus = (lessonId: string): 'locked' | 'unlocked' | 'completed' => {
    const progress = lessonProgress.find(p => p.lesson_id === lessonId);
    return progress?.status || 'locked';
  };

  const isLessonUnlocked = (lessonId: string): boolean => {
    const status = getLessonStatus(lessonId);
    return status === 'unlocked' || status === 'completed';
  };

  const isLessonCompleted = (lessonId: string): boolean => {
    const status = getLessonStatus(lessonId);
    return status === 'completed';
  };

  const getLessonProgress = (lessonId: string): number => {
    if (isLessonCompleted(lessonId)) return 100;
    if (isLessonUnlocked(lessonId)) return 0;
    return 0;
  };

  const markLessonAsCompleted = async (lessonId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('lesson_progress')
        .upsert({
          user_id: user.id,
          lesson_id: lessonId,
          status: 'completed',
          completed_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,lesson_id'
        });

      if (error) {
        console.error('Error marking lesson as completed:', error);
        toast({
          title: "Erro",
          description: "Não foi possível marcar a lição como concluída",
          variant: "destructive",
        });
      } else {
        await fetchLessonProgress(); // Refresh to get updated progress
        toast({
          title: "Parabéns! 🎉",
          description: "Lição concluída com sucesso!",
          variant: "default",
        });
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const unlockLesson = async (lessonId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('lesson_progress')
        .upsert({
          user_id: user.id,
          lesson_id: lessonId,
          status: 'unlocked'
        }, {
          onConflict: 'user_id,lesson_id'
        });

      if (error) {
        console.error('Error unlocking lesson:', error);
      } else {
        await fetchLessonProgress();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const getCompletedLessonsCount = (): number => {
    return lessonProgress.filter(p => p.status === 'completed').length;
  };

  return {
    lessonProgress,
    loading,
    getLessonStatus,
    isLessonUnlocked,
    isLessonCompleted,
    getLessonProgress,
    markLessonAsCompleted,
    completLesson: markLessonAsCompleted, // Alias para compatibilidade
    unlockLesson,
    getCompletedLessonsCount,
    refetch: fetchLessonProgress,
  };
};