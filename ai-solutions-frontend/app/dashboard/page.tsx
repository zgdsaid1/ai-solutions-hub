'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import ProtectedRoute from '@/components/ProtectedRoute';
import { 
  Brain, 
  FileText, 
  Mail, 
  Database, 
  TrendingUp, 
  Truck, 
  Scale, 
  MessageCircle,
  BarChart3,
  Users,
  Settings,
  Search,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  Star,
  Zap,
  Clock,
  DollarSign
} from 'lucide-react';

export default function DashboardPage() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
      router.push('/');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const aiTools = [
    {
      id: 'document-processor',
      name: 'Document Processor',
      icon: FileText,
      description: 'Process and analyze documents with AI',
      color: 'bg-blue-100 text-blue-600',
      status: 'active',
      usageCount: 156
    },
    {
      id: 'email-assistant',
      name: 'Email Assistant', 
      icon: Mail,
      description: 'Smart email composition and management',
      color: 'bg-green-100 text-green-600',
      status: 'active',
      usageCount: 89
    },
    {
      id: 'data-analyzer',
      name: 'Data Analyzer',
      icon: Database,
      description: 'Analyze and visualize your data',
      color: 'bg-purple-100 text-purple-600',
      status: 'active',
      usageCount: 234
    },
    {
      id: 'marketing-optimizer',
      name: 'Marketing Optimizer',
      icon: TrendingUp,
      description: 'Optimize marketing campaigns',
      color: 'bg-orange-100 text-orange-600',
      status: 'active',
      usageCount: 67
    },
    {
      id: 'logistics-manager',
      name: 'Logistics Manager',
      icon: Truck,
      description: 'Manage supply chain and logistics',
      color: 'bg-yellow-100 text-yellow-600',
      status: 'active',
      usageCount: 45
    },
    {
      id: 'legal-advisor',
      name: 'Legal Advisor',
      icon: Scale,
      description: 'Legal document analysis and advice',
      color: 'bg-red-100 text-red-600',
      status: 'active',
      usageCount: 23
    },
    {
      id: 'voice-sms',
      name: 'Voice & SMS',
      icon: MessageCircle,
      description: 'Voice and SMS communication tools',
      color: 'bg-indigo-100 text-indigo-600',
      status: 'active',
      usageCount: 78
    },
    {
      id: 'inventory-tracker',
      name: 'Inventory Tracker',
      icon: BarChart3,
      description: 'Track and manage inventory',
      color: 'bg-teal-100 text-teal-600',
      status: 'active',
      usageCount: 112
    }
  ];

  const stats = [
    { name: 'Total Tools Used', value: '804', icon: Zap, change: '+12%' },
    { name: 'Active Projects', value: '24', icon: Users, change: '+3%' },
    { name: 'Hours Saved', value: '156', icon: Clock, change: '+18%' },
    { name: 'Cost Savings', value: '$2,340', icon: DollarSign, change: '+25%' }
  ];

  const recentActivity = [
    { action: 'Document processed', tool: 'Document Processor', time: '2 min ago' },
    { action: 'Email campaign analyzed', tool: 'Marketing Optimizer', time: '15 min ago' },
    { action: 'Inventory updated', tool: 'Inventory Tracker', time: '1 hour ago' },
    { action: 'Legal document reviewed', tool: 'Legal Advisor', time: '2 hours ago' },
    { action: 'Data analysis completed', tool: 'Data Analyzer', time: '3 hours ago' }
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleToolClick = (toolId: string) => {
    setSelectedTool(toolId);
    // Here you would navigate to the specific tool interface
    console.log(`Opening tool: ${toolId}`);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Navigation */}
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 lg:hidden"
              >
                {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
              <div className="flex items-center ml-4 lg:ml-0">
                <Brain className="h-8 w-8 text-blue-600" />
                <h1 className="ml-3 text-xl font-bold text-gray-900">AI Solutions Hub</h1>
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-lg mx-8 hidden sm:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search tools, projects, or documents..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-full">
                <Bell className="h-6 w-6" />
              </button>
              <div className="relative">
                <button className="flex items-center space-x-3 p-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
                  <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <span className="hidden md:block">{user?.user_metadata?.full_name || user?.email || 'User'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out`}>
          <div className="flex flex-col h-full pt-16 lg:pt-0">
            <div className="px-6 py-6 border-b border-gray-200">
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg ${
                    activeTab === 'overview' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <BarChart3 className="h-5 w-5 mr-3" />
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('tools')}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg ${
                    activeTab === 'tools' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Zap className="h-5 w-5 mr-3" />
                  AI Tools
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg ${
                    activeTab === 'settings' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Settings className="h-5 w-5 mr-3" />
                  Settings
                </button>
              </nav>
            </div>

            <div className="flex-1 px-6 py-6 overflow-y-auto">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Quick Access
              </h3>
              <div className="space-y-2">
                {aiTools.slice(0, 5).map((tool) => {
                  const IconComponent = tool.icon;
                  return (
                    <button
                      key={tool.id}
                      onClick={() => handleToolClick(tool.id)}
                      className="w-full flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                      <div className={`p-1.5 rounded ${tool.color} mr-3`}>
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <span className="truncate">{tool.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200">
              <button 
                onClick={handleSignOut}
                className="w-full flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <LogOut className="h-5 w-5 mr-3" />
                Sign Out
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:ml-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome back!</h2>
                  <p className="text-gray-600">Here's what's happening with your AI tools today.</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {stats.map((stat) => {
                    const IconComponent = stat.icon;
                    return (
                      <div key={stat.name} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <IconComponent className="h-8 w-8 text-blue-600" />
                          </div>
                          <div className="ml-5 w-0 flex-1">
                            <dl>
                              <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                              <dd className="flex items-baseline">
                                <div className="text-2xl font-semibold text-gray-900">{stat.value}</div>
                                <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                                  {stat.change}
                                </div>
                              </dd>
                            </dl>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="px-6 py-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-900">{activity.action}</p>
                            <p className="text-sm text-gray-500">{activity.tool}</p>
                          </div>
                          <span className="text-sm text-gray-400">{activity.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* AI Tools Tab */}
            {activeTab === 'tools' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Tools</h2>
                  <p className="text-gray-600">Choose from our collection of AI-powered business tools.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {aiTools.map((tool) => {
                    const IconComponent = tool.icon;
                    return (
                      <div
                        key={tool.id}
                        className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => handleToolClick(tool.id)}
                      >
                        <div className={`inline-flex p-3 rounded-lg ${tool.color} mb-4`}>
                          <IconComponent className="h-6 w-6" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{tool.name}</h3>
                        <p className="text-gray-600 text-sm mb-4">{tool.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {tool.status}
                          </span>
                          <span className="text-sm text-gray-500">{tool.usageCount} uses</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Settings</h2>
                  <p className="text-gray-600">Manage your account and preferences.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Settings</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                        <input type="text" defaultValue="John Doe" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input type="email" defaultValue="john@example.com" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent" />
                      </div>
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        Save Changes
                      </button>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Preferences</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Email Notifications</span>
                        <button className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-blue-600 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2">
                          <span className="translate-x-5 inline-block h-5 w-5 transform rounded-full bg-white transition duration-200 ease-in-out"></span>
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Dark Mode</span>
                        <button className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2">
                          <span className="translate-x-0 inline-block h-5 w-5 transform rounded-full bg-white transition duration-200 ease-in-out"></span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}