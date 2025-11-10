// AI Marketing & Business Growth Strategist Tool
// Combines Gemini and DeepSeek AI for comprehensive marketing analysis and strategy generation

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS headers for browser compatibility
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS, PUT, DELETE, PATCH",
  "Access-Control-Max-Age": "86400",
  "Access-Control-Allow-Credentials": "false"
};

// Supabase client initialization
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// API Keys for dual AI analysis
const googleApiKey = Deno.env.get("GOOGLE_AI_API_KEY");
const deepseekApiKey = Deno.env.get("DEEPSEEK_API_KEY");

// Gemini AI API call for business analysis
async function callGeminiAI(prompt: string) {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${googleApiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024
          }
        })
      }
    );
    
    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error("Gemini AI Error:", error);
    return null;
  }
}

// DeepSeek AI API call for strategy enhancement
async function callDeepSeekAI(prompt: string) {
  try {
    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${deepseekApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: "You are a professional marketing strategist and business growth expert."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 1024,
        temperature: 0.7
      })
    });
    
    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("DeepSeek AI Error:", error);
    return null;
  }
}

// Main function handler
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    // Extract user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    const supabaseAuth = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_ANON_KEY")!
    );
    
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !user) {
      throw new Error("Invalid or expired token");
    }

    // Parse request body
    const requestData = await req.json();
    const {
      business_type,
      industry,
      target_audience,
      budget_range,
      goals,
      current_situation,
      additional_context
    } = requestData;

    // Validate required fields
    if (!business_type || !goals) {
      throw new Error("Business type and goals are required");
    }

    // Create comprehensive prompt for AI analysis
    const analysisPrompt = `
      Analyze the following business for marketing strategy development:
      
      Business Type: ${business_type}
      Industry: ${industry || "Not specified"}
      Target Audience: ${target_audience || "Not specified"}
      Budget Range: ${budget_range || "Not specified"}
      Goals: ${goals}
      Current Situation: ${current_situation || "Not specified"}
      Additional Context: ${additional_context || "None"}
      
      Please provide:
      1. Market analysis and opportunity assessment
      2. Target audience segmentation and personas
      3. Competitive landscape analysis
      4. Recommended marketing channels and tactics
      5. Content strategy recommendations
      6. Budget allocation suggestions
      7. Success metrics and KPIs
      8. Potential challenges and mitigation strategies
    `;

    // Call both AI services for comprehensive analysis
    const [geminiAnalysis, deepseekAnalysis] = await Promise.all([
      callGeminiAI(analysisPrompt),
      callDeepSeekAI(analysisPrompt)
    ]);

    // If both AI services fail, provide fallback response
    if (!geminiAnalysis && !deepseekAnalysis) {
      throw new Error("Both AI services are currently unavailable");
    }

    // Combine and synthesize AI responses
    const combinedAnalysis = {
      business_analysis: {
        type: business_type,
        industry: industry || "General",
        goals: goals,
        situation: current_situation || "Starting/Expanding"
      },
      market_insights: geminiAnalysis || "AI analysis temporarily unavailable",
      strategic_recommendations: deepseekAnalysis || "Strategy generation temporarily unavailable",
      dual_ai_analysis: {
        gemini_perspective: geminiAnalysis,
        deepseek_perspective: deepseekAnalysis,
        synthesis: geminiAnalysis && deepseekAnalysis 
          ? "Both AI analyses completed successfully"
          : "Single AI analysis completed - partial insights available"
      }
    };

    // Generate specific recommendations
    const recommendations = {
      marketing_channels: [
        "Social Media Marketing",
        "Content Marketing",
        "Email Marketing",
        "SEO/SEM",
        "Influencer Marketing",
        "Traditional Advertising"
      ],
      content_types: [
        "Blog posts and articles",
        "Social media posts",
        "Video content",
        "Infographics",
        "Email newsletters",
        "Podcast appearances"
      ],
      budget_allocation: budget_range ? `Recommended for ${budget_range} budget` : "Budget allocation to be determined",
      timeline: "3-6 month implementation roadmap",
      success_metrics: [
        "Website traffic increase",
        "Lead generation",
        "Social media engagement",
        "Conversion rates",
        "Brand awareness metrics",
        "ROI measurement"
      ]
    };

    // Estimate growth metrics
    const growthMetrics = {
      traffic_goals: "15-30% increase in 3 months",
      lead_generation: "10-25 new qualified leads per month",
      engagement_rates: "20-40% improvement in social media engagement",
      conversion_optimization: "5-15% improvement in conversion rates",
      brand_awareness: "25-50% increase in brand mentions",
      roi_target: "3:1 return on marketing investment within 6 months"
    };

    // Store the session in Supabase
    const { data: sessionData, error: dbError } = await supabase
      .from("marketing_sessions")
      .insert({
        user_id: user.id,
        business_type,
        industry,
        target_audience,
        budget_range,
        goals,
        current_situation,
        ai_analysis: combinedAnalysis,
        marketing_strategy: recommendations,
        campaign_recommendations: recommendations,
        growth_metrics: growthMetrics
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      throw new Error("Failed to save marketing session");
    }

    // Return comprehensive response
    const response = {
      success: true,
      session_id: sessionData.id,
      analysis: combinedAnalysis,
      strategy: recommendations,
      growth_projections: growthMetrics,
      created_at: sessionData.created_at,
      user_id: user.id
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Marketing strategist error:", error);
    
    const errorResponse = {
      success: false,
      error: {
        code: "MARKETING_STRATEGIST_ERROR",
        message: error.message || "An unexpected error occurred"
      }
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});