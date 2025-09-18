import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationRequest {
  userId: string;
  type: 'email' | 'push' | 'both';
  category: 'lesson_reminder' | 'streak_reminder' | 'achievement' | 'daily_goal' | 'weekly_summary';
  title: string;
  body: string;
  metadata?: Record<string, any>;
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      userId,
      type,
      category,
      title,
      body,
      metadata = {}
    }: NotificationRequest = await req.json();

    console.log(`Sending ${type} notification to user ${userId}: ${title}`);

    // Get user profile and notification preferences
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name, user_id')
      .eq('user_id', userId)
      .single();

    const { data: preferences } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!profile) {
      console.error('User profile not found');
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const results = [];

    // Send email notification
    if ((type === 'email' || type === 'both') && preferences?.email_enabled) {
      try {
        // Get user email from auth
        const { data: authUser } = await supabase.auth.admin.getUserById(userId);
        
        if (authUser.user?.email) {
          const emailResponse = await resend.emails.send({
            from: "Daily Talk Boost <noreply@dailytalkboost.com>",
            to: [authUser.user.email],
            subject: title,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #3B82F6; text-align: center;">${title}</h1>
                <p style="font-size: 16px; line-height: 1.6; color: #333;">
                  Olá, ${profile.display_name || 'estudante'}!
                </p>
                <p style="font-size: 16px; line-height: 1.6; color: #333;">
                  ${body}
                </p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://dailytalkboost.com/dashboard" 
                     style="background-color: #3B82F6; color: white; padding: 12px 24px; 
                            text-decoration: none; border-radius: 6px; display: inline-block;">
                    Continuar Aprendendo
                  </a>
                </div>
                <p style="font-size: 14px; color: #666; text-align: center;">
                  Este é um email automático do Daily Talk Boost. 
                  Você pode gerenciar suas notificações nas configurações.
                </p>
              </div>
            `,
          });

          console.log("Email sent successfully:", emailResponse);

          // Log email notification
          await supabase.from('notification_logs').insert({
            user_id: userId,
            notification_type: 'email',
            category,
            title,
            body,
            success: true,
            metadata: { email_id: emailResponse.data?.id, ...metadata }
          });

          results.push({ type: 'email', success: true });
        }
      } catch (error) {
        console.error('Error sending email:', error);
        
        // Log failed email notification
        await supabase.from('notification_logs').insert({
          user_id: userId,
          notification_type: 'email',
          category,
          title,
          body,
          success: false,
          error_message: error.message,
          metadata
        });

        results.push({ type: 'email', success: false, error: error.message });
      }
    }

    // Send push notification
    if ((type === 'push' || type === 'both') && preferences?.push_enabled) {
      try {
        // Get active push subscriptions for user
        const { data: subscriptions } = await supabase
          .from('push_subscriptions')
          .select('*')
          .eq('user_id', userId)
          .eq('is_active', true);

        if (subscriptions && subscriptions.length > 0) {
          // Send push notification to all devices
          const pushResults = await Promise.allSettled(
            subscriptions.map(async (subscription) => {
              const response = await fetch('https://web-push-codelab.glitch.me/send-notification', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  subscription: {
                    endpoint: subscription.endpoint,
                    keys: {
                      p256dh: subscription.p256dh,
                      auth: subscription.auth,
                    }
                  },
                  payload: JSON.stringify({
                    title,
                    body,
                    icon: '/favicon.ico',
                    badge: '/favicon.ico',
                    data: { category, userId, ...metadata }
                  }),
                  options: {
                    TTL: 24 * 60 * 60 // 24 hours
                  }
                }),
              });

              return response.ok;
            })
          );

          const successCount = pushResults.filter(result => 
            result.status === 'fulfilled' && result.value
          ).length;

          console.log(`Push notifications sent to ${successCount}/${subscriptions.length} devices`);

          // Log push notification
          await supabase.from('notification_logs').insert({
            user_id: userId,
            notification_type: 'push',
            category,
            title,
            body,
            success: successCount > 0,
            metadata: { devices_sent: successCount, total_devices: subscriptions.length, ...metadata }
          });

          results.push({ 
            type: 'push', 
            success: successCount > 0, 
            devicesSent: successCount, 
            totalDevices: subscriptions.length 
          });
        } else {
          console.log('No active push subscriptions found for user');
          results.push({ type: 'push', success: false, error: 'No active devices' });
        }
      } catch (error) {
        console.error('Error sending push notification:', error);
        
        // Log failed push notification
        await supabase.from('notification_logs').insert({
          user_id: userId,
          notification_type: 'push',
          category,
          title,
          body,
          success: false,
          error_message: error.message,
          metadata
        });

        results.push({ type: 'push', success: false, error: error.message });
      }
    }

    return new Response(JSON.stringify({ success: true, results }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error in send-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);