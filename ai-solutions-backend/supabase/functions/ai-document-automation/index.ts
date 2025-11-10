// AI Document Automation Tool
// Provides automated document generation, template management, and multi-format export

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

// Gemini AI API call for document content generation
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
            temperature: 0.5,
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

// DeepSeek AI API call for document optimization and formatting
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
            content: "You are a professional document automation expert specializing in business document creation, legal document drafting, and automated content generation. Focus on creating professional, well-structured documents."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 1024,
        temperature: 0.5
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

// Document template generation based on type
function generateDocumentTemplates(documentType: string, category: string) {
  const templates = {
    "contract": {
      structure: {
        title: "Service Agreement",
        sections: [
          "Parties and Services",
          "Terms and Conditions", 
          "Payment Terms",
          "Termination Clauses",
          "Legal Disclaimers"
        ],
        elements: ["Company headers", "Signature blocks", "Date formatting", "Legal disclaimers"]
      },
      content_format: {
        font_family: "Times New Roman",
        font_size: "12pt",
        line_spacing: "1.5",
        margins: "1 inch all sides",
        section_breaks: "Page break after major sections"
      }
    },
    "proposal": {
      structure: {
        title: "Business Proposal",
        sections: [
          "Executive Summary",
          "Problem Statement",
          "Proposed Solution",
          "Timeline and Milestones",
          "Budget and Pricing",
          "Next Steps"
        ],
        elements: ["Cover page", "Table of contents", "Executive summary", "Call to action"]
      },
      content_format: {
        font_family: "Arial",
        font_size: "11pt",
        line_spacing: "1.15",
        margins: "0.75 inch sides, 1 inch top/bottom",
        section_breaks: "Clear section headers"
      }
    },
    "report": {
      structure: {
        title: "Analysis Report",
        sections: [
          "Executive Summary",
          "Methodology",
          "Findings and Analysis",
          "Recommendations",
          "Appendices"
        ],
        elements: ["Executive summary", "Data tables", "Charts and graphs", "References"]
      },
      content_format: {
        font_family: "Calibri",
        font_size: "11pt",
        line_spacing: "1.15",
        margins: "1 inch all sides",
        section_breaks: "Clear section dividers"
      }
    },
    "memo": {
      structure: {
        title: "Internal Memorandum",
        sections: [
          "Header Information",
          "Subject Line",
          "Body Content",
          "Action Items",
          "Distribution"
        ],
        elements: ["Company letterhead", "Date and time", "Author signature", "Distribution list"]
      },
      content_format: {
        font_family: "Arial",
        font_size: "11pt",
        line_spacing: "1.0",
        margins: "1 inch all sides",
        section_breaks: "Standard memo format"
      }
    },
    "invoice": {
      structure: {
        title: "Professional Invoice",
        sections: [
          "Invoice Header",
          "Bill To Information",
          "Service Details",
          "Payment Terms",
          "Total Calculation"
        ],
        elements: ["Company branding", "Payment instructions", "Tax calculations", "Due dates"]
      },
      content_format: {
        font_family: "Arial",
        font_size: "10pt",
        line_spacing: "1.0",
        margins: "0.5 inch all sides",
        section_breaks: "Table format for line items"
      }
    }
  };

  return templates[documentType] || templates["memo"];
}

// Format document content based on type
function formatDocumentContent(documentType: string, content: string, formatting: any) {
  let formattedContent = content;

  // Apply document-specific formatting
  switch (documentType) {
    case "contract":
      formattedContent = `
# ${formatting.title || "Contract Agreement"}

## Parties
This agreement is between [Party A] and [Party B]

## Terms and Conditions
${content}

## Payment Terms
Payment shall be made according to the agreed schedule.

## Legal Disclaimers
This document is legally binding upon both parties.

---
*Generated by AI Document Automation Tool*
*Date: ${new Date().toLocaleDateString()}*
      `;
      break;
    
    case "proposal":
      formattedContent = `
# ${formatting.title || "Business Proposal"}

## Executive Summary
[Executive summary of the proposal]

## Problem Statement
[Description of the problem being addressed]

## Proposed Solution
${content}

## Timeline and Milestones
[Project timeline and key milestones]

## Budget and Pricing
[Detailed cost breakdown]

## Next Steps
[Action items and next steps]

---
*Generated by AI Document Automation Tool*
*Date: ${new Date().toLocaleDateString()}*
      `;
      break;
    
    default:
      formattedContent = `
# ${formatting.title || "Document"}

${content}

---
*Generated by AI Document Automation Tool*
*Date: ${new Date().toLocaleDateString()}*
      `;
  }

  return formattedContent;
}

// Generate export format configurations
function generateExportFormats() {
  return {
    pdf: {
      enabled: true,
      quality: "high",
      compression: "standard",
      security: "none"
    },
    docx: {
      enabled: true,
      version: "Office 2016+",
      compatibility: "Standard",
      track_changes: false
    },
    html: {
      enabled: true,
      responsive: true,
      css_included: true,
      print_friendly: true
    },
    txt: {
      enabled: true,
      encoding: "UTF-8",
      line_breaks: "Unix",
      formatting: "plain text only"
    }
  };
}

// Generate automation rules for document creation
function generateAutomationRules(documentType: string) {
  return {
    trigger_conditions: [
      "New client onboarding",
      "Project milestone completion",
      "Monthly reporting cycle",
      "Contract renewal dates",
      "Invoice generation schedules"
    ],
    template_selection: {
      auto_select: "Based on document type and context",
      manual_override: "User can select custom templates",
      smart_suggestions: "AI suggests templates based on content"
    },
    data_integration: {
      crm_integration: "Pull client data automatically",
      calendar_integration: "Add dates and deadlines",
      accounting_integration: "Include billing information"
    },
    quality_checks: {
      spell_check: "Automatic spell checking",
      format_validation: "Ensure consistent formatting",
      content_review: "AI content review for completeness"
    }
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
      document_type,
      template_category,
      content_requirements,
      formatting_preferences,
      automation_settings,
      export_formats,
      custom_template
    } = requestData;

    // Validate required fields
    if (!document_type || !content_requirements) {
      throw new Error("Document type and content requirements are required");
    }

    // Generate document templates
    const templates = generateDocumentTemplates(document_type, template_category);

    // Create comprehensive document generation prompt
    const generationPrompt = `
      Document Automation Request:
      
      Document Type: ${document_type}
      Template Category: ${template_category || "General"}
      Content Requirements: ${content_requirements}
      Formatting Preferences: ${JSON.stringify(formatting_preferences || {})}
      Custom Template: ${custom_template || "None"}
      
      Please provide:
      1. Document structure and organization
      2. Key content sections and their descriptions
      3. Professional formatting recommendations
      4. Legal and compliance considerations (if applicable)
      5. Automated data field suggestions
      6. Document quality and completeness checklist
      7. Best practices for the document type
      8. Integration with existing business processes
    `;

    // Call both AI services for document generation
    const [geminiDoc, deepseekDoc] = await Promise.all([
      callGeminiAI(generationPrompt),
      callDeepSeekAI(generationPrompt)
    ]);

    // If both AI services fail, provide fallback response
    if (!geminiDoc && !deepseekDoc) {
      throw new Error("AI document generation services are currently unavailable");
    }

    // Format the document content
    const formattedContent = formatDocumentContent(
      document_type, 
      geminiDoc || deepseekDoc || content_requirements,
      formatting_preferences || templates.content_format
    );

    // Generate comprehensive document content
    const documentContent = {
      templates: templates,
      formatted_content: formattedContent,
      content_sections: {
        title: templates.structure?.title || "Document Title",
        sections: templates.structure?.sections || ["Main Content", "Supporting Information", "Conclusions"],
        elements: templates.structure?.elements || ["Headers", "Body", "Footers"]
      },
      ai_generated_content: {
        gemini_version: geminiDoc || "Content generation temporarily unavailable",
        deepseek_version: deepseekDoc || "Content formatting temporarily unavailable",
        combined_approach: geminiDoc && deepseekDoc 
          ? "Comprehensive dual-AI document generation completed"
          : "Basic document content generated - optimization limited"
      },
      raw_content: content_requirements,
      formatted_output: formattedContent
    };

    // Generate template data configuration
    const templateData = {
      dynamic_fields: [
        "Client Name",
        "Date",
        "Invoice Number",
        "Project Name",
        "Amount",
        "Deadline"
      ],
      data_sources: [
        "CRM Database",
        "Project Management System",
        "Accounting Software",
        "Calendar System",
        "Client Portal"
      ],
      automation_triggers: [
        "New client registration",
        "Project completion",
        "Monthly billing cycle",
        "Contract renewal",
        "Milestone achievement"
      ]
    };

    // Generate formatting options
    const formattingOptions = {
      document_structure: {
        margins: formatting_preferences?.margins || templates.content_format?.margins || "1 inch all sides",
        font_family: formatting_preferences?.font_family || templates.content_format?.font_family || "Arial",
        font_size: formatting_preferences?.font_size || templates.content_format?.font_size || "11pt",
        line_spacing: formatting_preferences?.line_spacing || templates.content_format?.line_spacing || "1.15",
        page_orientation: formatting_preferences?.orientation || "portrait"
      },
      style_elements: {
        headers: "Bold, larger font, clear hierarchy",
        paragraphs: "Justified or left-aligned, proper spacing",
        lists: "Consistent bullet or numbering style",
        tables: "Clean borders, alternating row colors"
      },
      branding: {
        company_logo: "Top-left corner positioning",
        footer_information: "Page numbers, contact info, confidentiality notices",
        color_scheme: "Consistent with brand guidelines"
      }
    };

    // Generate export formats configuration
    const exportFormats = generateExportFormats();

    // Apply custom export preferences
    if (export_formats) {
      Object.keys(export_formats).forEach(format => {
        if (exportFormats[format]) {
          exportFormats[format] = { ...exportFormats[format], ...export_formats[format] };
        }
      });
    }

    // Generate automation rules
    const automationRules = generateAutomationRules(document_type);

    // Apply custom automation settings
    if (automation_settings) {
      Object.keys(automation_settings).forEach(key => {
        if (automationRules[key]) {
          automationRules[key] = { ...automationRules[key], ...automation_settings[key] };
        }
      });
    }

    // Store the session in Supabase
    const { data: sessionData, error: dbError } = await supabase
      .from("document_automation_sessions")
      .insert({
        user_id: user.id,
        document_type,
        template_category,
        ai_analysis: documentContent,
        document_content: documentContent,
        template_data: templateData,
        formatting_options: formattingOptions,
        export_formats: exportFormats,
        automation_rules: automationRules
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      throw new Error("Failed to save document automation session");
    }

    // Return comprehensive response
    const response = {
      success: true,
      session_id: sessionData.id,
      document_content: documentContent,
      templates: templateData,
      formatting: formattingOptions,
      export_formats: exportFormats,
      automation_rules: automationRules,
      formatted_document: formattedContent,
      created_at: sessionData.created_at,
      user_id: user.id
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Document automation error:", error);
    
    const errorResponse = {
      success: false,
      error: {
        code: "DOCUMENT_AUTOMATION_ERROR",
        message: error.message || "An unexpected error occurred"
      }
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});