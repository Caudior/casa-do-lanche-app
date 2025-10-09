import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Initialize Supabase client for the Edge Function
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    {
      global: {
        headers: { Authorization: req.headers.get('Authorization')! },
      },
    }
  );

  // Verify JWT token (manual verification since verify_jwt is false by default)
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const { clientName, itemName, itemPrice, quantity, total, orderId } = await req.json();

    // Get owner's WhatsApp number from secrets
    const ownerPhoneNumber = Deno.env.get('WHATSAPP_OWNER_PHONE');
    // Get WhatsApp API URL and Token from secrets (example for a generic API)
    const whatsappApiUrl = Deno.env.get('WHATSAPP_API_URL');
    const whatsappApiToken = Deno.env.get('WHATSAPP_API_TOKEN');

    if (!ownerPhoneNumber || !whatsappApiUrl || !whatsappApiToken) {
      console.error("Variáveis de ambiente do WhatsApp não configuradas.");
      return new Response(JSON.stringify({ error: 'WhatsApp API credentials not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const message = `Olá CLAUDIO RODRIGUES, o cliente ${clientName} confirmou ter enviado o pedido #${orderId} para você! Detalhes: ${quantity}x ${itemName} (R$ ${itemPrice} cada). Total do item: R$ ${total}.`;

    // --- Placeholder for actual WhatsApp API call ---
    // You would replace this with your actual WhatsApp API integration (e.g., Twilio, MessageBird, etc.)
    // This example assumes a simple POST request to a generic WhatsApp API.
    console.log(`Simulando envio de WhatsApp para ${ownerPhoneNumber}: ${message}`);
    const whatsappResponse = await fetch(whatsappApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${whatsappApiToken}`, // Or whatever authentication your API uses
      },
      body: JSON.stringify({
        to: ownerPhoneNumber,
        message: message,
        // Add other parameters required by your WhatsApp API
      }),
    });

    if (!whatsappResponse.ok) {
      const errorData = await whatsappResponse.json();
      console.error("Erro ao enviar mensagem de WhatsApp:", errorData);
      return new Response(JSON.stringify({ error: 'Failed to send WhatsApp message', details: errorData }), {
        status: whatsappResponse.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const responseData = await whatsappResponse.json();
    console.log("WhatsApp enviado com sucesso:", responseData);

    return new Response(JSON.stringify({ message: 'WhatsApp message sent successfully', data: responseData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error("Erro na função Edge send-whatsapp:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});