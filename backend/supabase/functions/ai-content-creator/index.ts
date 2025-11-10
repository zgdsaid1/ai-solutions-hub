// AI Content Creator Tool
// Provides comprehensive content creation, SEO optimization, and multi-format generation using dual AI analysis

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

// Content types and platforms
const CONTENT_TYPES = [
  "Blog Post",
  "Social Media Post",
  "Email Newsletter",
  "Landing Page Copy",
  "Advertisement Copy",
  "Product Description",
  "Press Release",
  "Case Study",
  "White Paper",
  "Video Script"
];

const SOCIAL_PLATFORMS = [
  "Facebook",
  "Instagram", 
  "LinkedIn",
  "Twitter",
  "YouTube",
  "TikTok",
  "Pinterest",
  "Reddit",
  "Medium"
];

// Gemini AI API call for content creation and optimization
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
      throw new Error(`Gemini API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error("Gemini AI Error:", error);
    return null;
  }
}

// DeepSeek AI API call for SEO and content strategy
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
            content: "You are a professional content strategist and SEO expert specializing in content marketing, search optimization, and digital content creation. Focus on creating engaging, searchable, and conversion-optimized content."
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

// SEO keyword analysis and optimization
function generateSEOAnalysis(topic: string, targetKeywords: string[]) {
  const keywords = targetKeywords.length > 0 ? targetKeywords : [
    topic.toLowerCase().split(' ').slice(0, 3).join(' '),
    `${topic} guide`,
    `${topic} best practices`,
    `how to ${topic}`
  ];

  return {
    primary_keywords: keywords.slice(0, 3),
    long_tail_keywords: [
      `comprehensive guide to ${topic}`,
      `best ${topic} strategies for business`,
      `how to implement ${topic} effectively`,
      `${topic} tools and resources`
    ],
    keyword_density: {
      primary: "1-2% of total word count",
      secondary: "0.5-1% of total word count",
      avoid_stuffing: "Keep natural readability"
    },
    seo_metrics: {
      title_length: "50-60 characters",
      meta_description: "150-160 characters",
      header_structure: "H1, H2, H3 hierarchy",
      content_length: "1500+ words for blog posts",
      image_alt_text: "Descriptive and keyword-rich"
    },
    content_structure: {
      introduction: "Hook and topic overview",
      main_content: "Detailed sections with subheadings",
      conclusion: "Summary and call-to-action"
    }
  };
}

// Content generation templates by type
function generateContentTemplates(contentType: string, platform: string) {
  const templates = {
    "Blog Post": {
      structure: {
        title: "Compelling, keyword-optimized headline",
        introduction: "Hook, problem statement, and solution preview",
        body: "3-5 main sections with subheadings",
        conclusion: "Summary and next steps",
        cta: "Clear call-to-action"
      },
      word_count: "1500-2500 words",
      seo_requirements: "Meta description, alt tags, internal linking"
    },
    "Social Media Post": {
      structure: {
        hook: "Attention-grabbing opening",
        value: "Provide useful information or entertainment",
        call_to_action: "Clear next step for engagement"
      },
      word_count: platform === "LinkedIn" ? "150-300 words" : "100-200 words",
      formatting: "Emojis, hashtags, line breaks for readability"
    },
    "Email Newsletter": {
      structure: {
        subject_line: "Compelling preview of content",
        preview_text: "Supporting text for email preview",
        header: "Newsletter title and branding",
        content_sections: "3-5 brief, scannable sections",
        footer: "Unsubscribe and contact information"
      },
      word_count: "200-400 words",
      requirements: "Mobile-responsive, clear hierarchy"
    },
    "Advertisement Copy": {
      structure: {
        headline: "Attention-grabbing main message",
        subheading: "Supporting benefit statement",
        body: "Key features and benefits",
        cta: "Urgent call-to-action",
        disclaimer: "Terms and conditions if needed"
      },
      word_count: "100-200 words",
      focus: "Benefits over features, emotional triggers"
    },
    "Landing Page Copy": {
      structure: {
        headline: "Value proposition statement",
        subheadline: "Supporting detail",
        benefits_list: "5-7 key benefits",
        social_proof: "Testimonials or statistics",
        cta_section: "Primary and secondary CTAs"
      },
      word_count: "300-800 words",
      optimization: "Conversion-focused, minimal friction"
    }
  };

  return templates[contentType] || templates["Blog Post"];
}

// Generate publishing schedule recommendations
function generatePublishingSchedule(contentType: string, platform: string) {
  const schedules = {
    "Blog Post": {
      frequency: "2-3 times per week",
      best_times: ["Tuesday 10 AM", "Thursday 2 PM", "Sunday 7 PM"],
      consistency: "Regular weekly posting schedule",
      promotion: "Social media promotion within 2 hours"
    },
    "Social Media Post": {
      frequency: platform === "LinkedIn" ? "1-2 per day" : "2-5 per day",
      best_times: platform === "LinkedIn" ? ["Tuesday-Thursday 9-11 AM"] : 
                   platform === "Instagram" ? ["Monday, Wednesday, Friday 11 AM-1 PM"] :
                   ["Weekday evenings 6-8 PM"],
      engagement_focus: "Respond to comments within 1 hour"
    },
    "Email Newsletter": {
      frequency: "Weekly or bi-weekly",
      best_times: ["Tuesday 10 AM", "Wednesday 2 PM", "Thursday 11 AM"],
      timing: "Avoid Mondays and Fridays",
      testing: "A/B test subject lines"
    },
    "Advertisement Copy": {
      frequency: "Campaign-based",
      timing: "Peak hours for target audience",
      rotation: "A/B test ad variations",
      budget: "Allocate based on performance"
    }
  };

  return schedules[contentType] || schedules["Blog Post"];
}

// Generate performance tracking metrics
function generatePerformanceTracking(contentType: string, platform: string) {
  const metrics = {
    "Blog Post": {
      primary: ["Page views", "Time on page", "Bounce rate"],
      seo: ["Organic traffic", "Keyword rankings", "Backlinks"],
      engagement: ["Comments", "Social shares", "Newsletter signups"]
    },
    "Social Media Post": {
      primary: ["Reach", "Impressions", "Engagement rate"],
      interactions: ["Likes", "Comments", "Shares", "Saves"],
      growth: ["Follower growth", "Profile visits"]
    },
    "Email Newsletter": {
      primary: ["Open rate", "Click-through rate", "Unsubscribe rate"],
      engagement: ["Time spent reading", "Forward rate"],
      conversion: ["Click-to-purchase", "Sign-up conversion"]
    },
    "Advertisement Copy": {
      primary: ["Click-through rate", "Conversion rate", "Cost per click"],
      engagement: ["Ad engagement rate", "Video completion rate"],
      roi: ["Return on ad spend", "Cost per acquisition"]
    }
  };

  return {
    tracking_metrics: metrics[contentType] || metrics["Blog Post"],
    tools: [
      "Google Analytics",
      "Google Search Console", 
      "Social media native analytics",
      "Email marketing platform analytics",
      "SEO tools (SEMrush, Ahrefs)"
    ],
    reporting_frequency: "Weekly reports, monthly analysis",
    kpis: {
      traffic_goals: "20% increase in 3 months",
      engagement_targets: "25% improvement in engagement rate",
      conversion_optimization: "15% increase in conversion rate"
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
      content_type,
      platform,
      topic,
      target_keywords,
      tone,
      target_audience,
      content_objectives,
      brand_guidelines,
      media_requirements
    } = requestData;

    // Validate required fields
    if (!content_type || !topic) {
      throw new Error("Content type and topic are required");
    }

    // Generate SEO analysis
    const seoAnalysis = generateSEOAnalysis(topic, target_keywords || []);

    // Generate content templates
    const contentTemplates = generateContentTemplates(content_type, platform);

    // Create comprehensive content creation prompt
    const contentPrompt = `
      Content Creation Request:
      
      Content Type: ${content_type}
      Platform: ${platform || "General"}
      Topic: ${topic}
      Target Audience: ${target_audience || "General audience"}
      Tone: ${tone || "Professional and engaging"}
      Content Objectives: ${content_objectives || "Inform and engage audience"}
      Brand Guidelines: ${brand_guidelines || "Professional, trustworthy, innovative"}
      Target Keywords: ${target_keywords?.join(', ') || "Organic selection"}
      
      Please provide:
      1. Compelling headline and title optimization
      2. Engaging introduction and hook
      3. Structured main content with clear sections
      4. Call-to-action and conversion elements
      5. SEO optimization and keyword integration
      6. Platform-specific formatting recommendations
      7. Content variations for A/B testing
      8. Performance optimization suggestions
    `;

    // Call both AI services for content generation
    const [geminiContent, deepseekContent] = await Promise.all([
      callGeminiAI(contentPrompt),
      callDeepSeekAI(contentPrompt)
    ]);

    // If both AI services fail, provide fallback response
    if (!geminiContent && !deepseekContent) {
      throw new Error("AI content creation services are currently unavailable");
    }

    // Generate comprehensive content
    const contentGeneration = {
      main_content: deepseekContent || geminiContent || "Content generation temporarily unavailable",
      optimized_content: geminiContent && deepseekContent 
        ? "Comprehensive dual-AI content generation completed"
        : "Basic content generated - SEO optimization limited",
      content_structure: contentTemplates.structure,
      word_count: contentTemplates.word_count,
      formatting_guidelines: contentTemplates.formatting || contentTemplates.seo_requirements
    };

    // Generate SEO optimization recommendations
    const seoOptimization = {
      keyword_strategy: seoAnalysis,
      on_page_optimization: {
        title_tag: `Optimized title with primary keyword: ${seoAnalysis.primary_keywords[0]}`,
        meta_description: "Engaging description with call-to-action",
        header_structure: "H1: Main keyword, H2-H3: Supporting keywords",
        internal_linking: "Link to related content and pages",
        image_optimization: "Alt text with descriptive keywords"
      },
      technical_seo: {
        page_speed: "Optimize images and minimize code",
        mobile_friendly: "Responsive design for all devices",
        structured_data: "Schema markup for rich snippets",
        sitemap_inclusion: "Add to XML sitemap"
      },
      content_seo: {
        readability_score: "Aim for 8th grade reading level",
        content_gap_analysis: "Identify and cover related topics",
        competitor_analysis: "Research top-performing content",
        update_frequency: "Regular content refresh and updates"
      }
    };

    // Generate media integration recommendations
    const mediaIntegration = {
      image_recommendations: [
        "High-quality, relevant hero images",
        "Infographics for complex information",
        "Screenshots and product demonstrations",
        "Stock photos for visual appeal"
      ],
      video_content: [
        "Explainer videos for key concepts",
        "Tutorial content for how-to guides",
        "Testimonial videos for social proof",
        "Behind-the-scenes content"
      ],
      multimedia_optimization: {
        file_sizes: "Optimize for fast loading",
        alt_text: "Descriptive and keyword-rich",
        captions: "Accessibility and SEO benefits",
        responsive_images: "Multiple sizes for different devices"
      },
      interactive_elements: [
        "Polls and surveys for engagement",
        "Quizzes for education and entertainment",
        "Calculators and tools",
        "Embedded social media content"
      ]
    };

    // Generate publishing schedule
    const publishingSchedule = generatePublishingSchedule(content_type, platform);

    // Generate performance tracking
    const performanceTracking = generatePerformanceTracking(content_type, platform);

    // Additional content variations for different platforms
    const platformVariations = {
      original: contentGeneration.main_content,
      social_adaptations: platform && platform !== "General" ? [
        `Optimized for ${platform}: Shortened version with platform-specific formatting`,
        `Engagement-focused: Question format to encourage interaction`,
        `Visual-first: Emphasis on image/video content`
      ] : ["General web content suitable for multiple platforms"],
      email_adaptation: "Email-friendly version with subject line optimization",
      print_adaptation: "Traditional media version if applicable"
    };

    // Store the session in Supabase
    const { data: sessionData, error: dbError } = await supabase
      .from("content_creation_sessions")
      .insert({
        user_id: user.id,
        content_type,
        platform,
        ai_analysis: {
          gemini_content: geminiContent,
          deepseek_content: deepseekContent,
          combined_analysis: contentGeneration.optimized_content
        },
        content_generation: {
          ...contentGeneration,
          platform_variations: platformVariations
        },
        seo_optimization: seoOptimization,
        media_integration: mediaIntegration,
        publishing_schedule: publishingSchedule,
        performance_tracking: performanceTracking
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      throw new Error("Failed to save content creation session");
    }

    // Return comprehensive response
    const response = {
      success: true,
      session_id: sessionData.id,
      content: contentGeneration,
      seo: seoOptimization,
      media: mediaIntegration,
      schedule: publishingSchedule,
      tracking: performanceTracking,
      platform_variations: platformVariations,
      created_at: sessionData.created_at,
      user_id: user.id
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Content creator error:", error);
    
    const errorResponse = {
      success: false,
      error: {
        code: "CONTENT_CREATOR_ERROR",
        message: error.message || "An unexpected error occurred"
      }
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});