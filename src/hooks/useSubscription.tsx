import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionData {
  subscribed: boolean;
  subscription_tier: string | null;
  subscription_end: string | null;
}

export const useSubscription = () => {
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData>({
    subscribed: false,
    subscription_tier: null,
    subscription_end: null,
  });
  const [loading, setLoading] = useState(false);
  const { user, session } = useAuth();
  const { toast } = useToast();

  const checkSubscription = useCallback(async () => {
    if (!user || !session) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      if (data && typeof data === 'object') {
        const newSubscriptionData = {
          subscribed: data.subscribed || false,
          subscription_tier: data.subscription_tier || null,
          subscription_end: data.subscription_end || null,
        };
        
        console.log('Subscription data received:', newSubscriptionData);
        setSubscriptionData(newSubscriptionData);
      } else {
        console.error('Invalid response data:', data);
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
      
      // Set default values on error to prevent cached stale data
      setSubscriptionData({
        subscribed: false,
        subscription_tier: null,
        subscription_end: null,
      });
      
      // Don't show error toast for network issues, auth problems, or edge function connectivity issues
      const errorMessage = error?.message || '';
      const shouldShowToast = errorMessage && 
        !errorMessage.includes('auth') && 
        !errorMessage.includes('network') &&
        !errorMessage.includes('Failed to fetch') &&
        !errorMessage.includes('Failed to send a request to the Edge Function');
      
      if (shouldShowToast) {
        toast({
          title: "Erro",
          description: "Erro ao verificar assinatura.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  }, [user?.id, session?.access_token, toast]);

  const createCheckout = async (plan: string) => {
    if (!user || !session) {
      toast({
        title: "Login necessário",
        description: "Você precisa estar logado para assinar.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { plan },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      // Check if we got a valid response with URL
      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      if (!data?.url) {
        console.error('No checkout URL returned:', data);
        throw new Error('No checkout URL returned');
      }

      console.log('Checkout session created:', data.url);

      // Open Stripe checkout in same tab for better mobile compatibility
      window.location.href = data.url;
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast({
        title: "Erro",
        description: "Erro ao iniciar checkout.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const openCustomerPortal = async () => {
    if (!user || !session) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      // Open customer portal in a new tab (prevent reverse tabnabbing)
      const newWindow = window.open('', '_blank', 'noopener,noreferrer');
      if (newWindow) {
        newWindow.location.href = data.url;
      } else {
        // Fallback if popup is blocked
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast({
        title: "Erro",
        description: "Erro ao abrir portal do cliente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && session) {
      checkSubscription();
      
      // Also check subscription when coming from a payment success URL
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('session_id')) {
        // Multiple attempts with delays to ensure Stripe webhook has processed
        setTimeout(() => checkSubscription(), 1000);
        setTimeout(() => checkSubscription(), 3000);
        setTimeout(() => checkSubscription(), 5000);
      }
    }
  }, [user?.id, session?.access_token, checkSubscription]);

  return {
    subscriptionData,
    loading,
    checkSubscription,
    createCheckout,
    openCustomerPortal,
  };
};