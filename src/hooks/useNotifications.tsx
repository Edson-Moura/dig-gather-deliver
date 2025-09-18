import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface NotificationPreferences {
  email_enabled: boolean;
  push_enabled: boolean;
  lesson_reminders: boolean;
  streak_reminders: boolean;
  achievement_notifications: boolean;
  daily_goal_reminders: boolean;
  weekly_summary: boolean;
}

interface PushSubscription {
  id: string;
  device_name?: string;
  created_at: string;
  is_active: boolean;
}

export const useNotifications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [devices, setDevices] = useState<PushSubscription[]>([]);
  const [loading, setLoading] = useState(false);
  const [pushSupported, setPushSupported] = useState(false);
  const [pushPermission, setPushPermission] = useState<NotificationPermission>('default');

  // Check if push notifications are supported
  useEffect(() => {
    const isSupported = 'serviceWorker' in navigator && 
                       'PushManager' in window && 
                       'Notification' in window;
    setPushSupported(isSupported);

    if (isSupported) {
      setPushPermission(Notification.permission);
    }
  }, []);

  // Load notification preferences
  const loadPreferences = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading notification preferences:', error);
        return;
      }

      setPreferences(data || {
        email_enabled: true,
        push_enabled: false,
        lesson_reminders: true,
        streak_reminders: true,
        achievement_notifications: true,
        daily_goal_reminders: true,
        weekly_summary: true,
      });
    } catch (error) {
      console.error('Error loading notification preferences:', error);
    }
  }, [user]);

  // Load push devices
  const loadDevices = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('push_subscriptions')
        .select('id, device_name, created_at, is_active')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading push devices:', error);
        return;
      }

      setDevices(data || []);
    } catch (error) {
      console.error('Error loading push devices:', error);
    }
  }, [user]);

  // Initialize
  useEffect(() => {
    if (user) {
      loadPreferences();
      loadDevices();
    }
  }, [user, loadPreferences, loadDevices]);

  // Update notification preferences
  const updatePreferences = async (updates: Partial<NotificationPreferences>) => {
    if (!user || !preferences) return;

    setLoading(true);
    try {
      const newPreferences = { ...preferences, ...updates };

      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          ...newPreferences,
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      setPreferences(newPreferences);
      
      toast({
        title: "Configurações salvas",
        description: "Suas preferências de notificação foram atualizadas.",
      });
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Request push permission and register service worker
  const enablePushNotifications = async () => {
    if (!pushSupported) {
      toast({
        title: "Não suportado",
        description: "Seu navegador não suporta notificações push.",
        variant: "destructive",
      });
      return false;
    }

    try {
      // Request permission
      const permission = await Notification.requestPermission();
      setPushPermission(permission);

      if (permission !== 'granted') {
        toast({
          title: "Permissão negada",
          description: "Você precisa permitir notificações para receber avisos.",
          variant: "destructive",
        });
        return false;
      }

      // Register service worker
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);

      // Wait for service worker to be ready
      await navigator.serviceWorker.ready;

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          'BGxJKHqB2PQOD4AKGviRrcL0r5ne8H0VPrC2KyH1-A_FNxOhz1KJv8YH2bGP0e3L6L_dGMyZRZ5dBz3r-kf5dY4'
        ),
      });

      // Register device with our backend
      const response = await supabase.functions.invoke('register-push-device', {
        body: {
          subscription: {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!))),
              auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!))),
            }
          },
          userAgent: navigator.userAgent,
          deviceName: getDeviceName(),
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      // Update preferences to enable push
      await updatePreferences({ push_enabled: true });
      
      // Reload devices
      await loadDevices();

      toast({
        title: "✅ Notificações ativadas",
        description: "Você receberá notificações push neste dispositivo.",
      });

      return true;
    } catch (error) {
      console.error('Error enabling push notifications:', error);
      toast({
        title: "Erro",
        description: "Não foi possível ativar as notificações push.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Disable push notifications
  const disablePushNotifications = async () => {
    try {
      // Unsubscribe from push notifications
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await subscription.unsubscribe();
        }
      }

      // Update preferences
      await updatePreferences({ push_enabled: false });

      // Deactivate devices in database (we'll keep the record for history)
      if (user) {
        await supabase
          .from('push_subscriptions')
          .update({ is_active: false })
          .eq('user_id', user.id);
      }

      // Reload devices
      await loadDevices();

      toast({
        title: "Notificações desativadas",
        description: "Você não receberá mais notificações push.",
      });
    } catch (error) {
      console.error('Error disabling push notifications:', error);
      toast({
        title: "Erro",
        description: "Não foi possível desativar as notificações push.",
        variant: "destructive",
      });
    }
  };

  // Send test notification
  const sendTestNotification = async () => {
    if (!user) return;

    try {
      const response = await supabase.functions.invoke('send-notification', {
        body: {
          userId: user.id,
          type: 'both',
          category: 'daily_goal',
          title: '🎯 Teste de Notificação',
          body: 'Esta é uma notificação de teste do Daily Talk Boost!',
          metadata: { test: true }
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      toast({
        title: "Teste enviado",
        description: "Verifique seu email e notificações push.",
      });
    } catch (error) {
      console.error('Error sending test notification:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar a notificação de teste.",
        variant: "destructive",
      });
    }
  };

  return {
    preferences,
    devices,
    loading,
    pushSupported,
    pushPermission,
    updatePreferences,
    enablePushNotifications,
    disablePushNotifications,
    sendTestNotification,
    refresh: () => {
      loadPreferences();
      loadDevices();
    }
  };
};

// Helper functions
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function getDeviceName() {
  const userAgent = navigator.userAgent;
  
  if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
    if (/iPhone|iPad/.test(userAgent)) return 'iPhone/iPad';
    if (/Android/.test(userAgent)) return 'Android';
    return 'Dispositivo Móvel';
  }
  
  if (/Windows/.test(userAgent)) return 'Windows';
  if (/Mac/.test(userAgent)) return 'Mac';
  if (/Linux/.test(userAgent)) return 'Linux';
  
  return 'Desktop';
}
