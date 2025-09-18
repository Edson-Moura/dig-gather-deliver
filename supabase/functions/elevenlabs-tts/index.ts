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

    const tortoiseApiKey = Deno.env.get('TORTOISE_TTS_API_KEY');
    const tortoiseApiUrl = Deno.env.get('TORTOISE_TTS_API_URL');
    
    if (!tortoiseApiKey || !tortoiseApiUrl) {
      console.error('TORTOISE_TTS_API_KEY or TORTOISE_TTS_API_URL not found');
      throw new Error('Tortoise-TTS API configuration missing');
    }

    const { text, voice = 'random', model = 'tortoise-v2' } = await req.json();
    
    if (!text) {
      throw new Error('Text is required');
    }

    console.log('Processing Tortoise-TTS request:', { text: text.substring(0, 100) + '...', voice, model });

    // Available voices for Tortoise-TTS
    const availableVoices = [
      'random', 'angie', 'applejack', 'cond_latent_example', 'daniel', 'deniro',
      'emma', 'freeman', 'geralt', 'halle', 'jlaw', 'lj', 'mol', 'pat', 'pat2',
      'rainbow', 'snakes', 'tim_reynolds', 'tom', 'train_atkins', 'train_daws',
      'train_dotrice', 'train_dreams', 'train_empire', 'train_grace', 'train_kennard',
      'train_lescault', 'train_mouse', 'weaver', 'william'
    ];

    const selectedVoice = availableVoices.includes(voice) ? voice : 'random';

    // Make request to Tortoise-TTS API
    const response = await fetch(`${tortoiseApiUrl}/api/tts-generate`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/wav',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tortoiseApiKey}`,
      },
      body: JSON.stringify({
        text: text,
        voice: selectedVoice,
        preset: 'high_quality',
        candidates: 3,
        seed: Math.floor(Math.random() * 1000000),
        cvvp_amount: 0.2,
        temperature: 0.75,
        length_penalty: 1.0,
        repetition_penalty: 2.0,
        top_p: 0.85,
        max_mel_tokens: 500,
        cond_free: true,
        cond_free_k: 2,
        diffusion_temperature: 1.0
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Tortoise-TTS API error:', response.status, errorText);
      throw new Error(`Tortoise-TTS API error: ${response.status}`);
    }

    console.log('Tortoise-TTS response received successfully');
    
    // Convert audio buffer to base64
    const arrayBuffer = await response.arrayBuffer();
    const base64Audio = btoa(
      String.fromCharCode(...new Uint8Array(arrayBuffer))
    );

    return new Response(
      JSON.stringify({ 
        audioContent: base64Audio,
        success: true 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in elevenlabs-tts function:', error);
    
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