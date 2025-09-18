import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface UploadRequest {
  filename: string;
  contentBase64: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { filename, contentBase64 }: UploadRequest = await req.json();

    if (!filename || !contentBase64) {
      return new Response(
        JSON.stringify({ error: "Filename and content are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Convert base64 to bytes
    const bytes = Uint8Array.from(atob(contentBase64), c => c.charCodeAt(0));

    // Upload file to storage
    const { data, error } = await supabase.storage
      .from("file")
      .upload(filename, bytes, {
        contentType: "application/pdf",
        upsert: true, // Replace if exists
      });

    if (error) {
      console.error("Upload error:", error);
      throw error;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("file")
      .getPublicUrl(filename);

    console.log("Ebook uploaded successfully:", data);

    return new Response(
      JSON.stringify({ 
        success: true, 
        path: data.path,
        publicUrl: urlData.publicUrl
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in upload-ebook function:", error);
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