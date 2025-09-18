import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { useProgress } from '@/hooks/useProgress';

interface PlanLimits {
  dailyLessons: number;
  totalSentences: number;
  chatMessages: number;
  hasAudio: boolean;
  hasSpacedRepetition: boolean;
  hasAdvancedQuizzes: boolean;
}

const PLAN_LIMITS = {
  free: {
    dailyLessons: 3,
    totalSentences: 50,
    chatMessages: 10,
    hasAudio: false,
    hasSpacedRepetition: false,
    hasAdvancedQuizzes: false,
  },
  premium: {
    dailyLessons: -1, // unlimited
    totalSentences: 500,
    chatMessages: 100,
    hasAudio: true,
    hasSpacedRepetition: true,
    hasAdvancedQuizzes: true,
  },
  pro: {
    dailyLessons: -1, // unlimited
    totalSentences: -1, // unlimited
    chatMessages: -1, // unlimited
    hasAudio: true,
    hasSpacedRepetition: true,
    hasAdvancedQuizzes: true,
  },
};

export const usePlanLimits = () => {
  const { user } = useAuth();
  const { subscriptionData } = useSubscription();
  const { getMasteredCount, getDailyGoalProgress } = useProgress();
  const [dailyChatMessages, setDailyChatMessages] = useState(0);

  // Determine current plan
  const currentPlan = subscriptionData.subscribed 
    ? (subscriptionData.subscription_tier?.toLowerCase() || 'free')
    : 'free';

  // Map "premium" to "premium" and "pro" to "pro" 
  const normalizedPlan = currentPlan === 'premium' ? 'premium' : currentPlan === 'pro' ? 'pro' : 'free';
  const limits = PLAN_LIMITS[normalizedPlan as keyof typeof PLAN_LIMITS] || PLAN_LIMITS.free;

  // Check if user has reached daily lesson limit
  const hasReachedDailyLessonLimit = () => {
    if (limits.dailyLessons === -1) return false;
    return getDailyGoalProgress() >= limits.dailyLessons;
  };

  // Check if user has reached total sentences limit
  const hasReachedSentenceLimit = () => {
    if (limits.totalSentences === -1) return false;
    return getMasteredCount() >= limits.totalSentences;
  };

  // Check if user has reached daily chat limit
  const hasReachedChatLimit = () => {
    if (limits.chatMessages === -1) return false;
    return dailyChatMessages >= limits.chatMessages;
  };

  // Increment daily chat message count
  const incrementChatMessages = () => {
    setDailyChatMessages(prev => prev + 1);
  };

  // Reset daily counters (called daily)
  const resetDailyLimits = () => {
    setDailyChatMessages(0);
  };

  // Check if any feature is limited
  const isFeatureLimited = (feature: 'lessons' | 'chat' | 'audio' | 'spaced_repetition' | 'advanced_quizzes') => {
    switch (feature) {
      case 'lessons':
        return hasReachedDailyLessonLimit() || hasReachedSentenceLimit();
      case 'chat':
        return hasReachedChatLimit();
      case 'audio':
        return !limits.hasAudio;
      case 'spaced_repetition':
        return !limits.hasSpacedRepetition;
      case 'advanced_quizzes':
        return !limits.hasAdvancedQuizzes;
      default:
        return false;
    }
  };

  // Get remaining usage for a feature
  const getRemainingUsage = (feature: 'lessons' | 'chat' | 'sentences') => {
    switch (feature) {
      case 'lessons':
        if (limits.dailyLessons === -1) return -1;
        return Math.max(0, limits.dailyLessons - getDailyGoalProgress());
      case 'chat':
        if (limits.chatMessages === -1) return -1;
        return Math.max(0, limits.chatMessages - dailyChatMessages);
      case 'sentences':
        if (limits.totalSentences === -1) return -1;
        return Math.max(0, limits.totalSentences - getMasteredCount());
      default:
        return 0;
    }
  };

  // Get usage percentage for progress bars
  const getUsagePercentage = (feature: 'lessons' | 'chat' | 'sentences') => {
    switch (feature) {
      case 'lessons':
        if (limits.dailyLessons === -1) return 0;
        return (getDailyGoalProgress() / limits.dailyLessons) * 100;
      case 'chat':
        if (limits.chatMessages === -1) return 0;
        return (dailyChatMessages / limits.chatMessages) * 100;
      case 'sentences':
        if (limits.totalSentences === -1) return 0;
        return (getMasteredCount() / limits.totalSentences) * 100;
      default:
        return 0;
    }
  };

  return {
    currentPlan: normalizedPlan,
    limits,
    hasReachedDailyLessonLimit,
    hasReachedSentenceLimit,
    hasReachedChatLimit,
    incrementChatMessages,
    resetDailyLimits,
    isFeatureLimited,
    getRemainingUsage,
    getUsagePercentage,
  };
};