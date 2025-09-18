import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { errorHandler, ErrorCategory, handleAsyncError } from '@/lib/error-handler';
import { logger } from '@/lib/logger';

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
    logger.info('Checking subscription status', { userId: user.id }, 'useSubscription');
    
    const result = await handleAsyncError(
      async () => {
        const { data, error } = await supabase.functions.invoke('check-subscription', {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (error) {
          throw error;
        }

        if (!data || typeof data !== 'object') {
          throw new Error('Invalid response format from subscription service');
        }

        const newSubscriptionData = {
          subscribed: data.subscribed || false,
          subscription_tier: data.subscription_tier || null,
          subscription_end: data.subscription_end || null,
        };
        
        logger.info('Subscription data retrieved successfully', { 
          subscribed: newSubscriptionData.subscribed,
          tier: newSubscriptionData.subscription_tier 
        }, 'useSubscription', user.id);
        
        setSubscriptionData(newSubscriptionData);
        return newSubscriptionData;
      },
      {
        userId: user.id,
        action: 'checkSubscription',
        component: 'useSubscription'
      }
    );

    if (!result) {
      // Set default values on error to prevent cached stale data
      setSubscriptionData({
        subscribed: false,
        subscription_tier: null,
        subscription_end: null,
      });
    }

    setLoading(false);
  }, [user?.id, session?.access_token]);

  const createCheckout = async (plan: string) => {
    if (!user || !session) {
      errorHandler.handleError(
        new Error('User must be authenticated to create checkout'),
        {
          userId: user?.id,
          action: 'createCheckout',
          component: 'useSubscription',
          metadata: { plan }
        }
      );
      return;
    }

    setLoading(true);
    logger.userAction('Create checkout initiated', user.id, { plan });
    
    const result = await handleAsyncError(
      async () => {
        const { data, error } = await supabase.functions.invoke('create-checkout', {
          body: { plan },
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (error) {
          throw error;
        }

        if (!data?.url) {
          throw new Error('No checkout URL returned from payment service');
        }

        logger.info('Checkout session created successfully', { url: data.url }, 'useSubscription', user.id);

        // Open Stripe checkout in same tab for better mobile compatibility
        window.location.href = data.url;
        return data;
      },
      {
        userId: user.id,
        action: 'createCheckout',
        component: 'useSubscription',
        metadata: { plan }
      }
    );

    setLoading(false);
  };

  const openCustomerPortal = async () => {
    if (!user || !session) return;

    setLoading(true);
    logger.userAction('Open customer portal', user.id);
    
    const result = await handleAsyncError(
      async () => {
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
        
        logger.info('Customer portal opened successfully', { url: data.url }, 'useSubscription', user.id);
        return data;
      },
      {
        userId: user.id,
        action: 'openCustomerPortal',
        component: 'useSubscription'
      }
    );

    setLoading(false);
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