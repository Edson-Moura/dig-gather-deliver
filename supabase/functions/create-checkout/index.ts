import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// Allowed origins for security
const allowedOrigins = [
  "https://yttjiuxjuanyzszlrdwj.supabase.co",
  "https://lovable.app",
  "https://id-preview--cf054631-3081-49ef-9a3b-2d1539d1d090.lovable.app",
  "https://73d0f75a-2cf9-446f-9299-809446722b3d.sandbox.lovable.dev",
  "https://96e5880b-26d0-4ba0-890a-68b2dd50abe5.sandbox.lovable.dev",
  "https://myenglishone.com",
  "https://www.myenglishone.com",
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:8080"
];

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    // Check for authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.log('Missing authorization header');
      throw new Error("Authorization required");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) {
      console.log('User not authenticated or email not available');
      throw new Error("User not authenticated or email not available");
    }

    const { plan } = await req.json();
    console.log(`Creating checkout for plan: ${plan} (user: ${user.id})`);

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { apiVersion: "2023-10-16" });
    
    if (!Deno.env.get("STRIPE_SECRET_KEY")) {
      console.log('STRIPE_SECRET_KEY not found');
      throw new Error("Stripe configuration not found");
    }
    
    // Check if customer exists in database first (more secure)
    let customerId;
    const { data: subscriber } = await supabaseClient
      .from("subscribers")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .single();
    
    if (subscriber?.stripe_customer_id) {
      customerId = subscriber.stripe_customer_id;
    } else {
      // Fallback to email lookup if no database record
      const customers = await stripe.customers.list({ email: user.email, limit: 1 });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
      }
    }

    // Define prices based on plan
    const priceData = {
      premium: {
        unit_amount: 1990, // R$ 19,90 in cents
        product_data: { name: "Premium Subscription" },
        recurring: { interval: "month" },
      },
      pro: {
        unit_amount: 3590, // R$ 35,90 in cents
        product_data: { name: "Pro Subscription" },
        recurring: { interval: "month" },
      },
      anual: {
        unit_amount: 21540, // R$ 215,40 in cents
        product_data: { name: "Annual Pro Subscription" },
        recurring: { interval: "year" },
      }
    };

    const selectedPrice = priceData[plan as keyof typeof priceData];
    if (!selectedPrice) {
      throw new Error("Invalid plan selected");
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: "brl",
            product_data: selectedPrice.product_data,
            unit_amount: selectedPrice.unit_amount,
            recurring: selectedPrice.recurring,
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${req.headers.get("origin") || "https://yttjiuxjuanyzszlrdwj.supabase.co"}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin") || "https://yttjiuxjuanyzszlrdwj.supabase.co"}/pricing?canceled=true`,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error creating checkout:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});