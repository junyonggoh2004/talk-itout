import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { lastAssistantMessage, conversationContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Generating reply suggestions for:", lastAssistantMessage?.substring(0, 50));

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          {
            role: "system",
            content: `You are helping a student who is chatting with a school counsellor AI. Based on the counsellor's last message, generate exactly 3 short reply suggestions that the student might want to say next.

Rules:
- Each suggestion must be 2-5 words maximum
- Make them natural, conversational responses a student would say
- Include a mix of: continuing the conversation, asking for more help, or expressing feelings
- Examples: "Tell me more", "I feel scared", "What should I do?", "That helps, thanks", "I'm not sure"
- Return ONLY a JSON array of 3 strings, nothing else
- No punctuation except question marks where needed`,
          },
          {
            role: "user",
            content: `The counsellor just said: "${lastAssistantMessage}"

Recent conversation context: ${conversationContext || "Student just started chatting"}

Generate 3 short reply suggestions for the student.`,
          },
        ],
      }),
    });

    if (!response.ok) {
      console.error("AI gateway error:", response.status);
      return new Response(JSON.stringify({ suggestions: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "[]";
    
    console.log("Raw suggestions response:", content);

    // Parse the JSON array from the response
    let suggestions: string[] = [];
    try {
      // Try to extract JSON array from the response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        suggestions = JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.error("Failed to parse suggestions:", parseError);
      // Fallback suggestions
      suggestions = ["Tell me more", "I understand", "What else?"];
    }

    // Ensure we have exactly 3 suggestions
    suggestions = suggestions.slice(0, 3);
    while (suggestions.length < 3) {
      const fallbacks = ["Tell me more", "I see", "What should I do?"];
      suggestions.push(fallbacks[suggestions.length]);
    }

    console.log("Generated suggestions:", suggestions);

    return new Response(JSON.stringify({ suggestions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Suggestions error:", error);
    return new Response(JSON.stringify({ suggestions: ["Tell me more", "I understand", "What else?"] }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
