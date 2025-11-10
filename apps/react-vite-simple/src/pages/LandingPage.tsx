import React from 'react';
import { TrendingUp, Zap, Shield, DollarSign, BarChart3, Settings, CheckCircle2 } from 'lucide-react';
import { SUBSCRIPTION_TIERS, BUSINESS_TOOLS } from '../types';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold text-slate-900">AI Solutions Hub</span>
            </div>
            <div className="flex items-center gap-6">
              <a href="#features" className="text-slate-600 hover:text-slate-900">Features</a>
              <a href="#pricing" className="text-slate-600 hover:text-slate-900">Pricing</a>
              <a href="/dashboard" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Get Started
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center">
          <div className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-6">
            AI Routing + Business Automation
          </div>
          <h1 className="text-6xl font-extrabold text-slate-900 mb-6 leading-tight">
            Intelligent AI Platform<br />
            for Modern Business
          </h1>
          <p className="text-xl text-slate-600 mb-10 max-w-3xl mx-auto">
            Hybrid platform combining smart AI routing with 8 specialized business tools.
            Save 60-80% on AI costs while automating your entire business workflow.
          </p>
          <div className="flex gap-4 justify-center">
            <a href="/dashboard" className="px-8 py-4 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:bg-blue-700 shadow-lg">
              Start Free Trial
            </a>
            <a href="#features" className="px-8 py-4 border-2 border-slate-300 text-slate-700 rounded-lg text-lg font-semibold hover:border-slate-400">
              Learn More
            </a>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-16 max-w-4xl mx-auto">
            <div className="p-6 bg-white rounded-xl shadow-md">
              <div className="text-4xl font-bold text-blue-600">60-80%</div>
              <div className="text-slate-600 mt-2">Cost Savings</div>
            </div>
            <div className="p-6 bg-white rounded-xl shadow-md">
              <div className="text-4xl font-bold text-blue-600">40-50%</div>
              <div className="text-slate-600 mt-2">Faster Performance</div>
            </div>
            <div className="p-6 bg-white rounded-xl shadow-md">
              <div className="text-4xl font-bold text-blue-600">8 Tools</div>
              <div className="text-slate-600 mt-2">Business Solutions</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Core Features</h2>
            <p className="text-xl text-slate-600">Enterprise-grade AI infrastructure + Business automation</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 border-2 border-slate-200 rounded-xl hover:border-blue-400 transition-colors">
              <Zap className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">AI Routing Engine</h3>
              <p className="text-slate-600">Intelligent routing between OpenAI, Google AI, and Llama for optimal performance and cost.</p>
            </div>

            <div className="p-6 border-2 border-slate-200 rounded-xl hover:border-blue-400 transition-colors">
              <TrendingUp className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">Cost Optimization</h3>
              <p className="text-slate-600">Save 60-80% on AI costs through intelligent engine selection and caching strategies.</p>
            </div>

            <div className="p-6 border-2 border-slate-200 rounded-xl hover:border-blue-400 transition-colors">
              <Shield className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">Enterprise Security</h3>
              <p className="text-slate-600">Multi-tenant architecture with RLS policies and role-based access control.</p>
            </div>

            <div className="p-6 border-2 border-slate-200 rounded-xl hover:border-blue-400 transition-colors">
              <Settings className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">Business Automation</h3>
              <p className="text-slate-600">8 specialized AI tools covering marketing, legal, operations, and more.</p>
            </div>

            <div className="p-6 border-2 border-slate-200 rounded-xl hover:border-blue-400 transition-colors">
              <BarChart3 className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">Advanced Analytics</h3>
              <p className="text-slate-600">Comprehensive dashboards tracking usage, costs, and performance metrics.</p>
            </div>

            <div className="p-6 border-2 border-slate-200 rounded-xl hover:border-blue-400 transition-colors">
              <DollarSign className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">Flexible Pricing</h3>
              <p className="text-slate-600">4 subscription tiers from $9 to $299, scaling with your business needs.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Business Tools Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">8 Specialized Business Tools</h2>
            <p className="text-xl text-slate-600">AI-powered tools for every aspect of your business</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {BUSINESS_TOOLS.map((tool) => (
              <div key={tool.id} className="p-6 bg-white border border-slate-200 rounded-xl hover:shadow-lg transition-shadow">
                <div className="font-bold text-blue-600 text-sm mb-2">{tool.category}</div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{tool.name}</h3>
                <p className="text-sm text-slate-600">{tool.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-slate-600">Choose the perfect plan for your business</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(SUBSCRIPTION_TIERS).map(([key, tier]) => (
              <div key={key} className={`p-8 border-2 rounded-xl ${key === 'business' ? 'border-blue-500 shadow-xl scale-105' : 'border-slate-200'}`}>
                {key === 'business' && (
                  <div className="inline-block px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full mb-4">
                    RECOMMENDED
                  </div>
                )}
                <h3 className="text-2xl font-bold text-slate-900 mb-2">{tier.name}</h3>
                <div className="mb-6">
                  <span className="text-5xl font-extrabold text-slate-900">${tier.price}</span>
                  <span className="text-slate-600">/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <a href="/dashboard" className={`block w-full py-3 text-center rounded-lg font-semibold ${key === 'business' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'}`}>
                  Get Started
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-blue-800">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Transform Your Business?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Join companies saving 60-80% on AI costs while automating their entire workflow.
          </p>
          <a href="/dashboard" className="inline-block px-10 py-4 bg-white text-blue-600 rounded-lg text-lg font-semibold hover:bg-blue-50 shadow-xl">
            Start Your Free Trial
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-6 h-6 text-blue-500" />
                <span className="text-lg font-bold text-white">AI Solutions Hub</span>
              </div>
              <p className="text-sm">Enterprise AI routing + Business automation platform</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white">Features</a></li>
                <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
                <li><a href="/docs" className="hover:text-white">Documentation</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/about" className="hover:text-white">About</a></li>
                <li><a href="/contact" className="hover:text-white">Contact</a></li>
                <li><a href="/careers" className="hover:text-white">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/privacy" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="/terms" className="hover:text-white">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-12 pt-8 text-center text-sm">
            2025 AI Solutions Hub. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
