import { supabase } from '@/integrations/supabase/client';

export type NotificationType = 'email' | 'push' | 'both';
export type NotificationCategory = 
  | 'lesson_reminder' 
  | 'streak_reminder' 
  | 'achievement' 
  | 'daily_goal' 
  | 'weekly_summary';

interface SendNotificationParams {
  userId: string;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  body: string;
  metadata?: Record<string, any>;
}

/**
 * Send a notification to a user via email, push, or both
 */
export const sendNotification = async (params: SendNotificationParams) => {
  try {
    const response = await supabase.functions.invoke('send-notification', {
      body: params
    });

    if (response.error) {
      throw new Error(response.error.message);
    }

    return response.data;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
};

/**
 * Send achievement notification
 */
export const sendAchievementNotification = async (
  userId: string, 
  achievementName: string,
  description: string
) => {
  return sendNotification({
    userId,
    type: 'both',
    category: 'achievement',
    title: `🏆 Nova Conquista Desbloqueada!`,
    body: `Parabéns! Você desbloqueou: ${achievementName}. ${description}`,
    metadata: { achievement: achievementName }
  });
};

/**
 * Send daily goal reminder
 */
export const sendDailyGoalReminder = async (
  userId: string,
  goal: number,
  current: number
) => {
  const remaining = Math.max(0, goal - current);
  
  if (remaining === 0) {
    return sendNotification({
      userId,
      type: 'both',
      category: 'daily_goal',
      title: `🎯 Meta Diária Alcançada!`,
      body: `Parabéns! Você atingiu sua meta de ${goal} frases hoje!`,
      metadata: { goal, current, completed: true }
    });
  } else {
    return sendNotification({
      userId,
      type: 'both',
      category: 'daily_goal',
      title: `⏰ Lembrete da Meta Diária`,
      body: `Você está a ${remaining} ${remaining === 1 ? 'frase' : 'frases'} da sua meta diária!`,
      metadata: { goal, current, remaining }
    });
  }
};

/**
 * Send streak reminder
 */
export const sendStreakReminder = async (
  userId: string,
  streakCount: number,
  hoursLeft: number
) => {
  return sendNotification({
    userId,
    type: 'both',
    category: 'streak_reminder',
    title: `🔥 Mantenha sua Sequência!`,
    body: `Sua sequência de ${streakCount} ${streakCount === 1 ? 'dia' : 'dias'} está em risco! Pratique nas próximas ${hoursLeft} horas.`,
    metadata: { streakCount, hoursLeft }
  });
};

/**
 * Send lesson reminder
 */
export const sendLessonReminder = async (
  userId: string,
  lessonTitle?: string
) => {
  return sendNotification({
    userId,
    type: 'both',
    category: 'lesson_reminder',
    title: `📚 Hora de Estudar!`,
    body: lessonTitle 
      ? `Continue sua lição: ${lessonTitle}` 
      : `Que tal praticar um pouco de inglês agora?`,
    metadata: { lesson: lessonTitle }
  });
};

/**
 * Send weekly summary
 */
export const sendWeeklySummary = async (
  userId: string,
  summary: {
    lessonsCompleted: number;
    phrasesLearned: number;
    streakDays: number;
    pointsEarned: number;
  }
) => {
  return sendNotification({
    userId,
    type: 'email',
    category: 'weekly_summary',
    title: `📊 Seu Resumo Semanal - Daily Talk Boost`,
    body: `Esta semana você completou ${summary.lessonsCompleted} lições, aprendeu ${summary.phrasesLearned} frases, manteve ${summary.streakDays} dias de sequência e ganhou ${summary.pointsEarned} pontos!`,
    metadata: summary
  });
};

/**
 * Check if user has notification preferences enabled for a category
 */
export const checkNotificationPreferences = async (
  userId: string,
  category: NotificationCategory
): Promise<{ email: boolean; push: boolean }> => {
  try {
    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      // Default preferences if not found
      return { email: true, push: false };
    }

    const categoryEnabled = {
      lesson_reminder: data.lesson_reminders,
      streak_reminder: data.streak_reminders,
      achievement: data.achievement_notifications,
      daily_goal: data.daily_goal_reminders,
      weekly_summary: data.weekly_summary,
    }[category] ?? true;

    return {
      email: data.email_enabled && categoryEnabled,
      push: data.push_enabled && categoryEnabled,
    };
  } catch (error) {
    console.error('Error checking notification preferences:', error);
    return { email: true, push: false };
  }
};

/**
 * Send notification with preference check
 */
export const sendNotificationWithPreferences = async (params: SendNotificationParams) => {
  const preferences = await checkNotificationPreferences(params.userId, params.category);
  
  let type: NotificationType = params.type;
  
  // Adjust type based on user preferences
  if (params.type === 'both') {
    if (preferences.email && preferences.push) {
      type = 'both';
    } else if (preferences.email) {
      type = 'email';
    } else if (preferences.push) {
      type = 'push';
    } else {
      // User has disabled this category
      console.log(`User ${params.userId} has disabled ${params.category} notifications`);
      return null;
    }
  } else if (params.type === 'email' && !preferences.email) {
    console.log(`User ${params.userId} has disabled email notifications for ${params.category}`);
    return null;
  } else if (params.type === 'push' && !preferences.push) {
    console.log(`User ${params.userId} has disabled push notifications for ${params.category}`);
    return null;
  }

  return sendNotification({ ...params, type });
};