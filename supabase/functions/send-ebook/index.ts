import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EbookRequest {
  email: string;
  name?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting send-ebook function...");
    
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { email, name }: EbookRequest = await req.json();
    console.log("Processing request for email:", email);

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email é obrigatório" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const displayName = name ? name : "Futuro aluno";

    // Try to get the ebook from storage
    let ebookContent = "";
    let chosenFilename = "Ebook-10-erros-comuns.pdf";
    
    try {
      console.log("Attempting to download ebook from 'file' bucket...");

      const bucket = supabase.storage.from("file");
      
      // First, list all files to see what's available
      const { data: list, error: listError } = await bucket.list("", { limit: 100 });
      console.log("Storage list result:", JSON.stringify({ data: list, error: listError }));
      
      if (listError) {
        console.error("Storage list error:", listError);
        throw new Error(`Erro ao listar arquivos: ${listError.message}`);
      }
      
      if (!list || list.length === 0) {
        console.error("No files found in storage bucket");
        throw new Error("Nenhum arquivo encontrado no bucket");
      }
      
      // Find the first PDF file
      const pdfFile = list.find((file: any) => file.name?.toLowerCase().endsWith('.pdf'));
      
      if (!pdfFile) {
        console.error("No PDF file found in storage");
        throw new Error("Nenhum arquivo PDF encontrado no storage");
      }
      
      console.log("Found PDF file:", pdfFile.name);
      chosenFilename = pdfFile.name;
      
      // Download the PDF file
      const { data, error } = await bucket.download(pdfFile.name);
      
      if (error) {
        console.error("Download error:", error);
        throw new Error(`Erro ao baixar ebook: ${error.message}`);
      }
      
      if (!data) {
        console.error("No data returned from download");
        throw new Error("Dados do ebook não encontrados");
      }
      
      // Convert to base64 safely for large files
      console.log("Converting PDF to base64...");
      const arrayBuffer = await data.arrayBuffer();
      
      // Check file size (limit to 10MB for email attachments)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (arrayBuffer.byteLength > maxSize) {
        console.error("File too large for email attachment:", arrayBuffer.byteLength, "bytes");
        throw new Error(`Arquivo muito grande para anexo de email. Tamanho: ${Math.round(arrayBuffer.byteLength / 1024 / 1024)}MB. Máximo permitido: 10MB`);
      }
      
      // Convert to base64 correctly using built-in encoder
      console.log("File size:", arrayBuffer.byteLength, "bytes");
      const bytes = new Uint8Array(arrayBuffer);
      
      // Use a more reliable method for base64 encoding
      let binary = '';
      const len = bytes.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      ebookContent = btoa(binary);
      console.log("Successfully converted ebook to base64, size:", ebookContent.length);
      
    } catch (storageError: any) {
      console.error("Storage error details:", storageError);
      return new Response(
        JSON.stringify({ 
          error: "Erro ao processar ebook",
          message: storageError.message || "Erro desconhecido no storage"
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Sending email to:", email, "with ebook:", chosenFilename);
    
    if (!ebookContent) {
      console.error("No ebook content available for email");
      return new Response(
        JSON.stringify({ error: "Conteúdo do ebook não disponível" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }
    
    const emailResponse = await resend.emails.send({
      from: "MyEnglishOne <noreply@myenglishone.com>",
      to: [email],
      subject: "🎉 Seu Ebook Gratuito: 10 Erros Comuns de Aprendizado de Inglês",
      html: `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Seu Ebook Gratuito</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; font-size: 28px; margin-bottom: 10px;">MyEnglishOne</h1>
            <div style="width: 100%; height: 3px; background: linear-gradient(90deg, #2563eb, #3b82f6); margin: 20px 0;"></div>
          </div>

          <div style="background-color: #f8fafc; padding: 30px; border-radius: 10px; margin-bottom: 30px;">
            <h2 style="color: #1e293b; margin-bottom: 20px;">Olá, ${displayName}! 👋</h2>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              Parabéns por dar o primeiro passo rumo à fluência em inglês! 🎉
            </p>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              Seu ebook <strong>"10 Erros Comuns de Aprendizado de Inglês e Como Evitá-los"</strong> está anexado neste email e pronto para download.
            </p>
            
            <div style="background-color: #e0f2fe; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0;">
              <h3 style="color: #2563eb; margin-bottom: 10px;">📚 O que você vai descobrir:</h3>
              <ul style="margin: 0; padding-left: 20px;">
                <li>Método de Imersão Progressiva para acelerar seu aprendizado</li>
                <li>Técnicas de pronúncia para eliminar o sotaque brasileiro</li>
                <li>Estratégias para ganhar confiança na conversação</li>
                <li>Plano de estudos de 30 dias para resultados rápidos</li>
                <li>Lista de recursos gratuitos para praticar dariamente</li>
              </ul>
            </div>
          </div>

          <div style="background-color: #fef3c7; border: 2px solid #f59e0b; border-radius: 10px; padding: 20px; margin-bottom: 30px;">
            <h3 style="color: #92400e; margin-bottom: 15px;">🚀 Quer acelerar ainda mais seu aprendizado?</h3>
            <p style="margin-bottom: 15px;">
              Que tal experimentar nossa plataforma completa com exercícios interativos, reconhecimento de voz e acompanhamento personalizado?
            </p>
            <div style="text-align: center;">
              <a href="https://myenglishone.com/demo" 
                 style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                Experimentar Grátis por 7 Dias
              </a>
            </div>
          </div>

          <div style="text-align: center; margin-top: 40px; padding-top: 30px; border-top: 1px solid #e5e7eb;">
            <p style="font-size: 14px; color: #6b7280; margin-bottom: 10px;">
              Dúvidas? Responda este email que nossa equipe te ajuda! 😊
            </p>
            <p style="font-size: 14px; color: #6b7280;">
              MyEnglishOne - Transformando brasileiros em falantes fluentes de inglês
            </p>
            
            <div style="margin-top: 20px;">
              <a href="https://myenglishone.com" style="color: #2563eb; text-decoration: none; margin: 0 10px;">Website</a>
              <a href="mailto:contato@myenglishone.com" style="color: #2563eb; text-decoration: none; margin: 0 10px;">Contato</a>
            </div>
          </div>

          <div style="font-size: 12px; color: #9ca3af; text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p>Você está recebendo este email porque se cadastrou para baixar nosso ebook gratuito.</p>
            <p>Se não deseja mais receber nossos emails, <a href="https://yttjiuxjuanyzszlrdwj.supabase.co/functions/v1/unsubscribe-ebook?email=${encodeURIComponent(email)}" style="color: #6b7280;">clique aqui para descadastrar</a>.</p>
          </div>
        </body>
        </html>
      `,
      attachments: [
        {
          filename: chosenFilename,
          content: ebookContent,
          type: "application/pdf",
        },
      ],
    });

    if (emailResponse.error) {
      console.error('Resend error details:', JSON.stringify(emailResponse.error));
      return new Response(
        JSON.stringify({ 
          error: "Erro no envio do email", 
          message: emailResponse.error.message || "Erro desconhecido no Resend"
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Ebook sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, message: "Ebook enviado com sucesso!" }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-ebook function:", error);
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