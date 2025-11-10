// AI Customer Support Tool
// Provides customer inquiry analysis, response generation, and ticket management using dual AI analysis

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

// Supported languages for customer support
const SUPPORTED_LANGUAGES = [
  "en", "es", "fr", "de", "it", "pt", "ru", "zh", "ja", "ko", "ar", "hi"
];

// Gemini AI API call for customer inquiry analysis
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

// DeepSeek AI API call for customer service response optimization
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
            content: "You are a professional customer service representative specializing in customer inquiry resolution, response optimization, and customer satisfaction. Focus on empathetic, helpful, and professional customer communication."
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

// Language validation and detection
function validateLanguage(language: string): boolean {
  return SUPPORTED_LANGUAGES.includes(language.toLowerCase());
}

// Sentiment analysis based on customer inquiry
function analyzeSentiment(inquiry: string): string {
  const positiveKeywords = ["thank", "great", "excellent", "love", "perfect", "satisfied", "helpful"];
  const negativeKeywords = ["angry", "frustrated", "terrible", "hate", "worst", "awful", "disappointed"];
  const urgentKeywords = ["urgent", "emergency", "asap", "immediately", "critical", "broken"];
  
  const lowerInquiry = inquiry.toLowerCase();
  
  if (urgentKeywords.some(keyword => lowerInquiry.includes(keyword))) {
    return "URGENT";
  }
  
  if (negativeKeywords.some(keyword => lowerInquiry.includes(keyword))) {
    return "NEGATIVE";
  }
  
  if (positiveKeywords.some(keyword => lowerInquiry.includes(keyword))) {
    return "POSITIVE";
  }
  
  return "NEUTRAL";
}

// Inquiry categorization and priority assessment
function categorizeInquiry(inquiry: string, sentiment: string) {
  const lowerInquiry = inquiry.toLowerCase();
  
  let category = "General";
  let priority = "Normal";
  let escalation = false;
  
  // Category detection
  if (lowerInquiry.includes("billing") || lowerInquiry.includes("payment") || lowerInquiry.includes("invoice")) {
    category = "Billing";
  } else if (lowerInquiry.includes("technical") || lowerInquiry.includes("error") || lowerInquiry.includes("bug")) {
    category = "Technical";
  } else if (lowerInquiry.includes("account") || lowerInquiry.includes("login") || lowerInquiry.includes("password")) {
    category = "Account Management";
  } else if (lowerInquiry.includes("refund") || lowerInquiry.includes("return") || lowerInquiry.includes("cancel")) {
    category = "Refund/Returns";
  } else if (lowerInquiry.includes("feature") || lowerInquiry.includes("request") || lowerInquiry.includes("suggestion")) {
    category = "Feature Request";
  }
  
  // Priority determination
  if (sentiment === "URGENT" || lowerInquiry.includes("critical") || lowerInquiry.includes("emergency")) {
    priority = "High";
    escalation = true;
  } else if (sentiment === "NEGATIVE" || category === "Billing") {
    priority = "Medium";
  }
  
  return { category, priority, escalation };
}

// Knowledge base response generation
function generateKnowledgeBaseResponse(category: string, inquiry: string) {
  const knowledgeBase = {
    "General": {
      common_responses: [
        "Thank you for contacting us. We're here to help with any questions you may have.",
        "We appreciate you reaching out. Let me assist you with your inquiry.",
        "Thank you for your message. I'll do my best to resolve this for you today."
      ],
      next_steps: "Gather specific details about the customer's issue"
    },
    "Billing": {
      common_responses: [
        "I understand you have a billing concern. Let me review your account information.",
        "Thank you for your billing inquiry. I'll check the details and provide assistance.",
        "I see there's a billing question. Let me help you resolve this matter."
      ],
      next_steps: "Review billing records and provide clear explanation"
    },
    "Technical": {
      common_responses: [
        "I understand you're experiencing a technical issue. Let me help troubleshoot this.",
        "Thank you for reporting this technical problem. I'll work with you to resolve it.",
        "I see there's a technical concern. Let's troubleshoot this step by step."
      ],
      next_steps: "Provide technical support and escalate if needed"
    },
    "Account Management": {
      common_responses: [
        "I can help you with your account-related question. Let me verify your information.",
        "Thank you for contacting us about your account. I'll assist you with this matter.",
        "I'll help you with your account inquiry. Please provide the necessary details."
      ],
      next_steps: "Verify account details and provide appropriate assistance"
    }
  };
  
  return knowledgeBase[category] || knowledgeBase["General"];
}

// Ticket number generation
function generateTicketNumber(): string {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `TKT-${timestamp}-${random}`;
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
      inquiry_text,
      inquiry_type,
      language = "en",
      customer_context,
      ticket_number,
      response_tone,
      escalation_required
    } = requestData;

    // Validate required fields
    if (!inquiry_text || !inquiry_type) {
      throw new Error("Inquiry text and type are required");
    }

    // Validate language
    if (!validateLanguage(language)) {
      throw new Error(`Unsupported language: ${language}. Supported languages: ${SUPPORTED_LANGUAGES.join(', ')}`);
    }

    // Analyze sentiment and categorize inquiry
    const sentiment = analyzeSentiment(inquiry_text);
    const categorization = categorizeInquiry(inquiry_text, sentiment);

    // Generate ticket number if not provided
    const ticketId = ticket_number || generateTicketNumber();

    // Create comprehensive customer support prompt
    const supportPrompt = `
      Customer Support Analysis Request:
      
      Inquiry Type: ${inquiry_type}
      Customer Inquiry: ${inquiry_text}
      Language: ${language}
      Sentiment: ${sentiment}
      Category: ${categorization.category}
      Priority: ${categorization.priority}
      Customer Context: ${customer_context || "None"}
      Response Tone: ${response_tone || "Professional and helpful"}
      
      Please provide:
      1. Customer inquiry analysis and understanding
      2. Recommended response strategy and approach
      3. Empathetic and professional customer service response
      4. Next steps and action items for resolution
      5. Knowledge base articles or resources to reference
      6. Escalation recommendations if required
      7. Customer satisfaction optimization tips
      8. Multi-language considerations if applicable
    `;

    // Call both AI services for customer support analysis
    const [geminiSupport, deepseekSupport] = await Promise.all([
      callGeminiAI(supportPrompt),
      callDeepSeekAI(supportPrompt)
    ]);

    // If both AI services fail, provide fallback response
    if (!geminiSupport && !deepseekSupport) {
      throw new Error("AI customer support services are currently unavailable");
    }

    // Generate knowledge base response
    const kbResponse = generateKnowledgeBaseResponse(categorization.category, inquiry_text);

    // Generate ticket data
    const ticketData = {
      ticket_id: ticketId,
      status: "Open",
      category: categorization.category,
      priority: categorization.priority,
      sentiment: sentiment,
      created_at: new Date().toISOString(),
      estimated_resolution: categorization.priority === "High" ? "2-4 hours" : "24-48 hours",
      assigned_to: "AI Customer Support System"
    };

    // Generate comprehensive response
    const responseGeneration = {
      immediate_response: kbResponse.common_responses[0],
      detailed_response: deepseekSupport || geminiSupport || "Thank you for contacting us. We're reviewing your inquiry and will provide a detailed response shortly.",
      follow_up_actions: kbResponse.next_steps,
      escalation_status: categorization.escalation || escalation_required || false,
      language_support: language !== "en" ? "Multi-language support available" : "English primary support"
    };

    // Generate escalation rules
    const escalationRules = {
      trigger_conditions: [
        "High priority issues",
        "Repeated customer contact",
        "Technical issues beyond basic support",
        "Billing disputes over $500",
        "Customer satisfaction scores below 3/5"
      ],
      escalation_levels: [
        "Level 1: AI Support Assistant (Current)",
        "Level 2: Human Support Representative",
        "Level 3: Technical Specialist",
        "Level 4: Management Escalation"
      ],
      criteria: {
        technical_escalation: "Complex technical issues requiring specialist knowledge",
        billing_escalation: "Billing disputes and payment-related problems",
        service_escalation: "Customer satisfaction concerns and complaints"
      }
    };

    // Generate knowledge base integration
    const knowledgeBase = {
      relevant_articles: [
        "General Customer Support Guidelines",
        `${categorization.category} Support Procedures`,
        "Customer Communication Best Practices",
        "Escalation and Resolution Protocols"
      ],
      self_service_options: [
        "Knowledge base search",
        "Video tutorials",
        "FAQ section",
        "Community forums"
      ],
      contact_information: {
        primary_support: "support@aisolutionshub.co",
        phone: "+1-800-SUPPORT",
        live_chat: "Available 9 AM - 6 PM EST"
      }
    };

    // Generate sentiment analysis details
    const sentimentAnalysis = {
      overall_sentiment: sentiment,
      emotion_indicators: {
        urgency: sentiment === "URGENT" ? "High" : "Normal",
        satisfaction: sentiment === "POSITIVE" ? "High" : sentiment === "NEGATIVE" ? "Low" : "Neutral",
        engagement: "Active customer contact"
      },
      communication_recommendations: {
        tone: response_tone || "Professional and empathetic",
        response_speed: categorization.priority === "High" ? "Immediate" : "Within 2 hours",
        follow_up: "Automatic follow-up in 24 hours if unresolved"
      }
    };

    // Store the session in Supabase
    const { data: sessionData, error: dbError } = await supabase
      .from("customer_support_sessions")
      .insert({
        user_id: user.id,
        inquiry_type,
        language,
        ai_analysis: {
          gemini_analysis: geminiSupport,
          deepseek_analysis: deepseekSupport,
          combined_analysis: geminiSupport && deepseekSupport 
            ? "Comprehensive dual-AI customer support analysis completed"
            : "Basic customer support analysis completed"
        },
        response_generation: responseGeneration,
        ticket_data: ticketData,
        escalation_rules: escalationRules,
        knowledge_base: knowledgeBase,
        sentiment_analysis: sentimentAnalysis
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      throw new Error("Failed to save customer support session");
    }

    // Return comprehensive response
    const response = {
      success: true,
      session_id: sessionData.id,
      ticket_id: ticketId,
      analysis: {
        sentiment: sentimentAnalysis,
        categorization: categorization,
        knowledge_base: knowledgeBase
      },
      response: responseGeneration,
      ticket: ticketData,
      escalation: escalationRules,
      created_at: sessionData.created_at,
      user_id: user.id
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Customer support error:", error);
    
    const errorResponse = {
      success: false,
      error: {
        code: "CUSTOMER_SUPPORT_ERROR",
        message: error.message || "An unexpected error occurred"
      }
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});