import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// Allowed origins for security
const allowedOrigins = [
  "https://yttjiuxjuanyzszlrdwj.supabase.co",
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:8080",
  "https://id-preview--cf054631-3081-49ef-9a3b-2d1539d1d090.lovable.app",
  "https://73d0f75a-2cf9-446f-9299-809446722b3d.sandbox.lovable.dev",
  "https://96e5880b-26d0-4ba0-890a-68b2dd50abe5.sandbox.lovable.dev",
  "https://myenglishone.com",
  "https://www.myenglishone.com"
];

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const logStep = (step: string, details?: any) => {
  if (details && typeof details === 'object') {
    // Mask PII in logs
    const maskedDetails = { ...details };
    if (maskedDetails.email) maskedDetails.email = '***@***.***';
    if (maskedDetails.userId) maskedDetails.userId = maskedDetails.userId.slice(0, 8) + '****';
    console.log(`[CHECK-SUBSCRIPTION] ${step} - ${JSON.stringify(maskedDetails)}`);
  } else {
    console.log(`[CHECK-SUBSCRIPTION] ${step}`);
  }
};

serve(async (req) => {
  // Validate origin and set CORS headers
  const origin = req.headers.get("origin");
  const isAllowedOrigin = origin && allowedOrigins.includes(origin);
  const responseHeaders = {
    ...corsHeaders,
    "Access-Control-Allow-Origin": isAllowedOrigin ? origin : allowedOrigins[0],
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: responseHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      logStep("STRIPE_SECRET_KEY not found");
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    logStep("Stripe key verified");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      logStep("No authorization header provided");
      throw new Error("No authorization header provided");
    }
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    logStep("Authenticating user with token");
    
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) {
      logStep("Authentication error", { error: userError.message });
      throw new Error(`Authentication error: ${userError.message}`);
    }
    const user = userData.user;
    if (!user?.email) {
      logStep("User not authenticated or email not available");
      throw new Error("User not authenticated or email not available");
    }
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    // Use database lookup first (more secure)
    let customerId;
    const { data: subscriber } = await supabaseClient
      .from("subscribers")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .single();
    
    if (subscriber?.stripe_customer_id) {
      customerId = subscriber.stripe_customer_id;
    } else {
      // Fallback to email lookup
      const customers = await stripe.customers.list({ email: user.email, limit: 1 });
      
      if (customers.data.length === 0) {
        logStep("No customer found, updating unsubscribed state");
        await supabaseClient.from("subscribers").upsert({
          email: user.email,
          user_id: user.id,
          stripe_customer_id: null,
          subscribed: false,
          subscription_tier: null,
          subscription_end: null,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });
        return new Response(JSON.stringify({ subscribed: false }), {
          headers: { ...responseHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
      
      customerId = customers.data[0].id;
    }
    
    logStep("Found Stripe customer", { customerId });

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });
    const hasActiveSub = subscriptions.data.length > 0;
    let subscriptionTier = null;
    let subscriptionEnd = null;

    if (hasActiveSub) {
      const subscription = subscriptions.data[0];
      subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
      logStep("Active subscription found", { subscriptionId: subscription.id, endDate: subscriptionEnd });
      
      const priceId = subscription.items.data[0].price.id;
      const price = await stripe.prices.retrieve(priceId);
      const amount = price.unit_amount || 0;
      
      if (amount <= 1990) {
        subscriptionTier = "Premium";
      } else {
        subscriptionTier = "Pro";
      }
      logStep("Determined subscription tier", { priceId, amount, subscriptionTier });
    } else {
      logStep("No active subscription found");
    }

    await supabaseClient.from("subscribers").upsert({
      email: user.email,
      user_id: user.id,
      stripe_customer_id: customerId,
      subscribed: hasActiveSub,
      subscription_tier: subscriptionTier,
      subscription_end: subscriptionEnd,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });

    logStep("Updated database with subscription info", { subscribed: hasActiveSub, subscriptionTier });
    return new Response(JSON.stringify({
      subscribed: hasActiveSub,
      subscription_tier: subscriptionTier,
      subscription_end: subscriptionEnd
    }), {
      headers: { ...responseHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...responseHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});