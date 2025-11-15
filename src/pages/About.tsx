import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  Brain, 
  Shield, 
  Zap, 
  TrendingUp,
  Globe,
  Database,
  Lock,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

export default function About() {
  const technologies = [
    { icon: Brain, name: 'AI Router Technology', description: 'Multi-engine routing with Gemini, Llama, and specialized AI engines' },
    { icon: Database, name: 'Supabase Backend', description: 'Real-time database, authentication, and edge functions' },
    { icon: Shield, name: 'Enterprise Security', description: 'Role-based access control and data encryption' },
    { icon: Zap, name: 'Edge Computing', description: 'Global edge functions for low-latency responses' }
  ];

  const principles = [
    'Innovation through intelligent AI routing and task optimization',
    'Security with enterprise-grade authentication and data protection',
    'Scalability built on modern cloud infrastructure',
    'Reliability with automated failover and monitoring',
    'Accessibility through intuitive interfaces and comprehensive documentation'
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
              <Link to="/about" className="text-blue-600 hover:text-blue-700 font-medium">
                About
              </Link>
              <Link to="/features" className="text-gray-700 hover:text-gray-900 font-medium">
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
              About AI Solutions Hub
            </span>
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Empowering businesses with comprehensive AI automation through intelligent technology and innovative solutions.
          </p>
        </div>

        {/* Platform Overview */}
        <div className="bg-white rounded-3xl p-12 shadow-lg mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Platform Overview</h2>
          <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed space-y-4">
            <p>
              AI Solutions Hub is an enterprise-grade AI platform designed to transform business operations through intelligent automation. We combine cutting-edge artificial intelligence with robust infrastructure to deliver 8 specialized modules that address critical business needs.
            </p>
            <p>
              Our platform serves as a comprehensive solution for businesses seeking to leverage AI technology without the complexity of managing multiple vendors, APIs, and integration points. From marketing automation to legal guidance, from inventory management to document processing, we provide a unified ecosystem that streamlines operations and drives growth.
            </p>
            <p>
              Built on modern cloud infrastructure and powered by multiple AI engines, AI Solutions Hub delivers reliable, scalable, and secure solutions that adapt to your business requirements. Our commitment to innovation ensures that you always have access to the latest AI capabilities while maintaining enterprise-level security and compliance standards.
            </p>
          </div>
        </div>

        {/* AI Router Technology */}
        <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl p-12 text-white mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Brain className="w-10 h-10" />
            <h2 className="text-3xl font-bold">AI Router Technology</h2>
          </div>
          <div className="space-y-4 text-blue-50 text-lg leading-relaxed">
            <p>
              At the core of our platform lies our proprietary AI Router Technology - an intelligent routing system that automatically selects the optimal AI engine for each task. This multi-engine approach ensures superior performance, cost efficiency, and reliability.
            </p>
            <p>
              Our AI Router intelligently distributes tasks across multiple AI providers including Google Gemini for complex analysis, specialized OCR engines for document processing, sentiment analysis for customer communications, and cost-effective models for routine operations. This dynamic routing happens seamlessly in the background, optimizing for speed, accuracy, and cost.
            </p>
            <p>
              The system includes automatic failover capabilities, ensuring uninterrupted service even if one AI provider experiences issues. Combined with intelligent caching and response optimization, our AI Router delivers enterprise-grade reliability while maintaining optimal performance across all modules.
            </p>
          </div>
        </div>

        {/* Platform Architecture */}
        <div className="bg-white rounded-3xl p-12 shadow-lg mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Platform Architecture</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {technologies.map((tech) => {
              const Icon = tech.icon;
              return (
                <div key={tech.name} className="flex gap-4">
                  <div className="bg-gradient-to-br from-blue-500 to-purple-500 w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{tech.name}</h3>
                    <p className="text-gray-600 leading-relaxed">{tech.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-10 pt-10 border-t border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Technology Stack</h3>
            <p className="text-gray-700 leading-relaxed mb-6">
              Our platform is built on a modern, scalable architecture leveraging Supabase for backend services including PostgreSQL database, real-time subscriptions, authentication, and storage. Edge functions deployed globally ensure low-latency responses regardless of user location. We implement comprehensive security measures including row-level security policies, encrypted data transmission, and role-based access control to protect your sensitive business information.
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <Lock className="w-6 h-6 text-blue-600 mb-2" />
                <div className="font-semibold text-gray-900">Security First</div>
                <div className="text-sm text-gray-600">End-to-end encryption</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <Globe className="w-6 h-6 text-purple-600 mb-2" />
                <div className="font-semibold text-gray-900">Global Scale</div>
                <div className="text-sm text-gray-600">Edge network deployment</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <TrendingUp className="w-6 h-6 text-green-600 mb-2" />
                <div className="font-semibold text-gray-900">High Performance</div>
                <div className="text-sm text-gray-600">Real-time processing</div>
              </div>
            </div>
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-3xl p-10 shadow-lg">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
            <p className="text-gray-700 text-lg leading-relaxed mb-6">
              To empower businesses of all sizes with comprehensive AI automation tools that are powerful, accessible, and cost-effective. We believe that advanced AI capabilities should not be limited to large enterprises with extensive technical resources.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Our mission is to democratize AI technology by providing an all-in-one platform that eliminates complexity while delivering enterprise-grade capabilities. We strive to make AI adoption seamless, enabling businesses to focus on growth rather than infrastructure management.
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl p-10 shadow-lg text-white">
            <h2 className="text-3xl font-bold mb-6">Our Vision</h2>
            <p className="text-blue-50 text-lg leading-relaxed mb-6">
              To become the leading enterprise AI platform that transforms how businesses operate, enabling unprecedented efficiency, innovation, and growth through intelligent automation.
            </p>
            <p className="text-blue-100 leading-relaxed">
              We envision a future where AI seamlessly integrates into every aspect of business operations, where complex tasks are automated intelligently, and where businesses can scale without proportional increases in operational complexity or costs.
            </p>
          </div>
        </div>

        {/* Core Principles */}
        <div className="bg-white rounded-3xl p-12 shadow-lg">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Our Core Principles</h2>
          <div className="space-y-4">
            {principles.map((principle, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                <span className="text-gray-700 text-lg">{principle}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Transform Your Business?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Join hundreds of businesses leveraging AI to drive growth and efficiency
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition shadow-lg"
          >
            Get Started Now
            <ArrowRight className="w-5 h-5" />
          </Link>
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
