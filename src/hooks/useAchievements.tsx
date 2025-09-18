import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProgress } from '@/hooks/useProgress';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Trophy, 
  Flame, 
  Target, 
  Star, 
  Clock, 
  BookOpen, 
  Zap, 
  Crown,
  Calendar,
  Award
} from 'lucide-react';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  requirement: number;
  type: string;
  category: string;
  points_reward: number;
  rarity: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
}

export interface UserAchievement {
  badgeId: string;
  unlockedAt: Date;
  isNew: boolean;
}

// Icon mapping for achievement types
const getIconForCategory = (category: string) => {
  switch (category) {
    case 'milestone': return BookOpen;
    case 'consistency': return Flame;
    case 'mastery': return Star;
    case 'level': return Crown;
    case 'engagement': return Trophy;
    default: return Award;
  }
};

export const useAchievements = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { progress, getMasteredCount, dailyActivities } = useProgress();
  const { toast } = useToast();
  
  const [badges, setBadges] = useState<Badge[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [newBadges, setNewBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  // Load achievement templates from database
  useEffect(() => {
    loadAchievementTemplates();
  }, []);

  // Load user achievements from database on component mount
  useEffect(() => {
    if (user) {
      loadUserAchievements();
    }
  }, [user]);

  // Check for new achievements when stats change
  useEffect(() => {
    if (user && profile && !loading && badges.length > 0) {
      checkForNewAchievements();
    }
  }, [user, profile, progress, dailyActivities, loading, badges]);

  const loadAchievementTemplates = async () => {
    try {
      // Create default achievements since we don't have achievement_templates table
      const defaultBadges: Badge[] = [
        {
          id: 'first_lesson',
          name: 'Primeira Lição',
          description: 'Complete sua primeira lição',
          icon: getIconForCategory('milestone'),
          color: 'text-green-500',
          requirement: 1,
          type: 'sentences_mastered',
          category: 'milestone',
          points_reward: 50,
          rarity: 'bronze'
        },
        {
          id: 'streak_3',
          name: 'Consistência',
          description: 'Mantenha uma sequência de 3 dias',
          icon: getIconForCategory('consistency'),
          color: 'text-orange-500',
          requirement: 3,
          type: 'streak_days',
          category: 'consistency',
          points_reward: 100,
          rarity: 'silver'
        },
        {
          id: 'master_10',
          name: 'Estudante Dedicado',
          description: 'Domine 10 frases',
          icon: getIconForCategory('mastery'),
          color: 'text-purple-500',
          requirement: 10,
          type: 'sentences_mastered',
          category: 'mastery',
          points_reward: 200,
          rarity: 'gold'
        },
        {
          id: 'daily_goal_7',
          name: 'Meta Diária',
          description: 'Atinja sua meta diária por 7 dias',
          icon: getIconForCategory('engagement'),
          color: 'text-blue-500',
          requirement: 7,
          type: 'daily_goal',
          category: 'engagement',
          points_reward: 150,
          rarity: 'silver'
        }
      ];

      setBadges(defaultBadges);
    } catch (error) {
      console.error('Error loading achievement templates:', error);
    }
  };

  const loadUserAchievements = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error loading achievements:', error);
        setUserAchievements([]);
        setLoading(false);
        return;
      }

      const achievements = data?.map(achievement => ({
        badgeId: achievement.achievement_template_id,
        unlockedAt: new Date(achievement.unlocked_at),
        isNew: achievement.is_new
      })) || [];

      setUserAchievements(achievements);
    } catch (error) {
      console.error('Error loading achievements:', error);
      setUserAchievements([]);
    } finally {
      setLoading(false);
    }
  };

  const checkForNewAchievements = async () => {
    if (!user || !profile) return;

    const currentStats = {
      streak: profile.streak_count || 0,
      sentences: getMasteredCount(),
      points: profile.points || 0,
      dailyGoalDays: getDailyGoalStreak(),
    };

    const newlyUnlocked: Badge[] = [];
    
    for (const badge of badges) {
      const isAlreadyUnlocked = userAchievements.some(ua => ua.badgeId === badge.id);
      if (isAlreadyUnlocked) continue;

      let shouldUnlock = false;

      switch (badge.type) {
        case 'streak_days':
          shouldUnlock = currentStats.streak >= badge.requirement;
          break;
        case 'phrases_mastered':
        case 'sentences_mastered':
          shouldUnlock = currentStats.sentences >= badge.requirement;
          break;
        case 'daily_goal':
          shouldUnlock = currentStats.dailyGoalDays >= badge.requirement;
          break;
        case 'lessons_completed':
          // This would need lesson completion tracking - for now, unlock based on sentences
          shouldUnlock = currentStats.sentences >= badge.requirement * 5; // Assume 5 sentences per lesson
          break;
        default:
          console.log(`Unknown achievement type: ${badge.type} for badge: ${badge.name}`);
          shouldUnlock = false;
          break;
      }

      if (shouldUnlock) {
        await unlockAchievement(badge);
        newlyUnlocked.push(badge);
      }
    }

    if (newlyUnlocked.length > 0) {
      setNewBadges(newlyUnlocked);
      // Show celebration for new badges
      newlyUnlocked.forEach(badge => {
        toast({
          title: `🎉 Nova Conquista Desbloqueada!`,
          description: `${badge.name}: ${badge.description}`,
          duration: 5000,
        });
      });
    }
  };

  const unlockAchievement = async (badge: Badge) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('achievements')
        .insert({
          user_id: user.id,
          achievement_template_id: badge.id,
          unlocked_at: new Date().toISOString(),
          is_new: true
        });

      if (error) {
        console.error('Error unlocking achievement:', error);
        // Still add locally for now since we don't have achievement_template_id in the table schema
      }

      const newAchievement: UserAchievement = {
        badgeId: badge.id,
        unlockedAt: new Date(),
        isNew: true
      };
      
      setUserAchievements(prev => [...prev, newAchievement]);
    } catch (error) {
      console.error('Error unlocking achievement:', error);
      // Still add locally since the database might not have the proper schema
      const newAchievement: UserAchievement = {
        badgeId: badge.id,
        unlockedAt: new Date(),
        isNew: true
      };
      
      setUserAchievements(prev => [...prev, newAchievement]);
    }
  };

  const getDailyGoalStreak = (): number => {
    if (!dailyActivities || dailyActivities.length === 0) return 0;
    
    // Calculate consecutive days where daily goal was met
    let streak = 0;
    const sortedActivities = [...dailyActivities].sort((a, b) => 
      new Date(b.activity_date).getTime() - new Date(a.activity_date).getTime()
    );

    for (const activity of sortedActivities) {
      if (activity.sentences_practiced >= (profile?.daily_goal || 5)) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  // Method to trigger special achievements manually
  const triggerSpecialAchievement = async (badgeId: string) => {
    const badge = badges.find(b => b.id === badgeId);
    if (!badge || userAchievements.some(ua => ua.badgeId === badgeId)) return;

    await unlockAchievement(badge);
    setNewBadges([badge]);
    toast({
      title: `🎉 Nova Conquista Desbloqueada!`,
      description: `${badge.name}: ${badge.description}`,
      duration: 5000,
    });
  };

  const getBadgeById = (id: string): Badge | undefined => {
    return badges.find(badge => badge.id === id);
  };

  const getUnlockedBadges = (): Badge[] => {
    return userAchievements
      .map(ua => getBadgeById(ua.badgeId))
      .filter(Boolean) as Badge[];
  };

  const getLockedBadges = (): Badge[] => {
    const unlockedIds = userAchievements.map(ua => ua.badgeId);
    return badges.filter(badge => !unlockedIds.includes(badge.id));
  };

  const getBadgeProgress = (badge: Badge): number => {
    const currentStats = {
      streak: profile?.streak_count || 0,
      sentences: getMasteredCount(),
      points: profile?.points || 0,
    };

    switch (badge.type) {
      case 'streak_days':
        return Math.min((currentStats.streak / badge.requirement) * 100, 100);
      case 'phrases_mastered':
        return Math.min((currentStats.sentences / badge.requirement) * 100, 100);
      default:
        return 0;
    }
  };

  const dismissNewBadges = async () => {
    if (!user) return;

    // Mark badges as not new in database
    const newBadgeIds = newBadges.map(b => b.id);
    if (newBadgeIds.length > 0) {
      await supabase
        .from('achievements')
        .update({ is_new: false })
        .eq('user_id', user.id)
        .in('achievement_template_id', newBadgeIds);
    }

    setNewBadges([]);
    setUserAchievements(prev => 
      prev.map(ua => ({ ...ua, isNew: false }))
    );
  };

  return {
    badges,
    userAchievements,
    newBadges,
    loading,
    getUnlockedBadges,
    getLockedBadges,
    getBadgeProgress,
    getBadgeById,
    dismissNewBadges,
    triggerSpecialAchievement,
    totalBadges: badges.length,
    unlockedCount: userAchievements.length
  };
};