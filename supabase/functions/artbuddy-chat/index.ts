import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// Gunakan gemini-2.5-flash untuk performa terbaik di tahun 2026
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { message, context } = await req.json();
    const apiKey = Deno.env.get('GEMINI_API_KEY');

    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set');
    }

    // ArtBuddy Persona & System Prompt
    const systemPrompt = `You are "ArtBuddy", a cheerful, supportive, and creative art mentor for children in an app called "ArtStar". 
    Your tone is encouraging and simplified. 
    Main focus: Helping kids find drawing ideas and giving simple art tips.
    Context about the user: ${JSON.stringify(context || {})}.
    Use Indonesian as the primary language unless asked otherwise.
    Keep responses concise and friendly (2-3 sentences max). Use lots of emojis! ✨🎨`;

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: `${systemPrompt}\n\nUser: ${message}` }]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 200,
        }
      })
    });

    const data = await response.json();
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "Wah, ArtBuddy lagi istirahat sebentar. Coba lagi nanti ya! 🌈";

    return new Response(
      JSON.stringify({ text: aiResponse }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400 
      }
    );
  }
})
