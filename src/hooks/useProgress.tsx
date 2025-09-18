import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useProfile } from '@/hooks/useProfile';

interface UserProgress {
  id: string;
  user_id: string;
  sentence_id: string;
  status: 'not_started' | 'learning' | 'mastered' | 'review_needed';
  attempts: number;
  correct_attempts: number;
  last_practiced: string | null;
  mastered_at: string | null;
  created_at: string;
  updated_at: string;
}

interface DailyActivity {
  id: string;
  user_id: string;
  activity_date: string;
  sentences_practiced: number;
  sentences_mastered: number;
  time_spent_minutes: number;
  points_earned: number;
  streak_maintained: boolean;
  created_at: string;
  updated_at: string;
}

export const useProgress = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { addPoints } = useProfile();
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [dailyActivities, setDailyActivities] = useState<DailyActivity[]>([]);
  const [todayActivity, setTodayActivity] = useState<DailyActivity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProgress();
      fetchDailyActivities();
      fetchTodayActivity();
    } else {
      setProgress([]);
      setDailyActivities([]);
      setTodayActivity(null);
      setLoading(false);
    }
  }, [user]);

  const fetchProgress = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching progress:', error);
      } else {
        setProgress((data as UserProgress[]) || []);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchDailyActivities = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('daily_activities')
        .select('*')
        .eq('user_id', user.id)
        .order('activity_date', { ascending: false })
        .limit(30);

      if (error) {
        console.error('Error fetching daily activities:', error);
      } else {
        setDailyActivities(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchTodayActivity = async () => {
    if (!user) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('daily_activities')
        .select('*')
        .eq('user_id', user.id)
        .eq('activity_date', today)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching today activity:', error);
      } else {
        setTodayActivity(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async (
    sentenceId: string, 
    status: UserProgress['status'],
    isCorrect: boolean = false
  ) => {
    if (!user) {
      console.log('❌ UpdateProgress: No user logged in');
      return;
    }

    console.log('🔄 UpdateProgress called:', { sentenceId, status, isCorrect, userId: user.id });

    try {
      const existingProgress = progress.find(p => p.sentence_id === sentenceId);
      console.log('📊 Existing progress:', existingProgress);
      
      if (existingProgress) {
        const newAttempts = existingProgress.attempts + 1;
        const newCorrectAttempts = existingProgress.correct_attempts + (isCorrect ? 1 : 0);
        
        console.log('📝 Updating existing progress:', { 
          id: existingProgress.id,
          newAttempts, 
          newCorrectAttempts, 
          status 
        });
        
        const { error } = await supabase
          .from('user_progress')
          .update({
            status,
            attempts: newAttempts,
            correct_attempts: newCorrectAttempts,
            last_practiced: new Date().toISOString(),
            mastered_at: status === 'mastered' ? new Date().toISOString() : existingProgress.mastered_at,
          })
          .eq('id', existingProgress.id);

        if (error) {
          console.error('❌ Error updating progress:', error);
          toast({
            title: "Erro",
            description: "Não foi possível atualizar o progresso",
            variant: "destructive",
          });
          return;
        }
        console.log('✅ Progress updated successfully');
      } else {
        console.log('📝 Creating new progress entry');
        
        const { error } = await supabase
          .from('user_progress')
          .insert({
            user_id: user.id,
            sentence_id: sentenceId,
            status,
            attempts: 1,
            correct_attempts: isCorrect ? 1 : 0,
            last_practiced: new Date().toISOString(),
            mastered_at: status === 'mastered' ? new Date().toISOString() : null,
          });

        if (error) {
          console.error('❌ Error creating progress:', error);
          toast({
            title: "Erro",
            description: "Não foi possível salvar o progresso",
            variant: "destructive",
          });
          return;
        }
        console.log('✅ New progress created successfully');
      }

      console.log('🔄 Refreshing progress data...');
      await fetchProgress();
      await updateTodayActivity(isCorrect, status === 'mastered');
      
      // Add points to profile
      const pointsToAdd = isCorrect ? (status === 'mastered' ? 25 : 10) : 0;
      console.log('🎯 Adding points:', pointsToAdd, 'for', status);
      if (pointsToAdd > 0 && addPoints) {
        await addPoints(pointsToAdd);
        console.log('✅ Points added successfully');
      }
      
      console.log('✅ UpdateProgress completed');
      
    } catch (error) {
      console.error('❌ UpdateProgress Error:', error);
      toast({
        title: "Erro",
        description: "Erro interno ao salvar progresso",
        variant: "destructive",
      });
    }
  };

  const updateTodayActivity = async (
    practiceIncrement: boolean = true,
    masteredIncrement: boolean = false
  ) => {
    if (!user) {
      console.log('❌ UpdateTodayActivity: No user logged in');
      return;
    }

    console.log('🔄 UpdateTodayActivity called:', { practiceIncrement, masteredIncrement });

    try {
      const today = new Date().toISOString().split('T')[0];
      
      if (todayActivity) {
        console.log('📝 Updating existing daily activity:', todayActivity.id);
        
        const { error } = await supabase
          .from('daily_activities')
          .update({
            sentences_practiced: todayActivity.sentences_practiced + (practiceIncrement ? 1 : 0),
            sentences_mastered: todayActivity.sentences_mastered + (masteredIncrement ? 1 : 0),
            points_earned: todayActivity.points_earned + (practiceIncrement ? 10 : 0) + (masteredIncrement ? 25 : 0),
          })
          .eq('id', todayActivity.id);

        if (error) {
          console.error('❌ Error updating today activity:', error);
        } else {
          console.log('✅ Daily activity updated successfully');
        }
      } else {
        console.log('📝 Creating new daily activity entry');
        
        const { error } = await supabase
          .from('daily_activities')
          .insert({
            user_id: user.id,
            activity_date: today,
            sentences_practiced: practiceIncrement ? 1 : 0,
            sentences_mastered: masteredIncrement ? 1 : 0,
            points_earned: (practiceIncrement ? 10 : 0) + (masteredIncrement ? 25 : 0),
            streak_maintained: true,
          });

        if (error) {
          console.error('❌ Error creating today activity:', error);
        } else {
          console.log('✅ New daily activity created successfully');
        }
      }

      console.log('🔄 Refreshing today activity data...');
      await fetchTodayActivity();
      console.log('✅ UpdateTodayActivity completed');
    } catch (error) {
      console.error('❌ UpdateTodayActivity Error:', error);
    }
  };

  const getProgressForSentence = (sentenceId: string) => {
    return progress.find(p => p.sentence_id === sentenceId);
  };

  const getMasteredCount = () => {
    return progress.filter(p => p.status === 'mastered').length;
  };

  const getDailyGoalProgress = () => {
    if (!todayActivity) return 0;
    return todayActivity.sentences_practiced;
  };

  return {
    progress,
    dailyActivities,
    todayActivity,
    loading,
    updateProgress,
    getProgressForSentence,
    getMasteredCount,
    getDailyGoalProgress,
    refetch: () => {
      fetchProgress();
      fetchDailyActivities();
      fetchTodayActivity();
    },
  };
};