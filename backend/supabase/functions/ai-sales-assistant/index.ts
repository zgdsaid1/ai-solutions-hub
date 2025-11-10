// AI Sales Assistant Tool
// Provides sales conversation analysis, lead qualification, and proposal generation using dual AI analysis

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

// Sales stages definition
const SALES_STAGES = [
  "Prospecting",
  "Qualification", 
  "Needs Analysis",
  "Proposal",
  "Negotiation",
  "Closing",
  "Closed Won",
  "Closed Lost"
];

// Gemini AI API call for sales analysis and lead scoring
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
            temperature: 0.4,
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

// DeepSeek AI API call for sales strategy and optimization
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
            content: "You are a professional sales consultant and business development expert. Focus on lead qualification, sales strategy optimization, and revenue generation. Provide actionable sales insights and recommendations."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 1024,
        temperature: 0.4
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

// Lead qualification scoring
function calculateLeadScore(prospectData: any): number {
  let score = 0;
  
  // Budget qualification (0-25 points)
  if (prospectData.budget_range) {
    if (prospectData.budget_range.includes("High") || prospectData.budget_range.includes("50K+")) {
      score += 25;
    } else if (prospectData.budget_range.includes("Medium") || prospectData.budget_range.includes("10K-50K")) {
      score += 15;
    } else if (prospectData.budget_range.includes("Low") || prospectData.budget_range.includes("1K-10K")) {
      score += 10;
    }
  }
  
  // Authority (0-25 points)
  if (prospectData.role || prospectData.decision_maker) {
    if (prospectData.decision_maker === "Yes" || prospectData.role?.toLowerCase().includes("ceo") || 
        prospectData.role?.toLowerCase().includes("director") || prospectData.role?.toLowerCase().includes("manager")) {
      score += 25;
    } else if (prospectData.role?.toLowerCase().includes("head") || prospectData.role?.toLowerCase().includes("lead")) {
      score += 20;
    }
  }
  
  // Need (0-25 points)
  if (prospectData.pain_points) {
    const painIntensity = prospectData.pain_points.toLowerCase();
    if (painIntensity.includes("critical") || painIntensity.includes("urgent") || painIntensity.includes("severe")) {
      score += 25;
    } else if (painIntensity.includes("significant") || painIntensity.includes("important")) {
      score += 20;
    } else if (painIntensity.includes("moderate") || painIntensity.includes("some")) {
      score += 15;
    }
  }
  
  // Timeline (0-25 points)
  if (prospectData.timeline) {
    const timeline = prospectData.timeline.toLowerCase();
    if (timeline.includes("immediate") || timeline.includes("asap") || timeline.includes("this month")) {
      score += 25;
    } else if (timeline.includes("quarter") || timeline.includes("3 months")) {
      score += 20;
    } else if (timeline.includes("6 months") || timeline.includes("this year")) {
      score += 15;
    }
  }
  
  return Math.min(score, 100);
}

// Sales stage progression analysis
function analyzeSalesStage(progress: any, conversation: string) {
  const lowerConversation = conversation.toLowerCase();
  
  // Stage indicators
  const stageIndicators = {
    "Prospecting": ["hello", "hi", "introduction", "reach out", "new", "first time"],
    "Qualification": ["need", "requirement", "budget", "timeline", "decision", "authority"],
    "Needs Analysis": ["problem", "challenge", "current", "solution", "feature", "how"],
    "Proposal": ["quote", "price", "proposal", "offer", "package", "cost"],
    "Negotiation": ["discount", "negotiate", "better", "compare", "competing", "alternative"],
    "Closing": ["deal", "close", "agreement", "sign", "start", "begin"]
  };
  
  let currentStage = "Prospecting";
  let confidence = 0;
  
  // Analyze conversation for stage indicators
  Object.keys(stageIndicators).forEach(stage => {
    const indicators = stageIndicators[stage];
    const matches = indicators.filter(indicator => lowerConversation.includes(indicator)).length;
    if (matches > 0) {
      currentStage = stage;
      confidence = (matches / indicators.length) * 100;
    }
  });
  
  // Progression recommendations
  const stageProgression = {
    "Prospecting": "Focus on qualification - ask about budget, authority, need, and timeline",
    "Qualification": "Move to needs analysis - understand specific challenges and requirements",
    "Needs Analysis": "Prepare proposal - focus on value proposition and ROI",
    "Proposal": "Negotiate terms - address objections and finalize details",
    "Negotiation": "Close the deal - create urgency and commitment",
    "Closing": "Follow up - ensure implementation and satisfaction"
  };
  
  return {
    current_stage: currentStage,
    confidence_score: Math.round(confidence),
    next_steps: stageProgression[currentStage] || "Continue relationship building",
    progression_opportunities: ["Speed up sales cycle", "Improve conversion rate", "Reduce sales cost"]
  };
}

// Generate pricing recommendations
function generatePricingRecommendations(industry: string, dealSize: string, competition: string) {
  const basePricing = {
    "Technology": { low: 5000, medium: 25000, high: 100000 },
    "Healthcare": { low: 3000, medium: 15000, high: 75000 },
    "Finance": { low: 10000, medium: 50000, high: 200000 },
    "Manufacturing": { low: 2000, medium: 10000, high: 50000 },
    "Retail": { low: 1000, medium: 8000, high: 35000 }
  };
  
  const industryRates = basePricing[industry] || basePricing["Technology"];
  let recommendedPrice = industryRates.medium;
  
  // Adjust based on deal size
  if (dealSize === "Enterprise") recommendedPrice = industryRates.high;
  else if (dealSize === "SMB") recommendedPrice = industryRates.low;
  
  // Apply competitive adjustment
  let adjustmentFactor = 1.0;
  if (competition === "High") adjustmentFactor = 0.85;
  else if (competition === "Low") adjustmentFactor = 1.15;
  
  return {
    base_price: recommendedPrice,
    adjusted_price: Math.round(recommendedPrice * adjustmentFactor),
    price_range: {
      minimum: Math.round(recommendedPrice * 0.8),
      maximum: Math.round(recommendedPrice * 1.2)
    },
    discount_opportunities: [
      "Volume discount for multi-year contracts",
      "Early payment discount",
      "Referral program incentive",
      "Implementation services package"
    ],
    value_justification: [
      "ROI calculation and cost savings",
      "Competitive advantage analysis",
      "Risk mitigation benefits",
      "Operational efficiency gains"
    ]
  };
}

// Generate sales forecasting
function generateForecastingData(historicalData: any, pipelineData: any) {
  return {
    monthly_forecast: {
      this_month: pipelineData.expected_revenue || 50000,
      next_month: Math.round((pipelineData.expected_revenue || 50000) * 1.2),
      third_month: Math.round((pipelineData.expected_revenue || 50000) * 1.3)
    },
    conversion_rates: {
      lead_to_opportunity: "25-30%",
      opportunity_to_proposal: "40-50%", 
      proposal_to_close: "60-70%",
      overall_conversion: "6-8%"
    },
    pipeline_metrics: {
      total_opportunities: pipelineData.total_opportunities || 25,
      weighted_pipeline: pipelineData.weighted_value || 250000,
      average_deal_size: Math.round((pipelineData.weighted_value || 250000) / (pipelineData.total_opportunities || 25)),
      sales_cycle_length: "45-60 days"
    },
    performance_indicators: [
      "Lead quality score improvement",
      "Conversion rate optimization", 
      "Sales cycle acceleration",
      "Customer acquisition cost reduction"
    ]
  };
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
      prospect_type,
      sales_stage,
      prospect_data,
      conversation_transcript,
      historical_performance,
      deal_context,
      competitive_situation
    } = requestData;

    // Validate required fields
    if (!prospect_type || !prospect_data) {
      throw new Error("Prospect type and prospect data are required");
    }

    // Calculate lead score
    const leadScore = calculateLeadScore(prospect_data);

    // Analyze sales stage progression
    const stageAnalysis = analyzeSalesStage(
      sales_stage, 
      conversation_transcript || "Initial conversation"
    );

    // Generate pricing recommendations
    const pricingRecommendations = generatePricingRecommendations(
      prospect_data.industry || "Technology",
      prospect_data.company_size || "Medium",
      competitive_situation || "Medium"
    );

    // Create comprehensive sales analysis prompt
    const salesPrompt = `
      Sales Analysis Request:
      
      Prospect Type: ${prospect_type}
      Sales Stage: ${sales_stage || stageAnalysis.current_stage}
      Lead Score: ${leadScore}/100
      Prospect Data: ${JSON.stringify(prospect_data)}
      Conversation Transcript: ${conversation_transcript || "N/A"}
      Deal Context: ${deal_context || "Standard business deal"}
      Competitive Situation: ${competitive_situation || "Moderate competition"}
      
      Please provide:
      1. Lead qualification analysis and scoring rationale
      2. Sales strategy recommendations for this prospect
      3. Objection handling and value proposition refinement
      4. Next steps and action items for sales progression
      5. Competitive positioning and differentiation strategy
      6. ROI and business case development
      7. Sales timeline and milestone planning
      8. Risk assessment and mitigation strategies
    `;

    // Call both AI services for sales analysis
    const [geminiSales, deepseekSales] = await Promise.all([
      callGeminiAI(salesPrompt),
      callDeepSeekAI(salesPrompt)
    ]);

    // If both AI services fail, provide fallback response
    if (!geminiSales && !deepseekSales) {
      throw new Error("AI sales analysis services are currently unavailable");
    }

    // Generate comprehensive analysis
    const aiAnalysis = {
      lead_qualification: {
        score: leadScore,
        grade: leadScore >= 80 ? "A" : leadScore >= 60 ? "B" : leadScore >= 40 ? "C" : "D",
        reasoning: [
          `Budget qualification: ${prospect_data.budget_range || "Not specified"}`,
          `Decision authority: ${prospect_data.decision_maker || "Unknown"}`,
          `Need intensity: ${prospect_data.pain_points ? "High" : "To be determined"}`,
          `Timeline urgency: ${prospect_data.timeline || "To be determined"}`
        ]
      },
      sales_strategy: {
        gemini_recommendations: geminiSales || "Sales analysis temporarily unavailable",
        deepseek_strategy: deepseekSales || "Strategic recommendations temporarily unavailable",
        combined_approach: geminiSales && deepseekSales 
          ? "Comprehensive dual-AI sales strategy completed"
          : "Basic sales analysis completed"
      }
    };

    // Generate proposal data
    const proposalData = {
      proposal_structure: {
        executive_summary: "Overview of solution and benefits",
        problem_statement: "Current challenges and impact",
        proposed_solution: "Detailed solution description",
        implementation_plan: "Timeline and milestones",
        investment_required: "Pricing and payment terms",
        roi_analysis: "Expected return on investment",
        next_steps: "Implementation and engagement process"
      },
      value_proposition: [
        "Cost reduction through automation",
        "Increased efficiency and productivity", 
        "Improved customer satisfaction",
        "Competitive advantage in market",
        "Scalable solution for growth"
      ],
      proposal_templates: [
        "Standard business proposal",
        "Enterprise solution package",
        "Industry-specific offering",
        "Custom enterprise agreement"
      ]
    };

    // Generate conversation analysis
    const conversationAnalysis = {
      stage_assessment: stageAnalysis,
      engagement_level: conversation_transcript ? "High" : "Initial contact",
      key_topics_covered: [
        "Business requirements and needs",
        "Budget and investment considerations", 
        "Timeline and implementation planning",
        "Technical specifications and capabilities"
      ],
      next_conversation_goals: [
        "Deepen understanding of specific requirements",
        "Present tailored solution proposal",
        "Address any remaining concerns or objections",
        "Negotiate terms and finalize agreement"
      ]
    };

    // Generate CRM integration data
    const crmIntegration = {
      data_sync: {
        lead_information: "Automatic CRM update with prospect details",
        activity_tracking: "Log all interactions and follow-ups",
        stage_updates: "Update sales stage automatically",
        opportunity_scoring: "Real-time lead score updates"
      },
      automation_workflows: [
        "Lead scoring and routing automation",
        "Follow-up task creation and scheduling",
        "Proposal generation and sending",
        "Pipeline reporting and analytics"
      ],
      integrations: [
        "Salesforce CRM sync",
        "HubSpot marketing automation",
        "Pipedrive pipeline management",
        "Microsoft Dynamics integration"
      ]
    };

    // Generate forecasting data
    const forecastingData = generateForecastingData(
      historical_performance || {},
      {
        expected_revenue: (leadScore / 100) * 100000,
        total_opportunities: 25,
        weighted_value: (leadScore / 100) * 250000
      }
    );

    // Store the session in Supabase
    const { data: sessionData, error: dbError } = await supabase
      .from("sales_assistant_sessions")
      .insert({
        user_id: user.id,
        prospect_type,
        sales_stage: sales_stage || stageAnalysis.current_stage,
        ai_analysis: aiAnalysis,
        lead_qualification: aiAnalysis.lead_qualification,
        proposal_data: proposalData,
        pricing_recommendations: pricingRecommendations,
        conversation_analysis: conversationAnalysis,
        crm_integration: crmIntegration,
        forecasting_data: forecastingData
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      throw new Error("Failed to save sales assistant session");
    }

    // Return comprehensive response
    const response = {
      success: true,
      session_id: sessionData.id,
      lead_analysis: {
        score: leadScore,
        grade: aiAnalysis.lead_qualification.grade,
        qualification: aiAnalysis.lead_qualification
      },
      sales_strategy: aiAnalysis.sales_strategy,
      proposal: proposalData,
      pricing: pricingRecommendations,
      stage_analysis: stageAnalysis,
      forecasting: forecastingData,
      crm_integration: crmIntegration,
      created_at: sessionData.created_at,
      user_id: user.id
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Sales assistant error:", error);
    
    const errorResponse = {
      success: false,
      error: {
        code: "SALES_ASSISTANT_ERROR",
        message: error.message || "An unexpected error occurred"
      }
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});