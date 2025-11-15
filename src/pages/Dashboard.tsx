import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
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
  LogOut,
  User,
  Crown,
  CreditCard
} from 'lucide-react';

const modules = [
  {
    id: 'marketing',
    name: 'AI Marketing & Business Growth',
    description: 'Strategic marketing campaigns and business growth strategies powered by AI',
    icon: TrendingUp,
    color: 'from-blue-500 to-cyan-500',
    comingSoon: false
  },
  {
    id: 'legal',
    name: 'AI Legal Advisor',
    description: 'Business and finance legal guidance with AI-powered document analysis',
    icon: Scale,
    color: 'from-purple-500 to-pink-500',
    comingSoon: false
  },
  {
    id: 'inventory',
    name: 'AI Smart Inventory Tracker',
    description: 'Intelligent inventory management with demand forecasting',
    icon: Package,
    color: 'from-green-500 to-emerald-500',
    comingSoon: false
  },
  {
    id: 'voice_sms',
    name: 'AI Voice & SMS Support',
    description: 'Automated customer support through voice and SMS channels',
    icon: Phone,
    color: 'from-orange-500 to-red-500',
    comingSoon: false
  },
  {
    id: 'email',
    name: 'AI Email Assistant',
    description: 'Smart email campaign management with SendGrid integration',
    icon: Mail,
    color: 'from-indigo-500 to-blue-500',
    comingSoon: false
  },
  {
    id: 'data_analyzer',
    name: 'AI Data Analyzer & Insights',
    description: 'Advanced data analysis with predictive insights and visualizations',
    icon: BarChart3,
    color: 'from-teal-500 to-green-500',
    comingSoon: false
  },
  {
    id: 'logistics',
    name: 'AI Logistics & Route Optimizer',
    description: 'Optimize delivery routes and logistics operations with AI',
    icon: Truck,
    color: 'from-yellow-500 to-orange-500',
    comingSoon: false
  },
  {
    id: 'document_automation',
    name: 'AI Document Automation & e-Sign',
    description: 'Automated document generation and electronic signature workflows',
    icon: FileText,
    color: 'from-red-500 to-pink-500',
    comingSoon: false
  },
  {
    id: 'subscription',
    name: 'Subscription & Billing',
    description: 'Manage your subscription, billing, and usage tracking',
    icon: CreditCard,
    color: 'from-emerald-500 to-teal-500',
    comingSoon: false
  }
];

export default function Dashboard() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleModuleClick = (moduleId: string) => {
    if (moduleId === 'marketing') {
      navigate('/marketing');
    } else if (moduleId === 'legal') {
      navigate('/legal');
    } else if (moduleId === 'data_analyzer') {
      navigate('/data-analyzer');
    } else if (moduleId === 'inventory') {
      navigate('/inventory');
    } else if (moduleId === 'email') {
      navigate('/email-assistant');
    } else if (moduleId === 'logistics') {
      navigate('/logistics');
    } else if (moduleId === 'voice_sms') {
      navigate('/voice-sms');
    } else if (moduleId === 'document_automation') {
      navigate('/document-automation');
    } else if (moduleId === 'subscription') {
      navigate('/subscription');
    } else {
      alert(`Module "${moduleId}" will be available in Phase 2`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-2 rounded-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">AI Solutions Hub</h1>
                <p className="text-sm text-gray-500">Enterprise AI Platform</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-amber-100 to-yellow-100 rounded-full">
                <Crown className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-semibold text-amber-700 capitalize">
                  {profile?.subscription_tier || 'Free'}
                </span>
              </div>

              <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg">
                <User className="w-5 h-5 text-gray-600" />
                <div className="text-sm">
                  <p className="font-semibold text-gray-900">{profile?.full_name || 'User'}</p>
                  <p className="text-gray-500">{user?.email}</p>
                </div>
              </div>

              <button
                onClick={async () => {
                  console.log('Logout button clicked');
                  try {
                    await signOut();
                    console.log('Logout successful');
                  } catch (error) {
                    console.error('Logout failed:', error);
                    alert('Logout failed: ' + (error as Error).message);
                  }
                }}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                title="Sign out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {profile?.full_name?.split(' ')[0] || 'User'}
          </h2>
          <p className="text-gray-600">
            Choose an AI module below to get started with your enterprise solutions
          </p>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <button
                key={module.id}
                onClick={() => handleModuleClick(module.id)}
                className="group relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-transparent text-left"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${module.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity`}></div>
                
                <div className="relative">
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${module.color} mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 transition">
                    {module.name}
                  </h3>
                  
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {module.description}
                  </p>

                  {module.comingSoon && (
                    <span className="inline-block mt-3 px-2 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">
                      Coming Soon
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Stats Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-gray-600 font-medium">API Requests</h4>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">0</p>
            <p className="text-sm text-gray-500 mt-1">This month</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-gray-600 font-medium">Active Modules</h4>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">8</p>
            <p className="text-sm text-gray-500 mt-1">Available</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-gray-600 font-medium">AI Engines</h4>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">4</p>
            <p className="text-sm text-gray-500 mt-1">Gemini, Llama, OCR, Sentiment</p>
          </div>
        </div>
      </main>
    </div>
  );
}
