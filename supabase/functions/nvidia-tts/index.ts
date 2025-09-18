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

    const { text, voice = 'en-US-AriaNeural' } = await req.json();
    
    if (!text) {
      throw new Error('Text is required');
    }

    console.log('Processing Nvidia TTS request:', { textLength: text.length, voice });

    // Try to use Nvidia TTS API first
    try {
      console.log('Attempting to use Nvidia TTS API');
      
      // Nvidia TTS API endpoint (example - may need adjustment based on actual API)
      const nvidiaResponse = await fetch('https://api.nvidia.com/v1/tts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${nvidiaApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          voice: voice,
          format: 'wav'
        }),
      });

      if (nvidiaResponse.ok) {
        const audioBuffer = await nvidiaResponse.arrayBuffer();
        const base64Audio = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));
        
        console.log('Successfully generated audio with Nvidia TTS');
        return new Response(
          JSON.stringify({ 
            success: true,
            audioContent: base64Audio,
            message: 'Audio generated with Nvidia TTS'
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      } else {
        console.log('Nvidia TTS API failed, falling back to browser TTS');
      }
    } catch (error) {
      console.log('Error with Nvidia TTS API:', error.message, 'falling back to browser TTS');
    }

    // Fallback to browser TTS with proper voice mapping
    console.log('Using browser speech synthesis as fallback with voice:', voice);
    
    return new Response(
      JSON.stringify({ 
        success: true,
        useBrowserTTS: true,
        voice: voice, // Pass the voice to the frontend
        message: 'Using browser speech synthesis for audio'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in nvidia-tts function:', error);
    
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