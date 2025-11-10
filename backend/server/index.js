const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');
const Stripe = require('stripe');
const OpenAI = require('openai');

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

// Initialize Stripe
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Security middleware
app.use(helmet());
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: [
    'https://ai-solutions-database-32cq9yu9x-zaids-projects-a75be417.vercel.app',
    'https://aisolutionshub.co',
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-client-info']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// JWT middleware for protected routes
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Utility functions
const generateJWT = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const validateEmail = (email) => {
  return /\S+@\S+\.\S+/.test(email);
};

// ==================== AUTH ROUTES ====================

// User signup
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, fullName } = req.body;

    // Validation
    if (!email || !password || !fullName) {
      return res.status(400).json({ error: 'Email, password, and full name are required' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(409).json({ error: 'User already exists with this email' });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const { data: user, error } = await supabase
      .from('users')
      .insert([{
        email,
        password_hash: hashedPassword,
        full_name: fullName,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Signup error:', error);
      return res.status(500).json({ error: 'Failed to create user' });
    }

    // Generate JWT token
    const token = generateJWT(user.id);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          createdAt: user.created_at
        },
        token
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User signin
app.post('/api/auth/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = generateJWT(user.id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          createdAt: user.created_at
        },
        token
      }
    });

  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user profile
app.get('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, full_name, created_at')
      .eq('id', req.user.userId)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          createdAt: user.created_at
        }
      }
    });

  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== STRIPE ROUTES ====================

// Create Stripe checkout session
app.post('/api/stripe/create-checkout-session', authenticateToken, async (req, res) => {
  try {
    const { priceId, successUrl, cancelUrl } = req.body;

    if (!priceId) {
      return res.status(400).json({ error: 'Price ID is required' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: successUrl || `${process.env.FRONTEND_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.FRONTEND_URL}/pricing`,
      customer_email: req.user.email,
      metadata: {
        userId: req.user.userId
      }
    });

    res.json({
      success: true,
      data: {
        sessionId: session.id,
        url: session.url
      }
    });

  } catch (error) {
    console.error('Stripe checkout error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Stripe webhook handler
app.post('/api/stripe/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      
      // Update user subscription status
      if (session.metadata.userId) {
        await supabase
          .from('users')
          .update({
            stripe_customer_id: session.customer,
            subscription_status: 'active',
            subscription_id: session.subscription,
            updated_at: new Date().toISOString()
          })
          .eq('id', session.metadata.userId);
      }
      break;

    case 'customer.subscription.updated':
      const subscription = event.data.object;
      
      // Update subscription status
      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('stripe_customer_id', subscription.customer)
        .single();

      if (user) {
        await supabase
          .from('users')
          .update({
            subscription_status: subscription.status,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);
      }
      break;

    case 'customer.subscription.deleted':
      const deletedSubscription = event.data.object;
      
      // Cancel subscription status
      const { data: deletedUser } = await supabase
        .from('users')
        .select('id')
        .eq('stripe_customer_id', deletedSubscription.customer)
        .single();

      if (deletedUser) {
        await supabase
          .from('users')
          .update({
            subscription_status: 'canceled',
            updated_at: new Date().toISOString()
          })
          .eq('id', deletedUser.id);
      }
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({received: true});
});

// Get subscription status
app.get('/api/subscription/status', authenticateToken, async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('subscription_status, subscription_id, stripe_customer_id')
      .eq('id', req.user.userId)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let subscriptionDetails = null;

    if (user.subscription_id) {
      try {
        const subscription = await stripe.subscriptions.retrieve(user.subscription_id);
        subscriptionDetails = {
          status: subscription.status,
          currentPeriodEnd: subscription.current_period_end,
          plan: subscription.items.data[0]?.price
        };
      } catch (stripeError) {
        console.error('Stripe subscription fetch error:', stripeError);
      }
    }

    res.json({
      success: true,
      data: {
        status: user.subscription_status,
        subscriptionId: user.subscription_id,
        customerId: user.stripe_customer_id,
        details: subscriptionDetails
      }
    });

  } catch (error) {
    console.error('Subscription status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== AI TOOLS ROUTES ====================

// AI Marketing Assistant
app.post('/api/ai/marketing', authenticateToken, async (req, res) => {
  try {
    const { campaignType, targetAudience, budget, goals } = req.body;

    const prompt = `
      Create a comprehensive marketing strategy for a ${campaignType} campaign.
      Target audience: ${targetAudience}
      Budget: ${budget}
      Goals: ${goals}
      
      Provide specific, actionable recommendations including:
      1. Campaign messaging and positioning
      2. Channel strategy and budget allocation
      3. Content calendar recommendations
      4. KPIs and success metrics
      5. Timeline and milestones
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert marketing strategist with 15+ years of experience. Provide detailed, actionable marketing advice."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1500,
      temperature: 0.7
    });

    const result = completion.choices[0].message.content;

    // Store in database
    await supabase
      .from('marketing_sessions')
      .insert([{
        user_id: req.user.userId,
        campaign_type: campaignType,
        target_audience: targetAudience,
        budget: budget,
        goals: goals,
        result: result,
        created_at: new Date().toISOString()
      }]);

    res.json({
      success: true,
      data: {
        marketing_strategy: result,
        session_id: Date.now()
      }
    });

  } catch (error) {
    console.error('Marketing AI error:', error);
    res.status(500).json({ error: 'Failed to generate marketing strategy' });
  }
});

// AI Legal Assistant
app.post('/api/ai/legal', authenticateToken, async (req, res) => {
  try {
    const { legalQuery, documentType, jurisdiction } = req.body;

    const prompt = `
      Legal Query: ${legalQuery}
      Document Type: ${documentType}
      Jurisdiction: ${jurisdiction}
      
      Please provide:
      1. Legal analysis and interpretation
      2. Relevant laws and regulations
      3. Compliance requirements
      4. Risk assessment
      5. Recommended next steps
      
      Note: This is for informational purposes only and not legal advice.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a legal expert with extensive knowledge of business law, contracts, and compliance. Provide accurate legal information while noting this is not formal legal advice."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1500,
      temperature: 0.3
    });

    const result = completion.choices[0].message.content;

    // Store in database
    await supabase
      .from('legal_sessions')
      .insert([{
        user_id: req.user.userId,
        legal_query: legalQuery,
        document_type: documentType,
        jurisdiction: jurisdiction,
        result: result,
        created_at: new Date().toISOString()
      }]);

    res.json({
      success: true,
      data: {
        legal_analysis: result,
        session_id: Date.now()
      }
    });

  } catch (error) {
    console.error('Legal AI error:', error);
    res.status(500).json({ error: 'Failed to generate legal analysis' });
  }
});

// AI Inventory Management
app.post('/api/ai/inventory', authenticateToken, async (req, res) => {
  try {
    const { currentInventory, salesData, seasonality, leadTime } = req.body;

    const prompt = `
      Analyze the following inventory data:
      Current Inventory: ${JSON.stringify(currentInventory)}
      Sales Data: ${JSON.stringify(salesData)}
      Seasonality Factor: ${seasonality}
      Lead Time: ${leadTime} days
      
      Provide:
      1. Stock optimization recommendations
      2. Reorder points for each item
      3. Safety stock calculations
      4. Demand forecasting
      5. Cost-saving opportunities
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert in inventory management and supply chain optimization with deep knowledge of demand forecasting and stock control."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1500,
      temperature: 0.4
    });

    const result = completion.choices[0].message.content;

    // Store in database
    await supabase
      .from('inventory_sessions')
      .insert([{
        user_id: req.user.userId,
        current_inventory: currentInventory,
        sales_data: salesData,
        seasonality: seasonality,
        lead_time: leadTime,
        result: result,
        created_at: new Date().toISOString()
      }]);

    res.json({
      success: true,
      data: {
        inventory_analysis: result,
        session_id: Date.now()
      }
    });

  } catch (error) {
    console.error('Inventory AI error:', error);
    res.status(500).json({ error: 'Failed to analyze inventory' });
  }
});

// AI Logistics Optimizer
app.post('/api/ai/logistics', authenticateToken, async (req, res) => {
  try {
    const { locations, deliveryRequests, constraints } = req.body;

    const prompt = `
      Optimize logistics for the following scenario:
      Locations: ${JSON.stringify(locations)}
      Delivery Requests: ${JSON.stringify(deliveryRequests)}
      Constraints: ${JSON.stringify(constraints)}
      
      Provide:
      1. Optimized route planning
      2. Vehicle allocation strategy
      3. Delivery scheduling
      4. Cost estimation
      5. Performance metrics
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a logistics optimization expert with extensive knowledge of route planning, vehicle routing, and supply chain management."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1500,
      temperature: 0.3
    });

    const result = completion.choices[0].message.content;

    // Store in database
    await supabase
      .from('logistics_sessions')
      .insert([{
        user_id: req.user.userId,
        locations: locations,
        delivery_requests: deliveryRequests,
        constraints: constraints,
        result: result,
        created_at: new Date().toISOString()
      }]);

    res.json({
      success: true,
      data: {
        logistics_optimization: result,
        session_id: Date.now()
      }
    });

  } catch (error) {
    console.error('Logistics AI error:', error);
    res.status(500).json({ error: 'Failed to optimize logistics' });
  }
});

// AI Content Creator
app.post('/api/ai/content', authenticateToken, async (req, res) => {
  try {
    const { contentType, topic, targetAudience, tone, length } = req.body;

    const prompt = `
      Create ${contentType} content on the topic: ${topic}
      Target Audience: ${targetAudience}
      Tone: ${tone}
      Length: ${length}
      
      Include engaging hooks, clear structure, and compelling calls-to-action.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a professional content creator specializing in engaging, SEO-friendly content across multiple formats."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1500,
      temperature: 0.7
    });

    const result = completion.choices[0].message.content;

    // Store in database
    await supabase
      .from('content_sessions')
      .insert([{
        user_id: req.user.userId,
        content_type: contentType,
        topic: topic,
        target_audience: targetAudience,
        tone: tone,
        length: length,
        result: result,
        created_at: new Date().toISOString()
      }]);

    res.json({
      success: true,
      data: {
        content: result,
        session_id: Date.now()
      }
    });

  } catch (error) {
    console.error('Content AI error:', error);
    res.status(500).json({ error: 'Failed to create content' });
  }
});

// AI Data Analyst
app.post('/api/ai/data-analysis', authenticateToken, async (req, res) => {
  try {
    const { dataset, analysisType, businessQuestion } = req.body;

    const prompt = `
      Analyze the following dataset: ${JSON.stringify(dataset)}
      Analysis Type: ${analysisType}
      Business Question: ${businessQuestion}
      
      Provide:
      1. Key insights and patterns
      2. Statistical analysis
      3. Recommendations
      4. Action items
      5. Visualization suggestions
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a senior data scientist with expertise in statistical analysis, business intelligence, and data visualization."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1500,
      temperature: 0.3
    });

    const result = completion.choices[0].message.content;

    // Store in database
    await supabase
      .from('data_analysis_sessions')
      .insert([{
        user_id: req.user.userId,
        dataset: dataset,
        analysis_type: analysisType,
        business_question: businessQuestion,
        result: result,
        created_at: new Date().toISOString()
      }]);

    res.json({
      success: true,
      data: {
        analysis: result,
        session_id: Date.now()
      }
    });

  } catch (error) {
    console.error('Data analysis AI error:', error);
    res.status(500).json({ error: 'Failed to analyze data' });
  }
});

// AI Sales Assistant
app.post('/api/ai/sales', authenticateToken, async (req, res) => {
  try {
    const { productInfo, prospectInfo, salesStage, goals } = req.body;

    const prompt = `
      Sales scenario analysis:
      Product: ${JSON.stringify(productInfo)}
      Prospect: ${JSON.stringify(prospectInfo)}
      Sales Stage: ${salesStage}
      Goals: ${goals}
      
      Provide:
      1. Sales strategy recommendations
      2. Objection handling
      3. Next steps
      4. Closing techniques
      5. Follow-up schedule
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a senior sales professional with expertise in B2B sales, customer relationship management, and closing techniques."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1500,
      temperature: 0.6
    });

    const result = completion.choices[0].message.content;

    // Store in database
    await supabase
      .from('sales_sessions')
      .insert([{
        user_id: req.user.userId,
        product_info: productInfo,
        prospect_info: prospectInfo,
        sales_stage: salesStage,
        goals: goals,
        result: result,
        created_at: new Date().toISOString()
      }]);

    res.json({
      success: true,
      data: {
        sales_strategy: result,
        session_id: Date.now()
      }
    });

  } catch (error) {
    console.error('Sales AI error:', error);
    res.status(500).json({ error: 'Failed to generate sales strategy' });
  }
});

// AI Customer Support
app.post('/api/ai/customer-support', authenticateToken, async (req, res) => {
  try {
    const { customerIssue, ticketType, urgency, customerHistory } = req.body;

    const prompt = `
      Customer support case:
      Issue: ${customerIssue}
      Ticket Type: ${ticketType}
      Urgency: ${urgency}
      Customer History: ${JSON.stringify(customerHistory)}
      
      Provide:
      1. Issue analysis
      2. Recommended solution
      3. Response template
      4. Escalation criteria
      5. Follow-up actions
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert customer support specialist with deep knowledge of customer service best practices and conflict resolution."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1500,
      temperature: 0.5
    });

    const result = completion.choices[0].message.content;

    // Store in database
    await supabase
      .from('customer_support_sessions')
      .insert([{
        user_id: req.user.userId,
        customer_issue: customerIssue,
        ticket_type: ticketType,
        urgency: urgency,
        customer_history: customerHistory,
        result: result,
        created_at: new Date().toISOString()
      }]);

    res.json({
      success: true,
      data: {
        support_response: result,
        session_id: Date.now()
      }
    });

  } catch (error) {
    console.error('Customer support AI error:', error);
    res.status(500).json({ error: 'Failed to generate support response' });
  }
});

// AI Email Assistant
app.post('/api/ai/email', authenticateToken, async (req, res) => {
  try {
    const { emailType, recipient, subject, purpose, tone } = req.body;

    const prompt = `
      Compose an ${emailType} email:
      Recipient: ${recipient}
      Subject: ${subject}
      Purpose: ${purpose}
      Tone: ${tone}
      
      Include professional formatting and compelling content.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert email marketer and communication specialist with deep knowledge of effective business communication."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1200,
      temperature: 0.6
    });

    const result = completion.choices[0].message.content;

    // Store in database
    await supabase
      .from('email_sessions')
      .insert([{
        user_id: req.user.userId,
        email_type: emailType,
        recipient: recipient,
        subject: subject,
        purpose: purpose,
        tone: tone,
        result: result,
        created_at: new Date().toISOString()
      }]);

    res.json({
      success: true,
      data: {
        email_content: result,
        session_id: Date.now()
      }
    });

  } catch (error) {
    console.error('Email AI error:', error);
    res.status(500).json({ error: 'Failed to generate email content' });
  }
});

// AI Document Automation
app.post('/api/ai/document', authenticateToken, async (req, res) => {
  try {
    const { documentType, data, template } = req.body;

    const prompt = `
      Generate a ${documentType} using the following data:
      Data: ${JSON.stringify(data)}
      Template: ${template}
      
      Create a professional, properly formatted document.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a professional document writer and legal assistant with expertise in creating various business documents and contracts."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.4
    });

    const result = completion.choices[0].message.content;

    // Store in database
    await supabase
      .from('document_automation_sessions')
      .insert([{
        user_id: req.user.userId,
        document_type: documentType,
        data: data,
        template: template,
        result: result,
        created_at: new Date().toISOString()
      }]);

    res.json({
      success: true,
      data: {
        document: result,
        session_id: Date.now()
      }
    });

  } catch (error) {
    console.error('Document AI error:', error);
    res.status(500).json({ error: 'Failed to generate document' });
  }
});

// ==================== HEALTH CHECK ====================

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 AI Solutions Backend running on port ${port}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${port}/api/health`);
});

// Export for Railway deployment
module.exports = app;