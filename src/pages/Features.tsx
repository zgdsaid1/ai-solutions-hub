import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  TrendingUp, 
  Scale, 
  Package, 
  Phone, 
  Mail, 
  BarChart3, 
  Truck, 
  FileText,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

export default function Features() {
  const modules = [
    {
      icon: TrendingUp,
      name: 'AI Marketing & Business Growth',
      color: 'from-blue-500 to-purple-500',
      bgColor: 'bg-blue-50',
      description: 'Transform your marketing strategy with AI-powered campaign generation, audience targeting, and growth analytics. Our marketing module leverages advanced AI to create compelling campaigns, analyze market trends, and identify growth opportunities. Generate data-driven marketing strategies, optimize conversion funnels, and track campaign performance in real-time. The system provides actionable insights for market positioning, competitive analysis, and customer segmentation to maximize your marketing ROI.'
    },
    {
      icon: Scale,
      name: 'AI Legal Advisor',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50',
      description: 'Access comprehensive legal guidance for business operations, contracts, and compliance matters. Our AI Legal Advisor provides expert analysis of legal documents, contract review, compliance checking, and regulatory guidance. Get instant answers to legal questions, draft legal documents with AI assistance, and ensure your business operations comply with relevant regulations. The module covers business formation, intellectual property, employment law, and contract management with professional-grade analysis and recommendations.'
    },
    {
      icon: Package,
      name: 'AI Smart Inventory Tracker',
      color: 'from-green-500 to-teal-500',
      bgColor: 'bg-green-50',
      description: 'Optimize inventory management with intelligent demand forecasting, stock level monitoring, and automated reordering. Our Smart Inventory system uses AI to predict demand patterns, prevent stockouts, and minimize excess inventory costs. Track products across multiple locations, generate automated purchase orders, and receive alerts for low stock levels. Advanced analytics provide insights into inventory turnover, seasonal trends, and optimal reorder points to maximize inventory efficiency and reduce carrying costs.'
    },
    {
      icon: Phone,
      name: 'AI Voice & SMS Support',
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-50',
      description: 'Deliver exceptional customer support through AI-powered voice and SMS automation integrated with Twilio. Handle customer inquiries 24/7 with intelligent conversational AI that understands context, sentiment, and intent. Automate routine support tasks, route complex issues to human agents, and maintain conversation history for personalized interactions. The system supports multi-channel communication, automated follow-ups, and real-time sentiment analysis to ensure customer satisfaction and efficient support operations.'
    },
    {
      icon: Mail,
      name: 'AI Email Assistant',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
      description: 'Create and manage sophisticated email campaigns with AI-powered content generation and SendGrid integration. Generate personalized email content, compelling subject lines, and targeted messaging based on audience segments. Schedule automated email sequences, A/B test different approaches, and track engagement metrics including open rates, click-through rates, and conversions. The assistant learns from campaign performance to continuously improve email effectiveness and delivers actionable insights for optimizing your email marketing strategy.'
    },
    {
      icon: BarChart3,
      name: 'AI Data Analyzer & Insights',
      color: 'from-purple-500 to-indigo-500',
      bgColor: 'bg-purple-50',
      description: 'Transform raw data into actionable insights with advanced analytics and predictive modeling. Our Data Analyzer processes complex datasets to identify trends, patterns, and anomalies that drive business decisions. Upload CSV files, connect to databases, and visualize data through interactive dashboards. Get AI-generated insights including statistical analysis, correlation discovery, predictive forecasting, and recommendation reports. The module supports custom metrics, automated reporting, and real-time data visualization to empower data-driven decision making.'
    },
    {
      icon: Truck,
      name: 'AI Logistics & Route Optimizer',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50',
      description: 'Optimize delivery routes, reduce transportation costs, and improve logistics efficiency with AI-powered route planning integrated with Google Maps. Calculate optimal delivery sequences considering traffic patterns, time windows, vehicle capacity, and distance constraints. Track shipments in real-time, manage fleet operations, and reduce fuel costs through intelligent route optimization. The system provides predictive ETAs, identifies bottlenecks, and suggests alternative routes to ensure on-time deliveries while minimizing operational costs and environmental impact.'
    },
    {
      icon: FileText,
      name: 'AI Document Automation & e-Sign',
      color: 'from-indigo-500 to-purple-500',
      bgColor: 'bg-indigo-50',
      description: 'Streamline document workflows with AI-powered document generation, template management, and electronic signatures. Automatically create contracts, agreements, and business documents using intelligent templates with variable substitution. Generate custom documents from prompts, manage document versions, and track approval workflows. The system includes secure e-signature capabilities, document storage, automated notifications, and compliance tracking. Reduce manual document processing time, eliminate errors, and maintain organized document repositories with comprehensive audit trails.'
    }
  ];

  const benefits = [
    'All modules integrate with our AI Router for intelligent task processing',
    'Subscription-based access with Free, Pro, and Enterprise tiers',
    'Real-time usage tracking and analytics across all modules',
    'Seamless integration between modules for unified workflows',
    'Enterprise-grade security and data protection',
    'Regular updates with new AI capabilities and features'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-2 rounded-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">AI Solutions Hub</span>
            </Link>

            <div className="flex items-center gap-6">
              <Link to="/" className="text-gray-700 hover:text-gray-900 font-medium">
                Home
              </Link>
              <Link to="/about" className="text-gray-700 hover:text-gray-900 font-medium">
                About
              </Link>
              <Link to="/features" className="text-blue-600 hover:text-blue-700 font-medium">
                Features
              </Link>
              <Link
                to="/login"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Powerful Features
            </span>
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Explore our comprehensive suite of 8 specialized AI modules designed to transform every aspect of your business operations.
          </p>
        </div>

        {/* Modules */}
        <div className="space-y-8 mb-16">
          {modules.map((module, index) => {
            const Icon = module.icon;
            const isEven = index % 2 === 0;
            
            return (
              <div
                key={module.name}
                className={`bg-white rounded-3xl p-8 md:p-12 shadow-lg hover:shadow-xl transition ${
                  isEven ? '' : 'md:ml-8'
                }`}
              >
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className={`bg-gradient-to-br ${module.color} w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">{module.name}</h2>
                    <p className="text-gray-700 text-lg leading-relaxed">
                      {module.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Platform Benefits */}
        <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl p-12 text-white mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Platform Benefits</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-300 flex-shrink-0 mt-1" />
                <span className="text-blue-50 text-lg">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Integration Highlights */}
        <div className="bg-white rounded-3xl p-12 shadow-lg mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Seamless Integration</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">AI Router</h3>
              <p className="text-gray-600">Intelligent task routing across multiple AI engines for optimal performance</p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Analytics</h3>
              <p className="text-gray-600">Comprehensive tracking and insights across all modules and operations</p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Unified Platform</h3>
              <p className="text-gray-600">All modules work together seamlessly in one integrated ecosystem</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Choose your plan and start transforming your business with AI today
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition shadow-lg"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/about"
              className="inline-flex items-center gap-2 bg-white text-gray-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 transition border border-gray-200"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-2 rounded-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold">AI Solutions Hub</span>
            </div>
            <p className="text-gray-400">
              2025 AI Solutions Hub. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
