import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// Allowed origins for security
const allowedOrigins = [
  "https://yttjiuxjuanyzszlrdwj.supabase.co",
  "https://myenglishone.com",
  "https://www.myenglishone.com",
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:8080"
];

const corsHeaders = {
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  if (details && typeof details === 'object') {
    // Mask PII in logs
    const maskedDetails = { ...details };
    if (maskedDetails.email) maskedDetails.email = '***@***.***';
    if (maskedDetails.userId) maskedDetails.userId = maskedDetails.userId.slice(0, 8) + '****';
    console.log(`[CUSTOMER-PORTAL] ${step} - ${JSON.stringify(maskedDetails)}`);
  } else {
    console.log(`[CUSTOMER-PORTAL] ${step}`);
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

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id });

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
        throw new Error("No Stripe customer found for this user");
      }
      customerId = customers.data[0].id;
    }
    logStep("Found Stripe customer", { customerId });

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${Deno.env.get("APP_BASE_URL") || "https://yttjiuxjuanyzszlrdwj.supabase.co"}/`,
    });
    logStep("Customer portal session created", { sessionId: portalSession.id });

    return new Response(JSON.stringify({ url: portalSession.url }), {
      headers: { ...responseHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in customer-portal", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...responseHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});