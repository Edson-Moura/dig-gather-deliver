import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check for authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.log('Missing authorization header');
      throw new Error("Authorization required");
    }

    // Initialize Supabase client for user verification
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Verify user authentication
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData.user) {
      console.log('Invalid or expired token');
      throw new Error("Invalid authentication");
    }

    console.log('Request authorized for user:', userData.user.id);

    const nvidiaApiKey = Deno.env.get('NVIDIA_API_KEY');
    if (!nvidiaApiKey) {
      console.error('NVIDIA_API_KEY not found');
      throw new Error('Nvidia API key not configured');
    }

    const { message, conversationHistory = [] } = await req.json();
    
    if (!message) {
      throw new Error('Message is required');
    }

    console.log('Processing Nvidia chat request:', { messageLength: message.length, historyLength: conversationHistory.length });

    // System prompt for English learning conversation
    const systemPrompt = `You are an English conversation tutor for Portuguese speakers learning English. Your goal is to help them practice English conversation in a natural, encouraging way.

Guidelines:
- Always respond in English to help them practice
- Keep responses conversational and engaging
- If they make grammar mistakes, gently correct them in your response
- Ask follow-up questions to continue the conversation
- Use simple to intermediate English level
- Be patient and encouraging
- If they ask in Portuguese, respond in English but acknowledge you understand
- Suggest vocabulary or phrases when helpful
- Keep responses concise but engaging (2-3 sentences usually)

Remember: You're helping them gain confidence in English conversation!`;

    // Prepare messages for Nvidia API
    const messages = [
      {
        role: 'system',
        content: systemPrompt
      },
      ...(conversationHistory || []),
      {
        role: 'user',
        content: message
      }
    ];

    console.log('Sending request to Nvidia...');
    
    // Make request to Nvidia API
    const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${nvidiaApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'meta/llama-3.1-70b-instruct',
        messages: messages,
        temperature: 0.7,
        top_p: 0.95,
        max_tokens: 200,
        stream: false
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Nvidia API error:', response.status, errorText);
      throw new Error(`Nvidia API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Nvidia response received');
    
    const aiResponse = data.choices?.[0]?.message?.content;
    
    if (!aiResponse) {
      throw new Error('No response from Nvidia');
    }

    return new Response(
      JSON.stringify({ 
        response: aiResponse.trim(),
        success: true 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in nvidia-chat function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        success: false 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});