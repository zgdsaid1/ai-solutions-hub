import { Link } from 'react-router-dom';
import { TrendingUp, Scale, BarChart3, Mail, FileText, Headphones, DollarSign, PenTool, ArrowRight, Check } from 'lucide-react';
import { AI_TOOLS, SUBSCRIPTION_PLANS } from '../types';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg"></div>
            <span className="text-xl font-bold">AI Solutions Hub</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/login" className="text-gray-600 hover:text-gray-900">
              Login
            </Link>
            <Link
              to="/signup"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            8 AI-Powered Tools
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              One Powerful Platform
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Transform your business with AI-driven solutions for marketing, legal analysis, data insights, content creation, and more. All integrated in one seamless platform.
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              to="/signup"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <span>Start Free Trial</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="#pricing"
              className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:border-gray-400 transition-colors"
            >
              View Pricing
            </a>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            No credit card required • 7-day free trial • Cancel anytime
          </p>
        </div>
      </section>

      {/* AI Tools Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Comprehensive AI Toolkit
          </h2>
          <p className="text-lg text-gray-600">
            Access powerful AI tools designed for every aspect of your business
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {AI_TOOLS.map((tool) => {
            const IconComponent = getIcon(tool.icon);
            return (
              <div
                key={tool.id}
                className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${tool.color} flex items-center justify-center mb-4`}>
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{tool.name}</h3>
                <p className="text-sm text-gray-600">{tool.description}</p>
                <div className="mt-3 text-xs text-gray-500">{tool.category}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Boost Productivity</h3>
              <p className="text-gray-600">Automate repetitive tasks and focus on what matters most</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Data-Driven Insights</h3>
              <p className="text-gray-600">Make informed decisions with AI-powered analytics</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Scale className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Enterprise Ready</h3>
              <p className="text-gray-600">Secure, scalable, and compliant with industry standards</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-gray-600">
            Choose the plan that fits your needs
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {SUBSCRIPTION_PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white rounded-xl border-2 ${
                plan.id === 'professional' ? 'border-blue-600 shadow-xl scale-105' : 'border-gray-200'
              } p-8`}
            >
              {plan.id === 'professional' && (
                <div className="bg-blue-600 text-white text-sm font-semibold px-3 py-1 rounded-full inline-block mb-4">
                  MOST POPULAR
                </div>
              )}
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                <span className="text-gray-600">/{plan.interval}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/signup"
                className={`block w-full py-3 rounded-lg text-center font-semibold transition-colors ${
                  plan.id === 'professional'
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                Get Started
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-blue-600 to-cyan-600 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of businesses already using AI Solutions Hub
          </p>
          <Link
            to="/signup"
            className="bg-white text-blue-600 px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors inline-flex items-center space-x-2 font-semibold"
          >
            <span>Start Your Free Trial</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2025 AI Solutions Hub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function getIcon(iconName: string) {
  const icons: Record<string, any> = {
    TrendingUp,
    Scale,
    BarChart3,
    Mail,
    FileText,
    Headphones,
    DollarSign,
    'PenTool': PenTool,
  };
  return icons[iconName] || TrendingUp;
}
