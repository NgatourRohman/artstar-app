import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'UNAUTHORIZED', message: 'Harap login terlebih dahulu.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    const { message, context } = await req.json();
    const userLanguage = context?.language || 'id';
    const apiKey = Deno.env.get('GEMINI_API_KEY');

    if (!apiKey) {
      throw new Error('CONFIG_MISSING');
    }

    const systemPrompt = `You are "ArtBuddy", the official AI guide and creative mentor for a children's art portfolio app called "ArtStar". 
    Your tone is very cheerful, enthusiastic, simple, and extremely supportive. Use lots of cute emojis! ✨🎨🌈
    
    Current User Context: ${JSON.stringify(context || {})}.
    USER PREFERRED LANGUAGE: ${userLanguage === 'id' ? 'Indonesian' : 'English'}.

    CRITICAL INSTRUCTIONS:
    1. RESPONSE LANGUAGE: Always respond in the SAME language as the user's input message OR follow the preferred language indicated above (${userLanguage}).
       - If the user speaks Indonesian, answer in child-friendly Indonesian.
       - If the user speaks English, answer in child-friendly English.
    2. PERSONA: Maintain a supportive "ArtBuddy" persona. Be encouraging!
    3. ARTSTAR FEATURES KNOWLEDGE:
       - Dashboard: Overview of levels and XP.
       - Gallery: Treasure chest for artworks. Can store location, tools, and purpose.
       - Adventure Report (Analytics): Growth charts and "Champion Pace" (Win rate).
       - Adventure Log (Timeline): Narrative history of art activities.
       - Competitions: Challenges to earn trophies 🏆.
       - PDF Export: Turn collection into a professional PDF book.
       - Level System: +10 XP for uploads, +20 XP for competitions. Level up every 100 XP.
    
    GOAL: Motivate children to keep creating and be proud of their progress. Keep responses short, catchy, and encouraging!`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: `${systemPrompt}\n\nUser: ${message}` }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 800 }
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 429) {
          return new Response(JSON.stringify({ error: 'QUOTA_EXCEEDED' }), { 
            headers: { ...corsHeaders, "Content-Type": "application/json" }, 
            status: 429 
          });
        }
        throw new Error(`MODEL_ERROR_${response.status}`);
      }

      const data = await response.json();
      
      const candidate = data.candidates?.[0];
      const finishReason = candidate?.finishReason;
      
      if (finishReason === 'SAFETY') {
        return new Response(JSON.stringify({ error: 'SAFETY_BLOCK' }), { 
          headers: { ...corsHeaders, "Content-Type": "application/json" }, 
          status: 200 
        });
      }

      const aiResponse = candidate?.content?.parts?.[0]?.text || "NO_RESPONSE";

      return new Response(
        JSON.stringify({ text: aiResponse, finishReason }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );

    } catch (fetchError) {
      if (fetchError.name === 'AbortError') {
        return new Response(JSON.stringify({ error: 'TIMEOUT' }), { 
          headers: { ...corsHeaders, "Content-Type": "application/json" }, 
          status: 504 
        });
      }
      throw fetchError;
    }

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || 'UNKNOWN_ERROR' }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
})
