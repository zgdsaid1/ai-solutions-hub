import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { AI_TOOLS, UsageStats } from '../types';
import {
  LogOut,
  User,
  CreditCard,
  TrendingUp,
  Scale,
  BarChart3,
  Mail,
  FileText,
  Headphones,
  DollarSign,
  PenTool,
  Activity,
  Zap,
} from 'lucide-react';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [user]);

  const loadStats = async () => {
    if (!user) return;

    try {
      // Get usage stats from sessions tables
      const tables = [
        'marketing_sessions',
        'legal_sessions',
        'data_analysis_sessions',
        'email_assistant_sessions',
        'document_automation_sessions',
        'customer_support_sessions',
        'sales_assistant_sessions',
        'content_creation_sessions',
      ];

      let totalRequests = 0;
      const requestsByTool: Record<string, number> = {};

      for (const table of tables) {
        const { count } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        if (count) {
          totalRequests += count;
          const toolName = table.replace('_sessions', '').replace('_', '-');
          requestsByTool[toolName] = count;
        }
      }

      setStats({
        total_requests: totalRequests,
        successful_requests: totalRequests,
        failed_requests: 0,
        total_tokens_used: 0,
        requests_by_tool: requestsByTool,
        requests_this_month: totalRequests,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg"></div>
              <span className="text-xl font-bold">AI Solutions Hub</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/profile"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <User className="w-5 h-5" />
                <span className="hidden sm:inline">Profile</span>
              </Link>
              <Link
                to="/subscription"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <CreditCard className="w-5 h-5" />
                <span className="hidden sm:inline">Subscription</span>
              </Link>
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.email?.split('@')[0]}
          </h1>
          <p className="text-gray-600">Access your AI-powered business tools</p>
        </div>

        {/* Stats Cards */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Activity className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="text-2xl font-bold text-gray-900">
                    {stats?.total_requests || 0}
                  </span>
                </div>
                <h3 className="text-sm font-medium text-gray-600">Total Requests</h3>
                <p className="text-xs text-gray-500 mt-1">All-time usage</p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Zap className="w-6 h-6 text-green-600" />
                  </div>
                  <span className="text-2xl font-bold text-gray-900">
                    {stats?.requests_this_month || 0}
                  </span>
                </div>
                <h3 className="text-sm font-medium text-gray-600">This Month</h3>
                <p className="text-xs text-gray-500 mt-1">Monthly usage</p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                  <span className="text-2xl font-bold text-gray-900">
                    {Object.keys(stats?.requests_by_tool || {}).length}
                  </span>
                </div>
                <h3 className="text-sm font-medium text-gray-600">Active Tools</h3>
                <p className="text-xs text-gray-500 mt-1">Tools in use</p>
              </div>
            </div>

            {/* AI Tools Grid */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Your AI Tools</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {AI_TOOLS.map((tool) => {
                  const IconComponent = getIcon(tool.icon);
                  const usageCount = stats?.requests_by_tool[tool.id] || 0;

                  return (
                    <Link
                      key={tool.id}
                      to={`/tools/${tool.id}`}
                      className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg hover:border-blue-300 transition-all group"
                    >
                      <div
                        className={`w-12 h-12 rounded-lg bg-gradient-to-br ${tool.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                      >
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{tool.name}</h3>
                      <p className="text-sm text-gray-600 mb-3">{tool.description}</p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">{tool.category}</span>
                        {usageCount > 0 && (
                          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            {usageCount} uses
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </main>
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
    PenTool,
  };
  return icons[iconName] || TrendingUp;
}
