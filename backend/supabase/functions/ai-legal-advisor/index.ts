// AI Legal Advisor Tool
// Provides legal consultation, document analysis, and compliance guidance using dual AI analysis

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

// Legal disclaimers for liability protection
const LEGAL_DISCLAIMER = `
IMPORTANT LEGAL DISCLAIMER: This AI Legal Advisor provides preliminary legal guidance only and does not constitute legal advice. 
This tool is designed to provide general information and assist with initial legal analysis. It does not replace professional legal counsel. 
For complex legal matters, consult with a qualified attorney in your jurisdiction. The information provided may not reflect current law changes or jurisdiction-specific requirements.
`;

// Gemini AI API call for legal document analysis
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
            temperature: 0.3,
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

// DeepSeek AI API call for legal strategy and compliance
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
            content: `You are a qualified legal advisor specializing in business law, contracts, compliance, and regulatory guidance. Provide professional legal insights while maintaining appropriate disclaimers. ${LEGAL_DISCLAIMER}`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 1024,
        temperature: 0.3
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

// Legal jurisdiction validation
function validateJurisdiction(jurisdiction: string): boolean {
  const validJurisdictions = [
    "US-Federal", "US-California", "US-New York", "US-Texas", "US-Florida",
    "UK", "EU", "Canada", "Australia", "India", "Singapore", "Dubai-UAE",
    "Other", "International"
  ];
  return validJurisdictions.includes(jurisdiction);
}

// Risk level assessment based on case type and urgency
function assessRiskLevel(caseType: string, urgencyLevel: string): string {
  const highRiskTypes = ["Litigation", "Criminal", "Regulatory Investigation", "Intellectual Property Dispute"];
  const mediumRiskTypes = ["Contract", "Employment", "Tax", "Data Privacy"];
  
  if (highRiskTypes.some(type => caseType.includes(type))) return "HIGH";
  if (mediumRiskTypes.some(type => caseType.includes(type))) return "MEDIUM";
  if (urgencyLevel === "URGENT") return "MEDIUM";
  return "LOW";
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
      case_type,
      jurisdiction,
      urgency_level = "Standard",
      legal_query,
      additional_context,
      document_text // For document analysis
    } = requestData;

    // Validate required fields
    if (!case_type || !legal_query) {
      throw new Error("Case type and legal query are required");
    }

    // Validate jurisdiction if provided
    if (jurisdiction && !validateJurisdiction(jurisdiction)) {
      throw new Error("Invalid or unsupported jurisdiction");
    }

    // Assess risk level
    const riskLevel = assessRiskLevel(case_type, urgency_level);

    // Create comprehensive legal analysis prompt
    const analysisPrompt = `
      Legal Case Analysis Request:
      
      Case Type: ${case_type}
      Jurisdiction: ${jurisdiction || "Not specified"}
      Urgency Level: ${urgency_level}
      Legal Query: ${legal_query}
      Additional Context: ${additional_context || "None"}
      ${document_text ? `Document Content: ${document_text.substring(0, 2000)}...` : ""}
      
      Please provide:
      1. Legal issue identification and analysis
      2. Applicable laws and regulations
      3. Potential legal risks and liabilities
      4. Recommended legal actions and next steps
      5. Compliance requirements and best practices
      6. Document review and clause analysis (if applicable)
      7. Risk mitigation strategies
      8. Professional legal counsel recommendation
    `;

    // Call both AI services for comprehensive legal analysis
    const [geminiAnalysis, deepseekAnalysis] = await Promise.all([
      callGeminiAI(analysisPrompt),
      callDeepSeekAI(analysisPrompt)
    ]);

    // If both AI services fail, provide fallback response
    if (!geminiAnalysis && !deepseekAnalysis) {
      throw new Error("AI legal analysis services are currently unavailable");
    }

    // Combine AI analyses
    const combinedAnalysis = {
      disclaimer: LEGAL_DISCLAIMER,
      case_details: {
        type: case_type,
        jurisdiction: jurisdiction || "General",
        urgency: urgency_level,
        risk_level: riskLevel
      },
      legal_analysis: {
        gemini_analysis: geminiAnalysis || "Legal analysis temporarily unavailable",
        deepseek_analysis: deepseekAnalysis || "Legal strategy temporarily unavailable",
        combined_insight: geminiAnalysis && deepseekAnalysis 
          ? "Comprehensive dual-AI legal analysis completed"
          : "Basic legal analysis completed - seek additional legal counsel for complete guidance"
      }
    };

    // Generate risk assessment
    const riskAssessment = {
      risk_level: riskLevel,
      risk_factors: [
        "Complexity of legal issues",
        "Jurisdictional compliance requirements", 
        "Potential financial impact",
        "Time sensitivity of the matter",
        "Documentation and evidence quality"
      ],
      mitigation_strategies: [
        "Seek qualified legal counsel consultation",
        "Document all relevant communications and transactions",
        "Implement compliance monitoring systems",
        "Establish legal risk management protocols",
        "Consider legal insurance coverage"
      ],
      recommended_actions: riskLevel === "HIGH" 
        ? ["Immediate legal counsel consultation required", "Suspend related business activities pending legal review"]
        : riskLevel === "MEDIUM"
        ? ["Schedule legal consultation within 1-2 weeks", "Document current compliance status"]
        : ["Review legal considerations quarterly", "Maintain standard compliance protocols"]
    };

    // Compliance guidance based on jurisdiction
    const complianceGuidance = {
      applicable_laws: jurisdiction ? `${jurisdiction} regulatory framework` : "General business law compliance",
      key_requirements: [
        "Business registration and licensing compliance",
        "Data protection and privacy regulations",
        "Employment law compliance",
        "Tax and financial reporting requirements",
        "Industry-specific regulations"
      ],
      ongoing_compliance: [
        "Regular legal review and updates",
        "Employee training on compliance matters",
        "Documentation and record-keeping systems",
        "Audit and monitoring procedures"
      ]
    };

    // Generate legal recommendations
    const legalRecommendations = {
      immediate_actions: [
        "Consult with qualified legal counsel",
        "Document all relevant facts and circumstances",
        "Preserve relevant communications and evidence",
        "Assess potential impact on business operations"
      ],
      strategic_considerations: [
        "Long-term legal risk management",
        "Business structure optimization",
        "Insurance and liability protection",
        "Compliance monitoring and maintenance"
      ],
      professional_referrals: [
        "Qualified attorney in relevant practice area",
        "Legal compliance consultant",
        "Regulatory compliance specialist",
        "Business law specialist"
      ]
    };

    // Store the session in Supabase with encrypted legal data
    const { data: sessionData, error: dbError } = await supabase
      .from("legal_sessions")
      .insert({
        user_id: user.id,
        case_type,
        jurisdiction,
        urgency_level,
        legal_query,
        ai_analysis: combinedAnalysis,
        risk_assessment: riskAssessment,
        legal_recommendations: legalRecommendations,
        compliance_guidance: complianceGuidance,
        document_analysis: document_text ? { provided: true, content_length: document_text.length } : null,
        legal_precedents: combinedAnalysis.legal_analysis
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      throw new Error("Failed to save legal session");
    }

    // Return comprehensive response
    const response = {
      success: true,
      session_id: sessionData.id,
      disclaimer: LEGAL_DISCLAIMER,
      analysis: combinedAnalysis,
      risk_assessment: riskAssessment,
      recommendations: legalRecommendations,
      compliance_guidance: complianceGuidance,
      created_at: sessionData.created_at,
      expires_at: sessionData.expires_at,
      user_id: user.id
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Legal advisor error:", error);
    
    const errorResponse = {
      success: false,
      error: {
        code: "LEGAL_ADVISOR_ERROR",
        message: error.message || "An unexpected error occurred",
        disclaimer: LEGAL_DISCLAIMER
      }
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});