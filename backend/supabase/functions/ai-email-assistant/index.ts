// AI Email Assistant Tool
// Provides email composition, template generation, and personalization using dual AI analysis

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

// Sandgrig API integration for email sending
const sandrigApiKey = Deno.env.get("SANDRIG_API_KEY");

// Gemini AI API call for email content generation
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
            temperature: 0.6,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024
          }
        })
      }
    );
    
    if (!response.ok) {
      throw new Error(`Gemini AI error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error("Gemini AI Error:", error);
    return null;
  }
}

// DeepSeek AI API call for email optimization and tone
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
            content: "You are a professional email marketing expert and communication specialist. Focus on creating compelling, personalized, and professional email content that drives engagement and conversions."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 1024,
        temperature: 0.6
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

// Email template generation based on type
function generateEmailTemplates(emailType: string, recipientType: string) {
  const templates = {
    "welcome_series": {
      subject: "Welcome to {{company_name}} - Your Journey Begins!",
      content: "Hello {{recipient_name}},\n\nWelcome to {{company_name}}! We're thrilled to have you join our community. Here's what you can expect:\n\n{{welcome_content}}\n\nBest regards,\n{{sender_name}}"
    },
    "newsletter": {
      subject: "{{newsletter_title}} - {{date}}",
      content: "Hello {{recipient_name}},\n\nWe hope you're having a great week! Here are our latest updates:\n\n{{newsletter_content}}\n\n{{call_to_action}}\n\nBest regards,\n{{sender_name}}"
    },
    "promotional": {
      subject: "Limited Time: {{promotion_title}} - Save {{discount_percentage}}%",
      content: "Hello {{recipient_name}},\n\n{{personalized_opening}}\n\n{{promotion_details}}\n\n{{urgency_message}}\n\n{{call_to_action}}\n\nBest regards,\n{{sender_name}}"
    },
    "follow_up": {
      subject: "Following up on {{original_topic}}",
      content: "Hello {{recipient_name}},\n\nI hope this email finds you well. I wanted to follow up on our previous conversation about {{original_topic}}.\n\n{{follow_up_content}}\n\n{{next_steps}}\n\nBest regards,\n{{sender_name}}"
    },
    "customer_service": {
      subject: "Response to your inquiry about {{inquiry_subject}}",
      content: "Hello {{recipient_name}},\n\nThank you for contacting us about {{inquiry_subject}}.\n\n{{response_content}}\n\nIf you have any additional questions, please don't hesitate to reach out.\n\nBest regards,\n{{sender_name}}"
    }
  };

  return templates[emailType] || templates["newsletter"];
}

// Personalization data processing
function processPersonalizationData(data: any) {
  return {
    recipient_variables: {
      name: data.recipient_name || "{{recipient_name}}",
      company: data.recipient_company || "{{recipient_company}}",
      location: data.recipient_location || "{{recipient_location}}",
      industry: data.recipient_industry || "{{recipient_industry}}"
    },
    dynamic_content: {
      personalized_opening: data.personalized_opening || "We hope this email finds you well",
      relevance_marker: data.relevance_marker || "Based on your interests",
      social_proof: data.social_proof || "Join thousands of satisfied customers"
    },
    smart_segments: {
      customer_status: data.customer_status || "existing",
      engagement_level: data.engagement_level || "medium",
      purchase_history: data.purchase_history || "none"
    }
  };
}

// Sandgrig email sending function
async function sendEmailViaSandrig(emailData: any) {
  try {
    const response = await fetch("https://api.sandgrig.com/v1/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${sandrigApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.content,
        from: emailData.from || "noreply@aisolutionshub.co",
        tracking: true
      })
    });

    if (!response.ok) {
      throw new Error(`Sandrig API error: ${response.status}`);
    }

    const result = await response.json();
    return { success: true, message_id: result.id };
  } catch (error) {
    console.error("Sandrig email error:", error);
    return { success: false, error: error.message };
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
      email_type,
      recipient_type,
      email_purpose,
      personalization_data,
      tone_preferences,
      send_immediately,
      delivery_options,
      target_recipients
    } = requestData;

    // Validate required fields
    if (!email_type || !email_purpose) {
      throw new Error("Email type and purpose are required");
    }

    // Generate email templates
    const templates = generateEmailTemplates(email_type, recipient_type);

    // Process personalization data
    const personalization = processPersonalizationData(personalization_data || {});

    // Create comprehensive email generation prompt
    const generationPrompt = `
      Email Generation Request:
      
      Email Type: ${email_type}
      Recipient Type: ${recipient_type || "General"}
      Purpose: ${email_purpose}
      Tone Preferences: ${JSON.stringify(tone_preferences || {})}
      Personalization Data: ${JSON.stringify(personalization)}
      
      Please provide:
      1. Email subject line suggestions (3-5 options)
      2. Opening paragraph tailored to recipient
      3. Main content with persuasive messaging
      4. Call-to-action recommendations
      5. Email tone and style optimization
      6. Mobile-friendly formatting suggestions
      7. Personalization recommendations
      8. A/B testing suggestions for subject lines
    `;

    // Call both AI services for email generation
    const [geminiEmail, deepseekEmail] = await Promise.all([
      callGeminiAI(generationPrompt),
      callDeepSeekAI(generationPrompt)
    ]);

    // If both AI services fail, provide fallback response
    if (!geminiEmail && !deepseekEmail) {
      throw new Error("AI email generation services are currently unavailable");
    }

    // Generate final email content
    const emailContent = {
      templates: templates,
      subject_lines: [
        templates.subject,
        "Alternative subject option",
        "Another creative subject line",
        "Emergency subject line",
        "Test subject line"
      ],
      content_blocks: {
        opening: personalization.dynamic_content.personalized_opening,
        main_content: email_purpose,
        call_to_action: "Click here to learn more",
        closing: "Best regards,\n{{sender_name}}"
      },
      ai_generated_content: {
        gemini_version: geminiEmail || "Content generation temporarily unavailable",
        deepseek_version: deepseekEmail || "Content optimization temporarily unavailable",
        combined_approach: geminiEmail && deepseekEmail 
          ? "Comprehensive dual-AI email generation completed"
          : "Basic email content generated - optimization limited"
      }
    };

    // Generate personalization recommendations
    const personalizationRecommendations = {
      dynamic_content: [
        "Use recipient's name in subject line (increases open rates by 26%)",
        "Reference their previous interactions or purchases",
        "Customize offers based on customer segment",
        "Include location-specific content where relevant"
      ],
      segmentation: [
        "New customers vs. returning customers",
        "High-value customers vs. standard customers", 
        "Active vs. inactive users",
        "Interest-based segmentation"
      ],
      timing_optimization: [
        "Send during optimal hours (10 AM - 2 PM for B2B)",
        "Avoid Mondays and Fridays for B2B",
        "Consider time zones for global audiences",
        "Weekend timing for consumer emails"
      ]
    };

    // Generate template suggestions
    const templateSuggestions = {
      responsive_design: [
        "Single column layout for mobile optimization",
        "Large, clickable buttons for call-to-action",
        "Minimal text and maximum visual impact",
        "Social proof elements integration"
      ],
      content_structure: {
        header: "Company logo and branding",
        hero_section: "Main message or promotional content",
        content_area: "Detailed information and benefits",
        footer: "Contact information and unsubscribe link"
      },
      best_practices: [
        "Keep subject lines under 50 characters",
        "Use clear, actionable language",
        "Include one primary call-to-action",
        "Ensure mobile responsiveness"
      ]
    };

    // Generate tone settings
    const toneSettings = {
      professional: {
        style: "Formal, business-appropriate language",
        characteristics: ["Clear", "Concise", "Authoritative", "Trustworthy"],
        use_cases: ["B2B communications", "Customer service", "Legal notifications"]
      },
      friendly: {
        style: "Conversational, approachable tone",
        characteristics: ["Warm", "Personal", "Conversational", "Engaging"],
        use_cases: ["Newsletters", "Welcome emails", "Community updates"]
      },
      urgent: {
        style: "Time-sensitive, action-oriented",
        characteristics: ["Direct", "Clear deadline", "Compelling", "Action-focused"],
        use_cases: ["Limited-time offers", "Flash sales", "Important updates"]
      }
    };

    // Optional email sending
    let deliveryResult = null;
    if (send_immediately && target_recipients && sandrigApiKey) {
      const emailData = {
        to: target_recipients,
        subject: templates.subject,
        content: emailContent.content_blocks.main_content,
        from: "noreply@aisolutionshub.co"
      };
      deliveryResult = await sendEmailViaSandrig(emailData);
    }

    // Store the session in Supabase
    const { data: sessionData, error: dbError } = await supabase
      .from("email_assistant_sessions")
      .insert({
        user_id: user.id,
        email_type,
        recipient_type,
        email_purpose,
        ai_analysis: emailContent,
        email_content: emailContent,
        personalization_data: personalization,
        template_suggestions: templateSuggestions,
        tone_settings: toneSettings,
        delivery_options: {
          immediate_send: send_immediately || false,
          delivery_result: deliveryResult,
          tracking_enabled: true
        }
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      throw new Error("Failed to save email assistant session");
    }

    // Return comprehensive response
    const response = {
      success: true,
      session_id: sessionData.id,
      email_content: emailContent,
      personalization: personalization,
      templates: templateSuggestions,
      tone_settings: toneSettings,
      delivery_status: deliveryResult,
      recommendations: personalizationRecommendations,
      created_at: sessionData.created_at,
      user_id: user.id
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Email assistant error:", error);
    
    const errorResponse = {
      success: false,
      error: {
        code: "EMAIL_ASSISTANT_ERROR",
        message: error.message || "An unexpected error occurred"
      }
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});