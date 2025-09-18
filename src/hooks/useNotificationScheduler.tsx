import { useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { sendDailyGoalReminder, sendStreakReminder, sendLessonReminder } from '@/lib/notifications';

/**
 * Hook to manage automatic notification scheduling
 * This would typically be enhanced with a proper scheduling system
 * but for demo purposes, we'll use simple timers and local checks
 */
export const useNotificationScheduler = () => {
  const { user } = useAuth();
  const { profile } = useProfile();

  // Check for daily goal reminder
  const checkDailyGoal = useCallback(async () => {
    if (!user || !profile) return;

    try {
      // Get today's progress (simplified - in real app, get from API)
      const today = new Date().toDateString();
      const stored = localStorage.getItem(`dailyProgress_${user.id}_${today}`);
      const currentProgress = stored ? JSON.parse(stored).phrasesLearned : 0;
      
      const dailyGoal = profile.daily_goal || 10;
      const now = new Date();
      const hour = now.getHours();

      // Send reminder at 6 PM if goal not reached
      if (hour === 18 && currentProgress < dailyGoal) {
        const lastReminder = localStorage.getItem(`dailyGoalReminder_${user.id}_${today}`);
        
        if (!lastReminder) {
          await sendDailyGoalReminder(user.id, dailyGoal, currentProgress);
          localStorage.setItem(`dailyGoalReminder_${user.id}_${today}`, 'sent');
        }
      }
    } catch (error) {
      console.error('Error checking daily goal:', error);
    }
  }, [user, profile]);

  // Check for streak reminder
  const checkStreak = useCallback(async () => {
    if (!user || !profile) return;

    try {
      const lastActivity = new Date(profile.last_activity || new Date());
      const now = new Date();
      const hoursSinceActivity = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60);

      // If it's been more than 20 hours since last activity, send reminder
      if (hoursSinceActivity > 20 && hoursSinceActivity < 24) {
        const today = new Date().toDateString();
        const lastReminder = localStorage.getItem(`streakReminder_${user.id}_${today}`);
        
        if (!lastReminder && profile.streak_count > 0) {
          const hoursLeft = Math.max(1, Math.floor(24 - hoursSinceActivity));
          await sendStreakReminder(user.id, profile.streak_count, hoursLeft);
          localStorage.setItem(`streakReminder_${user.id}_${today}`, 'sent');
        }
      }
    } catch (error) {
      console.error('Error checking streak:', error);
    }
  }, [user, profile]);

  // Check for lesson reminder
  const checkLessonReminder = useCallback(async () => {
    if (!user) return;

    try {
      const now = new Date();
      const hour = now.getHours();

      // Send lesson reminder at 10 AM and 3 PM
      if (hour === 10 || hour === 15) {
        const today = new Date().toDateString();
        const reminderKey = `lessonReminder_${user.id}_${today}_${hour}`;
        const lastReminder = localStorage.getItem(reminderKey);
        
        if (!lastReminder) {
          await sendLessonReminder(user.id);
          localStorage.setItem(reminderKey, 'sent');
        }
      }
    } catch (error) {
      console.error('Error checking lesson reminder:', error);
    }
  }, [user]);

  // Set up periodic checks
  useEffect(() => {
    if (!user) return;

    // Check immediately
    checkDailyGoal();
    checkStreak();
    checkLessonReminder();

    // Set up hourly checks
    const interval = setInterval(() => {
      checkDailyGoal();
      checkStreak();
      checkLessonReminder();
    }, 60 * 60 * 1000); // Check every hour

    return () => clearInterval(interval);
  }, [user, checkDailyGoal, checkStreak, checkLessonReminder]);

  // Manual trigger functions for testing
  const triggerDailyGoalCheck = () => checkDailyGoal();
  const triggerStreakCheck = () => checkStreak();
  const triggerLessonReminder = () => checkLessonReminder();

  return {
    triggerDailyGoalCheck,
    triggerStreakCheck,
    triggerLessonReminder,
  };
};