import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  level: string;
  daily_goal: number;
  streak_count: number;
  last_activity: string;
  total_phrases_learned: number;
  points: number;
  created_at: string;
  updated_at: string;
}

export const useProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar o perfil.",
          variant: "destructive",
        });
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user || !profile) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating profile:', error);
        toast({
          title: "Erro",
          description: "Não foi possível atualizar o perfil.",
          variant: "destructive",
        });
      } else {
        setProfile({ ...profile, ...updates });
        toast({
          title: "Sucesso",
          description: "Perfil atualizado com sucesso!",
        });
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const updateStreak = async () => {
    if (!user || !profile) return;

    const today = new Date().toISOString().split('T')[0];
    const lastActivity = new Date(profile.last_activity);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    let newStreakCount = profile.streak_count;

    if (profile.last_activity !== today) {
      if (lastActivity.toDateString() === yesterday.toDateString()) {
        newStreakCount += 1;
      } else {
        newStreakCount = 1;
      }

      await updateProfile({
        streak_count: newStreakCount,
        last_activity: today,
      });
    }
  };

  const addPoints = async (points: number) => {
    if (!user || !profile) return;

    const newPoints = profile.points + points;
    const phrasesLearned = profile.total_phrases_learned + (points >= 25 ? 1 : 0);
    
    console.log('🔥 Profile: Adding', points, 'points. New total:', newPoints);
    console.log('📚 Phrases learned:', phrasesLearned);
    
    await updateProfile({
      points: newPoints,
      total_phrases_learned: phrasesLearned,
    });
  };

  return {
    profile,
    loading,
    updateProfile,
    updateStreak,
    addPoints,
    refetch: fetchProfile,
  };
};