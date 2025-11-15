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
  CheckCircle,
  Zap
} from 'lucide-react';

export default function Landing() {
  const features = [
    { icon: TrendingUp, name: 'Marketing & Growth', description: 'AI-powered marketing strategies' },
    { icon: Scale, name: 'Legal Advisor', description: 'Business & finance legal guidance' },
    { icon: Package, name: 'Smart Inventory', description: 'Intelligent inventory management' },
    { icon: Phone, name: 'Voice & SMS Support', description: 'Automated customer support' },
    { icon: Mail, name: 'Email Assistant', description: 'Smart email campaigns' },
    { icon: BarChart3, name: 'Data Analyzer', description: 'Advanced analytics & insights' },
    { icon: Truck, name: 'Logistics Optimizer', description: 'Route and delivery optimization' },
    { icon: FileText, name: 'Document Automation', description: 'e-Signatures & automation' }
  ];

  const benefits = [
    'Multi-engine AI routing (Gemini, Llama, specialized engines)',
    'Enterprise-grade security with role-based access',
    'Scalable infrastructure on Supabase + Railway',
    'Real-time analytics and usage tracking',
    'Comprehensive data storage and management',
    'Flexible subscription tiers'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-2 rounded-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">AI Solutions Hub</span>
            </div>

            <div className="flex items-center gap-6">
              <Link to="/about" className="text-gray-700 hover:text-gray-900 font-medium">
                About
              </Link>
              <Link to="/features" className="text-gray-700 hover:text-gray-900 font-medium">
                Features
              </Link>
              <Link
                to="/login"
                className="text-gray-700 hover:text-gray-900 font-medium"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-semibold mb-4">
            <Zap className="w-4 h-4" />
            <span>Transform Your Business with AI - 8 Powerful Modules</span>
          </div>

          <div className="mb-6">
            <a 
              href="mailto:support@aisolutionshub.co" 
              className="text-gray-600 hover:text-blue-600 transition inline-flex items-center gap-2"
            >
              <Mail className="w-4 h-4" />
              <span>support@aisolutionshub.co</span>
            </a>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI-Powered Enterprise Solutions
            </span>
            <br />
            <span className="text-gray-900">All in One Platform</span>
          </h1>

          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Transform your business with 8 specialized AI modules. Intelligent routing between 
            multiple AI engines ensures optimal performance for every task.
          </p>

          <div className="flex items-center justify-center gap-4">
            <Link
              to="/signup"
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition flex items-center gap-2 shadow-lg"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/login"
              className="bg-white text-gray-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 transition border border-gray-200"
            >
              View Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-white/50 rounded-3xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">8 Powerful AI Modules</h2>
          <p className="text-xl text-gray-600">
            Everything you need to supercharge your business operations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.name}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition border border-gray-200"
              >
                <div className="bg-gradient-to-br from-blue-500 to-purple-500 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.name}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl p-12 text-white">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">
                Enterprise-Grade Infrastructure
              </h2>
              <p className="text-blue-100 text-lg mb-8">
                Built on a robust, scalable architecture designed for mission-critical applications.
              </p>
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
              >
                Get Started Now
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-300 flex-shrink-0 mt-0.5" />
                  <span className="text-white/90">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
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
